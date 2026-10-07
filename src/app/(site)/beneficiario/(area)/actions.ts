"use server";

import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { and, eq, max } from "drizzle-orm";
import { db, schema } from "@/db";
import { done, fail } from "@/lib/admin";
import { DOC_TYPES, logBenef, REQUEST_TYPES, requireBeneficiary } from "@/lib/beneficiary";
import { passwordProblem } from "@/lib/password";
import { savePrivate } from "@/lib/private-storage";
import { UploadError } from "@/lib/storage";
import { decryptSecret, encryptSecret, generateSecret, verifyCode } from "@/lib/totp";

const str = (fd: FormData, k: string, max = 200) => String(fd.get(k) ?? "").trim().slice(0, max);
const files = (fd: FormData, k: string) => fd.getAll(k).filter((f): f is File => f instanceof File && f.size > 0);

type Beneficiary = typeof schema.beneficiaries.$inferSelect;

/** Grava um documento do beneficiário (nova versão se já existir do mesmo tipo) */
async function storeDocument(b: Beneficiary, file: File, docType: string, requestId: number | null = null) {
  const saved = await savePrivate(file, `beneficiario-${b.id}`);
  const [{ v }] = await db
    .select({ v: max(schema.beneficiaryDocuments.version) })
    .from(schema.beneficiaryDocuments)
    .where(and(eq(schema.beneficiaryDocuments.beneficiaryId, b.id), eq(schema.beneficiaryDocuments.docType, docType)));
  await db.insert(schema.beneficiaryDocuments).values({
    beneficiaryId: b.id,
    requestId,
    docType,
    version: (v ?? 0) + 1,
    fileName: file.name.slice(0, 120),
    filePath: saved.path,
    mimeType: saved.mime,
    fileSize: saved.size,
  });
  return (v ?? 0) + 1;
}

// ---------- Meus dados: contato (a própria pessoa atualiza, com validação) ----------
export async function updateContact(fd: FormData) {
  const b = await requireBeneficiary();
  const back = "/beneficiario/dados";
  const email = str(fd, "email").toLowerCase();
  const phone = str(fd, "phone", 30);
  const address = str(fd, "address", 300);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fail(back, "E-mail inválido.");
  const digits = phone.replace(/\D/g, "");
  if (phone && (digits.length < 10 || digits.length > 11)) fail(back, "Telefone inválido: informe DDD + número.");
  if (!email && !phone) fail(back, "Mantenha ao menos um e-mail ou telefone para contato.");
  const changed = [
    email !== b.email && "e-mail",
    phone !== b.phone && "telefone",
    address !== b.address && "endereço",
  ].filter(Boolean);
  if (!changed.length) done(back, "Nenhuma alteração.");
  await db.update(schema.beneficiaries).set({ email, phone, address, updatedAt: new Date() }).where(eq(schema.beneficiaries.id, b.id));
  await logBenef(b.id, `Atualizou dados de contato (${changed.join(", ")})`);
  done(back, "Dados de contato atualizados.");
}

// ---------- Solicitações (requerimentos) ----------
export async function createRequest(fd: FormData) {
  const b = await requireBeneficiary();
  const back = "/beneficiario/solicitacoes/nova";
  const category = str(fd, "category");
  const body = str(fd, "body", 5000);
  if (!REQUEST_TYPES.includes(category)) fail(back, "Escolha o assunto.");
  if (body.length < 10) fail(back, "Descreva o pedido com um pouco mais de detalhe.");
  const attachments = files(fd, "attachments");
  if (attachments.length > 5) fail(back, "Envie no máximo 5 arquivos por solicitação.");

  const [row] = await db
    .insert(schema.messages)
    .values({
      kind: "requerimento",
      category,
      name: b.name,
      document: b.registration,
      email: b.email,
      phone: b.phone,
      body,
      beneficiaryId: b.id,
      accessCode: crypto.randomBytes(4).toString("hex").toUpperCase().slice(0, 6),
    })
    .returning({ id: schema.messages.id });
  const protocol = `${new Date().getFullYear()}-${String(row.id).padStart(6, "0")}`;
  await db.update(schema.messages).set({ protocol }).where(eq(schema.messages.id, row.id));

  try {
    for (const f of attachments) await storeDocument(b, f, `Anexo do protocolo ${protocol}`, row.id);
  } catch (e) {
    if (e instanceof UploadError) {
      await logBenef(b.id, `Abriu a solicitação ${protocol} (anexo recusado: ${e.message})`);
      done(`/beneficiario/solicitacoes/${row.id}`, `Solicitação ${protocol} registrada, mas um anexo foi recusado: ${e.message} Envie-o em Documentos.`);
    }
    throw e;
  }
  await logBenef(b.id, `Abriu a solicitação ${protocol} (${category})`);
  done(`/beneficiario/solicitacoes/${row.id}`, `Solicitação registrada com o protocolo ${protocol}.`);
}

// ---------- Documentos ----------
export async function uploadDocument(fd: FormData) {
  const b = await requireBeneficiary();
  const back = "/beneficiario/documentos";
  const docType = str(fd, "docType");
  if (!DOC_TYPES.includes(docType)) fail(back, "Escolha o tipo de documento.");
  const [file] = files(fd, "file");
  if (!file) fail(back, "Escolha o arquivo.");
  let version = 1;
  try {
    version = await storeDocument(b, file, docType);
  } catch (e) {
    if (e instanceof UploadError) fail(back, e.message);
    throw e;
  }
  await logBenef(b.id, `Enviou documento: ${docType}${version > 1 ? ` (versão ${version})` : ""}`);
  done(back, version > 1 ? `Nova versão (${version}) de "${docType}" enviada para análise.` : `"${docType}" enviado para análise.`);
}

// ---------- Segurança ----------
export async function changePassword(fd: FormData) {
  const b = await requireBeneficiary();
  const back = "/beneficiario/seguranca";
  if (!(await bcrypt.compare(String(fd.get("current") ?? ""), b.passwordHash))) fail(back, "Senha atual incorreta.");
  const next = String(fd.get("next") ?? "");
  if (next !== String(fd.get("confirm") ?? "")) fail(back, "A confirmação não é igual à nova senha.");
  const problem = passwordProblem(next, b.email);
  if (problem) fail(back, problem);
  await db
    .update(schema.beneficiaries)
    .set({ passwordHash: await bcrypt.hash(next, 12), passwordChangedAt: new Date() })
    .where(eq(schema.beneficiaries.id, b.id));
  await logBenef(b.id, "Trocou a senha");
  done("/beneficiario/entrar", "Senha alterada. Entre novamente com a nova senha.");
}

export async function startTwoFactor() {
  const b = await requireBeneficiary();
  if (b.totpEnabled) fail("/beneficiario/seguranca", "A verificação em duas etapas já está ativa.");
  await db.update(schema.beneficiaries).set({ totpSecret: encryptSecret(generateSecret()) }).where(eq(schema.beneficiaries.id, b.id));
  done("/beneficiario/seguranca?configurar=1", "Leia o QR Code com o aplicativo e digite o código para confirmar.");
}

export async function confirmTwoFactor(fd: FormData) {
  const b = await requireBeneficiary();
  const secret = decryptSecret(b.totpSecret);
  if (!secret) fail("/beneficiario/seguranca", "Configuração expirada. Clique em ativar novamente.");
  if (!verifyCode(secret, str(fd, "code", 10))) fail("/beneficiario/seguranca?configurar=1", "Código incorreto. Confira o aplicativo.");
  await db.update(schema.beneficiaries).set({ totpEnabled: true }).where(eq(schema.beneficiaries.id, b.id));
  await logBenef(b.id, "Ativou a verificação em duas etapas");
  done("/beneficiario/seguranca", "Verificação em duas etapas ativada.");
}

export async function disableTwoFactor(fd: FormData) {
  const b = await requireBeneficiary();
  if (!verifyCode(decryptSecret(b.totpSecret), str(fd, "code", 10))) fail("/beneficiario/seguranca", "Código incorreto.");
  await db.update(schema.beneficiaries).set({ totpEnabled: false, totpSecret: "" }).where(eq(schema.beneficiaries.id, b.id));
  await logBenef(b.id, "Desativou a verificação em duas etapas");
  done("/beneficiario/seguranca", "Verificação em duas etapas desativada.");
}

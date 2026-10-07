"use server";

import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { requireModule } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { done, fail, int, str } from "@/lib/admin";
import { BENEF_KIND, logBenef } from "@/lib/beneficiary";
import { importBeneficiaries } from "@/lib/beneficiary-import";
import { isValidCpf, normalizeDate, onlyDigits } from "@/lib/cpf";
import { cpfHash, encryptText } from "@/lib/data-crypto";

const BACK = "/admin/beneficiarios";

async function load(id: number) {
  const [b] = await db.select().from(schema.beneficiaries).where(eq(schema.beneficiaries.id, id));
  if (!b) fail(BACK, "Beneficiário não encontrado.");
  return b;
}

export async function importCsv(fd: FormData) {
  const me = await requireModule("beneficiarios");
  const file = fd.get("file");
  if (!(file instanceof File) || file.size === 0) fail(BACK, "Escolha o arquivo CSV.");
  if (!/\.(csv|txt)$/i.test(file.name)) fail(BACK, "Envie a planilha salva como CSV (no Excel: Salvar como → CSV).");
  if (file.size > 20 * 1024 * 1024) fail(BACK, "Arquivo maior que 20 MB.");
  const r = await importBeneficiaries(Buffer.from(await file.arrayBuffer()));
  await audit(me, "Importou planilha de beneficiários", `${file.name}: ${r.created} novos, ${r.updated} atualizados, ${r.errors.length} com erro`);
  const msg = `Importação: ${r.created} novos, ${r.updated} atualizados${r.errors.length ? `, ${r.errors.length} linha(s) com erro: ${r.errors.slice(0, 8).join(" ")}${r.errors.length > 8 ? " …" : ""}` : "."}`;
  if (!r.created && !r.updated && r.errors.length) fail(BACK, msg);
  done(BACK, msg);
}

/** Cadastro manual pela equipe */
export async function createBeneficiary(fd: FormData) {
  const me = await requireModule("beneficiarios");
  const cpf = onlyDigits(str(fd, "cpf"));
  const name = str(fd, "name");
  const birthDate = normalizeDate(str(fd, "birthDate"));
  const registration = onlyDigits(str(fd, "registration"));
  if (!isValidCpf(cpf) || !name || !birthDate || !registration) fail(BACK, "Preencha CPF válido, nome, nascimento e matrícula.");
  const hash = cpfHash(cpf);
  const [exists] = await db.select({ id: schema.beneficiaries.id }).from(schema.beneficiaries).where(eq(schema.beneficiaries.cpfHash, hash));
  if (exists) fail(`${BACK}/${exists.id}`, "Este CPF já está cadastrado.");
  const [b] = await db
    .insert(schema.beneficiaries)
    .values({
      cpfHash: hash,
      cpfEnc: encryptText(cpf),
      name,
      birthDate,
      registration,
      kind: str(fd, "kind") in BENEF_KIND ? str(fd, "kind") : "",
      origin: "painel",
    })
    .returning({ id: schema.beneficiaries.id });
  await logBenef(b.id, "Cadastro criado pela equipe", me.name);
  await audit(me, "Cadastrou beneficiário", name);
  done(`${BACK}/${b.id}`, "Beneficiário cadastrado. Ele já pode fazer o primeiro acesso.");
}

/** Corrige dados do cadastro (ex.: atendendo a um requerimento de atualização) */
export async function updateBeneficiary(fd: FormData) {
  const me = await requireModule("beneficiarios");
  const b = await load(int(fd, "id"));
  const back = `${BACK}/${b.id}`;
  const name = str(fd, "name");
  const birthDate = normalizeDate(str(fd, "birthDate"));
  const registration = onlyDigits(str(fd, "registration"));
  if (!name || !birthDate || !registration) fail(back, "Nome, nascimento e matrícula são obrigatórios.");
  const values = {
    name,
    birthDate,
    registration,
    kind: str(fd, "kind") in BENEF_KIND ? str(fd, "kind") : "",
    benefit: str(fd, "benefit"),
    benefitStart: normalizeDate(str(fd, "benefitStart")),
    updatedAt: new Date(),
  };
  const labels: Record<string, string> = { name: "nome", birthDate: "nascimento", registration: "matrícula", kind: "vínculo", benefit: "benefício", benefitStart: "início do benefício" };
  const changed = Object.keys(labels).filter((k) => String(values[k as keyof typeof values]) !== String(b[k as keyof typeof b]));
  if (!changed.length) done(back, "Nenhuma alteração.");
  await db.update(schema.beneficiaries).set(values).where(eq(schema.beneficiaries.id, b.id));
  await logBenef(b.id, `Cadastro atualizado (${changed.map((k) => labels[k]).join(", ")})`, me.name);
  await audit(me, "Alterou cadastro de beneficiário", `${b.name}: ${changed.map((k) => labels[k]).join(", ")}`);
  done(back, "Cadastro atualizado.");
}

/** Aprovar pedido de cadastro, bloquear ou reativar */
export async function setStatus(fd: FormData) {
  const me = await requireModule("beneficiarios");
  const b = await load(int(fd, "id"));
  const status = str(fd, "status");
  if (!["ativo", "bloqueado"].includes(status)) fail(`${BACK}/${b.id}`, "Situação inválida.");
  const action = b.status === "pendente" ? (status === "ativo" ? "Aprovou pedido de cadastro" : "Recusou pedido de cadastro") : status === "ativo" ? "Reativou acesso" : "Bloqueou acesso";
  await db.update(schema.beneficiaries).set({ status, updatedAt: new Date() }).where(eq(schema.beneficiaries.id, b.id));
  await logBenef(b.id, action, me.name);
  await audit(me, `${action} (Área do Beneficiário)`, b.name);
  done(`${BACK}/${b.id}`, `${action}.`);
}

/** Apaga a senha: a pessoa refaz o "primeiro acesso" (CPF + nascimento + matrícula) */
export async function resetAccess(fd: FormData) {
  const me = await requireModule("beneficiarios");
  const b = await load(int(fd, "id"));
  await db
    .update(schema.beneficiaries)
    .set({ passwordHash: "", totpEnabled: false, totpSecret: "", passwordChangedAt: new Date() })
    .where(eq(schema.beneficiaries.id, b.id));
  await logBenef(b.id, "Acesso redefinido pela equipe (senha e verificação em duas etapas apagadas)", me.name);
  await audit(me, "Redefiniu acesso de beneficiário", b.name);
  done(`${BACK}/${b.id}`, "Acesso redefinido. A pessoa deve fazer o \"Primeiro acesso\" de novo.");
}

/** Análise de documento enviado */
export async function reviewDocument(fd: FormData) {
  const me = await requireModule("beneficiarios");
  const id = int(fd, "docId");
  const status = str(fd, "status");
  const [d] = await db.select().from(schema.beneficiaryDocuments).where(eq(schema.beneficiaryDocuments.id, id));
  if (!d) fail(BACK, "Documento não encontrado.");
  const back = `${BACK}/${d.beneficiaryId}`;
  if (!["aceito", "recusado", "enviado"].includes(status)) fail(back, "Situação inválida.");
  const note = str(fd, "note").slice(0, 500);
  if (status === "recusado" && !note) fail(back, "Ao recusar, explique o motivo (aparece para o beneficiário).");
  await db
    .update(schema.beneficiaryDocuments)
    .set({ status, reviewNote: note, reviewedBy: me.name })
    .where(eq(schema.beneficiaryDocuments.id, d.id));
  const label = { aceito: "aceito", recusado: "recusado", enviado: "voltou para análise" }[status];
  await logBenef(d.beneficiaryId, `Documento ${label}: ${d.docType} (versão ${d.version})`, me.name);
  await audit(me, `Documento de beneficiário ${label}`, `${d.docType} v${d.version}`);
  done(back, `Documento ${label}.`);
}

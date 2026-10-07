"use server";

import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db, schema } from "@/db";
import { clearFailures, isLocked, registerFailure } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { clientIp, findByCpf, logBenef } from "@/lib/beneficiary";
import { isValidCpf, normalizeDate, onlyDigits } from "@/lib/cpf";
import { cpfHash, encryptText } from "@/lib/data-crypto";
import { passwordProblem } from "@/lib/password";
import { savePrivate } from "@/lib/private-storage";
import { UploadError } from "@/lib/storage";
import { decryptSecret, verifyCode } from "@/lib/totp";
import {
  BENEF_COOKIE,
  BENEF_MAX_AGE,
  BENEF_PENDING_COOKIE,
  PENDING_MAX_AGE,
  signBenef,
  signBenefPending,
  verifyBenefPending,
} from "@/lib/session";

const DUMMY_HASH = bcrypt.hashSync("itaprev-dummy-password", 12);
const str = (fd: FormData, k: string, max = 200) => String(fd.get(k) ?? "").trim().slice(0, max);
const cookieOptions = (maxAge: number) => ({
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production" && process.env.INSECURE_COOKIE !== "1",
  path: "/",
  maxAge,
});

type Beneficiary = typeof schema.beneficiaries.$inferSelect;

async function startSession(b: Beneficiary, how: string) {
  (await cookies()).set(BENEF_COOKIE, await signBenef({ bid: b.id, name: b.name }), cookieOptions(BENEF_MAX_AGE));
  await db.update(schema.beneficiaries).set({ lastLoginAt: new Date() }).where(eq(schema.beneficiaries.id, b.id));
  await logBenef(b.id, how);
}

// ---------- Entrar: CPF + senha (+ código, se tiver 2FA) ----------
export async function benefLogin(fd: FormData) {
  const cpf = onlyDigits(str(fd, "cpf", 20));
  const password = String(fd.get("password") ?? "");
  const lockKey = `benef:${cpf}`;
  const ipKey = `benef-ip:${await clientIp()}`;
  if (isLocked(lockKey) || isLocked(ipKey)) redirect("/beneficiario/entrar?erro=bloqueado");

  const b = cpf.length === 11 ? await findByCpf(cpf) : null;
  const ok = await bcrypt.compare(password, b?.passwordHash || DUMMY_HASH);
  if (!b || !ok || !b.passwordHash || b.status !== "ativo") {
    registerFailure(lockKey);
    registerFailure(ipKey);
    if (b) await logBenef(b.id, "Tentativa de acesso com senha incorreta");
    redirect(`/beneficiario/entrar?erro=${b && !b.passwordHash ? "primeiro" : "credenciais"}`);
  }
  clearFailures(lockKey);

  if (b.totpEnabled) {
    (await cookies()).set(BENEF_PENDING_COOKIE, await signBenefPending({ bid: b.id }), cookieOptions(PENDING_MAX_AGE));
    redirect("/beneficiario/entrar/codigo");
  }
  await startSession(b, "Entrou na Área do Beneficiário");
  redirect("/beneficiario");
}

export async function benefVerifyCode(fd: FormData) {
  const pending = await verifyBenefPending((await cookies()).get(BENEF_PENDING_COOKIE)?.value);
  if (!pending) redirect("/beneficiario/entrar?erro=expirou");
  const key = `benef-2fa:${pending.bid}`;
  if (isLocked(key)) redirect("/beneficiario/entrar?erro=bloqueado");

  const [b] = await db.select().from(schema.beneficiaries).where(eq(schema.beneficiaries.id, pending.bid));
  if (!b || b.status !== "ativo" || !b.totpEnabled) redirect("/beneficiario/entrar?erro=credenciais");
  if (!verifyCode(decryptSecret(b.totpSecret), str(fd, "code", 10))) {
    registerFailure(key);
    await logBenef(b.id, "Código de verificação (2FA) incorreto");
    redirect("/beneficiario/entrar/codigo?erro=codigo");
  }
  clearFailures(key);
  (await cookies()).delete(BENEF_PENDING_COOKIE);
  await startSession(b, "Entrou na Área do Beneficiário (com verificação em duas etapas)");
  redirect("/beneficiario");
}

export async function benefLogout() {
  (await cookies()).delete(BENEF_COOKIE);
  redirect("/beneficiario/entrar?ok=saiu");
}

// ---------- Primeiro acesso / esqueci a senha ----------
// Confere CPF + data de nascimento + matrícula (ou nº do benefício) da base do Instituto.
export async function benefFirstAccess(fd: FormData) {
  const back = "/beneficiario/primeiro-acesso";
  const cpf = onlyDigits(str(fd, "cpf", 20));
  const birth = normalizeDate(str(fd, "birthDate", 20));
  const registration = onlyDigits(str(fd, "registration", 40));
  const password = String(fd.get("password") ?? "");
  const lockKey = `benef-primeiro:${cpf}`;
  const ipKey = `benef-ip:${await clientIp()}`;
  if (isLocked(lockKey) || isLocked(ipKey)) redirect(`${back}?erro=bloqueado`);

  const b = isValidCpf(cpf) ? await findByCpf(cpf) : null;
  const matches =
    !!b && b.status === "ativo" && !!birth && b.birthDate === birth && !!registration && onlyDigits(b.registration) === registration;
  if (!matches) {
    registerFailure(lockKey);
    registerFailure(ipKey);
    if (b) await logBenef(b.id, "Primeiro acesso/recuperação recusado (dados não conferem)");
    redirect(`${back}?erro=${b?.status === "pendente" ? "pendente" : "dados"}`);
  }
  // Conta com 2FA: para trocar a senha também precisa do código do celular
  if (b.totpEnabled && !verifyCode(decryptSecret(b.totpSecret), str(fd, "code", 10))) {
    registerFailure(lockKey);
    redirect(`${back}?erro=codigo`);
  }
  if (password !== String(fd.get("confirm") ?? "")) redirect(`${back}?erro=confirmacao`);
  const problem = passwordProblem(password, b.email);
  if (problem || password.includes(cpf)) redirect(`${back}?erro=senha&msg=${encodeURIComponent(problem ?? "A senha não pode conter o CPF.")}`);

  clearFailures(lockKey);
  const first = !b.passwordHash;
  await db
    .update(schema.beneficiaries)
    .set({ passwordHash: await bcrypt.hash(password, 12), passwordChangedAt: new Date(), updatedAt: new Date() })
    .where(eq(schema.beneficiaries.id, b.id));
  await logBenef(b.id, first ? "Fez o primeiro acesso e criou a senha" : "Redefiniu a senha (esqueci minha senha)");
  const [fresh] = await db.select().from(schema.beneficiaries).where(eq(schema.beneficiaries.id, b.id));
  await startSession(fresh, "Entrou na Área do Beneficiário");
  redirect(`/beneficiario?ok=${first ? "bemvindo" : "senha"}`);
}

// ---------- Pedido de cadastro (CPF que não está na base do Instituto) ----------
export async function benefRequestRegistration(fd: FormData) {
  const back = "/beneficiario/cadastro";
  const ipKey = `benef-cadastro:${await clientIp()}`;
  if (isLocked(ipKey)) redirect(`${back}?erro=bloqueado`);
  registerFailure(ipKey); // conta cada pedido: no máximo 5 a cada 10 minutos por IP

  const name = str(fd, "name");
  const cpf = onlyDigits(str(fd, "cpf", 20));
  const birth = normalizeDate(str(fd, "birthDate", 20));
  const email = str(fd, "email").toLowerCase();
  const phone = str(fd, "phone", 30);
  const kind = ["aposentado", "pensionista", "ativo"].includes(str(fd, "kind")) ? str(fd, "kind") : "";
  const doc = fd.get("document");

  if (name.length < 5 || !isValidCpf(cpf) || !birth || !kind) redirect(`${back}?erro=dados`);
  if (!email && !phone) redirect(`${back}?erro=contato`);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) redirect(`${back}?erro=email`);
  if (fd.get("consent") !== "on") redirect(`${back}?erro=consentimento`);
  if (!(doc instanceof File) || doc.size === 0) redirect(`${back}?erro=documento`);

  const existing = await findByCpf(cpf);
  if (existing) redirect(`${back}?erro=${existing.status === "pendente" ? "pendente" : "existe"}`);

  let saved;
  try {
    saved = await savePrivate(doc, "cadastro");
  } catch (e) {
    if (e instanceof UploadError) redirect(`${back}?erro=arquivo&msg=${encodeURIComponent(e.message)}`);
    throw e;
  }
  const [b] = await db
    .insert(schema.beneficiaries)
    .values({
      cpfHash: cpfHash(cpf),
      cpfEnc: encryptText(cpf),
      name,
      birthDate: birth,
      registration: onlyDigits(str(fd, "registration", 40)),
      kind,
      email,
      phone,
      status: "pendente",
      origin: "site",
    })
    .returning({ id: schema.beneficiaries.id });
  await db.insert(schema.beneficiaryDocuments).values({
    beneficiaryId: b.id,
    docType: "Documento de identidade (RG ou CNH)",
    fileName: doc.name.slice(0, 120),
    filePath: saved.path,
    mimeType: saved.mime,
    fileSize: saved.size,
  });
  await logBenef(b.id, "Pediu cadastro pelo site");
  await audit(null, "Pedido de cadastro na Área do Beneficiário", name);
  redirect(`${back}?ok=1`);
}

"use server";

import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { db, schema } from "@/db";
import { requireUser } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { done, fail, str } from "@/lib/admin";
import { passwordProblem } from "@/lib/password";
import { SESSION_COOKIE, SESSION_MAX_AGE, signSession } from "@/lib/session";
import { decryptSecret, encryptSecret, generateSecret, verifyCode } from "@/lib/totp";

const BACK = "/admin/conta";

async function me() {
  const session = await requireUser();
  const [user] = await db.select().from(schema.users).where(eq(schema.users.id, session.uid));
  if (!user) fail(BACK, "Usuário não encontrado.");
  return { session, user };
}

export async function changeOwnPassword(fd: FormData) {
  const { session, user } = await me();
  const current = str(fd, "current");
  const next = str(fd, "next");
  if (!(await bcrypt.compare(current, user.passwordHash))) fail(BACK, "Senha atual incorreta.");
  const problem = passwordProblem(next, user.email);
  if (problem) fail(BACK, problem);
  if (next !== str(fd, "confirm")) fail(BACK, "A confirmação não confere com a nova senha.");
  if (await bcrypt.compare(next, user.passwordHash)) fail(BACK, "A nova senha precisa ser diferente da atual.");

  await db
    .update(schema.users)
    .set({ passwordHash: await bcrypt.hash(next, 12), passwordChangedAt: new Date(), mustChangePassword: false })
    .where(eq(schema.users.id, user.id));

  // Renova a sessão sem a marca de "trocar senha"
  const token = await signSession({ uid: user.id, name: user.name, role: user.role as "admin" | "editor" });
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production" && process.env.INSECURE_COOKIE !== "1",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  await audit(session, "Alterou a própria senha");
  done(BACK, "Senha alterada com sucesso.");
}

/** Passo 1: gera o segredo e mostra o QR code (ainda não ativo) */
export async function startTwoFactor() {
  const { user } = await me();
  if (user.totpEnabled) fail(BACK, "A verificação em duas etapas já está ativa.");
  await db.update(schema.users).set({ totpSecret: encryptSecret(generateSecret()) }).where(eq(schema.users.id, user.id));
  done(`${BACK}?configurar=1`, "Leia o QR code com o aplicativo e confirme com o código.");
}

/** Passo 2: confirma com o primeiro código gerado pelo celular e ativa */
export async function confirmTwoFactor(fd: FormData) {
  const { session, user } = await me();
  const secret = decryptSecret(user.totpSecret);
  if (!secret) fail(BACK, "Configuração expirada. Clique em ativar novamente.");
  if (!verifyCode(secret, str(fd, "code"))) fail(`${BACK}?configurar=1`, "Código incorreto. Confira o aplicativo e tente de novo.");
  await db.update(schema.users).set({ totpEnabled: true }).where(eq(schema.users.id, user.id));
  await audit(session, "Ativou a verificação em duas etapas");
  done(BACK, "Verificação em duas etapas ativada. A partir do próximo login, o código será pedido.");
}

/** Desativar exige um código válido (prova de que a pessoa ainda tem o celular) */
export async function disableTwoFactor(fd: FormData) {
  const { session, user } = await me();
  if (!verifyCode(decryptSecret(user.totpSecret), str(fd, "code"))) fail(BACK, "Código incorreto.");
  await db.update(schema.users).set({ totpEnabled: false, totpSecret: "" }).where(eq(schema.users.id, user.id));
  await audit(session, "Desativou a verificação em duas etapas");
  done(BACK, "Verificação em duas etapas desativada.");
}

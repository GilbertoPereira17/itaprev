"use server";

import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db, schema } from "@/db";
import { clearFailures, getSession, isLocked, registerFailure } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { passwordExpired } from "@/lib/password";
import { decryptSecret, verifyCode } from "@/lib/totp";
import {
  PENDING_COOKIE,
  PENDING_MAX_AGE,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  signPending,
  signSession,
  verifyPending,
} from "@/lib/session";

// Hash válido de uma senha qualquer: mantém o tempo de resposta igual quando o e-mail não existe
const DUMMY_HASH = bcrypt.hashSync("itaprev-dummy-password", 12);

const cookieOptions = (maxAge: number) => ({
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production" && process.env.INSECURE_COOKIE !== "1",
  path: "/",
  maxAge,
});

type User = typeof schema.users.$inferSelect;

async function startSession(user: User, next: string, mc: boolean) {
  const token = await signSession({ uid: user.id, name: user.name, role: user.role as "admin" | "editor", mc });
  cookies().set(SESSION_COOKIE, token, cookieOptions(SESSION_MAX_AGE));
  return mc ? "/admin/conta?troca=1" : next;
}

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const nextRaw = String(formData.get("next") || "/admin");
  // Só permite voltar para dentro do painel (evita open redirect)
  const next = nextRaw.startsWith("/admin") && !nextRaw.startsWith("//") ? nextRaw : "/admin";

  if (isLocked(email)) redirect(`/admin/login?erro=bloqueado`);

  const [user] = await db.select().from(schema.users).where(eq(schema.users.email, email));
  // Compara mesmo sem usuário para não revelar quais e-mails existem
  const ok = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);

  if (!user || !ok || !user.active) {
    registerFailure(email);
    await audit(null, "Tentativa de login recusada", email);
    redirect(`/admin/login?erro=credenciais&next=${encodeURIComponent(next)}`);
  }

  clearFailures(email);
  const mc = user.mustChangePassword || passwordExpired(user.passwordChangedAt);

  if (user.totpEnabled) {
    cookies().set(PENDING_COOKIE, await signPending({ uid: user.id, next, mc }), cookieOptions(PENDING_MAX_AGE));
    redirect("/admin/login/2fa");
  }

  const dest = await startSession(user, next, mc);
  await audit({ uid: user.id, name: user.name }, "Entrou no painel");
  redirect(dest);
}

/** Segunda etapa: código de 6 dígitos do aplicativo autenticador */
export async function verifyTwoFactor(formData: FormData) {
  const pending = await verifyPending(cookies().get(PENDING_COOKIE)?.value);
  if (!pending) redirect("/admin/login?erro=expirou");

  const key = `2fa:${pending.uid}`;
  if (isLocked(key)) {
    cookies().delete(PENDING_COOKIE);
    redirect("/admin/login?erro=bloqueado");
  }

  const [user] = await db.select().from(schema.users).where(eq(schema.users.id, pending.uid));
  if (!user || !user.active || !user.totpEnabled) redirect("/admin/login?erro=credenciais");

  const code = String(formData.get("code") || "");
  if (!verifyCode(decryptSecret(user.totpSecret), code)) {
    registerFailure(key);
    await audit({ uid: user.id, name: user.name }, "Código de verificação (2FA) incorreto");
    redirect("/admin/login/2fa?erro=codigo");
  }

  clearFailures(key);
  cookies().delete(PENDING_COOKIE);
  const dest = await startSession(user, pending.next, pending.mc);
  await audit({ uid: user.id, name: user.name }, "Entrou no painel (com verificação em duas etapas)");
  redirect(dest);
}

export async function logoutAction() {
  const session = await getSession();
  if (session) await audit(session, "Saiu do painel");
  cookies().delete(SESSION_COOKIE);
  redirect("/admin/login");
}

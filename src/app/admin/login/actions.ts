"use server";

import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db, schema } from "@/db";
import { clearFailures, isLocked, registerFailure } from "@/lib/auth";
import { SESSION_COOKIE, SESSION_MAX_AGE, signSession } from "@/lib/session";

// Hash válido de uma senha qualquer: mantém o tempo de resposta igual quando o e-mail não existe
const DUMMY_HASH = bcrypt.hashSync("itaprev-dummy-password", 12);

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
    redirect(`/admin/login?erro=credenciais&next=${encodeURIComponent(next)}`);
  }

  clearFailures(email);
  const token = await signSession({ uid: user.id, name: user.name, role: user.role as "admin" | "editor" });
  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production" && process.env.INSECURE_COOKIE !== "1",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  redirect(next);
}

export async function logoutAction() {
  cookies().delete(SESSION_COOKIE);
  redirect("/admin/login");
}

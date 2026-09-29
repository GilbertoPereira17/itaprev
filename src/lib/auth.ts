import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { SESSION_COOKIE, verifySession, type SessionPayload } from "./session";

/** Sessão atual (ou null) — para Server Components e Server Actions */
export async function getSession(): Promise<SessionPayload | null> {
  return verifySession(cookies().get(SESSION_COOKIE)?.value);
}

/** Exige usuário logado; senão manda para o login */
export async function requireUser(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  // Confere no banco: usuário desativado/excluído perde o acesso imediatamente
  const [user] = await db
    .select({ active: schema.users.active, role: schema.users.role, name: schema.users.name })
    .from(schema.users)
    .where(eq(schema.users.id, session.uid));
  if (!user || !user.active) redirect("/admin/login");
  return { ...session, role: user.role as SessionPayload["role"], name: user.name };
}

/** Exige perfil administrador (gestão de usuários) */
export async function requireAdmin(): Promise<SessionPayload> {
  const session = await requireUser();
  if (session.role !== "admin") redirect("/admin");
  return session;
}

// ---- Proteção simples contra força bruta no login (por e-mail) ----
const attempts = new Map<string, { count: number; until: number }>();
const MAX_ATTEMPTS = 5;
const LOCK_MS = 10 * 60 * 1000;

export function isLocked(key: string) {
  const a = attempts.get(key);
  return !!a && a.count >= MAX_ATTEMPTS && Date.now() < a.until;
}
export function registerFailure(key: string) {
  const a = attempts.get(key);
  const count = a && Date.now() < a.until ? a.count + 1 : 1;
  attempts.set(key, { count, until: Date.now() + LOCK_MS });
}
export function clearFailures(key: string) {
  attempts.delete(key);
}

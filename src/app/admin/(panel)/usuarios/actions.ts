"use server";

import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { requireAdmin } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { done, fail, int, str } from "@/lib/admin";
import { passwordProblem } from "@/lib/password";

const BACK = "/admin/usuarios";

async function findUser(id: number) {
  const [u] = await db.select().from(schema.users).where(eq(schema.users.id, id));
  if (!u) fail(BACK, "Usuário não encontrado.");
  return u;
}

export async function createUser(fd: FormData) {
  const me = await requireAdmin();
  const name = str(fd, "name");
  const email = str(fd, "email").toLowerCase();
  const password = str(fd, "password");
  const role = str(fd, "role") === "admin" ? "admin" : "editor";
  if (!name || !email) fail(BACK, "Preencha nome e e-mail.");
  const problem = passwordProblem(password, email);
  if (problem) fail(BACK, problem);
  const exists = await db.select({ id: schema.users.id }).from(schema.users).where(eq(schema.users.email, email));
  if (exists.length) fail(BACK, "Já existe um usuário com esse e-mail.");
  // Senha inicial é provisória: a pessoa define a própria no primeiro acesso
  await db
    .insert(schema.users)
    .values({ name, email, role, passwordHash: await bcrypt.hash(password, 12), mustChangePassword: true });
  await audit(me, "Criou usuário", `${name} <${email}> · ${role === "admin" ? "Administrador" : "Editor"}`);
  done(BACK, `Usuário ${name} criado. No primeiro acesso, será pedida uma nova senha.`);
}

export async function toggleUser(fd: FormData) {
  const me = await requireAdmin();
  const id = int(fd, "id");
  if (id === me.uid) fail(BACK, "Você não pode desativar a si mesmo.");
  const u = await findUser(id);
  await db.update(schema.users).set({ active: !u.active }).where(eq(schema.users.id, id));
  await audit(me, u.active ? "Desativou usuário" : "Reativou usuário", `${u.name} <${u.email}>`);
  done(BACK, "Usuário atualizado.");
}

export async function resetPassword(fd: FormData) {
  const me = await requireAdmin();
  const u = await findUser(int(fd, "id"));
  const password = str(fd, "password");
  const problem = passwordProblem(password, u.email);
  if (problem) fail(BACK, problem);
  await db
    .update(schema.users)
    .set({ passwordHash: await bcrypt.hash(password, 12), mustChangePassword: true, passwordChangedAt: new Date() })
    .where(eq(schema.users.id, u.id));
  await audit(me, "Redefiniu a senha de usuário", `${u.name} <${u.email}>`);
  done(BACK, `Senha provisória definida para ${u.name}. No próximo acesso, será pedida uma nova.`);
}

/** Para quem perdeu o celular: desliga o 2FA; a pessoa reativa depois em Minha conta */
export async function resetTwoFactor(fd: FormData) {
  const me = await requireAdmin();
  const u = await findUser(int(fd, "id"));
  await db.update(schema.users).set({ totpEnabled: false, totpSecret: "" }).where(eq(schema.users.id, u.id));
  await audit(me, "Redefiniu a verificação em duas etapas de usuário", `${u.name} <${u.email}>`);
  done(BACK, `Verificação em duas etapas de ${u.name} desativada. Peça para reativar em Minha conta.`);
}

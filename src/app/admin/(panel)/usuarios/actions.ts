"use server";

import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { requireAdmin, requireUser } from "@/lib/auth";
import { done, fail, int, str } from "@/lib/admin";

const MIN_PASSWORD = 10;

export async function createUser(fd: FormData) {
  await requireAdmin();
  const name = str(fd, "name");
  const email = str(fd, "email").toLowerCase();
  const password = str(fd, "password");
  const role = str(fd, "role") === "admin" ? "admin" : "editor";
  if (!name || !email) fail("/admin/usuarios", "Preencha nome e e-mail.");
  if (password.length < MIN_PASSWORD) fail("/admin/usuarios", `A senha precisa ter ao menos ${MIN_PASSWORD} caracteres.`);
  const exists = await db.select({ id: schema.users.id }).from(schema.users).where(eq(schema.users.email, email));
  if (exists.length) fail("/admin/usuarios", "Já existe um usuário com esse e-mail.");
  await db.insert(schema.users).values({ name, email, role, passwordHash: await bcrypt.hash(password, 12) });
  done("/admin/usuarios", `Usuário ${name} criado.`);
}

export async function toggleUser(fd: FormData) {
  const me = await requireAdmin();
  const id = int(fd, "id");
  if (id === me.uid) fail("/admin/usuarios", "Você não pode desativar a si mesmo.");
  const [u] = await db.select().from(schema.users).where(eq(schema.users.id, id));
  if (u) await db.update(schema.users).set({ active: !u.active }).where(eq(schema.users.id, id));
  done("/admin/usuarios", "Usuário atualizado.");
}

export async function resetPassword(fd: FormData) {
  await requireAdmin();
  const password = str(fd, "password");
  if (password.length < MIN_PASSWORD) fail("/admin/usuarios", `A senha precisa ter ao menos ${MIN_PASSWORD} caracteres.`);
  await db
    .update(schema.users)
    .set({ passwordHash: await bcrypt.hash(password, 12) })
    .where(eq(schema.users.id, int(fd, "id")));
  done("/admin/usuarios", "Senha redefinida.");
}

export async function changeOwnPassword(fd: FormData) {
  const me = await requireUser();
  const current = str(fd, "current");
  const next = str(fd, "next");
  if (next.length < MIN_PASSWORD) fail("/admin/conta", `A nova senha precisa ter ao menos ${MIN_PASSWORD} caracteres.`);
  if (next !== str(fd, "confirm")) fail("/admin/conta", "A confirmação não confere com a nova senha.");
  const [u] = await db.select().from(schema.users).where(eq(schema.users.id, me.uid));
  if (!u || !(await bcrypt.compare(current, u.passwordHash))) fail("/admin/conta", "Senha atual incorreta.");
  await db.update(schema.users).set({ passwordHash: await bcrypt.hash(next, 12) }).where(eq(schema.users.id, me.uid));
  done("/admin/conta", "Senha alterada com sucesso.");
}

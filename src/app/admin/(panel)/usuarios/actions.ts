"use server";

import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { requireAdmin } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { done, fail, int, str } from "@/lib/admin";
import { passwordProblem } from "@/lib/password";
import { MODULE_KEYS, MODULES } from "@/lib/permissions";

const BACK = "/admin/usuarios";

/** Módulos marcados no formulário (só valem para o perfil Editor) */
function modulesFrom(fd: FormData) {
  return MODULE_KEYS.filter((k) => fd.get(`mod_${k}`) === "on");
}
const modulesLabel = (role: string, mods: string[]) =>
  role === "admin" ? "Administrador (acesso total)" : `Editor: ${mods.map((m) => MODULES[m as keyof typeof MODULES]).join(", ") || "nenhum módulo"}`;

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
  const modules = modulesFrom(fd);
  if (!name || !email) fail(BACK, "Preencha nome e e-mail.");
  if (role === "editor" && modules.length === 0) fail(BACK, "Marque ao menos um módulo que o editor poderá acessar.");
  const problem = passwordProblem(password, email);
  if (problem) fail(BACK, problem);
  const exists = await db.select({ id: schema.users.id }).from(schema.users).where(eq(schema.users.email, email));
  if (exists.length) fail(BACK, "Já existe um usuário com esse e-mail.");
  // Senha inicial é provisória: a pessoa define a própria no primeiro acesso
  await db
    .insert(schema.users)
    .values({ name, email, role, modules: modules.join(","), passwordHash: await bcrypt.hash(password, 12), mustChangePassword: true });
  await audit(me, "Criou usuário", `${name} <${email}> · ${modulesLabel(role, modules)}`);
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

/** Perfil e módulos que o usuário pode acessar no painel */
export async function updateAccess(fd: FormData) {
  const me = await requireAdmin();
  const u = await findUser(int(fd, "id"));
  const role = str(fd, "role") === "admin" ? "admin" : "editor";
  const modules = modulesFrom(fd);
  if (u.id === me.uid && role !== "admin") fail(BACK, "Você não pode tirar o seu próprio perfil de administrador.");
  if (role === "editor" && modules.length === 0) fail(BACK, "Marque ao menos um módulo que o editor poderá acessar.");
  await db.update(schema.users).set({ role, modules: modules.join(",") }).where(eq(schema.users.id, u.id));
  await audit(me, "Alterou acesso de usuário", `${u.name} <${u.email}> · ${modulesLabel(role, modules)}`);
  done(BACK, `Acesso de ${u.name} atualizado.`);
}

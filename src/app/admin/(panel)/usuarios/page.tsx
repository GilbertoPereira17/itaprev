import { asc } from "drizzle-orm";
import { db, schema } from "@/db";
import { requireAdmin } from "@/lib/auth";
import { Card, Field, Flash, Input, PageHeader, Select, SubmitButton } from "@/components/admin/ui";
import { createUser, resetPassword, toggleUser } from "./actions";

export default async function AdminUsers({ searchParams }: { searchParams: { ok?: string; erro?: string } }) {
  const me = await requireAdmin();
  const users = await db.select().from(schema.users).orderBy(asc(schema.users.name));

  return (
    <>
      <PageHeader title="Usuários" description="Quem pode entrar no painel. Editores publicam conteúdo; administradores também gerenciam usuários." />
      <Flash {...searchParams} />

      <Card className="mb-6 p-0">
        <ul className="divide-y divide-slate-100">
          {users.map((u) => (
            <li key={u.id} className="flex flex-wrap items-center gap-4 px-6 py-4">
              <div className="min-w-0 flex-1">
                <p className="font-bold text-slate-900">
                  {u.name} {u.id === me.uid && <span className="text-xs font-normal text-slate-500">(você)</span>}
                </p>
                <p className="text-xs text-slate-500">
                  {u.email} · {u.role === "admin" ? "Administrador" : "Editor"} {!u.active && "· desativado"}
                </p>
              </div>
              <details className="relative">
                <summary className="cursor-pointer text-sm font-semibold text-[var(--color-brand-blue)]">Redefinir senha</summary>
                <form action={resetPassword} className="absolute right-0 z-10 mt-2 flex w-72 gap-2 rounded-xl border bg-white p-3 shadow-lg">
                  <input type="hidden" name="id" value={u.id} />
                  <Input name="password" type="text" minLength={10} placeholder="Nova senha (10+)" className="!py-2" />
                  <SubmitButton className="!px-3 !py-2">OK</SubmitButton>
                </form>
              </details>
              {u.id !== me.uid && (
                <form action={toggleUser}>
                  <input type="hidden" name="id" value={u.id} />
                  <SubmitButton variant="ghost" className="!px-3 !py-2">{u.active ? "Desativar" : "Reativar"}</SubmitButton>
                </form>
              )}
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <h2 className="mb-4 font-bold text-slate-900">Novo usuário</h2>
        <form action={createUser} className="grid gap-4 sm:grid-cols-2">
          <Field label="Nome"><Input name="name" required /></Field>
          <Field label="E-mail"><Input name="email" type="email" required /></Field>
          <Field label="Senha inicial" hint="Mínimo de 10 caracteres. Peça para a pessoa trocar no primeiro acesso.">
            <Input name="password" type="text" minLength={10} required />
          </Field>
          <Field label="Perfil">
            <Select name="role" defaultValue="editor">
              <option value="editor">Editor</option>
              <option value="admin">Administrador</option>
            </Select>
          </Field>
          <div className="sm:col-span-2 text-right"><SubmitButton>Criar usuário</SubmitButton></div>
        </form>
      </Card>
    </>
  );
}

import { asc } from "drizzle-orm";
import { db, schema } from "@/db";
import { requireAdmin } from "@/lib/auth";
import { Card, Checkbox, Field, Flash, Input, PageHeader, Select, SubmitButton } from "@/components/admin/ui";
import { PASSWORD_RULES } from "@/lib/password";
import { MODULE_KEYS, MODULES, parseModules } from "@/lib/permissions";
import { createUser, resetPassword, resetTwoFactor, toggleUser, updateAccess } from "./actions";

/** Perfil + módulos liberados (os módulos só valem para o Editor) */
function AccessFields({ role = "editor", modules = MODULE_KEYS as string[] }: { role?: string; modules?: string[] }) {
  return (
    <>
      <Field label="Perfil">
        <Select name="role" defaultValue={role}>
          <option value="editor">Editor (só os módulos marcados)</option>
          <option value="admin">Administrador (acesso total, inclusive usuários e registro de atividades)</option>
        </Select>
      </Field>
      <fieldset className="mt-3">
        <legend className="mb-2 text-sm font-semibold text-slate-700">Módulos liberados para o Editor</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {MODULE_KEYS.map((k) => (
            <Checkbox key={k} name={`mod_${k}`} label={MODULES[k]} defaultChecked={modules.includes(k)} />
          ))}
        </div>
      </fieldset>
    </>
  );
}

export default async function AdminUsers(props: { searchParams: Promise<{ ok?: string; erro?: string }> }) {
  const searchParams = await props.searchParams;
  const me = await requireAdmin();
  const users = await db.select().from(schema.users).orderBy(asc(schema.users.name));

  return (
    <>
      <PageHeader title="Usuários" description="Quem pode entrar no painel. Editores acessam só os módulos liberados; administradores acessam tudo e gerenciam usuários." />
      <Flash {...searchParams} />

      <Card className="mb-6 p-0">
        <ul className="divide-y divide-slate-100">
          {users.map((u) => (
            <li key={u.id} className="flex flex-wrap items-center gap-4 px-6 py-4">
              <div className="min-w-0 basis-full sm:basis-auto sm:flex-1">
                <p className="font-bold text-slate-900">
                  {u.name} {u.id === me.uid && <span className="text-xs font-normal text-slate-500">(você)</span>}
                </p>
                <p className="text-xs text-slate-500">
                  {u.email} · {u.role === "admin" ? "Administrador" : "Editor"} {!u.active && "· desativado"}
                </p>
                {u.role !== "admin" && (
                  <p className="mt-0.5 text-xs text-slate-500">
                    Acessa: {parseModules(u.modules).map((m) => MODULES[m]).join(", ") || "nenhum módulo"}
                  </p>
                )}
                <p className={`mt-0.5 text-xs font-semibold ${u.totpEnabled ? "text-emerald-700" : "text-amber-700"}`}>
                  {u.totpEnabled ? "✓ Verificação em duas etapas ativa" : "Sem verificação em duas etapas"}
                  {u.mustChangePassword && <span className="font-normal text-slate-500"> · aguardando troca da senha provisória</span>}
                </p>
              </div>
              <details className="relative">
                <summary className="cursor-pointer text-sm font-semibold text-[var(--color-brand-blue)]">Redefinir senha</summary>
                <form action={resetPassword} className="absolute right-0 z-10 mt-2 flex w-72 gap-2 rounded-xl border bg-white p-3 shadow-lg">
                  <input type="hidden" name="id" value={u.id} />
                  <Input name="password" type="text" minLength={10} placeholder="Senha provisória" className="!py-2" />
                  <SubmitButton className="!px-3 !py-2">OK</SubmitButton>
                </form>
              </details>
              {u.totpEnabled && u.id !== me.uid && (
                <form action={resetTwoFactor}>
                  <input type="hidden" name="id" value={u.id} />
                  <SubmitButton variant="ghost" className="!px-3 !py-2">Redefinir 2FA</SubmitButton>
                </form>
              )}
              {u.id !== me.uid && (
                <form action={toggleUser}>
                  <input type="hidden" name="id" value={u.id} />
                  <SubmitButton variant="ghost" className="!px-3 !py-2">{u.active ? "Desativar" : "Reativar"}</SubmitButton>
                </form>
              )}
              <details className="group order-last basis-full">
                <summary className="cursor-pointer text-sm font-semibold text-[var(--color-brand-blue)]">Acesso ao painel</summary>
                <form action={updateAccess} className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <input type="hidden" name="id" value={u.id} />
                  <AccessFields role={u.role} modules={parseModules(u.modules)} />
                  <div className="mt-4 text-right"><SubmitButton className="!px-3 !py-2">Salvar acesso</SubmitButton></div>
                </form>
              </details>
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <h2 className="mb-4 font-bold text-slate-900">Novo usuário</h2>
        <form action={createUser} className="grid gap-4 sm:grid-cols-2">
          <Field label="Nome"><Input name="name" required /></Field>
          <Field label="E-mail"><Input name="email" type="email" required /></Field>
          <Field label="Senha provisória" hint={`${PASSWORD_RULES} No primeiro acesso, a pessoa define a própria senha.`}>
            <Input name="password" type="text" minLength={10} required />
          </Field>
          <div className="sm:col-span-2"><AccessFields /></div>
          <div className="sm:col-span-2 text-right"><SubmitButton>Criar usuário</SubmitButton></div>
        </form>
      </Card>
    </>
  );
}

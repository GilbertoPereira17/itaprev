import Image from "next/image";
import { Lock } from "lucide-react";
import { loginAction } from "./actions";
import { SubmitButton } from "@/components/admin/ui";

export const metadata = { title: "Entrar no painel", robots: { index: false } };

const ERRORS: Record<string, string> = {
  credenciais: "E-mail ou senha incorretos.",
  bloqueado: "Muitas tentativas. Aguarde 10 minutos e tente novamente.",
  expirou: "O tempo para digitar o código acabou. Entre novamente.",
};

export default async function LoginPage(props: { searchParams: Promise<{ erro?: string; next?: string }> }) {
  const searchParams = await props.searchParams;
  const error = searchParams.erro ? ERRORS[searchParams.erro] : null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-brand-navy)] px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <div className="relative h-14 w-60">
            <Image src="/images/logo-branco.png" alt="Itanhaém Prev" fill priority className="object-contain" />
          </div>
        </div>

        <form action={loginAction} className="space-y-5 rounded-3xl bg-white p-8 shadow-2xl">
          <div className="space-y-1">
            <h1 className="flex items-center gap-2 text-xl font-extrabold text-slate-900">
              <Lock className="h-5 w-5 text-[var(--color-brand-blue)]" aria-hidden /> Painel administrativo
            </h1>
            <p className="text-sm text-slate-500">Acesso restrito à equipe do Itanhaém Prev.</p>
          </div>

          {error && (
            <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </p>
          )}

          <input type="hidden" name="next" value={searchParams.next || "/admin"} />

          <label className="block space-y-1.5">
            <span className="text-sm font-bold text-slate-700">E-mail</span>
            <input
              name="email"
              type="email"
              required
              autoComplete="username"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-base focus:border-[var(--color-brand-blue)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-blue)]/30"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-sm font-bold text-slate-700">Senha</span>
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-base focus:border-[var(--color-brand-blue)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-blue)]/30"
            />
          </label>

          <SubmitButton className="w-full">Entrar</SubmitButton>
        </form>

        <p className="mt-6 text-center text-xs text-slate-400">Itanhaém Prev · Desenvolvido por Trius Tecnologia</p>
      </div>
    </div>
  );
}

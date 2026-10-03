import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Smartphone } from "lucide-react";
import { SubmitButton } from "@/components/admin/ui";
import { PENDING_COOKIE, verifyPending } from "@/lib/session";
import { verifyTwoFactor } from "../actions";

export const metadata = { title: "Código de verificação", robots: { index: false } };

export default async function TwoFactorPage(props: { searchParams: Promise<{ erro?: string }> }) {
  const searchParams = await props.searchParams;
  // Sem a etapa da senha concluída, volta para o login
  if (!(await verifyPending((await cookies()).get(PENDING_COOKIE)?.value))) redirect("/admin/login?erro=expirou");

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-brand-navy)] px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <div className="relative h-14 w-60">
            <Image src="/images/logo-branco.png" alt="Itanhaém Prev" fill priority className="object-contain" />
          </div>
        </div>

        <form action={verifyTwoFactor} className="space-y-5 rounded-3xl bg-white p-8 shadow-2xl">
          <div className="space-y-1">
            <h1 className="flex items-center gap-2 text-xl font-extrabold text-slate-900">
              <Smartphone className="h-5 w-5 text-[var(--color-brand-blue)]" aria-hidden /> Código de verificação
            </h1>
            <p className="text-sm text-slate-500">
              Abra o aplicativo autenticador no seu celular e digite o código de 6 dígitos do Itanhaém Prev.
            </p>
          </div>

          {searchParams.erro === "codigo" && (
            <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              Código incorreto. Confira no aplicativo e tente de novo.
            </p>
          )}

          <input
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9 ]{6,7}"
            maxLength={7}
            required
            autoFocus
            aria-label="Código de 6 dígitos"
            placeholder="000000"
            className="w-full rounded-xl border border-slate-300 px-4 py-4 text-center text-3xl font-bold tracking-[0.4em] focus:border-[var(--color-brand-blue)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-blue)]/30"
          />

          <SubmitButton className="w-full">Confirmar</SubmitButton>
          <p className="text-center text-sm">
            <Link href="/admin/login" className="font-semibold text-[var(--color-brand-blue)] hover:underline">Voltar</Link>
          </p>
          <p className="text-center text-xs text-slate-500">
            Perdeu o acesso ao celular? Peça a um administrador para redefinir sua verificação em duas etapas.
          </p>
        </form>
      </div>
    </div>
  );
}

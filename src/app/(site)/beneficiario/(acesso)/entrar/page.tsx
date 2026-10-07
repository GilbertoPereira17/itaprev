import Link from "next/link";
import { AccessShell } from "../shell";
import { BAlert, BField, BInput, BSubmit, CpfInput } from "@/components/beneficiary/ui";
import { benefLogin } from "../actions";

export const metadata = { title: "Área do Beneficiário", robots: { index: false } };

const ERRORS: Record<string, string> = {
  credenciais: "CPF ou senha incorretos.",
  primeiro: "Você ainda não criou sua senha. Use \"Primeiro acesso\" abaixo.",
  bloqueado: "Muitas tentativas. Aguarde 10 minutos e tente novamente.",
  expirou: "O tempo para digitar o código acabou. Entre novamente.",
  sessao: "Sua senha foi alterada. Entre novamente.",
};

export default async function BenefLogin(props: { searchParams: Promise<{ erro?: string; ok?: string }> }) {
  const { erro, ok } = await props.searchParams;
  return (
    <AccessShell title="Área do Beneficiário" description="Consulte seus dados, envie documentos e acompanhe suas solicitações.">
      <form action={benefLogin} className="space-y-5">
        <h2 className="text-2xl font-bold text-slate-900">Entrar</h2>
        {erro && ERRORS[erro] && <BAlert>{ERRORS[erro]}</BAlert>}
        {ok && <BAlert kind="ok">{ok === "saiu" ? "Você saiu da Área do Beneficiário." : ok}</BAlert>}
        <BField label="CPF"><CpfInput /></BField>
        <BField label="Senha"><BInput name="password" type="password" required autoComplete="current-password" /></BField>
        <BSubmit>Entrar</BSubmit>
      </form>
      <div className="mt-8 space-y-3 border-t border-slate-200 pt-6 text-base">
        <p>
          <strong>Primeiro acesso ou esqueceu a senha?</strong>{" "}
          <Link href="/beneficiario/primeiro-acesso" className="font-semibold text-[var(--color-brand-blue)] underline">
            Criar ou redefinir senha
          </Link>
        </p>
        <p className="text-slate-600">
          Não encontrou seu cadastro?{" "}
          <Link href="/beneficiario/cadastro" className="font-semibold text-[var(--color-brand-blue)] underline">
            Peça seu cadastro
          </Link>
        </p>
      </div>
    </AccessShell>
  );
}

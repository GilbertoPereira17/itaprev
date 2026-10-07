import Link from "next/link";
import { AccessShell } from "../shell";
import { BAlert, BField, BInput, BSubmit, CpfInput } from "@/components/beneficiary/ui";
import { PASSWORD_RULES } from "@/lib/password";
import { benefFirstAccess } from "../actions";

export const metadata = { title: "Primeiro acesso", robots: { index: false } };

const ERRORS: Record<string, string> = {
  dados: "Os dados não conferem com o cadastro do Instituto. Confira o CPF, a data de nascimento e a matrícula.",
  pendente: "Seu pedido de cadastro ainda está em análise pela equipe do Instituto.",
  codigo: "Sua conta tem verificação em duas etapas: informe o código do aplicativo no celular.",
  confirmacao: "A confirmação não é igual à senha.",
  bloqueado: "Muitas tentativas. Aguarde 10 minutos e tente novamente.",
};

export default async function FirstAccess(props: { searchParams: Promise<{ erro?: string; msg?: string }> }) {
  const { erro, msg } = await props.searchParams;
  return (
    <AccessShell
      title="Primeiro acesso ou nova senha"
      description="Confirme seus dados do cadastro do Instituto e crie sua senha."
    >
      <form action={benefFirstAccess} className="space-y-5">
        {erro && <BAlert>{erro === "senha" ? msg : ERRORS[erro]}</BAlert>}
        <BField label="CPF"><CpfInput /></BField>
        <BField label="Data de nascimento"><BInput name="birthDate" type="date" required /></BField>
        <BField label="Matrícula ou nº do benefício" hint="Está no seu holerite ou na carta de concessão do benefício.">
          <BInput name="registration" required inputMode="numeric" />
        </BField>
        <BField label="Nova senha" hint={PASSWORD_RULES}>
          <BInput name="password" type="password" required minLength={10} autoComplete="new-password" />
        </BField>
        <BField label="Repita a nova senha"><BInput name="confirm" type="password" required minLength={10} autoComplete="new-password" /></BField>
        <BField label="Código do aplicativo (só se você ativou a verificação em duas etapas)">
          <BInput name="code" inputMode="numeric" maxLength={6} autoComplete="one-time-code" />
        </BField>
        <BSubmit>Criar senha e entrar</BSubmit>
      </form>
      <p className="mt-8 border-t border-slate-200 pt-6 text-base text-slate-600">
        Não está no cadastro do Instituto?{" "}
        <Link href="/beneficiario/cadastro" className="font-semibold text-[var(--color-brand-blue)] underline">Peça seu cadastro</Link>.
      </p>
    </AccessShell>
  );
}

import Link from "next/link";
import { AccessShell } from "../shell";
import { BAlert, BField, BInput, BSelect, BSubmit, CpfInput } from "@/components/beneficiary/ui";
import { benefRequestRegistration } from "../actions";

export const metadata = { title: "Pedir cadastro", robots: { index: false } };

const ERRORS: Record<string, string> = {
  dados: "Confira nome completo, CPF, data de nascimento e vínculo.",
  contato: "Informe um e-mail ou telefone para o Instituto falar com você.",
  email: "E-mail inválido.",
  consentimento: "Confirme que autoriza o uso dos dados para o cadastro.",
  documento: "Envie a foto ou o PDF do seu documento de identidade.",
  existe: "Este CPF já está cadastrado. Use \"Primeiro acesso\" para criar sua senha.",
  pendente: "Já existe um pedido de cadastro para este CPF, em análise pela equipe.",
  bloqueado: "Muitos pedidos em sequência. Aguarde alguns minutos.",
};

export default async function RequestRegistration(props: { searchParams: Promise<{ erro?: string; msg?: string; ok?: string }> }) {
  const { erro, msg, ok } = await props.searchParams;
  if (ok) {
    return (
      <AccessShell title="Pedido de cadastro enviado">
        <BAlert kind="ok">
          Recebemos seu pedido. A equipe do Instituto vai conferir seus dados e o documento. Depois da aprovação, use{" "}
          <Link href="/beneficiario/primeiro-acesso" className="font-bold underline">Primeiro acesso</Link> para criar sua senha.
        </BAlert>
      </AccessShell>
    );
  }
  return (
    <AccessShell
      title="Pedir cadastro"
      description="Para aposentados, pensionistas e servidores que ainda não estão no cadastro da Área do Beneficiário."
    >
      <form action={benefRequestRegistration} className="space-y-5">
        {erro && <BAlert>{erro === "arquivo" ? msg : ERRORS[erro]}</BAlert>}
        <BField label="Nome completo"><BInput name="name" required autoComplete="name" /></BField>
        <BField label="CPF"><CpfInput /></BField>
        <BField label="Data de nascimento"><BInput name="birthDate" type="date" required /></BField>
        <BField label="Vínculo com o Instituto">
          <BSelect name="kind" required defaultValue="">
            <option value="" disabled>Escolha</option>
            <option value="aposentado">Aposentado(a)</option>
            <option value="pensionista">Pensionista</option>
            <option value="ativo">Servidor(a) ativo(a)</option>
          </BSelect>
        </BField>
        <BField label="Matrícula ou nº do benefício (se souber)"><BInput name="registration" inputMode="numeric" /></BField>
        <BField label="E-mail"><BInput name="email" type="email" autoComplete="email" /></BField>
        <BField label="Telefone / WhatsApp"><BInput name="phone" type="tel" autoComplete="tel" /></BField>
        <BField label="Documento de identidade (RG ou CNH)" hint="Foto legível ou PDF, até 10 MB.">
          <input type="file" name="document" required accept="application/pdf,image/jpeg,image/png,image/webp" className="block w-full text-base" />
        </BField>
        <label className="flex items-start gap-3 text-base text-slate-700">
          <input type="checkbox" name="consent" required className="mt-1 h-5 w-5 accent-[var(--color-brand-blue)]" />
          <span>
            Autorizo o Itanhaém Prev a usar estes dados e o documento para conferir meu cadastro, conforme a{" "}
            <Link href="/privacidade" className="font-semibold underline">Política de Privacidade</Link>.
          </span>
        </label>
        <BSubmit>Enviar pedido</BSubmit>
      </form>
    </AccessShell>
  );
}

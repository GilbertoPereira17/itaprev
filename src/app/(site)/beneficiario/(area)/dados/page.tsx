import Link from "next/link";
import { BENEF_KIND, requireBeneficiary } from "@/lib/beneficiary";
import { formatDateBr, maskCpf } from "@/lib/cpf";
import { decryptText } from "@/lib/data-crypto";
import { BField, BInput, BSubmit, BTextarea } from "@/components/beneficiary/ui";
import { updateContact } from "../actions";
import { BCard, BFlash } from "../card";

export default async function BenefData(props: { searchParams: Promise<{ ok?: string; erro?: string }> }) {
  const sp = await props.searchParams;
  const b = await requireBeneficiary();
  const fixed = [
    ["Nome", b.name],
    ["CPF", maskCpf(decryptText(b.cpfEnc))],
    ["Data de nascimento", formatDateBr(b.birthDate)],
    ["Vínculo", BENEF_KIND[b.kind] ?? "—"],
    ["Matrícula / nº do benefício", b.registration || "—"],
  ];
  return (
    <>
      <BFlash {...sp} />
      <BCard title="Dados do cadastro">
        <dl className="grid gap-4 sm:grid-cols-2">
          {fixed.map(([k, v]) => (
            <div key={k}>
              <dt className="text-sm font-semibold text-slate-500">{k}</dt>
              <dd className="text-lg text-slate-900">{v}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-5 text-base text-slate-600">
          Algum dado acima está errado ou mudou (nome, estado civil, dependentes)?{" "}
          <Link href="/beneficiario/solicitacoes/nova?assunto=0" className="font-semibold text-[var(--color-brand-blue)] underline">
            Peça a atualização
          </Link>{" "}
          e anexe o documento que comprova.
        </p>
      </BCard>
      <BCard title="Meus contatos">
        <form action={updateContact} className="space-y-5">
          <BField label="E-mail"><BInput name="email" type="email" defaultValue={b.email} autoComplete="email" /></BField>
          <BField label="Telefone / WhatsApp" hint="Com DDD."><BInput name="phone" type="tel" defaultValue={b.phone} autoComplete="tel" /></BField>
          <BField label="Endereço"><BTextarea name="address" rows={2} defaultValue={b.address} autoComplete="street-address" /></BField>
          <BSubmit>Salvar contatos</BSubmit>
        </form>
      </BCard>
    </>
  );
}

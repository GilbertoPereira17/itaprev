import { AccessShell } from "../../shell";
import { BAlert, BField, BInput, BSubmit } from "@/components/beneficiary/ui";
import { benefVerifyCode } from "../../actions";

export const metadata = { title: "Código de verificação", robots: { index: false } };

export default async function BenefCode(props: { searchParams: Promise<{ erro?: string }> }) {
  const { erro } = await props.searchParams;
  return (
    <AccessShell title="Verificação em duas etapas">
      <form action={benefVerifyCode} className="space-y-5">
        <p className="text-lg text-slate-700">Abra o aplicativo autenticador no seu celular e digite o código de 6 números.</p>
        {erro === "codigo" && <BAlert>Código incorreto. Confira no aplicativo e tente de novo.</BAlert>}
        <BField label="Código">
          <BInput name="code" required inputMode="numeric" autoComplete="one-time-code" maxLength={6} pattern="\d{6}" autoFocus />
        </BField>
        <BSubmit>Confirmar</BSubmit>
      </form>
    </AccessShell>
  );
}

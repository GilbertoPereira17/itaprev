import { REQUEST_TYPES, requireBeneficiary } from "@/lib/beneficiary";
import { BField, BSelect, BSubmit, BTextarea } from "@/components/beneficiary/ui";
import { createRequest } from "../../actions";
import { BCard, BFlash } from "../../card";

export default async function NewRequest(props: { searchParams: Promise<{ erro?: string; assunto?: string }> }) {
  const sp = await props.searchParams;
  await requireBeneficiary();
  const preset = REQUEST_TYPES[Number(sp.assunto)] ?? "";
  return (
    <>
      <BFlash erro={sp.erro} />
      <BCard title="Nova solicitação">
        <form action={createRequest} className="space-y-5">
          <BField label="Assunto">
            <BSelect name="category" required defaultValue={preset}>
              <option value="" disabled>Escolha</option>
              {REQUEST_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </BSelect>
          </BField>
          <BField label="Descreva o que você precisa"><BTextarea name="body" rows={5} required minLength={10} maxLength={5000} /></BField>
          <BField label="Documentos (opcional)" hint="PDF ou foto, até 10 MB cada, no máximo 5 arquivos.">
            <input type="file" name="attachments" multiple accept="application/pdf,image/jpeg,image/png,image/webp" className="block w-full text-base" />
          </BField>
          <BSubmit>Enviar solicitação</BSubmit>
        </form>
      </BCard>
    </>
  );
}

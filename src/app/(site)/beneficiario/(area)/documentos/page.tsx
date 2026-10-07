import { desc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { DOC_STATUS, DOC_TYPES, requireBeneficiary } from "@/lib/beneficiary";
import { formatBytes } from "@/lib/format";
import { BField, BSelect, BSubmit } from "@/components/beneficiary/ui";
import { uploadDocument } from "../actions";
import { BCard, BFlash } from "../card";

const fmt = (d: Date) => new Date(d).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });
const STATUS_STYLE: Record<string, string> = {
  enviado: "bg-amber-100 text-amber-800",
  aceito: "bg-emerald-100 text-emerald-800",
  recusado: "bg-red-100 text-red-800",
};

export default async function BenefDocuments(props: { searchParams: Promise<{ ok?: string; erro?: string }> }) {
  const sp = await props.searchParams;
  const b = await requireBeneficiary();
  const docs = await db
    .select()
    .from(schema.beneficiaryDocuments)
    .where(eq(schema.beneficiaryDocuments.beneficiaryId, b.id))
    .orderBy(desc(schema.beneficiaryDocuments.createdAt));
  // Agrupa por tipo: a versão mais recente primeiro
  const groups = new Map<string, typeof docs>();
  for (const d of docs) groups.set(d.docType, [...(groups.get(d.docType) ?? []), d]);

  return (
    <>
      <BFlash {...sp} />
      <BCard title="Enviar documento">
        <form action={uploadDocument} className="space-y-5">
          <BField label="Tipo de documento">
            <BSelect name="docType" required defaultValue="">
              <option value="" disabled>Escolha</option>
              {DOC_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </BSelect>
          </BField>
          <BField label="Arquivo" hint="PDF ou foto legível (JPG, PNG), até 10 MB. Enviar de novo o mesmo tipo cria uma nova versão.">
            <input type="file" name="file" required accept="application/pdf,image/jpeg,image/png,image/webp" capture="environment" className="block w-full text-base" />
          </BField>
          <BSubmit>Enviar</BSubmit>
        </form>
      </BCard>
      <BCard title="Meus documentos">
        {groups.size === 0 ? (
          <p className="text-base text-slate-600">Nenhum documento enviado.</p>
        ) : (
          <div className="space-y-5">
            {Array.from(groups.entries()).map(([type, list]) => (
              <div key={type}>
                <h3 className="mb-2 text-base font-bold text-slate-800">{type}</h3>
                <ul className="space-y-2">
                  {list.map((d, i) => (
                    <li key={d.id} className={`flex flex-wrap items-center gap-3 rounded-xl border p-3 ${i ? "border-slate-100 bg-slate-50" : "border-slate-200"}`}>
                      <span className={`rounded-full px-3 py-1 text-sm font-bold ${STATUS_STYLE[d.status]}`}>{DOC_STATUS[d.status]}</span>
                      <a href={`/beneficiario/arquivo/${d.id}`} target="_blank" className="flex-1 text-base font-semibold text-[var(--color-brand-blue)] underline">
                        {d.fileName}
                      </a>
                      <span className="text-sm text-slate-500">
                        versão {d.version} · {fmt(d.createdAt)} · {formatBytes(d.fileSize)}
                      </span>
                      {d.reviewNote && <p className="basis-full text-sm text-slate-700">Observação do Instituto: {d.reviewNote}</p>}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </BCard>
    </>
  );
}

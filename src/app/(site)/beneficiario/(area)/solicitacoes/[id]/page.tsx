import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { ArrowLeft, Paperclip } from "lucide-react";
import { db, schema } from "@/db";
import { requireBeneficiary } from "@/lib/beneficiary";
import { MESSAGE_STATUS, STATUS_COLOR } from "@/lib/messages";
import { formatBytes } from "@/lib/format";
import { BCard, BFlash } from "../../card";

const fmt = (d: Date) => new Date(d).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", dateStyle: "short", timeStyle: "short" });

export default async function RequestDetail(props: { params: Promise<{ id: string }>; searchParams: Promise<{ ok?: string; erro?: string }> }) {
  const [{ id }, sp] = await Promise.all([props.params, props.searchParams]);
  const b = await requireBeneficiary();
  const rid = parseInt(id, 10);
  if (!Number.isFinite(rid)) notFound();
  // Só a própria solicitação (de outro beneficiário → 404)
  const [r] = await db
    .select()
    .from(schema.messages)
    .where(and(eq(schema.messages.id, rid), eq(schema.messages.beneficiaryId, b.id), eq(schema.messages.kind, "requerimento")));
  if (!r) notFound();
  const docs = await db
    .select()
    .from(schema.beneficiaryDocuments)
    .where(and(eq(schema.beneficiaryDocuments.requestId, r.id), eq(schema.beneficiaryDocuments.beneficiaryId, b.id)));

  return (
    <>
      <Link href="/beneficiario/solicitacoes" className="inline-flex items-center gap-1.5 text-base font-semibold text-[var(--color-brand-blue)]">
        <ArrowLeft className="h-5 w-5" aria-hidden /> Minhas solicitações
      </Link>
      <BFlash {...sp} />
      <BCard>
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <h2 className="text-xl font-bold text-slate-900">Protocolo nº {r.protocol}</h2>
          <span className={`rounded-full px-3 py-1 text-sm font-bold ${STATUS_COLOR[r.status] ?? STATUS_COLOR.nova}`}>
            {MESSAGE_STATUS[r.status === "arquivada" ? "respondida" : r.status]}
          </span>
        </div>
        <p className="text-base font-semibold text-slate-700">{r.category}</p>
        <p className="text-sm text-slate-500">Aberta em {fmt(r.createdAt)} · última atualização em {fmt(r.updatedAt)}</p>
        <p className="mt-4 whitespace-pre-wrap text-lg text-slate-800">{r.body}</p>
        {docs.length > 0 && (
          <ul className="mt-4 space-y-2">
            {docs.map((d) => (
              <li key={d.id}>
                <a href={`/beneficiario/arquivo/${d.id}`} target="_blank" className="inline-flex items-center gap-2 text-base font-semibold text-[var(--color-brand-blue)] underline">
                  <Paperclip className="h-4 w-4" aria-hidden /> {d.fileName} ({formatBytes(d.fileSize)})
                </a>
              </li>
            ))}
          </ul>
        )}
      </BCard>
      <BCard title="Resposta do Instituto">
        {r.publicReply ? (
          <p className="whitespace-pre-wrap text-lg text-slate-800">{r.publicReply}</p>
        ) : (
          <p className="text-base text-slate-600">Ainda não há resposta. A equipe está analisando sua solicitação.</p>
        )}
      </BCard>
    </>
  );
}

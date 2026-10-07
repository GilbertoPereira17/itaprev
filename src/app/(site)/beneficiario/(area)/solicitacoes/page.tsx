import Link from "next/link";
import { and, desc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { requireBeneficiary } from "@/lib/beneficiary";
import { MESSAGE_STATUS, STATUS_COLOR } from "@/lib/messages";
import { BCard } from "../card";

const fmt = (d: Date) => new Date(d).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });

export default async function BenefRequests() {
  const b = await requireBeneficiary();
  const rows = await db
    .select()
    .from(schema.messages)
    .where(and(eq(schema.messages.beneficiaryId, b.id), eq(schema.messages.kind, "requerimento")))
    .orderBy(desc(schema.messages.createdAt));
  return (
    <BCard title="Minhas solicitações">
      <Link href="/beneficiario/solicitacoes/nova"
        className="mb-5 inline-flex rounded-xl bg-[var(--color-brand-blue)] px-5 py-3 text-base font-bold text-white hover:bg-[var(--color-brand-navy)]">
        Nova solicitação
      </Link>
      {rows.length === 0 ? (
        <p className="text-base text-slate-600">Nenhuma solicitação ainda.</p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {rows.map((r) => (
            <li key={r.id}>
              <Link href={`/beneficiario/solicitacoes/${r.id}`} className="flex flex-wrap items-center gap-3 py-4 hover:text-[var(--color-brand-blue)]">
                <span className={`rounded-full px-3 py-1 text-sm font-bold ${STATUS_COLOR[r.status] ?? STATUS_COLOR.nova}`}>
                  {MESSAGE_STATUS[r.status === "arquivada" ? "respondida" : r.status]}
                </span>
                <span className="flex-1 text-base font-semibold">{r.category}</span>
                <span className="text-sm text-slate-500">nº {r.protocol} · {fmt(r.createdAt)}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </BCard>
  );
}

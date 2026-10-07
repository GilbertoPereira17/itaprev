import Link from "next/link";
import { and, desc, eq } from "drizzle-orm";
import { ExternalLink, FileText, MessageSquare, Receipt, UserCheck } from "lucide-react";
import { db, schema } from "@/db";
import { BENEF_KIND, requireBeneficiary } from "@/lib/beneficiary";
import { formatDateBr, maskCpf } from "@/lib/cpf";
import { decryptText } from "@/lib/data-crypto";
import { getSettings } from "@/lib/content";
import { buildInfo } from "@/lib/site-info";
import { MESSAGE_STATUS, STATUS_COLOR } from "@/lib/messages";
import { BCard, BFlash } from "./card";

const WELCOME: Record<string, string> = {
  bemvindo: "Senha criada! Bem-vindo(a) à Área do Beneficiário.",
  senha: "Senha redefinida com sucesso.",
};

export default async function BenefHome(props: { searchParams: Promise<{ ok?: string }> }) {
  const { ok } = await props.searchParams;
  const b = await requireBeneficiary();
  const info = buildInfo(await getSettings());
  const requests = await db
    .select()
    .from(schema.messages)
    .where(and(eq(schema.messages.beneficiaryId, b.id), eq(schema.messages.kind, "requerimento")))
    .orderBy(desc(schema.messages.createdAt))
    .limit(3);

  const data = [
    ["CPF", maskCpf(decryptText(b.cpfEnc))],
    ["Vínculo", BENEF_KIND[b.kind] ?? "—"],
    ["Matrícula / nº do benefício", b.registration || "—"],
    ["Benefício", b.benefit || "—"],
    ["Início do benefício", formatDateBr(b.benefitStart) || "—"],
  ];
  const services = [
    { label: "Holerite (contracheque)", href: info.externalLinks.holeriteSystem, icon: Receipt },
    { label: "Informe de rendimentos", href: info.externalLinks.protecWeb, icon: FileText },
    { label: "Recadastramento", href: info.externalLinks.censoManual, icon: UserCheck },
  ];

  return (
    <>
      {ok && <BFlash ok={WELCOME[ok] ?? ok} />}
      <BCard title="Meu cadastro">
        <dl className="grid gap-4 sm:grid-cols-2">
          {data.map(([k, v]) => (
            <div key={k}>
              <dt className="text-sm font-semibold text-slate-500">{k}</dt>
              <dd className="text-lg text-slate-900">{v}</dd>
            </div>
          ))}
        </dl>
        <Link href="/beneficiario/dados" className="mt-5 inline-block text-base font-semibold text-[var(--color-brand-blue)] underline">
          Ver e atualizar meus dados
        </Link>
      </BCard>

      <BCard title="Serviços">
        <div className="grid gap-3 sm:grid-cols-3">
          {services.map((s) => (
            <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 text-base font-semibold text-slate-800 hover:border-[var(--color-brand-blue)]">
              <s.icon className="h-6 w-6 shrink-0 text-[var(--color-brand-blue)]" aria-hidden />
              <span className="flex-1">{s.label}</span>
              <ExternalLink className="h-4 w-4 text-slate-400" aria-label="abre em outra janela" />
            </a>
          ))}
        </div>
        <p className="mt-3 text-sm text-slate-500">Esses serviços abrem nos sistemas atuais do Instituto.</p>
      </BCard>

      <BCard title="Minhas solicitações">
        {requests.length === 0 ? (
          <p className="text-base text-slate-600">Você ainda não abriu nenhuma solicitação.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {requests.map((r) => (
              <li key={r.id}>
                <Link href={`/beneficiario/solicitacoes/${r.id}`} className="flex flex-wrap items-center gap-3 py-3 hover:text-[var(--color-brand-blue)]">
                  <span className={`rounded-full px-3 py-1 text-sm font-bold ${STATUS_COLOR[r.status] ?? STATUS_COLOR.nova}`}>
                    {MESSAGE_STATUS[r.status === "arquivada" ? "respondida" : r.status]}
                  </span>
                  <span className="flex-1 text-base font-semibold">{r.category}</span>
                  <span className="text-sm text-slate-500">nº {r.protocol}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
        <Link href="/beneficiario/solicitacoes/nova"
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[var(--color-brand-blue)] px-5 py-3 text-base font-bold text-white hover:bg-[var(--color-brand-navy)]">
          <MessageSquare className="h-5 w-5" aria-hidden /> Nova solicitação
        </Link>
      </BCard>
    </>
  );
}

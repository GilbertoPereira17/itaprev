import React from "react";
import { Users2, ShieldCheck, TrendingUp, FileText } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";

const councils = [
  {
    id: "administracao",
    docs: "/documentos/conselho-de-administracao",
    icon: Users2,
    title: "Conselho de Administração",
    subtitle: "Deliberação superior e fixação das diretrizes gerais do Instituto.",
    text: "Composto por representantes dos servidores ativos, aposentados e indicados pelo Poder Executivo Municipal, aprova a política de investimentos, o orçamento anual e as diretrizes do RPPS.",
    cta: "Consultar atas do Conselho",
  },
  {
    id: "fiscal",
    docs: "/documentos/conselho-fiscal",
    icon: ShieldCheck,
    title: "Conselho Fiscal",
    subtitle: "Fiscalização e controle da gestão financeira e contábil.",
    text: "Examina os balancetes mensais, o balanço anual e o cumprimento das metas, emitindo pareceres sobre a execução orçamentária do Itanhaém Prev.",
    cta: "Ver pareceres fiscais",
  },
  {
    id: "investimentos",
    docs: "/documentos/comite-de-investimentos",
    icon: TrendingUp,
    title: "Comitê de Investimentos",
    subtitle: "Gestão técnica de alocação de ativos e enquadramento CMN.",
    text: "Órgão técnico com profissionais certificados que analisa cenário macroeconômico, risco, liquidez e rentabilidade dos fundos onde o patrimônio do RPPS está aplicado.",
    cta: "Relatórios de investimento",
  },
];

export default function ConselhosPage() {
  return (
    <div className="bg-white py-10 sm:py-12">
      <div className="mx-auto max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
        <PageHero
          breadcrumb="Conselhos & Comitê"
          eyebrow="Governança"
          title="Conselhos e Comitê de Investimentos"
          description="Acompanhe as decisões, atas de reuniões, cronogramas e pareceres dos órgãos colegiados do Itanhaém Prev."
        />

        <div className="space-y-6">
          {councils.map((c) => (
            <section
              key={c.id}
              id={c.id}
              className="scroll-mt-28 space-y-5 rounded-md border border-slate-200 bg-white p-8 sm:p-10"
            >
              <div className="flex items-center gap-4">
                <div className="shrink-0  rounded-md text-[var(--color-brand-blue)]">
                  <c.icon className="h-7 w-7" strokeWidth={2} aria-hidden />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">{c.title}</h2>
                  <p className="text-sm text-slate-500">{c.subtitle}</p>
                </div>
              </div>

              <p className="leading-relaxed text-slate-600">{c.text}</p>

              <a
                href={c.docs}
                className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-brand-blue)] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[var(--color-brand-navy)]"
              >
                <FileText className="h-4 w-4" aria-hidden />
                <span>{c.cta}</span>
                
              </a>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

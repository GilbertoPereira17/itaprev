import React from "react";
import Link from "next/link";
import { FileText, DollarSign, UserCheck, Calculator, ExternalLink, Phone } from "lucide-react";
import { INSTITUTION_INFO } from "@/data/institution";
import { PageHero } from "@/components/layout/PageHero";

const beneficiaryCards = [
  {
    icon: FileText,
    title: "Holerite Online",
    text: "Acesse seus contracheques mensais e comprovantes emitidos pelo sistema Servidor Online.",
    cta: "Acessar Holerite",
    href: INSTITUTION_INFO.externalLinks.holeriteSystem,
  },
  {
    icon: DollarSign,
    title: "Informe de IR (IRPF)",
    text: "Baixe seu informe anual de rendimentos para a declaração do Imposto de Renda no Portal do Segurado.",
    cta: "Emitir Informe",
    href: INSTITUTION_INFO.externalLinks.protecWeb,
  },
  {
    icon: UserCheck,
    title: "Prova de Vida & Censo",
    text: "Consulte as regras do recadastramento anual obrigatório e acesse o guia de preenchimento.",
    cta: "Manual do Censo",
    href: INSTITUTION_INFO.externalLinks.censoManual,
  },
];

export default function SeguradosPage() {
  return (
    <div className="bg-white py-10 sm:py-12">
      <div className="mx-auto max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
        <PageHero
          breadcrumb="Espaço do Segurado"
          eyebrow="Serviços e direitos"
          title="Central do Segurado"
          description="Orientações e atalhos diretos para aposentados, pensionistas e servidores ativos do Município de Itanhaém."
        />

        {/* Aposentados & Pensionistas */}
        <section
          id="aposentados"
          className="scroll-mt-28 space-y-6 rounded-md border border-slate-200 bg-white p-8 sm:p-10"
        >
          <span id="pensionistas" className="block scroll-mt-28" />
          <div className="border-b border-slate-100 pb-4">
            <span className="text-sm font-semibold text-slate-500">
              Beneficiários
            </span>
            <h2 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
              Aposentados & Pensionistas
            </h2>
            <p className="mt-1 text-sm text-slate-600 sm:text-base">
              Consulte seus pagamentos, emita o informe de imposto de renda e realize o recadastramento anual.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {beneficiaryCards.map((card) => (
              <div
                key={card.title}
                className="flex flex-col justify-between rounded-md border border-slate-200 bg-[var(--color-bg)] p-6"
              >
                <div className="space-y-3">
                  <div className=" text-[var(--color-brand-blue)]">
                    <card.icon className="h-6 w-6" strokeWidth={2} aria-hidden />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{card.title}</h3>
                  <p className="text-sm text-slate-600">{card.text}</p>
                </div>
                <a
                  href={card.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex items-center justify-between rounded-xl bg-[var(--color-brand-blue)] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[var(--color-brand-navy)]"
                >
                  <span>{card.cta}</span>
                  <ExternalLink className="h-4 w-4" aria-hidden />
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* Servidores Ativos */}
        <section
          id="ativos"
          className="scroll-mt-28 space-y-6 rounded-md border border-slate-200 bg-white p-8 sm:p-10"
        >
          <span id="requerimentos" className="block scroll-mt-28" />
          <div className="border-b border-slate-100 pb-4">
            <span className="text-sm font-semibold text-slate-500">
              Servidores efetivos
            </span>
            <h2 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
              Servidores Públicos Ativos
            </h2>
            <p className="mt-1 text-sm text-slate-600 sm:text-base">
              Informações sobre tempo de contribuição, certidões e planejamento da aposentadoria.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-3 rounded-md border border-slate-200 bg-[var(--color-bg)] p-6">
              <div className=" text-[var(--color-brand-blue)]">
                <Calculator className="h-6 w-6" strokeWidth={2} aria-hidden />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Regras de Aposentadoria</h3>
              <p className="text-sm leading-relaxed text-slate-600">
                Consulte os requisitos de idade mínima e tempo de contribuição previstos na legislação
                municipal de Itanhaém e nas emendas constitucionais vigentes.
              </p>
              <a
                href={INSTITUTION_INFO.contacts.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 pt-1 text-sm font-bold text-[var(--color-brand-blue)] hover:underline"
              >
                <Phone className="h-3.5 w-3.5" aria-hidden />
                <span>Tirar dúvidas com o atendimento</span>
              </a>
            </div>

            <div className="space-y-3 rounded-md border border-slate-200 bg-[var(--color-bg)] p-6">
              <div className=" text-[var(--color-brand-blue)]">
                <FileText className="h-6 w-6" strokeWidth={2} aria-hidden />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Certidão de Tempo de Contribuição</h3>
              <p className="text-sm leading-relaxed text-slate-600">
                Solicite a averbação de períodos trabalhados no regime geral (INSS) ou em outros entes
                públicos para compor seu tempo de serviço.
              </p>
              <Link
                href="/contato"
                className="inline-flex items-center gap-1.5 pt-1 text-sm font-bold text-[var(--color-brand-blue)] hover:underline"
              >
                <span>Ver procedimento de requerimento</span>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

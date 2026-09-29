import React from "react";
import Image from "next/image";
import { Target, Eye, Award, CheckCircle2 } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";

const pillars = [
  {
    icon: Target,
    title: "Missão",
    text: "Assegurar a concessão e o pagamento tempestivo dos benefícios previdenciários aos servidores públicos municipais e seus dependentes, com equilíbrio financeiro e atuarial.",
  },
  {
    icon: Eye,
    title: "Visão",
    text: "Oferecer um atendimento acessível e humano ao segurado, com gestão transparente e informação clara sobre direitos e serviços previdenciários.",
  },
  {
    icon: Award,
    title: "Valores",
    text: "Ética, transparência, responsabilidade fiscal e atuarial, respeito ao servidor e melhoria contínua dos serviços de atendimento.",
  },
];

const proGestao = [
  "Controles internos",
  "Governança e transparência",
  "Educação previdenciária",
];

export default function InstitucionalPage() {
  return (
    <div className="bg-white py-10 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <PageHero
          breadcrumb="Institucional"
          eyebrow="Sobre o Instituto"
          title="Instituto de Previdência dos Servidores de Itanhaém"
          description="Autarquia municipal responsável pela gestão do Regime Próprio de Previdência Social (RPPS), assegurando a concessão e manutenção dos benefícios de aposentadoria e pensão."
        />

        {/* Missão, Visão e Valores */}
        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
          {pillars.map((p) => (
            <div
              key={p.title}
              className="space-y-4 rounded-md border border-slate-200 bg-white p-8"
            >
              <div className=" text-[var(--color-brand-blue)]">
                <p.icon className="h-6 w-6" strokeWidth={2} aria-hidden />
              </div>
              <h2 className="text-xl font-bold text-slate-900">{p.title}</h2>
              <p className="text-sm leading-relaxed text-slate-600">{p.text}</p>
            </div>
          ))}
        </div>

        {/* Certificação Pró-Gestão */}
        <div
          id="certificacao"
          className="mt-8 grid scroll-mt-28 grid-cols-1 items-center gap-8 rounded-md border border-slate-200 bg-white p-8 sm:p-12 lg:grid-cols-12"
        >
          <div className="flex justify-center lg:col-span-4">
            <Image
              src="/images/selo-300x300-pro-gestao-2.png"
              alt="Selo Pró-Gestão RPPS Nível II"
              width={190}
              height={190}
              className="h-44 w-44 object-contain sm:h-48 sm:w-48"
            />
          </div>

          <div className="space-y-4 lg:col-span-8">
            <div className="inline-flex items-center gap-2 text-sm font-bold text-slate-600">
              <Award className="h-5 w-5" aria-hidden />
              <span>Programa de Certificação Institucional</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              Certificação Pró-Gestão RPPS — Nível II
            </h2>
            <p className="text-sm leading-relaxed text-slate-600 sm:text-base">
              O Pró-Gestão RPPS é um programa do Ministério da Previdência que incentiva os regimes
              próprios a adotarem melhores práticas de gestão. O Itanhaém Prev é certificado no Nível
              II, atestando a adoção de controles internos, governança e ações de educação
              previdenciária na administração dos recursos.
            </p>
            <div className="flex flex-wrap gap-x-5 gap-y-2 pt-1 text-sm font-semibold text-slate-700">
              {proGestao.map((item) => (
                <span key={item} className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-[var(--color-brand-blue)]" aria-hidden />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import React from "react";
import Link from "next/link";
import { ChevronRight, UserRound, HeartHandshake, BriefcaseBusiness, Landmark, type LucideIcon } from "lucide-react";
import type { SiteInfo } from "@/lib/site-info";

type ProfileLink = { label: string; href: string };

/** Atendimento organizado por perfil de quem acessa */
export function ServicesGrid({ info }: { info: SiteInfo }) {
  const L = info.externalLinks;
  const profiles: { title: string; href: string; icon: LucideIcon; links: ProfileLink[] }[] = [
    {
      title: "Aposentados",
      href: "/aposentados",
      icon: UserRound,
      links: [
        { label: "Consultar holerite", href: L.holeriteSystem },
        { label: "Informe de rendimentos", href: L.protecWeb },
        { label: "Recadastramento anual", href: L.censoManual },
        { label: "Orientações ao aposentado", href: "/aposentados" },
      ],
    },
    {
      title: "Pensionistas",
      href: "/pensionistas",
      icon: HeartHandshake,
      links: [
        { label: "Consultar holerite", href: L.holeriteSystem },
        { label: "Recadastramento anual", href: L.censoManual },
        { label: "Informe de rendimentos", href: L.protecWeb },
        { label: "Orientações ao pensionista", href: "/pensionistas" },
      ],
    },
    {
      title: "Servidores ativos",
      href: "/ativos",
      icon: BriefcaseBusiness,
      links: [
        { label: "Regras de aposentadoria", href: "/ativos" },
        { label: "Certidão de tempo de contribuição", href: "/contato" },
        { label: "Legislação municipal", href: "/documentos/legislacao" },
        { label: "Consultar holerite", href: L.holeriteSystem },
      ],
    },
    {
      title: "Cidadão",
      href: "/transparencia",
      icon: Landmark,
      links: [
        { label: "Transparência e prestação de contas", href: "/transparencia" },
        { label: "Atas dos conselhos", href: "/conselhos" },
        { label: "Investimentos", href: "/documentos/investimentos" },
        { label: "Ouvidoria", href: "/contato#ouvidoria" },
      ],
    },
  ];

  return (
    <section id="servicos" aria-labelledby="servicos-titulo" className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <h2 id="servicos-titulo" className="text-2xl font-bold text-slate-900 sm:text-3xl">
          Atendimento por perfil
        </h2>
        <p className="mt-2 max-w-2xl text-slate-600">Encontre os serviços e informações de acordo com a sua situação.</p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {profiles.map((p) => (
            <div key={p.title} className="rounded-lg border border-slate-200 border-t-4 border-t-[var(--color-brand-blue)] bg-white p-6">
              <p.icon className="h-8 w-8 text-[var(--color-brand-blue)]" strokeWidth={1.75} aria-hidden />
              <h3 className="mt-3 text-xl font-bold text-slate-900">
                <Link href={p.href} className="hover:text-[var(--color-brand-blue)]">
                  {p.title}
                </Link>
              </h3>
              <ul className="mt-4 space-y-1">
                {p.links.map((l) => {
                  const external = /^https?:\/\//.test(l.href);
                  return (
                    <li key={l.label}>
                      <a
                        href={l.href}
                        target={external ? "_blank" : undefined}
                        rel={external ? "noopener noreferrer" : undefined}
                        className="group flex items-center justify-between gap-2 py-2 text-[15px] text-slate-700 hover:text-[var(--color-brand-blue)]"
                      >
                        {l.label}
                        <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 group-hover:text-[var(--color-brand-blue)]" aria-hidden />
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

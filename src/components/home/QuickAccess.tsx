import React from "react";
import { FileText, Receipt, UserCheck, FolderOpen, ArrowUpRight } from "lucide-react";
import type { SiteInfo } from "@/lib/site-info";

/** Serviços mais procurados pelo segurado, logo abaixo do banner */
export function QuickAccess({ info }: { info: SiteInfo }) {
  const items = [
    { title: "Holerite", desc: "Consulte seu contracheque mensal", href: info.externalLinks.holeriteSystem, icon: FileText, external: true },
    { title: "Informe de Rendimentos", desc: "Documento para o Imposto de Renda", href: info.externalLinks.protecWeb, icon: Receipt, external: true },
    { title: "Recadastramento", desc: "Prova de vida anual obrigatória", href: info.externalLinks.censoManual, icon: UserCheck, external: true },
    { title: "Transparência", desc: "Atas, relatórios e prestação de contas", href: "/transparencia", icon: FolderOpen, external: false },
  ];

  return (
    <section aria-labelledby="acesso-rapido" className="relative bg-[var(--color-bg)]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h2 id="acesso-rapido" className="text-2xl font-bold text-slate-900">
          Serviços mais acessados
        </h2>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((it) => (
            <a
              key={it.title}
              href={it.href}
              target={it.external ? "_blank" : undefined}
              rel={it.external ? "noopener noreferrer" : undefined}
              className="group flex flex-col rounded-lg border border-slate-200 bg-white p-6 transition-colors hover:border-[var(--color-brand-blue)]"
            >
              <div className="flex items-start justify-between">
                <span className="flex h-14 w-14 items-center justify-center rounded-lg bg-[var(--color-brand-blue)] text-white transition-colors group-hover:bg-[var(--color-brand-navy)]">
                  <it.icon className="h-7 w-7" strokeWidth={1.75} aria-hidden />
                </span>
                <ArrowUpRight
                  className="h-5 w-5 text-slate-300 transition-colors group-hover:text-[var(--color-brand-blue)]"
                  aria-label={it.external ? "abre em outro site" : undefined}
                />
              </div>
              <span className="mt-5 text-lg font-bold text-slate-900 group-hover:text-[var(--color-brand-blue)]">{it.title}</span>
              <span className="mt-1 text-[15px] text-slate-600">{it.desc}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

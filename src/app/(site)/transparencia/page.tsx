import Link from "next/link";
import { ArrowRight, ExternalLink, FolderOpen } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import { getNavSections, getSettings } from "@/lib/content";

export const metadata = { title: "Transparência" };

export default async function TransparenciaPage() {
  const [sections, settings] = await Promise.all([getNavSections(), getSettings()]);
  const areas = Array.from(new Set(sections.map((s) => s.area)));
  const portal = settings["link.transparencia"];

  return (
    <div className="bg-white py-10 sm:py-12">
      <div className="mx-auto max-w-7xl space-y-12 px-4 sm:px-6 lg:px-8">
        <PageHero
          breadcrumb="Transparência"
          eyebrow="Prestação de contas"
          title="Transparência e documentos oficiais"
          description="Atas, relatórios, demonstrativos, legislação e investimentos do Instituto, organizados por assunto."
        />

        {areas.map((area) => (
          <section key={area} className="space-y-5">
            <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900 sm:text-2xl">
              {area}
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {sections
                .filter((s) => s.area === area)
                .map((s) => (
                  <Link
                    key={s.slug}
                    href={`/documentos/${s.slug}`}
                    className="group flex min-h-[88px] items-center gap-4 rounded-md border border-slate-200 bg-white p-5 transition-all hover:border-[var(--color-brand-blue)]"
                  >
                    <span className="shrink-0 text-[var(--color-brand-blue)]">
                      <FolderOpen className="h-6 w-6" aria-hidden />
                    </span>
                    <span className="flex-1 font-bold text-slate-900 group-hover:text-[var(--color-brand-blue)]">{s.title}</span>
                    <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-[var(--color-brand-blue)]" aria-hidden />
                  </Link>
                ))}
            </div>
          </section>
        ))}

        {sections.length === 0 && (
          <p className="rounded-md border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
            Os documentos estão sendo organizados e serão publicados em breve.
          </p>
        )}

        {portal && (
          <a
            href={portal}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between gap-4 rounded-md bg-[var(--color-brand-navy)] p-6 text-white transition-colors hover:bg-[var(--color-brand-blue)]"
          >
            <span>
              <span className="block text-lg font-bold">Portal da Transparência</span>
              <span className="text-sm text-slate-300">Receitas, despesas e dados em tempo real</span>
            </span>
            <ExternalLink className="h-5 w-5 shrink-0" aria-hidden />
          </a>
        )}
      </div>
    </div>
  );
}

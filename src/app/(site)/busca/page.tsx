import Link from "next/link";
import { FileText, Newspaper, File } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import { SearchBox } from "@/components/content/SearchBox";
import { searchSite } from "@/lib/content";
import { formatDate, mediaUrl } from "@/lib/format";

export const metadata = { title: "Buscar no site", robots: { index: false } };

function Group({ title, icon: Icon, count, children }: { title: string; icon: typeof File; count: number; children: React.ReactNode }) {
  if (!count) return null;
  return (
    <section className="space-y-3">
      <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
        <Icon className="h-5 w-5 text-[var(--color-brand-blue)]" aria-hidden /> {title}
        <span className="text-sm font-normal text-slate-500">({count})</span>
      </h2>
      <ul className="divide-y divide-slate-100 rounded-md border border-slate-200 bg-white">{children}</ul>
    </section>
  );
}

export default async function BuscaPage(props: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await props.searchParams;
  const query = q.trim().slice(0, 100);
  const r = query.length >= 2 ? await searchSite(query) : null;
  const total = r ? r.news.length + r.pages.length + r.documents.length : 0;

  return (
    <div className="bg-white py-10 sm:py-12">
      <div className="mx-auto max-w-5xl space-y-8 px-4 sm:px-6 lg:px-8">
        <PageHero
          breadcrumb="Busca"
          eyebrow="Encontre rápido"
          title="Buscar no site"
          description="Procure em notícias, páginas e em todos os documentos publicados (atas, relatórios, legislação, investimentos)."
        />
        <SearchBox defaultValue={query} />

        {r && (
          <p role="status" className="text-slate-600">
            {total === 0 ? (
              <>Nada encontrado para <strong>“{query}”</strong>. Tente outras palavras ou fale com o atendimento.</>
            ) : (
              <><strong>{total}</strong> resultado(s) para <strong>“{query}”</strong>.</>
            )}
          </p>
        )}

        {r && (
          <div className="space-y-8">
            <Group title="Páginas" icon={FileText} count={r.pages.length}>
              {r.pages.map((p) => (
                <li key={p.slug}>
                  <Link href={`/${p.slug}`} className="block px-5 py-4 hover:bg-slate-50">
                    <span className="font-semibold text-[var(--color-brand-blue)]">{p.title}</span>
                    {p.summary && <span className="mt-1 block text-sm text-slate-600">{p.summary}</span>}
                  </Link>
                </li>
              ))}
            </Group>

            <Group title="Documentos" icon={File} count={r.documents.length}>
              {r.documents.map((d) => (
                <li key={d.id} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3">
                  <span className="min-w-0">
                    <a href={mediaUrl(d.filePath)} target="_blank" rel="noopener noreferrer" className="font-semibold text-[var(--color-brand-blue)] hover:underline">
                      {d.title}
                    </a>
                    <span className="block text-sm text-slate-500">{d.section} · {d.group}</span>
                  </span>
                  <Link href={`/documentos/${d.sectionSlug}`} className="text-sm font-semibold text-slate-600 hover:text-[var(--color-brand-blue)]">
                    Ver seção
                  </Link>
                </li>
              ))}
            </Group>

            <Group title="Notícias" icon={Newspaper} count={r.news.length}>
              {r.news.map((n) => (
                <li key={n.id}>
                  <Link href={`/noticias/${n.slug}`} className="block px-5 py-4 hover:bg-slate-50">
                    <span className="text-xs text-slate-500">{formatDate(n.publishedAt)} · {n.category}</span>
                    <span className="block font-semibold text-[var(--color-brand-blue)]">{n.title}</span>
                  </Link>
                </li>
              ))}
            </Group>
          </div>
        )}
      </div>
    </div>
  );
}

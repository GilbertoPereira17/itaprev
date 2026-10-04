import Link from "next/link";
import { Calendar, ChevronRight } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import { SearchBox } from "@/components/content/SearchBox";
import { getAllNews, searchNews } from "@/lib/content";
import { formatDate } from "@/lib/format";

export const metadata = { title: "Notícias e Comunicados" };

export default async function NoticiasPage(props: { searchParams: Promise<{ q?: string }> }) {
  const q = ((await props.searchParams).q ?? "").trim().slice(0, 100);
  const news = q.length >= 2 ? await searchNews(q) : await getAllNews();

  return (
    <div className="bg-white py-10 sm:py-12">
      <div className="mx-auto max-w-5xl space-y-10 px-4 sm:px-6 lg:px-8">
        <PageHero
          breadcrumb="Notícias & Comunicados"
          eyebrow="Comunicados oficiais"
          title="Notícias e Comunicados"
          description="Acompanhe publicações, convocações, editais e informativos do Instituto de Previdência de Itanhaém."
        />

        <SearchBox action="/noticias" defaultValue={q} placeholder="Buscar nas notícias. Ex.: audiência, recadastramento" label="Buscar nas notícias" />
        {q.length >= 2 && (
          <p role="status" className="-mt-4 text-slate-600">
            {news.length} notícia(s) para <strong>“{q}”</strong> ·{" "}
            <Link href="/noticias" className="font-semibold text-[var(--color-brand-blue)] hover:underline">ver todas</Link>
          </p>
        )}

        {news.length === 0 && (
          <p className="rounded-md border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
            {q ? "Nenhuma notícia encontrada. Tente outras palavras." : "Nenhuma notícia publicada ainda."}
          </p>
        )}

        <div className="space-y-6">
          {news.map((n) => (
            <Link
              key={n.id}
              href={`/noticias/${n.slug}`}
              className="group block overflow-hidden rounded-md border border-slate-200 bg-white transition-shadow"
            >
              <div className="space-y-3 p-6 sm:p-8">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-sm font-semibold text-[var(--color-brand-blue)]">
                    {n.category}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                    <Calendar className="h-3.5 w-3.5" aria-hidden />
                    {formatDate(n.publishedAt)}
                  </span>
                </div>
                <h2 className="text-xl font-bold leading-snug text-slate-900 group-hover:text-[var(--color-brand-blue)] sm:text-2xl">
                  {n.title}
                </h2>
                {n.summary && <p className="leading-relaxed text-slate-600">{n.summary}</p>}
                <span className="inline-flex items-center gap-1 text-sm font-bold text-[var(--color-brand-blue)]">
                  Ler comunicado <ChevronRight className="h-4 w-4" aria-hidden />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

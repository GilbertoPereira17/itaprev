import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, Calendar } from "lucide-react";
import { RichText } from "@/components/content/RichText";
import { JsonLd } from "@/components/content/JsonLd";
import { getNewsBySlug } from "@/lib/content";
import { formatDate, mediaUrl } from "@/lib/format";

export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const params = await props.params;
  const n = await getNewsBySlug(params.slug);
  return n ? { title: n.title, description: n.summary } : { title: "Notícia" };
}

export default async function NoticiaPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const n = await getNewsBySlug(params.slug);
  if (!n) notFound();

  return (
    <div className="bg-white py-10 sm:py-12">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "NewsArticle",
          headline: n.title,
          description: n.summary,
          datePublished: new Date(n.publishedAt).toISOString(),
          dateModified: new Date(n.updatedAt).toISOString(),
          ...(n.coverPath ? { image: [mediaUrl(n.coverPath)] } : {}),
          publisher: { "@type": "GovernmentOrganization", name: "Itanhaém Prev" },
        }}
      />
      <article className="mx-auto max-w-3xl space-y-8 px-4 sm:px-6">
        <Link href="/noticias" className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-brand-blue)] hover:underline">
          <ArrowLeft className="h-4 w-4" aria-hidden /> Todas as notícias
        </Link>

        <header className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-semibold text-[var(--color-brand-blue)]">
              {n.category}
            </span>
            <span className="flex items-center gap-1.5 text-sm text-slate-500">
              <Calendar className="h-4 w-4" aria-hidden />
              {formatDate(n.publishedAt)}
            </span>
          </div>
          <h1 className="text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl">{n.title}</h1>
          {n.summary && <p className="text-lg leading-relaxed text-slate-600">{n.summary}</p>}
        </header>

        {n.coverPath && (
          <div className="relative aspect-[16/9] overflow-hidden rounded-md border border-slate-200">
            <Image src={mediaUrl(n.coverPath)} alt="" fill className="object-cover" sizes="(max-width: 768px) 100vw, 768px" />
          </div>
        )}

        <div className="rounded-md border border-slate-200 bg-white p-6 sm:p-10">
          <RichText html={n.content} />
        </div>
      </article>
    </div>
  );
}

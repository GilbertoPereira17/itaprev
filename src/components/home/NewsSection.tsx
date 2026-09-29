import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { BrandMark } from "@/components/layout/BrandMark";

export type NewsCard = {
  id: number | string;
  slug: string;
  category: string;
  date: string;
  title: string;
  summary: string;
  image?: string;
};

/** Imagem da notícia ou, sem capa, um bloco com o grafismo da marca */
function Cover({ image, category, large }: { image?: string; category: string; large?: boolean }) {
  return (
    <div className={`relative overflow-hidden rounded-lg bg-[var(--color-brand-navy)] ${large ? "aspect-[16/9]" : "aspect-[4/3]"}`}>
      {image ? (
        <Image src={image} alt="" fill className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" sizes={large ? "(max-width: 1024px) 100vw, 60vw" : "200px"} />
      ) : (
        <>
          <BrandMark className="absolute -bottom-6 -right-4 h-3/4 w-auto opacity-40" />
          {large && <span className="absolute left-5 top-5 text-sm font-semibold text-sky-200">{category}</span>}
        </>
      )}
    </div>
  );
}

export function NewsSection({ items }: { items: NewsCard[] }) {
  if (items.length === 0) return null;
  const [first, ...rest] = items;

  return (
    <section aria-labelledby="noticias-titulo" className="bg-[var(--color-bg)]">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 id="noticias-titulo" className="text-2xl font-bold text-slate-900 sm:text-3xl">
            Notícias e comunicados
          </h2>
          <Link href="/noticias" className="inline-flex items-center gap-1.5 font-semibold text-[var(--color-brand-blue)] hover:underline">
            Todas as notícias <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.3fr_1fr]">
          <article className="group rounded-lg border border-slate-200 bg-white p-4 sm:p-5">
            <Link href={`/noticias/${first.slug}`} className="block">
              <Cover image={first.image} category={first.category} large />
            </Link>
            <div className="px-1 pb-2 pt-5">
              <p className="text-sm text-slate-500">
                <time>{first.date}</time> · <span className="font-semibold text-[var(--color-brand-blue)]">{first.category}</span>
              </p>
              <h3 className="mt-2 text-2xl font-bold leading-snug text-slate-900">
                <Link href={`/noticias/${first.slug}`} className="hover:text-[var(--color-brand-blue)]">
                  {first.title}
                </Link>
              </h3>
              {first.summary && <p className="mt-3 text-[17px] leading-relaxed text-slate-600 line-clamp-3">{first.summary}</p>}
            </div>
          </article>

          <ul className="space-y-4">
            {rest.map((n) => (
              <li key={n.id}>
                <Link href={`/noticias/${n.slug}`} className="group grid grid-cols-[112px_1fr] gap-4 rounded-lg border border-slate-200 bg-white p-3 hover:border-[var(--color-brand-blue)] sm:grid-cols-[140px_1fr]">
                  <Cover image={n.image} category={n.category} />
                  <div className="py-1 pr-2">
                    <p className="text-sm text-slate-500">
                      <time>{n.date}</time> · {n.category}
                    </p>
                    <h3 className="mt-1 font-semibold leading-snug text-slate-900 group-hover:text-[var(--color-brand-blue)] line-clamp-3">
                      {n.title}
                    </h3>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

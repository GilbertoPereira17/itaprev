import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { RichText } from "@/components/content/RichText";
import { getPage } from "@/lib/content";

/** Páginas de texto editáveis no painel (ex.: /aposentados, /pensionistas, /pro-gestao) */
export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const params = await props.params;
  const page = await getPage(params.slug);
  return { title: page?.title ?? "Página" };
}

export default async function EditablePage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const page = await getPage(params.slug);
  if (!page) notFound();

  return (
    <div className="bg-white py-10 sm:py-12">
      <div className="mx-auto max-w-5xl space-y-10 px-4 sm:px-6 lg:px-8">
        <PageHero
          breadcrumb={page.title}
          eyebrow="Itanhaém Prev"
          title={page.title}
          description={page.summary || " "}
        />
        <article className="rounded-md border border-slate-200 bg-white p-6 sm:p-10">
          <RichText html={page.content} />
        </article>
      </div>
    </div>
  );
}

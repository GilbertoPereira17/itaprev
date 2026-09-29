import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { DocumentBrowser } from "@/components/content/DocumentBrowser";
import { getDocSection } from "@/lib/content";
import { formatBytes, mediaUrl } from "@/lib/format";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const section = await getDocSection(params.slug);
  return { title: section?.title ?? "Documentos" };
}

export default async function DocumentSectionPage({ params }: { params: { slug: string } }) {
  const section = await getDocSection(params.slug);
  if (!section) notFound();

  const groups = section.groups.map((g) => ({
    id: g.id,
    title: g.title,
    documents: g.documents.map((d) => ({
      id: d.id,
      title: d.title,
      url: mediaUrl(d.filePath),
      size: formatBytes(d.fileSize),
      ext: d.mimeType === "text/html" ? "link" : (d.filePath.split(".").pop() || "pdf").slice(0, 4),
    })),
  }));

  return (
    <div className="bg-white py-10 sm:py-12">
      <div className="mx-auto max-w-5xl space-y-10 px-4 sm:px-6 lg:px-8">
        <PageHero
          breadcrumb={section.title}
          eyebrow={section.area}
          title={section.title}
          description={section.description || "Documentos oficiais publicados pelo Itanhaém Prev, em cumprimento à Lei de Acesso à Informação."}
        />
        <DocumentBrowser groups={groups} />
      </div>
    </div>
  );
}

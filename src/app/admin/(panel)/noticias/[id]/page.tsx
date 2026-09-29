import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { Flash, PageHeader } from "@/components/admin/ui";
import { NewsForm } from "../NewsForm";

export default async function EditNewsPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { ok?: string; erro?: string };
}) {
  const [item] = await db.select().from(schema.news).where(eq(schema.news.id, Number(params.id)));
  if (!item) notFound();

  return (
    <>
      <PageHeader title="Editar notícia" description={item.published ? `Publicada em /noticias/${item.slug}` : "Rascunho (não aparece no site)"} />
      <Flash {...searchParams} />
      <NewsForm item={item} />
    </>
  );
}

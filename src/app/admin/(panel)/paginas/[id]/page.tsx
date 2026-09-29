import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { Flash, PageHeader } from "@/components/admin/ui";
import { PageForm } from "../PageForm";

export default async function EditPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { ok?: string; erro?: string };
}) {
  const [item] = await db.select().from(schema.pages).where(eq(schema.pages.id, Number(params.id)));
  if (!item) notFound();
  return (
    <>
      <PageHeader title={`Editar: ${item.title}`} description={`Endereço no site: /${item.slug}`} />
      <Flash {...searchParams} />
      <PageForm item={item} />
    </>
  );
}

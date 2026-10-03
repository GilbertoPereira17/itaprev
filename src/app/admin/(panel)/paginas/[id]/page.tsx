import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { Flash, PageHeader } from "@/components/admin/ui";
import { PageForm } from "../PageForm";

export default async function EditPage(
  props: {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ ok?: string; erro?: string }>;
  }
) {
  const searchParams = await props.searchParams;
  const params = await props.params;
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

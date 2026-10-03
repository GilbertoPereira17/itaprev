import { Flash, PageHeader } from "@/components/admin/ui";
import { NewsForm } from "../NewsForm";

export default async function NewNewsPage(props: { searchParams: Promise<{ ok?: string; erro?: string }> }) {
  const searchParams = await props.searchParams;
  return (
    <>
      <PageHeader title="Nova notícia" />
      <Flash {...searchParams} />
      <NewsForm />
    </>
  );
}

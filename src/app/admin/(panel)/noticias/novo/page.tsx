import { Flash, PageHeader } from "@/components/admin/ui";
import { NewsForm } from "../NewsForm";

export default function NewNewsPage({ searchParams }: { searchParams: { ok?: string; erro?: string } }) {
  return (
    <>
      <PageHeader title="Nova notícia" />
      <Flash {...searchParams} />
      <NewsForm />
    </>
  );
}

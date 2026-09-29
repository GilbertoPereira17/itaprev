import { Flash, PageHeader } from "@/components/admin/ui";
import { PageForm } from "../PageForm";

export default function NewPage({ searchParams }: { searchParams: { ok?: string; erro?: string } }) {
  return (
    <>
      <PageHeader title="Nova página" />
      <Flash {...searchParams} />
      <PageForm />
    </>
  );
}

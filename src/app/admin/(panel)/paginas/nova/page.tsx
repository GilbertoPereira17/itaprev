import { Flash, PageHeader } from "@/components/admin/ui";
import { PageForm } from "../PageForm";

export default async function NewPage(props: { searchParams: Promise<{ ok?: string; erro?: string }> }) {
  const searchParams = await props.searchParams;
  return (
    <>
      <PageHeader title="Nova página" />
      <Flash {...searchParams} />
      <PageForm />
    </>
  );
}

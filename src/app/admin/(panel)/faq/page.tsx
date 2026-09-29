import { asc } from "drizzle-orm";
import { db, schema } from "@/db";
import type { Faq } from "@/db/schema";
import { Card, Checkbox, DeleteButton, Field, Flash, Input, PageHeader, SubmitButton, Textarea } from "@/components/admin/ui";
import { deleteFaq, saveFaq } from "./actions";

function FaqForm({ faq, nextOrder }: { faq?: Faq; nextOrder: number }) {
  return (
    <form action={saveFaq} className="space-y-3">
      {faq && <input type="hidden" name="id" value={faq.id} />}
      <div className="grid gap-3 sm:grid-cols-[1fr_100px]">
        <Field label="Pergunta"><Input name="question" required defaultValue={faq?.question} /></Field>
        <Field label="Ordem"><Input type="number" name="sortOrder" defaultValue={faq?.sortOrder ?? nextOrder} /></Field>
      </div>
      <Field label="Resposta"><Textarea name="answer" rows={3} required defaultValue={faq?.answer} /></Field>
      <div className="flex items-center justify-between">
        <Checkbox name="active" label="Visível no site" defaultChecked={faq?.active ?? true} />
        <SubmitButton>{faq ? "Salvar" : "Adicionar pergunta"}</SubmitButton>
      </div>
    </form>
  );
}

export default async function AdminFaq({ searchParams }: { searchParams: { ok?: string; erro?: string } }) {
  const faqs = await db.select().from(schema.faqs).orderBy(asc(schema.faqs.sortOrder), asc(schema.faqs.id));
  return (
    <>
      <PageHeader title="Perguntas frequentes" description="Dúvidas exibidas na página inicial." />
      <Flash {...searchParams} />
      <div className="space-y-4">
        {faqs.map((f) => (
          <Card key={f.id}>
            <FaqForm faq={f} nextOrder={0} />
            <form action={deleteFaq} className="mt-1 text-right">
              <input type="hidden" name="id" value={f.id} />
              <DeleteButton confirmText="Excluir esta pergunta?" />
            </form>
          </Card>
        ))}
        <Card>
          <h2 className="mb-4 font-bold text-slate-900">Nova pergunta</h2>
          <FaqForm nextOrder={faqs.length} />
        </Card>
      </div>
    </>
  );
}

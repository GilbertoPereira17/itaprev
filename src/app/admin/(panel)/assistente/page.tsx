import Link from "next/link";
import { and, asc, count, desc, eq, gte } from "drizzle-orm";
import { db, schema } from "@/db";
import type { ChatbotKnowledge } from "@/db/schema";
import { Card, Checkbox, DeleteButton, Field, Flash, Input, PageHeader, SubmitButton, Textarea } from "@/components/admin/ui";
import { CHAT_LOG_RETENTION_DAYS } from "@/lib/chatbot";
import { deleteKnowledge, saveKnowledge } from "./actions";

const fmt = (d: Date) =>
  new Date(d).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", dateStyle: "short", timeStyle: "short" });

function KnowledgeForm({ item, nextOrder }: { item?: ChatbotKnowledge; nextOrder: number }) {
  return (
    <form action={saveKnowledge} className="space-y-3">
      {item && <input type="hidden" name="id" value={item.id} />}
      <div className="grid gap-3 sm:grid-cols-[1fr_100px]">
        <Field label="Assunto"><Input name="title" required defaultValue={item?.title} placeholder="Ex.: Recadastramento 2026" /></Field>
        <Field label="Ordem"><Input type="number" name="sortOrder" defaultValue={item?.sortOrder ?? nextOrder} /></Field>
      </div>
      <Field label="O que a Ita deve saber" hint="Escreva como explicaria a um segurado: prazos, documentos, onde ir. Até 4.000 caracteres.">
        <Textarea name="content" rows={4} required maxLength={4000} defaultValue={item?.content} />
      </Field>
      <div className="flex items-center justify-between gap-3">
        {item ? <Checkbox name="active" label="Em uso pela Ita" defaultChecked={item.active} /> : <span />}
        <SubmitButton>{item ? "Salvar" : "Adicionar informação"}</SubmitButton>
      </div>
    </form>
  );
}

export default async function AdminAssistente(props: { searchParams: Promise<{ ok?: string; erro?: string; ver?: string }> }) {
  const searchParams = await props.searchParams;
  const onlyFailed = searchParams.ver === "sem-resposta";
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const [items, logs, [total], [failed]] = await Promise.all([
    db.select().from(schema.chatbotKnowledge).orderBy(asc(schema.chatbotKnowledge.sortOrder), asc(schema.chatbotKnowledge.id)),
    db
      .select()
      .from(schema.chatLogs)
      .where(onlyFailed ? eq(schema.chatLogs.answered, false) : undefined)
      .orderBy(desc(schema.chatLogs.createdAt))
      .limit(100),
    db.select({ n: count() }).from(schema.chatLogs).where(gte(schema.chatLogs.createdAt, since)),
    db.select({ n: count() }).from(schema.chatLogs).where(and(gte(schema.chatLogs.createdAt, since), eq(schema.chatLogs.answered, false))),
  ]);

  return (
    <>
      <PageHeader
        title="Assistente virtual (Ita)"
        description="O que a Ita sabe e o que os segurados perguntam. Ela também usa as Perguntas frequentes e os Contatos e links do painel."
      />
      <Flash {...searchParams} />

      <h2 className="mb-3 text-lg font-bold text-slate-900">Base de conhecimento</h2>
      <div className="space-y-4">
        {items.map((k) => (
          <Card key={k.id}>
            <KnowledgeForm item={k} nextOrder={0} />
            <form action={deleteKnowledge} className="mt-1 text-right">
              <input type="hidden" name="id" value={k.id} />
              <DeleteButton confirmText={`Excluir "${k.title}"?`} />
            </form>
          </Card>
        ))}
        <Card>
          <h3 className="mb-4 font-bold text-slate-900">Nova informação</h3>
          <KnowledgeForm nextOrder={items.length} />
        </Card>
      </div>

      <div className="mb-3 mt-10 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Conversas</h2>
          <p className="text-sm text-slate-500">
            Últimos 30 dias: {total.n} perguntas · {failed.n} sem resposta. CPF, e-mail e telefone são ocultados; o registro é apagado após{" "}
            {CHAT_LOG_RETENTION_DAYS} dias.
          </p>
        </div>
        <div className="flex gap-2 text-sm font-semibold">
          <Link href="/admin/assistente" className={`rounded-full px-4 py-2 ${!onlyFailed ? "bg-[var(--color-brand-blue)] text-white" : "bg-white ring-1 ring-slate-200"}`}>
            Todas
          </Link>
          <Link href="/admin/assistente?ver=sem-resposta" className={`rounded-full px-4 py-2 ${onlyFailed ? "bg-[var(--color-brand-blue)] text-white" : "bg-white ring-1 ring-slate-200"}`}>
            Sem resposta
          </Link>
        </div>
      </div>
      {logs.length === 0 ? (
        <Card><p className="text-center text-slate-500">Nenhuma conversa registrada.</p></Card>
      ) : (
        <ul className="space-y-2">
          {logs.map((l) => (
            <li key={l.id} className="rounded-2xl border border-slate-200 bg-white p-4 text-sm shadow-sm">
              <p className="text-xs text-slate-500">
                {fmt(l.createdAt)} {!l.answered && <span className="ml-1 rounded-full bg-amber-100 px-2 py-0.5 font-bold text-amber-800">sem resposta</span>}
              </p>
              <p className="mt-1 font-semibold text-slate-900">{l.question}</p>
              {l.answer && <p className="mt-1 whitespace-pre-wrap text-slate-600">{l.answer}</p>}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { and, asc, eq } from "drizzle-orm";
import { ArrowLeft, Paperclip } from "lucide-react";
import { formatBytes } from "@/lib/format";
import { db, schema } from "@/db";
import { Card, Field, Flash, Select, SubmitButton, Textarea } from "@/components/admin/ui";
import { MESSAGE_STATUS, STATUS_COLOR } from "@/lib/messages";
import { updateMessage } from "../actions";

const fmt = (d: Date) =>
  new Date(d).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", dateStyle: "short", timeStyle: "short" });

export default async function AdminMensagem(
  props: {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ ok?: string; erro?: string }>;
  }
) {
  const searchParams = await props.searchParams;
  const params = await props.params;
  const id = parseInt(params.id, 10);
  if (!Number.isFinite(id)) notFound();
  const [m] = await db.select().from(schema.messages).where(eq(schema.messages.id, id));
  if (!m) notFound();
  const attachments = m.beneficiaryId
    ? await db
        .select()
        .from(schema.beneficiaryDocuments)
        .where(and(eq(schema.beneficiaryDocuments.requestId, m.id), eq(schema.beneficiaryDocuments.beneficiaryId, m.beneficiaryId)))
    : [];
  const team = await db
    .select({ id: schema.users.id, name: schema.users.name, active: schema.users.active })
    .from(schema.users)
    .orderBy(asc(schema.users.name));

  const contact = [
    ["Nome", m.name],
    [m.kind === "requerimento" ? "Matrícula / nº do benefício" : "CPF / matrícula", m.document],
    ["Telefone", m.phone],
    ["E-mail", m.email],
  ].filter(([, v]) => v);

  return (
    <>
      <Link href="/admin/mensagens" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-[var(--color-brand-blue)] hover:underline">
        <ArrowLeft className="h-4 w-4" aria-hidden /> Voltar para mensagens
      </Link>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Protocolo nº {m.protocol}</h1>
        <span className={`rounded-full px-3 py-1 text-xs font-bold ${STATUS_COLOR[m.status] ?? STATUS_COLOR.nova}`}>
          {MESSAGE_STATUS[m.status] ?? m.status}
        </span>
      </div>
      <Flash {...searchParams} />

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <Card>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            {m.kind === "ouvidoria" ? "Ouvidoria" : m.kind === "requerimento" ? "Requerimento (Área do Beneficiário)" : "Fale conosco"} · {m.category}
          </p>
          <p className="mt-1 text-sm text-slate-500">Recebida em {fmt(m.createdAt)}</p>
          <p className="mt-5 whitespace-pre-wrap text-[15px] leading-relaxed text-slate-800">{m.body}</p>
          {attachments.length > 0 && (
            <ul className="mt-4 space-y-1.5">
              {attachments.map((d) => (
                <li key={d.id}>
                  <a href={`/admin/beneficiarios/arquivo/${d.id}`} target="_blank" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--color-brand-blue)] hover:underline">
                    <Paperclip className="h-4 w-4" aria-hidden /> {d.fileName} ({formatBytes(d.fileSize)})
                  </a>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <h2 className="mb-3 font-bold text-slate-900">Quem enviou</h2>
          {m.beneficiaryId && (
            <Link href={`/admin/beneficiarios/${m.beneficiaryId}`} className="mb-3 inline-block text-sm font-semibold text-[var(--color-brand-blue)] hover:underline">
              Ver cadastro do beneficiário →
            </Link>
          )}
          {m.anonymous ? (
            <p className="text-sm text-slate-600">Manifestação anônima (sem dados de contato).</p>
          ) : (
            <dl className="space-y-2 text-sm">
              {contact.map(([k, v]) => (
                <div key={k}>
                  <dt className="text-xs font-bold uppercase text-slate-500">{k}</dt>
                  <dd className="break-words text-slate-800">
                    {k === "E-mail" ? <a className="text-[var(--color-brand-blue)] hover:underline" href={`mailto:${v}`}>{v}</a> : v}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </Card>
      </div>

      <Card className="mt-4">
        <h2 className="mb-4 font-bold text-slate-900">Andamento do atendimento</h2>
        <form action={updateMessage} className="space-y-4">
          <input type="hidden" name="id" value={m.id} />
          <Field label="Responsável" hint="Quem da equipe vai cuidar deste atendimento">
            <Select name="assignedTo" defaultValue={m.assignedTo ?? ""}>
              <option value="">Sem responsável (aguardando triagem)</option>
              {team.filter((u) => u.active || u.id === m.assignedTo).map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </Select>
          </Field>
          <Field label="Situação">
            <Select name="status" defaultValue={m.status}>
              {Object.entries(MESSAGE_STATUS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </Select>
          </Field>
          <Field
            label="Resposta ao cidadão"
            hint={
              m.kind === "requerimento"
                ? "Aparece para o beneficiário na Área do Beneficiário, dentro da solicitação."
                : `Aparece para quem enviou ao consultar o protocolo em /acompanhar (com o código ${m.accessCode || "—"}, e-mail ou telefone).`
            }
          >
            <Textarea name="publicReply" rows={4} defaultValue={m.publicReply} placeholder="Ex.: Sua solicitação foi atendida. O documento está disponível no Portal do Segurado." />
          </Field>
          <Field label="Anotação interna (não aparece para quem enviou)">
            <Textarea name="internalNote" rows={4} defaultValue={m.internalNote} placeholder="Ex.: respondido por telefone em 30/09 pela equipe de benefícios." />
          </Field>
          <div className="flex items-center justify-between gap-4">
            <p className="text-xs text-slate-500">Última atualização: {fmt(m.updatedAt)}</p>
            <SubmitButton>Salvar andamento</SubmitButton>
          </div>
        </form>
      </Card>
    </>
  );
}

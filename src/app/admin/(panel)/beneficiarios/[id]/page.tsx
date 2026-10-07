import Link from "next/link";
import { notFound } from "next/navigation";
import { and, desc, eq } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import { db, schema } from "@/db";
import { requireModule } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { BENEF_KIND, DOC_STATUS } from "@/lib/beneficiary";
import { formatCpf, formatDateBr } from "@/lib/cpf";
import { decryptText } from "@/lib/data-crypto";
import { formatBytes } from "@/lib/format";
import { MESSAGE_STATUS, STATUS_COLOR } from "@/lib/messages";
import { Card, Field, Flash, Input, Select, SubmitButton } from "@/components/admin/ui";
import { resetAccess, reviewDocument, setStatus, updateBeneficiary } from "../actions";

const fmt = (d: Date | null) =>
  d ? new Date(d).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", dateStyle: "short", timeStyle: "short" }) : "—";

export default async function AdminBeneficiario(props: { params: Promise<{ id: string }>; searchParams: Promise<{ ok?: string; erro?: string }> }) {
  const [{ id }, sp] = await Promise.all([props.params, props.searchParams]);
  const me = await requireModule("beneficiarios");
  const bid = parseInt(id, 10);
  if (!Number.isFinite(bid)) notFound();
  const [b] = await db.select().from(schema.beneficiaries).where(eq(schema.beneficiaries.id, bid));
  if (!b) notFound();
  const [docs, requests, log] = await Promise.all([
    db.select().from(schema.beneficiaryDocuments).where(eq(schema.beneficiaryDocuments.beneficiaryId, b.id)).orderBy(desc(schema.beneficiaryDocuments.createdAt)),
    db.select().from(schema.messages).where(and(eq(schema.messages.beneficiaryId, b.id), eq(schema.messages.kind, "requerimento"))).orderBy(desc(schema.messages.createdAt)),
    db.select().from(schema.beneficiaryLog).where(eq(schema.beneficiaryLog.beneficiaryId, b.id)).orderBy(desc(schema.beneficiaryLog.createdAt)).limit(40),
  ]);
  // LGPD: registra quem da equipe consultou os dados de quem
  if (!sp.ok && !sp.erro) await audit(me, "Consultou cadastro de beneficiário", b.name);

  return (
    <>
      <Link href="/admin/beneficiarios" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--color-brand-blue)]">
        <ArrowLeft className="h-4 w-4" aria-hidden /> Beneficiários
      </Link>
      <h1 className="text-2xl font-extrabold text-slate-900">{b.name}</h1>
      <p className="mb-6 text-sm text-slate-500">
        CPF {formatCpf(decryptText(b.cpfEnc))} · origem: {b.origin} · último acesso: {fmt(b.lastLoginAt)} ·{" "}
        {b.passwordHash ? "senha criada" : "ainda não fez o primeiro acesso"}
        {b.totpEnabled && " · 2FA ativo"}
      </p>
      <Flash {...sp} />

      {b.status === "pendente" && (
        <Card className="mb-6 border-amber-300 bg-amber-50">
          <h2 className="mb-2 font-bold text-amber-900">Pedido de cadastro feito pelo site</h2>
          <p className="mb-4 text-sm text-amber-900">
            Confira os dados abaixo e o documento enviado. Ao aprovar, a pessoa já pode fazer o primeiro acesso
            (CPF + nascimento + matrícula). Corrija a matrícula antes, se necessário.
          </p>
          <div className="flex flex-wrap gap-3">
            <form action={setStatus}><input type="hidden" name="id" value={b.id} /><input type="hidden" name="status" value="ativo" /><SubmitButton>Aprovar cadastro</SubmitButton></form>
            <form action={setStatus}><input type="hidden" name="id" value={b.id} /><input type="hidden" name="status" value="bloqueado" /><SubmitButton variant="ghost">Recusar</SubmitButton></form>
          </div>
        </Card>
      )}

      <Card className="mb-6">
        <h2 className="mb-4 font-bold text-slate-900">Cadastro</h2>
        <form action={updateBeneficiary} className="grid gap-4 sm:grid-cols-2">
          <input type="hidden" name="id" value={b.id} />
          <Field label="Nome"><Input name="name" defaultValue={b.name} required /></Field>
          <Field label="Nascimento"><Input name="birthDate" type="date" defaultValue={b.birthDate} required /></Field>
          <Field label="Matrícula / nº do benefício"><Input name="registration" defaultValue={b.registration} required /></Field>
          <Field label="Vínculo">
            <Select name="kind" defaultValue={b.kind}>
              <option value="">—</option>
              {Object.entries(BENEF_KIND).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </Select>
          </Field>
          <Field label="Benefício"><Input name="benefit" defaultValue={b.benefit} /></Field>
          <Field label="Início do benefício"><Input name="benefitStart" type="date" defaultValue={b.benefitStart} /></Field>
          <p className="text-sm text-slate-500 sm:col-span-2">
            Contatos informados pelo beneficiário: {b.email || "sem e-mail"} · {b.phone || "sem telefone"} · {b.address || "sem endereço"}
          </p>
          <div className="text-right sm:col-span-2"><SubmitButton>Salvar cadastro</SubmitButton></div>
        </form>
      </Card>

      <Card className="mb-6">
        <h2 className="mb-4 font-bold text-slate-900">Documentos enviados</h2>
        {docs.length === 0 ? <p className="text-sm text-slate-500">Nenhum documento.</p> : (
          <ul className="divide-y divide-slate-100">
            {docs.map((d) => (
              <li key={d.id} className="py-3">
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <a href={`/admin/beneficiarios/arquivo/${d.id}`} target="_blank" className="font-semibold text-[var(--color-brand-blue)] hover:underline">
                    {d.docType} · v{d.version}
                  </a>
                  <span className="text-slate-500">{d.fileName} · {formatBytes(d.fileSize)} · {fmt(d.createdAt)}</span>
                  <span className="ml-auto rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-700">
                    {DOC_STATUS[d.status]}{d.reviewedBy && ` por ${d.reviewedBy}`}
                  </span>
                </div>
                <form action={reviewDocument} className="mt-2 flex flex-wrap items-center gap-2">
                  <input type="hidden" name="docId" value={d.id} />
                  <Select name="status" defaultValue={d.status} className="!w-40 !py-2">
                    {Object.entries(DOC_STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </Select>
                  <Input name="note" defaultValue={d.reviewNote} placeholder="Observação para o beneficiário (obrigatória ao recusar)" className="min-w-[220px] flex-1 !py-2" />
                  <SubmitButton variant="ghost" className="!py-2">Salvar</SubmitButton>
                </form>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card className="mb-6">
        <h2 className="mb-4 font-bold text-slate-900">Solicitações</h2>
        {requests.length === 0 ? <p className="text-sm text-slate-500">Nenhuma solicitação.</p> : (
          <ul className="space-y-2">
            {requests.map((r) => (
              <li key={r.id}>
                <Link href={`/admin/mensagens/${r.id}`} className="flex flex-wrap items-center gap-3 text-sm hover:text-[var(--color-brand-blue)]">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${STATUS_COLOR[r.status]}`}>{MESSAGE_STATUS[r.status]}</span>
                  <span className="font-semibold">{r.category}</span>
                  <span className="text-slate-500">nº {r.protocol}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card className="mb-6">
        <h2 className="mb-3 font-bold text-slate-900">Acesso</h2>
        <div className="flex flex-wrap gap-3">
          <form action={resetAccess}>
            <input type="hidden" name="id" value={b.id} />
            <SubmitButton variant="ghost">Redefinir acesso (refazer primeiro acesso)</SubmitButton>
          </form>
          {b.status !== "pendente" && (
            <form action={setStatus}>
              <input type="hidden" name="id" value={b.id} />
              <input type="hidden" name="status" value={b.status === "ativo" ? "bloqueado" : "ativo"} />
              <SubmitButton variant={b.status === "ativo" ? "danger" : "primary"}>{b.status === "ativo" ? "Bloquear acesso" : "Reativar acesso"}</SubmitButton>
            </form>
          )}
        </div>
      </Card>

      <Card>
        <h2 className="mb-3 font-bold text-slate-900">Histórico do beneficiário</h2>
        <ul className="divide-y divide-slate-100 text-sm">
          {log.map((l) => (
            <li key={l.id} className="flex flex-wrap gap-x-4 py-2">
              <span className="w-32 shrink-0 text-slate-500">{fmt(l.createdAt)}</span>
              <span className="flex-1">{l.action}</span>
              <span className="text-slate-500">{l.actor}{l.ip && ` · ${l.ip}`}</span>
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
}

import Link from "next/link";
import { count, desc, eq, ilike } from "drizzle-orm";
import { db, schema } from "@/db";
import { Card, Field, Flash, Input, PageHeader, Select, SubmitButton } from "@/components/admin/ui";
import { BENEF_KIND } from "@/lib/beneficiary";
import { isValidCpf, maskCpf, onlyDigits } from "@/lib/cpf";
import { cpfHash, decryptText } from "@/lib/data-crypto";
import { createBeneficiary, importCsv } from "./actions";

const STATUS: Record<string, { label: string; style: string }> = {
  ativo: { label: "Ativo", style: "bg-emerald-100 text-emerald-800" },
  pendente: { label: "Pedido de cadastro", style: "bg-amber-100 text-amber-800" },
  bloqueado: { label: "Bloqueado", style: "bg-slate-200 text-slate-700" },
};

export default async function AdminBeneficiarios(props: { searchParams: Promise<{ ok?: string; erro?: string; q?: string }> }) {
  const sp = await props.searchParams;
  const q = (sp.q ?? "").trim();
  const b = schema.beneficiaries;
  // Busca por CPF (exato, via hash) ou por nome
  const where = q ? (isValidCpf(q) ? eq(b.cpfHash, cpfHash(onlyDigits(q))) : ilike(b.name, `%${q}%`)) : eq(b.status, "pendente");
  const [rows, [total], [pending], [withAccess]] = await Promise.all([
    db.select().from(b).where(where).orderBy(desc(b.createdAt)).limit(100),
    db.select({ n: count() }).from(b),
    db.select({ n: count() }).from(b).where(eq(b.status, "pendente")),
    db.select({ n: count() }).from(b).where(eq(b.status, "ativo")),
  ]);

  return (
    <>
      <PageHeader title="Beneficiários" description={`Área do Beneficiário · ${total.n} cadastrados · ${pending.n} pedido(s) de cadastro aguardando`} />
      <Flash {...sp} />

      <form className="mb-5 flex gap-2" role="search">
        <Input name="q" defaultValue={q} placeholder="Buscar por nome ou CPF completo" aria-label="Buscar beneficiário" />
        <SubmitButton>Buscar</SubmitButton>
      </form>

      <h2 className="mb-2 font-bold text-slate-900">{q ? `Resultado para "${q}"` : "Pedidos de cadastro aguardando análise"}</h2>
      <Card className="mb-8 p-0">
        {rows.length === 0 ? (
          <p className="p-6 text-center text-slate-500">{q ? "Ninguém encontrado." : "Nenhum pedido aguardando."}</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {rows.map((r) => (
              <li key={r.id}>
                <Link href={`/admin/beneficiarios/${r.id}`} className="flex flex-wrap items-center gap-3 px-6 py-4 hover:bg-slate-50">
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${STATUS[r.status]?.style}`}>{STATUS[r.status]?.label ?? r.status}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-slate-900">{r.name}</span>
                    <span className="text-xs text-slate-500">
                      CPF {maskCpf(decryptText(r.cpfEnc))} · {BENEF_KIND[r.kind] ?? "vínculo não informado"} · matrícula {r.registration || "—"}
                    </span>
                  </span>
                  <span className="text-xs text-slate-500">{r.passwordHash ? "já acessou" : "sem primeiro acesso"}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-1 font-bold text-slate-900">Importar planilha do Instituto</h2>
          <p className="mb-4 text-sm text-slate-500">
            CSV (no Excel: Salvar como → CSV). Colunas obrigatórias: <strong>cpf, nome, nascimento, matricula</strong>. Opcionais:
            vinculo, beneficio, inicio_beneficio, email, telefone, endereco. CPF já cadastrado é atualizado (a senha não muda).
            {` ${withAccess.n} com acesso liberado.`}
          </p>
          <form action={importCsv} className="space-y-3">
            <input type="file" name="file" accept=".csv,text/csv,text/plain" required className="block w-full text-sm" />
            <SubmitButton>Importar</SubmitButton>
          </form>
        </Card>
        <Card>
          <h2 className="mb-4 font-bold text-slate-900">Cadastrar uma pessoa</h2>
          <form action={createBeneficiary} className="grid gap-3 sm:grid-cols-2">
            <Field label="Nome completo"><Input name="name" required /></Field>
            <Field label="CPF"><Input name="cpf" required inputMode="numeric" /></Field>
            <Field label="Nascimento"><Input name="birthDate" type="date" required /></Field>
            <Field label="Matrícula / nº do benefício"><Input name="registration" required /></Field>
            <Field label="Vínculo">
              <Select name="kind" defaultValue="">
                <option value="">—</option>
                {Object.entries(BENEF_KIND).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </Select>
            </Field>
            <div className="flex items-end justify-end"><SubmitButton>Cadastrar</SubmitButton></div>
          </form>
        </Card>
      </div>
    </>
  );
}

import Link from "next/link";
import { and, desc, eq, ilike, or, type SQL } from "drizzle-orm";
import { db, schema } from "@/db";
import { requireAdmin } from "@/lib/auth";
import { Card, PageHeader } from "@/components/admin/ui";

const PAGE_SIZE = 100;

const fmt = (d: Date) =>
  new Date(d).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", dateStyle: "short", timeStyle: "medium" });

export default async function AuditPage({
  searchParams,
}: {
  searchParams: { usuario?: string; busca?: string; pagina?: string };
}) {
  await requireAdmin();
  const page = Math.max(1, parseInt(searchParams.pagina ?? "1", 10) || 1);
  const userId = parseInt(searchParams.usuario ?? "", 10);
  const q = (searchParams.busca ?? "").trim();

  const conds: SQL[] = [];
  if (Number.isFinite(userId)) conds.push(eq(schema.auditLog.userId, userId));
  if (q) conds.push(or(ilike(schema.auditLog.action, `%${q}%`), ilike(schema.auditLog.target, `%${q}%`))!);

  const [rows, users] = await Promise.all([
    db
      .select()
      .from(schema.auditLog)
      .where(conds.length ? and(...conds) : undefined)
      .orderBy(desc(schema.auditLog.createdAt), desc(schema.auditLog.id))
      .limit(PAGE_SIZE + 1)
      .offset((page - 1) * PAGE_SIZE),
    db.select({ id: schema.users.id, name: schema.users.name }).from(schema.users).orderBy(schema.users.name),
  ]);
  const hasMore = rows.length > PAGE_SIZE;
  const link = (p: number) =>
    `/admin/auditoria?${new URLSearchParams({
      ...(Number.isFinite(userId) ? { usuario: String(userId) } : {}),
      ...(q ? { busca: q } : {}),
      pagina: String(p),
    })}`;

  return (
    <>
      <PageHeader
        title="Registro de atividades"
        description="Tudo o que foi feito no painel: quem, o quê, quando e de onde. Os registros não podem ser alterados nem apagados."
      />

      <form className="mb-5 flex flex-wrap items-end gap-3">
        <label className="space-y-1 text-sm font-bold text-slate-700">
          <span className="block">Pessoa</span>
          <select name="usuario" defaultValue={searchParams.usuario ?? ""} className="rounded-xl border border-slate-300 bg-white px-3 py-2 font-normal">
            <option value="">Todas</option>
            {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
        </label>
        <label className="space-y-1 text-sm font-bold text-slate-700">
          <span className="block">Buscar</span>
          <input name="busca" defaultValue={q} placeholder="Ex.: notícia, login, protocolo" className="rounded-xl border border-slate-300 px-3 py-2 font-normal" />
        </label>
        <button className="rounded-xl bg-[var(--color-brand-blue)] px-5 py-2 text-sm font-bold text-white hover:bg-[var(--color-brand-navy)]">Filtrar</button>
      </form>

      {rows.length === 0 ? (
        <Card><p className="text-center text-slate-500">Nenhum registro encontrado.</p></Card>
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Quando</th>
                <th className="px-4 py-3">Quem</th>
                <th className="px-4 py-3">O que fez</th>
                <th className="px-4 py-3">Item</th>
                <th className="px-4 py-3">IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.slice(0, PAGE_SIZE).map((r) => (
                <tr key={r.id} className="align-top">
                  <td className="whitespace-nowrap px-4 py-2.5 text-slate-500">{fmt(r.createdAt)}</td>
                  <td className="whitespace-nowrap px-4 py-2.5 font-semibold text-slate-800">{r.userName || "—"}</td>
                  <td className="px-4 py-2.5 text-slate-800">{r.action}</td>
                  <td className="max-w-xs break-words px-4 py-2.5 text-slate-600">{r.target}</td>
                  <td className="whitespace-nowrap px-4 py-2.5 font-mono text-xs text-slate-400">{r.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <div className="mt-4 flex justify-between text-sm font-semibold">
        {page > 1 ? <Link href={link(page - 1)} className="text-[var(--color-brand-blue)] hover:underline">← Mais recentes</Link> : <span />}
        {hasMore && <Link href={link(page + 1)} className="text-[var(--color-brand-blue)] hover:underline">Mais antigos →</Link>}
      </div>
    </>
  );
}

import Link from "next/link";
import { and, desc, eq, isNull, ne, notInArray } from "drizzle-orm";
import { db, schema } from "@/db";
import { Card, PageHeader } from "@/components/admin/ui";
import { MESSAGE_STATUS, STATUS_COLOR as statusColor } from "@/lib/messages";
import { requireModule } from "@/lib/auth";

const FILTERS = [
  { key: "abertas", label: "Em aberto" },
  { key: "minhas", label: "Comigo" },
  { key: "triagem", label: "Sem responsável" },
  { key: "requerimento", label: "Requerimentos" },
  { key: "ouvidoria", label: "Ouvidoria" },
  { key: "contato", label: "Fale conosco" },
  { key: "arquivada", label: "Arquivadas" },
];

function whereFor(filter: string, uid: number) {
  const m = schema.messages;
  const open = notInArray(m.status, ["arquivada", "respondida"]);
  if (filter === "minhas") return and(eq(m.assignedTo, uid), open);
  if (filter === "triagem") return and(isNull(m.assignedTo), open);
  if (filter === "arquivada") return eq(m.status, "arquivada");
  if (filter === "ouvidoria" || filter === "contato" || filter === "requerimento") return and(eq(m.kind, filter), ne(m.status, "arquivada"));
  return and(ne(m.status, "arquivada"), ne(m.status, "respondida"));
}

export default async function AdminMensagens(props: { searchParams: Promise<{ filtro?: string }> }) {
  const searchParams = await props.searchParams;
  const me = await requireModule("mensagens");
  const filter = FILTERS.some((f) => f.key === searchParams.filtro) ? searchParams.filtro! : "abertas";
  const rows = await db
    .select()
    .from(schema.messages)
    .where(whereFor(filter, me.uid))
    .orderBy(desc(schema.messages.createdAt))
    .limit(200);
  const team = await db.select({ id: schema.users.id, name: schema.users.name }).from(schema.users);
  const nameOf = new Map(team.map((u) => [u.id, u.name]));

  return (
    <>
      <PageHeader
        title="Mensagens e Ouvidoria"
        description="Tudo o que chega pelo Fale conosco, pela Ouvidoria e pelos requerimentos da Área do Beneficiário. Abra para definir o responsável e registrar o andamento."
      />

      <div className="mb-5 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={`/admin/mensagens?filtro=${f.key}`}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              f.key === filter ? "bg-[var(--color-brand-blue)] text-white" : "bg-white text-slate-700 ring-1 ring-slate-200 hover:ring-[var(--color-brand-blue)]"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {rows.length === 0 ? (
        <Card><p className="text-center text-slate-500">Nenhuma mensagem aqui.</p></Card>
      ) : (
        <div className="space-y-2">
          {rows.map((m) => (
            <Link
              key={m.id}
              href={`/admin/mensagens/${m.id}`}
              className="flex flex-col gap-1 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-[var(--color-brand-blue)] sm:flex-row sm:items-center sm:gap-4"
            >
              <span className={`w-fit shrink-0 rounded-full px-3 py-1 text-xs font-bold ${statusColor[m.status] ?? statusColor.nova}`}>
                {MESSAGE_STATUS[m.status] ?? m.status}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold text-slate-900">
                  {m.kind === "ouvidoria" ? "Ouvidoria · " : m.kind === "requerimento" ? "Requerimento · " : ""}{m.category}
                </span>
                <span className="block truncate text-sm text-slate-500">
                  {m.anonymous ? "Anônimo" : m.name} — {m.body.slice(0, 90)}
                </span>
              </span>
              <span className="shrink-0 text-xs text-slate-500">
                {m.assignedTo ? `${nameOf.get(m.assignedTo) ?? "—"} · ` : "sem responsável · "}
                nº {m.protocol} · {new Date(m.createdAt).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", dateStyle: "short", timeStyle: "short" })}
              </span>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}

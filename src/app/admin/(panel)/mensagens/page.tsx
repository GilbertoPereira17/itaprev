import Link from "next/link";
import { and, desc, eq, ne } from "drizzle-orm";
import { db, schema } from "@/db";
import { Card, PageHeader } from "@/components/admin/ui";
import { MESSAGE_STATUS, STATUS_COLOR as statusColor } from "@/lib/messages";

const FILTERS = [
  { key: "abertas", label: "Em aberto" },
  { key: "ouvidoria", label: "Ouvidoria" },
  { key: "contato", label: "Fale conosco" },
  { key: "arquivada", label: "Arquivadas" },
];

function whereFor(filter: string) {
  const m = schema.messages;
  if (filter === "arquivada") return eq(m.status, "arquivada");
  if (filter === "ouvidoria" || filter === "contato") return and(eq(m.kind, filter), ne(m.status, "arquivada"));
  return and(ne(m.status, "arquivada"), ne(m.status, "respondida"));
}

export default async function AdminMensagens({ searchParams }: { searchParams: { filtro?: string } }) {
  const filter = FILTERS.some((f) => f.key === searchParams.filtro) ? searchParams.filtro! : "abertas";
  const rows = await db
    .select()
    .from(schema.messages)
    .where(whereFor(filter))
    .orderBy(desc(schema.messages.createdAt))
    .limit(200);

  return (
    <>
      <PageHeader
        title="Mensagens e Ouvidoria"
        description="Tudo o que chega pelo formulário de contato e pela Ouvidoria do site. Abra uma mensagem para registrar o andamento."
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
                  {m.kind === "ouvidoria" ? "Ouvidoria · " : ""}{m.category}
                </span>
                <span className="block truncate text-sm text-slate-500">
                  {m.anonymous ? "Anônimo" : m.name} — {m.body.slice(0, 90)}
                </span>
              </span>
              <span className="shrink-0 text-xs text-slate-500">
                nº {m.protocol} · {new Date(m.createdAt).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", dateStyle: "short", timeStyle: "short" })}
              </span>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}

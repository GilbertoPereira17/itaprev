import Link from "next/link";
import { asc } from "drizzle-orm";
import { db, schema } from "@/db";
import { Card, DeleteButton, Flash, PageHeader } from "@/components/admin/ui";
import { deletePage } from "./actions";

export default async function AdminPages(props: { searchParams: Promise<{ ok?: string; erro?: string }> }) {
  const searchParams = await props.searchParams;
  const rows = await db.select().from(schema.pages).orderBy(asc(schema.pages.title));
  return (
    <>
      <PageHeader title="Páginas" description="Páginas de texto do site (Aposentados, Pensionistas, Pró-Gestão…)." action={{ href: "/admin/paginas/nova", label: "+ Nova página" }} />
      <Flash {...searchParams} />
      <Card className="p-0">
        {rows.length === 0 ? (
          <p className="p-8 text-center text-slate-500">Nenhuma página cadastrada.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {rows.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center gap-4 px-6 py-4">
                <div className="min-w-0 flex-1">
                  <Link href={`/admin/paginas/${p.id}`} className="font-bold text-slate-900 hover:text-[var(--color-brand-blue)]">{p.title}</Link>
                  <p className="text-xs text-slate-500">/{p.slug} {!p.published && "· oculta"}</p>
                </div>
                <a href={`/${p.slug}`} target="_blank" className="text-sm font-semibold text-slate-500 hover:text-slate-800">Ver</a>
                <Link href={`/admin/paginas/${p.id}`} className="rounded-lg px-3 py-2 text-sm font-semibold text-[var(--color-brand-blue)] hover:bg-slate-50">Editar</Link>
                <form action={deletePage}>
                  <input type="hidden" name="id" value={p.id} />
                  <DeleteButton confirmText={`Excluir a página "${p.title}"?`} />
                </form>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}

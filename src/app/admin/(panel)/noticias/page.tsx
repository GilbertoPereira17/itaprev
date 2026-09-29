import Link from "next/link";
import { desc } from "drizzle-orm";
import { db, schema } from "@/db";
import { Card, DeleteButton, Flash, PageHeader } from "@/components/admin/ui";
import { formatDate } from "@/lib/format";
import { deleteNews } from "./actions";

export default async function AdminNewsList({ searchParams }: { searchParams: { ok?: string; erro?: string } }) {
  const rows = await db.select().from(schema.news).orderBy(desc(schema.news.publishedAt));

  return (
    <>
      <PageHeader title="Notícias" description="Notícias e comunicados exibidos no site." action={{ href: "/admin/noticias/novo", label: "+ Nova notícia" }} />
      <Flash {...searchParams} />
      <Card className="p-0">
        {rows.length === 0 ? (
          <p className="p-8 text-center text-slate-500">Nenhuma notícia cadastrada.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {rows.map((n) => (
              <li key={n.id} className="flex flex-wrap items-center gap-4 px-6 py-4">
                <div className="min-w-0 flex-1">
                  <Link href={`/admin/noticias/${n.id}`} className="font-bold text-slate-900 hover:text-[var(--color-brand-blue)]">
                    {n.title}
                  </Link>
                  <p className="text-xs text-slate-500">
                    {formatDate(n.publishedAt)} · {n.category}
                    {!n.published && <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 font-semibold text-amber-700">Rascunho</span>}
                  </p>
                </div>
                <Link href={`/admin/noticias/${n.id}`} className="rounded-lg px-3 py-2 text-sm font-semibold text-[var(--color-brand-blue)] hover:bg-slate-50">
                  Editar
                </Link>
                <form action={deleteNews}>
                  <input type="hidden" name="id" value={n.id} />
                  <DeleteButton confirmText={`Excluir a notícia "${n.title}"?`} />
                </form>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}

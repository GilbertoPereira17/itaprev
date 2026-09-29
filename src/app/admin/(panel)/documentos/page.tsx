import Link from "next/link";
import { asc, count, eq } from "drizzle-orm";
import { FolderOpen } from "lucide-react";
import { db, schema } from "@/db";
import { Card, Field, Flash, Input, PageHeader, SubmitButton } from "@/components/admin/ui";
import { saveSection } from "./actions";
import { AREAS } from "./areas";


export default async function AdminDocSections({ searchParams }: { searchParams: { ok?: string; erro?: string } }) {
  const sections = await db
    .select({
      id: schema.docSections.id,
      title: schema.docSections.title,
      slug: schema.docSections.slug,
      area: schema.docSections.area,
      published: schema.docSections.published,
    })
    .from(schema.docSections)
    .orderBy(asc(schema.docSections.area), asc(schema.docSections.sortOrder), asc(schema.docSections.title));

  const counts = await db
    .select({ sectionId: schema.docGroups.sectionId, n: count(schema.documents.id) })
    .from(schema.docGroups)
    .leftJoin(schema.documents, eq(schema.documents.groupId, schema.docGroups.id))
    .groupBy(schema.docGroups.sectionId);
  const countBy = new Map(counts.map((c) => [c.sectionId, c.n]));
  const areas = Array.from(new Set(sections.map((s) => s.area)));

  return (
    <>
      <PageHeader
        title="Documentos"
        description="Atas, legislação, relatórios e demais arquivos. Cada seção vira uma página em /documentos/…, organizada em grupos (ex.: Atas 2026)."
      />
      <Flash {...searchParams} />

      <Card className="mb-8">
        <form action={saveSection} className="grid items-end gap-4 sm:grid-cols-[1fr_200px_auto]">
          <Field label="Nova seção">
            <Input name="title" required placeholder="Ex.: Conselho Fiscal" />
          </Field>
          <Field label="Área do menu">
            <Input name="area" list="areas" defaultValue="Transparência" />
            <datalist id="areas">
              {AREAS.map((a) => (
                <option key={a} value={a} />
              ))}
            </datalist>
          </Field>
          <SubmitButton>Criar seção</SubmitButton>
        </form>
      </Card>

      {sections.length === 0 && <p className="text-center text-slate-500">Nenhuma seção ainda.</p>}

      {areas.map((area) => (
        <section key={area} className="mb-8">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-500">{area}</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {sections
              .filter((s) => s.area === area)
              .map((s) => (
                <Link
                  key={s.id}
                  href={`/admin/documentos/${s.id}`}
                  className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-[var(--color-brand-blue)]"
                >
                  <FolderOpen className="h-6 w-6 shrink-0 text-[var(--color-brand-blue)]" aria-hidden />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-bold text-slate-900">{s.title}</span>
                    <span className="text-xs text-slate-500">
                      {countBy.get(s.id) ?? 0} documentos {!s.published && "· oculta"}
                    </span>
                  </span>
                </Link>
              ))}
          </div>
        </section>
      ))}
    </>
  );
}

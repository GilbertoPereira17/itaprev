import Link from "next/link";
import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { ArrowLeft, ExternalLink, FileText, Upload } from "lucide-react";
import { db, schema } from "@/db";
import { Card, Checkbox, DeleteButton, Field, Flash, Input, SubmitButton, Textarea } from "@/components/admin/ui";
import { formatBytes, mediaUrl } from "@/lib/format";
import { AREAS } from "../areas";
import {
  addDocuments, deleteDocument, deleteGroup, deleteSection, saveGroup, saveSection, updateDocument,
} from "../actions";

export default async function EditSection({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { ok?: string; erro?: string };
}) {
  const id = Number(params.id);
  const [section] = await db.select().from(schema.docSections).where(eq(schema.docSections.id, id));
  if (!section) notFound();

  const groups = await db
    .select()
    .from(schema.docGroups)
    .where(eq(schema.docGroups.sectionId, id))
    .orderBy(asc(schema.docGroups.sortOrder), asc(schema.docGroups.id));
  const docs = await db
    .select({ d: schema.documents })
    .from(schema.documents)
    .innerJoin(schema.docGroups, eq(schema.documents.groupId, schema.docGroups.id))
    .where(eq(schema.docGroups.sectionId, id))
    .orderBy(asc(schema.documents.sortOrder), asc(schema.documents.id));

  return (
    <>
      <Link href="/admin/documentos" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--color-brand-blue)]">
        <ArrowLeft className="h-4 w-4" aria-hidden /> Todas as seções
      </Link>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-2xl font-extrabold text-slate-900">{section.title}</h1>
        <a href={`/documentos/${section.slug}`} target="_blank" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-[var(--color-brand-blue)]">
          Ver no site <ExternalLink className="h-4 w-4" aria-hidden />
        </a>
      </div>
      <Flash {...searchParams} />

      {/* Configurações da seção */}
      <details className="mb-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
        <summary className="cursor-pointer px-6 py-4 font-bold text-slate-700">Configurações da seção</summary>
        <form action={saveSection} className="space-y-4 border-t border-slate-100 p-6">
          <input type="hidden" name="id" value={section.id} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nome"><Input name="title" defaultValue={section.title} required /></Field>
            <Field label="Área do menu">
              <Input name="area" list="areas" defaultValue={section.area} />
              <datalist id="areas">{AREAS.map((a) => <option key={a} value={a} />)}</datalist>
            </Field>
            <Field label="Endereço" hint={`/documentos/${section.slug}`}><Input name="slug" defaultValue={section.slug} /></Field>
            <Field label="Ordem no menu"><Input type="number" name="sortOrder" defaultValue={section.sortOrder} /></Field>
          </div>
          <Field label="Descrição (aparece no topo da página)">
            <Textarea name="description" rows={2} defaultValue={section.description} />
          </Field>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Checkbox name="published" label="Publicada no site" defaultChecked={section.published} />
            <SubmitButton>Salvar seção</SubmitButton>
          </div>
        </form>
        <form action={deleteSection} className="border-t border-slate-100 px-6 py-3 text-right">
          <input type="hidden" name="id" value={section.id} />
          <DeleteButton label="Excluir seção inteira" confirmText={`Excluir "${section.title}" e TODOS os documentos dela? Não dá para desfazer.`} />
        </form>
      </details>

      {/* Grupos */}
      <div className="space-y-4">
        {groups.map((g, gi) => {
          const groupDocs = docs.map((x) => x.d).filter((d) => d.groupId === g.id);
          return (
            <details key={g.id} open={gi === 0} className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <summary className="flex cursor-pointer items-center justify-between px-6 py-4">
                <span className="font-bold text-slate-900">{g.title}</span>
                <span className="text-sm text-slate-500">{groupDocs.length} documentos</span>
              </summary>

              <div className="space-y-5 border-t border-slate-100 p-6">
                {/* Enviar arquivos */}
                <form action={addDocuments} className="rounded-xl border-2 border-dashed border-[var(--color-brand-blue)]/30 bg-[var(--color-brand-blue)]/5 p-4">
                  <input type="hidden" name="groupId" value={g.id} />
                  <input type="hidden" name="sectionId" value={section.id} />
                  <p className="mb-3 flex items-center gap-2 text-sm font-bold text-[var(--color-brand-blue)]">
                    <Upload className="h-4 w-4" aria-hidden /> Adicionar documentos neste grupo
                  </p>
                  <div className="grid items-end gap-3 sm:grid-cols-[1fr_1fr_auto]">
                    <Field label="Arquivo(s)" hint="PDF, Word, Excel ou imagem · pode selecionar vários">
                      <input type="file" name="files" multiple required className="block w-full text-sm" />
                    </Field>
                    <Field label="Título" hint="Se enviar vários, usa o nome de cada arquivo">
                      <Input name="title" placeholder="Ex.: Ata de Janeiro" />
                    </Field>
                    <SubmitButton>Enviar</SubmitButton>
                  </div>
                </form>

                {/* Lista */}
                {groupDocs.length > 0 && (
                  <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200">
                    {groupDocs.map((d) => (
                      <li key={d.id} className="p-3">
                        <form action={updateDocument} className="flex flex-wrap items-center gap-3">
                          <input type="hidden" name="id" value={d.id} />
                          <input type="hidden" name="sectionId" value={section.id} />
                          <FileText className="h-5 w-5 shrink-0 text-slate-400" aria-hidden />
                          <Input name="title" defaultValue={d.title} className="min-w-[180px] flex-1 !py-2" aria-label="Título" />
                          <Input type="number" name="sortOrder" defaultValue={d.sortOrder} className="!w-20 !py-2" aria-label="Ordem" title="Ordem" />
                          <a href={mediaUrl(d.filePath)} target="_blank" className="text-xs font-semibold text-[var(--color-brand-blue)] hover:underline">
                            abrir {formatBytes(d.fileSize) && `(${formatBytes(d.fileSize)})`}
                          </a>
                          <label className="cursor-pointer text-xs font-semibold text-slate-500 hover:text-slate-800">
                            trocar arquivo
                            <input type="file" name="file" className="sr-only" />
                          </label>
                          <SubmitButton variant="ghost" className="!px-3 !py-2">Salvar</SubmitButton>
                        </form>
                        <form action={deleteDocument} className="mt-1 text-right">
                          <input type="hidden" name="id" value={d.id} />
                          <input type="hidden" name="sectionId" value={section.id} />
                          <DeleteButton confirmText={`Excluir "${d.title}"?`} />
                        </form>
                      </li>
                    ))}
                  </ul>
                )}

                {/* Grupo: renomear / excluir */}
                <div className="flex flex-wrap items-end justify-between gap-3 border-t border-slate-100 pt-4">
                  <form action={saveGroup} className="flex flex-wrap items-end gap-2">
                    <input type="hidden" name="id" value={g.id} />
                    <input type="hidden" name="sectionId" value={section.id} />
                    <Field label="Nome do grupo"><Input name="title" defaultValue={g.title} className="!py-2" /></Field>
                    <Field label="Ordem"><Input type="number" name="sortOrder" defaultValue={g.sortOrder} className="!w-20 !py-2" /></Field>
                    <SubmitButton variant="ghost" className="!py-2">Renomear</SubmitButton>
                  </form>
                  <form action={deleteGroup}>
                    <input type="hidden" name="id" value={g.id} />
                    <input type="hidden" name="sectionId" value={section.id} />
                    <DeleteButton label="Excluir grupo" confirmText={`Excluir o grupo "${g.title}" e seus documentos?`} />
                  </form>
                </div>
              </div>
            </details>
          );
        })}
      </div>

      {/* Novo grupo */}
      <Card className="mt-6">
        <form action={saveGroup} className="grid items-end gap-3 sm:grid-cols-[1fr_auto]">
          <input type="hidden" name="sectionId" value={section.id} />
          <input type="hidden" name="sortOrder" value={groups.length} />
          <Field label="Novo grupo" hint="Ex.: Atas 2026, Relatórios 2025, Leis municipais">
            <Input name="title" required />
          </Field>
          <SubmitButton>Criar grupo</SubmitButton>
        </form>
      </Card>
    </>
  );
}

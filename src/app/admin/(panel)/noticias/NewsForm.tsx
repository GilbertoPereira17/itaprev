import Image from "next/image";
import type { News } from "@/db/schema";
import { Card, Checkbox, Field, Input, SubmitButton, Textarea } from "@/components/admin/ui";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { mediaUrl } from "@/lib/format";
import { saveNews } from "./actions";

const CATEGORIES = ["Institucional", "Audiência Pública", "Segurados", "Comunicado", "Edital", "Investimentos"];

export function NewsForm({ item }: { item?: News }) {
  const date = (item?.publishedAt ?? new Date()).toISOString().slice(0, 10);

  return (
    <form action={saveNews} className="space-y-6">
      {item && <input type="hidden" name="id" value={item.id} />}
      <Card className="space-y-5">
        <Field label="Título">
          <Input name="title" required defaultValue={item?.title} placeholder="Ex.: Audiência Pública 2026" />
        </Field>
        <div className="grid gap-5 sm:grid-cols-3">
          <Field label="Categoria">
            <Input name="category" list="categorias" defaultValue={item?.category ?? "Institucional"} />
            <datalist id="categorias">
              {CATEGORIES.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </Field>
          <Field label="Data de publicação">
            <Input type="date" name="publishedAt" defaultValue={date} />
          </Field>
          <Field label="Endereço (URL)" hint="Gerado a partir do título se ficar vazio">
            <Input name="slug" defaultValue={item?.slug} placeholder="audiencia-publica-2026" />
          </Field>
        </div>
        <Field label="Resumo" hint="Aparece nos cartões da página inicial e na lista de notícias">
          <Textarea name="summary" rows={3} defaultValue={item?.summary} />
        </Field>
      </Card>

      <Card className="space-y-3">
        <span className="text-sm font-bold text-slate-700">Texto completo</span>
        <RichTextEditor name="content" defaultValue={item?.content} />
      </Card>

      <Card className="space-y-4">
        <Field label="Imagem de capa (opcional)" hint="JPG, PNG ou WEBP">
          <input type="file" name="cover" accept="image/jpeg,image/png,image/webp" className="block text-sm" />
        </Field>
        {item?.coverPath && (
          <div className="flex items-center gap-4">
            <div className="relative h-20 w-32 overflow-hidden rounded-lg border">
              <Image src={mediaUrl(item.coverPath)} alt="" fill className="object-cover" />
            </div>
            <Checkbox name="removeCover" label="Remover imagem atual" />
          </div>
        )}
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <Checkbox name="published" label="Publicada (visível no site)" defaultChecked={item?.published ?? true} />
        <SubmitButton>{item ? "Salvar alterações" : "Publicar notícia"}</SubmitButton>
      </div>
    </form>
  );
}

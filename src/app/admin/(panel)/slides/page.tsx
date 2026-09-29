import Image from "next/image";
import { asc } from "drizzle-orm";
import { db, schema } from "@/db";
import type { Slide } from "@/db/schema";
import { Card, Checkbox, DeleteButton, Field, Flash, Input, PageHeader, SubmitButton, Textarea } from "@/components/admin/ui";
import { mediaUrl } from "@/lib/format";
import { deleteSlide, saveSlide } from "./actions";

function SlideForm({ slide, nextOrder }: { slide?: Slide; nextOrder: number }) {
  return (
    <form action={saveSlide} className="space-y-4">
      {slide && <input type="hidden" name="id" value={slide.id} />}
      <div className="grid gap-4 sm:grid-cols-[1fr_120px]">
        <Field label="Etiqueta (texto pequeno acima do título)"><Input name="tag" defaultValue={slide?.tag} /></Field>
        <Field label="Ordem"><Input type="number" name="sortOrder" defaultValue={slide?.sortOrder ?? nextOrder} /></Field>
      </div>
      <Field label="Título"><Input name="title" required defaultValue={slide?.title} /></Field>
      <Field label="Texto"><Textarea name="description" rows={2} defaultValue={slide?.description} /></Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Texto do botão"><Input name="buttonLabel" defaultValue={slide?.buttonLabel} /></Field>
        <Field label="Link do botão" hint="Página do site (/transparencia) ou endereço externo"><Input name="buttonUrl" defaultValue={slide?.buttonUrl} /></Field>
      </div>
      <Field label={slide ? "Trocar imagem de fundo" : "Imagem de fundo"} hint="Horizontal, de preferência 1920×1080 (JPG/PNG/WEBP)">
        <input type="file" name="image" accept="image/jpeg,image/png,image/webp" required={!slide} className="block text-sm" />
      </Field>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Checkbox name="active" label="Ativo no site" defaultChecked={slide?.active ?? true} />
        <SubmitButton>{slide ? "Salvar slide" : "Adicionar slide"}</SubmitButton>
      </div>
    </form>
  );
}

export default async function AdminSlides({ searchParams }: { searchParams: { ok?: string; erro?: string } }) {
  const slides = await db.select().from(schema.slides).orderBy(asc(schema.slides.sortOrder), asc(schema.slides.id));

  return (
    <>
      <PageHeader title="Banner da Home" description="Slides que passam no topo da página inicial." />
      <Flash {...searchParams} />
      <div className="space-y-6">
        {slides.map((s) => (
          <Card key={s.id} className="grid gap-6 lg:grid-cols-[240px_1fr]">
            <div className="relative aspect-video overflow-hidden rounded-xl bg-slate-900">
              {s.imagePath && <Image src={mediaUrl(s.imagePath)} alt="" fill className="object-cover opacity-80" />}
              <span className="absolute bottom-2 left-2 right-2 text-xs font-bold text-white drop-shadow">{s.title}</span>
            </div>
            <div>
              <SlideForm slide={s} nextOrder={0} />
              <form action={deleteSlide} className="mt-2 text-right">
                <input type="hidden" name="id" value={s.id} />
                <DeleteButton confirmText="Excluir este slide?" />
              </form>
            </div>
          </Card>
        ))}
        <Card>
          <h2 className="mb-4 font-bold text-slate-900">Novo slide</h2>
          <SlideForm nextOrder={slides.length} />
        </Card>
      </div>
    </>
  );
}

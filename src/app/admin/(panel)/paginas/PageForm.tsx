import type { Page } from "@/db/schema";
import { Card, Checkbox, Field, Input, SubmitButton, Textarea } from "@/components/admin/ui";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { savePage } from "./actions";

export function PageForm({ item }: { item?: Page }) {
  return (
    <form action={savePage} className="space-y-6">
      {item && <input type="hidden" name="id" value={item.id} />}
      <Card className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Título"><Input name="title" required defaultValue={item?.title} /></Field>
          <Field label="Endereço" hint="Ex.: aposentados → itanhaemprev.sp.gov.br/aposentados">
            <Input name="slug" defaultValue={item?.slug} />
          </Field>
        </div>
        <Field label="Subtítulo" hint="Frase curta que aparece no topo da página">
          <Textarea name="summary" rows={2} defaultValue={item?.summary} />
        </Field>
      </Card>
      <Card className="space-y-3">
        <span className="text-sm font-bold text-slate-700">Conteúdo</span>
        <RichTextEditor name="content" defaultValue={item?.content} />
      </Card>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Checkbox name="published" label="Publicada (visível no site)" defaultChecked={item?.published ?? true} />
        <SubmitButton>{item ? "Salvar alterações" : "Criar página"}</SubmitButton>
      </div>
    </form>
  );
}

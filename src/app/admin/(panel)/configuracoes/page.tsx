import { db, schema } from "@/db";
import { Card, Field, Flash, Input, PageHeader, SubmitButton } from "@/components/admin/ui";
import { saveSettings } from "./actions";
import { SETTING_KEYS } from "./keys";

export default async function AdminSettings(props: { searchParams: Promise<{ ok?: string; erro?: string }> }) {
  const searchParams = await props.searchParams;
  const rows = await db.select().from(schema.settings);
  const values = Object.fromEntries(rows.map((r) => [r.key, r.value]));

  return (
    <>
      <PageHeader title="Contatos e links" description="Aparecem no rodapé, na página de contato, nos atalhos e no chatbot." />
      <Flash {...searchParams} />
      <form action={saveSettings} className="space-y-6">
        {SETTING_KEYS.map((g) => (
          <Card key={g.group} className="space-y-4">
            <h2 className="font-bold text-slate-900">{g.group}</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {g.fields.map((f) => (
                <Field key={f.key} label={f.label} hint={f.hint}>
                  <Input name={f.key} defaultValue={values[f.key] ?? ""} />
                </Field>
              ))}
            </div>
          </Card>
        ))}
        <div className="text-right">
          <SubmitButton>Salvar configurações</SubmitButton>
        </div>
      </form>
    </>
  );
}

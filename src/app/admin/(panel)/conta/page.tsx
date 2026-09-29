import { Card, Field, Flash, Input, PageHeader, SubmitButton } from "@/components/admin/ui";
import { changeOwnPassword } from "../usuarios/actions";

export default function AccountPage({ searchParams }: { searchParams: { ok?: string; erro?: string } }) {
  return (
    <>
      <PageHeader title="Minha senha" />
      <Flash {...searchParams} />
      <Card className="max-w-md">
        <form action={changeOwnPassword} className="space-y-4">
          <Field label="Senha atual"><Input name="current" type="password" required autoComplete="current-password" /></Field>
          <Field label="Nova senha" hint="Mínimo de 10 caracteres"><Input name="next" type="password" minLength={10} required autoComplete="new-password" /></Field>
          <Field label="Confirme a nova senha"><Input name="confirm" type="password" minLength={10} required autoComplete="new-password" /></Field>
          <SubmitButton>Alterar senha</SubmitButton>
        </form>
      </Card>
    </>
  );
}

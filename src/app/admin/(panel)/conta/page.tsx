import { eq } from "drizzle-orm";
import QRCode from "qrcode";
import { ShieldCheck, ShieldAlert } from "lucide-react";
import { db, schema } from "@/db";
import { requireUser } from "@/lib/auth";
import { PASSWORD_MAX_AGE_DAYS, PASSWORD_RULES } from "@/lib/password";
import { decryptSecret, otpauthUrl } from "@/lib/totp";
import { Card, Field, Flash, Input, PageHeader, SubmitButton } from "@/components/admin/ui";
import { changeOwnPassword, confirmTwoFactor, disableTwoFactor, startTwoFactor } from "./actions";

const codeInput = (
  <Input
    name="code"
    inputMode="numeric"
    autoComplete="one-time-code"
    pattern="[0-9 ]{6,7}"
    maxLength={7}
    required
    placeholder="000000"
    className="!w-40 text-center text-lg font-bold tracking-widest"
  />
);

export default async function AccountPage(
  props: {
    searchParams: Promise<{ ok?: string; erro?: string; troca?: string; configurar?: string }>;
  }
) {
  const searchParams = await props.searchParams;
  const session = await requireUser();
  const [user] = await db.select().from(schema.users).where(eq(schema.users.id, session.uid));
  const pendingSecret = !user.totpEnabled && searchParams.configurar ? decryptSecret(user.totpSecret) : "";
  const qrSvg = pendingSecret
    ? await QRCode.toString(otpauthUrl(user.email, pendingSecret), { type: "svg", margin: 1, width: 200 })
    : "";

  return (
    <>
      <PageHeader title="Minha conta" description={`${user.name} · ${user.email}`} />
      {searchParams.troca && !searchParams.ok && (
        <p role="alert" className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
          Defina uma nova senha para continuar. A senha atual é provisória ou passou do prazo de {PASSWORD_MAX_AGE_DAYS} dias.
        </p>
      )}
      <Flash ok={searchParams.ok} erro={searchParams.erro} />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 font-bold text-slate-900">Trocar senha</h2>
          <form action={changeOwnPassword} className="space-y-4">
            <Field label="Senha atual"><Input name="current" type="password" required autoComplete="current-password" /></Field>
            <Field label="Nova senha" hint={`${PASSWORD_RULES} Validade de ${PASSWORD_MAX_AGE_DAYS} dias.`}>
              <Input name="next" type="password" minLength={10} required autoComplete="new-password" />
            </Field>
            <Field label="Confirme a nova senha"><Input name="confirm" type="password" minLength={10} required autoComplete="new-password" /></Field>
            <SubmitButton>Alterar senha</SubmitButton>
          </form>
        </Card>

        <Card>
          <h2 className="mb-1 flex items-center gap-2 font-bold text-slate-900">
            {user.totpEnabled ? (
              <ShieldCheck className="h-5 w-5 text-emerald-600" aria-hidden />
            ) : (
              <ShieldAlert className="h-5 w-5 text-amber-500" aria-hidden />
            )}
            Verificação em duas etapas
          </h2>

          {user.totpEnabled ? (
            <div className="space-y-4">
              <p className="text-sm text-emerald-700">
                <strong>Ativa.</strong> Além da senha, o login pede o código do aplicativo no seu celular.
              </p>
              <form action={disableTwoFactor} className="space-y-2 border-t border-slate-100 pt-4">
                <p className="text-sm text-slate-600">Para desativar, digite um código atual do aplicativo:</p>
                <div className="flex items-center gap-2">
                  {codeInput}
                  <SubmitButton variant="ghost">Desativar</SubmitButton>
                </div>
              </form>
            </div>
          ) : pendingSecret ? (
            <div className="space-y-4">
              <ol className="list-decimal space-y-1 pl-5 text-sm text-slate-700">
                <li>Instale no celular o <strong>Google Authenticator</strong> ou o <strong>Microsoft Authenticator</strong> (gratuitos).</li>
                <li>No aplicativo, toque em <strong>+</strong> e escolha <strong>ler QR code</strong>.</li>
                <li>Digite abaixo o código de 6 dígitos que aparecer.</li>
              </ol>
              <div className="flex flex-wrap items-center gap-4">
                <div className="h-[200px] w-[200px] rounded-xl border border-slate-200 bg-white p-1" dangerouslySetInnerHTML={{ __html: qrSvg }} />
                <p className="max-w-[16rem] break-all text-xs text-slate-500">
                  Sem câmera? Digite esta chave no aplicativo:<br />
                  <code className="font-mono text-sm text-slate-800">{pendingSecret.match(/.{1,4}/g)?.join(" ")}</code>
                </p>
              </div>
              <form action={confirmTwoFactor} className="flex items-center gap-2">
                {codeInput}
                <SubmitButton>Confirmar e ativar</SubmitButton>
              </form>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-slate-600">
                Protege sua conta mesmo se alguém descobrir sua senha: o login passa a pedir também um código que só o seu
                celular gera. <strong>Recomendado para todos, especialmente administradores.</strong>
              </p>
              <form action={startTwoFactor}>
                <SubmitButton>Ativar verificação em duas etapas</SubmitButton>
              </form>
            </div>
          )}
        </Card>
      </div>
    </>
  );
}

import Link from "next/link";
import QRCode from "qrcode";
import { desc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { REQUEST_TYPES, requireBeneficiary } from "@/lib/beneficiary";
import { PASSWORD_RULES } from "@/lib/password";
import { decryptSecret, otpauthUrl } from "@/lib/totp";
import { BField, BInput, BSubmit } from "@/components/beneficiary/ui";
import { changePassword, confirmTwoFactor, disableTwoFactor, startTwoFactor } from "../actions";
import { BCard, BFlash } from "../card";

const fmt = (d: Date) => new Date(d).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", dateStyle: "short", timeStyle: "short" });
const codeInput = <BInput name="code" required inputMode="numeric" maxLength={6} autoComplete="one-time-code" className="!w-44 text-center tracking-widest" />;

export default async function BenefSecurity(props: { searchParams: Promise<{ ok?: string; erro?: string; configurar?: string }> }) {
  const sp = await props.searchParams;
  const b = await requireBeneficiary();
  const pending = !b.totpEnabled && sp.configurar ? decryptSecret(b.totpSecret) : "";
  const qr = pending ? await QRCode.toString(otpauthUrl(`Beneficiário ${b.name.split(" ")[0]}`, pending), { type: "svg", margin: 1, width: 200 }) : "";
  const log = await db
    .select()
    .from(schema.beneficiaryLog)
    .where(eq(schema.beneficiaryLog.beneficiaryId, b.id))
    .orderBy(desc(schema.beneficiaryLog.createdAt))
    .limit(30);

  return (
    <>
      <BFlash ok={sp.ok} erro={sp.erro} />
      <BCard title="Trocar senha">
        <form action={changePassword} className="space-y-5">
          <BField label="Senha atual"><BInput name="current" type="password" required autoComplete="current-password" /></BField>
          <BField label="Nova senha" hint={PASSWORD_RULES}><BInput name="next" type="password" required minLength={10} autoComplete="new-password" /></BField>
          <BField label="Repita a nova senha"><BInput name="confirm" type="password" required minLength={10} autoComplete="new-password" /></BField>
          <BSubmit>Trocar senha</BSubmit>
        </form>
      </BCard>

      <BCard title="Verificação em duas etapas">
        {b.totpEnabled ? (
          <form action={disableTwoFactor} className="space-y-4">
            <p className="text-base font-semibold text-emerald-700">✓ Ativa: ao entrar, pedimos o código do aplicativo no celular.</p>
            <BField label="Para desativar, digite o código atual">{codeInput}</BField>
            <BSubmit variant="ghost">Desativar</BSubmit>
          </form>
        ) : pending ? (
          <form action={confirmTwoFactor} className="space-y-4">
            <p className="text-base text-slate-700">Leia o QR Code com o Google Authenticator ou o Microsoft Authenticator e digite o código que aparecer.</p>
            <div className="w-52" dangerouslySetInnerHTML={{ __html: qr }} />
            <BField label="Código">{codeInput}</BField>
            <BSubmit>Confirmar e ativar</BSubmit>
          </form>
        ) : (
          <form action={startTwoFactor} className="space-y-4">
            <p className="text-base text-slate-700">
              Mais proteção: além da senha, o acesso pede um código que muda a cada 30 segundos no seu celular.
            </p>
            <BSubmit variant="ghost">Ativar</BSubmit>
          </form>
        )}
      </BCard>

      <BCard title="Excluir minha conta">
        <p className="text-base text-slate-700">
          Você pode pedir a exclusão do seu acesso à Área do Beneficiário. O Instituto apaga a senha e os dados de contato
          informados aqui; os registros que a lei obriga a guardar (vínculo previdenciário) continuam com o Instituto.
        </p>
        <Link
          href={`/beneficiario/solicitacoes/nova?assunto=${REQUEST_TYPES.findIndex((t) => t.startsWith("Exclusão"))}`}
          className="mt-4 inline-block text-base font-semibold text-red-700 underline"
        >
          Pedir exclusão da conta
        </Link>
      </BCard>

      <BCard title="Histórico de acessos e alterações">
        <ul className="divide-y divide-slate-100">
          {log.map((l) => (
            <li key={l.id} className="flex flex-wrap gap-x-4 py-2.5 text-base">
              <span className="w-36 shrink-0 text-slate-500">{fmt(l.createdAt)}</span>
              <span className="flex-1 text-slate-800">
                {l.action}
                {l.actor !== "beneficiário" && <span className="text-slate-500"> — pela equipe do Instituto</span>}
              </span>
            </li>
          ))}
        </ul>
      </BCard>
    </>
  );
}

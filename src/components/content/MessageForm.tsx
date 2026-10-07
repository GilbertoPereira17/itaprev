"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { CheckCircle2, Send } from "lucide-react";
import { sendMessage, type MessageState } from "@/lib/message-actions";
import { CONTACT_SUBJECTS, OMBUDSMAN_TYPES } from "@/lib/messages";

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-[var(--color-bg)] px-4 py-3 text-base text-slate-900 focus:border-[var(--color-brand-blue)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-blue)]/40";
const labelClass = "text-xs font-bold uppercase tracking-wide text-slate-700";

function SendButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-brand-blue)] py-4 text-base font-bold text-white transition-colors hover:bg-[var(--color-brand-navy)] disabled:opacity-60"
    >
      <Send className="h-4 w-4" aria-hidden />
      <span>{pending ? "Enviando..." : "Enviar mensagem"}</span>
    </button>
  );
}

export function MessageForm({ kind }: { kind: "contato" | "ouvidoria" }) {
  const [state, action] = useActionState<MessageState, FormData>(sendMessage, { ok: false });
  const [anonymous, setAnonymous] = useState(false);
  const isOmbudsman = kind === "ouvidoria";

  if (state.ok) {
    return (
      <div role="status" className="space-y-3 rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" aria-hidden />
        <p className="text-lg font-bold text-slate-900">Mensagem registrada com sucesso</p>
        <p className="text-slate-700">
          Número de protocolo: <strong className="text-xl text-slate-900">{state.protocol}</strong>
        </p>
        <p className="text-slate-700">
          Código de acesso: <strong className="font-mono text-xl tracking-widest text-slate-900">{state.code}</strong>
        </p>
        <p className="text-sm text-slate-600">
          Guarde os dois. {isOmbudsman ? "Eles identificam sua manifestação na Ouvidoria." : "Nossa equipe responderá pelo contato informado."}{" "}
          Você pode acompanhar o andamento a qualquer momento.
        </p>
        <Link
          href={`/acompanhar?protocolo=${state.protocol}`}
          className="inline-block rounded-xl bg-[var(--color-brand-blue)] px-5 py-3 font-bold text-white hover:bg-[var(--color-brand-navy)]"
        >
          Acompanhar protocolo
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="kind" value={kind} />
      {/* Campo-armadilha para robôs: fica invisível para pessoas */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>Site<input type="text" name="website" tabIndex={-1} autoComplete="off" /></label>
      </div>

      <div className="space-y-1.5">
        <label htmlFor={`${kind}-category`} className={labelClass}>
          {isOmbudsman ? "Tipo de manifestação" : "Assunto"}
        </label>
        <select id={`${kind}-category`} name="category" required className={inputClass} defaultValue="">
          <option value="" disabled>Selecione...</option>
          {(isOmbudsman ? OMBUDSMAN_TYPES : CONTACT_SUBJECTS).map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>

      {isOmbudsman && (
        <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          <input
            type="checkbox"
            name="anonymous"
            checked={anonymous}
            onChange={(e) => setAnonymous(e.target.checked)}
            className="mt-0.5 h-5 w-5 accent-[var(--color-brand-blue)]"
          />
          <span>
            <strong>Quero me manter anônimo.</strong> Sem identificação não conseguimos responder diretamente; acompanhe
            pelo número de protocolo junto à Ouvidoria.
          </span>
        </label>
      )}

      {!anonymous && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor={`${kind}-name`} className={labelClass}>Nome completo</label>
              <input id={`${kind}-name`} name="name" type="text" required autoComplete="name" className={inputClass} />
            </div>
            <div className="space-y-1.5">
              <label htmlFor={`${kind}-document`} className={labelClass}>CPF ou matrícula (opcional)</label>
              <input id={`${kind}-document`} name="document" type="text" className={inputClass} />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor={`${kind}-phone`} className={labelClass}>Telefone / WhatsApp</label>
              <input id={`${kind}-phone`} name="phone" type="tel" autoComplete="tel" placeholder="(13) 90000-0000" className={inputClass} />
            </div>
            <div className="space-y-1.5">
              <label htmlFor={`${kind}-email`} className={labelClass}>E-mail</label>
              <input id={`${kind}-email`} name="email" type="email" autoComplete="email" className={inputClass} />
            </div>
          </div>
          <p className="-mt-2 text-xs text-slate-500">Informe ao menos um telefone ou e-mail para receber a resposta.</p>
        </>
      )}

      <div className="space-y-1.5">
        <label htmlFor={`${kind}-body`} className={labelClass}>Mensagem</label>
        <textarea id={`${kind}-body`} name="body" rows={5} required minLength={10} maxLength={5000} className={inputClass} />
      </div>

      <label className="flex items-start gap-3 text-sm text-slate-600">
        <input type="checkbox" name="consent" required className="mt-0.5 h-5 w-5 accent-[var(--color-brand-blue)]" />
        <span>
          Autorizo o uso dos dados informados exclusivamente para o atendimento desta mensagem, conforme a{" "}
          <Link href="/privacidade" target="_blank" className="font-semibold text-[var(--color-brand-blue)] underline">
            Política de Privacidade
          </Link>
          .
        </span>
      </label>

      {state.error && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {state.error}
        </p>
      )}

      <SendButton />
    </form>
  );
}

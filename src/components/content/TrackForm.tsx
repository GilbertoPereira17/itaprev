"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Search } from "lucide-react";
import { trackProtocol, type TrackState } from "@/lib/message-actions";

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-[var(--color-bg)] px-4 py-3 text-base text-slate-900 focus:border-[var(--color-brand-blue)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-blue)]/40";
const labelClass = "text-xs font-bold uppercase tracking-wide text-slate-700";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-brand-blue)] py-4 text-base font-bold text-white hover:bg-[var(--color-brand-navy)] disabled:opacity-60"
    >
      <Search className="h-4 w-4" aria-hidden /> {pending ? "Consultando..." : "Consultar"}
    </button>
  );
}

export function TrackForm({ protocol = "" }: { protocol?: string }) {
  const [state, action] = useActionState<TrackState, FormData>(trackProtocol, { ok: false });
  const r = state.result;

  return (
    <div className="space-y-6">
      <form action={action} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="track-protocol" className={labelClass}>Número do protocolo</label>
          <input id="track-protocol" name="protocol" required defaultValue={protocol} placeholder="Ex.: 2026-000123" inputMode="numeric" className={inputClass} />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="track-check" className={labelClass}>Código de acesso, e-mail ou telefone</label>
          <input id="track-check" name="check" required autoComplete="off" className={inputClass} />
          <p className="text-xs text-slate-500">Use o código mostrado no envio ou o e-mail/telefone que você informou.</p>
        </div>
        {state.error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{state.error}</p>}
        <Submit />
      </form>

      {r && (
        <div role="status" className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-6">
          <p className="text-sm text-slate-600">{r.kind} · {r.category}</p>
          <p className="text-lg font-bold text-slate-900">Protocolo nº {r.protocol}</p>
          <p className="text-slate-800">
            Situação: <strong>{r.status}</strong>
          </p>
          <p className="text-sm text-slate-600">Registrado em {r.createdAt} · última atualização em {r.updatedAt}</p>
          {r.reply ? (
            <div className="rounded-xl border border-emerald-200 bg-white p-4">
              <p className="mb-1 text-xs font-bold uppercase tracking-wide text-emerald-700">Resposta do Itanhaém Prev</p>
              <p className="whitespace-pre-wrap text-slate-800">{r.reply}</p>
            </div>
          ) : (
            <p className="text-sm text-slate-600">Ainda não há resposta registrada. A equipe também pode responder pelo contato informado.</p>
          )}
        </div>
      )}
    </div>
  );
}

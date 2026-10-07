"use client";

import React from "react";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

/** Componentes da Área do Beneficiário: letras e campos grandes (público idoso, celular) */

export const benefInput =
  "w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-lg text-slate-900 focus:border-[var(--color-brand-blue)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-blue)]/30";

export function BField({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-base font-bold text-slate-800">{label}</span>
      {children}
      {hint && <span className="block text-sm text-slate-500">{hint}</span>}
    </label>
  );
}

export function BInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${benefInput} ${props.className ?? ""}`} />;
}

export function BSelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${benefInput} ${props.className ?? ""}`} />;
}

export function BTextarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${benefInput} ${props.className ?? ""}`} />;
}

export function BSubmit({ children, variant = "primary" }: { children: React.ReactNode; variant?: "primary" | "ghost" }) {
  const { pending } = useFormStatus();
  const style =
    variant === "primary"
      ? "bg-[var(--color-brand-blue)] text-white hover:bg-[var(--color-brand-navy)]"
      : "border border-slate-300 bg-white text-slate-800 hover:bg-slate-50";
  return (
    <button
      type="submit"
      disabled={pending}
      className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-6 py-4 text-lg font-bold transition-colors disabled:opacity-60 sm:w-auto ${style}`}
    >
      {pending && <Loader2 className="h-5 w-5 animate-spin" aria-hidden />}
      {pending ? "Aguarde..." : children}
    </button>
  );
}

export function BAlert({ kind = "erro", children }: { kind?: "erro" | "ok" | "info"; children: React.ReactNode }) {
  const style = {
    erro: "border-red-200 bg-red-50 text-red-800",
    ok: "border-emerald-200 bg-emerald-50 text-emerald-800",
    info: "border-blue-200 bg-blue-50 text-blue-900",
  }[kind];
  return (
    <div role={kind === "erro" ? "alert" : "status"} className={`rounded-xl border px-4 py-3 text-base ${style}`}>
      {children}
    </div>
  );
}

/** Campo de CPF que formata enquanto digita (000.000.000-00) */
export function CpfInput({ name = "cpf", defaultValue = "" }: { name?: string; defaultValue?: string }) {
  const [value, setValue] = React.useState(defaultValue);
  return (
    <BInput
      name={name}
      required
      inputMode="numeric"
      autoComplete="username"
      placeholder="000.000.000-00"
      value={value}
      onChange={(e) => {
        const d = e.target.value.replace(/\D/g, "").slice(0, 11);
        setValue(d.replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2"));
      }}
    />
  );
}

"use client";

import React from "react";
import Link from "next/link";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

const inputBase =
  "w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-[15px] text-slate-900 focus:border-[var(--color-brand-blue)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-blue)]/25";

export function SubmitButton({
  children,
  className = "",
  variant = "primary",
}: {
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "danger" | "ghost";
}) {
  const { pending } = useFormStatus();
  const styles = {
    primary: "bg-[var(--color-brand-blue)] text-white hover:bg-[var(--color-brand-navy)]",
    danger: "bg-red-600 text-white hover:bg-red-700",
    ghost: "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
  }[variant];
  return (
    <button
      type="submit"
      disabled={pending}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-colors disabled:opacity-60 ${styles} ${className}`}
    >
      {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
}

/** Botão de exclusão com confirmação */
export function DeleteButton({ label = "Excluir", confirmText = "Tem certeza que deseja excluir?" }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      onClick={(e) => {
        if (!confirm(confirmText)) e.preventDefault();
      }}
      className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
    >
      {label}
    </button>
  );
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-bold text-slate-700">{label}</span>
      {children}
      {hint && <span className="block text-xs text-slate-500">{hint}</span>}
    </label>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputBase} ${props.className || ""}`} />;
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${inputBase} ${props.className || ""}`} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${inputBase} ${props.className || ""}`} />;
}

export function Checkbox({ name, label, defaultChecked }: { name: string; label: string; defaultChecked?: boolean }) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2.5 text-sm font-semibold text-slate-700">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="h-5 w-5 rounded accent-[var(--color-brand-blue)]" />
      {label}
    </label>
  );
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-sm ${className}`}>{children}</div>;
}

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">{title}</h1>
        {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      </div>
      {action && (
        <Link
          href={action.href}
          className="inline-flex items-center justify-center rounded-xl bg-[var(--color-brand-blue)] px-5 py-2.5 text-sm font-bold text-white hover:bg-[var(--color-brand-navy)]"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}

/** Mensagem de sucesso/erro vinda da URL (?ok= / ?erro=) */
export function Flash({ ok, erro }: { ok?: string; erro?: string }) {
  if (!ok && !erro) return null;
  return (
    <p
      role={erro ? "alert" : "status"}
      className={`mb-5 rounded-xl border px-4 py-3 text-sm font-medium ${
        erro ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"
      }`}
    >
      {erro || ok}
    </p>
  );
}

import React from "react";
import Image from "next/image";
import Link from "next/link";

/** Certificação Pró-Gestão — apresentada de forma factual, sem destaque promocional */
export function Certification() {
  return (
    <section className="border-y border-slate-200 bg-[var(--color-bg)]">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:px-6 lg:px-8">
        <Image
          src="/images/selo-300x300-pro-gestao-2.png"
          alt="Selo Pró-Gestão RPPS Nível II"
          width={96}
          height={96}
          className="h-24 w-24 shrink-0 object-contain"
        />
        <div className="flex-1">
          <h2 className="text-xl font-bold text-slate-900">Certificação Pró-Gestão RPPS — Nível II</h2>
          <p className="mt-1 max-w-3xl text-slate-600">
            Programa do Ministério da Previdência que avalia controles internos, governança e educação previdenciária
            dos regimes próprios de previdência.
          </p>
        </div>
        <Link href="/documentos/pro-gestao" className="shrink-0 font-semibold text-[var(--color-brand-blue)] hover:underline">
          Documentos da certificação
        </Link>
      </div>
    </section>
  );
}

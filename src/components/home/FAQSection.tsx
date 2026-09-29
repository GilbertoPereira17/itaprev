import React from "react";
import { ChevronDown } from "lucide-react";

export type FaqItem = { id: number | string; question: string; answer: string };

/** Perguntas frequentes (acordeão nativo, acessível por teclado e leitor de tela) */
export function FAQSection({ items }: { items: FaqItem[] }) {
  if (items.length === 0) return null;
  return (
    <section aria-labelledby="faq-titulo" className="bg-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_2fr] lg:px-8">
        <div>
          <h2 id="faq-titulo" className="text-2xl font-bold text-slate-900 sm:text-3xl">
            Perguntas frequentes
          </h2>
          <p className="mt-2 text-slate-600">Dúvidas comuns sobre pagamentos, recadastramento e atendimento.</p>
        </div>
        <div className="divide-y divide-slate-200 border-y border-slate-200">
          {items.map((f, i) => (
            <details key={f.id} open={i === 0} className="group">
              <summary className="flex min-h-[64px] cursor-pointer list-none items-center justify-between gap-4 py-4 text-lg font-semibold text-slate-900 hover:text-[var(--color-brand-blue)]">
                {f.question}
                <ChevronDown className="h-5 w-5 shrink-0 text-slate-400 transition-transform group-open:rotate-180" aria-hidden />
              </summary>
              <p className="pb-5 pr-8 text-[17px] leading-relaxed text-slate-600">{f.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

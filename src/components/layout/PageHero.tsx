import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface PageHeroProps {
  eyebrow?: string;
  title: string;
  description?: string;
  breadcrumb: string;
}

/** Cabeçalho das páginas internas: trilha de navegação + título */
export function PageHero({ title, description, breadcrumb }: PageHeroProps) {
  return (
    <div className="border-b border-slate-200 pb-6">
      <nav aria-label="Trilha de navegação" className="flex items-center gap-1.5 text-sm text-slate-500">
        <Link href="/" className="hover:text-[var(--color-brand-blue)] hover:underline">
          Início
        </Link>
        <ChevronRight className="h-3.5 w-3.5" aria-hidden />
        <span aria-current="page" className="text-slate-700">{breadcrumb}</span>
      </nav>
      <h1 className="mt-4 text-3xl font-bold text-slate-900 sm:text-4xl">{title}</h1>
      {description && description.trim() && <p className="mt-3 max-w-3xl text-lg leading-relaxed text-slate-600">{description}</p>}
    </div>
  );
}

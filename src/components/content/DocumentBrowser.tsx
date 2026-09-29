"use client";

import { useMemo, useState } from "react";
import { FileText, Search, Download, ChevronDown } from "lucide-react";

export type BrowserDoc = { id: number; title: string; url: string; size: string; ext: string };
export type BrowserGroup = { id: number; title: string; documents: BrowserDoc[] };

/** Lista de grupos/documentos com busca instantânea (acessível, alvos grandes) */
export function DocumentBrowser({ groups }: { groups: BrowserGroup[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return groups;
    return groups
      .map((g) => ({
        ...g,
        documents: g.title.toLowerCase().includes(q)
          ? g.documents
          : g.documents.filter((d) => d.title.toLowerCase().includes(q)),
      }))
      .filter((g) => g.documents.length > 0);
  }, [groups, query]);

  const total = groups.reduce((n, g) => n + g.documents.length, 0);

  return (
    <div className="space-y-6">
      <label className="relative block">
        <span className="sr-only">Buscar documento</span>
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" aria-hidden />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Buscar entre ${total} documentos (ex.: ata, 2025, lei)…`}
          className="w-full rounded-md border border-slate-200 bg-white py-4 pl-12 pr-4 text-base focus:border-[var(--color-brand-blue)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-blue)]/30"
        />
      </label>

      {filtered.length === 0 && (
        <p className="rounded-md border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
          Nenhum documento encontrado para “{query}”.
        </p>
      )}

      {filtered.map((group, gi) => (
        <details
          key={group.id}
          open={gi === 0 || query.length > 0}
          className="group overflow-hidden rounded-md border border-slate-200 bg-white"
        >
          <summary className="flex min-h-[64px] cursor-pointer list-none items-center justify-between gap-4 px-6 py-4 hover:bg-slate-50">
            <span className="text-lg font-bold text-slate-900">{group.title}</span>
            <span className="flex items-center gap-3 text-sm text-slate-500">
              {group.documents.length} {group.documents.length === 1 ? "documento" : "documentos"}
              <ChevronDown className="h-5 w-5 transition-transform group-open:rotate-180" aria-hidden />
            </span>
          </summary>

          {group.documents.length === 0 ? (
            <p className="border-t border-slate-100 px-6 py-4 text-sm text-slate-500">Nenhum documento publicado ainda.</p>
          ) : (
            <ul className="divide-y divide-slate-100 border-t border-slate-100">
              {group.documents.map((d) => (
                <li key={d.id}>
                  <a
                    href={d.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex min-h-[56px] items-center gap-4 px-6 py-3 transition-colors hover:bg-[var(--color-brand-blue)]/5"
                  >
                    <span className="shrink-0 text-[var(--color-brand-blue)]">
                      <FileText className="h-5 w-5" aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold text-slate-900">{d.title}</span>
                      <span className="text-xs uppercase text-slate-500">
                        {d.ext}
                        {d.size && ` · ${d.size}`}
                      </span>
                    </span>
                    <span className="hidden items-center gap-1.5 text-sm font-bold text-[var(--color-brand-blue)] sm:flex">
                      <Download className="h-4 w-4" aria-hidden />
                      Abrir
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </details>
      ))}
    </div>
  );
}

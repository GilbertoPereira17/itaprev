import { Search } from "lucide-react";

/** Campo de busca simples (GET), funciona sem JavaScript */
export function SearchBox({
  action = "/busca",
  defaultValue = "",
  placeholder = "O que você procura? Ex.: holerite, ata, recadastramento",
  label = "Buscar no site",
}: {
  action?: string;
  defaultValue?: string;
  placeholder?: string;
  label?: string;
}) {
  return (
    <form action={action} role="search" className="flex gap-2">
      <label className="sr-only" htmlFor={`busca-${action}`}>{label}</label>
      <input
        id={`busca-${action}`}
        name="q"
        type="search"
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 focus:border-[var(--color-brand-blue)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-blue)]/30"
      />
      <button
        type="submit"
        className="flex items-center gap-2 rounded-xl bg-[var(--color-brand-blue)] px-5 py-3 text-base font-bold text-white hover:bg-[var(--color-brand-navy)]"
      >
        <Search className="h-5 w-5" aria-hidden />
        <span className="hidden sm:inline">Buscar</span>
      </button>
    </form>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, Home, LogOut, MessageSquare, ShieldCheck, UserRound } from "lucide-react";

const ITEMS = [
  { href: "/beneficiario", label: "Início", icon: Home, exact: true },
  { href: "/beneficiario/dados", label: "Meus dados", icon: UserRound },
  { href: "/beneficiario/solicitacoes", label: "Solicitações", icon: MessageSquare },
  { href: "/beneficiario/documentos", label: "Documentos", icon: FileText },
  { href: "/beneficiario/seguranca", label: "Segurança", icon: ShieldCheck },
];

export function BenefNav({ logout }: { logout: () => Promise<void> }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Área do Beneficiário" className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible">
      {ITEMS.map((i) => {
        const active = i.exact ? pathname === i.href : pathname.startsWith(i.href);
        return (
          <Link
            key={i.href}
            href={i.href}
            aria-current={active ? "page" : undefined}
            className={`flex shrink-0 items-center gap-2.5 rounded-xl px-4 py-3 text-base font-semibold ${
              active ? "bg-[var(--color-brand-blue)] text-white" : "bg-white text-slate-700 ring-1 ring-slate-200 hover:ring-[var(--color-brand-blue)]"
            }`}
          >
            <i.icon className="h-5 w-5" aria-hidden /> {i.label}
          </Link>
        );
      })}
      <form action={logout} className="shrink-0">
        <button className="flex w-full items-center gap-2.5 rounded-xl px-4 py-3 text-base font-semibold text-slate-600 hover:text-red-700">
          <LogOut className="h-5 w-5" aria-hidden /> Sair
        </button>
      </form>
    </nav>
  );
}

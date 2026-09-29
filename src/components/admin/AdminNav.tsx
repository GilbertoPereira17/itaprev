"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard, Newspaper, FileText, FolderOpen, Images, HelpCircle, Settings, Users, KeyRound, Menu, X, ExternalLink,
} from "lucide-react";

const items = [
  { href: "/admin", label: "Início", icon: LayoutDashboard, exact: true },
  { href: "/admin/noticias", label: "Notícias", icon: Newspaper },
  { href: "/admin/documentos", label: "Documentos", icon: FolderOpen },
  { href: "/admin/paginas", label: "Páginas", icon: FileText },
  { href: "/admin/slides", label: "Banner (slides)", icon: Images },
  { href: "/admin/faq", label: "Perguntas frequentes", icon: HelpCircle },
  { href: "/admin/configuracoes", label: "Contatos e links", icon: Settings },
  { href: "/admin/usuarios", label: "Usuários", icon: Users, adminOnly: true },
  { href: "/admin/conta", label: "Minha senha", icon: KeyRound },
];

export function AdminNav({ role }: { role: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const links = (
    <nav className="space-y-1" aria-label="Menu do painel">
      {items
        .filter((i) => !i.adminOnly || role === "admin")
        .map((i) => {
          const active = i.exact ? pathname === i.href : pathname.startsWith(i.href);
          return (
            <Link
              key={i.href}
              href={i.href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                active ? "bg-white/15 text-white" : "text-slate-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              <i.icon className="h-5 w-5" aria-hidden />
              {i.label}
            </Link>
          );
        })}
      <a
        href="/"
        target="_blank"
        className="mt-4 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-300 hover:bg-white/10 hover:text-white"
      >
        <ExternalLink className="h-5 w-5" aria-hidden /> Ver o site
      </a>
    </nav>
  );

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed left-4 top-4 z-50 rounded-xl bg-[var(--color-brand-navy)] p-2.5 text-white shadow-lg lg:hidden"
        aria-label={open ? "Fechar menu" : "Abrir menu"}
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>
      <div className="hidden lg:block">{links}</div>
      {open && (
        <div className="fixed inset-0 z-40 bg-[var(--color-brand-navy)] p-6 pt-20 lg:hidden">{links}</div>
      )}
    </>
  );
}

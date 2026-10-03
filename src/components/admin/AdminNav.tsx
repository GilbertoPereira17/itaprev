"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard, Newspaper, FileText, FolderOpen, Images, HelpCircle, Settings, Users, KeyRound, Menu, X, ExternalLink, Inbox, History,
} from "lucide-react";

type Item = {
  href: string;
  label: string;
  hint?: string;
  icon: typeof Newspaper;
  exact?: boolean;
  adminOnly?: boolean;
  badge?: boolean;
};

const groups: { title?: string; items: Item[] }[] = [
  { items: [{ href: "/admin", label: "Início", icon: LayoutDashboard, exact: true }] },
  {
    title: "Conteúdo do site",
    items: [
      { href: "/admin/noticias", label: "Notícias", icon: Newspaper },
      { href: "/admin/paginas", label: "Páginas de texto", hint: "Aposentados, Pensionistas, Ativos…", icon: FileText },
      { href: "/admin/documentos", label: "Documentos", hint: "Transparência, Conselhos, Pró-Gestão", icon: FolderOpen },
      { href: "/admin/slides", label: "Banner da página inicial", icon: Images },
      { href: "/admin/faq", label: "Perguntas frequentes", icon: HelpCircle },
    ],
  },
  {
    title: "Atendimento",
    items: [{ href: "/admin/mensagens", label: "Mensagens e Ouvidoria", icon: Inbox, badge: true }],
  },
  {
    title: "Configurações",
    items: [
      { href: "/admin/configuracoes", label: "Contatos e links", hint: "Telefones, endereço, horários", icon: Settings },
      { href: "/admin/usuarios", label: "Usuários", icon: Users, adminOnly: true },
      { href: "/admin/auditoria", label: "Registro de atividades", hint: "Quem fez o quê no painel", icon: History, adminOnly: true },
      { href: "/admin/conta", label: "Minha conta", hint: "Senha e verificação em duas etapas", icon: KeyRound },
    ],
  },
];

export function AdminNav({ role, newMessages = 0 }: { role: string; newMessages?: number }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const links = (
    <nav className="space-y-0.5" aria-label="Menu do painel">
      {groups.map((g, gi) => {
        const visible = g.items.filter((i) => !i.adminOnly || role === "admin");
        if (!visible.length) return null;
        return (
          <div key={gi} className={g.title ? "pt-4" : ""}>
            {g.title && (
              <p className="mb-1 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">{g.title}</p>
            )}
            {visible.map((i) => {
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
                  <i.icon className="h-5 w-5 shrink-0" aria-hidden />
                  <span className="min-w-0 flex-1">
                    <span className="block">{i.label}</span>
                    {i.hint && <span className="block truncate text-[11px] font-normal text-slate-400">{i.hint}</span>}
                  </span>
                  {i.badge && newMessages > 0 && (
                    <span className="rounded-full bg-amber-400 px-2 py-0.5 text-xs font-bold text-slate-900" aria-label={`${newMessages} novas`}>
                      {newMessages}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
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
        <div className="fixed inset-0 z-40 overflow-y-auto bg-[var(--color-brand-navy)] p-6 pt-20 lg:hidden">{links}</div>
      )}
    </>
  );
}

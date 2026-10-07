"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown, Phone, MessageCircle, UserRound, Search } from "lucide-react";
import type { NavSection, SiteSettings } from "@/lib/content";

type NavItem = { label: string; href: string };
type NavEntry = { label: string; href?: string; children?: NavItem[] };

function buildNav(navSections: NavSection[]): NavEntry[] {
  const conselhos = navSections
    .filter((s) => s.area === "Conselhos")
    .map((s) => ({ label: s.title, href: `/documentos/${s.slug}` }));

  return [
    { label: "Início", href: "/" },
    {
      label: "Institucional",
      children: [
        { label: "Sobre o Instituto", href: "/institucional" },
        { label: "Pró-Gestão", href: "/documentos/pro-gestao" },
        { label: "Eleição dos Conselhos", href: "/documentos/eleicao" },
      ],
    },
    {
      label: "Segurados",
      children: [
        { label: "Aposentados", href: "/aposentados" },
        { label: "Pensionistas", href: "/pensionistas" },
        { label: "Servidores Ativos", href: "/ativos" },
      ],
    },
    conselhos.length
      ? { label: "Conselhos", children: [...conselhos, { label: "Visão geral", href: "/conselhos" }] }
      : { label: "Conselhos", href: "/conselhos" },
    { label: "Transparência", href: "/transparencia" },
    { label: "Notícias", href: "/noticias" },
    { label: "Contato", href: "/contato" },
  ];
}

export function Header({ navSections, settings }: { navSections: NavSection[]; settings: SiteSettings }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const pathname = usePathname();
  const nav = buildNav(navSections);
  // Botão "Área do Beneficiário": área própria (/beneficiario) quando ativada nas Configurações;
  // senão, o Portal do Segurado atual
  const areaHref = settings["link.areaBeneficiario"] || settings["link.portalSegurado"] || "#";
  const areaExternal = /^https?:\/\//.test(areaHref);
  const areaLinkProps = areaExternal ? { target: "_blank", rel: "noopener noreferrer" } : {};
  const phone = settings["contato.telefone"] || "(13) 3427-7183";
  const whatsapp = settings["contato.whatsapp"] || "(13) 3426-9426";
  const whatsappUrl = settings["contato.whatsappUrl"] || "#";

  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  // Na Home, o menu fica transparente sobre o banner até a página rolar
  const overHero = pathname === "/";
  const clear = overHero && !scrolled && !mobileOpen;
  const idle = clear ? "text-white hover:text-white/75" : "text-slate-800 hover:text-[var(--color-brand-blue)]";
  const active = clear ? "text-white" : "text-[var(--color-brand-blue)]";

  const isActive = (entry: NavEntry) =>
    entry.href ? (entry.href === "/" ? pathname === "/" : pathname.startsWith(entry.href)) : entry.children?.some((c) => pathname.startsWith(c.href));

  return (
    <header
      className={`${overHero ? "fixed inset-x-0" : "sticky"} top-0 z-40 transition-colors duration-300 ${
        clear ? "bg-transparent" : "bg-white shadow-[0_1px_0_rgba(15,23,42,0.08)]"
      }`}
    >
      {/* Barra de serviço */}
      <div className={`text-[13px] text-slate-200 transition-colors duration-300 ${clear ? "border-b border-white/10 bg-black/20" : "bg-[var(--color-brand-navy)]"}`}>
        <div className="mx-auto flex h-9 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <span className="hidden truncate md:block">Instituto de Previdência dos Servidores Públicos de Itanhaém</span>
          <div className="flex items-center gap-5">
            <a href={`tel:${phone.replace(/\D/g, "")}`} className="hidden items-center gap-1.5 hover:text-white sm:flex">
              <Phone className="h-3.5 w-3.5" aria-hidden /> {phone}
            </a>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-white">
              <MessageCircle className="h-3.5 w-3.5" aria-hidden /> WhatsApp {whatsapp}
            </a>
          </div>
        </div>
      </div>

      {/* Cabeçalho principal */}
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="shrink-0" aria-label="Itanhaém Prev — página inicial">
          <Image src="/images/Logo.png" alt="Itanhaém Prev" width={206} height={45} priority className={`h-10 w-auto transition-[filter] duration-300 sm:h-11 ${clear ? "brightness-0 invert" : ""}`} />
        </Link>

        <nav id="menu-principal" tabIndex={-1} aria-label="Menu principal" className="hidden items-center focus:outline-none lg:flex">
          {nav.map((entry) =>
            entry.children ? (
              <div
                key={entry.label}
                className="relative"
                onMouseEnter={() => setOpenMenu(entry.label)}
                onMouseLeave={() => setOpenMenu(null)}
              >
                <button
                  className={`flex items-center gap-1 px-3 py-7 text-[15px] font-semibold transition-colors xl:px-3.5 ${
                    isActive(entry) ? active : idle
                  }`}
                  aria-expanded={openMenu === entry.label}
                  aria-haspopup="true"
                  onClick={() => setOpenMenu(openMenu === entry.label ? null : entry.label)}
                >
                  {entry.label}
                  <ChevronDown className="h-4 w-4 opacity-60" aria-hidden />
                </button>
                {openMenu === entry.label && (
                  <div className="absolute left-0 top-full w-64 border border-slate-200 bg-white py-2 shadow-lg">
                    {entry.children.map((c) => (
                      <Link
                        key={c.href}
                        href={c.href}
                        onClick={() => setOpenMenu(null)}
                        className="block px-4 py-2.5 text-[15px] text-slate-700 hover:bg-slate-50 hover:text-[var(--color-brand-blue)]"
                      >
                        {c.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={entry.label}
                href={entry.href!}
                className={`px-3 py-7 text-[15px] font-semibold transition-colors xl:px-3.5 ${
                  isActive(entry)
                    ? `${active} ${clear ? "shadow-[inset_0_-3px_0_white]" : "shadow-[inset_0_-3px_0_var(--color-brand-blue)]"}`
                    : idle
                }`}
              >
                {entry.label}
              </Link>
            )
          )}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/busca"
            aria-label="Buscar no site"
            title="Buscar no site"
            className={`rounded-md p-2.5 ${clear ? "text-white hover:bg-white/10" : "text-slate-800 hover:bg-slate-100"}`}
          >
            <Search className="h-5 w-5" aria-hidden />
          </Link>
          <a
            href={areaHref}
            {...areaLinkProps}
            className="hidden items-center gap-2 rounded-md bg-[var(--color-brand-blue)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--color-brand-navy)] sm:flex"
          >
            <UserRound className="h-4 w-4" aria-hidden />
            Área do Beneficiário
          </a>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`rounded-md p-2 lg:hidden ${clear ? "text-white hover:bg-white/10" : "text-slate-800 hover:bg-slate-100"}`}
            aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
          </button>
        </div>
      </div>

      {/* Menu mobile */}
      {mobileOpen && (
        <nav aria-label="Menu principal" className="max-h-[75vh] overflow-y-auto border-t border-slate-200 bg-white px-4 pb-6 pt-2 lg:hidden">
          {nav.map((entry) =>
            entry.children ? (
              <details key={entry.label} className="group border-b border-slate-100">
                <summary className="flex cursor-pointer list-none items-center justify-between py-4 text-lg font-semibold text-slate-900">
                  {entry.label}
                  <ChevronDown className="h-5 w-5 transition-transform group-open:rotate-180" aria-hidden />
                </summary>
                <div className="pb-3 pl-3">
                  {entry.children.map((c) => (
                    <Link key={c.href} href={c.href} onClick={() => setMobileOpen(false)} className="block py-2.5 text-base text-slate-700">
                      {c.label}
                    </Link>
                  ))}
                </div>
              </details>
            ) : (
              <Link
                key={entry.label}
                href={entry.href!}
                onClick={() => setMobileOpen(false)}
                className="block border-b border-slate-100 py-4 text-lg font-semibold text-slate-900"
              >
                {entry.label}
              </Link>
            )
          )}
          <a
            href={areaHref}
            {...areaLinkProps}
            className="mt-4 flex items-center justify-center gap-2 rounded-md bg-[var(--color-brand-blue)] py-3.5 text-base font-semibold text-white"
          >
            <UserRound className="h-5 w-5" aria-hidden /> Área do Beneficiário
          </a>
        </nav>
      )}
    </header>
  );
}

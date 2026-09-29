import React from "react";
import Image from "next/image";
import Link from "next/link";
import { INSTITUTION_INFO } from "@/data/institution";
import type { SiteSettings } from "@/lib/content";

const navLinks = [
  { label: "Institucional", href: "/institucional" },
  { label: "Aposentados", href: "/aposentados" },
  { label: "Pensionistas", href: "/pensionistas" },
  { label: "Servidores ativos", href: "/ativos" },
  { label: "Conselhos", href: "/conselhos" },
  { label: "Transparência", href: "/transparencia" },
  { label: "Notícias", href: "/noticias" },
  { label: "Contato", href: "/contato" },
];

export function Footer({ settings = {} }: { settings?: SiteSettings }) {
  const L = INSTITUTION_INFO.externalLinks;
  const get = (key: string, fallback: string) => settings[key] || fallback;

  const services = [
    { label: "Holerite (Servidor Online)", href: get("link.holerite", L.holeriteSystem) },
    { label: "Informe de rendimentos", href: get("link.portalSegurado", L.protecWeb) },
    { label: "Recadastramento", href: get("link.censoManual", L.censoManual) },
    { label: "Ouvidoria", href: get("link.ouvidoriaForm", L.ouvidoriaForm) },
    { label: "Portal da Transparência", href: get("link.transparencia", L.transparencyPortal) },
  ];
  const gov = [
    { label: "Prefeitura de Itanhaém", href: get("link.prefeitura", L.prefeitura) },
    { label: "Câmara Municipal", href: get("link.camara", L.camara) },
    { label: "Tribunal de Contas (TCE-SP)", href: get("link.tce", L.tcesp) },
  ];

  const col = "text-sm font-semibold uppercase tracking-wide text-slate-400";
  const link = "text-[15px] text-slate-200 hover:text-white hover:underline";

  return (
    <footer className="mt-auto bg-[var(--color-brand-navy)] text-slate-300">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div>
          <Image src="/images/Logo.png" alt="Itanhaém Prev" width={206} height={45} className="h-10 w-auto brightness-0 invert" />
          <p className="mt-4 text-[15px] leading-relaxed text-slate-300">
            Instituto de Previdência dos Servidores Públicos do Município de Itanhaém.
          </p>
          <address className="mt-4 space-y-1 text-[15px] not-italic text-slate-300">
            <p>{get("contato.endereco", INSTITUTION_INFO.address.full)}</p>
            <p>Telefone: {get("contato.telefone", INSTITUTION_INFO.contacts.phone)}</p>
            <p>WhatsApp: {get("contato.whatsapp", INSTITUTION_INFO.contacts.whatsapp)}</p>
            <p>{get("contato.horario", INSTITUTION_INFO.contacts.hours)}</p>
          </address>
        </div>

        <nav aria-label="Páginas do site">
          <h2 className={col}>Navegação</h2>
          <ul className="mt-4 space-y-2">
            {navLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className={link}>{l.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className={col}>Serviços</h2>
          <ul className="mt-4 space-y-2">
            {services.map((l) => (
              <li key={l.label}>
                <a href={l.href} target="_blank" rel="noopener noreferrer" className={link}>{l.label}</a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className={col}>Órgãos públicos</h2>
          <ul className="mt-4 space-y-2">
            {gov.map((l) => (
              <li key={l.label}>
                <a href={l.href} target="_blank" rel="noopener noreferrer" className={link}>{l.label}</a>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex items-center gap-3">
            <Image src="/images/selo-300x300-pro-gestao-2.png" alt="" width={44} height={44} className="h-11 w-11" />
            <span className="text-sm text-slate-300">Certificação Pró-Gestão RPPS Nível II</span>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-sm text-slate-400 sm:flex-row sm:justify-between sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} Itanhaém Prev · CNPJ {INSTITUTION_INFO.cnpj}</p>
          <p>Lei de Acesso à Informação · LGPD · Desenvolvido por Trius Tecnologia</p>
        </div>
      </div>
    </footer>
  );
}

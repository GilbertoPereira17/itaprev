import React from "react";
import Image from "next/image";
import { MapPin, Clock, Phone, MessageCircle, Mail } from "lucide-react";
import type { SiteInfo } from "@/lib/site-info";

/** Atendimento presencial e canais de contato, com a foto real da sede */
export function WhereWeAre({ info }: { info: SiteInfo }) {
  const c = info.contacts;
  const rows = [
    { icon: MapPin, label: "Endereço", value: info.address.full },
    { icon: Clock, label: "Horário", value: c.hours },
    { icon: Phone, label: "Telefone", value: c.phone, href: `tel:${c.phone.replace(/\D/g, "")}` },
    { icon: MessageCircle, label: "WhatsApp", value: c.whatsapp, href: c.whatsappUrl },
    { icon: Mail, label: "E-mail", value: c.email, href: `mailto:${c.email}` },
  ];

  return (
    <section aria-labelledby="atendimento-titulo" className="bg-white">
      <div className="mx-auto grid max-w-7xl items-start gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div className="relative aspect-[16/10] overflow-hidden rounded-md border border-slate-200">
          <Image
            src="/images/fachada.jpg"
            alt="Fachada da sede do Itanhaém Prev, na Rua José Mendes de Araújo, 219"
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>

        <div>
          <h2 id="atendimento-titulo" className="text-2xl font-bold text-slate-900 sm:text-3xl">
            Atendimento
          </h2>
          <p className="mt-2 text-slate-600">Atendimento presencial na sede do Instituto e pelos canais abaixo.</p>

          <dl className="mt-6 divide-y divide-slate-200 border-y border-slate-200">
            {rows.map((r) => (
              <div key={r.label} className="flex gap-4 py-3.5">
                <r.icon className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-brand-blue)]" aria-hidden />
                <dt className="w-24 shrink-0 font-semibold text-slate-900">{r.label}</dt>
                <dd className="min-w-0 text-slate-700 [overflow-wrap:anywhere]">
                  {r.href ? (
                    <a href={r.href} className="hover:text-[var(--color-brand-blue)] hover:underline" target={r.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer">
                      {r.value}
                    </a>
                  ) : (
                    r.value
                  )}
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-6 flex flex-wrap gap-3">
            <a href={c.whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-md bg-[#1f8f4e] px-5 py-3 font-semibold text-white hover:bg-[#177a41]">
              <MessageCircle className="h-5 w-5" aria-hidden /> Falar pelo WhatsApp
            </a>
            <a href={info.address.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-800 hover:border-slate-400">
              <MapPin className="h-5 w-5" aria-hidden /> Como chegar
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

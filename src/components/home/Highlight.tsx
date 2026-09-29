import React from "react";
import Image from "next/image";
import { CalendarCheck, ExternalLink, MessageCircle } from "lucide-react";
import type { SiteInfo } from "@/lib/site-info";
import { BrandMark } from "@/components/layout/BrandMark";

/** Faixa de destaque: recadastramento anual (serviço obrigatório mais importante para o segurado) */
export function Highlight({ info }: { info: SiteInfo }) {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
        <div className="relative grid overflow-hidden rounded-lg bg-[var(--color-brand-blue)] lg:grid-cols-2">
          <div className="relative min-h-[240px]">
            <Image src="/images/slide-censo.jpg" alt="" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
          </div>
          <div className="relative px-6 py-10 text-white sm:px-10 lg:py-14">
            <BrandMark className="pointer-events-none absolute -right-6 -top-8 h-44 w-40 opacity-[0.15]" />
            <div className="relative">
              <p className="flex items-center gap-2 text-sm font-semibold text-sky-100">
                <CalendarCheck className="h-5 w-5" aria-hidden /> Obrigatório para aposentados e pensionistas
              </p>
              <h2 className="mt-3 text-3xl font-bold leading-tight">Recadastramento anual</h2>
              <p className="mt-3 max-w-lg text-lg leading-relaxed text-sky-50">
                Mantenha o cadastro em dia para não ter o benefício suspenso. Veja o passo a passo e faça pela internet,
                ou procure o atendimento presencial.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <a
                  href={info.externalLinks.censoManual}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-md bg-white px-5 py-3 font-bold text-[var(--color-brand-blue)] hover:bg-sky-50"
                >
                  Ver passo a passo <ExternalLink className="h-4 w-4" aria-hidden />
                </a>
                <a
                  href={info.contacts.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-md border border-white/50 px-5 py-3 font-bold text-white hover:bg-white/10"
                >
                  <MessageCircle className="h-5 w-5" aria-hidden /> Tirar dúvidas
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

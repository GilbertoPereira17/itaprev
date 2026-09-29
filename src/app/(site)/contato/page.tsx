import Link from "next/link";
import { MapPin, Phone, Mail, Clock, ExternalLink } from "lucide-react";
import { MessageForm } from "@/components/content/MessageForm";
import { INSTITUTION_INFO } from "@/data/institution";
import { PageHero } from "@/components/layout/PageHero";

const contactItems = [
  {
    icon: MapPin,
    title: "Endereço",
    lines: [INSTITUTION_INFO.address.full],
    link: { label: "Ver no Google Maps", href: INSTITUTION_INFO.address.googleMapsUrl },
  },
  {
    icon: Phone,
    title: "Telefones",
    lines: [`Fixo: ${INSTITUTION_INFO.contacts.phone}`, `WhatsApp: ${INSTITUTION_INFO.contacts.whatsapp}`],
  },
  {
    icon: Mail,
    title: "E-mails",
    lines: [INSTITUTION_INFO.contacts.email, INSTITUTION_INFO.contacts.ouvidoriaEmail],
  },
  {
    icon: Clock,
    title: "Horário de funcionamento",
    lines: [INSTITUTION_INFO.contacts.hours],
  },
];

export default function ContatoPage() {
  return (
    <div className="bg-white py-10 sm:py-12">
      <div className="mx-auto max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
        <PageHero
          breadcrumb="Canais de Atendimento"
          eyebrow="Fale conosco"
          title="Atendimento e Ouvidoria"
          description="Estamos à disposição para esclarecer dúvidas, receber sugestões e prestar suporte aos servidores de Itanhaém."
        />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Contato direto */}
          <div className="space-y-6 lg:col-span-5">
            <div className="space-y-6 rounded-md border border-slate-200 bg-white p-8">
              <h2 className="text-2xl font-bold text-slate-900">Atendimento presencial e telefônico</h2>

              <div className="space-y-4 text-sm text-slate-700">
                {contactItems.map((item) => (
                  <div key={item.title} className="flex items-start gap-3">
                    <div className="shrink-0p-2.5 text-[var(--color-brand-blue)]">
                      <item.icon className="h-5 w-5" strokeWidth={2} aria-hidden />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">{item.title}</div>
                      {item.lines.map((line) => (
                        <div key={line} className="mt-0.5 text-slate-600">
                          {line}
                        </div>
                      ))}
                      {item.link && (
                        <a
                          href={item.link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-[var(--color-brand-blue)] hover:underline"
                        >
                          <span>{item.link.label}</span>
                          <ExternalLink className="h-3 w-3" aria-hidden />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <a
                href={INSTITUTION_INFO.contacts.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-md bg-emerald-600 py-4 text-base font-bold text-white transition-colors hover:bg-emerald-700"
              >
                <Phone className="h-5 w-5" aria-hidden />
                <span>Conversar no WhatsApp oficial</span>
              </a>
            </div>

            {/* Ouvidoria */}
            <div
              id="ouvidoria"
              className="flex scroll-mt-28 items-center justify-between gap-4 rounded-md border border-[var(--color-brand-blue)]/15 bg-[var(--color-brand-blue)]/5 p-6"
            >
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900">Canal oficial de Ouvidoria</h3>
                <p className="text-xs text-slate-600">
                  Envie elogios, reclamações, denúncias ou solicitações da LAI, com sigilo garantido.
                </p>
              </div>
              <Link
                href="/ouvidoria"
                className="shrink-0 rounded-xl bg-[var(--color-brand-blue)] px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-[var(--color-brand-navy)]"
              >
                Abrir Ouvidoria
              </Link>
            </div>
          </div>

          {/* Formulário */}
          <div className="lg:col-span-7">
            <div className="space-y-6 rounded-md border border-slate-200 bg-white p-8 sm:p-10">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Envie sua mensagem</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Preencha os campos abaixo para enviar sua solicitação à nossa equipe.
                </p>
              </div>

              <MessageForm kind="contato" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

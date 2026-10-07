import Link from "next/link";
import { ShieldCheck, Mail, Clock, Search } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import { MessageForm } from "@/components/content/MessageForm";
import { getSettings } from "@/lib/content";
import { buildInfo } from "@/lib/site-info";

export const metadata = { title: "Ouvidoria" };

export default async function OuvidoriaPage() {
  const info = buildInfo(await getSettings());

  return (
    <div className="bg-white py-10 sm:py-12">
      <div className="mx-auto max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
        <PageHero
          breadcrumb="Ouvidoria"
          eyebrow="Canal oficial"
          title="Ouvidoria"
          description="Registre elogios, sugestões, reclamações, denúncias ou pedidos de acesso à informação. Toda manifestação recebe um número de protocolo."
        />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-5">
            <div className="space-y-4 rounded-md border border-slate-200 bg-white p-8 text-sm text-slate-700">
              <h2 className="text-xl font-bold text-slate-900">Como funciona</h2>
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-brand-blue)]" aria-hidden />
                <p>
                  Seus dados são tratados com sigilo e usados apenas para o atendimento. Se preferir, a manifestação
                  pode ser anônima.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-brand-blue)]" aria-hidden />
                <p>
                  Pedidos de acesso à informação seguem os prazos da Lei de Acesso à Informação (Lei nº 12.527/2011).
                </p>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-brand-blue)]" aria-hidden />
                <p>
                  Também é possível escrever para{" "}
                  <a href={`mailto:${info.contacts.ouvidoriaEmail}`} className="font-semibold text-[var(--color-brand-blue)] hover:underline">
                    {info.contacts.ouvidoriaEmail}
                  </a>
                  .
                </p>
              </div>
              <div className="flex items-start gap-3">
                <Search className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-brand-blue)]" aria-hidden />
                <p>
                  Já tem um protocolo?{" "}
                  <Link href="/acompanhar" className="font-semibold text-[var(--color-brand-blue)] hover:underline">
                    Acompanhe o andamento
                  </Link>
                  .
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="space-y-6 rounded-md border border-slate-200 bg-white p-8 sm:p-10">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Registrar manifestação</h2>
                <p className="mt-1 text-sm text-slate-600">Preencha os campos abaixo. Ao enviar, você recebe o número de protocolo.</p>
              </div>
              <MessageForm kind="ouvidoria" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { PageHero } from "@/components/layout/PageHero";

/** Moldura das telas de acesso da Área do Beneficiário */
export function AccessShell({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white py-10 sm:py-12">
      <div className="mx-auto max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
        <PageHero breadcrumb="Área do Beneficiário" title={title} description={description} />
        <div className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">{children}</div>
      </div>
    </div>
  );
}

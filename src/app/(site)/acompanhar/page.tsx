import { PageHero } from "@/components/layout/PageHero";
import { TrackForm } from "@/components/content/TrackForm";

export const metadata = { title: "Acompanhar protocolo" };

export default async function AcompanharPage(props: { searchParams: Promise<{ protocolo?: string }> }) {
  const { protocolo } = await props.searchParams;

  return (
    <div className="bg-white py-10 sm:py-12">
      <div className="mx-auto max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
        <PageHero
          breadcrumb="Acompanhar protocolo"
          eyebrow="Atendimento"
          title="Acompanhar protocolo"
          description="Consulte a situação da sua mensagem ou manifestação na Ouvidoria e veja a resposta do Instituto."
        />
        <div className="mx-auto max-w-xl rounded-md border border-slate-200 bg-white p-8 sm:p-10">
          <TrackForm protocol={(protocolo ?? "").slice(0, 20)} />
        </div>
      </div>
    </div>
  );
}

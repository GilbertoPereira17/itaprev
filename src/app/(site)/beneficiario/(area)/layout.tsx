import { requireBeneficiary } from "@/lib/beneficiary";
import { benefLogout } from "../(acesso)/actions";
import { BenefNav } from "./BenefNav";

export const metadata = { title: "Área do Beneficiário", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function BenefAreaLayout({ children }: { children: React.ReactNode }) {
  const b = await requireBeneficiary();
  return (
    <div className="bg-slate-50 py-8 sm:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="mb-1 text-sm font-semibold uppercase tracking-wide text-[var(--color-brand-blue)]">Área do Beneficiário</p>
        <p className="mb-6 text-2xl font-bold text-slate-900">Olá, {b.name.split(" ")[0]}</p>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_1fr]">
          <aside className="min-w-0"><BenefNav logout={benefLogout} /></aside>
          <div className="min-w-0 space-y-6">{children}</div>
        </div>
      </div>
    </div>
  );
}

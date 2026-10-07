/** Cartão branco das telas da Área do Beneficiário */
export function BCard({ title, children, className = "" }: { title?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7 ${className}`}>
      {title && <h2 className="mb-4 text-xl font-bold text-slate-900">{title}</h2>}
      {children}
    </section>
  );
}

/** Mensagem de ?ok= / ?erro= */
export function BFlash({ ok, erro }: { ok?: string; erro?: string }) {
  if (!ok && !erro) return null;
  return (
    <p
      role={erro ? "alert" : "status"}
      className={`rounded-xl border px-4 py-3 text-base font-medium ${erro ? "border-red-200 bg-red-50 text-red-800" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`}
    >
      {erro || ok}
    </p>
  );
}

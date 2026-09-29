import Image from "next/image";
import { LogOut } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { AdminNav } from "@/components/admin/AdminNav";
import { logoutAction } from "../login/actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Painel", robots: { index: false, follow: false } };

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  return (
    <div className="flex min-h-screen w-full bg-slate-100">
      <aside className="flex w-0 shrink-0 flex-col bg-[var(--color-brand-navy)] lg:w-64 lg:p-5">
        <div className="relative mb-8 hidden h-10 w-44 lg:block">
          <Image src="/images/logo-branco.png" alt="Itanhaém Prev" fill className="object-contain object-left" />
        </div>
        <AdminNav role={user.role} />
        <div className="mt-auto hidden border-t border-white/10 pt-4 lg:block">
          <p className="truncate text-sm font-semibold text-white">{user.name}</p>
          <p className="text-xs text-slate-400">{user.role === "admin" ? "Administrador" : "Editor"}</p>
          <form action={logoutAction} className="mt-3">
            <button className="flex items-center gap-2 text-sm font-semibold text-slate-300 hover:text-white">
              <LogOut className="h-4 w-4" aria-hidden /> Sair
            </button>
          </form>
        </div>
      </aside>
      <main className="min-w-0 flex-1 px-4 pb-16 pt-20 sm:px-8 lg:pt-10">
        <div className="mx-auto max-w-5xl">{children}</div>
      </main>
    </div>
  );
}

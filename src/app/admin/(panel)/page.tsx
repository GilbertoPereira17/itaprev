import Link from "next/link";
import { count, eq } from "drizzle-orm";
import { Newspaper, FolderOpen, FileText, Images, HelpCircle, Settings, Inbox } from "lucide-react";
import { db, schema } from "@/db";
import { getSession } from "@/lib/auth";

export default async function Dashboard() {
  const session = await getSession();
  const [[news], [docs], [pages], [sections], [newMsgs]] = await Promise.all([
    db.select({ n: count() }).from(schema.news),
    db.select({ n: count() }).from(schema.documents),
    db.select({ n: count() }).from(schema.pages),
    db.select({ n: count() }).from(schema.docSections),
    db.select({ n: count() }).from(schema.messages).where(eq(schema.messages.status, "nova")),
  ]);

  const cards = [
    {
      href: "/admin/mensagens",
      label: "Mensagens e Ouvidoria",
      desc: newMsgs.n ? `${newMsgs.n} nova(s) aguardando` : "Nenhuma mensagem nova",
      icon: Inbox,
    },
    { href: "/admin/noticias/novo", label: "Publicar notícia", desc: `${news.n} publicadas`, icon: Newspaper },
    { href: "/admin/documentos", label: "Documentos", desc: `${docs.n} arquivos em ${sections.n} seções`, icon: FolderOpen },
    { href: "/admin/paginas", label: "Páginas de texto", desc: `${pages.n} páginas (Aposentados, Pensionistas…)`, icon: FileText },
    { href: "/admin/slides", label: "Banner da página inicial", desc: "Imagens e textos do topo do site", icon: Images },
    { href: "/admin/faq", label: "Perguntas frequentes", desc: "Dúvidas dos segurados", icon: HelpCircle },
    { href: "/admin/configuracoes", label: "Contatos e links", desc: "Telefone, endereço, horários", icon: Settings },
  ];

  return (
    <>
      <h1 className="text-2xl font-extrabold text-slate-900">Olá, {session?.name?.split(" ")[0]}</h1>
      <p className="mb-8 mt-1 text-slate-500">O que você quer atualizar no site hoje?</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[var(--color-brand-blue)] hover:shadow-md"
          >
            <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-brand-blue)]/10 text-[var(--color-brand-blue)]">
              <c.icon className="h-6 w-6" aria-hidden />
            </span>
            <span className="block font-bold text-slate-900 group-hover:text-[var(--color-brand-blue)]">{c.label}</span>
            <span className="text-sm text-slate-500">{c.desc}</span>
          </Link>
        ))}
      </div>
    </>
  );
}

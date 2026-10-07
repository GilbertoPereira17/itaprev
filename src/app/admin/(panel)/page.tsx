import Link from "next/link";
import { count, eq } from "drizzle-orm";
import { Bot, Newspaper, FolderOpen, FileText, Images, HelpCircle, Settings, Inbox, ShieldAlert } from "lucide-react";
import { db, schema } from "@/db";
import { requireUser } from "@/lib/auth";
import { canAccess, type ModuleKey } from "@/lib/permissions";
import { Flash } from "@/components/admin/ui";

export default async function Dashboard(props: { searchParams: Promise<{ ok?: string; erro?: string }> }) {
  const searchParams = await props.searchParams;
  const session = await requireUser();
  const [me] = await db.select({ totpEnabled: schema.users.totpEnabled }).from(schema.users).where(eq(schema.users.id, session.uid));
  const [[news], [docs], [pages], [sections], [newMsgs]] = await Promise.all([
    db.select({ n: count() }).from(schema.news),
    db.select({ n: count() }).from(schema.documents),
    db.select({ n: count() }).from(schema.pages),
    db.select({ n: count() }).from(schema.docSections),
    db.select({ n: count() }).from(schema.messages).where(eq(schema.messages.status, "nova")),
  ]);

  const cards: { href: string; label: string; desc: string; icon: typeof Inbox; module: ModuleKey }[] = [
    {
      href: "/admin/mensagens",
      label: "Mensagens e Ouvidoria",
      desc: newMsgs.n ? `${newMsgs.n} nova(s) aguardando` : "Nenhuma mensagem nova",
      icon: Inbox,
      module: "mensagens",
    },
    { href: "/admin/assistente", label: "Assistente virtual", desc: "O que a Ita sabe e o que perguntam", icon: Bot, module: "chatbot" },
    { href: "/admin/noticias/novo", label: "Publicar notícia", desc: `${news.n} publicadas`, icon: Newspaper, module: "noticias" },
    { href: "/admin/documentos", label: "Documentos", desc: `${docs.n} arquivos em ${sections.n} seções`, icon: FolderOpen, module: "documentos" },
    { href: "/admin/paginas", label: "Páginas de texto", desc: `${pages.n} páginas (Aposentados, Pensionistas…)`, icon: FileText, module: "paginas" },
    { href: "/admin/slides", label: "Banner da página inicial", desc: "Imagens e textos do topo do site", icon: Images, module: "slides" },
    { href: "/admin/faq", label: "Perguntas frequentes", desc: "Dúvidas dos segurados", icon: HelpCircle, module: "faq" },
    { href: "/admin/configuracoes", label: "Contatos e links", desc: "Telefone, endereço, horários", icon: Settings, module: "configuracoes" },
  ];

  return (
    <>
      <h1 className="text-2xl font-extrabold text-slate-900">Olá, {session.name.split(" ")[0]}</h1>
      <p className="mb-8 mt-1 text-slate-500">O que você quer atualizar no site hoje?</p>
      <Flash {...searchParams} />
      {me && !me.totpEnabled && (
        <Link
          href="/admin/conta"
          className="mb-6 flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900 hover:border-amber-300"
        >
          <ShieldAlert className="h-6 w-6 shrink-0 text-amber-500" aria-hidden />
          <span>
            <strong>Proteja sua conta:</strong> ative a verificação em duas etapas (código no celular). Leva 1 minuto.
          </span>
        </Link>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.filter((c) => canAccess(session, c.module)).map((c) => (
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

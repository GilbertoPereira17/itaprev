import "server-only";
import { unstable_noStore as noStore } from "next/cache";
import { asc, desc, eq, and } from "drizzle-orm";
import { db, schema } from "@/db";

/** Configurações do site (contatos, links) como mapa chave → valor */
export type SiteSettings = Record<string, string>;

export async function getSettings(): Promise<SiteSettings> {
  noStore();
  const rows = await db.select().from(schema.settings);
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}

export async function getSlides() {
  noStore();
  return db
    .select()
    .from(schema.slides)
    .where(eq(schema.slides.active, true))
    .orderBy(asc(schema.slides.sortOrder), asc(schema.slides.id));
}

export async function getLatestNews(limit = 3) {
  noStore();
  return db
    .select()
    .from(schema.news)
    .where(eq(schema.news.published, true))
    .orderBy(desc(schema.news.publishedAt))
    .limit(limit);
}

export async function getAllNews() {
  noStore();
  return db
    .select()
    .from(schema.news)
    .where(eq(schema.news.published, true))
    .orderBy(desc(schema.news.publishedAt));
}

export async function getNewsBySlug(slug: string) {
  noStore();
  const [row] = await db
    .select()
    .from(schema.news)
    .where(and(eq(schema.news.slug, slug), eq(schema.news.published, true)));
  return row ?? null;
}

export async function getFaqs() {
  noStore();
  return db
    .select()
    .from(schema.faqs)
    .where(eq(schema.faqs.active, true))
    .orderBy(asc(schema.faqs.sortOrder), asc(schema.faqs.id));
}

export async function getPage(slug: string) {
  noStore();
  const [row] = await db
    .select()
    .from(schema.pages)
    .where(and(eq(schema.pages.slug, slug), eq(schema.pages.published, true)));
  return row ?? null;
}

/** Seções de documentos publicadas, agrupadas por área (para menu e rodapé) */
export type NavSection = { slug: string; title: string; area: string };

export async function getNavSections(): Promise<NavSection[]> {
  noStore();
  return db
    .select({ slug: schema.docSections.slug, title: schema.docSections.title, area: schema.docSections.area })
    .from(schema.docSections)
    .where(eq(schema.docSections.published, true))
    .orderBy(asc(schema.docSections.area), asc(schema.docSections.sortOrder), asc(schema.docSections.title));
}

/** Uma seção com seus grupos e documentos, na ordem definida no painel */
export async function getDocSection(slug: string) {
  noStore();
  const [section] = await db
    .select()
    .from(schema.docSections)
    .where(and(eq(schema.docSections.slug, slug), eq(schema.docSections.published, true)));
  if (!section) return null;

  const groups = await db
    .select()
    .from(schema.docGroups)
    .where(eq(schema.docGroups.sectionId, section.id))
    .orderBy(asc(schema.docGroups.sortOrder), asc(schema.docGroups.id));

  const docs = groups.length
    ? await db
        .select({ doc: schema.documents })
        .from(schema.documents)
        .innerJoin(schema.docGroups, eq(schema.documents.groupId, schema.docGroups.id))
        .where(eq(schema.docGroups.sectionId, section.id))
        .orderBy(asc(schema.documents.sortOrder), asc(schema.documents.id))
    : [];

  return {
    ...section,
    groups: groups.map((g) => ({ ...g, documents: docs.map((d) => d.doc).filter((d) => d.groupId === g.id) })),
  };
}

/** Pega uma configuração com valor de reserva */
export function s(settings: SiteSettings, key: string, fallback = "") {
  return settings[key] || fallback;
}

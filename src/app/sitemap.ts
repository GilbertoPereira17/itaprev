import type { MetadataRoute } from "next";
import { asc, eq } from "drizzle-orm";
import { db, schema } from "@/db";

export const dynamic = "force-dynamic";

const BASE = (process.env.SITE_URL || "https://www.itanhaemprev.sp.gov.br").replace(/\/$/, "");

/** sitemap.xml gerado a partir do banco: sempre reflete o que está publicado */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const fixed = ["", "/institucional", "/segurados", "/conselhos", "/transparencia", "/noticias", "/contato", "/ouvidoria", "/acompanhar", "/privacidade"];
  const [news, pages, sections] = await Promise.all([
    db.select({ slug: schema.news.slug, at: schema.news.updatedAt }).from(schema.news).where(eq(schema.news.published, true)),
    db.select({ slug: schema.pages.slug, at: schema.pages.updatedAt }).from(schema.pages).where(eq(schema.pages.published, true)),
    db
      .select({ slug: schema.docSections.slug, at: schema.docSections.updatedAt })
      .from(schema.docSections)
      .where(eq(schema.docSections.published, true))
      .orderBy(asc(schema.docSections.sortOrder)),
  ]);
  return [
    ...fixed.map((p) => ({ url: `${BASE}${p}`, changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.8 })),
    ...pages.map((p) => ({ url: `${BASE}/${p.slug}`, lastModified: p.at, priority: 0.7 })),
    ...sections.map((s) => ({ url: `${BASE}/documentos/${s.slug}`, lastModified: s.at, priority: 0.6 })),
    ...news.map((n) => ({ url: `${BASE}/noticias/${n.slug}`, lastModified: n.at, priority: 0.5 })),
  ];
}

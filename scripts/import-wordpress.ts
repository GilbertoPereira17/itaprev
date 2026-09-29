/**
 * Importa o conteúdo do site WordPress atual (itanhaemprev.sp.gov.br) para o novo sistema:
 *  - páginas de documentos → Seções / Grupos / Documentos (os arquivos são BAIXADOS para UPLOAD_DIR)
 *  - páginas de texto (Aposentados, Pensionistas, Ativos) → Páginas
 *  - posts → Notícias
 *
 * Uso:
 *   npm run db:import-wp              → importa o que ainda não existe
 *   npm run db:import-wp -- --dry     → só mostra o que seria importado
 *   npm run db:import-wp -- --force   → recria as seções que já existem (APAGA os documentos
 *                                       delas; em produção exige ALLOW_DESTRUCTIVE_IMPORT=1)
 */
import "./load-env";
import fs from "node:fs/promises";
import path from "node:path";
import { eq } from "drizzle-orm";
import { openDb, schema } from "./db";
import { cleanHtml } from "../src/lib/sanitize";
import { slugify } from "../src/lib/format";

const WP = process.env.WP_URL || "https://www.itanhaemprev.sp.gov.br";
const API = `${WP}/wp-json/wp/v2`;
const DRY = process.argv.includes("--dry");
const FORCE = process.argv.includes("--force");
const IS_PRODUCTION_DB = (process.env.DATABASE_URL || "").startsWith("postgres");
const UPLOAD_ROOT = path.resolve(process.env.UPLOAD_DIR || "./uploads");
const ALLOWED_EXT = ["pdf", "doc", "docx", "xls", "xlsx", "jpg", "jpeg", "png", "webp"];

/** slug no WP → { slug novo, título, área do menu, ordem } */
const SECTIONS: Record<string, { slug: string; title: string; area: string; order: number }> = {
  "conselho-de-administracao": { slug: "conselho-de-administracao", title: "Conselho de Administração", area: "Conselhos", order: 1 },
  "conselho-fiscal": { slug: "conselho-fiscal", title: "Conselho Fiscal", area: "Conselhos", order: 2 },
  "comite-de-investimentos": { slug: "comite-de-investimentos", title: "Comitê de Investimentos", area: "Conselhos", order: 3 },
  investimentos: { slug: "investimentos", title: "Investimentos", area: "Investimentos", order: 1 },
  "politica-de-investimentos": { slug: "politica-de-investimentos", title: "Política de Investimentos", area: "Investimentos", order: 2 },
  "legislacao-investimentos": { slug: "legislacao-de-investimentos", title: "Legislação de Investimentos", area: "Investimentos", order: 3 },
  legislacao: { slug: "legislacao", title: "Legislação", area: "Legislação", order: 1 },
  "legislacao-administracao": { slug: "legislacao-administracao", title: "Legislação — Administração", area: "Legislação", order: 2 },
  "legislacao-fiscal": { slug: "legislacao-fiscal", title: "Legislação — Fiscal", area: "Legislação", order: 3 },
  "relatorios-mensais-e-anuais": { slug: "relatorios-mensais-e-anuais", title: "Relatórios Mensais e Anuais", area: "Transparência", order: 1 },
  "demonstrativos-contabeis-anuais": { slug: "demonstrativos-contabeis", title: "Demonstrativos Contábeis Anuais", area: "Transparência", order: 2 },
  "contas-anuais-2": { slug: "contas-anuais", title: "Contas Anuais (Tribunal de Contas)", area: "Transparência", order: 3 },
  parecer: { slug: "pareceres", title: "Pareceres", area: "Transparência", order: 4 },
  draa: { slug: "draa", title: "DRAA", area: "Transparência", order: 5 },
  "avaliacao-atuarial": { slug: "avaliacao-atuarial", title: "Avaliação Atuarial", area: "Transparência", order: 6 },
  relatorio_gestao_atuarial: { slug: "relatorio-de-gestao-atuarial", title: "Relatório de Gestão Atuarial", area: "Transparência", order: 7 },
  "demonstrativo-viabilidade": { slug: "demonstrativo-de-viabilidade", title: "Demonstrativo de Viabilidade", area: "Transparência", order: 8 },
  controle_interno: { slug: "controle-interno", title: "Controle Interno", area: "Transparência", order: 9 },
  planejamento: { slug: "planejamento", title: "Planejamento", area: "Transparência", order: 10 },
  "pro-gestao": { slug: "pro-gestao", title: "Pró-Gestão", area: "Institucional", order: 1 },
  eleicao: { slug: "eleicao", title: "Eleição dos Conselhos", area: "Institucional", order: 2 },
};

const TEXT_PAGES: Record<string, string> = {
  aposentados: "Aposentados",
  pensionistas: "Pensionistas",
  ativos: "Servidores Ativos",
};

// Posts que não entram (tom institucional: substituídos por versões sóbrias já cadastradas)
const SKIP_POSTS = [/excelencia/i];

type WpPage = { id: number; slug: string; title: { rendered: string }; content: { rendered: string } };
type WpPost = WpPage & { date: string; excerpt: { rendered: string }; featured_media: number };

const decode = (s: string) =>
  s
    .replace(/<[^>]+>/g, "")
    .replace(/&#8211;|&#8212;/g, "—")
    .replace(/&#8217;/g, "’")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;|&#160;/g, " ")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/[​-‍﻿]/g, "")
    .replace(/\s+/g, " ")
    .trim();

async function getJson<T>(url: string): Promise<T> {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${r.status} em ${url}`);
  return (await r.json()) as T;
}

/** Extrai grupos/itens do HTML do Elementor, na ordem em que aparecem */
function parseSection(html: string) {
  const groups: { title: string; items: { title: string; url: string }[] }[] = [];
  // Dois formatos no WP: Elementor (títulos + caixas com título linkado) e listas <li><a>.
  // Título sem link = novo grupo; título ou item de lista com link = documento.
  const re = /<h([1-6])[^>]*>([\s\S]*?)<\/h\1>|<li[^>]*>([\s\S]*?)<\/li>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    const isHeading = m[2] !== undefined;
    const inner = m[2] ?? m[3] ?? "";
    const href = inner.match(/href="([^"]+)"/)?.[1];
    const title = decode(inner);
    if (!title) continue;
    if (!href) {
      // Caixa de documento (icon-box) sem arquivo não é grupo — é item vazio
      if (isHeading && !/icon-box-title/.test(m[0])) groups.push({ title, items: [] });
      continue; // item sem arquivo (ex.: mês futuro)
    }
    if (!groups.length) groups.push({ title: "Documentos", items: [] });
    groups[groups.length - 1].items.push({ title: capitalize(title), url: href.replace(/&amp;/g, "&") });
  }
  // Grupos com título mas sem arquivos são descartados; títulos de grupo "vazios" repetidos também
  return groups.filter((g) => g.items.length > 0).map((g) => ({ ...g, title: capitalize(g.title) }));
}

function capitalize(t: string) {
  // "ATAS 2026" → "Atas 2026" (mantém siglas curtas como DRAA/ALM)
  if (t !== t.toUpperCase()) return t;
  return t
    .toLowerCase()
    .split(" ")
    .map((w, i) =>
      /^(draa|alm|cmn|rpps|tce|cnd|crp|lai|i|ii|iii)$/.test(w)
        ? w.toUpperCase()
        : i > 0 && /^(de|da|do|das|dos|e|a|o|em|para|por)$/.test(w)
          ? w
          : w.charAt(0).toUpperCase() + w.slice(1)
    )
    .join(" ");
}

async function download(url: string, folder: string): Promise<{ path: string; size: number; mime: string } | null> {
  const clean = url.split("?")[0];
  const ext = (clean.split(".").pop() || "").toLowerCase();
  if (!ALLOWED_EXT.includes(ext)) return { path: url, size: 0, mime: "text/html" }; // link externo (não é arquivo)
  const base = decodeURIComponent(path.basename(clean)).replace(/[^a-zA-Z0-9._-]+/g, "-");
  const dir = path.join(UPLOAD_ROOT, folder);
  const target = path.join(dir, base);
  const mime =
    { pdf: "application/pdf", jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp" }[ext] ||
    "application/octet-stream";
  try {
    const stat = await fs.stat(target).catch(() => null);
    if (stat) return { path: `uploads/${folder}/${base}`, size: stat.size, mime };
    const r = await fetch(url);
    if (!r.ok) throw new Error(String(r.status));
    const buf = Buffer.from(await r.arrayBuffer());
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(target, buf);
    return { path: `uploads/${folder}/${base}`, size: buf.length, mime };
  } catch (e) {
    console.warn(`   ! falha ao baixar ${url} (${(e as Error).message}) — mantendo link original`);
    return { path: url, size: 0, mime };
  }
}

/** Executa tarefas com limite de concorrência */
async function pool<T, R>(items: T[], limit: number, fn: (t: T) => Promise<R>) {
  const out: R[] = new Array(items.length);
  let i = 0;
  await Promise.all(
    Array.from({ length: limit }, async () => {
      while (i < items.length) {
        const idx = i++;
        out[idx] = await fn(items[idx]);
      }
    })
  );
  return out;
}

async function main() {
  console.log(`Importando de ${WP}${DRY ? " (SIMULAÇÃO)" : ""}\n`);
  const { db, close } = await openDb();
  const pages = await getJson<WpPage[]>(`${API}/pages?per_page=100&_fields=id,slug,title,content`);

  // ---------- Seções de documentos ----------
  let totalDocs = 0;
  for (const [wpSlug, meta] of Object.entries(SECTIONS)) {
    const page = pages.find((p) => p.slug === wpSlug);
    if (!page) {
      console.log(`- ${meta.title}: página não encontrada no WordPress`);
      continue;
    }
    const groups = parseSection(page.content.rendered);
    const n = groups.reduce((a, g) => a + g.items.length, 0);
    totalDocs += n;
    console.log(`• ${meta.title}: ${groups.length} grupos, ${n} documentos`);
    if (DRY) {
      groups.slice(0, 3).forEach((g) => console.log(`    ${g.title}: ${g.items.slice(0, 3).map((i) => i.title).join(", ")}…`));
      continue;
    }

    const [existing] = await db.select().from(schema.docSections).where(eq(schema.docSections.slug, meta.slug));
    if (existing && !FORCE) {
      console.log("    já existe — pulando (use --force para recriar)");
      continue;
    }
    if (existing) {
      // --force apaga a seção inteira (grupos e documentos em cascata), inclusive o que a
      // equipe publicou pelo painel. Em produção exige confirmação explícita.
      const docs = await db
        .select({ id: schema.documents.id })
        .from(schema.documents)
        .innerJoin(schema.docGroups, eq(schema.documents.groupId, schema.docGroups.id))
        .where(eq(schema.docGroups.sectionId, existing.id));
      if (IS_PRODUCTION_DB && process.env.ALLOW_DESTRUCTIVE_IMPORT !== "1") {
        console.log(
          `    ✖ BLOQUEADO: recriar apagaria ${docs.length} documento(s) desta seção em produção.\n` +
            "      Nada foi alterado. Se for intencional (e houver backup), rode com ALLOW_DESTRUCTIVE_IMPORT=1."
        );
        continue;
      }
      console.log(`    recriando — ${docs.length} documento(s) existentes serão substituídos`);
      await db.delete(schema.docSections).where(eq(schema.docSections.id, existing.id));
    }

    // Texto introdutório da página (quando houver), sem os títulos/itens
    const intro = decode(
      page.content.rendered.replace(/<h[1-6][^>]*>[\s\S]*?<\/h[1-6]>/gi, "").replace(/<a [\s\S]*?<\/a>/gi, "")
    ).slice(0, 600);

    const [section] = await db
      .insert(schema.docSections)
      .values({ slug: meta.slug, title: meta.title, area: meta.area, sortOrder: meta.order, description: intro.length > 40 ? intro : "" })
      .returning({ id: schema.docSections.id });

    for (let gi = 0; gi < groups.length; gi++) {
      const g = groups[gi];
      const [group] = await db
        .insert(schema.docGroups)
        .values({ sectionId: section.id, title: g.title, sortOrder: gi })
        .returning({ id: schema.docGroups.id });
      const files = await pool(g.items, 4, (it) => download(it.url, `documentos/${meta.slug}`));
      const rows = g.items
        .map((it, i) => ({ it, f: files[i], i }))
        .filter((x) => x.f)
        .map(({ it, f, i }) => ({
          groupId: group.id,
          title: it.title,
          filePath: f!.path,
          mimeType: f!.mime,
          fileSize: f!.size,
          sortOrder: i,
        }));
      if (rows.length) await db.insert(schema.documents).values(rows);
    }
  }
  console.log(`\nTotal de documentos: ${totalDocs}\n`);

  // ---------- Páginas de texto ----------
  for (const [wpSlug, title] of Object.entries(TEXT_PAGES)) {
    const page = pages.find((p) => p.slug === wpSlug);
    if (!page) continue;
    const [exists] = await db.select().from(schema.pages).where(eq(schema.pages.slug, wpSlug));
    console.log(`• Página ${title}${exists ? " (já existe — pulando)" : ""}`);
    if (DRY || exists) continue;
    await db.insert(schema.pages).values({ slug: wpSlug, title, content: cleanHtml(page.content.rendered) });
  }

  // ---------- Notícias ----------
  const posts = await getJson<WpPost[]>(`${API}/posts?per_page=100&_fields=id,slug,date,title,content,excerpt,featured_media`);
  const existingNews = await db.select({ slug: schema.news.slug, title: schema.news.title }).from(schema.news);
  const norm = (t: string) => decode(t).toLowerCase();
  for (const p of posts) {
    const title = decode(p.title.rendered);
    const dup = existingNews.some((n) => n.slug === p.slug || norm(n.title) === norm(title));
    const skip = SKIP_POSTS.some((r) => r.test(p.slug));
    console.log(`• Notícia "${title}"${dup ? " (já existe)" : skip ? " (ignorada: tom)" : ""}`);
    if (DRY || dup || skip) continue;

    let coverPath = "";
    if (p.featured_media) {
      try {
        const media = await getJson<{ source_url: string }>(`${API}/media/${p.featured_media}?_fields=source_url`);
        coverPath = (await download(media.source_url, "noticias"))?.path ?? "";
      } catch {
        /* sem capa */
      }
    }
    await db.insert(schema.news).values({
      title: capitalize(title),
      // slugs automáticos do Elementor (elementor-123) viram endereço legível
      slug: /^elementor-|^\d+$/.test(p.slug) ? slugify(title) : p.slug,
      category: "Institucional",
      summary: decode(p.excerpt.rendered).slice(0, 280),
      content: cleanHtml(p.content.rendered),
      coverPath,
      publishedAt: new Date(p.date),
    });
  }

  await close();
  console.log("\n✔ Importação concluída.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

"use server";

import { and, eq, ne } from "drizzle-orm";
import { db, schema } from "@/db";
import { requireModule } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { bool, done, fail, int, str } from "@/lib/admin";
import { slugify } from "@/lib/format";
import { cleanHtml } from "@/lib/sanitize";

/** Endereços usados por páginas fixas do site — não podem ser usados por páginas editáveis */
const RESERVED = ["admin", "noticias", "documentos", "transparencia", "institucional", "segurados", "conselhos", "contato", "uploads", "images", "ouvidoria", "privacidade", "busca"];

export async function savePage(fd: FormData) {
  const me = await requireModule("paginas");
  const id = int(fd, "id");
  const back = id ? `/admin/paginas/${id}` : "/admin/paginas/nova";
  const title = str(fd, "title");
  if (!title) fail(back, "Informe o título.");

  const slug = slugify(str(fd, "slug") || title);
  if (RESERVED.includes(slug)) fail(back, `O endereço "/${slug}" é reservado pelo site. Escolha outro.`);
  const clash = await db
    .select({ id: schema.pages.id })
    .from(schema.pages)
    .where(id ? and(eq(schema.pages.slug, slug), ne(schema.pages.id, id)) : eq(schema.pages.slug, slug));
  if (clash.length) fail(back, "Já existe uma página com esse endereço.");

  const values = {
    title,
    slug,
    summary: str(fd, "summary"),
    content: cleanHtml(str(fd, "content")),
    published: bool(fd, "published"),
    updatedAt: new Date(),
  };

  if (id) {
    await db.update(schema.pages).set(values).where(eq(schema.pages.id, id));
    await audit(me, "Editou página", `${title} (/${slug})`);
    done(back, "Página salva.");
  }
  const [row] = await db.insert(schema.pages).values(values).returning({ id: schema.pages.id });
  await audit(me, "Criou página", `${title} (/${slug})`);
  done(`/admin/paginas/${row.id}`, "Página criada.");
}

export async function deletePage(fd: FormData) {
  const me = await requireModule("paginas");
  const [old] = await db.select().from(schema.pages).where(eq(schema.pages.id, int(fd, "id")));
  if (old) {
    await db.delete(schema.pages).where(eq(schema.pages.id, old.id));
    await audit(me, "Excluiu página", `${old.title} (/${old.slug})`);
  }
  done("/admin/paginas", "Página excluída.");
}

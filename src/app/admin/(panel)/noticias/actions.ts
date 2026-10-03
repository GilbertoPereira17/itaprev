"use server";

import { and, eq, ne } from "drizzle-orm";
import { db, schema } from "@/db";
import { requireUser } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { bool, done, fail, file, int, str } from "@/lib/admin";
import { slugify } from "@/lib/format";
import { cleanHtml } from "@/lib/sanitize";
import { deleteUpload, saveUpload, UploadError } from "@/lib/storage";

export async function saveNews(fd: FormData) {
  const me = await requireUser();
  const id = int(fd, "id");
  const back = id ? `/admin/noticias/${id}` : "/admin/noticias/novo";

  const title = str(fd, "title");
  if (!title) fail(back, "Informe o título.");

  let slug = slugify(str(fd, "slug") || title);
  // Garante slug único
  const clash = await db
    .select({ id: schema.news.id })
    .from(schema.news)
    .where(id ? and(eq(schema.news.slug, slug), ne(schema.news.id, id)) : eq(schema.news.slug, slug));
  if (clash.length) slug = `${slug}-${Date.now().toString(36)}`;

  const dateStr = str(fd, "publishedAt");
  const values = {
    title,
    slug,
    category: str(fd, "category") || "Institucional",
    summary: str(fd, "summary"),
    content: cleanHtml(str(fd, "content")),
    published: bool(fd, "published"),
    publishedAt: dateStr ? new Date(`${dateStr}T12:00:00-03:00`) : new Date(),
    updatedAt: new Date(),
  };

  let coverPath: string | undefined;
  const cover = file(fd, "cover");
  try {
    if (cover) coverPath = (await saveUpload(cover, "noticias", true)).path;
  } catch (e) {
    if (e instanceof UploadError) fail(back, e.message);
    throw e;
  }

  if (id) {
    const [old] = await db.select().from(schema.news).where(eq(schema.news.id, id));
    if (!old) fail("/admin/noticias", "Notícia não encontrada.");
    const removeCover = bool(fd, "removeCover");
    if ((coverPath || removeCover) && old.coverPath) await deleteUpload(old.coverPath);
    await db
      .update(schema.news)
      .set({ ...values, ...(coverPath ? { coverPath } : removeCover ? { coverPath: "" } : {}) })
      .where(eq(schema.news.id, id));
    await audit(me, "Editou notícia", title);
    done(`/admin/noticias/${id}`, "Notícia salva.");
  }

  const [row] = await db
    .insert(schema.news)
    .values({ ...values, coverPath: coverPath ?? "" })
    .returning({ id: schema.news.id });
  await audit(me, values.published ? "Publicou notícia" : "Criou notícia (não publicada)", title);
  done(`/admin/noticias/${row.id}`, "Notícia publicada.");
}

export async function deleteNews(fd: FormData) {
  const me = await requireUser();
  const id = int(fd, "id");
  const [old] = await db.select().from(schema.news).where(eq(schema.news.id, id));
  if (old) {
    await deleteUpload(old.coverPath);
    await db.delete(schema.news).where(eq(schema.news.id, id));
    await audit(me, "Excluiu notícia", old.title);
  }
  done("/admin/noticias", "Notícia excluída.");
}

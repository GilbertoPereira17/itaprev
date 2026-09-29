"use server";

import { and, eq, ne, inArray } from "drizzle-orm";
import { db, schema } from "@/db";
import { requireUser } from "@/lib/auth";
import { bool, done, fail, file, int, str } from "@/lib/admin";
import { slugify } from "@/lib/format";
import { deleteUpload, saveUpload, UploadError } from "@/lib/storage";

// ---------- Seções ----------
export async function saveSection(fd: FormData) {
  await requireUser();
  const id = int(fd, "id");
  const back = id ? `/admin/documentos/${id}` : "/admin/documentos";
  const title = str(fd, "title");
  if (!title) fail(back, "Informe o nome da seção.");

  const slug = slugify(str(fd, "slug") || title);
  const clash = await db
    .select({ id: schema.docSections.id })
    .from(schema.docSections)
    .where(id ? and(eq(schema.docSections.slug, slug), ne(schema.docSections.id, id)) : eq(schema.docSections.slug, slug));
  if (clash.length) fail(back, "Já existe uma seção com esse endereço.");

  const values = {
    title,
    slug,
    area: str(fd, "area") || "Transparência",
    description: str(fd, "description"),
    sortOrder: int(fd, "sortOrder"),
    published: id ? bool(fd, "published") : true,
    updatedAt: new Date(),
  };

  if (id) {
    await db.update(schema.docSections).set(values).where(eq(schema.docSections.id, id));
    done(back, "Seção salva.");
  }
  const [row] = await db.insert(schema.docSections).values(values).returning({ id: schema.docSections.id });
  done(`/admin/documentos/${row.id}`, "Seção criada. Agora adicione os grupos e documentos.");
}

export async function deleteSection(fd: FormData) {
  await requireUser();
  const id = int(fd, "id");
  const groups = await db.select({ id: schema.docGroups.id }).from(schema.docGroups).where(eq(schema.docGroups.sectionId, id));
  if (groups.length) {
    const docs = await db
      .select({ filePath: schema.documents.filePath })
      .from(schema.documents)
      .where(inArray(schema.documents.groupId, groups.map((g) => g.id)));
    for (const d of docs) await deleteUpload(d.filePath);
  }
  await db.delete(schema.docSections).where(eq(schema.docSections.id, id)); // cascata apaga grupos/documentos
  done("/admin/documentos", "Seção excluída.");
}

// ---------- Grupos ----------
export async function saveGroup(fd: FormData) {
  await requireUser();
  const sectionId = int(fd, "sectionId");
  const id = int(fd, "id");
  const back = `/admin/documentos/${sectionId}`;
  const title = str(fd, "title");
  if (!title) fail(back, "Informe o nome do grupo.");
  if (id) {
    await db.update(schema.docGroups).set({ title, sortOrder: int(fd, "sortOrder") }).where(eq(schema.docGroups.id, id));
    done(back, "Grupo salvo.");
  }
  await db.insert(schema.docGroups).values({ sectionId, title, sortOrder: int(fd, "sortOrder") });
  done(back, `Grupo "${title}" criado.`);
}

export async function deleteGroup(fd: FormData) {
  await requireUser();
  const id = int(fd, "id");
  const sectionId = int(fd, "sectionId");
  const docs = await db.select({ filePath: schema.documents.filePath }).from(schema.documents).where(eq(schema.documents.groupId, id));
  for (const d of docs) await deleteUpload(d.filePath);
  await db.delete(schema.docGroups).where(eq(schema.docGroups.id, id));
  done(`/admin/documentos/${sectionId}`, "Grupo excluído.");
}

// ---------- Documentos ----------
export async function addDocuments(fd: FormData) {
  await requireUser();
  const groupId = int(fd, "groupId");
  const sectionId = int(fd, "sectionId");
  const back = `/admin/documentos/${sectionId}`;
  const files = fd.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  const title = str(fd, "title");
  if (files.length === 0) fail(back, "Selecione ao menos um arquivo.");

  const existing = await db.select({ id: schema.documents.id }).from(schema.documents).where(eq(schema.documents.groupId, groupId));
  let order = existing.length;
  try {
    for (const f of files) {
      const saved = await saveUpload(f, `documentos/${sectionId}`);
      await db.insert(schema.documents).values({
        groupId,
        // Um arquivo: usa o título digitado; vários: usa o nome de cada arquivo
        title: files.length === 1 && title ? title : f.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "),
        filePath: saved.path,
        mimeType: saved.mime,
        fileSize: saved.size,
        sortOrder: order++,
      });
    }
  } catch (e) {
    if (e instanceof UploadError) fail(back, e.message);
    throw e;
  }
  done(back, files.length === 1 ? "Documento adicionado." : `${files.length} documentos adicionados.`);
}

export async function updateDocument(fd: FormData) {
  await requireUser();
  const id = int(fd, "id");
  const sectionId = int(fd, "sectionId");
  const back = `/admin/documentos/${sectionId}`;
  const title = str(fd, "title");
  if (!title) fail(back, "O título do documento não pode ficar vazio.");

  const replacement = file(fd, "file");
  const patch: Partial<typeof schema.documents.$inferInsert> = { title, sortOrder: int(fd, "sortOrder") };
  if (replacement) {
    try {
      const saved = await saveUpload(replacement, `documentos/${sectionId}`);
      const [old] = await db.select().from(schema.documents).where(eq(schema.documents.id, id));
      if (old) await deleteUpload(old.filePath);
      Object.assign(patch, { filePath: saved.path, mimeType: saved.mime, fileSize: saved.size });
    } catch (e) {
      if (e instanceof UploadError) fail(back, e.message);
      throw e;
    }
  }
  await db.update(schema.documents).set(patch).where(eq(schema.documents.id, id));
  done(back, "Documento atualizado.");
}

export async function deleteDocument(fd: FormData) {
  await requireUser();
  const id = int(fd, "id");
  const sectionId = int(fd, "sectionId");
  const [old] = await db.select().from(schema.documents).where(eq(schema.documents.id, id));
  if (old) {
    await deleteUpload(old.filePath);
    await db.delete(schema.documents).where(eq(schema.documents.id, id));
  }
  done(`/admin/documentos/${sectionId}`, "Documento excluído.");
}

"use server";

import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { requireUser } from "@/lib/auth";
import { bool, done, fail, file, int, str } from "@/lib/admin";
import { deleteUpload, saveUpload, UploadError } from "@/lib/storage";

export async function saveSlide(fd: FormData) {
  await requireUser();
  const id = int(fd, "id");
  const back = "/admin/slides";
  const title = str(fd, "title");
  if (!title) fail(back, "Informe o título do slide.");

  const values = {
    tag: str(fd, "tag"),
    title,
    description: str(fd, "description"),
    buttonLabel: str(fd, "buttonLabel"),
    buttonUrl: str(fd, "buttonUrl"),
    sortOrder: int(fd, "sortOrder"),
    active: bool(fd, "active"),
    updatedAt: new Date(),
  };

  let imagePath: string | undefined;
  const img = file(fd, "image");
  try {
    if (img) imagePath = (await saveUpload(img, "slides", true)).path;
  } catch (e) {
    if (e instanceof UploadError) fail(back, e.message);
    throw e;
  }

  if (id) {
    if (imagePath) {
      const [old] = await db.select().from(schema.slides).where(eq(schema.slides.id, id));
      if (old) await deleteUpload(old.imagePath);
    }
    await db.update(schema.slides).set({ ...values, ...(imagePath ? { imagePath } : {}) }).where(eq(schema.slides.id, id));
    done(back, "Slide salvo.");
  }
  if (!imagePath) fail(back, "Envie uma imagem de fundo para o novo slide.");
  await db.insert(schema.slides).values({ ...values, imagePath });
  done(back, "Slide criado.");
}

export async function deleteSlide(fd: FormData) {
  await requireUser();
  const id = int(fd, "id");
  const [old] = await db.select().from(schema.slides).where(eq(schema.slides.id, id));
  if (old) {
    await deleteUpload(old.imagePath);
    await db.delete(schema.slides).where(eq(schema.slides.id, id));
  }
  done("/admin/slides", "Slide excluído.");
}

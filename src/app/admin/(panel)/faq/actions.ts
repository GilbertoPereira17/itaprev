"use server";

import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { requireUser } from "@/lib/auth";
import { bool, done, fail, int, str } from "@/lib/admin";

export async function saveFaq(fd: FormData) {
  await requireUser();
  const id = int(fd, "id");
  const question = str(fd, "question");
  const answer = str(fd, "answer");
  if (!question || !answer) fail("/admin/faq", "Preencha a pergunta e a resposta.");
  const values = { question, answer, sortOrder: int(fd, "sortOrder"), active: bool(fd, "active") };
  if (id) await db.update(schema.faqs).set(values).where(eq(schema.faqs.id, id));
  else await db.insert(schema.faqs).values(values);
  done("/admin/faq", id ? "Pergunta salva." : "Pergunta adicionada.");
}

export async function deleteFaq(fd: FormData) {
  await requireUser();
  await db.delete(schema.faqs).where(eq(schema.faqs.id, int(fd, "id")));
  done("/admin/faq", "Pergunta excluída.");
}

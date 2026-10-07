"use server";

import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { requireModule } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { bool, done, fail, int, str } from "@/lib/admin";

const BACK = "/admin/assistente";

export async function saveKnowledge(fd: FormData) {
  const me = await requireModule("chatbot");
  const id = int(fd, "id");
  const title = str(fd, "title");
  const content = str(fd, "content").slice(0, 4000);
  if (!title || !content) fail(BACK, "Preencha o assunto e a informação.");
  const values = { title, content, sortOrder: int(fd, "sortOrder"), active: id ? bool(fd, "active") : true, updatedAt: new Date() };
  if (id) await db.update(schema.chatbotKnowledge).set(values).where(eq(schema.chatbotKnowledge.id, id));
  else await db.insert(schema.chatbotKnowledge).values(values);
  await audit(me, id ? "Editou informação da assistente virtual" : "Adicionou informação à assistente virtual", title);
  done(BACK, id ? "Informação salva. A Ita já usa a nova versão." : "Informação adicionada. A Ita já passa a usá-la.");
}

export async function deleteKnowledge(fd: FormData) {
  const me = await requireModule("chatbot");
  const [old] = await db.select().from(schema.chatbotKnowledge).where(eq(schema.chatbotKnowledge.id, int(fd, "id")));
  if (old) {
    await db.delete(schema.chatbotKnowledge).where(eq(schema.chatbotKnowledge.id, old.id));
    await audit(me, "Excluiu informação da assistente virtual", old.title);
  }
  done(BACK, "Informação excluída.");
}

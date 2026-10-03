"use server";

import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { requireUser } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { done, int, str } from "@/lib/admin";
import { MESSAGE_STATUS } from "@/lib/messages";

/** Atualiza status e anotação interna. Mensagens não são excluídas (histórico da ouvidoria). */
export async function updateMessage(fd: FormData) {
  const me = await requireUser();
  const id = int(fd, "id");
  const status = str(fd, "status");
  const [msg] = await db.select({ protocol: schema.messages.protocol }).from(schema.messages).where(eq(schema.messages.id, id));
  await db
    .update(schema.messages)
    .set({
      status: status in MESSAGE_STATUS ? status : "nova",
      internalNote: str(fd, "internalNote").slice(0, 5000),
      updatedAt: new Date(),
    })
    .where(eq(schema.messages.id, id));
  await audit(me, "Atualizou atendimento", `Protocolo ${msg?.protocol ?? id} → ${MESSAGE_STATUS[status] ?? status}`);
  done(`/admin/mensagens/${id}`, "Atendimento atualizado.");
}

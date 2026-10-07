"use server";

import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { requireModule } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { done, int, str } from "@/lib/admin";
import { MESSAGE_STATUS } from "@/lib/messages";

/** Atualiza status e anotação interna. Mensagens não são excluídas (histórico da ouvidoria). */
export async function updateMessage(fd: FormData) {
  const me = await requireModule("mensagens");
  const id = int(fd, "id");
  const status = str(fd, "status");
  const assignedTo = int(fd, "assignedTo") || null;
  const [msg] = await db
    .select({ protocol: schema.messages.protocol, assignedTo: schema.messages.assignedTo })
    .from(schema.messages)
    .where(eq(schema.messages.id, id));
  const [assignee] = assignedTo
    ? await db.select({ name: schema.users.name }).from(schema.users).where(eq(schema.users.id, assignedTo))
    : [];
  await db
    .update(schema.messages)
    .set({
      status: status in MESSAGE_STATUS ? status : "nova",
      internalNote: str(fd, "internalNote").slice(0, 5000),
      assignedTo: assignee ? assignedTo : null,
      updatedAt: new Date(),
    })
    .where(eq(schema.messages.id, id));
  await audit(me, "Atualizou atendimento", `Protocolo ${msg?.protocol ?? id} → ${MESSAGE_STATUS[status] ?? status}`);
  if ((msg?.assignedTo ?? null) !== (assignee ? assignedTo : null)) {
    await audit(me, "Encaminhou atendimento", `Protocolo ${msg?.protocol ?? id} → ${assignee?.name ?? "sem responsável"}`);
  }
  done(`/admin/mensagens/${id}`, "Atendimento atualizado.");
}

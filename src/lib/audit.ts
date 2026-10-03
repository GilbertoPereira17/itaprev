import "server-only";
import { headers } from "next/headers";
import { db, schema } from "@/db";

type Actor = { uid: number; name: string } | null;

/**
 * Registra uma ação no log de auditoria (quem, o quê, quando, de onde).
 * Nunca interrompe a ação do usuário: se o registro falhar, só avisa no log do servidor.
 */
export async function audit(actor: Actor, action: string, target = "") {
  try {
    const ip = ((await headers()).get("x-forwarded-for") ?? "").split(",")[0].trim();
    await db.insert(schema.auditLog).values({
      userId: actor?.uid ?? null,
      userName: actor?.name ?? "",
      action,
      target: target.slice(0, 300),
      ip,
    });
  } catch (e) {
    console.error("[auditoria] falha ao registrar:", action, e);
  }
}

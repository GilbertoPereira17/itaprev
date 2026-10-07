"use server";

import { db, schema } from "@/db";
import { requireModule } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { done } from "@/lib/admin";
import { SETTING_KEYS } from "./keys";

export async function saveSettings(fd: FormData) {
  const me = await requireModule("configuracoes");
  for (const { key } of SETTING_KEYS.flatMap((g) => g.fields)) {
    const value = String(fd.get(key) ?? "").trim();
    await db
      .insert(schema.settings)
      .values({ key, value })
      .onConflictDoUpdate({ target: schema.settings.key, set: { value, updatedAt: new Date() } });
  }
  await audit(me, "Alterou contatos e links do site");
  done("/admin/configuracoes", "Configurações salvas.");
}

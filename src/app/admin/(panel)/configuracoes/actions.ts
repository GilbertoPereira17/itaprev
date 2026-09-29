"use server";

import { db, schema } from "@/db";
import { requireUser } from "@/lib/auth";
import { done } from "@/lib/admin";
import { SETTING_KEYS } from "./keys";

export async function saveSettings(fd: FormData) {
  await requireUser();
  for (const { key } of SETTING_KEYS.flatMap((g) => g.fields)) {
    const value = String(fd.get(key) ?? "").trim();
    await db
      .insert(schema.settings)
      .values({ key, value })
      .onConflictDoUpdate({ target: schema.settings.key, set: { value, updatedAt: new Date() } });
  }
  done("/admin/configuracoes", "Configurações salvas.");
}

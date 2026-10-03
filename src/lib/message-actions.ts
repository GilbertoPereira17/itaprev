"use server";

import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { CONTACT_SUBJECTS, OMBUDSMAN_TYPES } from "@/lib/messages";

export type MessageState = { ok: boolean; protocol?: string; error?: string };

// Limite simples por IP: evita que robôs encham o banco (5 envios a cada 10 minutos)
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

function rateLimited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > MAX_PER_WINDOW;
}

const field = (fd: FormData, key: string, max = 200) => String(fd.get(key) ?? "").trim().slice(0, max);

export async function sendMessage(_prev: MessageState, fd: FormData): Promise<MessageState> {
  // Campo invisível: pessoas não preenchem, robôs sim. Finge sucesso sem gravar.
  if (field(fd, "website")) return { ok: true, protocol: "—" };

  const ip = ((await headers()).get("x-forwarded-for") ?? "").split(",")[0].trim() || "local";
  if (rateLimited(ip)) {
    return { ok: false, error: "Muitos envios em sequência. Aguarde alguns minutos e tente novamente." };
  }

  const kind = field(fd, "kind") === "ouvidoria" ? "ouvidoria" : "contato";
  const anonymous = kind === "ouvidoria" && fd.get("anonymous") === "on";
  const category = field(fd, "category");
  const name = anonymous ? "" : field(fd, "name");
  const document = anonymous ? "" : field(fd, "document", 30);
  const email = anonymous ? "" : field(fd, "email");
  const phone = anonymous ? "" : field(fd, "phone", 30);
  const body = field(fd, "body", 5000);

  const validCategories = kind === "ouvidoria" ? OMBUDSMAN_TYPES : CONTACT_SUBJECTS;
  if (!validCategories.includes(category)) return { ok: false, error: "Escolha o assunto da mensagem." };
  if (body.length < 10) return { ok: false, error: "Escreva sua mensagem com um pouco mais de detalhe." };
  if (!anonymous) {
    if (!name) return { ok: false, error: "Informe seu nome." };
    if (!email && !phone) return { ok: false, error: "Informe um e-mail ou telefone para podermos responder." };
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, error: "E-mail inválido." };
  }
  if (fd.get("consent") !== "on") {
    return { ok: false, error: "Confirme que autoriza o uso dos dados para o atendimento." };
  }

  const [row] = await db
    .insert(schema.messages)
    .values({ kind, category, name, document, email, phone, body, anonymous })
    .returning({ id: schema.messages.id });
  const protocol = `${new Date().getFullYear()}-${String(row.id).padStart(6, "0")}`;
  await db.update(schema.messages).set({ protocol }).where(eq(schema.messages.id, row.id));

  return { ok: true, protocol };
}

"use server";

import crypto from "node:crypto";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { CONTACT_SUBJECTS, MESSAGE_STATUS, OMBUDSMAN_TYPES } from "@/lib/messages";

export type MessageState = { ok: boolean; protocol?: string; code?: string; error?: string };

/** Código curto para consultar o protocolo (sem letras/números que se confundem) */
function newAccessCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from(crypto.randomBytes(6), (b) => chars[b % chars.length]).join("");
}

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
  if (field(fd, "website")) return { ok: true, protocol: "—", code: "—" };

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
    .values({ kind, category, name, document, email, phone, body, anonymous, accessCode: newAccessCode() })
    .returning({ id: schema.messages.id, accessCode: schema.messages.accessCode });
  const protocol = `${new Date().getFullYear()}-${String(row.id).padStart(6, "0")}`;
  await db.update(schema.messages).set({ protocol }).where(eq(schema.messages.id, row.id));

  return { ok: true, protocol, code: row.accessCode };
}

// ---------- Acompanhamento do protocolo ----------
export type TrackState = {
  ok: boolean;
  error?: string;
  result?: { protocol: string; kind: string; category: string; status: string; createdAt: string; updatedAt: string; reply: string };
};

const digits = (v: string) => v.replace(/\D/g, "");

/** Consulta pelo nº do protocolo + código de acesso, e-mail ou telefone informado no envio */
export async function trackProtocol(_prev: TrackState, fd: FormData): Promise<TrackState> {
  const ip = ((await headers()).get("x-forwarded-for") ?? "").split(",")[0].trim() || "local";
  if (rateLimited("track:" + ip)) return { ok: false, error: "Muitas consultas em sequência. Aguarde alguns minutos." };

  const protocol = field(fd, "protocol", 20).replace(/\s/g, "");
  const check = field(fd, "check", 120);
  const notFound = { ok: false, error: "Não encontramos um protocolo com esses dados. Confira o número e o código, e-mail ou telefone." };
  if (!/^\d{4}-\d{6}$/.test(protocol) || !check) return notFound;

  const [m] = await db.select().from(schema.messages).where(eq(schema.messages.protocol, protocol));
  if (!m) return notFound;
  const c = check.toLowerCase();
  const matches =
    (m.accessCode && c.toUpperCase() === m.accessCode) ||
    (m.email && c === m.email.toLowerCase()) ||
    (m.phone && digits(c).length >= 8 && digits(m.phone).endsWith(digits(c)));
  if (!matches) return notFound;

  const fmt = (d: Date) => new Date(d).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });
  return {
    ok: true,
    result: {
      protocol: m.protocol,
      kind: m.kind === "ouvidoria" ? "Ouvidoria" : m.kind === "requerimento" ? "Requerimento" : "Fale conosco",
      category: m.category,
      status: MESSAGE_STATUS[m.status === "arquivada" ? "respondida" : m.status] ?? m.status,
      createdAt: fmt(m.createdAt),
      updatedAt: fmt(m.updatedAt),
      reply: m.publicReply,
    },
  };
}

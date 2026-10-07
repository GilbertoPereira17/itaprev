import "server-only";
import { asc, eq, lt } from "drizzle-orm";
import { db, schema } from "@/db";
import { getFaqs, getSettings } from "./content";
import { buildInfo } from "./site-info";

/** Por quanto tempo as conversas ficam registradas (LGPD: só o necessário para análise) */
export const CHAT_LOG_RETENTION_DAYS = 180;

const MAX_KNOWLEDGE_CHARS = 12000;

/**
 * Texto enviado à IA a cada pergunta: contatos e links atuais (Configurações),
 * base de conhecimento da equipe e perguntas frequentes visíveis no site.
 */
export async function buildKnowledge() {
  const [settings, faqs, entries] = await Promise.all([
    getSettings(),
    getFaqs(),
    db
      .select()
      .from(schema.chatbotKnowledge)
      .where(eq(schema.chatbotKnowledge.active, true))
      .orderBy(asc(schema.chatbotKnowledge.sortOrder), asc(schema.chatbotKnowledge.id)),
  ]);
  const info = buildInfo(settings);
  const parts = [
    "CONTATOS E LINKS ATUAIS:",
    `- Telefone: ${info.contacts.phone} · WhatsApp: ${info.contacts.whatsapp} · E-mail: ${info.contacts.email}`,
    `- Horário: ${info.contacts.hours} · Endereço: ${info.address.full}`,
    `- Holerite: ${info.externalLinks.holeriteSystem}`,
    `- Informe de rendimentos: ${info.externalLinks.protecWeb}`,
    `- Recadastramento (manual): ${info.externalLinks.censoManual}`,
    `- Transparência: ${info.externalLinks.transparencyPortal}`,
    "- Ouvidoria e acompanhamento de protocolo: no próprio site, páginas /ouvidoria e /acompanhar",
  ];
  if (entries.length) {
    parts.push("", "INFORMAÇÕES DA EQUIPE DO INSTITUTO:");
    for (const e of entries) parts.push(`## ${e.title}`, e.content);
  }
  if (faqs.length) {
    parts.push("", "PERGUNTAS FREQUENTES:");
    for (const f of faqs) parts.push(`P: ${f.question}`, `R: ${f.answer}`);
  }
  return parts.join("\n").slice(0, MAX_KNOWLEDGE_CHARS);
}

const maskCpf = (text: string) => text.replace(/\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g, "[CPF]");

/** Resposta da assistente: só o CPF é ocultado (telefones e e-mails nela são os do Instituto) */
export const maskAnswer = maskCpf;

/** Pergunta do segurado: oculta CPF, e-mail e telefone antes de gravar */
export function maskPersonalData(text: string) {
  return maskCpf(text)
    .replace(/[^\s@]+@[^\s@]+\.[^\s@]+/g, "[e-mail]")
    .replace(/\(?\b\d{2}\)?\s?9?\d{4}-?\d{4}\b/g, "[telefone]");
}

let lastPurge = 0;
/** Apaga conversas mais antigas que o prazo de retenção (no máximo uma vez por dia) */
export async function purgeOldChatLogs() {
  if (Date.now() - lastPurge < 24 * 60 * 60 * 1000) return;
  lastPurge = Date.now();
  const limit = new Date(Date.now() - CHAT_LOG_RETENTION_DAYS * 24 * 60 * 60 * 1000);
  await db.delete(schema.chatLogs).where(lt(schema.chatLogs.createdAt, limit));
}

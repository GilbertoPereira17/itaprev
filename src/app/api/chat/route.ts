import { NextResponse, type NextRequest } from "next/server";
import { db, schema } from "@/db";
import { buildKnowledge, maskAnswer, maskPersonalData, purgeOldChatLogs } from "@/lib/chatbot";

// Fluxo n8n "ITAPREV - Chatbot Segurado" (a chamada sai do servidor, não do navegador)
const WEBHOOK =
  process.env.CHATBOT_WEBHOOK || process.env.NEXT_PUBLIC_CHATBOT_WEBHOOK || "https://n8n.triusbot.site/webhook/itaprev-chat";

// Limite por IP: 20 perguntas a cada 5 minutos (evita abuso e custo com a IA)
const WINDOW_MS = 5 * 60 * 1000;
const MAX_PER_WINDOW = 20;
const hits = new Map<string, number[]>();
function rateLimited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > MAX_PER_WINDOW;
}

async function log(sessionId: string, question: string, answer: string, answered: boolean) {
  try {
    await db.insert(schema.chatLogs).values({
      sessionId: sessionId.slice(0, 80),
      question: maskPersonalData(question),
      answer: maskAnswer(answer).slice(0, 4000),
      answered,
    });
    await purgeOldChatLogs();
  } catch (e) {
    console.error("[chat] falha ao registrar conversa:", e);
  }
}

export async function POST(req: NextRequest) {
  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "local";
  if (rateLimited(ip)) {
    return NextResponse.json({ reply: "Muitas perguntas em sequência. Aguarde alguns minutos, por favor." }, { status: 429 });
  }

  const body = await req.json().catch(() => ({}));
  const message = String(body?.message ?? "").trim().slice(0, 1000);
  const sessionId = String(body?.sessionId ?? "anon");
  if (!message) return NextResponse.json({ reply: "" }, { status: 400 });

  // Número de protocolo: responde direto, sem IA, com o link da consulta
  const protocol = message.match(/\b(20\d{2})[-\s/]?(\d{6})\b/);
  if (protocol) {
    const p = `${protocol[1]}-${protocol[2]}`;
    const reply = `Você pode acompanhar o protocolo nº ${p} na página de acompanhamento. Informe o número e o código de acesso, ou o e-mail ou telefone usado no envio.`;
    await log(sessionId, message, reply, true);
    return NextResponse.json({ reply, action: { label: "Acompanhar protocolo", url: `/acompanhar?protocolo=${p}` } });
  }

  try {
    const res = await fetch(WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, sessionId, knowledge: await buildKnowledge() }),
      signal: AbortSignal.timeout(45000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const reply = String(data?.reply || data?.output || "").trim();
    await log(sessionId, message, reply, !!reply);
    return NextResponse.json({ reply });
  } catch (e) {
    console.error("[chat] assistente indisponível:", e);
    await log(sessionId, message, "", false);
    return NextResponse.json({ reply: "" }, { status: 502 });
  }
}

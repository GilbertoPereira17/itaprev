"use client";

import React, { useState } from "react";
import Image from "next/image";
import { X, Send, User, ExternalLink, FileText, DollarSign, UserCheck, MapPin, Landmark, ShieldCheck, RotateCcw } from "lucide-react";
import { INSTITUTION_INFO } from "@/data/institution";

// Endpoint do chatbot com IA (fluxo n8n "ITAPREV - Chatbot Segurado")
const CHATBOT_WEBHOOK =
  process.env.NEXT_PUBLIC_CHATBOT_WEBHOOK || "https://n8n.triusbot.site/webhook/itaprev-chat";

// Nome da assistente virtual (persona)
const ASSISTANT_NAME = "Ita";

// Transforma URLs no texto em links clicáveis que quebram linha (não estouram o balão)
function renderTextWithLinks(text: string) {
  return text.split(/(https?:\/\/[^\s]+)/g).map((part, i) =>
    /^https?:\/\//.test(part) ? (
      <a
        key={i}
        href={part}
        target="_blank"
        rel="noopener noreferrer"
        className="font-semibold underline decoration-1 underline-offset-2 [overflow-wrap:anywhere]"
      >
        {part}
      </a>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

interface ChatMessage {
  id: string;
  sender: "bot" | "user";
  text: string;
  actionButton?: {
    label: string;
    url: string;
    isExternal: boolean;
  };
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      sender: "bot",
      text: "Olá! Eu sou a Ita, assistente virtual do Itanhaém Prev. Como posso te ajudar hoje?",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  // Identifica a conversa para a IA manter o contexto (memória por sessão)
  const [sessionId] = useState(
    () => "web-" + Math.random().toString(36).slice(2) + Date.now().toString(36)
  );

  const quickQuestions = [
    {
      label: "Como emitir meu holerite?",
      icon: <FileText className="h-4 w-4 shrink-0 text-[var(--color-brand-blue)]" aria-hidden />,
      reply: "Para consultar seu holerite (contracheque), acesse o sistema 'Servidor Online' com seu CPF e senha.",
      action: {
        label: "Abrir Servidor Online",
        url: INSTITUTION_INFO.externalLinks.holeriteSystem,
        isExternal: true,
      },
    },
    {
      label: "Como fazer a prova de vida?",
      icon: <UserCheck className="h-4 w-4 shrink-0 text-[var(--color-brand-blue)]" aria-hidden />,
      reply: "O recadastramento e a prova de vida documental podem ser realizados no Portal do Segurado. Veja o passo a passo completo no manual.",
      action: {
        label: "Ver Guia do Censo",
        url: INSTITUTION_INFO.externalLinks.censoManual,
        isExternal: true,
      },
    },
    {
      label: "Como pegar o Informe de Rendimentos?",
      icon: <DollarSign className="h-4 w-4 shrink-0 text-[var(--color-brand-blue)]" aria-hidden />,
      reply: "Seu informe anual de rendimentos para a declaração de Imposto de Renda (IRPF) está disponível no Portal do Segurado.",
      action: {
        label: "Acessar Portal do Segurado",
        url: INSTITUTION_INFO.externalLinks.protecWeb,
        isExternal: true,
      },
    },
    {
      label: "Endereço e horário de atendimento",
      icon: <MapPin className="h-4 w-4 shrink-0 text-[var(--color-brand-blue)]" aria-hidden />,
      reply: `Estamos localizados na ${INSTITUTION_INFO.address.full}. Atendemos de segunda a sexta, das 08h às 17h.`,
      action: {
        label: "Abrir no Google Maps",
        url: INSTITUTION_INFO.address.googleMapsUrl,
        isExternal: true,
      },
    },
    {
      label: "Reuniões e atas dos conselhos",
      icon: <Landmark className="h-4 w-4 shrink-0 text-[var(--color-brand-blue)]" aria-hidden />,
      reply: "Você acompanha o cronograma de reuniões, as atas e as deliberações dos conselhos e do comitê de investimentos na página de Conselhos.",
      action: {
        label: "Ver Conselhos",
        url: "/conselhos",
        isExternal: false,
      },
    },
    {
      label: "Como falar com a Ouvidoria?",
      icon: <ShieldCheck className="h-4 w-4 shrink-0 text-[var(--color-brand-blue)]" aria-hidden />,
      reply: "A Ouvidoria recebe elogios, sugestões, reclamações e denúncias com sigilo garantido. Registre sua manifestação pelo canal oficial.",
      action: {
        label: "Abrir a Ouvidoria",
        url: INSTITUTION_INFO.externalLinks.ouvidoriaForm,
        isExternal: true,
      },
    },
  ];

  const resetChat = () => {
    setMessages([
      {
        id: "1",
        sender: "bot",
        text: "Olá! Eu sou a Ita, assistente virtual do Itanhaém Prev. Como posso te ajudar hoje?",
      },
    ]);
  };

  const handleSelectQuick = (q: typeof quickQuestions[0]) => {
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: q.label,
    };
    const botMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      sender: "bot",
      text: q.reply,
      actionButton: q.action,
    };
    setMessages((prev) => [...prev, userMsg, botMsg]);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const userText = inputValue.trim();
    if (!userText || isLoading) return;

    setInputValue("");
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: userText,
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    const whatsappAction = {
      label: "Chamar no WhatsApp",
      url: INSTITUTION_INFO.contacts.whatsappUrl,
      isExternal: true,
    };

    try {
      const res = await fetch(CHATBOT_WEBHOOK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText, sessionId }),
      });
      if (!res.ok) throw new Error("resposta inválida");
      const data = await res.json();
      const reply: string = (data?.reply || data?.output || "").toString().trim();

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        text:
          reply ||
          "Não consegui responder agora. Você pode falar direto com o nosso atendimento.",
        actionButton: reply ? undefined : whatsappAction,
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "bot",
          text: "Estou com dificuldade para responder agora. Fale direto com o nosso atendimento que a equipe te ajuda.",
          actionButton: whatsappAction,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Lançador Flutuante: avatar grande da Ita + balão "Posso te ajudar?" */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-3 focus:outline-none"
          aria-label="Abrir a Ita, assistente virtual"
        >
          {/* Balão flutuante */}
          <span className="relative rounded-2xl rounded-br-sm border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-lg">
            Posso te ajudar?
            <span className="absolute -right-1.5 bottom-3 h-3 w-3 rotate-45 border-b border-r border-slate-200 bg-white" />
          </span>

          {/* Avatar grande da Ita */}
          <span className="relative block h-16 w-16 shrink-0 rounded-full shadow-xl ring-4 ring-[var(--color-brand-blue)]/15 transition-transform duration-200 group-hover:scale-105">
            <span className="block h-full w-full overflow-hidden rounded-full border-2 border-white bg-white">
              <Image
                src="/images/ita-avatar.png"
                alt="Ita, assistente virtual"
                width={64}
                height={64}
                className="h-full w-full object-cover"
              />
            </span>
            {/* Indicador de disponível */}
            <span className="absolute bottom-0.5 right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500" />
          </span>
        </button>
      )}

      {/* Caixa de Diálogo do Chat */}
      {isOpen && (
        <div className="w-[90vw] sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[520px] max-h-[85vh] animate-in slide-in-from-bottom-5 duration-200">
          
          {/* Topo do Chat */}
          <div className="bg-[var(--color-brand-navy)] text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full overflow-hidden border border-white/25 bg-white/10 shrink-0">
                <Image src="/images/ita-avatar.png" alt="Ita, assistente virtual" width={44} height={44} className="h-full w-full object-cover" />
              </div>
              <div>
                <div className="font-bold text-sm">Ita · Assistente virtual</div>
                <div className="text-[11px] text-slate-300">
                  Itanhaém Prev — tire suas dúvidas
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-full text-slate-300 hover:text-white hover:bg-white/10"
              aria-label="Fechar Atendente Virtual"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Histórico de Mensagens */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50 text-sm">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.sender === "bot" && (
                  <div className="w-7 h-7 rounded-full overflow-hidden border border-slate-200 shrink-0 mt-0.5">
                    <Image src="/images/ita-avatar.png" alt="Ita" width={28} height={28} className="h-full w-full object-cover" />
                  </div>
                )}

                <div
                  className={`max-w-[80%] rounded-2xl p-3.5 ${
                    msg.sender === "user"
                      ? "bg-[#005BAC] text-white rounded-br-none"
                      : "bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-sm"
                  }`}
                >
                  <p className="leading-relaxed whitespace-pre-wrap [overflow-wrap:anywhere]">
                    {renderTextWithLinks(msg.text)}
                  </p>

                  {msg.actionButton && (
                    <div className="mt-2.5 pt-2 border-t border-slate-100">
                      <a
                        href={msg.actionButton.url}
                        target={msg.actionButton.isExternal ? "_blank" : "_self"}
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#005BAC] text-white text-xs font-bold hover:bg-[#00488A] transition-colors"
                      >
                        <span>{msg.actionButton.label}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>

                {msg.sender === "user" && (
                  <div className="w-7 h-7 rounded-full bg-slate-700 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {/* Sugestões de Dúvidas Rápidas */}
            {messages.length === 1 && (
              <div className="pt-2 space-y-2">
                <div className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">
                  Dúvidas Frequentes:
                </div>
                {quickQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectQuick(q)}
                    className="flex w-full items-center gap-2.5 rounded-xl border border-slate-200 bg-white p-3 text-left text-[13px] font-semibold text-slate-700 shadow-sm transition-all hover:border-[var(--color-brand-blue)] hover:text-[var(--color-brand-blue)]"
                  >
                    {q.icon}
                    <span>{q.label}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Voltar às opções de dúvidas */}
            {messages.length > 1 && (
              <div className="pt-1">
                <button
                  onClick={resetChat}
                  className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-[13px] font-semibold text-slate-700 shadow-sm transition-colors hover:border-[var(--color-brand-blue)] hover:text-[var(--color-brand-blue)]"
                >
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden />
                  Tenho outra dúvida
                </button>
              </div>
            )}

            {/* Indicador de digitação da IA */}
            {isLoading && (
              <div className="flex gap-2 justify-start">
                <div className="w-7 h-7 rounded-full overflow-hidden border border-slate-200 shrink-0 mt-0.5">
                  <Image src="/images/ita-avatar.png" alt="Ita" width={28} height={28} className="h-full w-full object-cover" />
                </div>
                <div className="rounded-2xl rounded-bl-none border border-slate-200 bg-white px-4 py-3 shadow-sm">
                  <div className="flex gap-1">
                    <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.2s]" />
                    <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.1s]" />
                    <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Campo de Digitação */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isLoading}
              placeholder={isLoading ? "Aguarde a resposta..." : "Digite sua dúvida..."}
              className="flex-1 px-3.5 py-2.5 bg-slate-100 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#005BAC] disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="p-2.5 rounded-xl bg-[#005BAC] hover:bg-[#00488A] text-white transition-colors disabled:opacity-50 disabled:hover:bg-[#005BAC]"
              aria-label="Enviar mensagem"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}
    </div>
  );
}

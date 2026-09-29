"use client";

import React, { useState, useEffect } from "react";
import {
  Accessibility,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Contrast,
  X,
  Eye,
  Volume2,
  Sliders,
} from "lucide-react";

export function AccessibilityWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [scale, setScale] = useState(1);
  const [highContrast, setHighContrast] = useState(false);
  const [grayscale, setGrayscale] = useState(false);

  useEffect(() => {
    document.documentElement.style.setProperty("--font-scale", scale.toString());
  }, [scale]);

  const toggleContrast = () => {
    const next = !highContrast;
    setHighContrast(next);
    document.body.classList.toggle("high-contrast", next);
  };

  const toggleGrayscale = () => {
    const next = !grayscale;
    setGrayscale(next);
    // No <html> para não quebrar o posicionamento dos elementos fixos.
    document.documentElement.classList.toggle("grayscale", next);
  };

  const increaseFont = () => {
    setScale((prev) => Math.min(prev + 0.1, 1.4));
  };

  const decreaseFont = () => {
    setScale((prev) => Math.max(prev - 0.1, 0.9));
  };

  const resetAll = () => {
    setScale(1);
    setHighContrast(false);
    setGrayscale(false);
    document.body.classList.remove("high-contrast");
    document.documentElement.classList.remove("grayscale");
  };

  return (
    <>
      {/* Botão Flutuante de Acessibilidade (borda direita, meio da tela) */}
      <div className="fixed right-0 top-1/2 z-50 -translate-y-1/2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="group flex h-16 items-center gap-2 rounded-l-2xl border-y border-l border-white/15 bg-[var(--color-brand-blue)] pl-3 pr-3 text-white shadow-xl transition-[padding,background-color] duration-200 hover:bg-[var(--color-brand-navy)] hover:pr-5 focus:outline-none focus-visible:ring-4 focus-visible:ring-[var(--color-brand-cyan)]/50"
          aria-label="Abrir opções de acessibilidade"
          title="Opções de acessibilidade (eMAG / WCAG)"
        >
          <Accessibility className="h-7 w-7 shrink-0" strokeWidth={2} aria-hidden />
          <span className="hidden max-w-0 overflow-hidden text-sm font-bold opacity-0 transition-all duration-200 group-hover:max-w-[130px] group-hover:opacity-100 lg:inline-block">
            Acessibilidade
          </span>
        </button>
      </div>

      {/* Gaveta / Modal Lateral de Acessibilidade */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-200">
          {/* Overlay de Fundo */}
          <div
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-black/50 backdrop-blur-xs"
          />

          {/* Painel da Direita */}
          <div className="relative w-full max-w-sm bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col p-6 overflow-y-auto animate-in slide-in-from-right duration-300 text-slate-900">
            
            {/* Topo do Painel */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[var(--color-brand-blue)] text-white">
                  <Accessibility className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 leading-tight">Acessibilidade</h3>
                  <p className="text-xs text-slate-500">Conformidade eMAG & WCAG 2.1</p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                aria-label="Fechar painel"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Opções de Ajuste */}
            <div className="py-6 space-y-6 flex-1">
              
              {/* 1. Tamanho do Texto */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Tamanho da Fonte
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={decreaseFont}
                    className="flex items-center justify-center gap-1.5 py-3 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm border border-slate-200"
                  >
                    <ZoomOut className="w-4 h-4" />
                    <span>A-</span>
                  </button>
                  <button
                    onClick={() => setScale(1)}
                    className="flex items-center justify-center gap-1.5 py-3 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm border border-slate-200"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Padrão</span>
                  </button>
                  <button
                    onClick={increaseFont}
                    className="flex items-center justify-center gap-1.5 py-3 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-sm border border-slate-200"
                  >
                    <ZoomIn className="w-4 h-4" />
                    <span>A+</span>
                  </button>
                </div>
              </div>

              {/* 2. Modos de Contraste e Cor */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Modo Visual & Contraste
                </label>

                <div className="space-y-2">
                  <button
                    onClick={toggleContrast}
                    className={`w-full flex items-center justify-between p-3.5 rounded-xl border font-bold text-sm transition-all ${
                      highContrast
                        ? "bg-[var(--color-brand-navy)] text-white border-[var(--color-brand-navy)] shadow-md"
                        : "bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Contrast className="w-5 h-5" />
                      <span>Alto contraste</span>
                    </div>
                    <span className="text-xs">{highContrast ? "Ativo" : "Inativo"}</span>
                  </button>

                  <button
                    onClick={toggleGrayscale}
                    className={`w-full flex items-center justify-between p-3.5 rounded-xl border font-bold text-sm transition-all ${
                      grayscale
                        ? "bg-slate-800 text-white border-slate-800 shadow-md"
                        : "bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Eye className="w-5 h-5" />
                      <span>Escala de Cinza</span>
                    </div>
                    <span className="text-xs">{grayscale ? "Ativo" : "Inativo"}</span>
                  </button>
                </div>
              </div>

              {/* 3. Atalhos Governamentais eMAG */}
              <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-600">
                <div className="font-bold text-slate-900 text-sm mb-1 flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-[#005BAC]" />
                  <span>Atalhos de Teclado (eMAG)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span>Ir para o Conteúdo:</span>
                  <kbd className="bg-white px-2 py-0.5 rounded border border-slate-300 font-mono font-bold">Alt + 1</kbd>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span>Ir para o Menu:</span>
                  <kbd className="bg-white px-2 py-0.5 rounded border border-slate-300 font-mono font-bold">Alt + 2</kbd>
                </div>
                <div className="flex justify-between py-1">
                  <span>Ir para o Rodapé:</span>
                  <kbd className="bg-white px-2 py-0.5 rounded border border-slate-300 font-mono font-bold">Alt + 3</kbd>
                </div>
              </div>

            </div>

            {/* Rodapé do Modal */}
            <div className="pt-4 border-t border-slate-200">
              <button
                onClick={resetAll}
                className="w-full py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-colors"
              >
                Restaurar Configurações Padrão
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
export interface SlideData {
  id: number;
  bgImage: string;
  tag: string;
  title: string;
  description: string;
  buttonLabel: string;
  buttonUrl: string;
  isExternal?: boolean;
}

/** Slides vêm do banco (editáveis no painel em /admin/slides) */
export function HeroSlider({ slides }: { slides: SlideData[] }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused || slides.length < 2) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [isPaused, slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  if (slides.length === 0) return null;
  const current = slides[Math.min(currentSlide, slides.length - 1)];

  return (
    <section
      className="relative overflow-hidden bg-[#061526] text-white min-h-[640px] sm:min-h-[720px] lg:min-h-[800px] flex items-center pt-36 pb-20 select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 z-0 transition-opacity duration-1000 ease-in-out ${
            index === currentSlide ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
        >
          <Image
            src={slide.bgImage}
            alt={slide.title}
            fill
            priority={index === 0}
            className="object-cover object-center"
          />
          {/* Overlay com gradiente diagonal branded + profundidade */}
          <div className="absolute inset-0 bg-gradient-to-tr from-[#061526] via-[#061526]/88 to-[#0B2A47]/55" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#061526] via-transparent to-[#061526]/40" />
        </div>
      ))}

      {/* Conteúdo Central Minimalista */}
      <div
        key={currentSlide}
        className="hero-enter max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full text-center space-y-5"
      >
        {/* Tag com acento dourado (assinatura Pró-Gestão) */}
        <div className="flex items-center justify-center gap-3">
          <span className="h-px w-8 bg-[var(--color-gold)]/80" />
          <p className="text-xs sm:text-sm font-bold tracking-[0.2em] text-[var(--color-brand-light-cyan)] uppercase">
            {current.tag}
          </p>
          <span className="h-px w-8 bg-[var(--color-gold)]/80" />
        </div>

        {/* Título Principal Limpo */}
        <h1 className="text-3xl sm:text-5xl lg:text-[3.75rem] font-extrabold tracking-tight text-white leading-[1.1]">
          {current.title}
        </h1>

        {/* Descrição Concisa (1 Frase Clara) */}
        <p className="text-slate-200 text-base sm:text-lg lg:text-xl font-normal leading-relaxed max-w-2xl mx-auto">
          {current.description}
        </p>

        {/* Botão Único Centralizado e Elegante */}
        <div className="pt-3 flex items-center justify-center">
          <a
            href={current.buttonUrl}
            target={current.isExternal ? "_blank" : "_self"}
            rel={current.isExternal ? "noopener noreferrer" : undefined}
            className="inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-lg bg-[#005BAC] hover:bg-[#00488A] text-white text-base font-semibold shadow-md hover:shadow-lg transition-all duration-150"
          >
            <span>{current.buttonLabel}</span>
            {current.isExternal ? (
              <ExternalLink className="w-4 h-4 opacity-80" />
            ) : (
              <ArrowRight className="w-4 h-4" />
            )}
          </a>
        </div>

        {/* Selo de certificação (visível em todas as telas) */}
        <div className="flex justify-center pt-4">
          <div className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/10 py-2 pl-2 pr-4 backdrop-blur-md">
            <Image
              src="/images/selo-300x300-pro-gestao-2.png"
              alt="Selo Pró-Gestão RPPS Nível II"
              width={40}
              height={40}
              className="h-9 w-9 shrink-0 object-contain sm:h-10 sm:w-10"
            />
            <span className="text-left leading-tight">
              <span className="block text-[10px] font-semibold uppercase tracking-wider text-white/70">
                Certificação oficial
              </span>
              <span className="block text-sm font-bold text-white">Pró-Gestão RPPS · Nível II</span>
            </span>
          </div>
        </div>

      </div>

      {/* Controles de Navegação Lateral Discretos */}
      <button
        onClick={prevSlide}
        aria-label="Slide anterior"
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-lg bg-black/20 hover:bg-black/50 text-white/70 hover:text-white transition-colors hidden sm:flex items-center justify-center"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={nextSlide}
        aria-label="Próximo slide"
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-lg bg-black/20 hover:bg-black/50 text-white/70 hover:text-white transition-colors hidden sm:flex items-center justify-center"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Paginação Discreta */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            aria-label={`Ir para o slide ${idx + 1}`}
            className={`h-1 rounded-full transition-all duration-300 ${
              idx === currentSlide ? "w-7 bg-white" : "w-2.5 bg-white/30 hover:bg-white/60"
            }`}
          />
        ))}
      </div>
    </section>
  );
}

# DESIGN SYSTEM: Itanhaém Prev (Acessibilidade eMAG / WCAG 2.1)

Este documento dita as regras de identidade visual, acessibilidade, componentes e espaçamentos do portal.

---

## 1. Cores Oficiais (Baseadas na Logo & Selo Oficial)

```css
:root {
  /* Cores Principais da Marca */
  --color-brand-blue: #005BAC;       /* Azul Royal Principal (da Logo) */
  --color-brand-cyan: #009EE2;       /* Azul Celeste / Acentos (da Logo) */
  --color-brand-light-cyan: #54C0EB; /* Azul Claro de Apoio (da Logo) */
  --color-brand-navy: #0B1E36;       /* Azul Marinho Escuro / Hero e Header */
  --color-brand-navy-dark: #071526;  /* Azul Marinho Profundo */

  /* Dourado Oficial Selo Pró-Gestão Nível II */
  --color-gold-primary: #C59B27;     /* Dourado Oficial */
  --color-gold-hover: #A8821C;       /* Dourado Hover */
  --color-gold-subtle: #FEF9E7;      /* Dourado Fundo Suave */
  --color-gold-border: #F7E7A9;      /* Dourado Borda */

  /* Fundos e Superfícies (Contraste Máximo) */
  --color-surface-base: #FFFFFF;     /* Branco Puro */
  --color-surface-soft: #F8FAFC;     /* Fundo Suave Seções */
  --color-surface-muted: #F1F5F9;    /* Fundo Cards Secundários */

  /* Textos (Mínimo WCAG AAA 7:1) */
  --color-text-main: #0F172A;        /* Preto Azulado Escuro (14.5:1 no branco) */
  --color-text-muted: #475569;       /* Cinza Chumbo Suave (7.2:1 no branco) */
  --color-text-light: #94A3B8;       /* Detalhes Secundários */
}

/* Modo Alto Contraste (eMAG) */
body.high-contrast {
  --color-surface-base: #000000;
  --color-surface-soft: #121212;
  --color-surface-muted: #1E1E1E;
  --color-text-main: #FFFF00;        /* Amarelo sobre Preto */
  --color-text-muted: #FFFFFF;
  --color-brand-blue: #00FFFF;       /* Ciano de Alto Contraste */
  --color-gold-primary: #FFFF00;
}
```

---

## 2. Tipografia & Usabilidade para Idosos

- **Fonte Principal:** `Public Sans` (via next/font), com `sans-serif` de reserva.
- **Tamanho Base de Texto:** `1.125rem` (18px) para parágrafos, facilitando a leitura sem esforço.
- **Entrelinha Generosa:** `line-height: 1.65` para evitar sobreposição visual.
- **Hierarquia Clara:**
  - `h1`: 2.5rem a 3.5rem (Títulos de Hero e Páginas)
  - `h2`: 1.875rem a 2.25rem (Títulos de Seções)
  - `h3`: 1.25rem a 1.5rem (Títulos de Cards de Serviços)
  - `p`: 1.05rem a 1.125rem (Corpo do texto)

---

## 3. Diretrizes de Acessibilidade Obrigatórias (eMAG / WCAG)

1. **Barra Superior de Acessibilidade:**
   - Botão `A+` (Aumenta fonte em 20%)
   - Botão `A-` (Diminui fonte)
   - Botão `A` (Restaura tamanho padrão)
   - Botão `🌓 Alto Contraste` (Alterna tema de alto contraste)
   - Link de salto rápido para conteúdo (`Ir para o Conteúdo - Alt + 1`)
2. **Tamanho das Áreas de Toque:**
   - Todo botão e card clicável deve possuir no mínimo `48px` a `56px` de altura no mobile e desktop.
3. **Indicador de Foco do Teclado:**
   - `:focus-visible` com anel visível de `3px solid #009EE2` e espaçamento de `2px`.
4. **Textos Sempre Explícitos:**
   - Nunca usar apenas ícones solitários. Sempre incluir o texto da ação (`Consultar Holerite`, `Ligar no WhatsApp`, etc.).

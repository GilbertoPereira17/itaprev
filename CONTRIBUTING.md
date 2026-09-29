# Guia de desenvolvimento — Itanhaém Prev

> Convenções e regras para quem for manter ou evoluir o projeto.
> Documentação detalhada: `PROJECT_CONTEXT.md` (escopo/decisões), `ECOSSISTEMA.md` (status das etapas),
> `ARCHITECTURE.md` (estrutura do código), `DESIGN_SYSTEM.md` (identidade), `DEPLOY.md` (produção).
> **Mantenha esses documentos atualizados a cada mudança de estrutura ou decisão.**

## Princípios
1. **Simplicidade primeiro** — código mínimo que resolve; sem abstração especulativa.
2. **Mudanças cirúrgicas** — mexer só no que a tarefa exige; manter o estilo existente.
3. **Na dúvida, documentar a suposição** antes de implementar.

## Stack
Next.js 14 (App Router, **modo servidor**) · React 18 · TypeScript · Tailwind 3 · lucide-react.
Banco **PostgreSQL + Drizzle** (`src/db/schema.ts`). Sem `DATABASE_URL` usa **PGlite** local em `./.data` (dev).
Painel `/admin` (auth própria: bcrypt + JWT em cookie, `src/lib/auth.ts`, `src/middleware.ts`).
Conteúdo público lido em `src/lib/content.ts`; uploads em `UPLOAD_DIR` servidos por `/uploads/*`.
Rotas: `src/app/(site)/*` (site) e `src/app/admin/*` (painel). Deploy: `DEPLOY.md` (servidor da prefeitura).

## Comandos canônicos
- **Install:** `npm install`
- **Dev:** `npx next dev -p 4321`
- **Build:** `npx next build` · **Start:** `npm start`
- **Banco:** `npm run db:generate` (após mudar schema) · `npm run db:migrate` · `npm run db:seed` · `npm run db:import-wp [-- --dry|--force]`
- **Typecheck:** `npx tsc --noEmit -p .`
- (sem suíte de testes configurada)

## ⚠️ Regras de operação
- **NUNCA** rodar `npx next build` com o `next dev` rodando — os dois usam `.next` e o build corrompe o dev.
- **PGlite não aceita dois processos**: pare o `next dev` antes de rodar scripts `db:*` localmente.
- Hospedagem final é o **servidor da prefeitura** (a TI da prefeitura baixa do GitHub e segue `DEPLOY.md`). Não subir em serviço aleatório.
- **Proteção do conteúdo em produção (regra de ouro):** nenhuma atualização pode apagar o que a equipe publicou.
  - Migrações **somente aditivas**: criar tabela/coluna nova (coluna nova com `default` ou nullable). **Nunca** `DROP`, `RENAME`, troca de tipo ou `DELETE` em migração — o `db:migrate` bloqueia isso. Se precisar mudar estrutura: cria o novo, migra os dados, e o antigo só sai numa entrega posterior, combinada.
  - **Nunca editar** arquivos já existentes em `drizzle/` (migrações aplicadas). Sempre gerar nova com `npm run db:generate`.
  - Código novo precisa funcionar com o banco da versão anterior (o `atualizar.sh` pode voltar o código sem voltar o banco).
  - Área do Beneficiário (Etapa 3) = **tabelas novas**, sem alterar as do CMS.
  - Produção atualiza só via `bash scripts/atualizar.sh` (backup + rollback automático).
- Conteúdo HTML (editor/WordPress) sempre passa por `cleanHtml` (`src/lib/sanitize.ts`). Uploads só via `saveUpload` (valida extensão + magic bytes).

## Convenções de design/código
- **Cores por tokens CSS** (`--color-brand-blue #005BAC`, `--color-brand-navy #0B1E36`, `--color-gold #C59B27`, `--color-cream #f7f4ee`). Não chumbar hex solto novo.
- **Tom sóbrio, sem autopromoção** do instituto — nada de "excelência", "destaque nacional", "referência no Brasil".
- **Acessibilidade eMAG/WCAG** é prioridade (público idoso): alvos ≥ 48-56px, foco visível, alto contraste (tema escuro) e escala de cinza funcionando.
- **Ritmo de seções** branco ↔ creme; ícones unificados no azul da marca (sem arco-íris); assinatura dourada nas tags/títulos.
- Fonte: Plus Jakarta Sans (via next/font).

## Escopo em evolução
- **App móvel (iOS+Android)** entrou no escopo — via **Capacitor** (empacota o mesmo site). Fase posterior ao site. Detalhes em `PROJECT_CONTEXT.md` §2.1.1.

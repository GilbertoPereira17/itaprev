# Itanhaém Prev — Portal & Painel

Portal institucional e sistema de conteúdo (CMS) do **Instituto de Previdência dos
Servidores Públicos do Município de Itanhaém (Itanhaém Prev)**.

Site público + painel administrativo próprio, com foco em **acessibilidade** (público
idoso, diretrizes eMAG/WCAG) e conteúdo gerido pela própria equipe do instituto.

---

## Stack

- **Next.js 15** (App Router, modo servidor) · **React 19** · **TypeScript**
- **Tailwind CSS 3** · `lucide-react`
- **PostgreSQL + Drizzle ORM** em produção
  (sem `DATABASE_URL`, cai num banco embutido **PGlite** em `./.data` — só para desenvolvimento)
- Autenticação própria do painel: **bcrypt + JWT** em cookie (`src/lib/auth.ts`, `src/middleware.ts`)

## Estrutura

```text
src/
├── app/
│   ├── (site)/     # site público
│   ├── admin/      # painel administrativo (CMS)
│   └── uploads/    # servidor de arquivos enviados (/uploads/*)
├── components/     # UI (layout, home, chatbot, acessibilidade, transparência)
├── db/             # schema Drizzle + acesso ao banco
├── lib/            # auth, conteúdo, sanitização de HTML, uploads
├── data/           # dados estruturados (instituição, serviços, FAQ…)
└── middleware.ts   # proteção das rotas /admin
```

## Rodando localmente

```bash
npm install
cp .env.example .env      # gere o SESSION_SECRET (instruções no arquivo)
npm run db:migrate        # cria as tabelas
npm run db:seed           # cria o admin inicial (anote a senha exibida)
npx next dev -p 4321      # http://localhost:4321  ·  painel em /admin
```

Sem `DATABASE_URL` no `.env`, o projeto usa o banco local PGlite automaticamente — não é
preciso instalar PostgreSQL para desenvolver.

> **PGlite não aceita dois processos ao mesmo tempo:** pare o `next dev` antes de rodar
> qualquer script `db:*` localmente.

## Scripts

| Comando | O que faz |
|---|---|
| `npx next dev -p 4321` | servidor de desenvolvimento |
| `npm run build` · `npm start` | build de produção e inicialização |
| `npm run db:generate` | gera migrações após alterar `src/db/schema.ts` |
| `npm run db:migrate` | aplica as migrações (cria/atualiza tabelas) |
| `npm run db:seed` | cria o usuário administrador inicial |
| `npm run db:import-wp` | importa páginas, notícias e documentos do site WordPress atual |
| `bash scripts/backup.sh` | backup diário (banco + arquivos, retenção de 30 dias) |
| `bash scripts/verificar-seguranca.sh URL` | verificação de segurança (OWASP) em qualquer ambiente |
| `npx tsc --noEmit -p .` | checagem de tipos |

## Variáveis de ambiente

Todas estão documentadas em [`.env.example`](.env.example). As essenciais em produção:
`DATABASE_URL`, `SESSION_SECRET`, `ADMIN_EMAIL`, `UPLOAD_DIR`, `SITE_URL`.

## Produção

Guia completo de instalação no servidor (PostgreSQL + PM2 + Nginx + HTTPS + backup):
**[`DEPLOY.md`](DEPLOY.md)**.

## Documentação do projeto

| Arquivo | Conteúdo |
|---|---|
| [`PROJECT_CONTEXT.md`](PROJECT_CONTEXT.md) | escopo, decisões e etapas do projeto |
| [`ECOSSISTEMA.md`](ECOSSISTEMA.md) | decisões gerais e status de cada uma das 6 etapas |
| [`ARCHITECTURE.md`](ARCHITECTURE.md) | estrutura do código, banco, camadas e integrações |
| [`DESIGN_SYSTEM.md`](DESIGN_SYSTEM.md) | identidade visual, cores e tipografia |
| [`DEPLOY.md`](DEPLOY.md) | instalação e atualização em produção |
| [`LGPD.md`](LGPD.md) | inventário de dados pessoais (LGPD) |
| [`SEGURANCA.md`](SEGURANCA.md) | testes de segurança (OWASP Top 10) e riscos conhecidos |
| [`HOMOLOGACAO.md`](HOMOLOGACAO.md) | roteiro de homologação das entregas |
| [`MANUAL-PAINEL.md`](MANUAL-PAINEL.md) | manual da equipe para usar o painel (treinamento) |
| [`CONTRIBUTING.md`](CONTRIBUTING.md) | convenções de código e regras de operação |

---

Desenvolvido por **Trius Tecnologia** para o Itanhaém Prev.

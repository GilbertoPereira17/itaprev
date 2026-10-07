# ARCHITECTURE — Itanhaém Prev

Arquitetura do código: organização de pastas, camadas e padrões. Fonte de verdade do
**código**; para escopo/etapas veja `PROJECT_CONTEXT.md` e `ECOSSISTEMA.md`.

> Atualize este arquivo sempre que a estrutura mudar.

---

## 1. Visão geral

Aplicação **Next.js 15 (App Router, modo servidor)** com dois domínios no mesmo projeto:

- **Site público** (`src/app/(site)/*`) — renderizado no servidor, conteúdo vindo do banco.
- **Painel administrativo / CMS** (`src/app/admin/*`) — protegido por sessão, alimenta o site.

Persistência em **PostgreSQL + Drizzle ORM**. Sem `DATABASE_URL`, usa **PGlite** local
(`./.data`) — só para desenvolvimento. Uploads (PDFs/imagens) gravados em `UPLOAD_DIR` e
servidos pela rota `src/app/uploads/[...path]` (`/uploads/*`; em produção o Nginx serve
essa pasta direto do disco).

```text
src/
├── app/
│   ├── layout.tsx                 # layout raiz (fontes, metadados)
│   ├── globals.css                # tokens CSS + estilos globais
│   ├── uploads/[...path]/         # serve os arquivos enviados pelo painel
│   ├── (site)/                    # SITE PÚBLICO
│   │   ├── layout.tsx             # Header + Footer + AccessibilityWidget + ChatWidget
│   │   ├── page.tsx               # Home
│   │   ├── [slug]/page.tsx        # páginas institucionais dinâmicas (CMS)
│   │   ├── institucional, segurados, conselhos, contato, transparencia/
│   │   ├── noticias/ + noticias/[slug]/
│   │   └── documentos/[slug]/     # biblioteca de documentos públicos
│   └── admin/                     # PAINEL (CMS)
│       ├── login/                 # autenticação
│       └── (panel)/               # área logada (layout com AdminNav)
│           ├── page.tsx           # dashboard
│           ├── noticias/          # CRUD de notícias (+ NewsForm, [id], novo)
│           ├── paginas/           # CRUD de páginas (+ PageForm, [id], nova)
│           ├── slides/            # banner da Home
│           ├── documentos/        # upload e organização de documentos
│           ├── faq/               # perguntas frequentes
│           ├── configuracoes/     # dados do instituto, links, contatos
│           ├── usuarios/          # gestão de usuários do painel
│           └── conta/             # troca da própria senha
├── components/
│   ├── layout/                    # Header, Footer, PageHero, BrandMark
│   ├── home/                      # HeroSlider, QuickAccess, ServicesGrid, NewsSection,
│   │                              #   FAQSection, Highlight, Certification, WhereWeAre
│   ├── content/                   # RichText (render), DocumentBrowser
│   ├── admin/                     # AdminNav, RichTextEditor (TipTap), ui (Input, etc.)
│   ├── accessibility/             # AccessibilityWidget (eMAG/WCAG)
│   └── chatbot/                   # ChatWidget (assistente "Ita")
├── db/
│   ├── schema.ts                  # tabelas Drizzle
│   └── index.ts                   # conexão (Postgres via pg, ou PGlite no dev)
├── lib/                           # regras e utilitários do servidor
├── data/                          # dados estáticos de apoio (institution, seed de news/faq)
├── types/                         # interfaces TypeScript compartilhadas
└── middleware.ts                  # protege as rotas /admin (exige sessão)
```

## 2. Banco de dados (`src/db/schema.ts`)

| Tabela | Conteúdo |
|---|---|
| `users` | usuários do painel (bcrypt, papel/role, módulos liberados ao Editor) |
| `settings` | pares chave-valor (dados do instituto, links, contatos) |
| `slides` | banner rotativo da Home |
| `news` | notícias/comunicados |
| `faqs` | perguntas frequentes |
| `pages` | páginas institucionais dinâmicas (servidas em `/(site)/[slug]`) |
| `docSections`, `docGroups`, `documents` | biblioteca de documentos públicos (transparência) |
| `documentVersions` | versões anteriores de cada documento (guardadas ao trocar o arquivo) |
| `messages` | contato e ouvidoria, com status, anotação interna, responsável (triagem), resposta ao cidadão e código de acesso |
| `chatbotKnowledge` | base de conhecimento da assistente "Ita" (editada no painel) |
| `chatLogs` | registro das conversas do chat (dados pessoais ocultados; apagado após 180 dias) |

Migrações geradas por `drizzle-kit` (`npm run db:generate`) em `./drizzle`, aplicadas por
`npm run db:migrate`. Carga inicial: `npm run db:seed` (idempotente: só preenche tabelas vazias).

**Proteção do conteúdo nas atualizações:**
- `db:migrate` faz `pg_dump` antes de aplicar migrações pendentes e **bloqueia** as destrutivas
  (DROP/TRUNCATE/DELETE/RENAME/troca de tipo) salvo `ALLOW_DESTRUCTIVE_MIGRATION=1`.
- `db:import-wp --force` (recria seções de documentos) é bloqueado em produção salvo
  `ALLOW_DESTRUCTIVE_IMPORT=1`.
- Em produção, o app **não sobe sem `DATABASE_URL`** (evita gravar num banco local por engano).
- `scripts/atualizar.sh`: backup → pull → migrate → build (com rollback automático) → restart.
- Migrações devem ser **somente aditivas** (regras em `CONTRIBUTING.md`).

## 3. Camadas de servidor (`src/lib/`)

| Módulo | Responsabilidade |
|---|---|
| `auth.ts` | `getSession` / `requireUser` / `requireModule` / `requireAdmin` — controle de acesso |
| `permissions.ts` | módulos do painel e regra de acesso por módulo |
| `session.ts` | assina/verifica o JWT de sessão (cookie `itaprev_session`, 8h) |
| `content.ts` | leitura do conteúdo público (settings, slides, notícias, páginas) |
| `admin.ts` | helpers das Server Actions do painel (`done`, `fail`, leitura de FormData) |
| `sanitize.ts` | `cleanHtml` — sanitiza todo HTML vindo do editor/WordPress |
| `storage.ts` | uploads: valida extensão **e magic bytes**, grava em `UPLOAD_DIR` |
| `format.ts` | `formatDate`, `mediaUrl`, `formatBytes` |
| `site-info.ts` | monta os dados institucionais a partir das `settings` |

As mutações do painel usam **Server Actions** (arquivos `actions.ts` em cada rota), sempre
atrás de `requireUser`/`requireAdmin`.

## 4. Segurança

- Autenticação própria: **bcrypt** (senha) + **JWT em cookie** (`jose`), sem dependência paga.
- `middleware.ts` bloqueia `/admin/*` sem sessão válida (redireciona ao login).
- **Permissões por módulo**: cada módulo do painel tem um `layout.tsx` com `requireModule(...)` e as
  Server Actions do módulo chamam o mesmo guarda; o menu só mostra o que o usuário pode acessar.
- Cookie `secure` em produção (HTTPS); `INSECURE_COOKIE=1` só para teste local sem TLS.
- **Verificação em duas etapas (TOTP, RFC 6238)** opcional por usuário (`src/lib/totp.ts`), compatível
  com Google/Microsoft Authenticator. O segredo fica criptografado (AES-256-GCM, chave derivada do
  `SESSION_SECRET`). Login com 2FA: senha → cookie temporário de 5 min → código → sessão.
- **Política de senha** (`src/lib/password.ts`): 10+ caracteres com letras e números, validade de
  180 dias. Senhas definidas por administrador são provisórias (troca obrigatória no 1º acesso).
- **Bloqueio por tentativas**: 5 erros de senha ou de código → 10 minutos de bloqueio.
- **Auditoria** (`src/lib/audit.ts`, tabela `audit_log`): todo login, saída, falha de acesso e
  alteração de conteúdo/usuários fica registrado (quem, o quê, item, IP, quando). Consulta em
  `/admin/auditoria` (só administradores). Não há tela para editar ou apagar registros.
- **Recuperação de acesso** pelo servidor: `npm run admin:recuperar -- email`.
- Todo HTML de conteúdo passa por `cleanHtml`; todo upload passa por validação de tipo real.

## 4.1. Busca, SEO, acessibilidade e privacidade

- **Busca** (`src/lib/content.ts` → `searchSite`, `searchNews`): ignora acentos e maiúsculas
  (`translate(lower(...))`), exige todas as palavras; página `/busca`, filtro em `/noticias` e campo em `/transparencia`.
- **SEO**: `src/app/sitemap.ts` (gerado do banco), `src/app/robots.ts` (bloqueia `/admin` e `/busca`),
  dados estruturados via `src/components/content/JsonLd.tsx` (GovernmentOrganization no layout, NewsArticle nas notícias),
  ícones `src/app/icon.png` / `apple-icon.png` e `src/app/manifest.ts` (PWA, base do app). O endereço público vem de `SITE_URL`.
- **Acessibilidade**: links de salto com `accesskey` 1/2/3 (eMAG) no layout do site; VLibras carregado sob demanda
  pelo widget de acessibilidade (botão à esquerda para não cobrir o widget).
- **Privacidade**: `/privacidade` (encarregado configurável em Contatos e links), inventário em `LGPD.md`.
  O visitante não recebe cookies; os únicos cookies são os de sessão da equipe no painel.

## 5. Integração com sistemas de terceiros (consulta via API)

Serviços que **já existem em sistemas de terceiros não são reimplementados** — o portal
**consulta via API ou redireciona**, mantendo uma única experiência para o segurado:

- **Holerite / contracheque:** GCASP (Servidor Online).
- **Informe de Rendimentos (IRPF):** ProtecWeb (Portal do Segurado).
- **Recadastramento / prova de vida:** Portal do Segurado.
- **Transparência (histórico):** portal de transparência atual.

Quando as APIs desses fornecedores forem liberadas, a consulta é encapsulada numa camada de
serviço em `src/lib/` (um módulo por integração), de forma que a UI não precise mudar. O
chatbot "Ita" já direciona o segurado para o sistema correto de cada serviço.

## 6. Chatbot ("Ita")

`ChatWidget` (cliente) envia `{ message, sessionId }` para a rota **`/api/chat`** do próprio site, que:

1. limita abuso por IP (em memória);
2. se a mensagem tiver um nº de protocolo, responde direto com o link de `/acompanhar` (sem IA);
3. monta a base de conhecimento (`src/lib/chatbot.ts`: Contatos e links + Assistente virtual + Perguntas frequentes)
   e chama o webhook n8n (`CHATBOT_WEBHOOK`) com `{ message, sessionId, knowledge }`;
4. grava pergunta e resposta em `chat_logs` (CPF/e-mail/telefone da pergunta ocultados).

O fluxo n8n ("ITAPREV - Chatbot Segurado") usa IA (OpenAI) com prompt restrito aos serviços do instituto,
trata `knowledge` como fonte principal e cai para o WhatsApp/telefone quando não sabe responder.
O endereço do n8n fica só no servidor.

**Acompanhamento de protocolo:** `/acompanhar` (`trackProtocol` em `src/lib/message-actions.ts`) exige o nº
do protocolo + código de acesso, e-mail ou telefone informado no envio; mostra situação e a "Resposta ao cidadão"
registrada no painel.

# ECOSSISTEMA ITANHAÉM PREV — Arquitetura e Status das 6 Etapas

> Documento-mestre: COMO cada etapa é construída, onde roda, como as peças se conectam e
> o que já está pronto. Ler junto com `PROJECT_CONTEXT.md` (negócio) e `ARCHITECTURE.md` (código).
> **Manter atualizado a cada entrega.**

---

## 0. Decisões que valem para todo o projeto

| Decisão | Detalhe |
|---|---|
| **Um app só** | Um único projeto Next.js em **modo servidor** (site público + painel + serviços), com **PostgreSQL** atrás. O CMS grava no banco e o site lê em tempo real — sem rebuild para publicar. |
| **Hospedagem** | **Servidor da Prefeitura** (Node.js + PM2 + Nginx + PostgreSQL 16). O **Paulo** (TI) baixa do GitHub e segue o `DEPLOY.md`. Nada em SaaS/serviço de terceiros. |
| **Sem custo recorrente** | O Instituto não deve ter mensalidade de software. Por isso: **autenticação própria** (bcrypt + JWT), sem SaaS pago. |
| **Terceiros = só consulta** | O que já existe em outras empresas (holerite, IR, recadastramento) **não é refeito**: o portal **consulta via API** deles ou redireciona. As APIs existem (confirmado). |
| **Chatbot** | Widget no site → fluxo **n8n mantido pela Trius** → **IA OpenAI**. Se o serviço não responder, o site encaminha para WhatsApp/telefone. |

Código-fonte e banco são entregues ao Instituto ao final (repositório Git completo).

---

## 1. Status por etapa

Legenda: ✅ pronto e validado · 🟡 parcial · ⏳ pendente

### Etapa 1 — Portal da Transparência
- ✅ Página `/transparencia` + **biblioteca de documentos** gerida pelo painel (seções, grupos,
  upload de PDFs, busca) — tabelas `docSections` / `docGroups` / `documents`.
- ✅ Importador do WordPress atual (`npm run db:import-wp`) traz os ~300 documentos existentes.
- ⏳ **Consulta à API da GCASP** (dados de transparência): encapsular numa camada de serviço em
  `src/lib/` para exibir os dados com a nossa UI acessível (o portal da GCASP é fraco nisso).
- ⏳ Trilha de auditoria de publicações (log com usuário, data e hora).

### Etapa 2 — Portal Institucional
- ✅ Home (banner, acesso rápido, serviços, notícias, FAQ, onde estamos), Institucional,
  Segurados, Conselhos, Notícias, Contato e **páginas dinâmicas** criadas pelo painel (`/[slug]`).
- ✅ Acessibilidade (widget eMAG/WCAG: fonte, alto contraste, escala de cinza), responsivo.
- ⏳ SEO técnico: `sitemap.xml`, `robots.txt` e dados estruturados (schema.org) — ainda não existem.

### Etapa 3 — Área do Beneficiário
- ⏳ Login do segurado por **CPF + senha + 2FA** (auth própria, mesma base do painel).
- ⏳ **Holerite** (API GCASP), **Informe de Rendimentos** (API ProtecWeb), **Recadastramento /
  prova de vida** (Portal do Segurado) — consultados via API e exibidos dentro do portal.
- ⏳ Solicitações/requerimentos com envio de documentos e acompanhamento.
- Hoje: o acesso rápido da Home e o chatbot já **direcionam** o segurado ao sistema certo.
- Ponto sensível: dados pessoais → LGPD, criptografia, logs de acesso.

### Etapa 4 — Painel Administrativo
- ✅ Painel `/admin` com login, sessão (JWT em cookie, 8h) e rotas protegidas por middleware.
- ✅ Gestão de **notícias, páginas, banner, documentos, FAQ, configurações (contatos/links)
  e usuários**; troca da própria senha. Validado de ponta a ponta (criar → editar → publicar).
- ✅ Papéis `admin` / `editor`.
- ⏳ 2FA no painel, política de senha (complexidade/expiração), trilha de auditoria completa,
  RBAC com granularidade por módulo, triagem das solicitações da Etapa 3.

### Etapa 5 — Chatbot
- ✅ Assistente **"Ita"** no site (widget) → fluxo n8n **"ITAPREV - Chatbot Segurado"** →
  IA OpenAI (gpt-5-mini) com prompt restrito ao instituto, memória por conversa, links reais
  dos sistemas (GCASP, ProtecWeb, censo) e fallback para WhatsApp/telefone. Testado ao vivo.
- ⏳ Registro das conversas para auditoria/análise dentro do painel.

### Etapa 6 — Segurança, LGPD, Testes e Implantação
- ✅ `DEPLOY.md`: HTTPS (Let's Encrypt), PM2, Nginx, backup diário do banco e dos uploads.
- ✅ Base de segurança: HTML sanitizado, upload validado por magic bytes, cookie seguro.
- ⏳ Mapeamento LGPD, varredura OWASP Top 10, ambiente de homologação, relatório de testes,
  plano de rollback, treinamento da equipe.

---

## 2. Entrega imediata

1. Repositório no GitHub com o **site novo + painel + chatbot funcionando** (estado atual).
2. **Paulo** provisiona o servidor Node + PostgreSQL na prefeitura e segue o `DEPLOY.md`.
3. Instituto valida o site no ar e começa a usar o painel.

## 3. Próximas frentes (após a entrega)

1. Integração da **API GCASP** na transparência (Etapa 1 completa).
2. **Área do Beneficiário** com CPF + 2FA consumindo GCASP/ProtecWeb (Etapa 3).
3. Endurecimento do painel: 2FA, auditoria, política de senha (Etapa 4).
4. LGPD, testes de segurança, homologação e treinamento (Etapa 6).
5. App móvel via Capacitor (escopo novo — ver `PROJECT_CONTEXT.md` §2.1.1).

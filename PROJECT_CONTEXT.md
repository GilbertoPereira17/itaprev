# PROJECT CONTEXT: Plataforma Digital Itanhaém Prev

> Fonte de verdade sobre escopo, decisões e convenções do projeto. Consulte antes de implementar
> mudanças e mantenha atualizado. Arquitetura do código: `ARCHITECTURE.md`. Status por etapa:
> `ECOSSISTEMA.md`.

---

## 1. Dados gerais

- **Cliente:** Instituto de Previdência dos Servidores Públicos de Itanhaém (Itanhaém Prev)
- **Desenvolvimento:** Trius Tecnologia
- **Site legado:** `https://www.itanhaemprev.sp.gov.br/` (WordPress) — conteúdo migrado por `npm run db:import-wp`
- **Público-alvo:** aposentados, pensionistas e servidores municipais de Itanhaém — foco extremo em
  usabilidade para idosos e conformidade eMAG / WCAG 2.1.

---

## 2. Escopo — 6 etapas

1. **Portal da Transparência** — LAI (Lei 12.527/11), balancetes, balanços, DRAA, investimentos RPPS
   (Res. CMN), estudos atuariais, portarias/editais, busca interna, CMS e trilha de auditoria.
2. **Portal Institucional** — layout moderno e acessível (eMAG/WCAG 2.1), responsivo, notícias,
   navegação por público (aposentados, pensionistas, ativos), SEO técnico.
3. **Área do Beneficiário e Serviços Online** — login por CPF + 2FA, holerites, informe de
   rendimentos, recadastramento anual com prova de vida, requerimentos online.
4. **Painel Administrativo** — CMS unificado, biblioteca de documentos, permissões (RBAC), 2FA,
   política de senhas e logs de auditoria.
5. **Chatbot e Canais de Atendimento** — assistente virtual para dúvidas frequentes, encaminhamento
   para atendimento humano / WhatsApp.
6. **Segurança, LGPD, Testes e Implantação** — HTTPS/TLS 1.2+, backup diário, LGPD, testes OWASP,
   homologação com o Instituto, implantação em produção.

---

## 2.1. Decisões técnicas

- **Hospedagem:** tudo (site + painel + serviços) no **servidor da Prefeitura**, como app Next.js em
  modo servidor + **PostgreSQL 16** (Node + PM2 + Nginx). A TI da prefeitura baixa do GitHub e segue
  o `DEPLOY.md`; atualizações só por `scripts/atualizar.sh`.
- **Sem custo recorrente para o Instituto:** nada de SaaS pago. Autenticação **própria**
  (bcrypt + JWT) no lugar de bibliotecas/serviços externos.
- **Sistemas de terceiros = só consulta:** holerite e dados de transparência vêm da **GCASP**;
  informe de rendimentos e recadastramento, do **ProtecWeb / Portal do Segurado**. O portal **não
  refaz** esses sistemas: **consulta via API** (disponíveis) e exibe com UI acessível própria.
  Padrão em `ARCHITECTURE.md` §5.
- **Chatbot:** widget no site → fluxo n8n mantido pela Trius → IA (OpenAI). Se o serviço não
  responder, o site encaminha para WhatsApp/telefone.
- **Conteúdo publicado é intocável nas atualizações:** migrações somente aditivas, backup automático
  e rollback (regras em `CONTRIBUTING.md`).

## 2.1.1. App móvel (fase posterior ao site)

- Aplicativo iOS + Android via **Capacitor**, empacotando o mesmo site Next.js (um código, dois apps).
- Build iOS na nuvem (Codemagic), sem precisar de Mac.
- Recurso nativo previsto: **notificação push** (avisos de recadastramento/holerite) — também ajuda
  na aprovação da Apple. Biometria não necessária.

## 2.2. Diretrizes de conteúdo e tom (OBRIGATÓRIO)

- **Sem autopromoção institucional.** Nada de "Excelência Reconhecida", "Destaque Nacional",
  "referência no Brasil". Tom **sóbrio, neutro, informativo e a serviço do segurado**. Certificações
  (Pró-Gestão RPPS Nível II) podem ser citadas de forma factual e discreta.
- **Público idoso:** clareza, previsibilidade, texto grande, alvos de toque grandes (≥ 48px).
  Layout simples e centralizado é o correto aqui.
- **Acessibilidade (eMAG):** alto contraste, escala de cinza e ajuste de fonte sempre funcionando,
  construídos sobre tokens CSS.

## 3. Dados oficiais cadastrais

- **Endereço:** Rua José Mendes de Araújo, 219, Vila São Paulo – CEP 11740-174, Itanhaém - SP
- **Telefones:** (13) 3427-7183 (fixo) | (13) 3426-9426 (WhatsApp oficial)
- **Atendimento:** segunda a sexta, das 08h às 17h
- **E-mails:** `atendimento@itanhaemprev.sp.gov.br` | `ouvidoria@itanhaemprev.sp.gov.br`
- **Certificação:** Pró-Gestão RPPS Nível II (MPS / CONAPREV)
- **Conselhos e comitês:** Conselho de Administração, Conselho Fiscal e Comitê de Investimentos

---

## 4. Stack

- **Aplicação:** Next.js 15 (App Router, modo servidor), React 19, TypeScript
- **Estilo:** Tailwind CSS, lucide-react, tokens CSS da marca
- **Banco:** PostgreSQL 16 + Drizzle ORM (PGlite local no desenvolvimento)
- **Autenticação:** própria (bcrypt + JWT em cookie); 2FA a implementar sobre ela
- **Integrações de terceiros:** camada de serviço em `src/lib/` por fornecedor

---

## 5. Status

Status detalhado por etapa (pronto / parcial / pendente) em **`ECOSSISTEMA.md` §1**.

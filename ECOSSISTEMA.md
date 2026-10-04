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

## 1. Status por requisito da proposta

Legenda: ✅ pronto e validado · 🟡 parcial · ⏳ pendente · 🔒 depende de terceiros (APIs GCASP/ProtecWeb)
Revisão completa em 04/10/2026, conferida no código.

### Etapa 1 — Portal da Transparência
| Requisito da proposta | Status |
|---|---|
| Estrutura organizacional, competências e legislação | ✅ páginas institucionais + seções de legislação |
| Demonstrativos financeiros/contábeis (balancetes, balanços, DRAA) | ✅ biblioteca de documentos (318 importados) |
| Política de investimentos, carteira, rentabilidade, enquadramento CMN | 🟡 documentos publicados; **dados estruturados** dependem da API 🔒 |
| Estudos atuariais | ✅ seções Avaliação Atuarial / DRAA / Relatório de Gestão Atuarial |
| Atos normativos, editais, contratos, portarias | ✅ via seções de documentos (editais/contratos: criar seções quando houver conteúdo) |
| Categorização, indexação e **busca interna** | ✅ busca geral `/busca` (documentos, páginas, notícias; ignora acentos) + busca dentro de cada seção |
| CMS sem dependência do fornecedor | ✅ |
| Trilha de auditoria (usuário, data, hora) | ✅ `/admin/auditoria` |
| Adequação à LAI | ✅ conteúdo + Ouvidoria (pedido LAI com protocolo) + Política de Privacidade (`/privacidade`) |

### Etapa 2 — Portal Institucional
| Requisito | Status |
|---|---|
| Layout responsivo, UX/UI moderno | ✅ |
| Navegadores atuais | ✅ (testado em Chromium; validar Safari/Firefox na homologação) |
| Acessibilidade eMAG / WCAG 2.1 | 🟡 widget (fonte, contraste, cinza), **VLibras** sob demanda, atalhos eMAG Alt+1/2/3 com links de salto, foco e alvos grandes · ⏳ auditoria automática (axe/Lighthouse) na homologação |
| Páginas institucionais, legislação, canais, ouvidoria | ✅ (ouvidoria própria com protocolo) |
| Notícias com histórico e **busca** | ✅ |
| Navegação por público (aposentados, pensionistas, ativos) | ✅ |
| Integração nativa com a Transparência (base única) | ✅ mesmo banco |
| SEO técnico (URLs semânticas, sitemap.xml, schema.org) | ✅ sitemap dinâmico, robots, schema.org (órgão público e notícias), ícone e manifesto |

### Etapa 3 — Área do Beneficiário (núcleo da futura "central do servidor")
| Requisito | Status |
|---|---|
| Login por CPF + senha + 2FA | ⏳ base pronta (TOTP, política de senha, bloqueio) — falta o cadastro do segurado |
| Holerites e histórico de pagamentos | ⏳🔒 GCASP |
| Informe de rendimentos | ⏳🔒 ProtecWeb |
| Atualização cadastral com validação | ⏳🔒 |
| Recadastramento anual digital com prova de vida | ⏳🔒 Portal do Segurado (definir: integrar ou encaminhar) |
| Envio de documentos com **controle de versão** | ⏳ |
| Requerimentos: abertura, acompanhamento, histórico | ⏳ (reaproveitar o módulo de Mensagens: protocolo + status) |
| Demais informações previdenciárias | ⏳🔒 |
| Auditoria de acessos do próprio beneficiário | ⏳ (reaproveitar `audit_log`) |

### Etapa 4 — Painel Administrativo
| Requisito | Status |
|---|---|
| Autenticação segura + 2FA | ✅ |
| RBAC com granularidade por módulo | 🟡 perfis admin/editor · ⏳ permissões por módulo (ex.: só Ouvidoria, só Documentos) |
| Gestão centralizada de site + transparência | ✅ |
| Notícias com fluxo de revisão/aprovação (opcional) | ⏳ hoje: publicado / não publicado |
| Biblioteca de documentos com upload, **versionamento** e categorização | 🟡 upload e categorias ✅ · ⏳ versionamento (hoje o arquivo é substituído) |
| Painel de triagem das solicitações da Etapa 3 | ⏳ (depende da Etapa 3) |
| Controle de status das demandas | ✅ Mensagens e Ouvidoria |
| Auditoria completa | ✅ |
| Política de senhas (complexidade e expiração) | ✅ |

### Etapa 5 — Chatbot
| Requisito | Status |
|---|---|
| Atendimento inicial com IA, integrado ao site | ✅ "Ita" (n8n + OpenAI) |
| **Base de conhecimento configurável** | 🟡 hoje no prompt do n8n · ⏳ usar as **Perguntas frequentes do painel** como base (equipe edita sem a Trius) |
| Respostas automáticas para dúvidas frequentes | ✅ |
| Direcionamento para atendimento humano | ✅ WhatsApp/telefone |
| Registro completo das solicitações para auditoria | ⏳ conversas ficam só no n8n — gravar no banco e mostrar no painel |
| Mensagens automáticas de confirmação/acompanhamento | 🟡 protocolo na tela · ⏳ e-mail de confirmação (precisa do **SMTP da prefeitura**) |
| Apoio aos serviços da Área do Beneficiário | ⏳ (depende da Etapa 3) |

### Etapa 6 — Segurança, LGPD, Testes e Implantação
| Requisito | Status |
|---|---|
| TLS 1.2+ / HTTPS obrigatório | ✅ em produção (`www2`) |
| Criptografia em repouso quando aplicável | 🟡 segredos 2FA criptografados · ⏳ CPF e dados financeiros da Etapa 3 |
| Backup diário **incremental**, retenção **mínima de 30 dias**, restauração documentada (RPO/RTO) | 🟡 backup antes de cada atualização + restauração documentada · ⏳ rotina diária com retenção de 30 dias e RPO/RTO escritos |
| LGPD: mapeamento de dados, base legal, atendimento ao titular | 🟡 inventário (`LGPD.md`), Política de Privacidade, canal do titular na Ouvidoria, aviso no chat · ⏳ Instituto designar o encarregado (DPO) e validar com o jurídico |
| Testes funcionais e de segurança (OWASP Top 10) | 🟡 testes funcionais automatizados no navegador (fora do repositório) · ✅ 0 vulnerabilidades em dependências de produção · ⏳ varredura OWASP (ZAP) e relatório |
| Ambiente de homologação separado | ⏳ (ex.: `homolog.itanhaemprev...` no mesmo servidor, outro banco) |
| Homologação formal com relatório | ⏳ |
| Treinamento | ⏳ (manual do painel + vídeo curto) |
| Implantação com plano de rollback | ✅ `scripts/atualizar.sh` + `DEPLOY.md` |
| Logs estruturados e monitoramento de disponibilidade | 🟡 logs do PM2 · ⏳ monitor de disponibilidade (pode ser um fluxo n8n que testa o site a cada 5 min e avisa) |

---

## 2. Requisitos da "central do servidor" e do app (pensar desde já)

Objetivo: o servidor/segurado entra **uma vez** (site ou app) e consulta, num lugar só, o que hoje
está espalhado (GCASP, ProtecWeb, Portal do Segurado, site do instituto).

**Identidade e acesso**
- Cadastro de beneficiário **separado** dos usuários do painel (tabela própria, nunca misturar papéis).
- Login por CPF + senha + 2FA. Para público idoso, 2FA também por **código no e-mail** (gratuito, usa SMTP da prefeitura); SMS tem custo.
- Recuperação de senha por e-mail; primeiro acesso validando dados que o instituto já tem (CPF + data de nascimento + matrícula).
- Auditoria de cada acesso a dado pessoal (quem viu o holerite de quem, quando).

**Integrações (GCASP / ProtecWeb)**
- Um módulo por fornecedor em `src/lib/integracoes/`, com interface comum, **tempo limite**, mensagens claras quando o sistema deles estiver fora do ar e link alternativo.
- **Não guardar** cópia dos dados de terceiros sem necessidade (LGPD: minimização) — buscar na hora; cache curto só se o contrato da API permitir.
- Credenciais das APIs no `.env` do servidor, nunca no código.

**Busca centralizada**
- Agora: busca única no site (notícias + páginas + documentos).
- Depois do login: painel "Meus serviços" reunindo holerites, informes, situação do recadastramento e requerimentos.

**App (Capacitor)**
- O app abre o próprio site (mesmo código, mesmo login) — nada de segundo sistema.
- Exigências das lojas: **Política de Privacidade publicada** (obrigatória na Apple e no Google) e, se a conta puder ser criada pelo app, **opção de excluir/solicitar exclusão da conta** (regra da Apple).
- Recurso nativo: **notificações push** (Firebase, gratuito) — exige guardar o token do aparelho com consentimento.
- Manifesto PWA e ícones (também ajuda no celular sem app).
- Hoje o limite de tentativas fica na memória de um processo: se o site passar a rodar em vários processos, mover para o banco.

**LGPD (mais crítico a partir da Etapa 3)**
- Encarregado (DPO) definido pelo instituto e publicado.
- Política de Privacidade e termos de uso.
- Inventário: quais dados, por quê (base legal), por quanto tempo, quem acessa.
- CPF e dados financeiros: criptografia em repouso, acesso só do titular e de quem atende, tudo auditado.

---

## 3. Ordem recomendada

**Agora (não depende de ninguém):**
1. ~~Política de Privacidade + LGPD básica~~ ✅
2. ~~Busca geral do site e busca de notícias~~ ✅
3. ~~SEO técnico + VLibras + atalhos eMAG + ícone/manifesto~~ ✅
4. Backup diário com retenção de 30 dias + RPO/RTO documentados + monitor de disponibilidade.
5. Versionamento de documentos e permissões por módulo no painel.
6. Chatbot: base de conhecimento a partir do FAQ do painel + registro das conversas no painel.

**Quando as APIs chegarem:** Área do Beneficiário (cadastro, login, Meus serviços) → integrações GCASP/ProtecWeb → requerimentos.

**Antes da entrega final:** homologação separada, varredura OWASP + relatório, treinamento, app (Capacitor).

**Precisamos da prefeitura/instituto:** documentação + acesso de teste das APIs (GCASP, ProtecWeb), **SMTP** para e-mails, definição do **encarregado LGPD**, `pg_dump` instalado no servidor.

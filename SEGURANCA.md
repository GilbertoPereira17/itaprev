# Segurança — testes OWASP Top 10

Relatório dos testes de segurança da plataforma (Etapa 6). Repetir a cada versão nova, na
**homologação** e depois na **produção**.

## Como repetir

```bash
# verificação automática (só leitura, não altera nada)
bash scripts/verificar-seguranca.sh https://www.itanhaemprev.sp.gov.br
# dependências de produção
npm audit --omit=dev
```
Os itens marcados como **manual** abaixo são feitos no navegador, com um usuário de teste.

## Última execução

- **Data:** 07/10/2026 · **Versão:** branch `main` · **Ambiente:** build de produção + PostgreSQL 16
- `scripts/verificar-seguranca.sh`: **17 OK · 0 falha**
- `npm audit --omit=dev`: **0 vulnerabilidades** nas dependências que rodam no servidor

| OWASP 2021 | O que foi verificado | Como | Resultado |
|---|---|---|---|
| **A01** Controle de acesso | `/admin/*` sem login redireciona ao login | script | ✅ |
| | Editor sem o módulo não abre a tela nem executa a ação (ex.: Notícias, Usuários) | manual | ✅ |
| | Arquivos: `../` e codificações não saem da pasta de uploads | script | ✅ |
| | Consulta de protocolo exige nº + código/e-mail/telefone; mensagem de erro não revela se o protocolo existe | manual | ✅ |
| **A02** Falhas criptográficas | Senhas com bcrypt (custo 12); segredo do 2FA com AES-256-GCM; cookie de sessão `HttpOnly`, `SameSite=Lax`, `Secure` em produção; HSTS | código + script | ✅ |
| **A03** Injeção | Busca com `' OR 1=1; DROP TABLE` responde normalmente (consultas parametrizadas — Drizzle ORM) | script | ✅ |
| | XSS refletido na busca | script | ✅ |
| | XSS gravado: notícia com `<script>`, `onerror` e `javascript:` → tudo removido na publicação | manual | ✅ |
| **A04** Design inseguro | Limites por IP: formulários (5/10 min), consulta de protocolo (5/10 min), chat (20/5 min) | código | ✅ |
| **A05** Configuração | CSP, X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy, sem `X-Powered-By`, `/admin` fora dos buscadores | script | ✅ |
| **A06** Componentes vulneráveis | `npm audit --omit=dev` sem vulnerabilidades | npm | ✅ |
| **A07** Autenticação | 5 senhas erradas → bloqueio de 10 min (mesmo com a senha certa depois); senha mínima de 10 caracteres com letras e números; validade 180 dias; 2FA opcional (TOTP) | manual | ✅ |
| **A08** Integridade | Upload confere o conteúdo real (magic bytes): executável renomeado para `.pdf` é recusado; migrações que apagam dados são bloqueadas | manual | ✅ |
| **A09** Registro e monitoramento | Login, falhas, alterações de conteúdo/usuários/acessos ficam no Registro de atividades (sem tela de edição) | manual | ✅ |
| **A10** SSRF | O servidor só chama endereços fixos da configuração (n8n do chat, site WordPress na importação); nenhum endereço vem do usuário | código | ✅ |

## Riscos conhecidos e decisões

| Item | Situação | Motivo / próximo passo |
|---|---|---|
| CSP com `'unsafe-inline'` e `'unsafe-eval'` | Aceito | Exigido pelo Next.js (scripts inline de hidratação) e pelo VLibras (Unity/WebAssembly). As demais diretivas restringem origens a `self`, `vlibras.gov.br` e o CDN do VLibras |
| Vulnerabilidades em ferramentas de build (Tailwind 3, drizzle-kit) | Aceito | Só rodam no `npm run build`/desenvolvimento, não ficam expostas no site. Reavaliar ao migrar para Tailwind 4 |
| Limites por IP e bloqueio de login ficam em memória | Aceito | Uma instância só (PM2). Reiniciar o site zera os contadores |
| Webhook do n8n aceita chamadas diretas | Pendente | Depois que a produção estiver usando `/api/chat`, exigir um token secreto entre o site e o n8n |
| Telemetria do VLibras (PostHog, EUA) | Bloqueada pela CSP | Evita envio de dados de navegação a terceiros (LGPD) |

## Backup e restauração (teste)

`scripts/backup.sh` testado em PostgreSQL 16: dump + arquivos gerados e verificados, retenção de 30 dias
apagando só os antigos, cópia para `BACKUP_COPY_DIR`, e **restauração completa num banco novo** com
todas as tabelas e dados. Procedimento em [`DEPLOY.md`](DEPLOY.md#9-backup-diário-importante).

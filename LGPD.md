# LGPD — Inventário de dados pessoais

> Mapeamento dos dados pessoais tratados pela plataforma (requisito da Etapa 6).
> Texto público correspondente: página **/privacidade**. Revisar com o jurídico do Instituto e
> **atualizar sempre que um novo dado pessoal passar a ser coletado** (ex.: Área do Beneficiário).

Controlador: Itanhaém Prev. Encarregado (DPO): definido pelo Instituto e configurado no painel em
**Contatos e links → Proteção de dados (LGPD)**.

## 1. Inventário atual

| Dado | Origem | Onde fica | Finalidade | Base legal (LGPD) | Retenção | Quem acessa |
|---|---|---|---|---|---|---|
| Nome, CPF/matrícula (opcional), telefone, e-mail, mensagem | Fale conosco | Banco (`messages`) | Responder ao cidadão | Art. 7º II/III e art. 23; consentimento no formulário | Prazos de guarda de documentos públicos; não são apagadas pela equipe | Equipe do painel (login + 2FA), com auditoria |
| Os mesmos, ou nenhum (anônimo) | Ouvidoria / LAI / pedidos LGPD | Banco (`messages`) | Registrar e tratar manifestações | Art. 7º II/III e art. 23; LAI; consentimento | Idem | Idem |
| IP do remetente | Formulários, consulta de protocolo e chat | **Só em memória** (limite anti-spam/abuso, 5 a 10 min) | Segurança | Legítimo interesse / segurança | Não é gravado | — |
| Texto digitado no chat + identificador aleatório da conversa | Assistente "Ita" | n8n da Trius (memória da conversa) e provedor de IA (OpenAI, EUA) | Responder dúvidas | Execução de política pública; aviso no chat | Memória de curto prazo do fluxo; histórico de execuções do n8n | Trius (operador) |
| Pergunta e resposta do chat (CPF, e-mail e telefone **ocultados** antes de gravar; sem IP) | Assistente "Ita" | Banco (`chat_logs`) | Auditoria e melhoria da base de conhecimento | Execução de política pública / legítimo interesse | **180 dias** (apagado automaticamente) | Equipe com o módulo "Assistente virtual" |
| Nº do protocolo + código de acesso | Fale conosco / Ouvidoria | Banco (`messages`) | Permitir que o próprio cidadão acompanhe a manifestação em /acompanhar | Idem às mensagens | Idem às mensagens | O próprio cidadão (com código, e-mail ou telefone) e a equipe |
| Nome, e-mail, senha (hash bcrypt), segredo 2FA (criptografado), perfil | Usuários do painel | Banco (`users`) | Controle de acesso | Art. 7º II/III | Enquanto a pessoa tiver acesso (desativação não apaga, para manter a auditoria) | Administradores |
| Nome do usuário, ação, item, IP, data/hora | Uso do painel | Banco (`audit_log`) | Auditoria e segurança | Obrigação legal / segurança | Permanente (trilha de auditoria) | Administradores |
| IP, data/hora, URL | Acesso ao site | Logs do servidor (Nginx/PM2) | Segurança e funcionamento | Marco Civil, art. 15 | Mínimo de 6 meses (Marco Civil) — política do servidor | TI da prefeitura |
| Cópias de tudo acima | Backups | Pasta de backups do servidor | Recuperação de desastre | Segurança | Conforme rotina de backup (meta: 30 dias) | TI da prefeitura |

**Não coletados hoje:** cookies de visitante, analytics, rastreadores, localização, dados de pagamento.
Os cookies existentes (`itaprev_session`, `itaprev_2fa`) são **essenciais** e só existem para a equipe logada no painel.

## 2. Operadores (terceiros que tratam dados em nome do Instituto)

| Operador | Dado | Observação |
|---|---|---|
| Trius Tecnologia (n8n) | Texto do chat | Infraestrutura do assistente virtual |
| OpenAI | Texto do chat | Processamento fora do Brasil (transferência internacional, art. 33). O chat avisa para não enviar dados pessoais |
| Prefeitura (TI) | Todos (hospedagem) | Servidor, banco e backups |
| Governo Federal (VLibras) | Dados técnicos de acesso do navegador | Só quando o usuário ativa a tradução para Libras |

## 3. Direitos do titular (art. 18)

Canal: **Ouvidoria → tipo "Meus dados pessoais (LGPD)"** ou e-mail do encarregado. O pedido entra em
**Painel → Mensagens e Ouvidoria** com protocolo; o andamento fica registrado e auditado.

## 4. A fazer antes da Área do Beneficiário (Etapa 3)

- [ ] Instituto designar e publicar o encarregado (DPO)
- [ ] Incluir no inventário: CPF, dados cadastrais, holerites, informes e documentos enviados
- [ ] Criptografia em repouso de CPF e documentos do beneficiário
- [ ] Registro de acesso a cada dado pessoal (quem consultou o quê de quem)
- [ ] Avaliar Relatório de Impacto (RIPD) — recomendado para dados financeiros em escala
- [ ] Definir retenção dos documentos enviados no recadastramento
- [ ] App: exclusão/solicitação de exclusão de conta pelo próprio usuário (exigência da Apple)

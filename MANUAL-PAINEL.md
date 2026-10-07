# Manual do Painel — Itanhaém Prev

Guia para a equipe do Instituto usar o painel administrativo do site.
Endereço: **`/admin`** no site (ex.: `https://www.itanhaemprev.sp.gov.br/admin`).

---

## 1. Entrar no painel

1. Acesse `/admin`, informe **e-mail** e **senha**.
2. **Primeiro acesso:** o painel pede uma senha nova (mínimo de 10 caracteres, com letras e números).
3. Se a verificação em duas etapas estiver ativa, digite o **código de 6 números** do aplicativo no celular.

> Errar a senha **5 vezes** bloqueia o acesso por **10 minutos**. A senha vence a cada **180 dias**.

### Proteger a conta (recomendado)
**Minha conta → Verificação em duas etapas:** instale o Google Authenticator ou o Microsoft Authenticator,
leia o QR Code e digite o código para confirmar. A partir daí, todo login pede senha + código.

**Perdeu o celular?** Peça a um administrador: **Usuários → Redefinir 2FA**.

---

## 2. Conteúdo do site

### Notícias
**Notícias → Nova notícia:** título, categoria, data, resumo, texto e imagem de capa.
Desmarque **Publicada** para deixar em rascunho. A notícia aparece na página inicial e em `/noticias`.

### Páginas de texto
Páginas como Aposentados, Pensionistas e Servidores ativos. Edite o texto com o editor (negrito, listas, links).

### Documentos (transparência, conselhos, Pró-Gestão)
Organização: **Seção** (ex.: Conselho Fiscal) → **Grupo** (ex.: Atas 2026) → **Documentos** (PDF, Word, Excel, imagem).
- **Adicionar:** dentro do grupo, escolha um ou vários arquivos e clique **Enviar**.
- **Trocar um arquivo:** clique em **trocar arquivo**, escolha o novo e **Salvar**.
  O arquivo anterior **não é apagado**: fica em **Versões anteriores**, com data e quem trocou, e pode ser
  aberto ou **restaurado**.
- O sistema recusa arquivos cujo conteúdo não corresponde à extensão (ex.: programa renomeado para `.pdf`).

### Banner da página inicial
Imagens e textos que passam no topo da página inicial. Use imagens largas (paisagem).

### Perguntas frequentes
Aparecem na página inicial **e também são usadas pela assistente virtual (Ita)** para responder.

---

## 3. Atendimento

### Mensagens e Ouvidoria
Tudo o que chega pelo **Fale conosco** e pela **Ouvidoria** do site, cada um com **número de protocolo**.

**Triagem:**
- **Sem responsável:** o que ainda ninguém pegou. Abra a mensagem e escolha o **Responsável**.
- **Comigo:** o que está com você.
- **Em aberto / Arquivadas:** situação geral.

**Dentro da mensagem:**
- **Situação:** Nova → Em andamento → Respondida (ou Arquivada).
- **Resposta ao cidadão:** aparece para quem enviou ao consultar o protocolo no site (`/acompanhar`).
- **Anotação interna:** só a equipe vê.

> Mensagens **não são apagadas** (histórico da Ouvidoria). Pedidos sobre dados pessoais chegam com o tipo
> **"Meus dados pessoais (LGPD)"**.

**Como o cidadão acompanha:** ao enviar, ele recebe **nº do protocolo + código de acesso**. Em
**Acompanhar protocolo** (`/acompanhar`) ele informa o número e o código (ou o e-mail/telefone usado) e vê a
situação e a resposta.

### Assistente virtual (Ita)
- **Base de conhecimento:** escreva o que a Ita deve saber (ex.: prazos do recadastramento, documentos
  necessários). Vale na hora, para as próximas perguntas. Desmarque **Em uso pela Ita** para pausar uma informação.
- A Ita também usa as **Perguntas frequentes** e os **Contatos e links**: mantenha-os atualizados.
- **Conversas:** o que os segurados perguntaram e o que a Ita respondeu (CPF, e-mail e telefone aparecem
  ocultados). Use o filtro **Sem resposta** para descobrir o que falta na base. O registro é apagado após 180 dias.

---

## 4. Configurações

### Contatos e links
Telefone, WhatsApp, e-mail, endereço, horário, links dos sistemas (holerite, informe de rendimentos,
recadastramento, transparência) e o **encarregado de dados (LGPD)**. Mudou aqui, muda no site inteiro e na Ita.

### Usuários (só administradores)
- **Novo usuário:** nome, e-mail, senha provisória (a pessoa troca no primeiro acesso) e **perfil**.
- **Perfis:**
  - **Administrador:** acessa tudo, inclusive Usuários e Registro de atividades.
  - **Editor:** acessa só os **módulos marcados** (ex.: só Mensagens e Ouvidoria; só Documentos).
- **Acesso ao painel:** muda o perfil e os módulos de alguém.
- **Redefinir senha**, **Redefinir 2FA**, **Desativar/Reativar** (desativar não apaga o histórico).

### Registro de atividades (só administradores)
Quem fez o quê e quando: entradas e saídas, tentativas com erro, publicações, trocas de arquivo, mudanças de
usuários e de acesso. Não pode ser editado nem apagado.

---

## 5. Dúvidas rápidas

| Situação | O que fazer |
|---|---|
| Esqueci a senha | Peça a um administrador: **Usuários → Redefinir senha** |
| Nenhum administrador consegue entrar | A TI roda no servidor: `npm run admin:recuperar -- email` |
| Troquei um PDF errado | **Documentos → Versões anteriores → restaurar esta versão** |
| A Ita respondeu algo desatualizado | Corrija em **Assistente virtual**, **Perguntas frequentes** ou **Contatos e links** |
| Menu sem algum módulo | Seu usuário não tem acesso; peça ao administrador em **Usuários → Acesso ao painel** |

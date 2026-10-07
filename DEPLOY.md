# Instalação no servidor — Itanhaém Prev

Guia para colocar o portal do Itanhaém Prev em produção no servidor da Prefeitura.
Tempo estimado: **30–45 minutos**. Dúvidas: Gilberto (Trius Tecnologia).

---

## 1. O que o sistema precisa

| Item | Versão | Observação |
|---|---|---|
| **Node.js** | 20 LTS ou superior | `node -v` para conferir |
| **PostgreSQL** | 16 | banco do site e do painel |
| **PM2** | qualquer | mantém o site no ar e reinicia sozinho (`npm i -g pm2`) |
| **Nginx** | qualquer | recebe o tráfego (porta 80/443) e repassa ao Node |
| **Git** | qualquer | para baixar e atualizar o projeto |
| Disco | ~2 GB livres | ~450 MB de documentos (PDFs) + crescimento |

> Sistema operacional: o guia usa **Linux (Ubuntu/Debian)**. Em Windows Server funciona igual
> (Node + PostgreSQL + PM2), trocando o Nginx por IIS com *URL Rewrite/ARR* como proxy reverso.

---

## 2. Banco de dados

```bash
sudo -u postgres psql
```
```sql
CREATE USER itaprev WITH PASSWORD 'TROQUE_POR_UMA_SENHA_FORTE';
CREATE DATABASE itaprev OWNER itaprev;
\q
```

---

## 3. Baixar o projeto

```bash
cd /var/www
git clone https://github.com/GilbertoPereira17/itaprev.git
cd itaprev
npm ci
```

> **Atenção:** o `npm ci` precisa instalar também as dependências de desenvolvimento
> (Next.js, Tailwind, TypeScript e `tsx` são usados no `build` e nas migrações).
> Se o servidor tiver a variável `NODE_ENV=production` no ambiente, use
> `npm ci --include=dev` — caso contrário o `npm run build` do passo 6 falha por falta dessas ferramentas.

---

## 4. Configuração (`.env`)

```bash
cp .env.example .env
nano .env
```

Preencha:

| Variável | O que colocar |
|---|---|
| `DATABASE_URL` | `postgres://itaprev:SENHA@localhost:5432/itaprev` |
| `SESSION_SECRET` | gere com: `node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"` |
| `ADMIN_EMAIL` | e-mail do primeiro administrador do painel |
| `ADMIN_PASSWORD` | deixe **vazio** para gerar uma senha aleatória (aparece uma única vez no passo 5) |
| `UPLOAD_DIR` | `/var/www/itaprev-uploads` (pasta dos PDFs/imagens — **precisa estar no backup**) |
| `SITE_URL` | endereço público **atual** do site, sem barra no fim (ex.: `https://www2.itanhaemprev.sp.gov.br` enquanto estiver no www2). É usado no `sitemap.xml` e no Google |

```bash
sudo mkdir -p /var/www/itaprev-uploads
sudo chown -R $USER /var/www/itaprev-uploads
```

---

## 5. Criar as tabelas, o administrador e importar o conteúdo

```bash
npm run db:migrate     # cria as tabelas
npm run db:seed        # cria o admin + conteúdo inicial  → ANOTE a senha exibida
npm run db:import-wp   # importa documentos, páginas e notícias do site WordPress atual
```

O importador baixa ~300 documentos do site antigo para `UPLOAD_DIR` (alguns minutos).
Pode rodar de novo sem duplicar nada.

---

## 6. Compilar e iniciar

```bash
npm run build
pm2 start npm --name itaprev -- start -- -p 3000
pm2 save
pm2 startup      # siga a instrução exibida para iniciar junto com o servidor
```

Teste: `curl -I http://localhost:3000` deve responder `200`.

---

## 7. Nginx (domínio + HTTPS)

`/etc/nginx/sites-available/itaprev`:

```nginx
server {
    listen 80;
    server_name www.itanhaemprev.sp.gov.br itanhaemprev.sp.gov.br;

    client_max_body_size 30M;   # upload de PDFs pelo painel

    # Documentos servidos direto do disco (mais rápido)
    location /uploads/ {
        alias /var/www/itaprev-uploads/;
        add_header X-Content-Type-Options nosniff;
        expires 1d;
    }

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/itaprev /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d www.itanhaemprev.sp.gov.br -d itanhaemprev.sp.gov.br   # HTTPS gratuito
```

> O login do painel só funciona em **HTTPS** (cookie seguro). Para testar sem HTTPS
> antes do certificado, adicione `INSECURE_COOKIE=1` no `.env` e remova depois.

---

## 8. Acessar o painel

`https://www.itanhaemprev.sp.gov.br/admin` → entre com `ADMIN_EMAIL` e a senha do passo 5.
No primeiro acesso o painel pede uma senha nova. Depois, em **Minha conta**, ative a
**verificação em duas etapas** (código no celular) e crie os usuários da equipe em **Usuários**.

---

## 9. Backup diário (importante)

O script `scripts/backup.sh` faz, a cada execução:

- **banco** → `itaprev-banco-DATA.dump` (pg_dump, formato custom) e confere se o arquivo abre;
- **arquivos enviados** (`UPLOAD_DIR`) → pasta `arquivos/DATA`, **incremental**: cada dia é uma cópia completa
  para restaurar, mas só os arquivos novos ocupam espaço (os outros são *hard links* da cópia anterior);
- **retenção**: apaga backups com mais de **30 dias** (`BACKUP_RETENTION_DAYS` no `.env`);
- **cópia em outro local** se `BACKUP_COPY_DIR` estiver no `.env` (recomendado: outro disco ou servidor):
  os dumps do banco e um espelho atualizado dos arquivos (`arquivos-atual`).

Agende no `crontab -e` (todo dia às 2h):
```
0 2 * * * cd /var/www/itaprev && bash scripts/backup.sh >> backups/backup.log 2>&1
```
Teste uma vez na mão: `bash scripts/backup.sh` deve terminar com **"Backup concluído"**.

| Indicador | Meta |
|---|---|
| **RPO** (perda máxima de dados) | 24 horas (backup diário; antes de cada atualização há um backup extra) |
| **RTO** (tempo para voltar ao ar) | até 4 horas, seguindo o procedimento abaixo |

### Restaurar um backup diário (emergência)

```bash
cd /var/www/itaprev
pm2 stop itaprev
# 1. banco (troque a data pelo backup escolhido em ./backups)
pg_restore --clean --if-exists --no-owner -d "$DATABASE_URL" backups/itaprev-banco-AAAA-MM-DD_HHMMSS.dump
# 2. arquivos enviados (copia a pasta do dia escolhido para o UPLOAD_DIR)
cp -a backups/arquivos/AAAA-MM-DD_HHMMSS/. /var/www/itaprev-uploads/
pm2 start itaprev
```
> Para conferir um backup **sem mexer no site**, restaure num banco de teste:
> `createdb itaprev_teste && pg_restore --no-owner -d postgres://.../itaprev_teste arquivo.dump`.
> Recomenda-se fazer esse teste uma vez por mês.

---

## 10. Atualizar o site (quando a Trius enviar melhorias)

Use **sempre** o script de atualização — ele protege o conteúdo publicado:

```bash
cd /var/www/itaprev
bash scripts/atualizar.sh
```

O que ele garante:

- **Backup do banco antes de qualquer mudança** (em `./backups`, ou `BACKUP_DIR` do `.env`).
- **Não mexe** no `.env`, na pasta de uploads (`UPLOAD_DIR`) nem nos backups.
- **Bloqueia migração que apaga dados** (DROP, TRUNCATE, DELETE, RENAME, troca de tipo).
  Se aparecer "MIGRAÇÃO BLOQUEADA", **pare e fale com a Trius** — nada foi alterado.
- **Se o build falhar, volta sozinho para a versão anterior** e o site continua no ar.

> Não rode `npm run db:import-wp -- --force` em produção: ele recria seções de documentos e
> apagaria o que a equipe publicou. O script bloqueia isso sem confirmação explícita.

### Restaurar um backup (só em emergência)

```bash
pm2 stop itaprev
pg_restore --clean --if-exists --no-owner -d "postgres://itaprev:SENHA@localhost:5432/itaprev" \
  backups/itaprev-pre-atualizacao-AAAA-MM-DD_HHMMSS.dump
git reset --hard <versão anterior>   # o script mostra qual era
npm ci --include=dev && npm run build && pm2 start itaprev
```

---

## Ambiente de homologação (testes antes da produção)

Uma segunda cópia do site, com **banco e uploads próprios**, para a equipe validar cada entrega
antes de ela ir para o site oficial. Mostra uma faixa amarela "Ambiente de homologação" e fica fora do Google.

```bash
# banco separado
sudo -u postgres psql -c "CREATE DATABASE itaprev_homolog OWNER itaprev;"
# segunda cópia do projeto
cd /var/www && git clone https://github.com/GilbertoPereira17/itaprev.git itaprev-homolog
cd itaprev-homolog && cp ../itaprev/.env .env && nano .env
```
No `.env` da homologação, troque:

| Variável | Valor |
|---|---|
| `DATABASE_URL` | `postgres://itaprev:SENHA@localhost:5432/itaprev_homolog` |
| `UPLOAD_DIR` | `/var/www/itaprev-homolog-uploads` |
| `SITE_URL` | endereço da homologação (ex.: `https://homolog.itanhaemprev.sp.gov.br`) |
| `HOMOLOGACAO` | `1` |
| `SESSION_SECRET` | um **diferente** do de produção |

```bash
npm ci --include=dev && npm run db:migrate && npm run db:seed && npm run db:import-wp
npm run build && pm2 start npm --name itaprev-homolog -- start -- -p 3001 && pm2 save
```
No Nginx, crie um `server` igual ao do passo 7 com `server_name` da homologação, `proxy_pass http://127.0.0.1:3001`
e `alias /var/www/itaprev-homolog-uploads/`.

**Atualizar a homologação** (sempre antes da produção):
```bash
cd /var/www/itaprev-homolog && APP_NAME=itaprev-homolog PORT=3001 bash scripts/atualizar.sh
```

---

## Perdeu o acesso ao painel?

Se um administrador esqueceu a senha ou perdeu o celular do 2FA (e não há outro administrador
para redefinir pela tela **Usuários**), rode no servidor, na pasta do projeto:

```bash
npm run admin:recuperar -- email@itanhaemprev.sp.gov.br
```

Ele mostra uma senha provisória, desativa o 2FA da pessoa e registra a ação na auditoria.

> **Não troque o `SESSION_SECRET`** depois que a equipe ativar o 2FA: os códigos deixam de
> valer e cada pessoa precisa reconfigurar (use o comando acima se ninguém conseguir entrar).

---

## Problemas comuns

| Sintoma | Solução |
|---|---|
| Página em branco / erro 502 | `pm2 logs itaprev` para ver o erro |
| "SESSION_SECRET ausente" | preencha `SESSION_SECRET` no `.env` e `pm2 restart itaprev` |
| Não consigo logar sem HTTPS | ver nota do passo 7 (`INSECURE_COOKIE=1` temporário) |
| Upload de PDF falha | confira `client_max_body_size 30M` no Nginx e permissão de escrita em `UPLOAD_DIR` |
| Documento não abre | confira se a pasta `UPLOAD_DIR` do `.env` é a mesma do `alias` no Nginx |
| "DATABASE_URL ausente ou inválida em produção" | preencha `DATABASE_URL` no `.env` (o site se recusa a gravar num banco local por engano) |
| "MIGRAÇÃO BLOQUEADA" | nada foi alterado; fale com a Trius antes de prosseguir |
| "Backup (pg_dump) falhou" | instale o cliente do PostgreSQL (`pg_dump`) na mesma versão do servidor |

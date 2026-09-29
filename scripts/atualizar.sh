#!/usr/bin/env bash
# ============================================================
#  Itanhaém Prev — atualização segura em produção
#  Uso (na pasta do projeto):   bash scripts/atualizar.sh
#
#  O que faz, em ordem:
#   1. backup do banco (pg_dump) — sempre, antes de qualquer mudança
#   2. baixa a versão nova do GitHub (só avança; recusa se houver alteração local)
#   3. instala dependências
#   4. aplica migrações do banco (com bloqueio de migração destrutiva)
#   5. compila; SE O BUILD FALHAR, volta sozinho para a versão anterior
#   6. reinicia o site e confere se respondeu
#
#  Nunca toca em: .env, pasta de uploads (UPLOAD_DIR) e pasta de backups.
# ============================================================
set -euo pipefail

# Tudo dentro de main(): o bash lê a função inteira antes de executar, então o
# "git pull" pode atualizar este próprio arquivo sem quebrar a execução em andamento.
main() {
cd "$(dirname "$0")/.."
APP_NAME="${APP_NAME:-itaprev}"
PORT="${PORT:-3000}"

if [ ! -f .env ]; then echo "✖ .env não encontrado. Abortando."; exit 1; fi
set -a; . ./.env; set +a

case "${DATABASE_URL:-}" in
  postgres*) ;;
  *) echo "✖ DATABASE_URL ausente/inválida no .env. Abortando."; exit 1 ;;
esac

BACKUP_DIR="${BACKUP_DIR:-./backups}"
mkdir -p "$BACKUP_DIR"
STAMP="$(date +%Y-%m-%d_%H%M%S)"
DUMP="$BACKUP_DIR/itaprev-pre-atualizacao-$STAMP.dump"

echo "==> 1/6 Backup do banco em $DUMP"
pg_dump --format=custom --file="$DUMP" "$DATABASE_URL"

PREV="$(git rev-parse HEAD)"
echo "==> 2/6 Baixando atualização (versão atual: ${PREV:0:7})"
git pull --ff-only
NEW="$(git rev-parse HEAD)"
if [ "$PREV" = "$NEW" ]; then echo "    Já está na versão mais recente."; fi

echo "==> 3/6 Instalando dependências"
npm ci --include=dev

# Espera o site subir (até ~30s) e confirma HTTP 200
site_no_ar() {
  for _ in $(seq 1 15); do
    CODE="$(curl -s -o /dev/null -w '%{http_code}' "http://127.0.0.1:$PORT/" || true)"
    [ "$CODE" = "200" ] && return 0
    sleep 2
  done
  return 1
}

voltar_codigo() {
  echo "↩ Voltando o código para a versão anterior (${PREV:0:7})..."
  git reset --hard "$PREV"
  npm ci --include=dev
}

echo "==> 4/6 Migrações do banco"
if ! npm run db:migrate; then
  echo "✖ Migração não aplicada (bloqueada ou com erro). O banco NÃO foi alterado."
  voltar_codigo
  echo "  O site continua no ar na versão anterior. Fale com a Trius antes de tentar de novo."
  exit 1
fi

echo "==> 5/6 Compilando"
if ! npm run build; then
  echo "✖ Build falhou."
  voltar_codigo
  npm run build
  pm2 restart "$APP_NAME"
  if site_no_ar; then
    echo "↩ Site mantido no ar na versão anterior (HTTP 200). Backup do banco: $DUMP"
  else
    echo "⚠ Versão anterior restaurada, mas o site não respondeu. Veja: pm2 logs $APP_NAME"
  fi
  echo "  (se alguma migração foi aplicada, ela é aditiva e compatível com a versão anterior)"
  exit 1
fi

echo "==> 6/6 Reiniciando"
pm2 restart "$APP_NAME"
if site_no_ar; then
  echo "✔ Atualizado para ${NEW:0:7} e no ar (HTTP 200). Backup: $DUMP"
else
  echo "⚠ Site respondeu HTTP $CODE. Veja: pm2 logs $APP_NAME"
  echo "  Para voltar: git reset --hard $PREV && npm ci --include=dev && npm run build && pm2 restart $APP_NAME"
  exit 1
fi
}

main "$@"
exit

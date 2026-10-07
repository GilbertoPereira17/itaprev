#!/usr/bin/env bash
# ============================================================
#  Itanhaém Prev — backup diário (banco + arquivos enviados)
#  Uso (na pasta do projeto):   bash scripts/backup.sh
#  Agendamento sugerido (crontab -e, todo dia às 2h):
#    0 2 * * * cd /var/www/itaprev && bash scripts/backup.sh >> backups/backup.log 2>&1
#
#  O que faz:
#   1. banco: pg_dump no formato custom (restaurável com pg_restore)
#   2. arquivos (UPLOAD_DIR): cópia INCREMENTAL — cada dia vira uma pasta completa,
#      mas só os arquivos novos/alterados ocupam espaço (os demais são hard links
#      para a cópia anterior). Usa só cp/find do Linux (GNU coreutils).
#   3. confere se o dump abre (pg_restore --list) — backup que não abre não vale
#   4. apaga backups com mais de BACKUP_RETENTION_DAYS dias (padrão: 30)
#   5. se BACKUP_COPY_DIR estiver definido (ex.: pasta de rede), copia para lá também
#
#  Variáveis do .env: DATABASE_URL, UPLOAD_DIR, BACKUP_DIR (padrão ./backups),
#  BACKUP_RETENTION_DAYS (padrão 30), BACKUP_COPY_DIR (opcional).
#  Sai com código ≠ 0 se algo falhar (o cron/monitor pode avisar).
# ============================================================
set -euo pipefail
cd "$(dirname "$0")/.."

if [ ! -f .env ]; then echo "✖ .env não encontrado."; exit 1; fi
set -a; . ./.env; set +a

case "${DATABASE_URL:-}" in
  postgres*) ;;
  *) echo "✖ DATABASE_URL ausente/inválida no .env."; exit 1 ;;
esac

BACKUP_DIR="${BACKUP_DIR:-./backups}"
RETENTION="${BACKUP_RETENTION_DAYS:-30}"
STAMP="$(date +%Y-%m-%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "==> $(date '+%d/%m/%Y %H:%M:%S') Backup iniciado"

DUMP="$BACKUP_DIR/itaprev-banco-$STAMP.dump"
pg_dump --format=custom --file="$DUMP" "$DATABASE_URL"
pg_restore --list "$DUMP" > /dev/null
echo "    banco:    $DUMP ($(du -h "$DUMP" | cut -f1)) — verificado"

# Deixa DESTINO igual a ORIGEM: copia o que é novo/mais recente e apaga o que sumiu.
# --remove-destination desfaz o hard link antes de gravar (a cópia anterior não muda).
espelhar() {
  local origem="$1" destino="$2"
  mkdir -p "$destino"
  cp -a -u --remove-destination "$origem"/. "$destino"/
  (cd "$destino" && find . -type f) | while IFS= read -r f; do
    [ -e "$origem/$f" ] || rm -f "$destino/$f"
  done
}

if [ -n "${UPLOAD_DIR:-}" ] && [ -d "$UPLOAD_DIR" ]; then
  SNAPS="$BACKUP_DIR/arquivos"
  mkdir -p "$SNAPS"
  PREV="$(ls -1d "$SNAPS"/20* 2>/dev/null | tail -1 || true)"
  SNAP="$SNAPS/$STAMP"
  [ -e "$SNAP" ] && SNAP="$SNAP-$$" # dois backups no mesmo segundo
  if [ -n "$PREV" ]; then cp -al "$PREV" "$SNAP"; fi
  espelhar "$UPLOAD_DIR" "$SNAP"
  touch "$SNAP" # data da pasta = data do backup (usada na retenção)
  echo "    arquivos: $SNAP ($(find "$SNAP" -type f | wc -l) arquivos; $( [ -n "$PREV" ] && echo "incremental sobre $(basename "$PREV")" || echo "primeira cópia completa"))"
else
  echo "    ⚠ UPLOAD_DIR não definido ou inexistente: arquivos enviados NÃO entraram no backup."
fi

# Retenção: remove backups antigos (diários e os feitos antes das atualizações).
# Apagar uma cópia incremental antiga é seguro: os arquivos que as cópias novas
# compartilham com ela continuam existindo nelas.
find "$BACKUP_DIR" -maxdepth 1 -type f -name 'itaprev-*.dump' \
  -mtime +"$RETENTION" -print -delete | sed 's/^/    removido (mais de '"$RETENTION"' dias): /'
if [ -d "$BACKUP_DIR/arquivos" ]; then
  find "$BACKUP_DIR/arquivos" -mindepth 1 -maxdepth 1 -type d -name '20*' -mtime +"$RETENTION" -print \
    -exec rm -rf {} + | sed 's/^/    removido (mais de '"$RETENTION"' dias): /'
fi

# Cópia em outro local (recomendado: outro disco ou servidor)
if [ -n "${BACKUP_COPY_DIR:-}" ]; then
  mkdir -p "$BACKUP_COPY_DIR"
  cp "$DUMP" "$BACKUP_COPY_DIR/"
  if [ -n "${SNAP:-}" ]; then espelhar "$SNAP" "$BACKUP_COPY_DIR/arquivos-atual"; fi
  find "$BACKUP_COPY_DIR" -maxdepth 1 -type f -name 'itaprev-*.dump' -mtime +"$RETENTION" -delete
  echo "    cópia em: $BACKUP_COPY_DIR"
fi

echo "==> Backup concluído"

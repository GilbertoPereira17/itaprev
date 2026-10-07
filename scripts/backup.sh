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
#  Também copia (incremental) a pasta privada dos beneficiários (PRIVATE_UPLOAD_DIR).
#  Variáveis do .env: DATABASE_URL, UPLOAD_DIR, PRIVATE_UPLOAD_DIR, BACKUP_DIR (padrão ./backups),
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

# Cópia incremental de uma pasta em $BACKUP_DIR/<nome>/DATA
SNAPS_FEITOS=()
copia_incremental() {
  local origem="$1" nome="$2"
  local snaps="$BACKUP_DIR/$nome"
  mkdir -p "$snaps"
  local prev; prev="$(ls -1d "$snaps"/20* 2>/dev/null | tail -1 || true)"
  local snap="$snaps/$STAMP"
  [ -e "$snap" ] && snap="$snap-$$" # dois backups no mesmo segundo
  if [ -n "$prev" ]; then cp -al "$prev" "$snap"; fi
  espelhar "$origem" "$snap"
  touch "$snap" # data da pasta = data do backup (usada na retenção)
  SNAPS_FEITOS+=("$nome:$snap")
  echo "    $nome: $snap ($(find "$snap" -type f | wc -l) arquivos; $( [ -n "$prev" ] && echo "incremental sobre $(basename "$prev")" || echo "primeira cópia completa"))"
}

if [ -n "${UPLOAD_DIR:-}" ] && [ -d "$UPLOAD_DIR" ]; then
  copia_incremental "$UPLOAD_DIR" arquivos
else
  echo "    ⚠ UPLOAD_DIR não definido ou inexistente: arquivos enviados NÃO entraram no backup."
fi
# Documentos dos beneficiários (já gravados criptografados)
PRIVADO="${PRIVATE_UPLOAD_DIR:-./privado}"
if [ -d "$PRIVADO" ]; then copia_incremental "$PRIVADO" privado; fi

# Retenção: remove backups antigos (diários e os feitos antes das atualizações).
# Apagar uma cópia incremental antiga é seguro: os arquivos que as cópias novas
# compartilham com ela continuam existindo nelas.
find "$BACKUP_DIR" -maxdepth 1 -type f -name 'itaprev-*.dump' \
  -mtime +"$RETENTION" -print -delete | sed 's/^/    removido (mais de '"$RETENTION"' dias): /'
for nome in arquivos privado; do
  [ -d "$BACKUP_DIR/$nome" ] || continue
  find "$BACKUP_DIR/$nome" -mindepth 1 -maxdepth 1 -type d -name '20*' -mtime +"$RETENTION" -print \
    -exec rm -rf {} + | sed 's/^/    removido (mais de '"$RETENTION"' dias): /'
done

# Cópia em outro local (recomendado: outro disco ou servidor)
if [ -n "${BACKUP_COPY_DIR:-}" ]; then
  mkdir -p "$BACKUP_COPY_DIR"
  cp "$DUMP" "$BACKUP_COPY_DIR/"
  for item in "${SNAPS_FEITOS[@]}"; do espelhar "${item#*:}" "$BACKUP_COPY_DIR/${item%%:*}-atual"; done
  find "$BACKUP_COPY_DIR" -maxdepth 1 -type f -name 'itaprev-*.dump' -mtime +"$RETENTION" -delete
  echo "    cópia em: $BACKUP_COPY_DIR"
fi

echo "==> Backup concluído"

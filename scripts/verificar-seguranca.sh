#!/usr/bin/env bash
# ============================================================
#  Itanhaém Prev — verificação rápida de segurança (OWASP Top 10)
#  Uso:  bash scripts/verificar-seguranca.sh https://www.itanhaemprev.sp.gov.br
#        bash scripts/verificar-seguranca.sh http://127.0.0.1:3000
#  Não altera nada no site: só faz requisições de leitura.
#  Resultado: lista de OK/FALHA e código de saída ≠ 0 se algo falhar.
# ============================================================
set -uo pipefail
BASE="${1:-http://127.0.0.1:3000}"
BASE="${BASE%/}"
OK=0; FAIL=0
ok()   { echo "  OK     $1"; OK=$((OK + 1)); }
fail() { echo "  FALHA  $1"; FAIL=$((FAIL + 1)); }
check() { if eval "$2"; then ok "$1"; else fail "$1"; fi; }

HEAD="$(curl -sS -D - -o /dev/null "$BASE/" | tr -d '\r')"
code() { curl -sS -o /dev/null -w '%{http_code}' --path-as-is "$@"; }
has_header() { echo "$HEAD" | grep -qi "^$1:"; }

echo "Verificando $BASE"
echo "[A05] Configuração e cabeçalhos de segurança"
check "Content-Security-Policy presente"                     'has_header content-security-policy'
check "CSP impede o site de ser embutido por terceiros"      'echo "$HEAD" | grep -i "^content-security-policy:" | grep -q "frame-ancestors '"'"'self'"'"'"'
check "X-Frame-Options (anti-clickjacking)"                  'has_header x-frame-options'
check "X-Content-Type-Options: nosniff"                      'echo "$HEAD" | grep -qi "^x-content-type-options: nosniff"'
check "Referrer-Policy presente"                             'has_header referrer-policy'
check "Permissions-Policy presente"                          'has_header permissions-policy'
check "Não revela a tecnologia (sem X-Powered-By)"           '! has_header x-powered-by'
if [[ "$BASE" == https://* ]]; then
  check "HSTS (força HTTPS no navegador)"                    'has_header strict-transport-security'
  HTTP_URL="http://${BASE#https://}"
  check "HTTP redireciona para HTTPS"                        '[[ "$(code "$HTTP_URL/")" =~ ^30[178]$ ]]'
fi
check "robots.txt bloqueia /admin para buscadores"          'curl -sS "$BASE/robots.txt" | grep -qiE "disallow: /(admin)?$"'

echo "[A01] Controle de acesso"
check "/admin sem login redireciona para o login"            '[[ "$(code "$BASE/admin")" =~ ^30[1-8]$ ]]'
check "/admin/usuarios sem login é bloqueado"                '[[ "$(code "$BASE/admin/usuarios")" =~ ^30[1-8]$ ]]'
check "/admin/auditoria sem login é bloqueado"               '[[ "$(code "$BASE/admin/auditoria")" =~ ^30[1-8]$ ]]'
check "Área do Beneficiário sem login redireciona para entrar" '[[ "$(code "$BASE/beneficiario")" =~ ^30[1-8]$ ]]'
check "Documento de beneficiário sem login não é entregue"   '[ "$(code "$BASE/beneficiario/arquivo/1")" != "200" ] && [ "$(code "$BASE/admin/beneficiarios/arquivo/1")" != "200" ]'
check "Pasta privada não é servida em /uploads"               '[ "$(code "$BASE/uploads/../privado/x.bin")" != "200" ]'
check "Uploads: ../ não sai da pasta (path traversal)"       '[ "$(code "$BASE/uploads/../.env")" != "200" ] && [ "$(code "$BASE/uploads/..%2f..%2f.env")" != "200" ]'
check "Uploads: tipo não permitido não é servido (.html)"    '[ "$(code "$BASE/uploads/teste.html")" != "200" ]'

echo "[A03] Injeção"
SQLI="$(code -G "$BASE/busca" --data-urlencode "q=' OR 1=1; DROP TABLE users; --")"
check "Busca com SQL injection não gera erro (HTTP $SQLI)"   '[ "$SQLI" = "200" ]'
XSS="$(curl -sS -G "$BASE/busca" --data-urlencode 'q=<script>alert(1)</script>')"
check "Busca não devolve <script> injetado (XSS refletido)"  '! echo "$XSS" | grep -q "<script>alert(1)</script>"'

echo "[A04/A10] API do assistente virtual"
check "/api/chat recusa GET"                                 '[ "$(code "$BASE/api/chat")" = "405" ]'
check "/api/chat recusa mensagem vazia"                      '[ "$(code -X POST -H "Content-Type: application/json" -d "{}" "$BASE/api/chat")" = "400" ]'

echo
echo "Resultado: $OK OK · $FAIL FALHA"
[ "$FAIL" -eq 0 ]

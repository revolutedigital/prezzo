#!/bin/bash
# ST-001: Sistema Está Acessível
# Valida que o site está respondendo e carregando corretamente

set -e

# Configuração
PROD_URL="${PROD_URL:-http://localhost:3000}"
TIMEOUT=30

echo "🔥 ST-001: Verificando acessibilidade do sistema..."
echo "URL: $PROD_URL"

# Fazer requisição HTTP
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time $TIMEOUT "$PROD_URL" || echo "000")

# Validar resposta (200=OK, 302=Found, 307=Temporary Redirect)
if [ "$HTTP_CODE" -eq 200 ] || [ "$HTTP_CODE" -eq 302 ] || [ "$HTTP_CODE" -eq 307 ]; then
  echo "✅ ST-001 PASSED: Site is accessible (HTTP $HTTP_CODE)"
  exit 0
else
  echo "❌ ST-001 FAILED: Site returned HTTP $HTTP_CODE"
  exit 1
fi

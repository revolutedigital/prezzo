#!/bin/bash
# ST-005: API Endpoints Respondem
# Valida que todos os endpoints principais estão respondendo

set -e

PROD_URL="${PROD_URL:-http://localhost:3000}"
TIMEOUT=30

echo "🔥 ST-005: Verificando API endpoints..."

# Lista de endpoints para testar
ENDPOINTS=(
  "/api/materias-primas"
  "/api/tipos-produto"
  "/api/mao-de-obra"
  "/api/health"
)

FAILED=0
PASSED=0

for endpoint in "${ENDPOINTS[@]}"; do
  echo -n "Testing $endpoint ... "

  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time $TIMEOUT "$PROD_URL$endpoint" || echo "000")

  # Aceitar 200 (OK) ou 401 (Unauthorized - significa que API está viva mas requer auth)
  if [ "$HTTP_CODE" -eq 200 ] || [ "$HTTP_CODE" -eq 401 ]; then
    echo "✅ HTTP $HTTP_CODE"
    ((PASSED++))
  else
    echo "❌ HTTP $HTTP_CODE"
    ((FAILED++))
  fi
done

echo ""
echo "📊 Results: $PASSED passed, $FAILED failed"

if [ $FAILED -eq 0 ]; then
  echo "✅ ST-005 PASSED: All API endpoints responding"
  exit 0
else
  echo "❌ ST-005 FAILED: Some endpoints are not responding"
  exit 1
fi

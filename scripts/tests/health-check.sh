#!/bin/bash
# Health Check Script
# Valida o endpoint /api/health para verificar status do sistema

set -e

PROD_URL="${PROD_URL:-http://localhost:3000}"
HEALTH_ENDPOINT="$PROD_URL/api/health"

echo "🏥 Health Check - Prezzo System"
echo "================================"
echo "Endpoint: $HEALTH_ENDPOINT"
echo ""

# Fazer requisição ao health check
RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}\nTIME_TOTAL:%{time_total}" "$HEALTH_ENDPOINT")

# Extrair HTTP code
HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE:" | cut -d: -f2)

# Extrair tempo total
TIME_TOTAL=$(echo "$RESPONSE" | grep "TIME_TOTAL:" | cut -d: -f2)

# Extrair JSON (remover linhas de status)
JSON_RESPONSE=$(echo "$RESPONSE" | sed '/HTTP_CODE:/d' | sed '/TIME_TOTAL:/d')

echo "📊 Response:"
echo "$JSON_RESPONSE" | jq . 2>/dev/null || echo "$JSON_RESPONSE"
echo ""

echo "⏱️  Response Time: ${TIME_TOTAL}s"
echo "🌐 HTTP Status: $HTTP_CODE"
echo ""

# Validar resposta
if [ "$HTTP_CODE" -eq 200 ]; then
  STATUS=$(echo "$JSON_RESPONSE" | jq -r '.status' 2>/dev/null || echo "unknown")

  if [ "$STATUS" = "healthy" ]; then
    echo "✅ HEALTH CHECK PASSED"
    echo "   - API: Responding"
    echo "   - Database: Connected"
    echo "   - Status: Healthy"
    exit 0
  else
    echo "⚠️  HEALTH CHECK WARNING"
    echo "   - HTTP 200 but status is: $STATUS"
    exit 1
  fi
else
  echo "❌ HEALTH CHECK FAILED"
  echo "   - HTTP Code: $HTTP_CODE"
  echo "   - System appears to be unhealthy"
  exit 1
fi

#!/bin/bash
# Script para executar migrations no Railway manualmente
# Use este script se o deploy funcionou mas o banco precisa de migrations

set -e

echo "🔄 Executando migrations no Railway..."
echo ""

# Executar migrations via Railway CLI
railway run --service prezzo npx prisma migrate deploy

echo ""
echo "✅ Migrations executadas com sucesso!"
echo ""
echo "Próximos passos:"
echo "1. Verifique os logs: railway logs --service prezzo"
echo "2. Teste o health check: curl https://prezzo.revolux.digital/api/health"

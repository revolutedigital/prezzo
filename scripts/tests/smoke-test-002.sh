#!/bin/bash
# ST-002: Database Connectivity
# Valida que o banco de dados está acessível e respondendo

set -e

echo "🔥 ST-002: Verificando conectividade com banco de dados..."

# Verificar se DATABASE_URL está configurada
if [ -z "$DATABASE_URL" ]; then
  echo "⚠️  DATABASE_URL não configurada, usando padrão local..."
  DATABASE_URL="postgresql://prezzo:prezzo123@localhost:8000/prezzo?schema=public"
fi

echo "Database: $DATABASE_URL" | sed 's/:[^:]*@/:***@/'

# Testar conexão com query simples
RESULT=$(psql "$DATABASE_URL" -t -c "SELECT 1;" 2>&1 || echo "ERROR")

if [[ "$RESULT" =~ "1" ]]; then
  echo "✅ ST-002 PASSED: Database is accessible and responding"

  # Mostrar contagem de tabelas principais
  echo ""
  echo "📊 Database Status:"
  psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM \"TipoMateriaPrima\";" 2>/dev/null | xargs echo "  - Matérias-Primas:"
  psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM \"TipoProduto\";" 2>/dev/null | xargs echo "  - Tipos de Produto:"
  psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM \"TipoMaoDeObra\";" 2>/dev/null | xargs echo "  - Tipos de Mão de Obra:"

  exit 0
else
  echo "❌ ST-002 FAILED: Cannot connect to database"
  echo "Error: $RESULT"
  exit 1
fi

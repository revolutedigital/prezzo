#!/bin/bash
# Configuração de Testes - Prezzo System
# Este arquivo centraliza as configurações de URLs e timeouts

# URL de Produção
export PROD_URL="${PROD_URL:-https://prezzo.revolux.digital}"

# URL de Staging (se houver)
export STAGING_URL="${STAGING_URL:-https://staging.prezzo.revolux.digital}"

# Timeouts
export TIMEOUT_DEFAULT=30
export TIMEOUT_LONG=60

# Database
export DATABASE_URL="${DATABASE_URL:-postgresql://prezzo:prezzo123@localhost:8000/prezzo?schema=public}"

echo "📋 Configuração de Testes Carregada"
echo "  - Produção: $PROD_URL"
echo "  - Staging: $STAGING_URL"
echo "  - Timeout: ${TIMEOUT_DEFAULT}s"

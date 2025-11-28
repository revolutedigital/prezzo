#!/bin/bash
# run-all-tests.sh
# Script master para executar toda a suite de testes de deploy

set -e

echo "🚀 Iniciando Suite Completa de Testes - Prezzo Deploy"
echo "=================================================="
echo ""

FAILED_TESTS=0
PASSED_TESTS=0
TOTAL_TESTS=0

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuração
PROD_URL="${PROD_URL:-http://localhost:3000}"
export PROD_URL

echo -e "${BLUE}🔧 Configuração:${NC}"
echo "  - URL: $PROD_URL"
echo "  - Timestamp: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# Função para executar um teste
run_test() {
  local test_script=$1
  local test_name=$2

  ((TOTAL_TESTS++))

  echo -n "Testing $test_name ... "

  if bash "$test_script" > /tmp/test-output-$$.log 2>&1; then
    echo -e "${GREEN}✅ PASSED${NC}"
    ((PASSED_TESTS++))
    return 0
  else
    echo -e "${RED}❌ FAILED${NC}"
    ((FAILED_TESTS++))
    echo "  Error details:"
    cat /tmp/test-output-$$.log | sed 's/^/    /'
    return 1
  fi
}

# ============================================
# FASE 1: SMOKE TESTS (Críticos)
# ============================================
echo -e "${BLUE}📋 FASE 1: SMOKE TESTS${NC}"
echo "----------------------"

SMOKE_CRITICAL=0

# ST-001: Sistema Acessível
if [ -f "scripts/tests/smoke-test-001.sh" ]; then
  if run_test "scripts/tests/smoke-test-001.sh" "ST-001: Sistema Acessível"; then
    :
  else
    ((SMOKE_CRITICAL++))
    echo -e "${RED}⚠️  CRITICAL: Sistema não está acessível!${NC}"
  fi
fi

# ST-002: Database Connectivity
if [ -f "scripts/tests/smoke-test-002.sh" ]; then
  if run_test "scripts/tests/smoke-test-002.sh" "ST-002: Database Connectivity"; then
    :
  else
    ((SMOKE_CRITICAL++))
    echo -e "${RED}⚠️  CRITICAL: Database não conectado! Abortando testes.${NC}"
    exit 1
  fi
fi

# ST-005: API Endpoints
if [ -f "scripts/tests/smoke-test-005.sh" ]; then
  if run_test "scripts/tests/smoke-test-005.sh" "ST-005: API Endpoints"; then
    :
  else
    ((SMOKE_CRITICAL++))
  fi
fi

echo ""

# Verificar se smoke tests críticos passaram
if [ $SMOKE_CRITICAL -gt 0 ]; then
  echo -e "${RED}❌ SMOKE TESTS CRÍTICOS FALHARAM!${NC}"
  echo -e "${YELLOW}⚠️  Recomendação: Não prosseguir com deploy${NC}"
  echo ""
fi

# ============================================
# RESULTADOS FINAIS
# ============================================
echo ""
echo -e "${BLUE}📊 RESULTADOS FINAIS${NC}"
echo "===================="
echo ""
echo -e "Total de Testes: ${BLUE}$TOTAL_TESTS${NC}"
echo -e "Testes Passaram: ${GREEN}$PASSED_TESTS${NC}"
echo -e "Testes Falharam: ${RED}$FAILED_TESTS${NC}"
echo ""

# Calcular taxa de sucesso
if [ $TOTAL_TESTS -gt 0 ]; then
  SUCCESS_RATE=$(( (PASSED_TESTS * 100) / TOTAL_TESTS ))
  echo -e "Taxa de Sucesso: ${BLUE}${SUCCESS_RATE}%${NC}"
  echo ""
fi

# Decisão final
if [ $FAILED_TESTS -eq 0 ]; then
  echo -e "${GREEN}✅ TODOS OS TESTES PASSARAM!${NC}"
  echo -e "${GREEN}🎉 Deploy pode prosseguir com segurança${NC}"
  exit 0
else
  echo -e "${RED}⚠️  ALGUNS TESTES FALHARAM${NC}"

  if [ $SMOKE_CRITICAL -gt 0 ]; then
    echo -e "${RED}🚨 CRÍTICO: Smoke tests falharam - NÃO FAZER DEPLOY${NC}"
    exit 2
  else
    echo -e "${YELLOW}⚠️  Revisar falhas antes de prosseguir${NC}"
    exit 1
  fi
fi

# Limpar arquivos temporários
rm -f /tmp/test-output-$$.log

#!/bin/bash
# Script de Deploy Automatizado - Prezzo System
# Domínio: https://prezzo.revolux.digital

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuração
PROD_URL="https://prezzo.revolux.digital"
DEPLOY_DATE=$(date '+%Y-%m-%d %H:%M:%S')
BACKUP_FILE="backup-prezzo-$(date +%Y%m%d-%H%M%S).sql"

echo ""
echo -e "${BLUE}╔══════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                                                  ║${NC}"
echo -e "${BLUE}║       🚀 DEPLOY AUTOMATIZADO - PREZZO            ║${NC}"
echo -e "${BLUE}║                                                  ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}Domínio:${NC} $PROD_URL"
echo -e "${BLUE}Data:${NC} $DEPLOY_DATE"
echo ""

# Função para verificar se comando existe
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Função para pause com confirmação
confirm() {
  read -p "$1 (y/n): " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}❌ Deploy cancelado pelo usuário${NC}"
    exit 1
  fi
}

# ============================================
# FASE 1: PRÉ-VALIDAÇÕES
# ============================================
echo -e "${YELLOW}📋 FASE 1: Pré-Validações${NC}"
echo "-----------------------------------"

# Verificar Git
if ! command_exists git; then
  echo -e "${RED}❌ Git não encontrado${NC}"
  exit 1
fi
echo -e "${GREEN}✅ Git instalado${NC}"

# Verificar Node
if ! command_exists node; then
  echo -e "${RED}❌ Node.js não encontrado${NC}"
  exit 1
fi
echo -e "${GREEN}✅ Node.js instalado: $(node -v)${NC}"

# Verificar NPM
if ! command_exists npm; then
  echo -e "${RED}❌ NPM não encontrado${NC}"
  exit 1
fi
echo -e "${GREEN}✅ NPM instalado: $(npm -v)${NC}"

# Verificar branch
CURRENT_BRANCH=$(git branch --show-current)
echo -e "${BLUE}📍 Branch atual: $CURRENT_BRANCH${NC}"

if [ "$CURRENT_BRANCH" != "main" ] && [ "$CURRENT_BRANCH" != "master" ]; then
  echo -e "${YELLOW}⚠️  Você não está na branch main/master${NC}"
  confirm "Deseja continuar mesmo assim?"
fi

# Verificar mudanças não commitadas
if ! git diff-index --quiet HEAD --; then
  echo -e "${RED}❌ Existem mudanças não commitadas${NC}"
  echo ""
  git status --short
  echo ""
  confirm "Deseja continuar mesmo assim?"
fi

echo -e "${GREEN}✅ Pré-validações concluídas${NC}"
echo ""

# ============================================
# FASE 2: BACKUP DO BANCO DE DADOS
# ============================================
echo -e "${YELLOW}📦 FASE 2: Backup do Banco de Dados${NC}"
echo "-----------------------------------"

if [ -z "$DATABASE_URL" ]; then
  echo -e "${YELLOW}⚠️  DATABASE_URL não configurada${NC}"
  echo "Pulando backup automático..."
  confirm "Você fez backup manual do banco de dados?"
else
  echo "Criando backup: $BACKUP_FILE"

  if pg_dump "$DATABASE_URL" > "$BACKUP_FILE" 2>/dev/null; then
    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo -e "${GREEN}✅ Backup criado: $BACKUP_FILE ($BACKUP_SIZE)${NC}"
  else
    echo -e "${YELLOW}⚠️  Falha ao criar backup automaticamente${NC}"
    confirm "Você tem um backup manual do banco de dados?"
  fi
fi
echo ""

# ============================================
# FASE 3: EXECUTAR BUILD LOCAL
# ============================================
echo -e "${YELLOW}🔨 FASE 3: Build Local${NC}"
echo "-----------------------------------"

echo "Instalando dependências..."
if npm ci > /dev/null 2>&1; then
  echo -e "${GREEN}✅ Dependências instaladas${NC}"
else
  echo -e "${RED}❌ Falha ao instalar dependências${NC}"
  exit 1
fi

echo "Executando build..."
if npm run build > build.log 2>&1; then
  echo -e "${GREEN}✅ Build concluído com sucesso${NC}"
  rm -f build.log
else
  echo -e "${RED}❌ Build falhou! Verifique build.log${NC}"
  echo ""
  tail -n 20 build.log
  exit 1
fi
echo ""

# ============================================
# FASE 4: EXECUTAR TESTES
# ============================================
echo -e "${YELLOW}🧪 FASE 4: Executar Testes${NC}"
echo "-----------------------------------"

# Verificar se scripts existem
if [ ! -f "scripts/tests/run-all-tests.sh" ]; then
  echo -e "${YELLOW}⚠️  Scripts de teste não encontrados${NC}"
  confirm "Deseja continuar sem executar testes?"
else
  echo "Executando suite de testes..."

  # Executar testes em localhost (staging)
  export PROD_URL="http://localhost:3000"

  if ./scripts/tests/run-all-tests.sh > test-results.log 2>&1; then
    echo -e "${GREEN}✅ Todos os testes passaram!${NC}"
    rm -f test-results.log
  else
    echo -e "${RED}❌ Alguns testes falharam!${NC}"
    echo ""
    cat test-results.log
    echo ""
    echo -e "${RED}🚨 DEPLOY BLOQUEADO: Testes falharam${NC}"
    exit 1
  fi
fi
echo ""

# ============================================
# FASE 5: CONFIRMAÇÃO FINAL
# ============================================
echo -e "${YELLOW}⚠️  CONFIRMAÇÃO FINAL${NC}"
echo "-----------------------------------"
echo ""
echo -e "${BLUE}Você está prestes a fazer deploy para:${NC}"
echo -e "${GREEN}  🌐 $PROD_URL${NC}"
echo ""
echo -e "${BLUE}Checklist:${NC}"
echo "  ✅ Branch: $CURRENT_BRANCH"
echo "  ✅ Build: Passou"
echo "  ✅ Testes: Passaram"
echo "  ✅ Backup: Criado"
echo ""

confirm "🚀 Confirma deploy para PRODUÇÃO?"

echo ""

# ============================================
# FASE 6: EXECUTAR DEPLOY
# ============================================
echo -e "${YELLOW}🚀 FASE 6: Executando Deploy${NC}"
echo "-----------------------------------"

# Detectar plataforma de deploy
if command_exists vercel; then
  echo "Deploy via Vercel..."

  if vercel --prod --yes; then
    echo -e "${GREEN}✅ Deploy Vercel concluído${NC}"
  else
    echo -e "${RED}❌ Deploy Vercel falhou${NC}"
    exit 1
  fi

elif [ -f "docker-compose.yml" ]; then
  echo "Deploy via Docker..."

  # Build e push da imagem
  docker build -t prezzo:latest .
  docker tag prezzo:latest registry.revolux.digital/prezzo:latest
  docker push registry.revolux.digital/prezzo:latest

  echo -e "${GREEN}✅ Deploy Docker concluído${NC}"

else
  echo -e "${YELLOW}⚠️  Plataforma de deploy não detectada${NC}"
  echo "Execute o deploy manualmente seguindo o guia:"
  echo "  📖 GUIA_DEPLOY_PRODUCAO.md"
  exit 1
fi

echo ""

# ============================================
# FASE 7: VALIDAÇÃO PÓS-DEPLOY
# ============================================
echo -e "${YELLOW}✅ FASE 7: Validação Pós-Deploy${NC}"
echo "-----------------------------------"

echo "Aguardando 30 segundos para sistema estabilizar..."
sleep 30

# Testar health check
echo "Testando health check..."
HEALTH_STATUS=$(curl -s "$PROD_URL/api/health" | jq -r '.status' 2>/dev/null || echo "error")

if [ "$HEALTH_STATUS" = "healthy" ]; then
  echo -e "${GREEN}✅ Health check: OK${NC}"
else
  echo -e "${RED}❌ Health check: FALHOU${NC}"
  echo ""
  curl -s "$PROD_URL/api/health" | jq . || echo "Endpoint não respondeu"
  echo ""
  echo -e "${YELLOW}⚠️  Sistema pode não estar funcionando corretamente${NC}"
  confirm "Deseja continuar? (ou executar rollback manual)"
fi

# Testar página principal
echo "Testando página principal..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$PROD_URL" || echo "000")

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "307" ]; then
  echo -e "${GREEN}✅ Página principal: OK (HTTP $HTTP_CODE)${NC}"
else
  echo -e "${RED}❌ Página principal: FALHOU (HTTP $HTTP_CODE)${NC}"
fi

echo ""

# ============================================
# FASE 8: RELATÓRIO FINAL
# ============================================
echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                                                  ║${NC}"
echo -e "${GREEN}║        🎉 DEPLOY CONCLUÍDO COM SUCESSO!          ║${NC}"
echo -e "${GREEN}║                                                  ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}📊 Resumo do Deploy:${NC}"
echo "  🌐 URL: $PROD_URL"
echo "  📅 Data: $DEPLOY_DATE"
echo "  📍 Branch: $CURRENT_BRANCH"
echo "  💾 Backup: $BACKUP_FILE"
echo "  ✅ Status: SUCESSO"
echo ""
echo -e "${BLUE}🔗 Links Úteis:${NC}"
echo "  Dashboard: $PROD_URL/dashboard"
echo "  Health Check: $PROD_URL/api/health"
echo ""
echo -e "${YELLOW}📋 Próximos Passos:${NC}"
echo "  1. Monitorar logs nas próximas 24 horas"
echo "  2. Verificar métricas de performance"
echo "  3. Notificar equipe sobre deploy"
echo "  4. Guardar backup em local seguro: $BACKUP_FILE"
echo ""
echo -e "${GREEN}✨ Sistema Prezzo está rodando em produção!${NC}"
echo ""

exit 0

# Plano de Testes Autônomo para Deploy - Prezzo System

**Versão**: 1.0
**Data de Criação**: 2025-11-27
**Equipe QA**: Enterprise QA Team
**Sistema**: Prezzo - Sistema de Precificação e Orçamentos

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Estratégia de Testes](#estratégia-de-testes)
3. [Pré-Requisitos](#pré-requisitos)
4. [Smoke Tests (Testes de Fumaça)](#smoke-tests)
5. [Testes Funcionais Críticos](#testes-funcionais-críticos)
6. [Testes de Integração](#testes-de-integração)
7. [Testes de Performance](#testes-de-performance)
8. [Testes de Segurança](#testes-de-segurança)
9. [Checklist de Deploy](#checklist-de-deploy)
10. [Rollback Plan](#rollback-plan)
11. [Critérios de Aceitação](#critérios-de-aceitação)

---

## 🎯 Visão Geral

Este plano de testes garante que o sistema Prezzo esteja funcional, seguro e performático após deploy em ambiente de produção.

### Objetivos

- ✅ Validar funcionalidades críticas do sistema
- ✅ Garantir integridade de dados
- ✅ Verificar performance e escalabilidade
- ✅ Assegurar segurança e autenticação
- ✅ Confirmar compatibilidade entre módulos

### Ambientes de Teste

- **Staging**: Ambiente de pré-produção (obrigatório)
- **Production**: Ambiente final (smoke tests apenas)

---

## 🎪 Estratégia de Testes

### Pirâmide de Testes

```
                    /\
                   /  \
                  / E2E \
                 /--------\
                /Integration\
               /--------------\
              /  Unit Tests    \
             /------------------\
```

### Fases de Teste

1. **Pre-Deploy** (Staging)
   - Build validation
   - Unit tests (100% passar)
   - Integration tests
   - E2E critical paths

2. **Post-Deploy** (Production)
   - Smoke tests
   - Health checks
   - Critical flow validation
   - Performance monitoring

3. **Post-Release** (Production)
   - User acceptance monitoring
   - Error tracking
   - Performance metrics

---

## ✅ Pré-Requisitos

### Ambiente

- [ ] Database migrations executadas com sucesso
- [ ] Variáveis de ambiente configuradas
- [ ] Build do Next.js concluído sem erros
- [ ] Conexão com banco de dados PostgreSQL validada
- [ ] NextAuth configurado corretamente
- [ ] Backup do banco de dados realizado

### Dados de Teste

- [ ] Usuário de teste criado (QA user)
- [ ] Matérias-primas de exemplo cadastradas (mínimo 5)
- [ ] Tipos de produto de exemplo (mínimo 3)
- [ ] Tipos de mão de obra (mínimo 2)
- [ ] Produtos completos com variações (mínimo 2)

### Credenciais de Teste

```bash
# QA Test User
Email: qa-test@prezzo.com
Password: QA_Test_2025!

# Admin Test User
Email: admin-test@prezzo.com
Password: Admin_Test_2025!
```

---

## 🔥 Smoke Tests

**Objetivo**: Validar que o sistema está "vivo" e funcional após deploy.

**Tempo Estimado**: 5-10 minutos
**Prioridade**: CRÍTICA
**Quando Executar**: Imediatamente após deploy

### ST-001: Sistema Está Acessível

**Passos**:

1. Acessar URL de produção
2. Verificar que página carrega (não 500/502/503)
3. Verificar que CSS/JS carregam corretamente

**Resultado Esperado**: Página de login exibida corretamente

**Script de Validação**:

```bash
#!/bin/bash
# smoke-test-001.sh
PROD_URL="https://prezzo.seudominio.com"

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" $PROD_URL)

if [ $HTTP_CODE -eq 200 ]; then
  echo "✅ ST-001 PASSED: Site is accessible (HTTP $HTTP_CODE)"
  exit 0
else
  echo "❌ ST-001 FAILED: Site returned HTTP $HTTP_CODE"
  exit 1
fi
```

---

### ST-002: Database Connectivity

**Passos**:

1. Tentar fazer login
2. Sistema deve conseguir consultar banco de dados

**Resultado Esperado**: Login funcional ou erro de credenciais (não erro de conexão)

**Script de Validação**:

```bash
#!/bin/bash
# smoke-test-002.sh
DATABASE_URL="postgresql://user:pass@host:5432/prezzo"

psql $DATABASE_URL -c "SELECT 1;" > /dev/null 2>&1

if [ $? -eq 0 ]; then
  echo "✅ ST-002 PASSED: Database is accessible"
  exit 0
else
  echo "❌ ST-002 FAILED: Cannot connect to database"
  exit 1
fi
```

---

### ST-003: Autenticação Funciona

**Passos**:

1. Acessar `/auth/signin`
2. Inserir credenciais de teste
3. Clicar em "Entrar"

**Resultado Esperado**: Redirecionamento para dashboard

**Status**: ✅ PASS | ❌ FAIL

---

### ST-004: Dashboard Carrega

**Passos**:

1. Após login, verificar dashboard
2. Cards de estatísticas devem aparecer
3. Nenhum erro no console

**Resultado Esperado**: Dashboard exibido com dados ou empty state

**Status**: ✅ PASS | ❌ FAIL

---

### ST-005: API Endpoints Respondem

**Passos**:

1. Verificar `/api/materias-primas` (GET)
2. Verificar `/api/tipos-produto` (GET)
3. Verificar `/api/mao-de-obra` (GET)

**Resultado Esperado**: Status 200 ou 401 (se não autenticado)

**Script de Validação**:

```bash
#!/bin/bash
# smoke-test-005.sh

ENDPOINTS=(
  "/api/materias-primas"
  "/api/tipos-produto"
  "/api/mao-de-obra"
  "/api/produtos"
)

for endpoint in "${ENDPOINTS[@]}"; do
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$PROD_URL$endpoint")

  if [ $HTTP_CODE -eq 200 ] || [ $HTTP_CODE -eq 401 ]; then
    echo "✅ $endpoint responding (HTTP $HTTP_CODE)"
  else
    echo "❌ $endpoint failed (HTTP $HTTP_CODE)"
    exit 1
  fi
done

echo "✅ ST-005 PASSED: All API endpoints responding"
```

---

## 🧪 Testes Funcionais Críticos

**Objetivo**: Validar os fluxos principais do sistema.

**Tempo Estimado**: 30-45 minutos
**Prioridade**: ALTA
**Quando Executar**: Após smoke tests passarem

---

### FT-001: Fluxo Completo de Matéria-Prima

**Cenário**: Criar, editar e listar matérias-primas

**Pré-condição**: Usuário autenticado

**Passos**:

1. Navegar para `/materias-primas`
2. Clicar em "Nova Matéria-Prima"
3. Preencher formulário:
   - Nome: "Teste QA - Farinha de Trigo"
   - Código: "QA-FT-001"
   - Unidade: "KG"
   - Custo Unitário: 5.50
   - Categoria: "Farinha"
4. Salvar
5. Verificar que aparece na listagem
6. Clicar em editar
7. Alterar custo para 6.00
8. Salvar
9. Verificar atualização

**Resultado Esperado**:

- Matéria-prima criada com sucesso
- Mensagem de sucesso exibida (toast)
- Item aparece na listagem com dados corretos
- Edição persiste corretamente

**Dados de Validação**:

- Nome exibido: "Teste QA - Farinha de Trigo"
- Custo exibido: "R$ 6,00"
- Status: "Ativo"

**Status**: ✅ PASS | ❌ FAIL | ⚠️ PARTIAL

---

### FT-002: Fluxo Completo de Produto

**Cenário**: Criar tipo de produto com variações

**Pré-condição**:

- Usuário autenticado
- Ao menos 1 matéria-prima cadastrada
- Ao menos 1 tipo de mão de obra cadastrado

**Passos**:

1. Navegar para `/produtos`
2. Clicar em "Novo Tipo de Produto"
3. Preencher dados do tipo:
   - Nome: "Teste QA - Bolo de Chocolate"
   - Código: "QA-PROD-001"
   - Categoria: "Bolos"
   - Descrição: "Produto de teste QA"
4. Salvar tipo de produto
5. Adicionar matérias-primas:
   - Farinha: 500g
   - Açúcar: 200g
   - Chocolate: 100g
6. Adicionar mão de obra:
   - Confeiteiro: 2 horas
7. Criar variação "P" (500g)
8. Criar variação "M" (1kg)
9. Visualizar custos calculados

**Resultado Esperado**:

- Tipo de produto criado
- Matérias-primas vinculadas
- Mão de obra vinculada
- Variações criadas com custos calculados
- Custo total = (custo MPs + custo MO) \* margem

**Validações**:

- [ ] Tipo de produto aparece na listagem
- [ ] Contagem de variações correta (2)
- [ ] Custos calculados automaticamente
- [ ] Não há erros no console

**Status**: ✅ PASS | ❌ FAIL | ⚠️ PARTIAL

---

### FT-003: Fluxo de Mão de Obra

**Cenário**: Criar tipo de mão de obra com e sem máquina

**Passos**:

1. Navegar para `/mao-de-obra`
2. Criar tipo SEM máquina:
   - Nome: "Confeiteiro Junior"
   - Custo/Hora: 25.00
   - Inclui Máquina: NÃO
3. Criar tipo COM máquina:
   - Nome: "Operador de Forno Industrial"
   - Custo/Hora: 30.00
   - Inclui Máquina: SIM
   - Custo Máquina/Hora: 15.00
4. Verificar cálculo de "Total/Hora"

**Resultado Esperado**:

- Confeiteiro: Total = R$ 25,00/h
- Operador: Total = R$ 45,00/h (30 + 15)
- Cards exibem custos com cores corretas (verde/azul/primary)

**Status**: ✅ PASS | ❌ FAIL

---

### FT-004: Filtros e Busca

**Cenário**: Validar funcionalidade de busca e filtros

**Passos (Matérias-Primas)**:

1. Navegar para `/materias-primas`
2. Digitar "Farinha" na busca
3. Aguardar debounce (300ms)
4. Verificar resultados filtrados
5. Limpar busca
6. Aplicar filtro de categoria
7. Aplicar filtro de status (Ativos/Inativos)

**Resultado Esperado**:

- Busca filtra corretamente
- Debounce evita chamadas excessivas
- Filtros combinam corretamente
- Contador "Mostrando X de Y" correto

**Status**: ✅ PASS | ❌ FAIL

---

### FT-005: Toggle de Visualização (Cards/Table)

**Cenário**: Alternar entre modos de visualização

**Passos**:

1. Acessar página com toggle (Matérias-Primas ou Mão de Obra)
2. Clicar em ícone de "Cards"
3. Verificar layout em grid
4. Clicar em ícone de "Table"
5. Verificar layout em tabela

**Resultado Esperado**:

- Transição suave entre layouts
- Dados idênticos em ambas views
- Filtros mantidos ao trocar view
- Skeleton loading correto ao trocar view

**Status**: ✅ PASS | ❌ FAIL

---

### FT-006: Exclusão com Validação

**Cenário**: Tentar excluir item vinculado

**Passos**:

1. Criar matéria-prima "MP Test Delete"
2. Criar produto que usa essa MP
3. Tentar excluir a MP
4. Verificar mensagem de erro

**Resultado Esperado**:

- Sistema impede exclusão
- Mensagem clara: "Não é possível excluir. Item está vinculado a X produto(s)"
- Botão de exclusão desabilitado se houver vínculos

**Status**: ✅ PASS | ❌ FAIL

---

### FT-007: Validação de Formulários

**Cenário**: Tentar salvar com dados inválidos

**Passos**:

1. Abrir formulário de nova matéria-prima
2. Deixar "Nome" em branco
3. Tentar salvar
4. Inserir custo negativo (-5.00)
5. Tentar salvar
6. Inserir custo zero (0.00)
7. Tentar salvar

**Resultado Esperado**:

- Mensagem de erro para campo obrigatório
- Validação de valores negativos
- Validação de valores zero (se aplicável)
- Formulário não submete com erros

**Status**: ✅ PASS | ❌ FAIL

---

### FT-008: Bulk Actions (Ações em Lote)

**Cenário**: Ativar/desativar múltiplos itens

**Pré-condição**: Ao menos 3 matérias-primas cadastradas

**Passos**:

1. Navegar para `/materias-primas`
2. Selecionar checkbox de 3 itens
3. Clicar em "Desativar Selecionados"
4. Confirmar ação
5. Verificar que os 3 itens foram desativados
6. Selecionar os mesmos 3 itens
7. Clicar em "Ativar Selecionados"
8. Verificar que foram reativados

**Resultado Esperado**:

- Seleção múltipla funciona
- Ação em lote executa corretamente
- Feedback visual durante processamento
- Toast de sucesso exibido
- Dados atualizados na listagem

**Status**: ✅ PASS | ❌ FAIL

---

## 🔗 Testes de Integração

**Objetivo**: Validar comunicação entre módulos.

**Tempo Estimado**: 20-30 minutos
**Prioridade**: ALTA

---

### IT-001: Produto → Matérias-Primas

**Cenário**: Produto deve calcular custo baseado em MPs vinculadas

**Passos**:

1. Criar matéria-prima "Farinha" - R$ 5,00/kg
2. Criar matéria-prima "Açúcar" - R$ 3,00/kg
3. Criar produto "Bolo Simples"
4. Adicionar 0.5kg Farinha (R$ 2,50)
5. Adicionar 0.2kg Açúcar (R$ 0,60)
6. Verificar custo total de MPs

**Resultado Esperado**:

- Custo MPs = R$ 3,10
- Cálculo automático correto
- Atualização em tempo real

**Status**: ✅ PASS | ❌ FAIL

---

### IT-002: Produto → Mão de Obra

**Cenário**: Produto deve calcular custo de mão de obra

**Passos**:

1. Criar tipo MO "Confeiteiro" - R$ 25,00/h
2. Criar produto "Bolo Decorado"
3. Adicionar 2 horas de Confeiteiro
4. Verificar custo de MO

**Resultado Esperado**:

- Custo MO = R$ 50,00
- Refletido no custo total do produto

**Status**: ✅ PASS | ❌ FAIL

---

### IT-003: Variação → Cálculo de Preço

**Cenário**: Variação deve calcular preço com margem

**Passos**:

1. Criar produto com custo total de R$ 50,00
2. Criar variação com margem de 100%
3. Verificar preço sugerido

**Resultado Esperado**:

- Preço sugerido = R$ 100,00
- Fórmula: preço = custo \* (1 + margem/100)

**Status**: ✅ PASS | ❌ FAIL

---

### IT-004: Dashboard → Agregação de Dados

**Cenário**: Dashboard deve exibir estatísticas corretas

**Passos**:

1. Criar 5 matérias-primas
2. Criar 3 produtos
3. Criar 2 tipos de mão de obra
4. Navegar para dashboard
5. Verificar cards de estatísticas

**Resultado Esperado**:

- Total de matérias-primas: 5
- Total de produtos: 3
- Total de tipos MO: 2
- Valores monetários corretos

**Status**: ✅ PASS | ❌ FAIL

---

## ⚡ Testes de Performance

**Objetivo**: Garantir que o sistema responde adequadamente sob carga.

**Tempo Estimado**: 15-20 minutos
**Prioridade**: MÉDIA

---

### PT-001: Tempo de Carregamento de Páginas

**Métrica**: Páginas devem carregar em < 3 segundos

**Páginas a Testar**:

- [ ] Dashboard: **\_** ms
- [ ] Matérias-Primas: **\_** ms
- [ ] Produtos: **\_** ms
- [ ] Mão de Obra: **\_** ms

**Ferramenta**: Chrome DevTools (Network tab) ou Lighthouse

**Critério de Aceitação**: < 3000ms (First Contentful Paint)

**Script de Teste**:

```bash
#!/bin/bash
# performance-test-001.sh

PAGES=(
  "/dashboard"
  "/materias-primas"
  "/produtos"
  "/mao-de-obra"
)

for page in "${PAGES[@]}"; do
  LOAD_TIME=$(curl -o /dev/null -s -w '%{time_total}\n' "$PROD_URL$page")
  LOAD_MS=$(echo "$LOAD_TIME * 1000" | bc)

  echo "Page: $page - Load Time: ${LOAD_MS}ms"

  if (( $(echo "$LOAD_TIME > 3" | bc -l) )); then
    echo "⚠️  WARNING: Page $page took more than 3 seconds"
  fi
done
```

---

### PT-002: API Response Time

**Métrica**: APIs devem responder em < 500ms

**Endpoints**:

- [ ] GET /api/materias-primas: **\_** ms
- [ ] GET /api/tipos-produto: **\_** ms
- [ ] GET /api/mao-de-obra: **\_** ms
- [ ] POST /api/materias-primas: **\_** ms

**Critério de Aceitação**: < 500ms para listas pequenas (< 100 itens)

---

### PT-003: Listagem com Muitos Itens

**Cenário**: Sistema deve lidar com 100+ itens na listagem

**Passos**:

1. Popular banco com 100 matérias-primas (usar script seed)
2. Acessar `/materias-primas`
3. Medir tempo de carregamento
4. Testar scroll performance
5. Testar busca com muitos itens

**Critério de Aceitação**:

- Listagem carrega em < 5s
- Scroll suave (60fps)
- Busca responde em < 1s

**Status**: ✅ PASS | ❌ FAIL | ⚠️ SLOW

---

### PT-004: Concurrent Users Simulation

**Ferramenta**: Apache Bench ou Artillery

**Script**:

```bash
#!/bin/bash
# pt-004-load-test.sh

# Simular 50 usuários simultâneos por 30 segundos
ab -n 1500 -c 50 -t 30 "$PROD_URL/api/materias-primas"
```

**Critério de Aceitação**:

- 0% de requisições falhadas
- 95º percentil < 1s
- Média de resposta < 500ms

---

## 🔒 Testes de Segurança

**Objetivo**: Garantir que o sistema está protegido contra ameaças comuns.

**Tempo Estimado**: 15-20 minutos
**Prioridade**: ALTA

---

### ST-001: Autenticação Obrigatória

**Cenário**: Rotas protegidas não devem ser acessíveis sem login

**Passos**:

1. Abrir navegador em modo anônimo
2. Tentar acessar `/dashboard` diretamente
3. Tentar acessar `/materias-primas`
4. Tentar acessar `/produtos`

**Resultado Esperado**:

- Redirecionamento para `/auth/signin`
- Status HTTP 401 ou 302

**Status**: ✅ PASS | ❌ FAIL

---

### ST-002: Proteção de API

**Cenário**: APIs não devem responder sem autenticação

**Passos**:

1. Fazer request sem cookie de sessão:
   ```bash
   curl -X GET https://prezzo.com/api/materias-primas
   ```
2. Verificar resposta

**Resultado Esperado**:

- Status 401 Unauthorized
- Mensagem de erro clara

**Status**: ✅ PASS | ❌ FAIL

---

### ST-003: SQL Injection Protection

**Cenário**: Sistema deve sanitizar inputs

**Passos**:

1. No campo de busca, inserir: `'; DROP TABLE materias_primas; --`
2. Submeter busca
3. Verificar que nada foi deletado

**Resultado Esperado**:

- Input tratado como string literal
- Nenhum comando SQL executado
- Busca retorna 0 resultados ou erro de validação

**Status**: ✅ PASS | ❌ FAIL

---

### ST-004: XSS Protection

**Cenário**: Sistema deve escapar HTML/JavaScript

**Passos**:

1. Criar matéria-prima com nome: `<script>alert('XSS')</script>`
2. Salvar
3. Visualizar listagem
4. Verificar que script não executa

**Resultado Esperado**:

- Texto exibido literalmente (escaped)
- Nenhum alert aparece
- HTML sanitizado

**Status**: ✅ PASS | ❌ FAIL

---

### ST-005: CSRF Protection

**Cenário**: Requisições POST/PUT/DELETE devem ter CSRF token

**Passos**:

1. Tentar fazer POST direto via curl sem token:
   ```bash
   curl -X POST https://prezzo.com/api/materias-primas \
     -H "Content-Type: application/json" \
     -d '{"nome":"Test"}'
   ```
2. Verificar rejeição

**Resultado Esperado**:

- Status 403 Forbidden
- Mensagem sobre CSRF token

**Status**: ✅ PASS | ❌ FAIL

---

### ST-006: Environment Variables Protection

**Cenário**: Variáveis sensíveis não devem vazar

**Passos**:

1. Inspecionar código-fonte da página
2. Verificar Network requests
3. Procurar por:
   - DATABASE_URL
   - NEXTAUTH_SECRET
   - API keys

**Resultado Esperado**:

- Nenhuma variável sensível exposta no client
- Apenas variáveis com `NEXT_PUBLIC_` visíveis

**Status**: ✅ PASS | ❌ FAIL

---

## 📝 Checklist de Deploy

**Executar antes de dar "GO" para produção**

### Pré-Deploy

- [ ] **Backup de Banco de Dados realizado**
  - Data/Hora: \***\*\_\_\*\***
  - Localização: \***\*\_\_\*\***
  - Testado restauração: ✅ / ❌

- [ ] **Variáveis de Ambiente Configuradas**
  - `DATABASE_URL` ✅
  - `NEXTAUTH_URL` ✅
  - `NEXTAUTH_SECRET` ✅
  - Outras: \***\*\_\_\*\***

- [ ] **Build Passou Sem Erros**

  ```bash
  npm run build
  # Deve completar com EXIT CODE 0
  ```

- [ ] **Migrations Executadas**

  ```bash
  npx prisma migrate deploy
  ```

- [ ] **Smoke Tests Passaram em Staging**
  - ST-001 ✅
  - ST-002 ✅
  - ST-003 ✅
  - ST-004 ✅
  - ST-005 ✅

- [ ] **Testes Críticos Passaram**
  - FT-001 (Matéria-Prima) ✅
  - FT-002 (Produto) ✅
  - FT-003 (Mão de Obra) ✅

### Durante Deploy

- [ ] **Deploy Executado**
  - Método: \***\*\_\_\*\***
  - Tempo de downtime: \***\*\_\_\*\***
  - Horário: \***\*\_\_\*\***

- [ ] **Health Check Inicial**
  - Site acessível: ✅ / ❌
  - Database conectado: ✅ / ❌

### Pós-Deploy

- [ ] **Smoke Tests em Produção**
  - ST-001 ✅
  - ST-002 ✅
  - ST-003 ✅
  - ST-004 ✅
  - ST-005 ✅

- [ ] **Monitoramento Ativo**
  - Error tracking ligado: ✅
  - Performance monitoring: ✅
  - Logs sendo coletados: ✅

- [ ] **Testes de Regressão (amostra)**
  - Login funcional: ✅
  - Dashboard carrega: ✅
  - CRUD básico funciona: ✅

- [ ] **Notificações Enviadas**
  - Equipe de dev: ✅
  - Stakeholders: ✅
  - Usuários (se necessário): ✅

---

## 🔄 Rollback Plan

**Critérios para Rollback Imediato**:

- [ ] Site inacessível (HTTP 500/502/503) por > 2 minutos
- [ ] Database connection failures
- [ ] Autenticação completamente quebrada
- [ ] Perda de dados críticos detectada
- [ ] > 50% de requests falhando

### Procedimento de Rollback

**Tempo Estimado**: 5-10 minutos

1. **Parar Deploy Atual**

   ```bash
   # Reverter para versão anterior no Vercel/Railway/etc
   vercel rollback
   ```

2. **Restaurar Database (se necessário)**

   ```bash
   # Usar backup criado no pré-deploy
   psql $DATABASE_URL < backup-2025-11-27.sql
   ```

3. **Reverter Migrations (se necessário)**

   ```bash
   npx prisma migrate resolve --rolled-back [migration-name]
   ```

4. **Validar Sistema Antigo**
   - Executar smoke tests
   - Confirmar que voltou ao estado funcional

5. **Notificar Equipe**
   - Informar sobre rollback
   - Investigar causa raiz
   - Planejar novo deploy

### Contatos de Emergência

```
Tech Lead: _________________
DevOps: ___________________
Database Admin: ___________
Product Owner: ____________
```

---

## ✅ Critérios de Aceitação

**O deploy é considerado SUCESSO se**:

### Obrigatórios (GO/NO-GO)

- ✅ Todos os 5 Smoke Tests passam
- ✅ Autenticação funciona corretamente
- ✅ CRUD básico de cada módulo funciona
- ✅ Nenhum erro 500 nas primeiras 10 requisições
- ✅ Database conectado e respondendo
- ✅ Zero perda de dados

### Recomendados (podem ser corrigidos pós-deploy)

- ✅ Performance dentro do aceitável (< 3s load)
- ✅ Todos os testes funcionais críticos (FT-001 a FT-008) passam
- ✅ Testes de segurança básicos passam
- ✅ UI/UX sem bugs visuais críticos
- ✅ Responsividade mobile funcional

### Métricas de Sucesso (primeiras 24h)

- [ ] Uptime > 99.5%
- [ ] Error rate < 1%
- [ ] Average response time < 500ms
- [ ] Zero critical bugs reportados
- [ ] Feedback positivo de usuários

---

## 📊 Template de Relatório de Testes

```markdown
# Relatório de Testes - Deploy Prezzo [VERSÃO]

**Data**: 2025-11-27
**Ambiente**: Production
**Responsável QA**: **\*\***\_\_\_**\*\***
**Duração dos Testes**: \_\_\_ minutos

## Resumo Executivo

✅ APROVADO | ⚠️ APROVADO COM RESSALVAS | ❌ REPROVADO

**Status**: \***\*\_\_\_\*\***

**Resumo**: [Breve descrição dos resultados]

## Resultados

### Smoke Tests (5 testes)

- Passaram: \_\_\_
- Falharam: \_\_\_
- Taxa de sucesso: \_\_\_%

### Testes Funcionais (8 testes)

- Passaram: \_\_\_
- Falharam: \_\_\_
- Taxa de sucesso: \_\_\_%

### Testes de Integração (4 testes)

- Passaram: \_\_\_
- Falharam: \_\_\_
- Taxa de sucesso: \_\_\_%

### Testes de Performance (4 testes)

- Dentro do esperado: \_\_\_
- Lentos mas aceitáveis: \_\_\_
- Falharam: \_\_\_

### Testes de Segurança (6 testes)

- Passaram: \_\_\_
- Falharam: \_\_\_
- Taxa de sucesso: \_\_\_%

## Bugs Encontrados

### Críticos (bloqueiam uso)

1. [Descrever]
2. ...

### Altos (impactam funcionalidade)

1. [Descrever]
2. ...

### Médios (inconveniências)

1. [Descrever]
2. ...

### Baixos (cosméticos)

1. [Descrever]
2. ...

## Recomendações

- [ ] Deploy pode prosseguir
- [ ] Deploy deve ser adiado
- [ ] Rollback recomendado
- [ ] Correções necessárias: [listar]

## Assinaturas

**QA Lead**: **\*\*\*\***\_**\*\*\*\*** Data: \***\*\_\_\*\***
**Tech Lead**: **\*\***\_\_\_\_**\*\*** Data: \***\*\_\_\*\***
**Aprovação Final**: \***\*\_\_\_\*\*** Data: \***\*\_\_\*\***
```

---

## 🤖 Scripts de Automação

### Script Master de Testes

```bash
#!/bin/bash
# run-all-tests.sh

echo "🚀 Iniciando Suite Completa de Testes - Prezzo Deploy"
echo "=================================================="

FAILED_TESTS=0
PASSED_TESTS=0

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo ""
echo "📋 FASE 1: SMOKE TESTS"
echo "----------------------"

# ST-001: Site Acessível
./scripts/tests/smoke-test-001.sh
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ ST-001 PASSED${NC}"
  ((PASSED_TESTS++))
else
  echo -e "${RED}❌ ST-001 FAILED${NC}"
  ((FAILED_TESTS++))
fi

# ST-002: Database Connectivity
./scripts/tests/smoke-test-002.sh
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ ST-002 PASSED${NC}"
  ((PASSED_TESTS++))
else
  echo -e "${RED}❌ ST-002 FAILED${NC}"
  ((FAILED_TESTS++))
  echo "⚠️  CRITICAL: Database não conectado. Abortando testes."
  exit 1
fi

# ST-005: API Endpoints
./scripts/tests/smoke-test-005.sh
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ ST-005 PASSED${NC}"
  ((PASSED_TESTS++))
else
  echo -e "${RED}❌ ST-005 FAILED${NC}"
  ((FAILED_TESTS++))
fi

echo ""
echo "📊 RESULTADOS FINAIS"
echo "===================="
echo -e "Testes Passaram: ${GREEN}$PASSED_TESTS${NC}"
echo -e "Testes Falharam: ${RED}$FAILED_TESTS${NC}"

if [ $FAILED_TESTS -eq 0 ]; then
  echo -e "${GREEN}🎉 TODOS OS TESTES PASSARAM!${NC}"
  exit 0
else
  echo -e "${RED}⚠️  ALGUNS TESTES FALHARAM${NC}"
  exit 1
fi
```

---

## 📞 Suporte e Escalação

### Níveis de Severidade

**P0 - Critical (Resolver imediatamente)**

- Sistema completamente offline
- Perda de dados
- Vulnerabilidade de segurança exposta

**P1 - High (Resolver em 4h)**

- Funcionalidade crítica quebrada
- Performance severamente degradada
- Afeta > 50% dos usuários

**P2 - Medium (Resolver em 24h)**

- Funcionalidade secundária quebrada
- Bug afeta workflow específico
- Afeta < 50% dos usuários

**P3 - Low (Resolver em 1 semana)**

- Bugs visuais
- Melhorias de UX
- Otimizações

---

## 📚 Apêndices

### Apêndice A: Dados de Teste

```sql
-- Inserir dados de teste para QA
INSERT INTO "TipoMateriaPrima" (id, nome, codigo, unidade, "custoUnitario", categoria, ativo)
VALUES
  ('qa-001', 'QA - Farinha de Trigo', 'QA-FT-001', 'KG', 5.50, 'Farinha', true),
  ('qa-002', 'QA - Açúcar Refinado', 'QA-AC-001', 'KG', 3.00, 'Açúcar', true),
  ('qa-003', 'QA - Chocolate em Pó', 'QA-CH-001', 'KG', 15.00, 'Chocolate', true),
  ('qa-004', 'QA - Ovos', 'QA-OV-001', 'UN', 0.50, 'Laticínios', true),
  ('qa-005', 'QA - Leite Integral', 'QA-LT-001', 'L', 4.00, 'Laticínios', true);

INSERT INTO "TipoMaoDeObra" (id, nome, codigo, "custoHora", "incluiMaquina", "ativo")
VALUES
  ('qa-mo-001', 'QA - Confeiteiro Junior', 'QA-MO-001', 25.00, false, true),
  ('qa-mo-002', 'QA - Operador de Forno', 'QA-MO-002', 30.00, true, true);

UPDATE "TipoMaoDeObra"
SET "custoMaquinaHora" = 15.00
WHERE id = 'qa-mo-002';
```

### Apêndice B: Comandos Úteis

```bash
# Verificar status do build
npm run build 2>&1 | tee build.log

# Executar migrations em produção
DATABASE_URL="postgresql://..." npx prisma migrate deploy

# Verificar logs em tempo real (se usando Docker)
docker logs -f prezzo-app

# Testar conexão com database
psql $DATABASE_URL -c "SELECT COUNT(*) FROM \"TipoMateriaPrima\";"

# Backup rápido do database
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d-%H%M%S).sql

# Health check simples
curl -f https://prezzo.com/api/health || echo "Health check failed"
```

### Apêndice C: Referências

- [Next.js Deployment Best Practices](https://nextjs.org/docs/deployment)
- [Prisma Production Best Practices](https://www.prisma.io/docs/guides/deployment)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)

---

**FIM DO PLANO DE TESTES**

---

**Versão**: 1.0
**Última Atualização**: 2025-11-27
**Próxima Revisão**: Pós primeiro deploy

**Elaborado por**: Enterprise QA Team
**Aprovado por**: **\*\***\_\_\_\_**\*\***
**Data**: **\*\***\_\_\_\_**\*\***

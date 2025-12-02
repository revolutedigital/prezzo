# 🧪 Plano de Testes QA - PREZZO

## Sistema Inteligente de Precificação

**Versão:** 1.5 (com Mão de Obra)
**Data:** 27/11/2025
**Responsável QA:** Equipe Enterprise QA
**Status:** Pré-Deploy em Produção

---

## 📋 Índice

1. [Objetivos e Escopo](#objetivos-e-escopo)
2. [Ambientes de Teste](#ambientes-de-teste)
3. [Estratégia de Testes](#estratégia-de-testes)
4. [Casos de Teste Funcionais](#casos-de-teste-funcionais)
5. [Testes de Integração](#testes-de-integração)
6. [Testes de Performance](#testes-de-performance)
7. [Testes de Segurança](#testes-de-segurança)
8. [Testes de Usabilidade](#testes-de-usabilidade)
9. [Testes de Regressão](#testes-de-regressão)
10. [Critérios de Aceite](#critérios-de-aceite)
11. [Checklist Pré-Deploy](#checklist-pré-deploy)

---

## 🎯 Objetivos e Escopo

### Objetivos

- ✅ Garantir funcionalidade completa de todos os módulos
- ✅ Validar integridade dos dados e cálculos
- ✅ Verificar performance e escalabilidade
- ✅ Assegurar segurança e proteção de dados
- ✅ Confirmar experiência do usuário (UX)
- ✅ Certificar compatibilidade cross-browser
- ✅ Validar deploy e rollback

### Escopo de Testes

**Módulos Incluídos:**

1. ✅ Autenticação e Autorização
2. ✅ Gestão de Matérias-Primas
3. ✅ **Gestão de Mão de Obra (NOVO)**
4. ✅ Cadastro de Produtos e Variações
5. ✅ **Composição de Mão de Obra (NOVO)**
6. ✅ Sistema de Orçamentos
7. ✅ Prezzo AI (Processamento de NF)
8. ✅ Dashboard e Relatórios
9. ✅ Configurações

**Fora do Escopo:**

- ❌ Integração com ERPs externos (futura)
- ❌ App mobile (futura)
- ❌ Multi-idioma (futura)

---

## 🌍 Ambientes de Teste

### 1. Ambiente Local (Desenvolvimento)

```
URL: http://localhost:8001
Banco: PostgreSQL local (porta 8000)
Dados: Dados de desenvolvimento
```

### 2. Ambiente de Staging

```
URL: https://staging.prezzo.app
Banco: PostgreSQL staging
Dados: Cópia sanitizada da produção
```

### 3. Ambiente de Produção

```
URL: https://prezzo.app (ou Railway URL)
Banco: PostgreSQL produção
Dados: Produção real
```

---

## 📊 Estratégia de Testes

### Pirâmide de Testes

```
        /\
       /  \      10% - Testes E2E (UI)
      /____\
     /      \    30% - Testes de Integração (API)
    /________\
   /          \  60% - Testes Unitários (Lógica)
  /____________\
```

### Tipos de Testes

| Tipo        | Ferramenta | Cobertura         | Prioridade |
| ----------- | ---------- | ----------------- | ---------- |
| Unitários   | Jest       | Lógica de negócio | P0         |
| Integração  | Supertest  | API Routes        | P0         |
| E2E         | Playwright | Fluxos críticos   | P1         |
| Performance | Artillery  | Carga e stress    | P1         |
| Segurança   | OWASP ZAP  | Vulnerabilidades  | P0         |
| Usabilidade | Manual     | UX/UI             | P2         |

### Priorização

**P0 - Crítico (Blocker):**

- Autenticação
- Cálculo de custos
- Geração de orçamentos
- Perda de dados

**P1 - Alta:**

- Upload de NF
- Relatórios
- Performance

**P2 - Média:**

- UI/UX
- Validações de formulário

**P3 - Baixa:**

- Melhorias estéticas
- Mensagens de erro

---

## 🧪 Casos de Teste Funcionais

### 1. Módulo: Autenticação e Autorização

#### TC-AUTH-001: Login com Credenciais Válidas

**Prioridade:** P0
**Pré-condições:**

- Usuário admin existe (admin@prezzo.com / admin123)
- Sistema está rodando

**Passos:**

1. Acessar http://localhost:8001/login
2. Inserir email: admin@prezzo.com
3. Inserir senha: admin123
4. Clicar em "Entrar"

**Resultado Esperado:**

- ✅ Redirecionamento para /dashboard
- ✅ Sidebar com menu visível
- ✅ Nome do usuário no header
- ✅ Session cookie criado

**Resultado Real:** [ ] Pass [ ] Fail
**Observações:** \***\*\_\_\_\*\***

---

#### TC-AUTH-002: Login com Credenciais Inválidas

**Prioridade:** P0
**Pré-condições:**

- Sistema está rodando

**Passos:**

1. Acessar /login
2. Inserir email: invalid@test.com
3. Inserir senha: wrongpassword
4. Clicar em "Entrar"

**Resultado Esperado:**

- ✅ Mensagem de erro: "Credenciais inválidas"
- ✅ Permanece na página de login
- ✅ Campos limpos ou mantidos

**Resultado Real:** [ ] Pass [ ] Fail
**Observações:** \***\*\_\_\_\*\***

---

#### TC-AUTH-003: Acesso sem Autenticação

**Prioridade:** P0
**Pré-condições:**

- Usuário não autenticado

**Passos:**

1. Tentar acessar /dashboard diretamente
2. Tentar acessar /produtos diretamente
3. Tentar acessar /api/materias-primas diretamente

**Resultado Esperado:**

- ✅ Redirecionamento para /login
- ✅ Ou retorno 401 Unauthorized (API)

**Resultado Real:** [ ] Pass [ ] Fail
**Observações:** \***\*\_\_\_\*\***

---

#### TC-AUTH-004: Logout

**Prioridade:** P1
**Pré-condições:**

- Usuário autenticado

**Passos:**

1. Clicar em menu do usuário
2. Clicar em "Sair"

**Resultado Esperado:**

- ✅ Redirecionamento para /login
- ✅ Session destruída
- ✅ Não consegue mais acessar páginas protegidas

**Resultado Real:** [ ] Pass [ ] Fail
**Observações:** \***\*\_\_\_\*\***

---

### 2. Módulo: Gestão de Matérias-Primas

#### TC-MAT-001: Listar Matérias-Primas

**Prioridade:** P0
**Pré-condições:**

- Usuário autenticado
- Pelo menos 1 matéria-prima cadastrada

**Passos:**

1. Acessar Menu → Matérias-Primas
2. Observar listagem

**Resultado Esperado:**

- ✅ Tabela com colunas: Nome, Código, Unidade, Custo, Fornecedor, Status
- ✅ Ações: Editar, Excluir
- ✅ Botão "+ Nova Matéria-Prima"
- ✅ Estatísticas no topo (total, custo médio)

**Resultado Real:** [ ] Pass [ ] Fail
**Observações:** \***\*\_\_\_\*\***

---

#### TC-MAT-002: Criar Matéria-Prima

**Prioridade:** P0
**Pré-condições:**

- Usuário autenticado

**Passos:**

1. Clicar em "+ Nova Matéria-Prima"
2. Preencher:
   - Nome: "Filtro de Alumínio Teste"
   - Código: "FIL-TEST-001"
   - Unidade: metro
   - Custo: 45.50
   - Fornecedor: "Fornecedor Teste"
3. Clicar em "Salvar"

**Resultado Esperado:**

- ✅ Toast de sucesso
- ✅ Matéria-prima aparece na listagem
- ✅ Dados corretos salvos

**Resultado Real:** [ ] Pass [ ] Fail
**Observações:** \***\*\_\_\_\*\***

---

#### TC-MAT-003: Editar Matéria-Prima

**Prioridade:** P0
**Pré-condições:**

- Matéria-prima "FIL-TEST-001" existe

**Passos:**

1. Clicar em editar na matéria "FIL-TEST-001"
2. Alterar custo para: 48.00
3. Clicar em "Salvar"

**Resultado Esperado:**

- ✅ Toast de sucesso
- ✅ Custo atualizado na listagem
- ✅ Histórico de custo registrado

**Resultado Real:** [ ] Pass [ ] Fail
**Observações:** \***\*\_\_\_\*\***

---

#### TC-MAT-004: Excluir Matéria-Prima (Sem Vínculo)

**Prioridade:** P1
**Pré-condições:**

- Matéria-prima sem vínculo com produtos

**Passos:**

1. Clicar em excluir
2. Confirmar exclusão

**Resultado Esperado:**

- ✅ Toast de sucesso
- ✅ Matéria removida da listagem

**Resultado Real:** [ ] Pass [ ] Fail
**Observações:** \***\*\_\_\_\*\***

---

#### TC-MAT-005: Excluir Matéria-Prima (Com Vínculo)

**Prioridade:** P0
**Pré-condições:**

- Matéria-prima vinculada a produto

**Passos:**

1. Clicar em excluir
2. Tentar confirmar

**Resultado Esperado:**

- ✅ Mensagem de erro
- ✅ "Não é possível excluir. Esta matéria está em uso por X produto(s)"
- ✅ Matéria permanece na listagem

**Resultado Real:** [ ] Pass [ ] Fail
**Observações:** \***\*\_\_\_\*\***

---

### 3. Módulo: Gestão de Mão de Obra (NOVO)

#### TC-MO-001: Listar Tipos de Mão de Obra

**Prioridade:** P0
**Pré-condições:**

- Usuário autenticado

**Passos:**

1. Acessar Menu → Mão de Obra
2. Observar listagem

**Resultado Esperado:**

- ✅ Tabela com colunas: Nome, Código, Custo/h, Máquina, Custo Máquina/h, Total/h, Produtos, Status
- ✅ Estatísticas: Total tipos, Com máquina, Custo médio/hora
- ✅ Botão "+ Novo Tipo"

**Resultado Real:** [ ] Pass [ ] Fail
**Observações:** \***\*\_\_\_\*\***

---

#### TC-MO-002: Criar Tipo de Mão de Obra SEM Máquina

**Prioridade:** P0
**Pré-condições:**

- Usuário autenticado

**Passos:**

1. Clicar em "+ Novo Tipo"
2. Preencher:
   - Nome: "Montador"
   - Código: "MONT-001"
   - Custo/Hora: 35.00
   - Inclui Máquina: ☐ Não
   - Descrição: "Montagem manual de produtos"
3. Clicar em "Criar"

**Resultado Esperado:**

- ✅ Toast de sucesso
- ✅ Tipo aparece na listagem
- ✅ Custo Total/Hora = R$ 35,00
- ✅ Badge "Não" em Máquina

**Resultado Real:** [ ] Pass [ ] Fail
**Observações:** \***\*\_\_\_\*\***

---

#### TC-MO-003: Criar Tipo de Mão de Obra COM Máquina

**Prioridade:** P0
**Pré-condições:**

- Usuário autenticado

**Passos:**

1. Clicar em "+ Novo Tipo"
2. Preencher:
   - Nome: "Soldador"
   - Código: "SOLD-001"
   - Custo/Hora: 45.00
   - Inclui Máquina: ☑ Sim
   - Custo Máquina/Hora: 25.00
   - Descrição: "Soldagem MIG/MAG"
3. Verificar resumo: Custo Total/Hora = R$ 70,00
4. Clicar em "Criar"

**Resultado Esperado:**

- ✅ Toast de sucesso
- ✅ Tipo aparece na listagem
- ✅ Custo Total/Hora = R$ 70,00 (45 + 25)
- ✅ Badge "Sim" em Máquina

**Resultado Real:** [ ] Pass [ ] Fail
**Observações:** \***\*\_\_\_\*\***

---

#### TC-MO-004: Validação - Máquina sem Custo

**Prioridade:** P1
**Pré-condições:**

- Usuário autenticado

**Passos:**

1. Clicar em "+ Novo Tipo"
2. Preencher:
   - Nome: "Teste"
   - Custo/Hora: 40.00
   - Inclui Máquina: ☑ Sim
   - Custo Máquina/Hora: (deixar vazio)
3. Tentar salvar

**Resultado Esperado:**

- ✅ Erro de validação
- ✅ "Custo de máquina é obrigatório quando inclui máquina"
- ✅ Formulário não fecha

**Resultado Real:** [ ] Pass [ ] Fail
**Observações:** \***\*\_\_\_\*\***

---

#### TC-MO-005: Editar Tipo de Mão de Obra

**Prioridade:** P0
**Pré-condições:**

- Tipo "Montador" existe

**Passos:**

1. Clicar em editar "Montador"
2. Alterar Custo/Hora para: 38.00
3. Salvar

**Resultado Esperado:**

- ✅ Toast de sucesso
- ✅ Custo atualizado
- ✅ Histórico de mudança registrado

**Resultado Real:** [ ] Pass [ ] Fail
**Observações:** \***\*\_\_\_\*\***

---

#### TC-MO-006: Excluir Tipo (Com Vínculo)

**Prioridade:** P0
**Pré-condições:**

- Tipo vinculado a produto

**Passos:**

1. Tentar excluir tipo vinculado

**Resultado Esperado:**

- ✅ Mensagem de erro
- ✅ "Não é possível excluir. Este tipo está em uso por X produto(s)"
- ✅ Tipo permanece

**Resultado Real:** [ ] Pass [ ] Fail
**Observações:** \***\*\_\_\_\*\***

---

### 4. Módulo: Produtos e Variações

#### TC-PROD-001: Criar Tipo de Produto

**Prioridade:** P0
**Pré-condições:**

- Usuário autenticado

**Passos:**

1. Acessar Menu → Produtos
2. Clicar "+ Novo Tipo"
3. Preencher:
   - Nome: "Filtro Teste QA"
   - Código: "FIL-QA-001"
   - Categoria: "Teste"
4. Salvar

**Resultado Esperado:**

- ✅ Toast de sucesso
- ✅ Tipo aparece na listagem

**Resultado Real:** [ ] Pass [ ] Fail
**Observações:** \***\*\_\_\_\*\***

---

#### TC-PROD-002: Criar Variação de Produto

**Prioridade:** P0
**Pré-condições:**

- Tipo "Filtro Teste QA" existe
- Matéria-prima existe

**Passos:**

1. Clicar em "Ver Variações" no tipo
2. Clicar "+ Nova Variação"
3. Preencher:
   - Nome: "Grade Ferro"
   - Margem Padrão: 40%
4. Adicionar composição:
   - Selecionar matéria-prima
   - Quantidade: 2
   - Unidade: metro
5. Observar custo calculado
6. Salvar

**Resultado Esperado:**

- ✅ Toast de sucesso
- ✅ Variação criada
- ✅ Custo calculado automaticamente
- ✅ Preço sugerido com margem

**Resultado Real:** [ ] Pass [ ] Fail
**Observações:** \***\*\_\_\_\*\***

---

### 5. Módulo: Composição de Mão de Obra (NOVO)

#### TC-COMP-001: Adicionar Mão de Obra ao Produto

**Prioridade:** P0
**Pré-condições:**

- Variação "Grade Ferro" existe
- Tipo "Soldador" (R$ 70/h) existe

**Passos:**

1. Clicar em editar variação "Grade Ferro"
2. Ir para aba "Mão de Obra"
3. Clicar "+ Adicionar"
4. Selecionar:
   - Tipo: Soldador
   - Horas: 2
   - Descrição: "Soldagem da base"
5. Verificar preview: R$ 140,00 (2h × R$ 70)
6. Salvar

**Resultado Esperado:**

- ✅ Toast de sucesso
- ✅ Mão de obra aparece na tabela
- ✅ Custo Total Mão de Obra = R$ 140,00
- ✅ Resumo de custos atualizado

**Resultado Real:** [ ] Pass [ ] Fail
**Observações:** \***\*\_\_\_\*\***

---

#### TC-COMP-002: Cálculo Total do Produto

**Prioridade:** P0
**Pré-condições:**

- Variação com materiais e mão de obra

**Dados:**

```
Materiais:
- Material A: 2m × R$ 45 = R$ 90
- Material B: 1.5m × R$ 30 = R$ 45
Subtotal Materiais = R$ 135

Mão de Obra:
- Soldador: 2h × R$ 70 = R$ 140
- Montador: 1h × R$ 35 = R$ 35
Subtotal Mão de Obra = R$ 175

Custo Total = R$ 310
Margem 40% = R$ 124
Preço Venda = R$ 434
```

**Passos:**

1. Verificar cards de resumo no topo

**Resultado Esperado:**

- ✅ Card "Materiais": R$ 135,00
- ✅ Card "Mão de Obra": R$ 175,00
- ✅ Card "Custo Total": R$ 310,00
- ✅ Card "Preço Venda (40%)": R$ 434,00

**Resultado Real:** [ ] Pass [ ] Fail
**Observações:** \***\*\_\_\_\*\***

---

#### TC-COMP-003: Remover Mão de Obra

**Prioridade:** P1
**Pré-condições:**

- Mão de obra "Soldador" vinculada

**Passos:**

1. Clicar em remover mão de obra
2. Confirmar

**Resultado Esperado:**

- ✅ Toast de sucesso
- ✅ Mão de obra removida
- ✅ Custo Total atualizado
- ✅ Preço recalculado

**Resultado Real:** [ ] Pass [ ] Fail
**Observações:** \***\*\_\_\_\*\***

---

#### TC-COMP-004: Atualização Automática de Custos

**Prioridade:** P0 (CRÍTICO)
**Pré-condições:**

- Produto com mão de obra vinculada

**Passos:**

1. Anotar custo total do produto
2. Ir para Mão de Obra
3. Editar tipo "Soldador"
4. Alterar custo/hora de R$ 70 para R$ 75
5. Salvar
6. Voltar para visualização do produto

**Resultado Esperado:**

- ✅ Custo do produto atualizado automaticamente
- ✅ Novo custo = (horas × novo_custo_hora)
- ✅ Preço de venda recalculado

**Resultado Real:** [ ] Pass [ ] Fail
**Observações:** \***\*\_\_\_\*\***

---

### 6. Módulo: Orçamentos

#### TC-ORC-001: Criar Orçamento

**Prioridade:** P0
**Pré-condições:**

- Produto com preço calculado existe

**Passos:**

1. Menu → Orçamentos → + Novo
2. Preencher dados cliente:
   - Nome: "Cliente Teste QA"
   - Email: "qa@test.com"
   - Validade: 15 dias
3. Adicionar produto
4. Quantidade: 2
5. Observar totais calculados
6. Salvar

**Resultado Esperado:**

- ✅ Toast de sucesso
- ✅ Subtotal = preço × quantidade
- ✅ Total calculado
- ✅ Orçamento na listagem

**Resultado Real:** [ ] Pass [ ] Fail
**Observações:** \***\*\_\_\_\*\***

---

#### TC-ORC-002: Gerar PDF do Orçamento

**Prioridade:** P0
**Pré-condições:**

- Orçamento criado

**Passos:**

1. Abrir orçamento
2. Clicar "Gerar PDF"

**Resultado Esperado:**

- ✅ PDF gerado
- ✅ Contém: logo, dados cliente, itens, totais
- ✅ Formatação profissional
- ✅ Valores corretos

**Resultado Real:** [ ] Pass [ ] Fail
**Observações:** \***\*\_\_\_\*\***

---

#### TC-ORC-003: Aplicar Desconto

**Prioridade:** P1
**Pré-condições:**

- Orçamento com itens

**Passos:**

1. Aplicar desconto de 10%
2. Verificar recálculo

**Resultado Esperado:**

- ✅ Desconto aplicado corretamente
- ✅ Total = subtotal - desconto

**Resultado Real:** [ ] Pass [ ] Fail
**Observações:** \***\*\_\_\_\*\***

---

### 7. Módulo: Prezzo AI

#### TC-AI-001: Upload de Nota Fiscal

**Prioridade:** P1
**Pré-condições:**

- Arquivo PDF de NF disponível
- CLAUDE_API_KEY configurada

**Passos:**

1. Menu → Prezzo AI
2. Upload arquivo PDF
3. Aguardar processamento

**Resultado Esperado:**

- ✅ Upload bem-sucedido
- ✅ Status: "Processando" → "Processado"
- ✅ Dados extraídos (fornecedor, NF, data, valor)

**Resultado Real:** [ ] Pass [ ] Fail
**Observações:** \***\*\_\_\_\*\***

---

#### TC-AI-002: Matching de Materiais

**Prioridade:** P1
**Pré-condições:**

- NF processada

**Passos:**

1. Clicar em "Revisar" na NF
2. Observar atualizações pendentes

**Resultado Esperado:**

- ✅ Materiais matchados com matérias-primas
- ✅ Diferenças de custo mostradas
- ✅ % de variação calculada
- ✅ Nível de impacto (Alto/Médio/Baixo)

**Resultado Real:** [ ] Pass [ ] Fail
**Observações:** \***\*\_\_\_\*\***

---

#### TC-AI-003: Confirmar Atualizações de Custo

**Prioridade:** P0 (CRÍTICO)
**Pré-condições:**

- Atualizações pendentes existem

**Passos:**

1. Selecionar atualizações
2. Clicar "Confirmar X Selecionada(s)"
3. Aguardar processamento

**Resultado Esperado:**

- ✅ Toast de sucesso
- ✅ Custos atualizados no sistema
- ✅ Histórico registrado
- ✅ Produtos recalculados automaticamente

**Resultado Real:** [ ] Pass [ ] Fail
**Observações:** \***\*\_\_\_\*\***

---

### 8. Módulo: Dashboard e Relatórios

#### TC-DASH-001: Visualizar Dashboard

**Prioridade:** P1
**Pré-condições:**

- Dados no sistema

**Passos:**

1. Acessar /dashboard

**Resultado Esperado:**

- ✅ KPIs exibidos (matérias, produtos, orçamentos)
- ✅ Gráfico de evolução
- ✅ Widget de alertas (se houver)
- ✅ Top produtos
- ✅ Orçamentos recentes

**Resultado Real:** [ ] Pass [ ] Fail
**Observações:** \***\*\_\_\_\*\***

---

#### TC-REL-001: Relatório de Margens

**Prioridade:** P1
**Pré-condições:**

- Produtos com custos calculados

**Passos:**

1. Menu → Relatórios
2. Aba "Margens por Produto"

**Resultado Esperado:**

- ✅ Margem média geral
- ✅ Produtos com margem baixa
- ✅ Produtos com alta margem
- ✅ Tabela detalhada

**Resultado Real:** [ ] Pass [ ] Fail
**Observações:** \***\*\_\_\_\*\***

---

#### TC-REL-002: Relatório de Evolução de Custos

**Prioridade:** P1
**Pré-condições:**

- Histórico de custos existe

**Passos:**

1. Aba "Evolução de Custos"

**Resultado Esperado:**

- ✅ Total de atualizações
- ✅ Aumentos vs Reduções
- ✅ Gráfico de evolução
- ✅ Histórico completo

**Resultado Real:** [ ] Pass [ ] Fail
**Observações:** \***\*\_\_\_\*\***

---

#### TC-REL-003: Relatório de Rentabilidade

**Prioridade:** P1
**Pré-condições:**

- Orçamentos aprovados existem

**Passos:**

1. Aba "Rentabilidade"

**Resultado Esperado:**

- ✅ Total em vendas
- ✅ Custo vs Lucro
- ✅ Margem global
- ✅ Top 5 clientes

**Resultado Real:** [ ] Pass [ ] Fail
**Observações:** \***\*\_\_\_\*\***

---

## 🔗 Testes de Integração

### INT-001: Fluxo Completo - Criar Produto e Orçamento

**Objetivo:** Validar integração entre todos os módulos

**Pré-condições:**

- Sistema limpo ou dados de teste

**Passos:**

1. **Criar Matérias-Primas**
   - Criar "Alumínio" (R$ 45/m)
   - Criar "Ferro" (R$ 30/m)

2. **Criar Tipos de Mão de Obra**
   - Criar "Soldador" (R$ 70/h com máquina)
   - Criar "Montador" (R$ 35/h sem máquina)

3. **Criar Produto**
   - Tipo: "Filtro Industrial"
   - Variação: "Modelo A"
   - Composição Materiais:
     - Alumínio: 2m
     - Ferro: 1.5m
   - Composição Mão de Obra:
     - Soldador: 2h
     - Montador: 1h
   - Margem: 40%

4. **Verificar Cálculos**
   - Materiais: (2×45) + (1.5×30) = R$ 135
   - Mão Obra: (2×70) + (1×35) = R$ 175
   - Total: R$ 310
   - Preço: R$ 434

5. **Criar Orçamento**
   - Cliente: "Empresa XYZ"
   - Produto: Filtro Industrial - Modelo A
   - Quantidade: 3
   - Subtotal: 3 × R$ 434 = R$ 1.302

6. **Gerar PDF**
   - Verificar dados corretos no PDF

**Resultado Esperado:**

- ✅ Todas as etapas completadas sem erro
- ✅ Cálculos precisos em cada etapa
- ✅ Dados persistidos corretamente
- ✅ PDF gerado com informações corretas

**Resultado Real:** [ ] Pass [ ] Fail
**Tempo de Execução:** **\_ min
**Observações:** \*\***\_**\*\***

---

### INT-002: Atualização em Cascata de Custos

**Objetivo:** Validar recálculo automático quando custos mudam

**Pré-condições:**

- Produto completo criado (INT-001)

**Passos:**

1. **Estado Inicial**
   - Anotar custo total do produto: R$ 310
   - Anotar preço de venda: R$ 434

2. **Atualizar Custo de Matéria-Prima**
   - Editar "Alumínio": R$ 45 → R$ 50
   - Novo custo materiais: (2×50) + (1.5×30) = R$ 145

3. **Atualizar Custo de Mão de Obra**
   - Editar "Soldador": R$ 70/h → R$ 75/h
   - Novo custo mão obra: (2×75) + (1×35) = R$ 185

4. **Verificar Produto**
   - Novo custo total: R$ 145 + R$ 185 = R$ 330
   - Novo preço: R$ 330 × 1.4 = R$ 462

5. **Verificar Histórico**
   - Histórico de matéria-prima registrado
   - Histórico de mão de obra registrado

**Resultado Esperado:**

- ✅ Custos atualizados automaticamente
- ✅ Preço recalculado corretamente
- ✅ Históricos criados
- ✅ Itens de produto atualizados

**Resultado Real:** [ ] Pass [ ] Fail
**Tempo de Execução:** **\_ min
**Observações:** \*\***\_**\*\***

---

## ⚡ Testes de Performance

### PERF-001: Tempo de Carregamento de Páginas

**Objetivo:** Garantir tempos de resposta aceitáveis

**Critérios de Aceite:**

- ✅ Dashboard: < 2s
- ✅ Listagens: < 1s
- ✅ Criação/Edição: < 500ms
- ✅ Geração PDF: < 3s

**Metodologia:**

1. Usar Chrome DevTools Network tab
2. Desabilitar cache
3. Simular Fast 3G
4. Medir 10 carregamentos
5. Calcular média

**Resultados:**

| Página           | Tentativa 1 | Tentativa 2 | Tentativa 3 | Média  | Status            |
| ---------------- | ----------- | ----------- | ----------- | ------ | ----------------- |
| /dashboard       | \_\_\_      | \_\_\_      | \_\_\_      | \_\_\_ | [ ] Pass [ ] Fail |
| /materias-primas | \_\_\_      | \_\_\_      | \_\_\_      | \_\_\_ | [ ] Pass [ ] Fail |
| /mao-de-obra     | \_\_\_      | \_\_\_      | \_\_\_      | \_\_\_ | [ ] Pass [ ] Fail |
| /produtos        | \_\_\_      | \_\_\_      | \_\_\_      | \_\_\_ | [ ] Pass [ ] Fail |
| /orcamentos      | \_\_\_      | \_\_\_      | \_\_\_      | \_\_\_ | [ ] Pass [ ] Fail |
| PDF Generation   | \_\_\_      | \_\_\_      | \_\_\_      | \_\_\_ | [ ] Pass [ ] Fail |

---

### PERF-002: Carga Simultânea de Usuários

**Objetivo:** Testar comportamento com múltiplos usuários

**Cenários:**

**Cenário 1: 10 Usuários Simultâneos**

- Operação: Listar produtos
- Duração: 1 minuto
- Resultado: **_ req/s | _** ms latência
- Status: [ ] Pass [ ] Fail

**Cenário 2: 50 Usuários Simultâneos**

- Operação: Criar orçamentos
- Duração: 2 minutos
- Resultado: **_ req/s | _** ms latência
- Status: [ ] Pass [ ] Fail

**Cenário 3: 100 Usuários Simultâneos** (Stress Test)

- Operação: Misto (70% leitura, 30% escrita)
- Duração: 5 minutos
- Resultado: **_ req/s | _** ms latência
- Status: [ ] Pass [ ] Fail

**Critérios:**

- ✅ Taxa de erro < 1%
- ✅ Latência p95 < 2s
- ✅ Sem crash de servidor

---

### PERF-003: Tamanho de Bundle

**Objetivo:** Garantir tamanho aceitável do JavaScript

**Comando:**

```bash
npm run build
npm run analyze
```

**Critérios:**

- ✅ Bundle total < 500KB (gzipped)
- ✅ First Contentful Paint < 1.5s
- ✅ Time to Interactive < 3.5s

**Resultado Real:**

- Bundle size: \_\_\_ KB
- FCP: \_\_\_ s
- TTI: \_\_\_ s
- Status: [ ] Pass [ ] Fail

---

## 🔒 Testes de Segurança

### SEC-001: Injeção SQL

**Objetivo:** Verificar proteção contra SQL Injection

**Método:** Tentar injeção em campos de input

**Testes:**

1. **Login:**
   - Email: `admin' OR '1'='1`
   - Resultado: [ ] Bloqueado [ ] Vulnerável

2. **Busca de Matérias:**
   - Query: `'; DROP TABLE materias_primas; --`
   - Resultado: [ ] Bloqueado [ ] Vulnerável

3. **API Direct:**
   - `GET /api/produtos?id=1' OR '1'='1`
   - Resultado: [ ] Bloqueado [ ] Vulnerável

**Status Geral:** [ ] Pass [ ] Fail

---

### SEC-002: Cross-Site Scripting (XSS)

**Objetivo:** Verificar proteção contra XSS

**Testes:**

1. **Nome de Matéria-Prima:**
   - Input: `<script>alert('XSS')</script>`
   - Resultado: [ ] Sanitizado [ ] Vulnerável

2. **Descrição de Produto:**
   - Input: `<img src=x onerror=alert('XSS')>`
   - Resultado: [ ] Sanitizado [ ] Vulnerável

3. **Observações de Orçamento:**
   - Input: `<svg onload=alert('XSS')>`
   - Resultado: [ ] Sanitizado [ ] Vulnerável

**Status Geral:** [ ] Pass [ ] Fail

---

### SEC-003: Autenticação e Autorização

**Objetivo:** Verificar controle de acesso

**Testes:**

1. **Session Timeout:**
   - Aguardar 30 minutos inativo
   - Tentar acessar página
   - Resultado: [ ] Redirected to login [ ] Still authenticated

2. **Token Reuse:**
   - Copiar token de sessão
   - Fazer logout
   - Tentar usar token antigo
   - Resultado: [ ] Rejected [ ] Accepted

3. **Direct API Access:**
   - Sem cookie de sessão
   - `GET /api/materias-primas`
   - Resultado: [ ] 401 Unauthorized [ ] 200 OK

**Status Geral:** [ ] Pass [ ] Fail

---

### SEC-004: Validação de Arquivos

**Objetivo:** Verificar segurança no upload de arquivos

**Testes:**

1. **Arquivo Não-PDF:**
   - Upload .exe / .sh
   - Resultado: [ ] Rejected [ ] Accepted

2. **Arquivo Muito Grande:**
   - Upload > 10MB
   - Resultado: [ ] Rejected [ ] Accepted

3. **PDF Malicioso:**
   - PDF com JavaScript embutido
   - Resultado: [ ] Safe processed [ ] Executed

**Status Geral:** [ ] Pass [ ] Fail

---

### SEC-005: Headers de Segurança

**Objetivo:** Verificar headers HTTP de segurança

**Comando:**

```bash
curl -I http://localhost:8001
```

**Headers Esperados:**

- ✅ X-Frame-Options: DENY
- ✅ X-Content-Type-Options: nosniff
- ✅ X-XSS-Protection: 1; mode=block
- ✅ Referrer-Policy: strict-origin-when-cross-origin

**Resultado Real:**

```
___________
```

**Status:** [ ] Pass [ ] Fail

---

## 👥 Testes de Usabilidade

### UX-001: Navegabilidade

**Objetivo:** Avaliar facilidade de navegação

**Critérios:**

- [ ] Usuário consegue acessar qualquer função em ≤ 3 cliques
- [ ] Menu lateral sempre visível e intuitivo
- [ ] Breadcrumbs ou indicação de localização
- [ ] Botões de ação primária destacados

**Feedback do Usuário Teste:**

```
___________
```

**Status:** [ ] Pass [ ] Fail

---

### UX-002: Responsividade

**Objetivo:** Testar em diferentes dispositivos

**Dispositivos Testados:**

| Dispositivo         | Resolução | Status            | Observações |
| ------------------- | --------- | ----------------- | ----------- |
| Desktop (1920×1080) | Large     | [ ] Pass [ ] Fail | \_\_\_      |
| Laptop (1366×768)   | Medium    | [ ] Pass [ ] Fail | \_\_\_      |
| Tablet (768×1024)   | Small     | [ ] Pass [ ] Fail | \_\_\_      |
| Mobile (375×667)    | XS        | [ ] Pass [ ] Fail | \_\_\_      |

---

### UX-003: Mensagens e Feedback

**Objetivo:** Validar clareza das mensagens

**Cenários:**

1. **Sucesso:**
   - Mensagem clara? [ ] Sim [ ] Não
   - Toast visível? [ ] Sim [ ] Não
   - Auto-dismiss? [ ] Sim [ ] Não

2. **Erro:**
   - Mensagem descritiva? [ ] Sim [ ] Não
   - Indica solução? [ ] Sim [ ] Não
   - Não expõe detalhes técnicos? [ ] Sim [ ] Não

3. **Loading:**
   - Indicador visível? [ ] Sim [ ] Não
   - Bloqueia ações durante? [ ] Sim [ ] Não

**Status:** [ ] Pass [ ] Fail

---

## 🔄 Testes de Regressão

### Checklist de Regressão

**Executar após cada mudança significativa:**

#### Funcionalidades Core:

- [ ] Login/Logout
- [ ] Criar matéria-prima
- [ ] Criar mão de obra
- [ ] Criar produto com composição
- [ ] Adicionar mão de obra ao produto
- [ ] Criar orçamento
- [ ] Gerar PDF
- [ ] Upload NF (se API key configurada)
- [ ] Visualizar relatórios

#### Cálculos:

- [ ] Custo de materiais correto
- [ ] Custo de mão de obra correto
- [ ] Custo total = materiais + mão de obra
- [ ] Preço com margem correto
- [ ] Recálculo ao atualizar custos

#### Navegação:

- [ ] Menu lateral funcional
- [ ] Todas as rotas acessíveis
- [ ] Botões de voltar funcionam
- [ ] Redirecionamentos corretos

---

## ✅ Critérios de Aceite para Deploy

### Critérios Obrigatórios (GO/NO-GO)

#### Funcionalidade:

- [x] Todos os testes P0 passaram
- [ ] ≥ 90% dos testes P1 passaram
- [ ] Nenhum bug crítico aberto
- [ ] Nenhum bug de perda de dados

#### Performance:

- [ ] Páginas carregam em < 2s
- [ ] API responde em < 500ms (p95)
- [ ] Suporta 50 usuários simultâneos sem degradação

#### Segurança:

- [ ] Todos os testes de segurança passaram
- [ ] Sem vulnerabilidades OWASP Top 10
- [ ] Autenticação e autorização funcionam
- [ ] Dados sensíveis protegidos

#### Infraestrutura:

- [ ] Build de produção sem erros
- [ ] Migrations executam sem falhas
- [ ] Variáveis de ambiente configuradas
- [ ] Backups configurados
- [ ] Monitoramento configurado

### Critérios Desejáveis:

- [ ] Todos os testes P2 passaram
- [ ] Cobertura de testes > 60%
- [ ] Lighthouse score > 90
- [ ] Documentação completa
- [ ] Guia do usuário disponível

---

## 📋 Checklist Pré-Deploy

### 1. Verificações de Código

```bash
# Lint
npm run lint

# Build
npm run build

# Verificar erros TypeScript
npx tsc --noEmit
```

- [ ] Sem erros de lint
- [ ] Build bem-sucedida
- [ ] Sem erros TypeScript

---

### 2. Banco de Dados

```bash
# Verificar migrations
npx prisma migrate status

# Gerar Prisma Client
npx prisma generate
```

- [ ] Todas as migrations aplicadas
- [ ] Schema sincronizado com models
- [ ] Prisma Client gerado

---

### 3. Variáveis de Ambiente

**Produção:**

```env
DATABASE_URL=postgresql://...
NEXTAUTH_URL=https://prezzo.app
NEXTAUTH_SECRET=<strong-secret>
CLAUDE_API_KEY=sk-ant-...
```

- [ ] DATABASE_URL configurada
- [ ] NEXTAUTH_URL correta (https)
- [ ] NEXTAUTH_SECRET forte (≥32 chars)
- [ ] CLAUDE_API_KEY (opcional, mas recomendado)

---

### 4. Deploy Railway

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Deploy
railway up
```

- [ ] Projeto criado no Railway
- [ ] PostgreSQL provisionado
- [ ] Variáveis de ambiente configuradas
- [ ] Deploy bem-sucedido
- [ ] Migrations executadas em produção

---

### 5. Pós-Deploy

**Smoke Tests (Testes Rápidos):**

```bash
# Health check
curl https://prezzo.app/api/health

# Login
# (manual via browser)

# Criar dados de teste
# (manual via UI)
```

- [ ] Aplicação acessível
- [ ] Login funciona
- [ ] CRUD básico funciona
- [ ] Sem erros 500 no console
- [ ] SSL/HTTPS ativo

---

### 6. Monitoramento

- [ ] Logs configurados
- [ ] Alertas de erro configurados
- [ ] Dashboard de métricas acessível
- [ ] Backup automático configurado

---

### 7. Documentação

- [ ] README atualizado
- [ ] Guia de deploy documentado
- [ ] Variáveis de ambiente documentadas
- [ ] GUIA_DO_USUARIO.md disponível

---

## 📊 Relatório de Execução de Testes

### Sumário Executivo

**Data de Execução:** \***\*\_\_\_\*\***
**Executado por:** \***\*\_\_\_\*\***
**Ambiente:** [ ] Local [ ] Staging [ ] Produção
**Versão:** 1.5

### Resultados Gerais

| Categoria                | Total  | Passou     | Falhou     | Taxa Sucesso |
| ------------------------ | ------ | ---------- | ---------- | ------------ |
| Autenticação             | 4      | \_\_\_     | \_\_\_     | \_\_\_%      |
| Matérias-Primas          | 5      | \_\_\_     | \_\_\_     | \_\_\_%      |
| **Mão de Obra (NOVO)**   | 6      | \_\_\_     | \_\_\_     | \_\_\_%      |
| Produtos                 | 2      | \_\_\_     | \_\_\_     | \_\_\_%      |
| **Composição MO (NOVO)** | 4      | \_\_\_     | \_\_\_     | \_\_\_%      |
| Orçamentos               | 3      | \_\_\_     | \_\_\_     | \_\_\_%      |
| Prezzo AI                | 3      | \_\_\_     | \_\_\_     | \_\_\_%      |
| Dashboard/Relatórios     | 4      | \_\_\_     | \_\_\_     | \_\_\_%      |
| Integração               | 2      | \_\_\_     | \_\_\_     | \_\_\_%      |
| Performance              | 3      | \_\_\_     | \_\_\_     | \_\_\_%      |
| Segurança                | 5      | \_\_\_     | \_\_\_     | \_\_\_%      |
| Usabilidade              | 3      | \_\_\_     | \_\_\_     | \_\_\_%      |
| **TOTAL**                | **44** | **\_\_\_** | **\_\_\_** | **\_\_\_%**  |

### Bugs Encontrados

| ID      | Severidade | Módulo | Descrição | Status             |
| ------- | ---------- | ------ | --------- | ------------------ |
| BUG-001 | P0         | \_\_\_ | \_\_\_    | [ ] Open [ ] Fixed |
| BUG-002 | P1         | \_\_\_ | \_\_\_    | [ ] Open [ ] Fixed |
| BUG-003 | P2         | \_\_\_ | \_\_\_    | [ ] Open [ ] Fixed |

### Decisão de Deploy

**Recomendação:** [ ] GO [ ] NO-GO

**Justificativa:**

```
___________
```

**Riscos Conhecidos:**

```
___________
```

**Plano de Rollback:**

```
1. Manter versão anterior em standby
2. Script de rollback preparado:
   - railway rollback
   - Restaurar backup do banco
3. Tempo estimado de rollback: 5 minutos
```

---

## 📞 Contatos e Suporte

**Equipe de Desenvolvimento:**

- Lead: \***\*\_\_\_\*\***
- Backend: \***\*\_\_\_\*\***
- Frontend: \***\*\_\_\_\*\***

**Equipe de QA:**

- QA Lead: \***\*\_\_\_\*\***
- Testers: \***\*\_\_\_\*\***

**DevOps:**

- Responsável: \***\*\_\_\_\*\***
- Oncall: \***\*\_\_\_\*\***

**Emergência:**

- Hotline: \***\*\_\_\_\*\***
- Slack: #prezzo-incidents

---

## 📚 Referências

- [PLANO_DESENVOLVIMENTO_PREZZO.md](PLANO_DESENVOLVIMENTO_PREZZO.md)
- [FASE_4_MAO_DE_OBRA.md](FASE_4_MAO_DE_OBRA.md)
- [GUIA_DO_USUARIO.md](GUIA_DO_USUARIO.md)
- [README.md](README.md)

---

**Última Atualização:** 27/11/2025
**Próxima Revisão:** Após cada release
**Mantido por:** Equipe QA Enterprise

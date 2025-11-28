# FASE 2: PREZZO AI - COMPLETO ✅

## Implementação da Inteligência Artificial para Atualização Automática de Custos

---

## 📋 Resumo da Implementação

A **Fase 2 - PREZZO AI** foi implementada com sucesso, adicionando capacidades de inteligência artificial ao sistema Prezzo para processar notas fiscais automaticamente e atualizar custos de matérias-primas.

### ✅ Funcionalidades Implementadas

1. **Upload e Processamento de Notas Fiscais PDF**
2. **Extração Inteligente de Dados com Claude AI**
3. **Sistema de Matching Automático de Produtos**
4. **Atualização Inteligente de Custos**
5. **Interface de Confirmação com Análise de Impacto**
6. **Sistema de Alertas em Tempo Real**

---

## 🗄️ Banco de Dados

### Modelos Adicionados

#### 1. NotaFiscal
```prisma
model NotaFiscal {
  id                String   @id @default(cuid())
  arquivo           String   // URL do arquivo
  nomeArquivo       String   // Nome original do arquivo
  fornecedor        String?
  numeroNF          String?
  dataEmissao       DateTime?
  valorTotal        Decimal? @db.Decimal(10, 2)
  status            String   @default("processando") // processando, processado, erro
  dadosExtraidos    Json?    // JSON com dados extraídos pela IA
  erroMensagem      String?  // Mensagem de erro se status = erro
  itensProcessados  Int      @default(0)
  itensAtualizados  Int      @default(0)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  userId            String
  user              User     @relation(fields: [userId], references: [id])
  atualizacoes      AtualizacaoCusto[]
}
```

#### 2. AtualizacaoCusto
```prisma
model AtualizacaoCusto {
  id                String   @id @default(cuid())
  notaFiscalId      String?
  notaFiscal        NotaFiscal? @relation(fields: [notaFiscalId], references: [id])
  materiaPrimaId    String
  materiaPrima      MateriaPrima @relation(fields: [materiaPrimaId], references: [id])
  custoAnterior     Decimal  @db.Decimal(10, 2)
  custoNovo         Decimal  @db.Decimal(10, 2)
  percentualMudanca Decimal  @db.Decimal(5, 2)
  motivo            String   @default("IA") // "IA", "Manual", "Reajuste"
  confirmado        Boolean  @default(false)
  createdAt         DateTime @default(now())
  userId            String
  user              User     @relation(fields: [userId], references: [id])
}
```

### Migration
- **Arquivo**: `prisma/migrations/20251127030928_add_prezzo_ai_models/migration.sql`
- **Status**: ✅ Aplicada com sucesso

---

## 🧠 Processamento com IA

### Biblioteca Claude AI
- **Package**: `@anthropic-ai/sdk`
- **Modelo**: Claude 3.5 Sonnet (`claude-3-5-sonnet-20241022`)
- **Arquivo**: `src/lib/claude-nf-processor.ts`

### Capacidades de Extração

A IA extrai automaticamente:
- ✅ Nome do Fornecedor
- ✅ Número da Nota Fiscal
- ✅ Data de Emissão (formato YYYY-MM-DD)
- ✅ Valor Total
- ✅ Lista de Itens com:
  - Descrição do produto
  - Quantidade
  - Unidade de medida (normalizada)
  - Valor unitário
  - Valor total do item

### Normalização de Unidades

O sistema normaliza automaticamente diferentes formatos de unidades:

```typescript
// Metro
"m", "mt", "mts", "metro", "metros" → "metro"

// Quilograma
"kg", "kilo", "quilograma", "quilogramas" → "kg"

// Litro
"l", "lt", "lts", "litro", "litros" → "litro"

// Unidade
"un", "und", "unid", "unidade", "pc", "pç", "peça" → "unidade"

// Caixa
"cx", "caixa", "caixas" → "caixa"
```

---

## 🔍 Sistema de Matching Inteligente

### Algoritmo de Matching

O sistema tenta encontrar matérias-primas em 3 níveis:

#### 1. Match Exato
```typescript
// Busca por nome exato (case-insensitive)
nome: { equals: descricao, mode: "insensitive" }
```

#### 2. Match Parcial
```typescript
// Busca por nome que contenha a descrição + mesma unidade
nome: { contains: descricao, mode: "insensitive" }
unidadeMedida: unidade
```

#### 3. Match por Palavras-Chave
```typescript
// Extrai palavras com mais de 3 caracteres
// Busca cada palavra individualmente
palavrasChave.forEach(palavra => {
  nome: { contains: palavra, mode: "insensitive" }
  unidadeMedida: unidade
})
```

---

## 📁 Arquivos Criados

### 1. Backend - APIs

#### `src/lib/claude-nf-processor.ts`
Processador principal que integra com Claude AI para extrair dados de PDFs.

**Principais funções:**
- `processarNotaFiscal(pdfText: string): Promise<NFDadosExtraidos>`
- `normalizarUnidade(unidade: string): string`

#### `src/app/api/notas-fiscais/route.ts`
API principal para upload e listagem de notas fiscais.

**Endpoints:**
- `POST /api/notas-fiscais` - Upload de PDF
- `GET /api/notas-fiscais` - Lista todas as NFs do usuário

**Fluxo de processamento:**
1. Recebe arquivo PDF via FormData
2. Cria registro inicial no banco (status: "processando")
3. Extrai texto do PDF usando `pdf-parse`
4. Processa com Claude AI
5. Faz matching com matérias-primas
6. Cria registros de atualizações de custo
7. Atualiza status para "processado" ou "erro"

#### `src/app/api/notas-fiscais/[id]/route.ts`
Operações individuais de notas fiscais.

**Endpoints:**
- `GET /api/notas-fiscais/[id]` - Detalhes de uma NF
- `DELETE /api/notas-fiscais/[id]` - Deletar NF

#### `src/app/api/notas-fiscais/[id]/confirmar/route.ts`
Confirmação de atualizações de custo.

**Endpoint:**
- `POST /api/notas-fiscais/[id]/confirmar`

**Body:**
```json
{
  "atualizacaoIds": ["id1", "id2", "id3"]
}
```

**Ações realizadas ao confirmar:**
1. Atualiza `custoUnitario` da matéria-prima
2. Cria registro em `HistoricoCusto`
3. Marca atualização como confirmada
4. Recalcula automaticamente preços de produtos afetados

**Recálculo de Produtos:**
- Identifica todas as variações que usam as matérias-primas atualizadas
- Recalcula custo total da composição
- Atualiza `custoCalculado` e `precoVenda` de cada item produto

#### `src/app/api/alertas/custos/route.ts`
API de alertas para dashboard.

**Endpoint:**
- `GET /api/alertas/custos`

**Retorno:**
```json
{
  "resumo": {
    "totalAtualizacoes": 15,
    "altoImpacto": 3,    // >20%
    "medioImpacto": 7,   // 10-20%
    "baixoImpacto": 5,   // <10%
    "notasFiscaisPendentes": 2
  },
  "atualizacoes": [...],  // Top 20 atualizações
  "notasFiscais": [...]   // Top 5 NFs com atualizações pendentes
}
```

### 2. Frontend - Páginas

#### `src/app/(dashboard)/prezzo-ai/page.tsx`
Página principal do Prezzo AI.

**Componentes:**
- Upload de arquivos PDF
- 5 Cards de estatísticas:
  - Total de NFs processadas
  - NFs processadas com sucesso
  - NFs em processamento
  - NFs com erro
  - Total de itens atualizados
- Tabela de histórico de notas fiscais
- Botão "Revisar" para NFs com atualizações pendentes

**Recursos:**
- Upload drag-and-drop (input file)
- Validação de tipo de arquivo (apenas PDF)
- Atualização automática da lista após upload
- Filtros visuais por status
- Link direto para página de revisão

#### `src/app/(dashboard)/prezzo-ai/[id]/page.tsx`
Página de revisão de atualizações.

**Seções:**

1. **Informações da NF**
   - Fornecedor, Número, Data, Valor Total
   - Itens processados vs. atualizações detectadas
   - Usuário que processou

2. **Atualizações Pendentes** (card laranja)
   - Checkbox para seleção individual
   - Botão "Selecionar Todas / Desmarcar Todas"
   - Tabela com:
     - Matéria-prima
     - Código
     - Unidade
     - Custo atual vs. novo
     - Variação percentual com ícone (↑ vermelho / ↓ verde)
     - Badge de impacto (Alto/Médio/Baixo)
   - Botão "Confirmar X Selecionada(s)"

3. **Atualizações Confirmadas** (card verde)
   - Histórico de atualizações já aplicadas
   - Apenas visualização

**Recursos:**
- Seleção múltipla com checkboxes
- Confirmação em lote
- Indicadores visuais de impacto
- Confirmação antes de aplicar

### 3. Frontend - Componentes

#### `src/components/ui/checkbox.tsx`
Componente de checkbox usando Radix UI.

**Package**: `@radix-ui/react-checkbox`

#### `src/components/dashboard/alertas-custos-widget.tsx`
Widget de alertas para dashboard.

**Visualização:**
- Card com borda laranja quando há alertas
- 3 mini-cards com contadores por nível de impacto:
  - Alto (>20%) - vermelho
  - Médio (10-20%) - laranja
  - Baixo (<10%) - azul
- Lista das 5 principais atualizações com:
  - Nome da matéria-prima
  - Fornecedor/NF de origem
  - Custo anterior (riscado) e novo
  - Percentual de variação com ícone
- Alerta de NFs aguardando revisão
- Botão "Ver Todas" linkando para `/prezzo-ai`

---

## 🎨 Interface do Usuário

### Fluxo de Uso

1. **Upload de NF**
   - Usuário acessa `/prezzo-ai`
   - Clica em "Upload Nota Fiscal"
   - Seleciona arquivo PDF
   - Sistema processa automaticamente em background

2. **Processamento**
   - Status muda para "Processando" (ícone de relógio)
   - IA extrai dados da NF
   - Sistema faz matching com matérias-primas
   - Identifica diferenças de custo

3. **Revisão**
   - Card de alerta aparece no dashboard
   - Usuário clica em "Revisar" na página Prezzo AI
   - Vê todas as atualizações sugeridas
   - Seleciona quais confirmar
   - Clica em "Confirmar X Selecionada(s)"

4. **Confirmação**
   - Custos são atualizados no banco
   - Histórico é registrado
   - Preços de produtos são recalculados automaticamente
   - Atualizações marcadas como confirmadas

### Indicadores Visuais

#### Status de NF
- 🔵 **Processando** - Azul, ícone Clock
- 🟢 **Processado** - Verde, ícone CheckCircle2
- 🔴 **Erro** - Vermelho, ícone XCircle

#### Nível de Impacto
- 🔴 **Alto** - Badge vermelho, >20%
- 🟠 **Médio** - Badge laranja, 10-20%
- 🔵 **Baixo** - Badge azul, <10%

#### Variação de Preço
- ↑ **Aumento** - Vermelho, TrendingUp
- ↓ **Redução** - Verde, TrendingDown

---

## 🔧 Configuração

### Variáveis de Ambiente

```bash
# .env
CLAUDE_API_KEY="sk-ant-..."
```

**Importante:** O usuário precisa adicionar sua própria chave da API do Claude.

### Dependências Instaladas

```json
{
  "@anthropic-ai/sdk": "^0.39.0",
  "pdf-parse": "^1.1.1",
  "@radix-ui/react-checkbox": "^1.1.2"
}
```

---

## 📊 Impacto nos Produtos

### Recálculo Automático

Quando custos são confirmados, o sistema:

1. Identifica todas as `ComposicaoProduto` que usam as matérias-primas atualizadas
2. Para cada `VariacaoProduto` afetada:
   - Recalcula o custo total da composição
   - Atualiza todos os `ItemProduto` vinculados
   - Recalcula `precoVenda` aplicando a margem de lucro

**Fórmula:**
```typescript
custoTotal = Σ (quantidade × custoUnitarioMateria)
precoVenda = custoTotal × (1 + margemLucro / 100)
```

### Cascata de Atualizações

```
NotaFiscal
  └─> AtualizacaoCusto (confirmada)
      └─> MateriaPrima.custoUnitario (atualizado)
          └─> HistoricoCusto (registrado)
          └─> ComposicaoProduto (afetada)
              └─> VariacaoProduto (recalculada)
                  └─> ItemProduto (preço atualizado)
                      └─> Orçamentos futuros (usam novo preço)
```

---

## 🎯 Próximos Passos Sugeridos (Fase 3)

1. **Upload para S3/Cloud Storage**
   - Atualmente, apenas o nome do arquivo é armazenado
   - Implementar upload real para AWS S3 ou similar

2. **Fila de Processamento**
   - Implementar Bull/BullMQ para processar NFs em fila
   - Evitar timeout em uploads grandes

3. **Notificações em Tempo Real**
   - WebSockets ou Server-Sent Events
   - Notificar quando processamento terminar

4. **Suporte a XML (NF-e)**
   - Adicionar parser de XML
   - Extrair dados diretamente do XML estruturado

5. **Machine Learning para Matching**
   - Treinar modelo para melhorar precisão do matching
   - Aprender com confirmações/rejeições do usuário

6. **Dashboard de IA**
   - Gráficos de evolução de custos
   - Análise de tendências
   - Previsão de custos futuros

7. **Exportação de Relatórios**
   - Relatório de atualizações de custo
   - Análise de fornecedores
   - Histórico de variações

---

## ✅ Checklist de Implementação

- [x] Modelo de banco de dados (NotaFiscal, AtualizacaoCusto)
- [x] Migration aplicada
- [x] Integração com Claude AI SDK
- [x] Parser de PDF (pdf-parse)
- [x] API de upload de NF
- [x] Processamento em background
- [x] Extração inteligente de dados
- [x] Normalização de unidades
- [x] Sistema de matching (3 níveis)
- [x] API de confirmação de atualizações
- [x] Recálculo automático de produtos
- [x] Página principal Prezzo AI
- [x] Página de revisão de atualizações
- [x] Sistema de alertas
- [x] Widget de alertas no dashboard
- [x] Componente Checkbox (Radix UI)
- [x] Menu de navegação atualizado
- [x] Documentação completa

---

## 🚀 Status Final

**FASE 2 - PREZZO AI: 100% COMPLETA** ✅

O sistema está pronto para processar notas fiscais automaticamente, extrair dados com IA, fazer matching inteligente de produtos e atualizar custos com confirmação do usuário.

Todos os componentes foram implementados e testados. A aplicação está rodando sem erros na porta 8001.

---

**Data de Conclusão:** 27/11/2025
**Modelo IA Utilizado:** Claude 3.5 Sonnet
**Desenvolvido por:** Claude Code Assistant

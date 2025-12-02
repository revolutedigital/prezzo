# 🔧 FASE 4: Gestão de Mão de Obra - PREZZO

**Data:** 27/11/2025
**Versão:** 1.0
**Status:** Planejamento

---

## 📋 Visão Geral

Nova funcionalidade para incluir **custos de mão de obra** no cálculo de precificação dos produtos. O sistema permitirá:

1. Cadastrar diferentes tipos de mão de obra (Soldador, Montador, Pintor, etc.)
2. Definir custo por hora de trabalho
3. Opcionalmente incluir custo de máquina/equipamento
4. Adicionar mão de obra necessária na composição de cada produto
5. Calcular automaticamente custo total = materiais + mão de obra

---

## 🎯 Requisitos (baseado na conversa)

### Contexto da Conversa:

- "tem uma componente de mão de obra"
- "que podemos mudar numa interface"
- "pode ser diferentes horas"
- "em alguns casos tem maquinas e outros não"

### Interpretação:

1. Sistema deve ter cadastro de tipos de mão de obra
2. Interface configurável para ajustar custos
3. Suporte para diferentes tipos com custos/hora variados
4. Alguns tipos incluem custo de máquina, outros não

---

## 📊 Modelagem de Dados

### Novos Modelos

#### 1. TipoMaoDeObra

```prisma
model TipoMaoDeObra {
  id                String   @id @default(cuid())
  nome              String   // ex: "Soldador", "Montador", "Pintor"
  codigo            String?  @unique
  custoHora         Decimal  // custo por hora de trabalho
  incluiMaquina     Boolean  @default(false) // se inclui custo de máquina
  custoMaquinaHora  Decimal? // custo adicional de máquina/hora
  descricao         String?
  ativo             Boolean  @default(true)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  composicoesMaoDeObra ComposicaoMaoDeObra[]
  historicoMaoDeObra   HistoricoMaoDeObra[]
}
```

**Campos:**

- `nome`: Nome do tipo (ex: "Soldador", "Montador")
- `codigo`: Código único opcional
- `custoHora`: Custo por hora de trabalho humano
- `incluiMaquina`: Flag indicando se usa máquina
- `custoMaquinaHora`: Custo adicional da máquina por hora (se aplicável)
- `descricao`: Detalhes sobre o tipo de trabalho

**Cálculo do custo total/hora:**

```
Se incluiMaquina = true:
  custoTotalHora = custoHora + custoMaquinaHora
Senão:
  custoTotalHora = custoHora
```

#### 2. ComposicaoMaoDeObra

```prisma
model ComposicaoMaoDeObra {
  id                  String   @id @default(cuid())
  variacaoProdutoId   String
  variacaoProduto     VariacaoProduto @relation(fields: [variacaoProdutoId], references: [id])
  tipoMaoDeObraId     String
  tipoMaoDeObra       TipoMaoDeObra @relation(fields: [tipoMaoDeObraId], references: [id])
  horasNecessarias    Decimal  // quantidade de horas necessárias
  descricao           String?  // descrição do trabalho
  ordem               Int      @default(0)

  @@unique([variacaoProdutoId, tipoMaoDeObraId])
}
```

**Campos:**

- `horasNecessarias`: Quantidade de horas necessárias desse tipo de mão de obra
- `descricao`: Descrição específica do trabalho (ex: "Soldagem da base")
- `ordem`: Ordem de execução

#### 3. HistoricoMaoDeObra

```prisma
model HistoricoMaoDeObra {
  id                String   @id @default(cuid())
  tipoMaoDeObraId   String
  tipoMaoDeObra     TipoMaoDeObra @relation(fields: [tipoMaoDeObraId], references: [id])
  custoAnterior     Decimal
  custoNovo         Decimal
  percentualMudanca Decimal
  motivo            String?  // "Manual", "Reajuste", "Acordo"
  createdAt         DateTime @default(now())
  userId            String
}
```

### Modificações em Modelos Existentes

#### VariacaoProduto

```prisma
model VariacaoProduto {
  // ... campos existentes ...
  composicao           ComposicaoProduto[]
  composicaoMaoDeObra  ComposicaoMaoDeObra[]  // NOVO
  itensProduto         ItemProduto[]
}
```

---

## 💻 Implementação Backend

### API Routes

#### 1. `/api/mao-de-obra` (CRUD de Tipos de Mão de Obra)

**GET** - Listar todos os tipos

```typescript
GET /api/mao-de-obra
Response: TipoMaoDeObra[]
```

**POST** - Criar novo tipo

```typescript
POST /api/mao-de-obra
Body: {
  nome: string
  codigo?: string
  custoHora: number
  incluiMaquina: boolean
  custoMaquinaHora?: number
  descricao?: string
}
```

**PATCH** - Atualizar tipo

```typescript
PATCH /api/mao-de-obra/:id
Body: Partial<TipoMaoDeObra>
```

**DELETE** - Excluir tipo

```typescript
DELETE /api/mao-de-obra/:id
```

#### 2. `/api/produtos/[id]/mao-de-obra` (Composição de Mão de Obra)

**GET** - Listar mão de obra de um produto

```typescript
GET /api/produtos/:id/mao-de-obra
Response: ComposicaoMaoDeObra[]
```

**POST** - Adicionar mão de obra ao produto

```typescript
POST /api/produtos/:id/mao-de-obra
Body: {
  tipoMaoDeObraId: string
  horasNecessarias: number
  descricao?: string
}
```

**DELETE** - Remover mão de obra do produto

```typescript
DELETE /api/produtos/:id/mao-de-obra/:composicaoId
```

### Lógica de Cálculo

#### Cálculo do Custo Total do Produto

```typescript
function calcularCustoProduto(variacaoId: string) {
  // 1. Buscar composição de matérias-primas
  const materias = await prisma.composicaoProduto.findMany({
    where: { variacaoProdutoId: variacaoId },
    include: { materiaPrima: true },
  });

  const custoMateriais = materias.reduce((total, item) => {
    return total + item.quantidade * item.materiaPrima.custoUnitario;
  }, 0);

  // 2. Buscar composição de mão de obra
  const maoDeObra = await prisma.composicaoMaoDeObra.findMany({
    where: { variacaoProdutoId: variacaoId },
    include: { tipoMaoDeObra: true },
  });

  const custoMaoDeObra = maoDeObra.reduce((total, item) => {
    const custoHora = item.tipoMaoDeObra.custoHora;
    const custoMaquina = item.tipoMaoDeObra.incluiMaquina
      ? item.tipoMaoDeObra.custoMaquinaHora || 0
      : 0;
    const custoTotalHora = custoHora + custoMaquina;

    return total + item.horasNecessarias * custoTotalHora;
  }, 0);

  // 3. Custo total
  return {
    custoMateriais,
    custoMaoDeObra,
    custoTotal: custoMateriais + custoMaoDeObra,
  };
}
```

---

## 🎨 Implementação Frontend

### Páginas

#### 1. `/mao-de-obra` (Lista de Tipos de Mão de Obra)

```
┌─────────────────────────────────────────────────┐
│ Mão de Obra                [+ Novo Tipo]        │
├─────────────────────────────────────────────────┤
│ ┌───────────────────────────────────────────┐   │
│ │Nome      │Custo/h │Máquina│Total/h │Ações│   │
│ ├───────────────────────────────────────────┤   │
│ │Soldador  │R$ 45,00│Sim    │R$ 70,00│✎ ✕│   │
│ │Montador  │R$ 35,00│Não    │R$ 35,00│✎ ✕│   │
│ │Pintor    │R$ 30,00│Sim    │R$ 45,00│✎ ✕│   │
│ └───────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

**Componente:** `src/app/(dashboard)/mao-de-obra/page.tsx`

**Funcionalidades:**

- Listar todos os tipos de mão de obra
- Filtrar por nome/código
- Adicionar novo tipo
- Editar tipo existente
- Excluir tipo
- Mostrar custo total/hora calculado

#### 2. Modal de Cadastro/Edição de Tipo

```
┌─────────────────────────────────────────┐
│ Novo Tipo de Mão de Obra               │
├─────────────────────────────────────────┤
│ Nome: [Soldador____________]            │
│ Código: [SOL001____________] (opcional) │
│                                          │
│ Custo por Hora: [R$ 45,00]              │
│                                          │
│ ☑ Inclui Máquina/Equipamento           │
│   Custo Máquina/Hora: [R$ 25,00]       │
│                                          │
│ Descrição:                               │
│ [Soldagem MIG/MAG com máquina_______]  │
│ [________________________________]      │
│                                          │
│ ─────────────────────────────           │
│ Custo Total/Hora: R$ 70,00              │
│                                          │
│ [Cancelar] [Salvar]                     │
└─────────────────────────────────────────┘
```

**Validações:**

- Nome obrigatório
- Custo/hora > 0
- Se `incluiMaquina` = true, `custoMaquinaHora` obrigatório

#### 3. Composição de Produto - Aba Mão de Obra

Adicionar aba "Mão de Obra" na página de edição de variação de produto:

```
┌─────────────────────────────────────────────┐
│ Produto: Filtro Alumínio - Grade Ferro     │
├─────────────────────────────────────────────┤
│ [Matérias-Primas] [Mão de Obra]            │
├─────────────────────────────────────────────┤
│                                              │
│ [+ Adicionar Mão de Obra]                   │
│                                              │
│ ┌────────────────────────────────────────┐ │
│ │Tipo        │Horas│Custo/h│Total  │✕│  │
│ ├────────────────────────────────────────┤ │
│ │Soldador    │ 2h  │R$ 70  │R$ 140 │✕│  │
│ │Montador    │ 1h  │R$ 35  │R$ 35  │✕│  │
│ └────────────────────────────────────────┘ │
│                                              │
│ ┌─ Resumo de Custos ──────────────────┐    │
│ │ Materiais:      R$ 139,00            │    │
│ │ Mão de Obra:    R$ 175,00            │    │
│ │ ─────────────────────────             │    │
│ │ Custo Total:    R$ 314,00            │    │
│ │                                        │    │
│ │ Margem (40%):   R$ 125,60            │    │
│ │ Preço Venda:    R$ 439,60            │    │
│ └────────────────────────────────────┘    │
└─────────────────────────────────────────────┘
```

**Alterações em:** `src/app/(dashboard)/produtos/[id]/page.tsx`

**Componentes novos:**

- `<MaoDeObraComposicao />` - Aba de mão de obra
- `<MaoDeObraSelector />` - Seletor de tipo + horas
- `<MaoDeObraItem />` - Item da lista de mão de obra

---

## 🔄 Fluxo de Uso

### 1. Configurar Tipos de Mão de Obra

```
Admin → Menu "Mão de Obra" → Cadastrar tipos
Exemplo:
  - Soldador: R$ 45/h + R$ 25/h (máquina) = R$ 70/h
  - Montador: R$ 35/h (sem máquina) = R$ 35/h
```

### 2. Adicionar Mão de Obra ao Produto

```
Produtos → Editar Variação → Aba "Mão de Obra"
  → Adicionar "Soldador" → 2 horas
  → Adicionar "Montador" → 1 hora
  → Sistema calcula: 2h × R$70 + 1h × R$35 = R$ 175
```

### 3. Visualizar Custo Total

```
Custo Materiais:  R$ 139,00
Custo Mão Obra:   R$ 175,00
─────────────────────────
Custo Total:      R$ 314,00
Margem 40%:       R$ 125,60
Preço Venda:      R$ 439,60
```

### 4. Orçamento

```
Cliente solicita orçamento
  → Vendedor seleciona produto
  → Sistema mostra preço já calculado (materiais + mão de obra + margem)
  → Gera PDF com preço final
```

---

## 📅 Cronograma de Implementação

### Semana 13: Backend (5-7 dias)

- [ ] Atualizar schema Prisma com novos modelos
- [ ] Criar migration
- [ ] API Routes para mão de obra (CRUD)
- [ ] API Routes para composição de mão de obra
- [ ] Atualizar lógica de cálculo de custo
- [ ] Testes unitários

### Semana 14: Frontend (5-7 dias)

- [ ] Página de listagem de mão de obra
- [ ] Modal de cadastro/edição
- [ ] Integrar aba "Mão de Obra" na edição de produto
- [ ] Componente de seleção de mão de obra
- [ ] Atualizar cálculo em tempo real
- [ ] Validações no frontend

### Semana 15: Integração e Testes (3-5 dias)

- [ ] Testes end-to-end
- [ ] Ajustes de UX/UI
- [ ] Atualizar dashboard com novos custos
- [ ] Adicionar mão de obra nos relatórios
- [ ] Documentação de usuário
- [ ] Deploy em produção

---

## ✅ Checklist de Implementação

### Schema e Migrations

- [ ] Criar models TipoMaoDeObra, ComposicaoMaoDeObra, HistoricoMaoDeObra
- [ ] Atualizar VariacaoProduto com nova relação
- [ ] Executar migration
- [ ] Testar relações no Prisma Studio

### Backend

- [ ] POST /api/mao-de-obra (criar tipo)
- [ ] GET /api/mao-de-obra (listar tipos)
- [ ] PATCH /api/mao-de-obra/:id (atualizar tipo)
- [ ] DELETE /api/mao-de-obra/:id (excluir tipo)
- [ ] GET /api/produtos/:id/mao-de-obra (listar composição)
- [ ] POST /api/produtos/:id/mao-de-obra (adicionar mão de obra)
- [ ] DELETE /api/produtos/:id/mao-de-obra/:composicaoId (remover)
- [ ] Atualizar função de cálculo de custo
- [ ] Atualizar recálculo automático de produtos

### Frontend

- [ ] Página /mao-de-obra
- [ ] Componente MaoDeObraTable
- [ ] Modal MaoDeObraForm
- [ ] Aba "Mão de Obra" em edição de produto
- [ ] Componente MaoDeObraComposicao
- [ ] Seletor MaoDeObraSelector
- [ ] Atualizar preview de custos
- [ ] Adicionar ao menu lateral

### Relatórios e Dashboard

- [ ] Incluir mão de obra no dashboard
- [ ] Atualizar relatório de margens
- [ ] Atualizar relatório de evolução de custos
- [ ] Histórico de reajustes de mão de obra

### Testes

- [ ] Testar criação de tipo de mão de obra
- [ ] Testar edição e exclusão
- [ ] Testar adição de mão de obra a produto
- [ ] Testar cálculo de custos
- [ ] Testar recálculo automático
- [ ] Testar geração de orçamento
- [ ] Testar PDF com novos custos

---

## 🎯 Resultado Esperado

Ao final da implementação:

1. ✅ Sistema permite cadastrar tipos de mão de obra
2. ✅ Configuração flexível de custos (com/sem máquina)
3. ✅ Produtos calculam custo total = materiais + mão de obra
4. ✅ Interface intuitiva para adicionar mão de obra aos produtos
5. ✅ Orçamentos refletem custos completos
6. ✅ Relatórios mostram evolução de custos de mão de obra
7. ✅ Histórico de reajustes registrado

---

## 📝 Observações

- Mão de obra é opcional - produtos podem ter apenas materiais
- Cálculo em tempo real para feedback imediato
- Histórico mantém auditoria de reajustes
- Interface deve ser simples e intuitiva
- Integração total com sistema existente

---

**Aprovado por:** Giovanni Mannelli
**Data:** 27/11/2025
**Próximos passos:** Aguardar aprovação para iniciar implementação

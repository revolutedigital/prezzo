# 🎯 Plano de Desenvolvimento - PREZZO
## Sistema Inteligente de Precificação

---

## 🎨 Identidade do Produto

**Nome:** Prezzo
**Tagline:** "Precificação inteligente, automática e precisa"
**Posicionamento:** Software de precificação para indústrias e empresas que trabalham com produtos compostos e múltiplas variações

### Conceito Visual:
- **Cores:** Azul profissional + Verde (crescimento/lucro) + Branco
- **Estilo:** Moderno, clean, profissional
- **Tipografia:** Sans-serif moderna (Inter ou Manrope)
- **Ícone:** Letra P estilizada ou símbolo de calculadora/preço

---

## 📋 Visão Geral do Prezzo

### Problema que resolve:
Empresas que fabricam produtos com múltiplas variações (como filtros de alumínio com diferentes tipos de grade) enfrentam dificuldade para:

- Calcular custos precisos considerando todas as matérias-primas
- Manter preços atualizados conforme oscilação de insumos
- Gerar orçamentos rápidos com margens corretas
- Rastrear mudanças de custos ao longo do tempo

### Solução - Prezzo:
Sistema que automatiza o cálculo de custos baseado na composição de produtos, atualiza preços via IA através de notas fiscais e gera orçamentos profissionais em segundos.

---

## 🎯 Funcionalidades Principais do Prezzo

### 1. Gestão de Matérias-Primas

**O que faz:**
- Cadastro completo de todos os materiais/insumos
- Definição de custo unitário e unidade de medida
- Histórico de preços com gráfico de evolução
- Associação com fornecedores
- Alertas de variação de preço

**Telas:**
- Lista de matérias-primas (tabela com filtros)
- Cadastro/edição de material
- Detalhes do material (com histórico)

---

### 1.5. Gestão de Mão de Obra (NOVA FUNCIONALIDADE)

**O que faz:**
- Cadastro de tipos de mão de obra (Soldador, Montador, Pintor, etc.)
- Definição de custo por hora de trabalho
- Opção de incluir custo de máquina/equipamento
- Custo adicional de máquina por hora (quando aplicável)
- Histórico de reajustes de custos de mão de obra
- Interface configurável para ajustar valores

**Exemplo prático:**
```
Tipo: Soldador
Custo/hora: R$ 45,00
Inclui máquina: Sim
Custo máquina/hora: R$ 25,00
Custo total/hora: R$ 70,00

Tipo: Montador
Custo/hora: R$ 35,00
Inclui máquina: Não
Custo total/hora: R$ 35,00
```

**Telas:**
- Lista de tipos de mão de obra (tabela com filtros)
- Cadastro/edição de tipo de mão de obra
- Configuração de custos (com/sem máquina)
- Histórico de reajustes

---

### 2. Cadastro de Produtos e Variações

**O que faz:**
- Criação de tipos de produto (ex: Filtro de Alumínio)
- Definição de variações (ex: com grade de ferro, cobre, inox)
- Composição: lista de matérias-primas + quantidades
- **NOVO:** Composição de mão de obra + horas necessárias
- Cálculo automático de custo total (materiais + mão de obra)
- Aplicação de margem de lucro configurável
- Preço de venda sugerido

**Exemplo prático:**
```
Produto: Filtro de Alumínio - Grade de Ferro

MATÉRIAS-PRIMAS:
- Filtro de alumínio: 2 metros × R$ 45/m = R$ 90
- Grade de ferro: 1.5 metros × R$ 30/m = R$ 45
- Parafusos: 8 unidades × R$ 0,50/un = R$ 4
Subtotal Materiais: R$ 139

MÃO DE OBRA:
- Soldador (com máquina): 2h × R$ 70/h = R$ 140
- Montador: 1h × R$ 35/h = R$ 35
Subtotal Mão de Obra: R$ 175

= Custo Total: R$ 314
+ Margem 40% = R$ 439,60 (preço sugerido)
```

**Telas:**
- Lista de tipos de produto
- Cadastro de tipo de produto
- Gestão de variações
- Composição de matérias-primas (arrastar materiais)
- **NOVO:** Composição de mão de obra (adicionar tipos + horas)
- Preview de cálculo em tempo real (materiais + mão de obra)

---

### 3. Sistema de Orçamentos

**O que faz:**
- Criação rápida de orçamentos
- Busca inteligente de produtos
- Seleção de variações específicas
- Ajuste de quantidades
- Aplicação de descontos
- Múltiplas tabelas de preço (varejo, atacado, especial)
- Cálculo automático de totais
- Geração de PDF profissional
- Envio por email/WhatsApp

**Telas:**
- Lista de orçamentos (com status)
- Criar novo orçamento
- Editor de orçamento (adicionar produtos)
- Preview e geração de PDF
- Histórico de orçamentos por cliente

---

### 4. Prezzo AI - Atualização Automática de Custos

**O diferencial do sistema:**
- Upload de notas fiscais (PDF ou XML)
- IA extrai automaticamente: fornecedor, produtos, valores, quantidades
- Sistema faz matching com matérias-primas cadastradas
- Sugere atualização de custos
- Você confirma ou ajusta
- Histórico completo de atualizações

**Fluxo:**
1. Você recebe NF do fornecedor
2. Upload no Prezzo
3. IA processa e extrai dados
4. Sistema mostra: "Material X estava R$ 45, agora R$ 48 (+6,7%)"
5. Você confirma
6. Todos os produtos que usam esse material são recalculados
7. Alerta se margem ficou abaixo do esperado

**Telas:**
- Upload de NF (drag & drop)
- Preview da extração da IA
- Confirmação de atualizações
- Relatório de impacto nos produtos

---

### 5. Dashboards e Relatórios

**O que mostra:**
- Evolução de custos (gráficos)
- Margem média por produto
- Produtos mais vendidos
- Produtos com margem baixa (alertas)
- Comparativo de fornecedores
- Resumo de orçamentos (aprovados, pendentes, perdidos)

**Telas:**
- Dashboard principal (KPIs)
- Relatório de margens
- Relatório de evolução de custos
- Análise de rentabilidade

---

## 🏗️ Arquitetura Técnica do Prezzo

### Stack Tecnológico

**Frontend:**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui (componentes)
- React Hook Form + Zod (validação)
- Recharts (gráficos)
- TanStack Table (tabelas)

**Backend:**
- Next.js API Routes
- Prisma ORM
- PostgreSQL (Supabase)
- NextAuth (autenticação)

**IA/Automação:**
- Anthropic Claude API (extração de NF)
- Vercel AI SDK
- PDF.js (parsing de PDF)

**Infraestrutura:**
- Vercel (deploy e hosting)
- Supabase (PostgreSQL + Storage)
- Cloudflare R2 ou S3 (armazenamento de NFs)

**Features Extras:**
- PWA (funciona offline)
- Dark mode
- Multi-idioma (PT/EN/ES)

---

## 📊 Modelagem de Dados do Prezzo

### Schema Principal

```prisma
// Matérias-primas e insumos
model MateriaPrima {
  id                String   @id @default(cuid())
  nome              String
  codigo            String?  @unique
  unidadeMedida     String   // metro, kg, unidade, litro
  custoUnitario     Decimal
  fornecedor        String?
  categoria         String?
  ativo             Boolean  @default(true)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  composicoes       ComposicaoProduto[]
  historicoCustos   HistoricoCusto[]
}

// Tipos de Mão de Obra (nova funcionalidade)
model TipoMaoDeObra {
  id                String   @id @default(cuid())
  nome              String   // ex: "Soldador", "Montador", "Pintor"
  codigo            String?  @unique
  custoHora         Decimal  // custo por hora
  incluiMaquina     Boolean  @default(false) // se inclui custo de máquina
  custoMaquinaHora  Decimal? // custo adicional de máquina por hora (se aplicável)
  descricao         String?
  ativo             Boolean  @default(true)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  composicoesMaoDeObra ComposicaoMaoDeObra[]
  historicoMaoDeObra   HistoricoMaoDeObra[]
}

// Histórico de mudanças de custo de mão de obra
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

// Histórico de mudanças de custo
model HistoricoCusto {
  id                String   @id @default(cuid())
  materiaPrimaId    String
  materiaPrima      MateriaPrima @relation(fields: [materiaPrimaId], references: [id])
  custoAnterior     Decimal
  custoNovo         Decimal
  percentualMudanca Decimal
  motivo            String?  // "NF", "Manual", "Reajuste"
  notaFiscalId      String?
  createdAt         DateTime @default(now())
  userId            String
}

// Tipos de produto base
model TipoProduto {
  id          String   @id @default(cuid())
  nome        String
  codigo      String?  @unique
  categoria   String?
  descricao   String?
  ativo       Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  variacoes   VariacaoProduto[]
}

// Variações do produto (ex: Grade de Ferro, Cobre, etc)
model VariacaoProduto {
  id              String   @id @default(cuid())
  tipoProdutoId   String
  tipoProduto     TipoProduto @relation(fields: [tipoProdutoId], references: [id])
  nome            String
  codigo          String?  @unique
  sku             String?
  descricao       String?
  margemPadrao    Decimal  @default(0) // % de margem padrão
  ativo           Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  composicao           ComposicaoProduto[]
  composicaoMaoDeObra  ComposicaoMaoDeObra[]
  itensProduto         ItemProduto[]
}

// Composição: quais matérias-primas formam cada variação
model ComposicaoProduto {
  id                  String   @id @default(cuid())
  variacaoProdutoId   String
  variacaoProduto     VariacaoProduto @relation(fields: [variacaoProdutoId], references: [id])
  materiaPrimaId      String
  materiaPrima        MateriaPrima @relation(fields: [materiaPrimaId], references: [id])
  quantidade          Decimal
  unidade             String
  ordem               Int      @default(0)

  @@unique([variacaoProdutoId, materiaPrimaId])
}

// Composição de Mão de Obra: quais tipos de mão de obra são necessários para cada produto
model ComposicaoMaoDeObra {
  id                  String   @id @default(cuid())
  variacaoProdutoId   String
  variacaoProduto     VariacaoProduto @relation(fields: [variacaoProdutoId], references: [id])
  tipoMaoDeObraId     String
  tipoMaoDeObra       TipoMaoDeObra @relation(fields: [tipoMaoDeObraId], references: [id])
  horasNecessarias    Decimal  // quantidade de horas necessárias
  descricao           String?  // descrição do trabalho (ex: "Soldagem da base")
  ordem               Int      @default(0)

  @@unique([variacaoProdutoId, tipoMaoDeObraId])
}

// Produto final pronto para venda (com preço calculado)
model ItemProduto {
  id                  String   @id @default(cuid())
  variacaoProdutoId   String
  variacaoProduto     VariacaoProduto @relation(fields: [variacaoProdutoId], references: [id])
  custoCalculado      Decimal  // calculado automaticamente
  margemLucro         Decimal  // % pode ser diferente do padrão
  precoVenda          Decimal  // calculado automaticamente
  tabelaPreco         String   @default("padrao") // padrao, atacado, especial
  ativo               Boolean  @default(true)
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  itensOrcamento      ItemOrcamento[]
}

// Orçamentos
model Orcamento {
  id              String   @id @default(cuid())
  numero          String   @unique
  clienteNome     String
  clienteEmail    String?
  clienteTelefone String?
  clienteCNPJ     String?
  status          String   @default("rascunho") // rascunho, enviado, aprovado, rejeitado
  validade        DateTime
  observacoes     String?
  desconto        Decimal  @default(0)
  descontoTipo    String   @default("percentual") // percentual ou valor
  subtotal        Decimal
  total           Decimal
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  userId          String

  itens           ItemOrcamento[]
}

// Itens do orçamento
model ItemOrcamento {
  id              String   @id @default(cuid())
  orcamentoId     String
  orcamento       Orcamento @relation(fields: [orcamentoId], references: [id], onDelete: Cascade)
  itemProdutoId   String
  itemProduto     ItemProduto @relation(fields: [itemProdutoId], references: [id])
  descricao       String   // snapshot do nome no momento
  quantidade      Decimal
  precoUnitario   Decimal
  desconto        Decimal  @default(0)
  total           Decimal
  ordem           Int      @default(0)
}

// Notas fiscais processadas pela IA
model NotaFiscal {
  id                String   @id @default(cuid())
  arquivo           String   // URL do arquivo
  fornecedor        String?
  numeroNF          String?
  dataEmissao       DateTime?
  valorTotal        Decimal?
  status            String   @default("processando") // processando, processado, erro
  dadosExtraidos    Json?    // JSON com dados extraídos
  itensProcessados  Int      @default(0)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  userId            String
}

// Usuários
model User {
  id            String   @id @default(cuid())
  nome          String
  email         String   @unique
  senha         String
  empresa       String?
  telefone      String?
  ativo         Boolean  @default(true)
  role          String   @default("user") // admin, user
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

---

## 📅 Cronograma Detalhado - Prezzo

### 🚀 FASE 1: MVP - Core do Sistema (6 semanas)

#### Semana 1-2: Foundation
**Setup e Infraestrutura**
- [ ] Criar projeto Next.js + TypeScript
- [ ] Configurar Tailwind + shadcn/ui
- [ ] Setup PostgreSQL (Supabase)
- [ ] Configurar Prisma
- [ ] Criar schema do banco
- [ ] Sistema de autenticação (NextAuth)
- [ ] Layout base da aplicação
- [ ] Navbar, sidebar, estrutura

**Deliverable:** Aplicação rodando com login funcional

#### Semana 3: Gestão de Matérias-Primas
- [ ] CRUD completo de matérias-primas
- [ ] Tabela com filtros e busca
- [ ] Formulário de cadastro/edição
- [ ] Validações
- [ ] Tela de detalhes do material
- [ ] Início do histórico de custos

**Deliverable:** Módulo de matérias-primas 100% funcional

#### Semana 4: Sistema de Produtos e Variações
- [ ] CRUD de tipos de produto
- [ ] CRUD de variações
- [ ] Interface de composição (arrastar matérias-primas)
- [ ] Cálculo automático de custo
- [ ] Aplicação de margem
- [ ] Preview de preço em tempo real
- [ ] Validações e regras de negócio

**Deliverable:** Sistema de produtos compostos funcionando

#### Semana 5: Sistema de Orçamentos (Parte 1)
- [ ] CRUD de orçamentos
- [ ] Busca e seleção de produtos
- [ ] Adicionar itens ao orçamento
- [ ] Cálculo de totais
- [ ] Aplicação de descontos
- [ ] Sistema de status
- [ ] Validações

**Deliverable:** Criação e edição de orçamentos funcionando

#### Semana 6: Orçamentos (Parte 2) + Polimento
- [ ] Geração de PDF profissional
- [ ] Templates customizáveis
- [ ] Preview do orçamento
- [ ] Lista de orçamentos com filtros
- [ ] Dashboard básico com KPIs
- [ ] Testes e ajustes
- [ ] Correções de bugs

**Deliverable:** MVP completo e funcional

---

### 🤖 FASE 2: Prezzo AI - Automação (3 semanas)

#### Semana 7-8: Integração com IA
- [ ] Setup Claude API
- [ ] Upload de arquivos (PDF/XML)
- [ ] Parser de PDF (extração de texto)
- [ ] Prompts para extração de dados
- [ ] Sistema de matching automático
- [ ] Interface de confirmação
- [ ] Testes com NFs reais

**Deliverable:** Upload e extração de NF funcionando
          
#### Semana 9: Automação de Custos
- [ ] Atualização automática de custos
- [ ] Cálculo de impacto nos produtos
- [ ] Sistema de alertas
- [ ] Histórico completo de mudanças
- [ ] Relatório de variação
- [ ] Notificações
- [ ] Refinamentos e testes

**Deliverable:** Sistema completo de IA funcionando

---

### 📊 FASE 3: Analytics e Melhorias (3 semanas)

#### Semana 10-11: Dashboards e Relatórios
- [ ] Dashboard principal com métricas
- [ ] Gráficos de evolução de custos
- [ ] Relatório de margens por produto
- [ ] Análise de rentabilidade
- [ ] Comparativo de fornecedores
- [ ] Relatório de orçamentos
- [ ] Exportação de dados (Excel/PDF)

**Deliverable:** Sistema completo de analytics

#### Semana 12: Polimento e Lançamento
- [ ] Testes finais end-to-end
- [ ] Ajustes de UX/UI
- [ ] Otimização de performance
- [ ] Documentação de usuário
- [ ] Vídeos tutoriais
- [ ] Preparar marketing
- [ ] Deploy em produção

**Deliverable:** Prezzo pronto para lançamento

---

## 💰 Investimento - Prezzo

### Desenvolvimento

**Fase 1 - MVP (6 semanas):**
- Horas estimadas: 80-100h
- Valor: R$ 22.000 - R$ 30.000

**Fase 2 - IA (3 semanas):**
- Horas estimadas: 40-50h
- Valor: R$ 11.000 - R$ 15.000

**Fase 3 - Analytics (3 semanas):**
- Horas estimadas: 40-50h
- Valor: R$ 11.000 - R$ 15.000

**Total Desenvolvimento:** R$ 44.000 - R$ 60.000

### Custos Mensais de Operação

**Infraestrutura:**
- Vercel Pro: R$ 100/mês
- Supabase: R$ 0 (free tier) ou R$ 150 (pro)
- Domínio prezzo.app/.com.br: R$ 50/ano

**IA:**
- Claude API: ~R$ 100-300/mês (depende do volume)
  - Estimativa: 100 NFs/mês = ~R$ 150

**Total Mensal:** R$ 200 - R$ 550/mês

### ROI Estimado

**Modelo de Negócio Sugerido:**
- Plano Starter: R$ 197/mês (1 usuário, 50 orçamentos/mês)
- Plano Professional: R$ 397/mês (3 usuários, orçamentos ilimitados)
- Plano Enterprise: R$ 797/mês (usuários ilimitados, white label)

**Break-even:**
- Com 10 clientes no plano Starter: R$ 1.970/mês
- Custos: R$ 550/mês
- Lucro líquido: R$ 1.420/mês
- ROI em: 31-42 meses

**Com 50 clientes (mix):**
- Receita: ~R$ 15.000/mês
- Custos: ~R$ 1.000/mês (escala)
- Lucro: ~R$ 14.000/mês
- ROI em: 3-4 meses

---

## 🎨 Especificações de Design - Prezzo

### Identidade Visual

**Logo:**
- Símbolo: P estilizado com símbolo de cifrão integrado
- Versões: completa, símbolo, monocromática

**Paleta de Cores:**
```
Primária:
- Azul Principal: #2563EB (confiança, tecnologia)
- Azul Escuro: #1E40AF (profissionalismo)

Secundária:
- Verde Sucesso: #10B981 (lucro, crescimento)
- Vermelho Alerta: #EF4444 (custos altos, atenção)
- Amarelo Aviso: #F59E0B (atenção moderada)

Neutras:
- Cinza 900: #111827 (textos)
- Cinza 600: #4B5563 (textos secundários)
- Cinza 100: #F3F4F6 (backgrounds)
- Branco: #FFFFFF
```

**Tipografia:**
- Headings: Manrope Bold
- Body: Inter Regular/Medium
- Números: JetBrains Mono (dados, valores)

### UI Components

**Botões:**
- Primário: Azul sólido
- Secundário: Azul outline
- Destrutivo: Vermelho
- Tamanhos: sm, md, lg

**Cards:**
- Border radius: 12px
- Shadow: sutil
- Hover: elevação suave

**Inputs:**
- Border: cinza claro
- Focus: azul principal
- Erro: vermelho

**Tabelas:**
- Header: fundo cinza claro
- Hover rows: destaque suave
- Zebra striping: opcional

---

## 📱 Wireframes Principais - Prezzo

### 1. Dashboard
```
┌─────────────────────────────────────────┐
│ [Logo Prezzo]     [Busca]    [👤 User] │
├─────────────────────────────────────────┤
│ 📊 Dashboard                             │
│                                          │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐│
│ │ Custo    │ │ Margem   │ │ Orçam.   ││
│ │ Médio    │ │ Média    │ │ Mês      ││
│ │ R$ 245   │ │ 38%      │ │ 127      ││
│ └──────────┘ └──────────┘ └──────────┘│
│                                          │
│ [Gráfico: Evolução de Custos]          │
│                                          │
│ [Produtos com Margem Baixa - Alerta]   │
│                                          │
│ [Últimas Atualizações de Preço]        │
└─────────────────────────────────────────┘
```

### 2. Matérias-Primas
```
┌─────────────────────────────────────────┐
│ Matérias-Primas                         │
│                                          │
│ [+ Nova Matéria] [Importar] [Filtros]  │
│                                          │
│ ┌────────────────────────────────────┐ │
│ │Nome    │Un.│Custo Unit│Atualiz.│▶│ │
│ ├────────────────────────────────────┤ │
│ │Filtro  │ m │ R$ 45,00 │ 2d atrás │ │
│ │Grade Fe│ m │ R$ 30,00 │ 5d atrás │ │
│ │Parafuso│un │ R$  0,50 │ 1sem atrá│ │
│ └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### 3. Criar Produto
```
┌─────────────────────────────────────────┐
│ Novo Produto                            │
│                                          │
│ Tipo: [Filtro de Alumínio ▼]          │
│ Variação: [Grade de Ferro________]     │
│ Margem: [40] %                          │
│                                          │
│ ┌─ Composição ─────────────────────┐   │
│ │ [Buscar matéria-prima...]        │   │
│ │                                   │   │
│ │ Filtro alumínio  2m   R$ 90,00   │   │
│ │ Grade ferro      1.5m R$ 45,00   │   │
│ │ Parafusos        8un  R$  4,00   │   │
│ │                                   │   │
│ │ Custo Total:           R$ 139,00 │   │
│ │ Margem 40%:            R$  55,60 │   │
│ │ Preço Sugerido:        R$ 194,60 │   │
│ └───────────────────────────────────┘   │
│                                          │
│ [Cancelar] [Salvar Produto]            │
└─────────────────────────────────────────┘
```

### 4. Novo Orçamento
```
┌─────────────────────────────────────────┐
│ Novo Orçamento #2024-127                │
│                                          │
│ Cliente: [Nome do Cliente________]      │
│ Email: [email@cliente.com________]      │
│ Validade: [30/12/2024]                  │
│                                          │
│ ┌─ Produtos ──────────────────────┐    │
│ │ [+ Adicionar Produto]            │    │
│ │                                   │    │
│ │ Filtro Alu - Ferro  2un  R$ 389,20│   │
│ │ Filtro Alu - Cobre  1un  R$ 245,00│   │
│ │                                   │    │
│ │ Subtotal:              R$ 634,20 │    │
│ │ Desconto (10%):        R$  63,42 │    │
│ │ TOTAL:                 R$ 570,78 │    │
│ └───────────────────────────────────┘   │
│                                          │
│ [Salvar Rascunho] [Gerar PDF]          │
└─────────────────────────────────────────┘
```

### 5. Prezzo AI - Upload NF
```
┌─────────────────────────────────────────┐
│ Prezzo AI - Atualizar Custos            │
│                                          │
│ ┌───────────────────────────────────┐   │
│ │                                    │   │
│ │    📄 Arraste o PDF da NF aqui    │   │
│ │    ou clique para selecionar      │   │
│ │                                    │   │
│ └───────────────────────────────────┘   │
│                                          │
│ Notas Processadas Recentemente:         │
│ ┌────────────────────────────────────┐  │
│ │ NF 12345 - Fornecedor X - Hoje     │  │
│ │ → 3 materiais atualizados          │  │
│ │                                     │  │
│ │ NF 12344 - Fornecedor Y - Ontem    │  │
│ │ → 5 materiais atualizados          │  │
│ └────────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

---

## 🚀 Estratégia de Lançamento - Prezzo

### Pré-Lançamento (2 semanas antes)

**Marketing:**
- Landing page com early access
- Vídeo demo do produto
- Posts no LinkedIn sobre o problema
- Email marketing para base atual

**Early Access:**
- 10-20 beta testers
- Feedback intensivo
- Ajustes finais

### Lançamento

**Dia 1:**
- Post anúncio no LinkedIn
- Email para toda base
- Stories no Instagram
- Vídeo no YouTube

**Primeira Semana:**
- Webinar demonstrativo
- Lives tirando dúvidas
- Oferta de lançamento: 50% off primeiro mês

**Primeiro Mês:**
- Conteúdo educativo semanal
- Cases de sucesso
- Depoimentos de clientes
- Ajustes baseados em feedback

---

## 📋 Checklist de Lançamento

### Técnico
- [ ] Todos os módulos testados
- [ ] Performance otimizada
- [ ] Responsivo mobile
- [ ] Deploy em produção
- [ ] Backup automático configurado
- [ ] Monitoramento (Sentry)
- [ ] SSL configurado
- [ ] DNS apontando corretamente

### Produto
- [ ] Documentação completa
- [ ] Vídeos tutoriais
- [ ] FAQ criado
- [ ] Onboarding de usuários
- [ ] Email de boas-vindas
- [ ] Templates de orçamento prontos

### Marketing
- [ ] Landing page no ar
- [ ] Página de preços
- [ ] Blog com 3 posts
- [ ] Perfis sociais criados
- [ ] Email marketing configurado
- [ ] Materiais gráficos prontos

### Legal
- [ ] Termos de uso
- [ ] Política de privacidade
- [ ] LGPD compliance
- [ ] Contrato de serviço

---

## 🎯 Próximos Passos Imediatos

1. **Validar Escopo Final**
   - Revisar funcionalidades
   - Confirmar prioridades
   - Definir o que entra no MVP

2. **Definir Cronograma**
   - Data de início
   - Milestones
   - Data de lançamento target

3. **Setup Inicial**
   - Criar repositório
   - Configurar ambiente
   - Definir acessos

4. **Prototipar**
   - Criar mockups finais no Figma
   - Validar fluxos
   - Aprovar design

5. **Iniciar Sprint 1**
   - Começar desenvolvimento
   - Daily updates
   - Review semanal

---

## 💡 Funcionalidades Futuras (Pós-MVP)

### Versão 1.5 (PRÓXIMA FASE - GESTÃO DE MÃO DE OBRA):
- ✅ **ADICIONADO:** Cadastro de tipos de mão de obra
- ✅ **ADICIONADO:** Configuração de custos por hora
- ✅ **ADICIONADO:** Opção de incluir custo de máquina/equipamento
- ✅ **ADICIONADO:** Composição de mão de obra nos produtos
- ✅ **ADICIONADO:** Cálculo automático incluindo mão de obra
- ✅ **ADICIONADO:** Interface configurável para ajustar valores
- ✅ **ADICIONADO:** Histórico de reajustes de mão de obra

**Cronograma Estimado:**
- Semana 13: Schema e backend (modelos, API routes)
- Semana 14: Frontend (CRUD de mão de obra, interface de composição)
- Semana 15: Integração e testes (recálculo de produtos, relatórios)

### Versão 2.0:
- App mobile (React Native)
- Integração com ERPs
- API para terceiros
- Catálogo online de produtos
- Sistema de pedidos
- Controle de estoque
- Multi-empresa
- White label para revendedores

### Versão 3.0:
- Marketplace de templates
- Previsão de custos com IA
- Análise de concorrência
- CRM integrado
- Assinatura de contratos online

---

**Documento criado em:** 26/11/2025
**Versão:** 1.1 (Atualizado: 27/11/2025 - Adicionada funcionalidade de Mão de Obra)
**Status:** Em Desenvolvimento

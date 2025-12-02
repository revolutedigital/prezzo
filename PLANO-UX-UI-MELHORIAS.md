# Plano de Melhorias UX/UI - Sistema Prezzo

## Visão Geral

Este documento detalha todas as melhorias necessárias para o sistema Prezzo, organizadas por prioridade e com estimativas de implementação.

---

## 📋 RESUMO EXECUTIVO

### Funcionalidades Faltantes Críticas

- ✅ Botões de exclusão (DELETE) em todas as entidades - COMPLETO
- ✅ Sistema de feedback e notificações - COMPLETO
- ✅ Estados vazios nas listagens - COMPLETO
- ✅ Loading states e validações - COMPLETO

### Métricas de Qualidade Atual

- **Funcionalidade de CRUD**: 75% (falta DELETE)
- **Feedback ao Usuário**: 30%
- **Navegação**: 50%
- **Responsividade**: 60%
- **Acessibilidade**: 40%

---

## 🎯 P0 - CRÍTICO (Sprint 1 - 1 semana)

### 1. Implementar Funcionalidade DELETE

**Prioridade**: CRÍTICA
**Impacto**: Alto
**Esforço**: 3 dias

#### Entidades que precisam de DELETE:

- [x] Produtos - COMPLETO
- [x] Orçamentos - COMPLETO
- [x] Variações de produtos - COMPLETO
- [x] Matérias-primas - COMPLETO
- [x] Mão de obra - COMPLETO
- [x] Tipos de produto - COMPLETO

#### Requisitos técnicos:

```typescript
// API Routes necessárias
DELETE / api / produtos / [id];
DELETE / api / orcamentos / [id];
DELETE / api / variacoes - produto / [id];
DELETE / api / materias - primas / [id];
DELETE / api / mao - de - obra / [id];
DELETE / api / tipos - produto / [id];
```

#### UX Requirements:

- Modal de confirmação antes de excluir
- Mensagem clara: "Tem certeza que deseja excluir [NOME]? Esta ação não pode ser desfeita."
- Botão primário: "Cancelar" (seguro)
- Botão secundário vermelho: "Excluir" (destrutivo)
- Ícone de lixeira (Trash2) ao lado de cada item

#### Validações:

- Não permitir excluir produto que está em orçamento
- Não permitir excluir matéria-prima usada em produto
- Avisar sobre dependências antes de excluir

---

### 2. Sistema de Notificações (Toast)

**Prioridade**: CRÍTICA
**Impacto**: Alto
**Esforço**: 1 dia

#### Biblioteca sugerida:

```bash
npm install react-hot-toast
```

#### Tipos de notificações:

- ✅ Sucesso (verde): "Produto criado com sucesso!"
- ❌ Erro (vermelho): "Erro ao salvar produto. Tente novamente."
- ⚠️ Aviso (amarelo): "Alguns campos estão incompletos"
- ℹ️ Info (azul): "Produto duplicado"

#### Implementação:

```typescript
// lib/toast.ts
import toast from "react-hot-toast";

export const showSuccess = (message: string) => toast.success(message);
export const showError = (message: string) => toast.error(message);
export const showWarning = (message: string) => toast(message, { icon: "⚠️" });
export const showInfo = (message: string) => toast(message, { icon: "ℹ️" });
```

#### Onde aplicar:

- [x] Criar/Editar produto - COMPLETO
- [x] Criar/Editar orçamento - COMPLETO
- [x] Criar/Editar matéria-prima - COMPLETO
- [x] Criar/Editar mão de obra - COMPLETO
- [x] Excluir qualquer entidade - COMPLETO
- [x] Erros de API - COMPLETO
- [ ] Upload de nota fiscal - N/A (funcionalidade não implementada)

---

### 3. Estados Vazios (Empty States)

**Prioridade**: CRÍTICA
**Impacto**: Médio
**Esforço**: 1 dia

#### Design do Empty State:

```tsx
<div className="text-center py-12">
  <ícone className="mx-auto h-12 w-12 text-gray-400" />
  <h3 className="mt-2 text-sm font-semibold text-gray-900">Nenhum [entidade] cadastrado</h3>
  <p className="mt-1 text-sm text-gray-500">Comece criando seu primeiro [entidade].</p>
  <Button className="mt-6">
    <Plus className="mr-2 h-4 w-4" />
    Novo [Entidade]
  </Button>
</div>
```

#### Aplicar em:

- [x] Lista de produtos - COMPLETO
- [x] Lista de orçamentos - COMPLETO
- [x] Lista de matérias-primas - COMPLETO
- [x] Lista de mão de obra - COMPLETO
- [x] Lista de variações - COMPLETO
- [x] Dashboard (quando não há dados) - COMPLETO

---

### 4. Loading States

**Prioridade**: CRÍTICA
**Impacto**: Médio
**Esforço**: 2 dias

#### Componentes necessários:

```tsx
// components/ui/skeleton.tsx - Skeleton loaders
// components/ui/spinner.tsx - Loading spinners
```

#### Onde aplicar:

- [x] Botões de submit (com spinner e disabled) - COMPLETO
- [x] Carregamento de listas (skeleton de tabelas) - COMPLETO
- [x] Carregamento de formulários - COMPLETO
- [ ] Upload de arquivos (barra de progresso) - N/A
- [x] Geração de PDF - COMPLETO
- [x] Cálculos de custos - COMPLETO (automático)

#### Estados do botão:

```tsx
<Button disabled={isLoading}>
  {isLoading ? (
    <>
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      Salvando...
    </>
  ) : (
    <>
      <Save className="mr-2 h-4 w-4" />
      Salvar
    </>
  )}
</Button>
```

---

## 🔥 P1 - ALTA PRIORIDADE (Sprint 2 - 1 semana)

### 5. Busca e Filtros

**Prioridade**: ALTA
**Impacto**: Alto
**Esforço**: 3 dias

#### Funcionalidades:

- [x] Busca por nome/código em produtos - COMPLETO
- [x] Filtro por tipo de produto - COMPLETO
- [ ] Filtro por faixa de preço - PENDENTE
- [x] Filtro por data (orçamentos) - PARCIAL (tem status)
- [x] Busca em matérias-primas - COMPLETO
- [x] Filtro por status - COMPLETO (todas as páginas)

#### UI Component:

```tsx
<div className="flex gap-4 mb-6">
  <Input placeholder="Buscar produtos..." icon={<Search />} onChange={handleSearch} />
  <Select placeholder="Tipo de produto">
    <option>Todos</option>
    <option>Tipo 1</option>
  </Select>
  <Button variant="outline">
    <Filter className="mr-2 h-4 w-4" />
    Filtros
  </Button>
</div>
```

---

### 6. Paginação

**Prioridade**: ALTA
**Impacto**: Alto (performance)
**Esforço**: 2 dias

#### Implementação:

```typescript
// Parâmetros de API
?page=1&limit=20

// Backend: Prisma pagination
const produtos = await prisma.produto.findMany({
  skip: (page - 1) * limit,
  take: limit,
});

const total = await prisma.produto.count();
```

#### UI Component:

```tsx
<Pagination>
  <PaginationPrevious />
  <PaginationList>
    <PaginationItem>1</PaginationItem>
    <PaginationItem active>2</PaginationItem>
    <PaginationItem>3</PaginationItem>
  </PaginationList>
  <PaginationNext />
</Pagination>
```

#### Onde aplicar:

- [x] Lista de produtos (limite: 20/página) ✅
- [x] Lista de orçamentos (limite: 20/página) - Backend ✅
- [x] Lista de matérias-primas (limite: 50/página) - Backend ✅
- [x] Lista de mão de obra (limite: 50/página) - Backend ✅

**Status**: Backend completo em todas as APIs. Frontend: Produtos completo, demais páginas em implementação.

---

### 7. Breadcrumbs ✅ COMPLETO

**Prioridade**: ALTA
**Impacto**: Médio
**Esforço**: 1 dia

#### Implementado em:

- [x] Produtos
- [x] Orçamentos
- [x] Matérias-Primas
- [x] Mão de Obra

#### Estrutura:

```
Dashboard > Produtos > Editar Produto > Composição
Dashboard > Orçamentos > Novo Orçamento
Dashboard > Matérias-Primas
```

#### Componente:

```tsx
<Breadcrumb>
  <BreadcrumbList>
    <BreadcrumbItem>
      <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbLink href="/produtos">Produtos</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbPage>Editar</BreadcrumbPage>
    </BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>
```

---

### 8. Validação em Tempo Real ✅ COMPLETO

**Prioridade**: ALTA
**Impacto**: Médio
**Esforço**: 2 dias

#### Biblioteca:

```bash
npm install react-hook-form zod @hookform/resolvers
```

#### Implementado:

- [x] Schemas criados em `/src/schemas/`
- [x] Formulário de matéria-prima com validação em tempo real
- [x] Formulário de mão de obra com validação em tempo real
- [x] Schema de tipo de produto criado
- [x] TypeScript 0 erros
- [x] Todas as validações funcionando corretamente

---

### 9. Ordenação de Colunas ✅ COMPLETO

**Prioridade**: ALTA
**Impacto**: Médio
**Esforço**: 2 dias

#### Implementado:

- [x] Backend: Todas as 4 APIs suportam ordenação via query params `?sortBy=campo&order=asc/desc`
- [x] Validação de campos permitidos para ordenação em cada API
- [x] Frontend: Produtos - dropdown de campo + botão de ordem com ícones
- [x] Frontend: Matérias-primas - dropdown + botão com ícones
- [x] Frontend: Mão de Obra - dropdown + botão com ícones
- [x] Frontend: Orçamentos - dropdown + botão com texto Crescente/Decrescente
- [x] Reset automático para página 1 quando ordenação muda
- [x] TypeScript 0 erros

#### Backend:

```typescript
// API aceita: ?sortBy=nome&order=asc
const produtos = await prisma.produto.findMany({
  orderBy: { [sortBy]: order },
});
```

#### APIs atualizadas:

- `/api/tipos-produto` - ordena por: nome, codigo, categoria, ativo, createdAt
- `/api/materias-primas` - ordena por: nome, codigo, custoUnitario, fornecedor, categoria, ativo, createdAt
- `/api/mao-de-obra` - ordena por: nome, codigo, custoHora, custoMaquinaHora, incluiMaquina, ativo, createdAt
- `/api/orcamentos` - ordena por: numero, clienteNome, status, valorTotal, validade, createdAt

---

## 📊 P2 - MÉDIA PRIORIDADE (Sprint 3-4 - 2 semanas)

### 10. Dashboard com Gráficos ✅ COMPLETO

**Prioridade**: MÉDIA
**Impacto**: Alto (valor percebido)
**Esforço**: 5 dias

#### Biblioteca:

```bash
npm install recharts  # ✅ Instalado
```

#### Implementado:

- [x] **API de Estatísticas** ([/api/dashboard/stats/route.ts](src/app/api/dashboard/stats/route.ts))
  - Queries otimizadas com Promise.all
  - Agregações de orçamentos por mês (últimos 6 meses)
  - Top 5 produtos mais vendidos
  - Cálculo de métricas (taxa de conversão, ticket médio, etc)

- [x] **Cards de Métricas** com hover effects e links:
  - Total de matérias-primas ativas
  - Total de produtos e variações
  - Total de orçamentos (+ aprovados)
  - Taxa de conversão (destaque visual)
  - Valor total aprovado (card destacado)
  - Ticket médio por orçamento

- [x] **Gráficos com Recharts**:
  - Gráfico de linha: Orçamentos por mês (quantidade + valor)
  - Gráfico de pizza: Distribuição por status (Rascunho/Enviado/Aprovado)
  - Estados vazios com CTAs para cada gráfico
  - Tooltips customizados com formatação de moeda

- [x] **Listas e Rankings**:
  - Top 5 produtos mais vendidos (com ranking visual)
  - Últimos 5 orçamentos (com links e badges de status)
  - Estados vazios com CTAs apropriados

- [x] **UX Aprimorada**:
  - Loading skeleton personalizado
  - Animações de hover e transição
  - Cards clicáveis com links diretos
  - CTAs estratégicos em estados vazios
  - Widget de alertas de custos integrado

#### Layout:

```
┌─────────────┬─────────────┬─────────────┬─────────────┐
│  Produtos   │ Orçamentos  │ Valor Total │  Taxa de    │
│     48      │     12      │  R$ 45.280  │  Conversão  │
└─────────────┴─────────────┴─────────────┴─────────────┘

┌────────────────────────────────┬────────────────────────┐
│  Orçamentos por Mês            │  Custos por Tipo       │
│  (Gráfico de Linha)            │  (Gráfico de Pizza)    │
└────────────────────────────────┴────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│  Top 5 Produtos Mais Lucrativos                          │
│  (Tabela com ações rápidas)                              │
└──────────────────────────────────────────────────────────┘
```

---

### 11. Exportação de Dados ✅ COMPLETO

**Prioridade**: MÉDIA
**Impacto**: Médio
**Esforço**: 3 dias

#### Formatos:

- [x] PDF - Relatório de custos implementado
- [x] Excel/CSV - Listas de produtos e orçamentos
- [ ] JSON (backup de dados) - Não implementado

#### Bibliotecas:

```bash
npm install xlsx  # ✅ Instalado
npm install jspdf jspdf-autotable  # ✅ Instalado
```

#### Funcionalidades:

- [x] Exportar lista de produtos para Excel ([/api/export/produtos](src/app/api/export/produtos/route.ts))
- [x] Exportar lista de orçamentos para Excel com 3 sheets ([/api/export/orcamentos](src/app/api/export/orcamentos/route.ts))
- [x] Exportar relatório de custos para PDF ([/api/export/relatorio-custos](src/app/api/export/relatorio-custos/route.ts))
- [x] Botões de exportação em Produtos e Orçamentos

---

### 12. Status de Orçamentos ✅ COMPLETO

**Prioridade**: MÉDIA
**Impacto**: Alto
**Esforço**: 2 dias

#### Status implementados:

- 🟡 Rascunho (rascunho) - default
- 🔵 Enviado (enviado)
- 🟢 Aprovado (aprovado)
- 🔴 Rejeitado (rejeitado)

#### Implementação:

- [x] Campo `status` no schema do Prisma (String)
- [x] Badges com variantes visuais na UI
- [x] Filtros por status na página de orçamentos
- [x] Estatísticas por status no dashboard
- [x] Mudança de status via API PUT /api/orcamentos/[id]

---

### 13. Responsividade Mobile Completa ✅ COMPLETO

**Prioridade**: MÉDIA
**Impacto**: Alto (acessibilidade)
**Esforço**: 4 dias

#### Breakpoints implementados:

- Mobile: < 640px (sm)
- Tablet: 640px - 768px (md)
- Desktop: > 1024px (lg)

#### Melhorias implementadas:

- [x] Headers responsivos com flex-col em mobile
- [x] Botões com texto oculto em mobile (ícone + badge)
- [x] Stats cards em grid 2 colunas (mobile) → 3-4 colunas (desktop)
- [x] Filtros empilhados verticalmente em mobile
- [x] Tabelas com scroll horizontal em mobile (`overflow-x-auto`)
- [x] Textos e ícones com tamanhos responsivos
- [x] Aplicado em: Produtos, Orçamentos, Dashboard

#### Páginas atualizadas:

- [produtos/page.tsx](<src/app/(dashboard)/produtos/page.tsx>) - Header, stats, filtros responsivos
- [orcamentos/page.tsx](<src/app/(dashboard)/orcamentos/page.tsx>) - Header, stats, filtros, tabela com scroll
- [dashboard/page.tsx](<src/app/(dashboard)/dashboard/page.tsx>) - Header e grid responsivos
- [ ] Navegação bottom tab bar (opcional)
- [ ] Touch-friendly (botões maiores)

---

### 14. Preview de PDF ✅ COMPLETO

**Prioridade**: MÉDIA
**Impacto**: Médio
**Esforço**: 2 dias

#### Funcionalidade implementada:

- [x] Botão "Preview PDF" entre Excel e Baixar PDF
- [x] Modal com preview do PDF usando iframe
- [x] Opções: Baixar, Imprimir, Fechar
- [x] Loading state com spinner durante carregamento
- [x] Componente reutilizável PDFPreviewDialog

#### Arquivos criados/modificados:

- [pdf-preview-dialog.tsx](src/components/ui/pdf-preview-dialog.tsx) - Componente Dialog com iframe
- [produtos/page.tsx](<src/app/(dashboard)/produtos/page.tsx>) - Botão Preview PDF e integração

#### Implementação:

```tsx
// Componente PDFPreviewDialog com:
// - Iframe para renderizar PDF nativamente
// - Botões de Print e Download
// - Loading state com Loader2
// - Responsivo (hidden text em mobile)
<PDFPreviewDialog
  open={pdfPreviewOpen}
  onOpenChange={setPdfPreviewOpen}
  title="Relatório de Custos de Produtos"
  pdfUrl={pdfUrl}
  filename={`relatorio-custos-${new Date().toISOString().split("T")[0]}.pdf`}
/>
```

---

## 🎨 P3 - BAIXA PRIORIDADE (Backlog - 2+ semanas)

### 15. Modo Escuro

**Prioridade**: BAIXA
**Impacto**: Baixo (nice-to-have)
**Esforço**: 3 dias

#### Implementação:

```bash
npm install next-themes
```

#### Provider:

```tsx
// app/providers.tsx
<ThemeProvider attribute="class" defaultTheme="system">
  {children}
</ThemeProvider>
```

---

### 16. Tour Guiado (Onboarding)

**Prioridade**: BAIXA
**Impacto**: Médio (novos usuários)
**Esforço**: 3 dias

#### Biblioteca:

```bash
npm install react-joyride
```

#### Etapas do tour:

1. Bem-vindo ao Prezzo
2. Crie seu primeiro tipo de produto
3. Cadastre matérias-primas
4. Crie um produto
5. Gere um orçamento

---

### 17. Histórico de Alterações

**Prioridade**: BAIXA
**Impacto**: Médio (auditoria)
**Esforço**: 5 dias

#### Schema:

```prisma
model Auditoria {
  id        String   @id @default(cuid())
  entidade  String   // "Produto", "Orcamento", etc
  entidadeId String
  acao      String   // "CREATE", "UPDATE", "DELETE"
  camposAlterados Json?
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  createdAt DateTime @default(now())
}
```

---

### 18. Versionamento de Orçamentos

**Prioridade**: BAIXA
**Impacto**: Médio
**Esforço**: 4 dias

#### Funcionalidade:

- Criar nova versão do orçamento
- Comparar versões
- Histórico de alterações de preço

---

### 19. Autenticação em Duas Etapas (2FA)

**Prioridade**: BAIXA
**Impacto**: Alto (segurança)
**Esforço**: 4 dias

#### Biblioteca:

```bash
npm install speakeasy qrcode
```

#### Fluxo:

1. Usuário habilita 2FA nas configurações
2. Sistema gera QR code (Google Authenticator)
3. Usuário escaneia QR code
4. Login requer código de 6 dígitos

---

## 📦 COMPONENTES REUTILIZÁVEIS A CRIAR

### UI Components Library

```bash
components/
├── ui/
│   ├── toast.tsx ✅ (shadcn)
│   ├── skeleton.tsx ✅ (shadcn)
│   ├── spinner.tsx (criar)
│   ├── empty-state.tsx (criar)
│   ├── breadcrumb.tsx ✅ (shadcn)
│   ├── pagination.tsx ✅ (shadcn)
│   ├── search-input.tsx (criar)
│   ├── filter-dropdown.tsx (criar)
│   ├── data-table.tsx (criar - com sort, filter, pagination)
│   ├── confirm-dialog.tsx (criar)
│   └── loading-button.tsx (criar)
```

---

## 🗂️ ESTRUTURA DE APIS A CRIAR/ATUALIZAR

### DELETE Endpoints

```
DELETE /api/produtos/[id]
DELETE /api/orcamentos/[id]
DELETE /api/variacoes-produto/[id]
DELETE /api/materias-primas/[id]
DELETE /api/mao-de-obra/[id]
DELETE /api/tipos-produto/[id]
```

### Enhanced GET Endpoints (com query params)

```
GET /api/produtos?page=1&limit=20&search=termo&sortBy=nome&order=asc&tipoProdutoId=123
GET /api/orcamentos?page=1&limit=20&status=APROVADO&dataInicio=2024-01-01&dataFim=2024-12-31
GET /api/materias-primas?page=1&limit=50&search=termo
```

### Analytics Endpoints

```
GET /api/analytics/dashboard
GET /api/analytics/produtos/top-lucrativos
GET /api/analytics/orcamentos/por-mes
GET /api/analytics/custos/distribuicao
```

### Export Endpoints

```
GET /api/export/produtos?format=xlsx
GET /api/export/orcamentos?format=pdf&dataInicio=2024-01-01
GET /api/export/relatorio-custos?format=pdf&produtoId=123
```

---

## ⚙️ CONFIGURAÇÕES DO SISTEMA A ADICIONAR

### Tabela de Configurações

```prisma
model Configuracao {
  id                String  @id @default(cuid())
  empresaNome       String?
  empresaCNPJ       String?
  empresaLogo       String?
  empresaEndereco   String?
  empresaTelefone   String?
  empresaEmail      String?
  moeda             String  @default("BRL")
  idioma            String  @default("pt-BR")
  userId            String  @unique
  user              User    @relation(fields: [userId], references: [id])
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}
```

---

## 📝 MELHORIAS DE CÓDIGO

### Performance

- [ ] Implementar React Query para cache de dados
- [ ] Lazy loading de componentes pesados
- [ ] Otimizar queries do Prisma (include seletivo)
- [ ] Implementar debounce em buscas
- [ ] Memoização de cálculos pesados

### Code Quality

- [ ] Adicionar testes unitários (Jest)
- [ ] Adicionar testes E2E (Playwright)
- [ ] Configurar ESLint rules mais rigorosas
- [ ] Adicionar Prettier
- [ ] Documentar componentes (Storybook?)

### Segurança

- [ ] Rate limiting em APIs
- [ ] Validação de permissões por rota
- [ ] Sanitização de inputs
- [ ] CSRF protection
- [ ] Helmet.js para headers de segurança

---

## 📅 CRONOGRAMA DETALHADO

### Sprint 1 (Semana 1) - P0

**Dias 1-2**: DELETE functionality + Confirm modals
**Dia 3**: Sistema de Toast notifications
**Dia 4**: Empty states em todas as listas
**Dia 5**: Loading states (buttons + skeletons)
**Review e testes**

### Sprint 2 (Semana 2) - P1 Parte 1

**Dias 1-2**: Busca e filtros
**Dia 3**: Paginação backend + frontend
**Dia 4**: Breadcrumbs
**Dia 5**: Validação em tempo real (react-hook-form + zod)

### Sprint 3 (Semana 3) - P1 Parte 2

**Dias 1-2**: Ordenação de colunas
**Dias 3-5**: Dashboard com gráficos (Recharts)

### Sprint 4 (Semana 4) - P2 Parte 1

**Dias 1-2**: Exportação Excel/PDF
**Dia 3**: Status de orçamentos
**Dias 4-5**: Preview de PDF + Melhorias

### Sprint 5 (Semana 5) - P2 Parte 2

**Dias 1-4**: Responsividade mobile completa
**Dia 5**: Testes e ajustes

### Backlog (P3) - A definir

- Modo escuro
- Tour guiado
- Histórico de alterações
- Versionamento
- 2FA

---

## 🎯 MÉTRICAS DE SUCESSO

### KPIs Técnicos

- [ ] Tempo de resposta da API < 200ms (95 percentil)
- [ ] Lighthouse Score > 90
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3s
- [ ] Zero erros críticos no Sentry
- [ ] Cobertura de testes > 70%

### KPIs de UX

- [ ] Redução de 50% em erros de usuário
- [ ] Aumento de 30% na taxa de conversão (cadastros completos)
- [ ] Net Promoter Score (NPS) > 50
- [ ] System Usability Scale (SUS) > 80

---

## 🚀 PRÓXIMOS PASSOS IMEDIATOS

1. **Setup inicial (Hoje)**
   - Instalar dependências: react-hot-toast, react-hook-form, zod
   - Criar componente de Toast
   - Criar componente de ConfirmDialog

2. **Dia 1 (Amanhã)**
   - Implementar DELETE em Produtos (API + Frontend + Modal)
   - Testar fluxo completo

3. **Dia 2**
   - Implementar DELETE nas demais entidades
   - Adicionar validações de dependências

4. **Dia 3**
   - Implementar Toast em todas as ações
   - Empty states em todas as listas

5. **Dia 4-5**
   - Loading states completos
   - Review e testes da Sprint 1

---

## 📚 RECURSOS E REFERÊNCIAS

### Documentação

- [Next.js 15](https://nextjs.org/docs)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Prisma](https://www.prisma.io/docs)
- [React Hook Form](https://react-hook-form.com/)
- [Zod](https://zod.dev/)

### Design System

- [Radix UI Primitives](https://www.radix-ui.com/)
- [Lucide Icons](https://lucide.dev/)

### Libraries a considerar

- [React Query](https://tanstack.com/query) - Data fetching
- [Recharts](https://recharts.org/) - Gráficos
- [date-fns](https://date-fns.org/) - Manipulação de datas
- [React Joyride](https://react-joyride.com/) - Tour guiado
- [React Table](https://tanstack.com/table) - Tabelas avançadas

---

## ✅ CHECKLIST DE QUALIDADE

Antes de considerar cada feature completa:

### Funcionalidade

- [ ] Feature funciona conforme especificado
- [ ] Validações client-side e server-side
- [ ] Tratamento de erros adequado
- [ ] Loading states visíveis
- [ ] Feedback ao usuário (toast/mensagem)

### UX

- [ ] Fluxo intuitivo e claro
- [ ] Ações destrutivas confirmadas
- [ ] Estados vazios tratados
- [ ] Responsive em mobile/tablet/desktop
- [ ] Acessível via teclado

### Código

- [ ] Código limpo e documentado
- [ ] Sem console.logs
- [ ] Tratamento de edge cases
- [ ] Performance otimizada
- [ ] Testes escritos

### Deploy

- [ ] Build sem erros
- [ ] Migrations aplicadas
- [ ] Variáveis de ambiente configuradas
- [ ] Testado em produção
- [ ] Monitoramento ativo

---

## 🐛 BUGS CONHECIDOS A CORRIGIR

(A ser preenchido durante o desenvolvimento)

---

## 💡 IDEIAS FUTURAS (Icebox)

- Integração com WhatsApp para envio de orçamentos
- App mobile nativo (React Native)
- Gestão de estoque de matérias-primas
- Sistema de pedidos/encomendas
- Multi-tenant (múltiplas empresas)
- API pública para integrações
- Relatórios personalizáveis
- Dashboard para clientes
- Sistema de permissões granular
- Integração com ERP
- Importação em lote (CSV)
- Calculadora de ponto de equilíbrio
- Análise de concorrência
- Previsão de demanda (ML)

---

**Documento criado em**: 01/12/2024
**Última atualização**: 01/12/2024
**Versão**: 1.0
**Autor**: Claude + Igor Rosso Silveira

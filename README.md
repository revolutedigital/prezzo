# Prezzo - Precificação Inteligente

Sistema inteligente de precificação para produtos compostos com atualização automática via IA.

## 🚀 Stack Tecnológica

- **Frontend:** Next.js 15, React 19, TypeScript
- **Styling:** Tailwind CSS, shadcn/ui
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Autenticação:** NextAuth.js
- **IA:** Claude API (Anthropic)

## 📦 Instalação

### 🐳 Opção 1: Docker (Recomendado)

A forma mais rápida de começar! Tudo configurado automaticamente.

```bash
# 1. Iniciar PostgreSQL e aplicação
docker-compose up -d

# 2. Acessar a aplicação
# Frontend: http://localhost:8001
# PostgreSQL: localhost:8000
```

Pronto! O sistema já está rodando com:
- PostgreSQL na porta **8000**
- Next.js na porta **8001**
- Migrations executadas automaticamente

**Comandos úteis:**
```bash
# Ver logs
docker-compose logs -f

# Parar containers
docker-compose down

# Resetar tudo (cuidado!)
docker-compose down -v

# Rodar Prisma Studio
docker-compose exec app npx prisma studio
```

---

### 💻 Opção 2: Desenvolvimento Local

1. Clone o repositório
2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais do PostgreSQL.

4. Execute as migrations do Prisma:
```bash
npx prisma migrate dev --name init
```

5. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## 🗄️ Banco de Dados

### Setup do PostgreSQL

**Opção 1: PostgreSQL Local**
```bash
# macOS (Homebrew)
brew install postgresql@15
brew services start postgresql@15

# Criar banco
createdb prezzo
```

**Opção 2: Docker**
```bash
docker run --name prezzo-postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:15
docker exec -it prezzo-postgres createdb -U postgres prezzo
```

**Opção 3: Serviços na Nuvem**
- [Neon](https://neon.tech) (recomendado - free tier generoso)
- [Supabase](https://supabase.com)
- [Railway](https://railway.app)

### Migrations

```bash
# Criar migration
npx prisma migrate dev --name nome_da_migration

# Aplicar migrations em produção
npx prisma migrate deploy

# Resetar banco (cuidado!)
npx prisma migrate reset

# Abrir Prisma Studio (interface visual)
npx prisma studio
```

## 📁 Estrutura do Projeto

```
prezzo/
├── src/
│   ├── app/                 # App Router (Next.js 15)
│   │   ├── (auth)/         # Rotas de autenticação
│   │   ├── (dashboard)/    # Rotas protegidas
│   │   ├── api/            # API Routes
│   │   ├── layout.tsx      # Layout raiz
│   │   └── page.tsx        # Página inicial
│   ├── components/         # Componentes React
│   │   ├── ui/            # Componentes base (shadcn/ui)
│   │   ├── layout/        # Navbar, Sidebar, etc
│   │   └── features/      # Componentes de features
│   └── lib/               # Utilitários
│       ├── prisma.ts      # Cliente Prisma
│       └── utils.ts       # Funções utilitárias
├── prisma/
│   └── schema.prisma      # Schema do banco
├── public/                # Arquivos estáticos
└── .env                   # Variáveis de ambiente
```

## 🎯 Status do Projeto

### ✅ Fase 1: MVP - Core do Sistema (COMPLETA)
- [x] Setup inicial do projeto
- [x] Configuração do banco de dados
- [x] Gestão de Matérias-Primas (CRUD completo)
- [x] Sistema de Produtos e Variações
- [x] Sistema de Orçamentos
- [x] Geração de PDF profissional
- [x] Dashboard com KPIs e gráficos

### ✅ Fase 2: Prezzo AI (COMPLETA)
- [x] Integração com Claude 3.5 Sonnet
- [x] Upload e parsing de Notas Fiscais (PDF)
- [x] Extração automática de dados com IA
- [x] Matching inteligente de produtos
- [x] Atualização automática de custos
- [x] Sistema de alertas e confirmação
- [x] Recálculo automático de preços

### ✅ Fase 3: Analytics e Relatórios (COMPLETA)
- [x] Widget de alertas no dashboard
- [x] Relatório de margens por produto
- [x] Relatório de evolução de custos
- [x] Relatório de rentabilidade
- [x] Gráficos interativos (Recharts)
- [x] Análise de top produtos e clientes

**🎉 PROJETO 100% COMPLETO E OPERACIONAL!**

## 🔧 Scripts Disponíveis

```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build para produção
npm run start        # Servidor de produção
npm run lint         # Linter
```

## 📝 Licença

Proprietary - Todos os direitos reservados

---

**Desenvolvido com ❤️ usando Next.js e Claude**

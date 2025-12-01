# Deploy Railway - Prezzo System

## 🚀 Informações do Deploy

**Data**: 2025-11-28
**Plataforma**: Railway
**Domínio**: https://prezzo.revolux.digital

---

## 📋 Configuração Railway

### Projeto
- **ID**: `4da4bf3c-3343-45f1-917a-c952cb1f8596`
- **Nome**: prezzo
- **Workspace**: revolutedigital's Projects
- **URL**: https://railway.app/project/4da4bf3c-3343-45f1-917a-c952cb1f8596

### Serviços

#### 1. Prezzo (App)
- **Service ID**: `99b24b07-28d8-4f51-b26a-42ebe1f55823`
- **Domínio**: prezzo.revolux.digital
- **Builder**: Dockerfile
- **Start Command**: `npm start`
- **Health Check**: `/api/health`
- **Health Check Timeout**: 300s

#### 2. PostgreSQL
- **Service ID**: `9f5b502c-a69a-4119-9ff6-7a43f1c18ffd`
- **Volume**: postgres-volume (50GB)
- **Internal Host**: `postgres.railway.internal:5432`
- **Database**: railway

---

## 🔐 Variáveis de Ambiente

### Prezzo Service
```bash
NODE_ENV=production
NEXTAUTH_URL=https://prezzo.revolux.digital
NEXTAUTH_SECRET=P7eu/1IlKzTTjlsqitaucRQ6qh2VD9QQGDMH5b5mPBU=
DATABASE_URL=postgresql://postgres:WnZMZxSmeDuztwYcAKMlXXfwOMlFEnKj@postgres.railway.internal:5432/railway?schema=public
```

### PostgreSQL Service
```bash
DATABASE_URL=postgresql://postgres:WnZMZxSmeDuztwYcAKMlXXfwOMlFEnKj@postgres.railway.internal:5432/railway
DATABASE_PUBLIC_URL=postgresql://postgres:WnZMZxSmeDuztwYcAKMlXXfwOMlFEnKj@maglev.proxy.rlwy.net:39506/railway
PGHOST=postgres.railway.internal
PGPORT=5432
PGDATABASE=railway
PGUSER=postgres
PGPASSWORD=WnZMZxSmeDuztwYcAKMlXXfwOMlFEnKj
```

---

## 📦 Repositório GitHub

- **Repo**: https://github.com/revolutedigital/prezzo
- **Branch**: main
- **Último Commit**: 65a101a - "fix: copy public dir from source, not builder stage"

---

## 🔧 Correções Aplicadas Durante Deploy

### 1. Dockerfile - Prisma Schema
**Problema**: Prisma schema não estava disponível durante `npm ci`
**Solução**: Copiar `prisma/` antes de executar `npm ci`
```dockerfile
COPY prisma ./prisma
RUN npm ci
```

### 2. Dependência Faltando
**Problema**: `@radix-ui/react-dropdown-menu` não estava no package.json
**Solução**: `npm install @radix-ui/react-dropdown-menu`

### 3. Diretório Public
**Problema**: Diretório `public/` não existia
**Solução**: Criado `public/.gitkeep` e ajustado Dockerfile
```dockerfile
COPY --chown=nextjs:nodejs ./public ./public
```

---

## 🧪 Testes de Produção

Para executar os smoke tests em produção:

```bash
export PROD_URL="https://prezzo.revolux.digital"
./scripts/tests/run-all-tests.sh
```

### Smoke Tests Disponíveis
- **ST-001**: Acessibilidade do site (HTTP 200/307)
- **ST-002**: Conectividade com banco de dados
- **ST-005**: Disponibilidade dos endpoints da API

---

## 🔗 Links Úteis

- **Dashboard Railway**: https://railway.app/project/4da4bf3c-3343-45f1-917a-c952cb1f8596
- **Logs do Serviço**: Use `railway logs --service prezzo`
- **Health Check**: https://prezzo.revolux.digital/api/health
- **Repositório**: https://github.com/revolutedigital/prezzo

---

## 📝 Comandos Railway CLI

```bash
# Ver status do projeto
railway status

# Ver logs em tempo real
railway logs --service prezzo

# Fazer novo deploy
railway up --service prezzo

# Adicionar variável de ambiente
railway variables --service prezzo --set "KEY=value"

# Ver variáveis configuradas
railway variables --service prezzo --json
```

---

## 🚨 Troubleshooting

### Deploy Falha
1. Verificar logs: `railway logs --service prezzo`
2. Verificar variáveis: `railway variables --service prezzo --json`
3. Testar build local: `npm run build`
4. Verificar Dockerfile: Syntax e paths corretos

### Banco de Dados Inacessível
1. Verificar DATABASE_URL está configurada
2. Verificar serviço Postgres: `railway status --json | jq '.services.edges[1]'`
3. Executar migrations: No Dockerfile já está configurado em CMD

### Site Retorna 404
1. Aguardar deployment finalizar (status: SUCCESS)
2. Verificar health check: `curl https://prezzo.revolux.digital/api/health`
3. Ver logs de runtime para erros

---

## ✅ Checklist de Deploy Bem-Sucedido

- [x] Projeto Railway criado
- [x] PostgreSQL provisionado
- [x] Variáveis de ambiente configuradas
- [x] Domínio customizado configurado
- [x] Build passou sem erros
- [ ] Deploy com status SUCCESS (em andamento)
- [ ] Health check respondendo (aguardando deploy)
- [ ] Site acessível em https://prezzo.revolux.digital (aguardando deploy)
- [ ] Smoke tests passando 100% (aguardando deploy)

---

**Última Atualização**: 2025-11-28 16:25 BRT
**Status**: Deploy em andamento (Build ID: 6fd4d323-3a50-441e-b8d4-a61ed46d3d4b)

# 🐳 Docker Setup - Prezzo

## 📦 Configuração Atual

O Prezzo está configurado para rodar com Docker nas seguintes portas:

- **PostgreSQL**: `localhost:8000`
- **Next.js**: `localhost:8001`

---

## 🚀 Como Usar

### Iniciar Apenas PostgreSQL (Desenvolvimento Local)

```bash
# Iniciar PostgreSQL
docker-compose up -d postgres

# Rodar aplicação localmente
npm run dev

# Acessar em http://localhost:8001
```

### Iniciar Tudo com Docker

```bash
# Build e iniciar todos os containers
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar containers
docker-compose down

# Resetar tudo (remove volumes)
docker-compose down -v
```

---

## 📂 Arquivos Docker

### docker-compose.yml
Define 3 serviços:
1. **postgres** - PostgreSQL 15 na porta 8000
2. **app** - Next.js em modo produção (porta 8001)
3. **dev** - Next.js em modo desenvolvimento com hot reload

### Dockerfile
Build multi-stage para produção:
- Stage 1: Instala dependências
- Stage 2: Build da aplicação
- Stage 3: Imagem final otimizada

### Dockerfile.dev
Build simples para desenvolvimento com hot reload.

---

## 🔧 Comandos Úteis

### Banco de Dados

```bash
# Acessar PostgreSQL
docker exec -it prezzo-postgres psql -U prezzo -d prezzo

# Backup do banco
docker exec prezzo-postgres pg_dump -U prezzo prezzo > backup.sql

# Restaurar backup
cat backup.sql | docker exec -i prezzo-postgres psql -U prezzo prezzo

# Ver logs do PostgreSQL
docker logs prezzo-postgres -f
```

### Prisma

```bash
# Executar migrations
docker-compose exec app npx prisma migrate deploy

# Prisma Studio (interface visual)
docker-compose exec app npx prisma studio

# Gerar Prisma Client
docker-compose exec app npx prisma generate

# Resetar banco (cuidado!)
docker-compose exec app npx prisma migrate reset
```

### Next.js

```bash
# Ver logs do app
docker logs prezzo-app -f

# Restart do app
docker-compose restart app

# Rebuild do app
docker-compose up -d --build app
```

---

## 🔐 Credenciais Padrão

**PostgreSQL:**
- Host: `localhost:8000`
- Usuário: `prezzo`
- Senha: `prezzo123`
- Database: `prezzo`

**Connection String:**
```
postgresql://prezzo:prezzo123@localhost:8000/prezzo?schema=public
```

⚠️ **IMPORTANTE:** Altere essas credenciais em produção!

---

## 🎛️ Variáveis de Ambiente

### .env (Desenvolvimento Local)
```env
DATABASE_URL="postgresql://prezzo:prezzo123@localhost:8000/prezzo?schema=public"
NEXTAUTH_URL="http://localhost:8001"
NEXTAUTH_SECRET="seu-secret-aqui"
```

### docker-compose.yml (Containers)
As variáveis são definidas diretamente no `docker-compose.yml`.

---

## 📊 Status dos Containers

```bash
# Ver status
docker-compose ps

# Ver uso de recursos
docker stats prezzo-postgres prezzo-app
```

**Saída esperada:**
```
NAME              STATUS                    PORTS
prezzo-postgres   Up (healthy)             0.0.0.0:8000->5432/tcp
prezzo-app        Up                       0.0.0.0:8001->3000/tcp
```

---

## 🐛 Troubleshooting

### Porta já em uso
```bash
# Verificar o que está usando a porta
lsof -i :8000
lsof -i :8001

# Matar processo
kill -9 <PID>
```

### Container não inicia
```bash
# Ver logs de erro
docker-compose logs

# Rebuild from scratch
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

### Banco não conecta
```bash
# Verificar se PostgreSQL está healthy
docker-compose ps

# Ver logs do PostgreSQL
docker logs prezzo-postgres

# Testar conexão manualmente
docker exec -it prezzo-postgres pg_isready -U prezzo
```

### Migrations falharam
```bash
# Entrar no container
docker exec -it prezzo-app sh

# Executar migrations manualmente
npx prisma migrate deploy

# Ver status
npx prisma migrate status
```

---

## 🔄 Workflow de Desenvolvimento

### Opção 1: Híbrido (Recomendado)
- PostgreSQL no Docker
- Next.js rodando localmente

```bash
# 1. Iniciar PostgreSQL
docker-compose up -d postgres

# 2. Rodar app localmente
npm run dev
```

**Vantagens:**
- Hot reload rápido
- Fácil debugging
- Menor uso de recursos

### Opção 2: Tudo no Docker
- Tudo em containers

```bash
docker-compose --profile dev up -d
```

**Vantagens:**
- Ambiente isolado
- Fácil compartilhar
- Evita "funciona na minha máquina"

---

## 📦 Volumes

```bash
# Listar volumes
docker volume ls

# Ver detalhes do volume do PostgreSQL
docker volume inspect prezzo_postgres_data

# Backup do volume
docker run --rm -v prezzo_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres-backup.tar.gz /data

# Restaurar backup
docker run --rm -v prezzo_postgres_data:/data -v $(pwd):/backup alpine sh -c "cd /data && tar xzf /backup/postgres-backup.tar.gz --strip 1"
```

---

## 🚢 Deploy

### Build para Produção

```bash
# Build da imagem
docker build -t prezzo:latest .

# Testar localmente
docker run -p 8001:3000 \
  -e DATABASE_URL="..." \
  -e NEXTAUTH_URL="https://seu-dominio.com" \
  -e NEXTAUTH_SECRET="secret-producao" \
  prezzo:latest
```

### Docker Compose em Produção

```bash
# Usar docker-compose.prod.yml (criar separado)
docker-compose -f docker-compose.prod.yml up -d
```

---

**Última atualização:** 26/11/2025
**Status:** PostgreSQL rodando na 8000, Next.js na 8001

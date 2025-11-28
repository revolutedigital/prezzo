# Guia de Deploy para Produção - Prezzo System

**Domínio**: https://prezzo.revolux.digital
**Versão**: 1.0
**Data**: 2025-11-28

---

## 🚀 Processo de Deploy

### **PRÉ-REQUISITOS**

1. ✅ Código commitado no repositório
2. ✅ Build local funcionando sem erros
3. ✅ Banco de dados de produção configurado
4. ✅ Variáveis de ambiente configuradas
5. ✅ Backup do banco de dados realizado

---

## 📋 CHECKLIST PRÉ-DEPLOY

### 1. **Preparação do Ambiente**

```bash
# 1. Garantir que está na branch correta
git branch
# Deve estar em: main ou production

# 2. Atualizar dependências
npm install

# 3. Executar build local
npm run build

# 4. Verificar se build passou
echo $?
# Deve retornar: 0
```

### 2. **Executar Migrations**

```bash
# Produção
DATABASE_URL="postgresql://user:pass@host:5432/prezzo_prod" npx prisma migrate deploy

# Verificar status
DATABASE_URL="postgresql://user:pass@host:5432/prezzo_prod" npx prisma migrate status
```

### 3. **Configurar Variáveis de Ambiente**

Certifique-se de que as seguintes variáveis estão configuradas no servidor de produção:

```bash
# .env.production
NODE_ENV=production
NEXTAUTH_URL=https://prezzo.revolux.digital
NEXTAUTH_SECRET=<secret-super-seguro-gerado>
DATABASE_URL=postgresql://user:pass@host:5432/prezzo_prod

# Opcional - Sentry, Analytics, etc
NEXT_PUBLIC_SENTRY_DSN=
NEXT_PUBLIC_GA_ID=
```

### 4. **Backup do Banco de Dados**

```bash
# Criar backup com timestamp
BACKUP_FILE="backup-prezzo-$(date +%Y%m%d-%H%M%S).sql"

pg_dump $DATABASE_URL > $BACKUP_FILE

# Verificar que backup foi criado
ls -lh $BACKUP_FILE

# GUARDAR ESTE ARQUIVO EM LOCAL SEGURO!
```

---

## 🧪 EXECUTAR TESTES PRÉ-DEPLOY

### **CRÍTICO: Testes em Staging**

```bash
# 1. Configurar URL de staging
export PROD_URL="https://staging.prezzo.revolux.digital"

# 2. Executar suite completa de testes
chmod +x scripts/tests/*.sh
./scripts/tests/run-all-tests.sh

# 3. Verificar resultado
# ✅ SE 100% PASSOU → Prosseguir com deploy
# ❌ SE QUALQUER FALHOU → NÃO FAZER DEPLOY!
```

---

## 🚢 EXECUTAR DEPLOY

### **Opção 1: Deploy via Vercel**

```bash
# 1. Deploy para produção
vercel --prod

# 2. Aguardar conclusão
# Vercel irá executar:
# - npm run build
# - Deploy automático
# - DNS update

# 3. Anotar URL de deploy
# Exemplo: https://prezzo-revolux-digital-xyz.vercel.app
```

### **Opção 2: Deploy via Docker**

```bash
# 1. Build da imagem
docker build -t prezzo:latest .

# 2. Tag para registry
docker tag prezzo:latest registry.revolux.digital/prezzo:latest

# 3. Push para registry
docker push registry.revolux.digital/prezzo:latest

# 4. Deploy no servidor
ssh user@server "docker pull registry.revolux.digital/prezzo:latest && docker-compose up -d"
```

### **Opção 3: Deploy via PM2**

```bash
# No servidor de produção

# 1. Pull do código
git pull origin main

# 2. Instalar dependências
npm ci --production

# 3. Build
npm run build

# 4. Restart PM2
pm2 restart prezzo
pm2 save

# 5. Verificar logs
pm2 logs prezzo --lines 50
```

---

## ✅ TESTES PÓS-DEPLOY (PRODUÇÃO)

### **OBRIGATÓRIO: Executar imediatamente após deploy**

```bash
# 1. Configurar URL de produção
export PROD_URL="https://prezzo.revolux.digital"

# 2. Aguardar 30 segundos para sistema estabilizar
sleep 30

# 3. Executar smoke tests
./scripts/tests/smoke-test-001.sh
./scripts/tests/smoke-test-002.sh
./scripts/tests/smoke-test-005.sh

# 4. Verificar health check
curl https://prezzo.revolux.digital/api/health | jq .

# RESULTADO ESPERADO:
# {
#   "status": "healthy",
#   "timestamp": "2025-11-28T...",
#   "responseTime": "Xms",
#   "service": "Prezzo API",
#   "environment": "production"
# }
```

### **Validação Manual Rápida** (2 minutos)

1. ✅ Acessar https://prezzo.revolux.digital
2. ✅ Fazer login com usuário de teste
3. ✅ Acessar dashboard
4. ✅ Criar uma matéria-prima de teste
5. ✅ Verificar que salvou corretamente
6. ✅ Deletar item de teste

---

## 📊 MONITORAMENTO PÓS-DEPLOY

### **Primeiras 24 horas**

```bash
# 1. Monitorar logs em tempo real
tail -f /var/log/prezzo/production.log

# OU via PM2
pm2 logs prezzo --lines 100

# 2. Monitorar métricas
# - CPU usage
# - Memory usage
# - Response time
# - Error rate

# 3. Verificar health check a cada 5 minutos
watch -n 300 'curl -s https://prezzo.revolux.digital/api/health | jq .'
```

### **Métricas de Sucesso (24h)**

- ✅ Uptime > 99.5%
- ✅ Error rate < 1%
- ✅ Average response time < 500ms
- ✅ Zero critical bugs
- ✅ Database connections estáveis

---

## 🔄 ROLLBACK (Se Necessário)

### **Critérios para Rollback Imediato**

- ❌ Site inacessível (500/502/503) por > 2 minutos
- ❌ Database connection failures
- ❌ Autenticação completamente quebrada
- ❌ > 50% de requests falhando
- ❌ Perda de dados detectada

### **Procedimento de Rollback**

```bash
# Tempo Estimado: 5-10 minutos

# 1. VERCEL - Reverter deploy
vercel rollback

# 2. DOCKER - Reverter para versão anterior
ssh user@server "docker-compose down && docker pull registry.revolux.digital/prezzo:previous && docker-compose up -d"

# 3. PM2 - Reverter código
git reset --hard HEAD~1
npm ci
npm run build
pm2 restart prezzo

# 4. RESTAURAR DATABASE (SE NECESSÁRIO)
psql $DATABASE_URL < backup-2025-11-28-123456.sql

# 5. VALIDAR que sistema voltou ao normal
./scripts/tests/run-all-tests.sh

# 6. NOTIFICAR EQUIPE
echo "Rollback executado às $(date)" | mail -s "ROLLBACK: Prezzo" team@revolux.digital
```

---

## 📞 CONTATOS DE EMERGÊNCIA

```
Tech Lead: _______________
DevOps: _______________
Database Admin: _______________
Product Owner: _______________

Slack Channel: #prezzo-alerts
PagerDuty: https://revolux.pagerduty.com/prezzo
```

---

## 📝 TEMPLATE DE COMUNICAÇÃO

### **Notificação de Deploy Bem-Sucedido**

```
📢 DEPLOY CONCLUÍDO - Prezzo System

✅ Status: SUCESSO
🌐 URL: https://prezzo.revolux.digital
📅 Data/Hora: 2025-11-28 15:00 BRT
🔢 Versão: 1.0.0
📊 Testes: 100% (3/3 passed)

✨ Principais Mudanças:
- Feature 1
- Feature 2
- Bug fix 1

📈 Métricas Pós-Deploy:
- Uptime: 100%
- Response Time: 150ms avg
- Error Rate: 0%

🔗 Health Check: https://prezzo.revolux.digital/api/health

Equipe: Dev Team
```

### **Notificação de Rollback**

```
⚠️ ROLLBACK EXECUTADO - Prezzo System

❌ Status: ROLLBACK
🌐 URL: https://prezzo.revolux.digital
📅 Data/Hora: 2025-11-28 15:30 BRT
🔢 Versão Revertida: 0.9.9

🔥 Motivo:
[Descrever problema crítico que causou rollback]

✅ Ação Tomada:
- Sistema revertido para versão anterior
- Database restaurado
- Testes validados: 100%

📊 Status Atual:
- Sistema: ESTÁVEL
- Uptime: Restaurado
- Usuários: Sem impacto

🔍 Próximos Passos:
1. Investigar causa raiz
2. Corrigir problema
3. Re-testar em staging
4. Novo deploy agendado

Equipe: Dev Team
```

---

## 🎯 CRITÉRIOS GO/NO-GO

### **✅ GO - Prosseguir com Deploy**

- ✅ Todos smoke tests passaram (100%)
- ✅ Build local sem erros
- ✅ Migrations testadas em staging
- ✅ Backup do banco realizado
- ✅ Variáveis de ambiente validadas
- ✅ Equipe ciente e disponível
- ✅ Horário apropriado (evitar horários de pico)

### **❌ NO-GO - NÃO Fazer Deploy**

- ❌ Qualquer smoke test falhou
- ❌ Build com erros ou warnings críticos
- ❌ Migrations não testadas
- ❌ Sem backup do banco
- ❌ Equipe não disponível para suporte
- ❌ Horário de pico de usuários
- ❌ Problemas conhecidos não resolvidos

---

## 🔒 SEGURANÇA

### **Checklist de Segurança**

- [ ] NEXTAUTH_SECRET é forte (min 32 caracteres)
- [ ] Database password é forte
- [ ] Nenhuma credencial commitada no código
- [ ] HTTPS configurado e funcionando
- [ ] CORS configurado corretamente
- [ ] Rate limiting habilitado
- [ ] Headers de segurança configurados
- [ ] Logs não expõem informações sensíveis

---

## 📚 DOCUMENTAÇÃO DE REFERÊNCIA

- [Plano de Testes Completo](./PLANO_TESTES_DEPLOY.md)
- [Scripts de Teste](./scripts/tests/)
- [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
- [Prisma Production Best Practices](https://www.prisma.io/docs/guides/deployment)

---

## 🎉 SUCESSO!

Se todos os passos foram seguidos e todos os testes passaram:

```
🚀 DEPLOY CONCLUÍDO COM SUCESSO!

Sistema Prezzo está rodando em:
https://prezzo.revolux.digital

Health Check:
https://prezzo.revolux.digital/api/health

Continue monitorando as métricas nas próximas 24 horas.
```

---

**Última Atualização**: 2025-11-28
**Responsável**: QA Team Enterprise
**Status**: ✅ PRONTO PARA PRODUÇÃO

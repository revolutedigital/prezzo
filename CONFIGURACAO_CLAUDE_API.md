# Configuração da Claude API para Prezzo AI

## 🔑 Obtendo a Chave da API

1. Acesse [console.anthropic.com](https://console.anthropic.com)
2. Crie uma conta ou faça login
3. Navegue até "API Keys"
4. Clique em "Create Key"
5. Dê um nome (ex: "Prezzo AI")
6. Copie a chave gerada (começa com `sk-ant-`)

## ⚙️ Configurando no Projeto

### Passo 1: Editar arquivo .env

Abra o arquivo `.env` na raiz do projeto e adicione sua chave:

```bash
# Claude API (para Prezzo AI - Fase 2)
CLAUDE_API_KEY="sk-ant-api03-sua-chave-aqui"
```

### Passo 2: Reiniciar o servidor

```bash
# Pare o servidor atual (Ctrl+C)
# Inicie novamente
npm run dev
```

## 💰 Custos Estimados

O Prezzo AI usa o modelo **Claude 3.5 Sonnet** (`claude-3-5-sonnet-20241022`).

### Preços (valores de referência, conferir site oficial)

- **Input**: ~$3.00 / 1M tokens
- **Output**: ~$15.00 / 1M tokens

### Estimativa por Nota Fiscal

Uma NF típica de 2-3 páginas consome aproximadamente:

- Input: ~3.000 tokens (texto do PDF + prompt)
- Output: ~500 tokens (JSON estruturado)

**Custo por NF:** ~$0.02 USD (2 centavos de dólar)

### Exemplo Mensal

- 100 NFs/mês = ~$2.00 USD
- 500 NFs/mês = ~$10.00 USD
- 1000 NFs/mês = ~$20.00 USD

## 🧪 Testando a Configuração

### Teste Rápido

1. Acesse a aplicação em `http://localhost:8001`
2. Faça login
3. Vá em **Prezzo AI** no menu
4. Clique em **Upload Nota Fiscal**
5. Selecione um arquivo PDF de nota fiscal
6. Aguarde o processamento (5-15 segundos)
7. Verifique se aparece como "Processado" ✅

### Verificar Erros

Se o processamento falhar:

1. **Verifique a chave no .env**

   ```bash
   cat .env | grep CLAUDE_API_KEY
   ```

2. **Verifique os logs do servidor**
   - Procure por erros relacionados a "Anthropic" ou "Claude"
   - Mensagem comum: "Invalid API Key"

3. **Teste a chave diretamente**

   ```bash
   # Criar arquivo teste.js
   node teste.js
   ```

   ```javascript
   // teste.js
   const Anthropic = require("@anthropic-ai/sdk");

   const client = new Anthropic({
     apiKey: process.env.CLAUDE_API_KEY,
   });

   async function test() {
     try {
       const message = await client.messages.create({
         model: "claude-3-5-sonnet-20241022",
         max_tokens: 1024,
         messages: [{ role: "user", content: "Hello, Claude!" }],
       });
       console.log("✅ API funcionando!");
       console.log(message.content[0].text);
     } catch (error) {
       console.error("❌ Erro:", error.message);
     }
   }

   test();
   ```

## 🔒 Segurança

### ⚠️ IMPORTANTE

1. **NUNCA** commite o arquivo `.env` no Git
   - Já está no `.gitignore`
   - Verifique sempre antes de fazer push

2. **NUNCA** compartilhe a chave da API
   - Trate como uma senha
   - Se exposta, revogue imediatamente no console da Anthropic

3. **Produçãoção**
   - Use variáveis de ambiente do servidor
   - Não deixe a chave hardcoded no código
   - Configure no Vercel/Heroku/AWS como secret

### Revogando Chaves Comprometidas

Se você acidentalmente expôs a chave:

1. Acesse [console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys)
2. Clique em "Revoke" na chave exposta
3. Crie uma nova chave
4. Atualize o `.env`
5. Reinicie o servidor

## 📊 Monitoramento de Uso

### Via Console Anthropic

1. Acesse [console.anthropic.com](https://console.anthropic.com)
2. Vá em "Usage" ou "Billing"
3. Visualize:
   - Tokens consumidos
   - Custos acumulados
   - Gráficos de uso

### Via Logs do Prezzo

Os logs do servidor mostram cada chamada:

```
POST /api/notas-fiscais
Processando NF: exemplo.pdf
Claude AI: processando...
Claude AI: 3250 tokens input, 480 tokens output
NF processada com sucesso
```

## 🆘 Suporte

### Problemas Comuns

#### 1. "Invalid API Key"

- Verifique se a chave está correta no `.env`
- Certifique-se de que não há espaços extras
- Verifique se a chave não foi revogada

#### 2. "Rate Limit Exceeded"

- Você excedeu o limite de requisições/minuto
- Aguarde alguns minutos
- Considere upgrade do plano

#### 3. "Insufficient Credits"

- Saldo da conta esgotado
- Adicione créditos no console da Anthropic
- Configure billing automático

### Contato Anthropic

- Website: [anthropic.com](https://www.anthropic.com)
- Documentação: [docs.anthropic.com](https://docs.anthropic.com)
- Support: support@anthropic.com

---

**Configuração concluída?** ✅

Volte para [FASE_2_PREZZO_AI_COMPLETO.md](./FASE_2_PREZZO_AI_COMPLETO.md) para ver a documentação completa do sistema.

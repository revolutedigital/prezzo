# 📖 Guia do Usuário - Prezzo

**Sistema Inteligente de Precificação**

---

## 🎯 Bem-vindo ao Prezzo!

Este guia irá ajudá-lo a usar todas as funcionalidades do sistema de forma eficiente.

---

## 📚 Índice

1. [Primeiros Passos](#primeiros-passos)
2. [Gestão de Matérias-Primas](#gestão-de-matérias-primas)
3. [Cadastro de Produtos](#cadastro-de-produtos)
4. [Criação de Orçamentos](#criação-de-orçamentos)
5. [Prezzo AI - Automação](#prezzo-ai---automação)
6. [Relatórios e Análises](#relatórios-e-análises)
7. [Dicas e Boas Práticas](#dicas-e-boas-práticas)

---

## 🚀 Primeiros Passos

### 1. Acesso ao Sistema

1. Acesse o Prezzo em: `http://localhost:8001` (desenvolvimento) ou seu domínio em produção
2. Faça login com suas credenciais
3. Você será direcionado ao Dashboard principal

### 2. Visão Geral do Dashboard

O Dashboard mostra:
- **KPIs principais**: Matérias-primas, produtos, orçamentos
- **Taxa de conversão**: % de orçamentos aprovados
- **Valor total aprovado**: Receita total
- **Gráficos**: Evolução de orçamentos por mês
- **Alertas de custo**: Atualizações pendentes (se houver)
- **Top produtos**: Mais vendidos
- **Orçamentos recentes**: Últimas atividades

---

## 📦 Gestão de Matérias-Primas

### Como Cadastrar uma Matéria-Prima

1. No menu lateral, clique em **"Matérias-Primas"**
2. Clique no botão **"+ Nova Matéria-Prima"**
3. Preencha os campos:
   - **Nome**: Ex: "Grade de Ferro"
   - **Código**: (opcional) Ex: "GRFE001"
   - **Unidade de Medida**: metro, kg, litro, unidade, caixa
   - **Custo Unitário**: Valor atual (R$)
   - **Fornecedor**: (opcional) Nome do fornecedor
   - **Categoria**: (opcional) Para organização
4. Clique em **"Salvar"**

### Editar/Excluir Matéria-Prima

- **Editar**: Clique no ícone de lápis na linha da matéria-prima
- **Excluir**: Clique no ícone de lixeira (⚠️ cuidado: afeta produtos)

### Dicas

- Use códigos padronizados para facilitar a busca
- Mantenha sempre os custos atualizados
- Use o Prezzo AI para atualização automática via NF

---

## 🛍️ Cadastro de Produtos

### Estrutura de Produtos no Prezzo

O Prezzo trabalha com 3 níveis:

1. **Tipo de Produto**: Ex: "Filtro de Alumínio"
2. **Variação do Produto**: Ex: "Grade de Ferro", "Grade de Cobre"
3. **Item de Produto**: Produto final com preço calculado

### Passo 1: Criar um Tipo de Produto

1. Menu **"Produtos"** > **"Tipos de Produto"**
2. Clique em **"+ Novo Tipo"**
3. Preencha:
   - **Nome**: Ex: "Filtro de Alumínio"
   - **Código**: (opcional)
   - **Categoria**: (opcional)
   - **Descrição**: (opcional)
4. Salvar

### Passo 2: Criar Variação e Composição

1. Na lista de tipos, clique em **"Ver Variações"**
2. Clique em **"+ Nova Variação"**
3. Preencha:
   - **Nome**: Ex: "Grade de Ferro"
   - **Margem Padrão**: Ex: 40% (será usada por padrão)
4. **Adicionar Composição** (matérias-primas):
   - Busque uma matéria-prima
   - Informe a quantidade: Ex: 2 metros
   - Adicione quantas precisar
5. O sistema calcula automaticamente o **Custo Total**
6. Salvar

### Passo 3: Criar Item de Produto (Preço Final)

1. Na variação criada, clique em **"Criar Item de Produto"**
2. Escolha:
   - **Margem de Lucro**: Use a padrão ou customize
   - **Tabela de Preço**: padrão, atacado, especial
3. O sistema calcula automaticamente:
   - **Custo Calculado**: Soma das matérias-primas
   - **Preço de Venda**: Custo + Margem

### Exemplo Prático

```
Tipo: Filtro de Alumínio
  └─ Variação: Grade de Ferro (Margem padrão: 40%)
      └─ Composição:
          • Filtro alumínio: 2m × R$ 45/m = R$ 90
          • Grade ferro: 1.5m × R$ 30/m = R$ 45
          • Parafusos: 8un × R$ 0,50/un = R$ 4
          = Custo Total: R$ 139
      └─ Item de Produto:
          • Margem: 40%
          • Preço Venda: R$ 194,60
```

---

## 💰 Criação de Orçamentos

### Passo a Passo

1. Menu **"Orçamentos"** > **"+ Novo Orçamento"**

2. **Dados do Cliente**:
   - Nome (obrigatório)
   - Email, Telefone, CNPJ/CPF (opcionais)
   - Validade (padrão: 15 dias)
   - Observações (opcional)

3. **Adicionar Produtos**:
   - Clique em **"+ Adicionar Produto"**
   - Busque o produto desejado
   - Selecione a variação
   - Informe a quantidade
   - (Opcional) Aplique desconto no item
   - Adicione ao orçamento

4. **Finalização**:
   - Revise os itens
   - (Opcional) Aplique desconto geral (% ou R$)
   - O sistema calcula automaticamente:
     - Subtotal
     - Desconto total
     - **Total final**

5. **Ações**:
   - **Salvar Rascunho**: Salva para editar depois
   - **Gerar PDF**: Cria PDF profissional para envio
   - **Marcar como Enviado**: Muda status para "Enviado"

### Status do Orçamento

- 🔵 **Rascunho**: Em edição, pode ser alterado
- 🟡 **Enviado**: Enviado ao cliente, aguardando resposta
- 🟢 **Aprovado**: Cliente aceitou
- 🔴 **Rejeitado**: Cliente recusou
- ⚫ **Expirado**: Passou da validade

### Dicas

- Sempre revise o orçamento antes de enviar
- Use o PDF gerado (visual profissional)
- Atualize o status conforme feedback do cliente
- Orçamentos aprovados contam para estatísticas de rentabilidade

---

## 🤖 Prezzo AI - Automação

### O que é o Prezzo AI?

Sistema inteligente que processa Notas Fiscais automaticamente e sugere atualizações de custo.

### Como Usar

#### 1. Upload da Nota Fiscal

1. Menu **"Prezzo AI"**
2. Clique em **"Upload Nota Fiscal"** ou arraste o PDF
3. Apenas arquivos PDF são suportados
4. O sistema processa automaticamente (5-15 segundos)

#### 2. Processamento Automático

A IA do Claude extrai:
- ✅ Fornecedor
- ✅ Número da NF
- ✅ Data de Emissão
- ✅ Valor Total
- ✅ Lista de itens com preços

#### 3. Matching Inteligente

O sistema tenta associar automaticamente cada item da NF com suas matérias-primas cadastradas usando:
- Nome exato
- Nome parcial + unidade
- Palavras-chave

#### 4. Revisão e Confirmação

1. Clique em **"Revisar"** na NF processada
2. Você verá:
   - **Atualizações Pendentes**: Diferenças de custo detectadas
   - Para cada atualização:
     - Custo anterior vs. novo
     - % de variação (↑ aumento / ↓ redução)
     - Nível de impacto (Alto/Médio/Baixo)

3. **Selecione** quais atualizações confirmar:
   - Use checkboxes individuais
   - Ou "Selecionar Todas"

4. Clique em **"Confirmar X Selecionada(s)"**

#### 5. O que acontece ao confirmar?

✅ Atualiza o custo da matéria-prima
✅ Registra no histórico de custos
✅ **Recalcula AUTOMATICAMENTE** todos os produtos que usam essa matéria-prima
✅ Atualiza preços de venda mantendo as margens

### Nível de Impacto

- 🔴 **Alto** (>20%): Atenção! Grande mudança de custo
- 🟠 **Médio** (10-20%): Mudança moderada
- 🔵 **Baixo** (<10%): Pequena variação

### Dicas

- ✅ Revise sempre antes de confirmar
- ⚠️ Atenção para variações acima de 20%
- 📊 Verifique o impacto nos produtos afetados
- 💾 O histórico fica registrado permanentemente

---

## 📊 Relatórios e Análises

### Dashboard Principal

Acesso rápido a métricas essenciais:
- Total de matérias-primas, produtos, orçamentos
- Taxa de conversão (aprovados / enviados)
- Valor total e ticket médio
- Gráficos de evolução

### Widget de Alertas de Custo

Aparece no dashboard quando há atualizações pendentes:
- Resumo por nível de impacto
- Top 5 atualizações aguardando
- Link direto para Prezzo AI

### Relatórios Detalhados

Menu **"Relatórios"** com 3 abas:

#### 1. Margens por Produto

**O que mostra**:
- Margem média geral
- Produtos com margem baixa (<20%)
- Produtos com alta margem (>35%)
- Tabela detalhada de todos os produtos

**Como usar**:
- Identifique produtos com margem problemática
- Considere reajustar preços ou negociar fornecedores
- Compare margens entre tipos de produto

#### 2. Evolução de Custos

**O que mostra**:
- Total de atualizações de custo
- Aumentos vs. Reduções
- Variação média
- Gráficos de evolução temporal (Top 3 materiais)
- Histórico completo de mudanças

**Como usar**:
- Acompanhe tendências de custo
- Identifique matérias-primas voláteis
- Planeje reajustes de preço antecipadamente

#### 3. Rentabilidade

**O que mostra**:
- Total em vendas (orçamentos aprovados)
- Custo total vs. Lucro total
- Margem global do negócio
- Top 5 clientes por faturamento
- Análise detalhada por orçamento

**Como usar**:
- Avalie a saúde financeira do negócio
- Identifique clientes mais valiosos
- Analise se descontos estão impactando lucro
- Tome decisões baseadas em dados reais

---

## 💡 Dicas e Boas Práticas

### Organização

✅ **Use códigos padronizados** para matérias-primas e produtos
✅ **Categorize** materiais para facilitar buscas
✅ **Mantenha nomes descritivos** e consistentes

### Custos

✅ **Atualize custos regularmente** (manual ou via Prezzo AI)
✅ **Revise margens periodicamente** (mercado muda)
✅ **Use o histórico** para análise de tendências

### Orçamentos

✅ **Defina validade adequada** (geralmente 15-30 dias)
✅ **Seja claro nas observações** para o cliente
✅ **Atualize status prontamente** (enviado → aprovado/rejeitado)
✅ **Gere PDF profissional** antes de enviar

### Prezzo AI

✅ **Processe NFs regularmente** (não acumule)
✅ **Revise antes de confirmar** atualizações
✅ **Atenção para variações altas** (>20%)
✅ **Mantenha materiais bem cadastrados** para melhor matching

### Relatórios

✅ **Consulte semanalmente** para acompanhar negócio
✅ **Identifique produtos com margem baixa** e tome ação
✅ **Use dados para negociar** com fornecedores
✅ **Acompanhe evolução** de custos ao longo do tempo

---

## 🆘 Problemas Comuns e Soluções

### "Produto não aparece ao criar orçamento"

✔️ Verifique se o **Item de Produto** foi criado (não basta ter variação)
✔️ Confirme se está marcado como **ativo**

### "NF processada mas sem atualizações"

✔️ Itens da NF não foram associados a matérias-primas
✔️ Custos já estão iguais aos da NF
✔️ **Solução**: Revise nomes das matérias-primas para facilitar matching

### "Custo do produto não atualiza"

✔️ Certifique-se de que confirmou as atualizações no Prezzo AI
✔️ Verifique se a composição está correta
✔️ O recálculo é automático após confirmação

### "Margem muito baixa"

✔️ Verifique se custos estão atualizados
✔️ Considere reajustar preço de venda
✔️ Avalie negociação com fornecedor
✔️ Use relatório de Margens para identificar

---

## 📞 Suporte

Precisa de ajuda?

- 📖 **Documentação técnica**: Ver arquivos .md no projeto
- 🐛 **Reportar bug**: GitHub Issues
- 💬 **Sugestões**: Entre em contato com a equipe

---

## 🎓 Próximos Passos

Agora que você conhece o sistema:

1. ✅ Cadastre suas matérias-primas
2. ✅ Crie seus primeiros produtos
3. ✅ Gere um orçamento de teste
4. ✅ Experimente o Prezzo AI com uma NF
5. ✅ Explore os relatórios

**Bom trabalho e boas vendas com o Prezzo! 🚀**

---

**Última atualização:** Novembro 2025
**Versão do Prezzo:** 1.0.0

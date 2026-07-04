# Consolidação de UX — auditoria de redundância

## O problema
O painel tinha **31 telas** em 7 grupos, com a mesma informação repetida em vários
lugares. Vendas do dia apareciam em 6 telas diferentes; a IA estava espalhada em
5 telas com propósitos sobrepostos.

## Redundâncias identificadas

| Informação | Onde aparecia (antes) |
|---|---|
| Vendas/faturamento do dia | Resumo, Proprietário, Caixa do dia, Relatórios, Fechar caixa, 2º Cérebro |
| Fiado em aberto | Fiado, Quinzena, Caixa do dia, Proprietário, 2º Cérebro |
| KPIs/insights de IA | Consultor IA, Central CEO, 2º Cérebro, Tarefas IA, Centro IA (5 telas!) |
| Despesas | Despesas, Fechar caixa, Relatórios |
| Produtos | Cardápio, ERP Produtos, Eng. Cardápio |

## O que foi consolidado (nenhuma função removida)

### 💰 Dinheiro: 4 telas → 1 página
**Antes:** Caixa do dia · Relatórios · Fechar caixa · Despesas (4 abas separadas)
**Agora:** uma página "Caixa & Relatórios" com:
- **KPIs do dia no topo** (Recebido, Fiado, Despesas, Líquido) — o resumo destacado
- Seções internas: Caixa do dia | Relatórios | Despesas (os mesmos componentes)
- **Fechar caixa foi movido para o grupo Operação**, ao lado do Balcão — é rotina
  de fim de expediente de quem opera, não relatório

### 🧠 IA: 5 telas → 1 central
**Antes:** 2º Cérebro, Central CEO, Tarefas IA, Consultor (grupo IA) + Centro IA
(escondido no grupo Clientes)
**Agora:** uma página "Central IA" com seções: Central CEO | 2º Cérebro | Tarefas |
Agentes & Eventos | Consultor. O grupo Clientes ficou só com Clientes.

### 🛎️ Balcão ganhou desconto
Campo de desconto (% ou R$) na finalização da venda:
- Subtotal, desconto e total aparecem discriminados
- Todo desconto é **registrado em auditoria** (`DISCOUNT_APPLIED`) com o nome do
  operador, valores e horário — proteção contra abuso
- O pedido guarda `subtotal`, `descontoValor` e `descontoTipo`

## Estrutura final da navegação

| Grupo | Conteúdo |
|---|---|
| 🍽️ Operação | Resumo · Proprietário · Balcão · Pedidos · Cozinha · **Fechar caixa** · Minhas Vendas |
| 💰 Dinheiro | **Caixa & Relatórios** (página única com KPIs + 3 seções) |
| 📒 Fiado | Em aberto · Fechar quinzena · Histórico |
| 📖 Cardápio | Cardápio · Receitas/CMV · Eng. Cardápio · ERP (produtos/insumos/fornecedores/compras) |
| ⭐ Clientes | Clientes |
| 👥 Equipe | Pessoas · Comissões · Horários · Senhas e metas |
| 🧠 IA | **Central IA** (página única com 5 seções) |

De 31 telas navegáveis para **20**, sem perder nenhuma função.

## Próximas consolidações recomendadas (futuras)
1. **Cardápio + ERP Produtos** → fonte única de produtos (hoje são dois cadastros)
2. **Resumo + Proprietário + 2º Cérebro** → um único dashboard executivo
3. **Fiado + Quinzena** → uma página com o fechamento como ação, não como aba

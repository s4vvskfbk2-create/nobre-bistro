# Mapa: especificação ERP inteligente × sistema atual

Princípio aplicado: **IA só onde agrega (interpretação, visão, texto); todo
cálculo, regra e automação é código tradicional auditável.** Nada existente
foi removido — apenas estendido.

## Legenda: ✅ existe · 🟡 parcial · ❌ falta

### 1. Camada tradicional (sem IA)

| Módulo | Status | Onde / o que falta |
|---|---|---|
| 1.1 Financeiro | 🟡 | ✅ Caixa dia, relatórios, despesas, ticket médio, **DRE automática + ponto de equilíbrio + venda mínima diária (novo)**. ❌ contas a pagar/receber com vencimento, fluxo 30/60/90, pró-labore, taxas de cartão |
| 1.2 Estoque | ✅ | Entrada (nota por foto), baixa por venda (ficha técnica), perdas com custo, validade + alertas, mínimo, inventário físico, stock_movements (histórico completo), rastreabilidade por fornecedor via compras |
| 1.3 Compras | 🟡 | ✅ Fornecedores, compras/compra_itens (nota-fiscal grava — novo), histórico de preços (ingrediente_precos automático — novo). ❌ lista de compra sugerida por consumo médio, comparação de fornecedores, pedido de compra com status |
| 1.4 Fichas técnicas | ✅ | Custo/porção, CMV, preço sugerido, sub-receitas, rendimento, **recálculo automático em cascata quando insumo muda de preço (trigger no banco — novo)**, histórico de custo (ingrediente_precos). 🟡 fator de correção/cocção (campo fc existe, não usado na UI) |
| 1.5 Produção | ❌ | Ordem de produção, pré-preparo, mise en place — próxima fase |
| 1.6 Eng. de cardápio | ✅ | Matriz popularidade × margem (TabEngCardapio). ❌ simulação de aumento de preço |
| 1.7 CRM | 🟡 | ✅ Histórico, recorrência, ticket, inativos (agente clientes). ❌ aniversário, restrições, segmentação RFV formal, campanhas por segmento |
| 1.8 Equipe | 🟡 | ✅ Cadastro, comissões, metas, ranking, horários. ❌ escala, faltas, treinamentos |
| 1.9 Pedidos | ✅ | Balcão/app/mesa, status, cancelamento auditado, tempo de preparo, impressão de comanda, desconto auditado, WhatsApp (fiado) |
| 1.10 Eventos | ❌ | Fase futura |
| 1.11 Seg. alimentar | ❌ | Checklists/POPs — fase futura (validade já coberta em 1.2) |
| 1.12 Manutenção | ❌ | Fase futura |
| 1.13 Dashboard | 🟡 | ✅ Resumo, Proprietário, KPIs do dia no hub Dinheiro. ❌ giro de estoque, retenção, caixa projetado |

### 2. Camada de inteligência (IA desacoplada — sistema funciona sem ela)

| Módulo | Status | Observação |
|---|---|---|
| 2.1 Consultor IA | ✅ | TabConsultor + análise integrada no Centro IA (recebe só métricas agregadas, nunca o banco inteiro) |
| 2.2 Modo CEO | ✅ | Central CEO + agentes: detecção por regras (sem custo), explicação/priorização opcional por IA |
| 2.3 Resumo diário | ✅ | enviar_resumo_diario() — coleta/cálculo em SQL, envio via WhatsApp |
| 2.4 Anomalias | ✅ | 6 agentes determinísticos (queda de vendas vs média, CMV>40%, fiado estourado, atrasos, cancelamentos) — thresholds e médias, IA só na análise de vendas opcional |
| 2.5 Previsão de demanda | ❌ | Fase 2: médias móveis por dia da semana (sem IA) |
| 2.6 Nota fiscal por foto | ✅ | IA só extrai; validação/estoque/custos/histórico/compras = código tradicional; fichas recalculam via trigger |
| 2.7 Marketing IA | ❌ | Fase 3 |
| 2.8 Reputação | ❌ | Fase 3 |
| 2.9 Base de conhecimento | 🟡 | 2º Cérebro tem regras da casa; falta Q&A da equipe |

### 4. Custo baixo com IA — ✅ implementado por construção
Agentes rodam por regras (custo zero); IA só em: análise diária de vendas (1
chamada/dia), leitura de nota (por demanda), consultor (por demanda). Nunca por
venda ou movimentação. Fallback total: sem ANTHROPIC_API_KEY tudo continua.

### 5. Motor de ações aprovadas — ✅ implementado (novo)
Recomendações dos agentes agora têm **Aprovar / Ignorar** no Centro IA:
aprovar cria tarefa (ai_tasks) e registra RECOMMENDATION_APPROVED em auditoria;
status: new → accepted/dismissed/done. A IA nunca altera dados críticos sozinha.

## Próximas fases (ordem sugerida)
1. **Fase A (sem IA): ✅ CONCLUÍDA** — lista de compras sugerida (consumo médio 30d × 7 dias de cobertura + mínimo, com envio por WhatsApp, em Compras) · contas a pagar/receber (hub Dinheiro → 📆 Contas, com vencidas/vence em Xd e totais 30d) · previsão de vendas por dia da semana (média das últimas 4 semanas, no DRE) · simulação de preço na ficha técnica (novo CMV%, margem/un e ganho por 100 vendas)
2. **Fase B (sem IA):** produção/pré-preparo · escala da equipe · giro de estoque no dashboard
3. **Fase C (IA controlada):** marketing (campanhas para inativos usando o agente clientes) · Q&A da base de conhecimento · reputação
4. **Fase D (futuro):** eventos · manutenção · segurança alimentar · voz · visão computacional

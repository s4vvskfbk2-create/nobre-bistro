# Auditoria técnica — Nobre Bistro

## Correções aplicadas nesta auditoria

1. **HeroCarousel do cardápio v2 quebrava no swipe para a esquerda**
   - Problema: uso de `DESTAQUES.length`, variável inexistente.
   - Correção: trocado para `destaques.length`.
   - Proteção adicional: o timer não inicia quando não há destaques e reinicia corretamente quando a quantidade de destaques muda.

2. **Migration incompatível com os status reais do app**
   - Problema: o schema novo aceitava status em inglês (`done`, `cancelled`, `in_production`), mas o app atual usa status em português (`concluido`, `cancelado`, `em_curso`, `aguardando_pagamento`).
   - Correção: constraints de `orders.status` e `orders.payment_status` agora aceitam os dois vocabulários durante a fase de migração.

3. **Migration incompatível com prioridades/status das Tarefas IA**
   - Problema: a tabela `ai_tasks` aceitava `high/medium/low`, mas a Central CEO atual gera `alta/media/baixa` e status `aberta/concluida`.
   - Correção: constraints de `ai_tasks` e `ai_recommendations` aceitam os termos atuais em português e os termos futuros em inglês.

4. **View executiva ignorava dados legados**
   - Problema: `v_ai_daily_context` só somava status `done` e `cancelled`.
   - Correção: a view agora considera também `concluido` e `cancelado`.

## Riscos ainda pendentes

1. Pedidos, produtos, chamados, despesas e fechamentos ainda são gravados como arrays em `config` em várias telas críticas. Isso pode causar sobrescrita em uso concorrente.
2. O app ainda usa chave anon no front. As políticas RLS temporárias da migration são amplas para viabilizar migração, mas precisam ser substituídas por auth real antes de produção.
3. A Central CEO ainda salva tarefas em `config`; o próximo passo é migrar para `ai_tasks`.
4. Pagamento ainda não possui conciliação/webhook real.
5. Produtos do cardápio e produtos/receitas do ERP ainda não são uma fonte única.

## Próximo conserto recomendado

Migrar primeiro `nb_bA_orders` e `nb_bA_chamados` para `orders`, `order_items` e `table_calls`, mantendo fallback de leitura do `config` só durante transição.

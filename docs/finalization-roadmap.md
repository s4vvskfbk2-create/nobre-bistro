# Nobre Bistro — Finalização e revisão técnica

Este documento consolida a revisão do trabalho atual e a trilha para finalizar o projeto como um sistema de gestão empresarial com IA.

## Revisão do estado atual

- O cardápio público e o admin ainda usam chaves JSON em `config` (`nb_bA_orders`, `nb_bA_products`, `nb_bA_chamados`) para dados críticos. Isso foi útil para o MVP, mas precisa migrar para tabelas normalizadas.
- A migração estrutural começou em modo **write-through**: os fluxos críticos continuam gravando no `config` como fallback operacional, mas também tentam gravar nas tabelas reais (`orders`, `order_items`, `payments`, `credit_entries`, `table_calls`, `cash_sessions`, `cash_movements`, `ai_tasks`, `ai_recommendations`, `system_events`).
- A Central CEO com IA e Tarefas IA já criam uma primeira camada de decisão acionável, mas as tarefas ainda devem ir para a tabela `ai_tasks`.
- O ERP de ingredientes/fichas/compras já existe em tabelas e deve virar a fonte única para produto, custo, CMV e baixa de estoque.
- Eventos e auditoria já existem parcialmente e devem ser padronizados em todos os fluxos.

## Próximas fases

1. **Banco de dados empresarial**
   - Aplicar `supabase/migrations/20260630000000_core_management_schema.sql`.
   - Migrar pedidos, itens, pagamentos, chamados e tarefas IA de `config` para tabelas.
   - Validar a fase write-through comparando contagens entre `config` e tabelas normalizadas antes de desligar o fallback JSON.

2. **Camada de serviços**
   - Criar `OrderService`, `PaymentService`, `InventoryService`, `AIService` e `EventService` no front atual ou numa camada JS separada.
   - Parar de escrever arrays inteiros em `config` em telas críticas.
   - Estado atual: a primeira camada já existe no admin como `OrderService`, `PaymentService`, `CreditService`, `InventoryService`, `ProductService`, `StaffService`, `AIService` e `EventService`, com gravação best-effort nas tabelas reais e fallback JSON para não parar a operação.

3. **Fluxo operacional coeso**
   - Pedido criado -> pagamento -> cozinha -> baixa de estoque -> financeiro -> IA/tarefas.
   - Chamado de mesa em `table_calls`.
   - Fechamento de caixa em `cash_sessions` e `cash_movements`.

4. **IA como motor de ação**
   - Salvar recomendações em `ai_recommendations`.
   - Converter recomendações aceitas em `ai_tasks`.
   - Medir resultado de tarefas concluídas.

5. **Financeiro e CRM**
   - Conciliação de pagamentos.
   - Fiado em `credit_entries`.
   - Clientes e fidelidade ligados a `customers` e pedidos reais.

6. **Produção**
   - Trocar políticas temporárias RLS por regras por papel.
   - Adicionar auth real para gerente/atendente/cozinha.
   - Configurar domínio, PWA, backups, monitoramento e checklist de operação.

## Ordem recomendada de implementação

1. Aplicar migration.
2. Implementar escrita/leitura de pedidos em `orders` e `order_items` mantendo fallback para `config` durante migração.
3. Migrar chamados para `table_calls`.
4. Migrar Tarefas IA para `ai_tasks`.
5. Migrar pagamentos para `payments`.
6. Unificar produto cardápio com ERP/ficha técnica.
7. Endurecer RLS/auth.

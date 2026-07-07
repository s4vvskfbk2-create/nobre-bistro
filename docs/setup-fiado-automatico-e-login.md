# Setup — Fiado automático (WhatsApp) e Login com token

Este guia ativa as duas novidades. **Siga a ordem** — cada etapa funciona de forma
independente e nada quebra se você parar no meio.

---

## Como funciona o fiado automático

1. **Na hora da marcação:** ao lançar um fiado no Balcão, o sistema chama a função
   `fiado-notify`, que monta a mensagem (itens, valor, desconto e total em aberto),
   registra na tabela `notifications` e envia pelo WhatsApp do restaurante.
   O botão manual (wa.me) continua abrindo como redundância.
2. **A cada 15 dias (dia 1 e dia 16, às 09:00 de Brasília):** o banco executa
   `fechar_quinzena_automatica()`, que para cada profissional com fiado em aberto:
   - monta o **relatório completo** (cada consumo com data, itens e valor);
   - aplica o **desconto** da profissional e calcula o valor líquido;
   - **fecha a conta** (marca tudo como pago, encerra os `credit_entries`);
   - envia o relatório por WhatsApp e registra o evento `QUINZENA_ACERTADA`.
3. **Reenvio:** um dispatcher roda a cada 30 min e reenvia qualquer mensagem
   pendente (ex.: WhatsApp configurado depois, instabilidade da Meta). Nada se perde:
   tudo fica em `public.notifications` com status `pending/sent/failed`.

> O fechamento manual pela aba **Quinzena** continua funcionando normalmente.
> Cadastre o **telefone** de cada profissional na aba **Equipe** — sem telefone a
> mensagem fica registrada mas não é enviada.

---

## Etapa 1 — Migrations (SQL Editor do Supabase)

Execute na ordem, se ainda não executou:

1. `20260630000000_core_management_schema.sql`
2. `20260701000000_security_hardening.sql` (login server-side com bcrypt)
3. `20260702000000_fiado_automation.sql` (notifications + quinzena automática + agendamento)
4. `20260703000000_realtime.sql` (pedidos e chamados em tempo real no painel)
5. `20260704000000_ai_agents_scheduler.sql` (ativa os 6 agentes de IA + execução horária)
6. `20260705000000_estoque_avancado_e_resumo.sql` (perdas/validade/inventário + resumo diário do dono)

## Etapa 2 — Publicar as Edge Functions

```bash
supabase functions deploy fiado-notify
supabase functions deploy auth-login
supabase functions deploy agente-executor
supabase functions deploy pix-gateway --no-verify-jwt   # --no-verify-jwt é necessário para o webhook do Mercado Pago
```

### Resumo diário + alertas críticos no WhatsApp do dono

1. No painel: **Equipe → Senhas e metas → WhatsApp do proprietário** — salve seu celular.
2. Todo dia às 22h30 (Brasília) chega o resumo: vendas, pedidos, ticket, fiado, perdas, cancelamentos e prato mais vendido.
3. Alertas críticos dos agentes (pedido travado 45+ min, insumo em falta/vencendo, fiado estourado) chegam na hora, assim que o agente roda.
4. Teste sem esperar: `select public.enviar_resumo_diario();` no SQL Editor.

### PIX automático (Mercado Pago)

1. Crie a conta em mercadopago.com.br e pegue o **Access Token de produção**
   (Suas integrações → Credenciais).
2. Secret `MP_ACCESS_TOKEN` no Supabase (Edge Functions → Secrets).
3. No painel do Mercado Pago, configure o webhook (evento *Pagamentos*) para:
   `https://zxpnguynjrsixsomaieg.supabase.co/functions/v1/pix-gateway?source=mp`
4. Pronto: o cardápio passa a gerar **QR PIX dinâmico com confirmação automática** —
   quando o cliente paga, o pedido é marcado como pago e vai para a cozinha sozinho.
   Sem o token configurado, o cardápio continua com a chave estática (fallback automático).

### 📸 Nota fiscal por foto (aba ERP → Insumos)

1. Requer o secret `ANTHROPIC_API_KEY` (o mesmo dos agentes de IA).
2. Botão **"📸 Nota fiscal"** → tire a foto da nota/cupom → a IA extrai itens,
   quantidades e preços e já casa com os insumos cadastrados.
3. Confira a tela de revisão (pode ajustar qtd/preço, escolher em qual insumo
   somar ou criar um novo) → **Confirmar entrada**.
4. O sistema dá entrada no estoque, atualiza o custo unitário (o CMV das
   receitas acompanha) e registra tudo em `stock_movements` + auditoria.

### Perdas, validade e inventário (aba ERP → Insumos)

- **Perda**: botão "Perda" em cada insumo — quantidade + motivo; baixa o estoque,
  calcula o custo da perda e registra em `stock_movements` + auditoria.
- **Validade**: campo no cadastro; badge vermelho/laranja quando vencido ou
  vencendo em 3 dias, e o agente de estoque cria tarefa automaticamente.
- **Inventário**: botão "📋 Inventário" — conte as prateleiras, digite o valor real
  de cada item e aplique; as diferenças são ajustadas e auditadas.
- As perdas do dia entram no resumo diário do proprietário.

### Os 6 agentes de IA (agente-executor)

| Agente | Quando roda | O que vigia |
|---|---|---|
| Operação | a cada hora | pedidos há 45+ min na cozinha, chamados de mesa sem atendimento, cancelamentos |
| Vendas | diário 08h | queda de faturamento vs. média, produto destaque, análise estratégica com IA* |
| Fiado | diário 10h | profissionais acima do limite, fiado antigo sem acerto |
| Estoque/CMV | diário 22h | insumos no estoque mínimo (gera lista de compras), receitas com CMV > 40% |
| Financeiro | diário 23h | fiado comprometendo o caixa do dia, pedidos concluídos sem pagamento |
| Clientes | semanal | clientes recorrentes sumidos há 30+ dias (campanha de retorno) |

As recomendações e tarefas aparecem automaticamente na aba **Centro IA**, onde
também há o botão **"Rodar todos os agentes agora"** para testar sem esperar o
horário. \*A análise com IA exige o secret `ANTHROPIC_API_KEY` (o mesmo do
Consultor IA) — sem ele, os agentes rodam só com as regras (sem custo).

## Etapa 3 — Secrets (Dashboard → Edge Functions → Secrets)

| Secret | Valor | Para quê |
|---|---|---|
| `WHATSAPP_TOKEN` | Token permanente da Meta Cloud API | Envio real de WhatsApp |
| `WHATSAPP_PHONE_ID` | ID do número no WhatsApp Business | Envio real de WhatsApp |
| `NB_JWT_SECRET` | Copie de Project Settings → API → JWT Secret | Token de sessão do login |

**WhatsApp Cloud API:** crie um app em developers.facebook.com → WhatsApp → API Setup.
O plano gratuito cobre 1.000 conversas/mês. Importante: mensagens iniciadas pela
empresa fora da janela de 24 h exigem **template aprovado**; para começar, peça às
profissionais que mandem um "oi" para o número do restaurante (abre a janela) ou
cadastre um template com o texto do aviso de fiado.

Sem esses secrets tudo continua funcionando: as mensagens ficam acumuladas como
`pending` e são enviadas quando você configurar.

## Etapa 4 — RLS por papel (por último!)

Só depois de testar o login com o `auth-login` publicado e o `NB_JWT_SECRET` definido:

- Execute `20260702100000_rls_por_papel.sql`

A partir daí, quem tiver apenas a chave pública do site **não consegue mais ler**
pedidos, clientes, financeiro nem histórico — só o painel logado tem acesso.
O cardápio do cliente continua funcionando (ele só insere pedidos e lê o cardápio).

## Teste rápido

1. Lance um fiado no Balcão para uma profissional com telefone cadastrado →
   ela deve receber o aviso na hora (ou ver o registro em `notifications`).
2. No SQL Editor: `select public.fechar_quinzena_automatica();` → fecha a quinzena
   agora e enfileira os relatórios (útil para testar sem esperar o dia 1/16).
3. `select * from notifications order by created_at desc limit 10;` → confere fila.

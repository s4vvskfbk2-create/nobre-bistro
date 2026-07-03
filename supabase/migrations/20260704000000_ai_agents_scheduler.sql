-- Ativa os 6 agentes de IA e agenda o executor de hora em hora.
-- O agente-executor decide internamente quem roda (cadência + next_run_at):
--   operacao-agent  → a cada hora (pedidos atrasados, chamados, cancelamentos)
--   vendas-agent    → diário às 08h BRT (queda de vendas, produto destaque, análise IA)
--   fiado-agent     → diário às 10h BRT (limites estourados, fiado antigo)
--   estoque-cmv     → diário às 22h BRT (insumos críticos, CMV alto)
--   financeiro      → diário às 23h BRT (fiado x caixa, pedidos sem pagamento)
--   clientes-agent  → semanal (clientes recorrentes sumidos)

update public.ai_agents
   set status = 'active', next_run_at = null
 where name in ('vendas-agent','estoque-cmv-agent','fiado-agent',
                'clientes-agent','operacao-agent','financeiro-agent');

do $$
begin
  begin
    create extension if not exists pg_cron;
  exception when others then
    raise notice 'pg_cron indisponível (%). Agende o agente-executor manualmente.', sqlerrm;
    return;
  end;
  begin
    create extension if not exists pg_net;
  exception when others then
    raise notice 'pg_net indisponível (%).', sqlerrm;
  end;

  begin perform cron.unschedule('nb-agentes-tick'); exception when others then null; end;
  perform cron.schedule(
    'nb-agentes-tick',
    '5 * * * *',
    $cmd$
      select net.http_post(
        url := 'https://zxpnguynjrsixsomaieg.supabase.co/functions/v1/agente-executor',
        headers := jsonb_build_object(
          'Content-Type','application/json',
          'apikey','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4cG5ndXluanJzaXhzb21haWVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1ODkyNDAsImV4cCI6MjA5NjE2NTI0MH0.3_6a8Hn0xQe6FEbjVTeRnKZUwRD64Fe_0Jsk-pGHP3Q',
          'Authorization','Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4cG5ndXluanJzaXhzb21haWVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1ODkyNDAsImV4cCI6MjA5NjE2NTI0MH0.3_6a8Hn0xQe6FEbjVTeRnKZUwRD64Fe_0Jsk-pGHP3Q'
        ),
        body := jsonb_build_object('action','tick')
      );
    $cmd$
  );
end $$;

-- Estoque avançado (perdas, validade, inventário) + resumo diário do proprietário.
--
-- 1. stock_movements: trilha de toda movimentação de estoque (perda, entrada,
--    ajuste de inventário, consumo) com custo estimado e operador
-- 2. Coluna validade em ingredientes (alerta de vencimento no painel e no agente)
-- 3. enviar_resumo_diario(): monta o resumo do dia (vendas, ticket, fiado,
--    perdas) e enfileira em notifications para o WhatsApp do proprietário
--    (config nb_bA_dono = {"telefone":"11999999999"})
-- 4. pg_cron: resumo todo dia às 22:30 de Brasília + dispatch

-- ─────────────────────────────────────────────
-- 1. Movimentações de estoque
-- ─────────────────────────────────────────────
create table if not exists public.stock_movements (
  id uuid primary key default gen_random_uuid(),
  ingrediente_id bigint,
  ingrediente_nome text,
  tipo text not null,
  quantidade numeric(12,3) not null default 0,
  unidade text,
  motivo text,
  custo_estimado numeric(12,2) not null default 0,
  operador text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint stock_movements_tipo_check
    check (tipo in ('entrada','saida','perda','ajuste_inventario','consumo'))
);

create index if not exists idx_stock_movements_created
  on public.stock_movements (created_at desc);
create index if not exists idx_stock_movements_tipo
  on public.stock_movements (tipo, created_at desc);

alter table public.stock_movements enable row level security;
-- Mesmo padrão transitório das demais tabelas; a migration de RLS por papel
-- pode trocar por authenticated-only depois.
drop policy if exists "temporary_anon_all_stock_movements" on public.stock_movements;
create policy "temporary_anon_all_stock_movements" on public.stock_movements
  for all to anon, authenticated using (true) with check (true);

-- ─────────────────────────────────────────────
-- 2. Validade nos insumos (tabela criada fora das migrations — condicional)
-- ─────────────────────────────────────────────
do $$
begin
  if exists (select 1 from information_schema.tables
             where table_schema='public' and table_name='ingredientes') then
    if not exists (select 1 from information_schema.columns
                   where table_schema='public' and table_name='ingredientes'
                     and column_name='validade') then
      alter table public.ingredientes add column validade date;
    end if;
  end if;
end $$;

-- ─────────────────────────────────────────────
-- 3. Resumo diário para o proprietário
-- ─────────────────────────────────────────────
create or replace function public.enviar_resumo_diario()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  dono jsonb;
  tel text;
  hoje_br text := to_char(now() at time zone 'America/Sao_Paulo','DD/MM/YYYY');
  vendas numeric := 0;
  n_pedidos int := 0;
  ticket numeric := 0;
  fiado_dia numeric := 0;
  cancelados int := 0;
  perdas_dia numeric := 0;
  top_prato text := '';
  msg text;
begin
  select value into dono from public.config where key = 'nb_bA_dono';
  tel := coalesce(dono->>'telefone','');
  if tel = '' then
    return jsonb_build_object('ok',false,'reason','telefone_do_dono_nao_configurado');
  end if;

  select coalesce(sum((o.metadata->>'total')::numeric),0), count(*)
    into vendas, n_pedidos
    from public.orders o
   where o.metadata->>'status' = 'concluido'
     and coalesce(o.metadata->>'criadoEm','') like hoje_br||'%';

  ticket := case when n_pedidos > 0 then vendas / n_pedidos else 0 end;

  select coalesce(sum((o.metadata->>'total')::numeric),0)
    into fiado_dia
    from public.orders o
   where (o.metadata->>'fiado')::boolean is true
     and coalesce(o.metadata->>'status','') <> 'cancelado'
     and coalesce(o.metadata->>'criadoEm','') like hoje_br||'%';

  select count(*) into cancelados
    from public.orders o
   where o.metadata->>'status' = 'cancelado'
     and coalesce(o.metadata->>'criadoEm','') like hoje_br||'%';

  select coalesce(sum(custo_estimado),0) into perdas_dia
    from public.stock_movements
   where tipo = 'perda'
     and created_at > (now() at time zone 'America/Sao_Paulo')::date;

  select coalesce(i->>'name','')
    into top_prato
    from public.orders o, jsonb_array_elements(o.metadata->'items') i
   where o.metadata->>'status' = 'concluido'
     and coalesce(o.metadata->>'criadoEm','') like hoje_br||'%'
   group by 1
   order by sum(coalesce((i->>'qty')::numeric,1)) desc
   limit 1;

  msg := '🌿 *Nobre Bistro — Resumo do dia '||hoje_br||'*'||E'\n\n'||
         '💰 Vendas: '||public.nb_moeda(vendas)||' ('||n_pedidos||' pedidos)'||E'\n'||
         '🎯 Ticket médio: '||public.nb_moeda(ticket)||E'\n'||
         '📒 Fiado do dia: '||public.nb_moeda(fiado_dia)||E'\n'||
         (case when perdas_dia > 0 then '🗑️ Perdas registradas: '||public.nb_moeda(perdas_dia)||E'\n' else '' end)||
         (case when cancelados > 0 then '❌ Cancelamentos: '||cancelados||E'\n' else '' end)||
         (case when top_prato <> '' then '⭐ Mais vendido: '||top_prato||E'\n' else '' end)||
         E'\n'||'Bom descanso! Amanhã os agentes de IA seguem de olho em tudo. 💚';

  insert into public.notifications (kind, recipient_name, phone, message, status, payload)
  values ('resumo_dia','Proprietário',tel,msg,'pending',
          jsonb_build_object('vendas',vendas,'pedidos',n_pedidos,'fiado',fiado_dia));

  insert into public.system_events (event_type, source, entity_type, entity_id, payload)
  values ('DAILY_SUMMARY_SENT','auto.resumo','resumo',hoje_br,
          jsonb_build_object('vendas',vendas,'pedidos',n_pedidos));

  return jsonb_build_object('ok',true,'vendas',vendas,'pedidos',n_pedidos);
end;
$$;

-- ─────────────────────────────────────────────
-- 4. Agendamento: resumo às 22:30 BRT (01:30 UTC) + dispatch
-- ─────────────────────────────────────────────
do $$
begin
  begin
    create extension if not exists pg_cron;
  exception when others then
    raise notice 'pg_cron indisponível (%).', sqlerrm; return;
  end;
  begin
    create extension if not exists pg_net;
  exception when others then
    raise notice 'pg_net indisponível (%).', sqlerrm;
  end;

  begin perform cron.unschedule('nb-resumo-diario'); exception when others then null; end;
  perform cron.schedule(
    'nb-resumo-diario',
    '30 1 * * *',
    $cmd$
      select public.enviar_resumo_diario();
      select net.http_post(
        url := 'https://zxpnguynjrsixsomaieg.supabase.co/functions/v1/fiado-notify',
        headers := jsonb_build_object(
          'Content-Type','application/json',
          'apikey','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4cG5ndXluanJzaXhzb21haWVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1ODkyNDAsImV4cCI6MjA5NjE2NTI0MH0.3_6a8Hn0xQe6FEbjVTeRnKZUwRD64Fe_0Jsk-pGHP3Q',
          'Authorization','Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4cG5ndXluanJzaXhzb21haWVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1ODkyNDAsImV4cCI6MjA5NjE2NTI0MH0.3_6a8Hn0xQe6FEbjVTeRnKZUwRD64Fe_0Jsk-pGHP3Q'
        ),
        body := jsonb_build_object('action','dispatch')
      );
    $cmd$
  );
end $$;

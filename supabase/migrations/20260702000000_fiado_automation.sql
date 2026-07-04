-- Automação do fiado:
--   1. Tabela notifications (fila auditável de mensagens WhatsApp)
--   2. Função fechar_quinzena_automatica(): fecha os fiados em aberto por
--      profissional, gera o relatório da quinzena e enfileira as mensagens
--   3. pg_cron: roda dia 1 e dia 16 às 09:00 (horário de Brasília) e dispara
--      o envio via Edge Function fiado-notify (pg_net)

-- ─────────────────────────────────────────────
-- 1. Fila de notificações
-- ─────────────────────────────────────────────
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  kind text not null,
  recipient_name text,
  phone text,
  message text not null,
  status text not null default 'pending',
  error text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  sent_at timestamptz,
  constraint notifications_status_check check (status in ('pending','sent','failed','skipped'))
);

create index if not exists idx_notifications_status
  on public.notifications (status, created_at);

alter table public.notifications enable row level security;
-- Contém telefones: sem acesso para anon. O painel logado (authenticated) pode
-- consultar; as Edge Functions usam service role e não passam por RLS.
drop policy if exists "auth_all_notifications" on public.notifications;
create policy "auth_all_notifications" on public.notifications
  for all to authenticated using (true) with check (true);

-- ─────────────────────────────────────────────
-- 2. Formatação de moeda (pt-BR simples)
-- ─────────────────────────────────────────────
create or replace function public.nb_moeda(v numeric)
returns text
language sql
immutable
as $$
  select 'R$ ' || replace(to_char(round(coalesce(v,0),2),'FM9999990.00'),'.',',');
$$;

-- ─────────────────────────────────────────────
-- 3. Fechamento automático da quinzena
-- ─────────────────────────────────────────────
create or replace function public.fechar_quinzena_automatica()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  profs jsonb;
  prof_row record;
  linhas text;
  msg text;
  total numeric;
  desconto numeric;
  liquido numeric;
  tel text;
  n_profs int := 0;
  agora_br text := to_char(now() at time zone 'America/Sao_Paulo','DD/MM/YYYY HH24:MI');
begin
  select value into profs from public.config where key = 'nb_bA_profs';

  for prof_row in
    select o.metadata->>'profFiado' as nome,
           array_agg(o.id) as order_ids,
           sum(coalesce((o.metadata->>'total')::numeric,0)) as soma
    from public.orders o
    where (o.metadata->>'fiado')::boolean is true
      and coalesce((o.metadata->>'fiadoPago')::boolean,false) = false
      and coalesce(o.metadata->>'status','') <> 'cancelado'
      and coalesce(o.metadata->>'profFiado','') <> ''
    group by 1
  loop
    total := coalesce(prof_row.soma,0);
    if total <= 0 then continue; end if;

    select string_agg(
             '• '||coalesce(o.metadata->>'criadoEm','')||' — '||
             coalesce((select string_agg(coalesce(i->>'qty','1')||'x '||coalesce(i->>'name','Item'),', ')
                       from jsonb_array_elements(o.metadata->'items') i),'consumo')||
             ' — '||public.nb_moeda(coalesce((o.metadata->>'total')::numeric,0)),
             E'\n' order by o.created_at)
      into linhas
      from public.orders o
     where o.id = any(prof_row.order_ids);

    desconto := 0; tel := '';
    if profs is not null and jsonb_typeof(profs) = 'array' then
      select coalesce((p->>'desconto')::numeric,0), coalesce(p->>'telefone','')
        into desconto, tel
        from jsonb_array_elements(profs) p
       where p->>'name' = prof_row.nome
       limit 1;
      desconto := coalesce(desconto,0);
      tel := coalesce(tel,'');
    end if;
    liquido := round(total * (1 - desconto/100.0), 2);

    msg := '🌿 *Nobre Bistro — Fechamento da quinzena*'||E'\n\n'||
           'Olá, '||prof_row.nome||'! Fechamos hoje ('||agora_br||') o acerto do seu fiado.'||E'\n\n'||
           '*Consumo do período:*'||E'\n'||coalesce(linhas,'—')||E'\n\n'||
           '💰 Soma do consumo: '||public.nb_moeda(total)||E'\n'||
           (case when desconto > 0
             then '🏷️ Desconto ('||desconto||'%): -'||public.nb_moeda(total - liquido)||E'\n'||
                  '✅ *Valor a acertar: '||public.nb_moeda(liquido)||'*'
             else '✅ *Valor a acertar: '||public.nb_moeda(total)||'*' end)||E'\n\n'||
           'Sua conta foi fechada e um novo período começa agora. Obrigado! 💚';

    update public.orders
       set metadata = metadata || jsonb_build_object('fiadoPago',true,'pagoEm',agora_br,'quinzenaAuto',true),
           payment_status = 'paid'
     where id = any(prof_row.order_ids);

    update public.credit_entries
       set status = 'settled', settled_at = now()
     where holder_name = prof_row.nome and status = 'open';

    insert into public.notifications (kind, recipient_name, phone, message, status, payload)
    values ('quinzena_fechada', prof_row.nome, tel, msg, 'pending',
            jsonb_build_object('total',total,'desconto',desconto,'liquido',liquido,
                               'pedidos',coalesce(array_length(prof_row.order_ids,1),0)));

    insert into public.system_events (event_type, source, entity_type, entity_id, payload)
    values ('QUINZENA_ACERTADA','auto.quinzena','fiado',prof_row.nome,
            jsonb_build_object('total',total,'liquido',liquido,'desconto',desconto,'auto',true));

    n_profs := n_profs + 1;
  end loop;

  -- Espelha o fechamento no config legado (fallback de leitura do painel)
  if n_profs > 0 then
    update public.config
       set value = (
         select coalesce(jsonb_agg(
           case when (elem->>'fiado')::boolean is true
                 and coalesce((elem->>'fiadoPago')::boolean,false) = false
                 and coalesce(elem->>'status','') <> 'cancelado'
                 and coalesce(elem->>'profFiado','') <> ''
             then elem || jsonb_build_object('fiadoPago',true,'pagoEm',agora_br,'quinzenaAuto',true)
             else elem end), '[]'::jsonb)
         from jsonb_array_elements(value) elem
       )
     where key = 'nb_bA_orders' and jsonb_typeof(value) = 'array';
  end if;

  return jsonb_build_object('ok',true,'profissionais',n_profs,'fechado_em',agora_br);
end;
$$;

-- ─────────────────────────────────────────────
-- 4. Agendamento (pg_cron + pg_net)
--    Dia 1 e dia 16 às 12:00 UTC = 09:00 de Brasília.
--    O dispatcher roda a cada 30 min para reenviar pendências
--    (ex.: WhatsApp configurado depois, falha temporária da Meta).
-- ─────────────────────────────────────────────
do $$
begin
  begin
    create extension if not exists pg_cron;
  exception when others then
    raise notice 'pg_cron indisponível (%). Agende manualmente no dashboard.', sqlerrm;
    return;
  end;
  begin
    create extension if not exists pg_net;
  exception when others then
    raise notice 'pg_net indisponível (%). O envio automático precisa dele.', sqlerrm;
  end;

  begin perform cron.unschedule('nb-fiado-quinzena'); exception when others then null; end;
  perform cron.schedule(
    'nb-fiado-quinzena',
    '0 12 1,16 * *',
    $cmd$
      select public.fechar_quinzena_automatica();
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

  begin perform cron.unschedule('nb-fiado-dispatch'); exception when others then null; end;
  perform cron.schedule(
    'nb-fiado-dispatch',
    '*/30 * * * *',
    $cmd$
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

-- Nobre Bistro core management schema
-- Foundation for the next phase: normalized orders, payments, table calls,
-- AI tasks/recommendations, cash, credit/fiado and audit/event history.

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  email text,
  source text default 'manual',
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.staff (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  role text not null default 'atendente',
  phone text,
  pin_hash text,
  staff_type text not null default 'salao',
  appears_on_menu boolean not null default true,
  can_use_credit boolean not null default true,
  participates_in_ranking boolean not null default true,
  credit_limit numeric(12,2) not null default 200,
  payment_cycle text not null default 'quinzena',
  commission_rate numeric(6,2) not null default 0,
  credit_discount_rate numeric(6,2) not null default 0,
  daily_goal numeric(12,2) not null default 0,
  active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  legacy_id text unique,
  category text,
  name text not null,
  description text,
  price numeric(12,2) not null default 0,
  cost numeric(12,2) not null default 0,
  stock_qty numeric(12,3) not null default 0,
  min_stock numeric(12,3) not null default 0,
  active boolean not null default true,
  image_url text,
  tag text,
  recipe_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  legacy_id text unique,
  order_number text,
  channel text not null default 'balcao',
  table_number text,
  customer_id uuid references public.customers(id) on delete set null,
  customer_name text,
  staff_id uuid references public.staff(id) on delete set null,
  professional_name text,
  operator_name text,
  status text not null default 'created',
  payment_status text not null default 'pending',
  payment_method text,
  subtotal numeric(12,2) not null default 0,
  discount numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  is_credit boolean not null default false,
  credit_holder text,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint orders_channel_check check (channel in ('app','balcao','mesa','delivery','manual')),
  constraint orders_status_check check (status in ('created','payment_pending','paid','in_production','done','cancelled','refunded','pendente','aguardando_pagamento','em_curso','concluido','cancelado')),
  constraint orders_payment_status_check check (payment_status in ('pending','authorized','paid','failed','refunded','credit','cancelled','pendente','pago','fiado','cancelado'))
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  legacy_product_id text,
  name text not null,
  quantity numeric(12,3) not null default 1,
  unit_price numeric(12,2) not null default 0,
  total_price numeric(12,2) not null default 0,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete set null,
  method text not null,
  provider text,
  provider_reference text,
  status text not null default 'pending',
  amount numeric(12,2) not null default 0,
  paid_at timestamptz,
  raw_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint payments_status_check check (status in ('pending','authorized','paid','failed','refunded','cancelled'))
);

create table if not exists public.table_calls (
  id uuid primary key default gen_random_uuid(),
  table_number text not null,
  call_type text not null default 'atendimento',
  status text not null default 'open',
  attended_by uuid references public.staff(id) on delete set null,
  attended_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint table_calls_status_check check (status in ('open','attended','cancelled'))
);

create table if not exists public.cash_sessions (
  id uuid primary key default gen_random_uuid(),
  business_date date not null default current_date,
  opened_by uuid references public.staff(id) on delete set null,
  closed_by uuid references public.staff(id) on delete set null,
  opening_amount numeric(12,2) not null default 0,
  expected_cash numeric(12,2) not null default 0,
  counted_cash numeric(12,2),
  difference numeric(12,2),
  status text not null default 'open',
  notes text,
  created_at timestamptz not null default now(),
  closed_at timestamptz,
  updated_at timestamptz not null default now(),
  constraint cash_sessions_status_check check (status in ('open','closed','reopened'))
);

create table if not exists public.cash_movements (
  id uuid primary key default gen_random_uuid(),
  cash_session_id uuid references public.cash_sessions(id) on delete set null,
  order_id uuid references public.orders(id) on delete set null,
  movement_type text not null,
  payment_method text,
  amount numeric(12,2) not null default 0,
  description text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint cash_movements_type_check check (movement_type in ('sale','expense','withdrawal','deposit','credit_received','adjustment'))
);

create table if not exists public.credit_entries (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete set null,
  staff_id uuid references public.staff(id) on delete set null,
  holder_name text not null,
  amount numeric(12,2) not null default 0,
  discount_rate numeric(6,2) not null default 0,
  net_amount numeric(12,2) not null default 0,
  status text not null default 'open',
  settled_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint credit_entries_status_check check (status in ('open','settled','cancelled'))
);

create table if not exists public.ai_tasks (
  id uuid primary key default gen_random_uuid(),
  source text not null default 'IA',
  area text not null,
  priority text not null default 'medium',
  title text not null,
  action text not null,
  impact text,
  status text not null default 'open',
  assigned_to uuid references public.staff(id) on delete set null,
  due_at timestamptz,
  completed_at timestamptz,
  reference_type text,
  reference_id text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ai_tasks_priority_check check (priority in ('low','medium','high','critical','baixa','media','alta','critica')),
  constraint ai_tasks_status_check check (status in ('open','doing','done','dismissed','cancelled','aberta','em_andamento','concluida','ignorada','cancelada'))
);

create table if not exists public.ai_recommendations (
  id uuid primary key default gen_random_uuid(),
  area text not null,
  priority text not null default 'medium',
  title text not null,
  reasoning text,
  suggested_action text,
  estimated_impact text,
  status text not null default 'new',
  accepted_task_id uuid references public.ai_tasks(id) on delete set null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ai_recommendations_priority_check check (priority in ('low','medium','high','critical','baixa','media','alta','critica')),
  constraint ai_recommendations_status_check check (status in ('new','accepted','dismissed','done','nova','aceita','ignorada','concluida'))
);

create table if not exists public.ai_agents (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  area text not null,
  cadence text not null default 'manual',
  status text not null default 'inactive',
  last_run_at timestamptz,
  next_run_at timestamptz,
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ai_agents_status_check check (status in ('active','inactive','paused','error'))
);

insert into public.ai_agents (name, description, area, cadence, status, config)
values
  ('vendas-agent','Analisa faturamento, ticket médio, produto foco e ranking de indicações.','vendas','diario','inactive','{}'::jsonb),
  ('estoque-cmv-agent','Monitora estoque, ficha técnica, CMV, rupturas e compras sugeridas.','estoque_cmv','fim_do_dia','inactive','{}'::jsonb),
  ('fiado-agent','Controla fiado de profissionais do salão, limites, cobranças e quinzena.','fiado','diario_quinzena','inactive','{}'::jsonb),
  ('clientes-agent','Identifica clientes sumidas, recorrentes, aniversariantes e campanhas.','clientes','semanal','inactive','{}'::jsonb),
  ('operacao-agent','Acompanha pedidos atrasados, cozinha, chamados de mesa e cancelamentos.','operacao','tempo_real','inactive','{}'::jsonb),
  ('financeiro-agent','Analisa caixa, formas de pagamento, despesas, divergências e lucro estimado.','financeiro','fechamento','inactive','{}'::jsonb)
on conflict (name) do nothing;

create table if not exists public.system_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  source text,
  entity_type text,
  entity_id text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  action text not null,
  entity_type text,
  entity_id text,
  user_role text,
  user_info text,
  old_value jsonb,
  new_value jsonb,
  reason text,
  created_at timestamptz not null default now()
);

create index if not exists idx_orders_created_at on public.orders(created_at desc);
create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_orders_payment_status on public.orders(payment_status);
create index if not exists idx_order_items_order_id on public.order_items(order_id);
create index if not exists idx_payments_order_id on public.payments(order_id);
create index if not exists idx_table_calls_status on public.table_calls(status, created_at desc);
create index if not exists idx_ai_tasks_status_priority on public.ai_tasks(status, priority, created_at desc);
create index if not exists idx_system_events_created_at on public.system_events(created_at desc);
create index if not exists idx_audit_logs_created_at on public.audit_logs(created_at desc);

create or replace view public.v_order_summary as
select
  o.id,
  o.legacy_id,
  o.order_number,
  o.channel,
  o.status,
  o.payment_status,
  o.payment_method,
  o.customer_name,
  o.operator_name,
  o.total,
  o.created_at,
  coalesce(sum(oi.quantity), 0) as item_count
from public.orders o
left join public.order_items oi on oi.order_id = o.id
group by o.id;

create or replace view public.v_ai_daily_context as
select
  current_date as business_date,
  coalesce(sum(o.total) filter (where o.status in ('done','concluido') and o.created_at::date = current_date), 0) as revenue_today,
  count(*) filter (where o.created_at::date = current_date) as orders_today,
  coalesce(sum(o.total) filter (where o.is_credit and o.payment_status <> 'paid'), 0) as open_credit_total,
  count(*) filter (where o.status in ('cancelled','cancelado') and o.created_at::date = current_date) as cancelled_today
from public.orders o;

-- Keep updated_at fresh.
do $$
declare
  t text;
begin
  foreach t in array array['customers','staff','products','orders','payments','table_calls','cash_sessions','credit_entries','ai_tasks','ai_recommendations','ai_agents']
  loop
    execute format('drop trigger if exists set_%I_updated_at on public.%I', t, t);
    execute format('create trigger set_%I_updated_at before update on public.%I for each row execute function public.set_updated_at()', t, t);
  end loop;
end $$;

-- RLS is enabled so the project can be tightened for production.
-- Current static front-end still uses the anon key; replace these broad policies
-- with authenticated role policies before handling real customer/financial data.
do $$
declare
  t text;
begin
  foreach t in array array['customers','staff','products','orders','order_items','payments','table_calls','cash_sessions','cash_movements','credit_entries','ai_tasks','ai_recommendations','ai_agents','system_events','audit_logs']
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "temporary_anon_all_%I" on public.%I', t, t);
    execute format('create policy "temporary_anon_all_%I" on public.%I for all to anon, authenticated using (true) with check (true)', t, t);
  end loop;
end $$;

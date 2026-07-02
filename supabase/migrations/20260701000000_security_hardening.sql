-- Security hardening: server-side authentication RPCs + RLS on sensitive config
-- Passwords never leave the database — the anon key cannot read nb_bA_senhas directly.
-- Senhas são armazenadas com hash bcrypt (pgcrypto). Senhas legadas em texto puro
-- continuam funcionando até a primeira troca, quando passam a ser hasheadas.

create extension if not exists pgcrypto;

-- ─────────────────────────────────────────────
-- 0. Rate limiting server-side (independe do navegador do atacante)
-- ─────────────────────────────────────────────
create table if not exists public.auth_attempts (
  id bigint generated always as identity primary key,
  attempt_kind text not null,
  success boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_auth_attempts_recent
  on public.auth_attempts (attempt_kind, created_at desc);

alter table public.auth_attempts enable row level security;
-- Nenhuma policy para anon: a tabela só é acessível via funções SECURITY DEFINER.

create or replace function public.auth_rate_limited(kind text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  recent_failures int;
begin
  -- Limpeza oportunista de registros antigos
  delete from public.auth_attempts where created_at < now() - interval '1 day';

  select count(*) into recent_failures
  from public.auth_attempts
  where attempt_kind = kind
    and success = false
    and created_at > now() - interval '5 minutes';

  return recent_failures >= 15;
end;
$$;

create or replace function public.auth_log_attempt(kind text, was_success boolean)
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.auth_attempts (attempt_kind, success)
  values (kind, was_success);
$$;

-- ─────────────────────────────────────────────
-- 1. Comparação segura: aceita hash bcrypt e legado em texto puro
-- ─────────────────────────────────────────────
create or replace function public.password_matches(stored text, attempt text)
returns boolean
language plpgsql
immutable
as $$
begin
  if stored is null or stored = '' or attempt is null then
    return false;
  end if;
  if stored like '$2%' then
    return crypt(attempt, stored) = stored; -- bcrypt
  end if;
  return stored = attempt; -- legado (texto puro), removido na primeira troca
end;
$$;

-- ─────────────────────────────────────────────
-- 2. Server-side password check
-- ─────────────────────────────────────────────
create or replace function public.check_admin_password(
  role_name text,
  password_attempt text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  stored jsonb;
  ok boolean;
begin
  if password_attempt is null or trim(password_attempt) = '' then
    return jsonb_build_object('ok', false);
  end if;

  if public.auth_rate_limited('admin_password') then
    return jsonb_build_object('ok', false, 'reason', 'rate_limited');
  end if;

  select value into stored
  from public.config
  where key = 'nb_bA_senhas'
  limit 1;

  if stored is null or coalesce(stored->>role_name, '') = '' then
    perform public.auth_log_attempt('admin_password', false);
    return jsonb_build_object('ok', false, 'reason', 'not_configured');
  end if;

  ok := public.password_matches(stored->>role_name, trim(password_attempt));
  perform public.auth_log_attempt('admin_password', ok);

  if ok then
    return jsonb_build_object('ok', true, 'role', role_name);
  end if;
  return jsonb_build_object('ok', false);
end;
$$;

grant execute on function public.check_admin_password(text, text) to anon;

-- ─────────────────────────────────────────────
-- 3. Server-side staff PIN check
-- ─────────────────────────────────────────────
create or replace function public.check_staff_pin(pin_attempt text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  profs_val jsonb;
  prof      jsonb;
  i         int;
begin
  if pin_attempt is null or trim(pin_attempt) = '' then
    return jsonb_build_object('ok', false);
  end if;

  if public.auth_rate_limited('staff_pin') then
    return jsonb_build_object('ok', false, 'reason', 'rate_limited');
  end if;

  select value into profs_val
  from public.config
  where key = 'nb_bA_profs'
  limit 1;

  if profs_val is null or jsonb_typeof(profs_val) != 'array' then
    perform public.auth_log_attempt('staff_pin', false);
    return jsonb_build_object('ok', false);
  end if;

  for i in 0..jsonb_array_length(profs_val) - 1 loop
    prof := profs_val->i;
    if coalesce((prof->>'active')::boolean, true)
      and coalesce(prof->>'pin', '') != ''
      and public.password_matches(prof->>'pin', trim(pin_attempt))
    then
      perform public.auth_log_attempt('staff_pin', true);
      return jsonb_build_object(
        'ok',  true,
        'name', prof->>'name',
        'role', coalesce(prof->>'papel', 'atendente')
      );
    end if;
  end loop;

  perform public.auth_log_attempt('staff_pin', false);
  return jsonb_build_object('ok', false);
end;
$$;

grant execute on function public.check_staff_pin(text) to anon;

-- ─────────────────────────────────────────────
-- 4. Secure password update (requires current gerente password)
--    Novas senhas são SEMPRE gravadas com hash bcrypt.
-- ─────────────────────────────────────────────
create or replace function public.update_admin_password(
  current_gerente_password text,
  senhas_json jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  stored jsonb;
  hashed jsonb;
begin
  select value into stored
  from public.config
  where key = 'nb_bA_senhas'
  limit 1;

  -- Permite configuração inicial apenas quando ainda não há senha de gerente
  if stored is not null and coalesce(stored->>'gerente', '') != '' then
    if not public.password_matches(stored->>'gerente', trim(current_gerente_password)) then
      return jsonb_build_object('ok', false, 'reason', 'invalid_current_password');
    end if;
  end if;

  hashed := jsonb_build_object(
    'gerente',   crypt(senhas_json->>'gerente',   gen_salt('bf')),
    'atendente', crypt(senhas_json->>'atendente', gen_salt('bf')),
    'cancelPin', crypt(senhas_json->>'cancelPin', gen_salt('bf'))
  );

  insert into public.config (key, value)
  values ('nb_bA_senhas', hashed)
  on conflict (key) do update set value = excluded.value;

  return jsonb_build_object('ok', true);
end;
$$;

grant execute on function public.update_admin_password(text, jsonb) to anon;

-- ─────────────────────────────────────────────
-- 5. RLS: block direct reads of the password key
--    (the functions above bypass RLS via SECURITY DEFINER)
-- ─────────────────────────────────────────────
do $$
begin
  if not exists (
    select 1 from pg_tables
    where schemaname = 'public' and tablename = 'config'
  ) then
    return;
  end if;

  -- Enable RLS
  execute 'alter table public.config enable row level security';

  -- Drop any leftover broad policies
  execute 'drop policy if exists "temporary_anon_all_config" on public.config';
  execute 'drop policy if exists "anon_read_config_public"   on public.config';
  execute 'drop policy if exists "anon_insert_config_nonsensitive" on public.config';
  execute 'drop policy if exists "anon_update_config_nonsensitive" on public.config';

  -- SELECT: anon may read every key except the passwords key
  execute $pol$
    create policy "anon_read_config_public" on public.config
      for select to anon
      using (key != 'nb_bA_senhas')
  $pol$;

  -- INSERT: anon may insert any key except the passwords key
  execute $pol$
    create policy "anon_insert_config_nonsensitive" on public.config
      for insert to anon
      with check (key != 'nb_bA_senhas')
  $pol$;

  -- UPDATE: anon may update any key except the passwords key
  execute $pol$
    create policy "anon_update_config_nonsensitive" on public.config
      for update to anon
      using  (key != 'nb_bA_senhas')
      with check (key != 'nb_bA_senhas')
  $pol$;

end $$;

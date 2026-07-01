-- Security hardening: server-side authentication RPCs + RLS on sensitive config
-- Passwords never leave the database — the anon key cannot read nb_bA_senhas directly.

-- ─────────────────────────────────────────────
-- 1. Server-side password check
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
  stored_pwd text;
begin
  if password_attempt is null or trim(password_attempt) = '' then
    return jsonb_build_object('ok', false);
  end if;

  select value into stored
  from public.config
  where key = 'nb_bA_senhas'
  limit 1;

  if stored is null then
    return jsonb_build_object('ok', false, 'reason', 'not_configured');
  end if;

  stored_pwd := stored->>role_name;

  if stored_pwd is null or stored_pwd = '' then
    return jsonb_build_object('ok', false, 'reason', 'not_configured');
  end if;

  if stored_pwd = trim(password_attempt) then
    return jsonb_build_object('ok', true, 'role', role_name);
  end if;

  return jsonb_build_object('ok', false);
end;
$$;

grant execute on function public.check_admin_password(text, text) to anon;

-- ─────────────────────────────────────────────
-- 2. Server-side staff PIN check
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

  select value into profs_val
  from public.config
  where key = 'nb_bA_profs'
  limit 1;

  if profs_val is null or jsonb_typeof(profs_val) != 'array' then
    return jsonb_build_object('ok', false);
  end if;

  for i in 0..jsonb_array_length(profs_val) - 1 loop
    prof := profs_val->i;
    if coalesce((prof->>'active')::boolean, true)
      and (prof->>'pin') is not null
      and (prof->>'pin') != ''
      and (prof->>'pin') = trim(pin_attempt)
    then
      return jsonb_build_object(
        'ok',  true,
        'name', prof->>'name',
        'role', coalesce(prof->>'papel', 'atendente')
      );
    end if;
  end loop;

  return jsonb_build_object('ok', false);
end;
$$;

grant execute on function public.check_staff_pin(text) to anon;

-- ─────────────────────────────────────────────
-- 3. Secure password update (requires current gerente password)
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
  stored     jsonb;
  stored_pwd text;
begin
  select value into stored
  from public.config
  where key = 'nb_bA_senhas'
  limit 1;

  -- Allow initial setup only when password not yet configured
  if stored is not null then
    stored_pwd := stored->>'gerente';
    if stored_pwd is not null and stored_pwd != '' then
      if trim(current_gerente_password) != stored_pwd then
        return jsonb_build_object('ok', false, 'reason', 'invalid_current_password');
      end if;
    end if;
  end if;

  insert into public.config (key, value)
  values ('nb_bA_senhas', senhas_json)
  on conflict (key) do update set value = excluded.value;

  return jsonb_build_object('ok', true);
end;
$$;

grant execute on function public.update_admin_password(text, jsonb) to anon;

-- ─────────────────────────────────────────────
-- 4. RLS: block direct reads of the password key
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
  execute 'drop policy if exists "anon_upsert_config"        on public.config';
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

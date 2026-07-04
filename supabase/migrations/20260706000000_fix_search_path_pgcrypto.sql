-- No Supabase o pgcrypto vive no schema "extensions"; as funções de auth
-- precisam dele no search_path para crypt()/gen_salt() resolverem.
-- (Aplicada em produção em 04/07/2026 durante a ativação.)

create or replace function public.password_matches(stored text, attempt text)
returns boolean
language plpgsql
immutable
set search_path = public, extensions
as $$
begin
  if stored is null or stored = '' or attempt is null then
    return false;
  end if;
  if stored like '$2%' then
    return crypt(attempt, stored) = stored;
  end if;
  return stored = attempt;
end;
$$;

create or replace function public.update_admin_password(
  current_gerente_password text,
  senhas_json jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  stored jsonb;
  hashed jsonb;
begin
  select value into stored from public.config where key = 'nb_bA_senhas' limit 1;
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

alter function public.check_admin_password(text, text) set search_path = public, extensions;
alter function public.check_staff_pin(text) set search_path = public, extensions;
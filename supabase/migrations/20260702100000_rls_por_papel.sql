-- ⚠️ APLICAR POR ÚLTIMO — pré-requisitos:
--   1. Edge Function auth-login publicada (supabase functions deploy auth-login)
--   2. Secret NB_JWT_SECRET configurado (Project Settings → API → JWT Secret)
--   3. Login no painel testado (o token passa a ser emitido automaticamente)
--
-- Substitui as policies temporárias "anon pode tudo" por permissões por papel:
--   anon (chave pública, cardápio do cliente): só INSERE pedidos/itens/pagamentos/
--     chamados/eventos e LÊ produtos + chaves públicas do config.
--   authenticated (painel logado via auth-login): acesso completo.
-- Com isso, quem tiver apenas a chave pública NÃO consegue mais ler pedidos,
-- clientes, financeiro nem histórico — dados dos clientes protegidos.

do $$
declare
  t text;
begin
  -- Tabelas 100% administrativas: somente authenticated
  foreach t in array array['customers','staff','cash_sessions','cash_movements',
                           'credit_entries','ai_tasks','ai_recommendations','ai_agents','audit_logs']
  loop
    execute format('drop policy if exists "temporary_anon_all_%I" on public.%I', t, t);
    execute format('drop policy if exists "auth_all_%I" on public.%I', t, t);
    execute format('create policy "auth_all_%I" on public.%I for all to authenticated using (true) with check (true)', t, t);
  end loop;

  -- Fluxo do cliente: anon só insere; authenticated tudo
  foreach t in array array['orders','order_items','payments','table_calls','system_events']
  loop
    execute format('drop policy if exists "temporary_anon_all_%I" on public.%I', t, t);
    execute format('drop policy if exists "auth_all_%I" on public.%I', t, t);
    execute format('create policy "auth_all_%I" on public.%I for all to authenticated using (true) with check (true)', t, t);
    execute format('drop policy if exists "anon_insert_%I" on public.%I', t, t);
    execute format('create policy "anon_insert_%I" on public.%I for insert to anon with check (true)', t, t);
  end loop;

  -- Produtos: leitura pública (cardápio), escrita só logado
  execute 'drop policy if exists "temporary_anon_all_products" on public.products';
  execute 'drop policy if exists "auth_all_products" on public.products';
  execute 'create policy "auth_all_products" on public.products for all to authenticated using (true) with check (true)';
  execute 'drop policy if exists "anon_read_products" on public.products';
  execute 'create policy "anon_read_products" on public.products for select to anon using (active is true)';

  -- Config: anon lê apenas as chaves que o cardápio do cliente precisa;
  -- escrita/leitura total (exceto senhas) fica para o painel logado.
  execute 'drop policy if exists "anon_read_config_public" on public.config';
  execute 'drop policy if exists "anon_insert_config_nonsensitive" on public.config';
  execute 'drop policy if exists "anon_update_config_nonsensitive" on public.config';
  execute 'drop policy if exists "auth_all_config" on public.config';
  execute $pol$
    create policy "anon_read_config_public" on public.config
      for select to anon
      using (key in ('nb_bA_products','nb_bA_profs','nb_bA_horarios','nb_bA_fechamento'))
  $pol$;
  execute $pol$
    create policy "auth_all_config" on public.config
      for all to authenticated
      using (key <> 'nb_bA_senhas') with check (key <> 'nb_bA_senhas')
  $pol$;
end $$;

-- Habilita Supabase Realtime para pedidos e chamados de mesa.
-- O painel assina mudanças nessas tabelas e atualiza na hora (o polling vira
-- apenas rede de segurança de 1x/min quando o canal está conectado).
--
-- Observação: os eventos respeitam RLS. Após aplicar a migration de RLS por
-- papel, apenas o painel logado (authenticated) recebe os eventos — o que é
-- exatamente o comportamento desejado.

do $$
begin
  begin
    alter publication supabase_realtime add table public.orders;
  exception
    when duplicate_object then null;
    when others then raise notice 'orders já publicada ou publication indisponível: %', sqlerrm;
  end;

  begin
    alter publication supabase_realtime add table public.table_calls;
  exception
    when duplicate_object then null;
    when others then raise notice 'table_calls já publicada ou publication indisponível: %', sqlerrm;
  end;
end $$;

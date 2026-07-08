-- Núcleo determinístico do ERP (sem IA):
-- Quando o custo de um insumo muda (nota fiscal, edição manual), o banco:
--   1. Grava o histórico em ingrediente_precos (auditável)
--   2. Recalcula custo_linha das fichas que usam o insumo
--   3. Recalcula custo_total e cmv_percentual das fichas afetadas
--   4. Propaga 1 nível para fichas que usam as afetadas como sub-receita
--   5. Registra INGREDIENT_PRICE_CHANGED em system_events
-- Fórmulas claras, sem IA, histórico completo.

create or replace function public.recalcular_fichas(ids bigint[])
returns void
language sql
security definer
set search_path = public
as $$
  update public.fichas_tecnicas ft
     set custo_total = coalesce(sub.total, 0),
         cmv_percentual = case when coalesce(ft.preco_venda,0) > 0
                               then coalesce(sub.total,0) / ft.preco_venda * 100
                               else 0 end
    from (select ficha_id, sum(coalesce(custo_linha,0)) as total
            from public.ficha_ingredientes
           where ficha_id = any(ids)
           group by ficha_id) sub
   where ft.id = sub.ficha_id;
$$;

create or replace function public.recalcular_sub_receitas(ids bigint[])
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  pais bigint[];
begin
  -- Atualiza linhas que usam as fichas afetadas como sub-receita
  update public.ficha_ingredientes fi
     set custo_linha = (coalesce(fi.quantidade,0) / greatest(coalesce(ft.rendimento,1), 0.0001))
                        * coalesce(ft.custo_total,0)
    from public.fichas_tecnicas ft
   where fi.sub_receita_id = ft.id
     and ft.id = any(ids);

  select array_agg(distinct ficha_id) into pais
    from public.ficha_ingredientes
   where sub_receita_id = any(ids);

  if pais is not null then
    perform public.recalcular_fichas(pais);
  end if;
end;
$$;

create or replace function public.on_ingrediente_custo_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  afetadas bigint[];
begin
  if new.custo_unitario is distinct from old.custo_unitario then
    insert into public.ingrediente_precos
      (ingrediente_id, custo_bruto, custo_liquido, fc, fornecedor, data_registro, observacao)
    values
      (new.id, new.custo_unitario, new.custo_unitario, 1, '', current_date,
       'auto: custo alterado de '||coalesce(old.custo_unitario,0)||' para '||coalesce(new.custo_unitario,0));

    update public.ficha_ingredientes fi
       set custo_linha = coalesce(fi.quantidade,0) * coalesce(new.custo_unitario,0)
     where fi.ingrediente_id = new.id
       and coalesce(fi.tipo,'ingrediente') = 'ingrediente';

    select array_agg(distinct ficha_id) into afetadas
      from public.ficha_ingredientes
     where ingrediente_id = new.id;

    if afetadas is not null then
      perform public.recalcular_fichas(afetadas);
      perform public.recalcular_sub_receitas(afetadas);
    end if;

    insert into public.system_events (event_type, source, entity_type, entity_id, payload)
    values ('INGREDIENT_PRICE_CHANGED','trigger.custo','ingrediente', new.id::text,
            jsonb_build_object('nome', new.nome,
                               'custo_anterior', old.custo_unitario,
                               'custo_novo', new.custo_unitario,
                               'variacao_pct', case when coalesce(old.custo_unitario,0) > 0
                                 then round((new.custo_unitario - old.custo_unitario) / old.custo_unitario * 100, 1)
                                 else null end,
                               'fichas_afetadas', coalesce(array_length(afetadas,1),0)));
  end if;
  return new;
end;
$$;

drop trigger if exists trg_ingrediente_custo_change on public.ingredientes;
create trigger trg_ingrediente_custo_change
  after update on public.ingredientes
  for each row execute function public.on_ingrediente_custo_change();

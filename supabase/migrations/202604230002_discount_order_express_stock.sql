-- Descuento atómico e idempotente de stock express al confirmar pago.
-- Orden: bloquea el pedido, re-procesa si stock_discounted_at es null, bloquea variantes en orden estable.

create or replace function public.discount_order_express_stock(
  p_order_id uuid,
  p_discounted_at timestamptz
)
returns boolean
language plpgsql
set search_path = public
as $$
declare
  r_order public.orders%rowtype;
  r_demand record;
  v_current int;
  n_variants int;
begin
  select * into r_order
  from public.orders
  where id = p_order_id
  for update;

  if not found then
    raise exception 'Orden no encontrada: %', p_order_id
      using errcode = 'P0001';
  end if;

  if r_order.stock_discounted_at is not null then
    return false;
  end if;

  for r_demand in
    select
      oi.variant_id,
      coalesce(sum(oi.quantity), 0)::int as need
    from public.order_items oi
    where oi.order_id = p_order_id
      and oi.fulfillment_snapshot = 'express'
    group by oi.variant_id
    order by oi.variant_id
  loop
    if r_demand.need < 1 then
      continue;
    end if;

    select pv.express_stock into v_current
    from public.product_variants pv
    where pv.id = r_demand.variant_id
    for update;

    if not found then
      raise exception 'Variante no encontrada: %', r_demand.variant_id
        using errcode = 'P0001';
    end if;

    if v_current < r_demand.need then
      raise exception
        'Stock express insuficiente (variante %): solicitado %, disponible %',
        r_demand.variant_id,
        r_demand.need,
        v_current
        using errcode = 'P0001';
    end if;

    update public.product_variants
    set
      express_stock = express_stock - r_demand.need,
      updated_at = now()
    where id = r_demand.variant_id
      and express_stock >= r_demand.need;

    get diagnostics n_variants = row_count;
    if n_variants <> 1 then
      raise exception
        'No se pudo descontar stock de la variante % (solicitado %).',
        r_demand.variant_id,
        r_demand.need
        using errcode = 'P0001';
    end if;
  end loop;

  update public.orders
  set stock_discounted_at = p_discounted_at
  where id = p_order_id
    and stock_discounted_at is null;

  get diagnostics n_variants = row_count;
  if n_variants <> 1 then
    raise exception
      'No se pudo marcar el descuento de stock del pedido % (esperada 1 fila, %).',
      p_order_id,
      n_variants
      using errcode = 'P0001';
  end if;

  return true;
end;
$$;

revoke all on function public.discount_order_express_stock(uuid, timestamptz) from public;
grant execute on function public.discount_order_express_stock(uuid, timestamptz) to service_role;

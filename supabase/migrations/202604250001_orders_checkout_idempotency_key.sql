alter table public.orders
add column if not exists checkout_idempotency_key text;

create unique index if not exists orders_checkout_idempotency_key_unique
on public.orders (checkout_idempotency_key)
where checkout_idempotency_key is not null;

-- Inserción atómica: una orden y todos sus order_items en la misma transacción
-- (sin filas huérfanas si falla algún item).
create or replace function public.insert_order_with_items(
  p_order jsonb,
  p_items jsonb
)
returns void
language plpgsql
set search_path = public
as $$
declare
  v_order_id uuid;
begin
  if p_order is null or jsonb_typeof(p_order) != 'object' then
    raise exception 'p_order debe ser un objeto JSON' using errcode = 'P0001';
  end if;

  if p_items is null
     or jsonb_typeof(p_items) != 'array'
     or jsonb_array_length(p_items) = 0
  then
    raise exception 'El pedido debe incluir al menos un item' using errcode = 'P0001';
  end if;

  v_order_id := (p_order->>'id')::uuid;
  if v_order_id is null then
    raise exception 'El pedido requiere id UUID valido' using errcode = 'P0001';
  end if;

  insert into public.orders (
    id,
    public_reference,
    total,
    customer_full_name,
    customer_phone,
    customer_email,
    customer_address,
    customer_city,
    customer_department,
    customer_country,
    checkout_idempotency_key
  )
  select
    o.id,
    o.public_reference,
    o.total::numeric(12,2),
    o.customer_full_name,
    o.customer_phone,
    o.customer_email,
    o.customer_address,
    o.customer_city,
    o.customer_department,
    o.customer_country,
    o.checkout_idempotency_key
  from
    jsonb_to_record(p_order) as o(
      id uuid,
      public_reference text,
      total text,
      customer_full_name text,
      customer_phone text,
      customer_email text,
      customer_address text,
      customer_city text,
      customer_department text,
      customer_country text,
      checkout_idempotency_key text
    );

  insert into public.order_items (
    order_id,
    product_id,
    variant_id,
    title_snapshot,
    size_snapshot,
    fulfillment_snapshot,
    promised_min_days,
    promised_max_days,
    unit_price_snapshot,
    quantity,
    customization_snapshot
  )
  select
    v_order_id,
    oi.product_id::uuid,
    oi.variant_id::uuid,
    oi.title_snapshot,
    oi.size_snapshot,
    oi.fulfillment_snapshot,
    oi.promised_min_days,
    oi.promised_max_days,
    oi.unit_price_snapshot::numeric(12,2),
    oi.quantity,
    oi.customization_snapshot
  from
    jsonb_to_recordset(p_items) as oi(
      product_id text,
      variant_id text,
      title_snapshot text,
      size_snapshot text,
      fulfillment_snapshot text,
      promised_min_days integer,
      promised_max_days integer,
      unit_price_snapshot text,
      quantity integer,
      customization_snapshot jsonb
    );
end;
$$;

revoke all on function public.insert_order_with_items(jsonb, jsonb) from public;
grant execute on function public.insert_order_with_items(jsonb, jsonb) to service_role;

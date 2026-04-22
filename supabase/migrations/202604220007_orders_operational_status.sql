alter table public.orders
add column if not exists operational_status text null,
add column if not exists operational_updated_at timestamptz null;

alter table public.orders
drop constraint if exists orders_operational_status_check;

alter table public.orders
add constraint orders_operational_status_check check (
  operational_status is null
  or operational_status in ('paid', 'preparing', 'ready', 'shipped', 'delivered', 'cancelled')
);

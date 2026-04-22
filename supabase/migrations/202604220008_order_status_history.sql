create table if not exists public.order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  previous_status text null,
  new_status text not null,
  changed_at timestamptz not null default now(),
  changed_by text null,
  constraint order_status_history_previous_status_check check (
    previous_status is null
    or previous_status in ('paid', 'preparing', 'ready', 'shipped', 'delivered', 'cancelled')
  ),
  constraint order_status_history_new_status_check check (
    new_status in ('paid', 'preparing', 'ready', 'shipped', 'delivered', 'cancelled')
  )
);

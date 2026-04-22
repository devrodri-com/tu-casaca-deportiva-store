alter table public.orders
add column if not exists payment_status text not null default 'awaiting_payment',
add column if not exists mercado_pago_preference_id text null,
add column if not exists mercado_pago_payment_id text null,
add column if not exists mercado_pago_status text null,
add column if not exists paid_at timestamptz null;

alter table public.orders
drop constraint if exists orders_payment_status_check;

alter table public.orders
add constraint orders_payment_status_check check (
  payment_status in ('awaiting_payment', 'pending', 'paid', 'failed')
);

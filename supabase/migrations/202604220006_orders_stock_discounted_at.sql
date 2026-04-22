alter table public.orders
add column if not exists stock_discounted_at timestamptz null;

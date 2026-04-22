alter table public.orders
add column if not exists customer_full_name text not null default '',
add column if not exists customer_phone text not null default '',
add column if not exists customer_email text null;

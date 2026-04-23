alter table public.orders
  add column if not exists customer_address text not null default '',
  add column if not exists customer_city text not null default '',
  add column if not exists customer_department text not null default '',
  add column if not exists customer_country text not null default 'Uruguay';

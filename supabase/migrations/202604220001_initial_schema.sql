create extension if not exists pgcrypto;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  audience text not null check (audience in ('adult', 'kids')),
  product_type text not null check (product_type in ('football_jersey', 'nba_jersey', 'jacket')),
  entity_slug text not null,
  entity_name text not null,
  entity_kind text not null check (entity_kind in ('club', 'national_team', 'franchise')),
  era text not null check (era in ('current', 'retro')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete restrict,
  size text not null,
  unit_base_price numeric(12,2) not null check (unit_base_price >= 0),
  express_stock integer not null default 0 check (express_stock >= 0),
  allow_made_to_order boolean not null default false,
  made_to_order_min_days integer null,
  made_to_order_max_days integer null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, size),
  constraint product_variants_made_to_order_days_check check (
    (allow_made_to_order = false and made_to_order_min_days is null and made_to_order_max_days is null)
    or (
      allow_made_to_order = true
      and made_to_order_min_days is not null
      and made_to_order_max_days is not null
      and made_to_order_min_days >= 1
      and made_to_order_max_days >= 1
      and made_to_order_min_days <= made_to_order_max_days
    )
  )
);

create table if not exists public.orders (
  id uuid primary key,
  total numeric(12,2) not null check (total >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null,
  variant_id uuid not null,
  title_snapshot text not null,
  size_snapshot text not null,
  fulfillment_snapshot text not null check (fulfillment_snapshot in ('express', 'made_to_order', 'unavailable')),
  promised_min_days integer null,
  promised_max_days integer null,
  unit_price_snapshot numeric(12,2) not null check (unit_price_snapshot >= 0),
  quantity integer not null default 1 check (quantity >= 1),
  customization_snapshot jsonb null
);

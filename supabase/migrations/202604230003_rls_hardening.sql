-- RLS: catálogo legible con anon solo para productos y derivados activos;
--      pedidos y subtablas sin políticas para anon (solo service_role bypass).

-- products
alter table public.products enable row level security;
drop policy if exists "public_read_active_products" on public.products;
create policy "public_read_active_products"
  on public.products
  for select
  to anon, authenticated
  using (is_active = true);

-- product_variants
alter table public.product_variants enable row level security;
drop policy if exists "public_read_variants_of_active_product" on public.product_variants;
create policy "public_read_variants_of_active_product"
  on public.product_variants
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.products p
      where
        p.id = product_variants.product_id
        and p.is_active = true
    )
  );

-- product_images
alter table public.product_images enable row level security;
drop policy if exists "public_read_images_of_active_product" on public.product_images;
create policy "public_read_images_of_active_product"
  on public.product_images
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.products p
      where
        p.id = product_images.product_id
        and p.is_active = true
    )
  );

-- orders: sin policy pública; insert/select/update vía service_role (checkout, webhooks, orden pública)
alter table public.orders enable row level security;

-- order_items
alter table public.order_items enable row level security;

-- order_status_history
alter table public.order_status_history enable row level security;

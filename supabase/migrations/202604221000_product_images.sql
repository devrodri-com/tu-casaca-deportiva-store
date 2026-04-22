-- Metadatos de imágenes por producto (URLs públicas se derivan de storage_path + bucket)
create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  storage_path text not null,
  alt_text text null,
  sort_order integer not null default 0,
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  unique (product_id, storage_path)
);

create unique index if not exists product_images_one_primary_per_product
  on public.product_images (product_id)
  where is_primary = true;

create index if not exists product_images_product_id_sort
  on public.product_images (product_id, sort_order, created_at);

-- Bucket público V1: lectura directa en storefront; escritura solo server-side (service role)
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "product_images_public_read" on storage.objects;

create policy "product_images_public_read"
  on storage.objects for select
  to public
  using (bucket_id = 'product-images');

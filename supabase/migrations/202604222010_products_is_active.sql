-- Visibilidad en storefront (independiente de stock por variante)
alter table public.products
  add column if not exists is_active boolean not null default true;

comment on column public.products.is_active is
  'Si es false, el producto no se muestra en la tienda; las variantes siguen existiendo en admin.';

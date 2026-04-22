alter table public.products
add column if not exists supports_customization boolean not null default false,
add column if not exists customization_surcharge numeric(12,2) null;

alter table public.products
drop constraint if exists products_customization_check;

alter table public.products
add constraint products_customization_check check (
  supports_customization = false
  or (
    customization_surcharge is not null
    and customization_surcharge >= 0
  )
);

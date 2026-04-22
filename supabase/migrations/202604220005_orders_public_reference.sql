alter table public.orders
add column if not exists public_reference text;

update public.orders
set public_reference = encode(gen_random_bytes(8), 'hex')
where public_reference is null;

alter table public.orders
alter column public_reference set not null;

alter table public.orders
drop constraint if exists orders_public_reference_key;

alter table public.orders
add constraint orders_public_reference_key unique (public_reference);

-- GamePriceCheck Prototype 2: database schema (Specification 2)
-- Run on a clean Supabase project before db/02_seed.sql.
-- Field names follow the Analyst specification exactly.
-- Safe to re-run: objects are created only if they do not already exist.

begin;

-- gen_random_uuid() is built in to PostgreSQL 13+ (Supabase runs 15+).

-- ---------------------------------------------------------------------------
-- category: top-level product groupings (Games, Consoles, Accessories)
-- ---------------------------------------------------------------------------
create table if not exists public.category (
  category_id uuid primary key default gen_random_uuid(),
  name text not null unique check (char_length(trim(name)) between 1 and 100),
  description text,
  display_order integer not null unique check (display_order >= 0)
);

-- ---------------------------------------------------------------------------
-- maker: company that develops or manufactures a product
-- ---------------------------------------------------------------------------
create table if not exists public.maker (
  maker_id uuid primary key default gen_random_uuid(),
  name text not null unique check (char_length(trim(name)) between 1 and 150),
  website_url text check (website_url ~ '^https?://'),
  description text
);

-- ---------------------------------------------------------------------------
-- platform: hardware a product runs on or works with
-- ---------------------------------------------------------------------------
create table if not exists public.platform (
  platform_id uuid primary key default gen_random_uuid(),
  name text not null unique check (char_length(trim(name)) between 1 and 100),
  manufacturer text not null check (char_length(trim(manufacturer)) between 1 and 150),
  release_year integer check (release_year between 1970 and 2100)
);

-- ---------------------------------------------------------------------------
-- product: one physical game, console, or accessory
-- ---------------------------------------------------------------------------
create table if not exists public.product (
  product_id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.category (category_id) on delete restrict,
  maker_id uuid not null references public.maker (maker_id) on delete restrict,
  name text not null check (char_length(trim(name)) between 1 and 200),
  image_url text check (image_url ~ '^https?://'),
  release_year integer check (release_year between 1970 and 2100),
  description text
);

create index if not exists product_category_id_idx on public.product (category_id);
create index if not exists product_maker_id_idx on public.product (maker_id);

-- ---------------------------------------------------------------------------
-- product_platform: many-to-many link between product and platform
-- ---------------------------------------------------------------------------
create table if not exists public.product_platform (
  product_platform_id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.product (product_id) on delete cascade,
  platform_id uuid not null references public.platform (platform_id) on delete restrict,
  unique (product_id, platform_id)
);

create index if not exists product_platform_platform_id_idx on public.product_platform (platform_id);

-- ---------------------------------------------------------------------------
-- retailer: store or marketplace that sells products
-- ---------------------------------------------------------------------------
create table if not exists public.retailer (
  retailer_id uuid primary key default gen_random_uuid(),
  name text not null unique check (char_length(trim(name)) between 1 and 150),
  website_url text not null check (website_url ~ '^https?://'),
  active boolean not null default true
);

-- ---------------------------------------------------------------------------
-- listing: one retailer's offer for one product
-- price is the current selling price; discount_amount is the dollar amount
-- off the retailer's regular price (0 when not on sale).
-- ---------------------------------------------------------------------------
create table if not exists public.listing (
  listing_id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.product (product_id) on delete cascade,
  retailer_id uuid not null references public.retailer (retailer_id) on delete restrict,
  price numeric(10, 2) not null check (price >= 0),
  condition text not null check (condition in ('new', 'used', 'refurbished')),
  in_stock boolean not null default true,
  discount_amount numeric(10, 2) not null default 0 check (discount_amount >= 0),
  product_url text not null check (product_url ~ '^https?://'),
  last_updated timestamptz not null default now()
);

create index if not exists listing_product_id_idx on public.listing (product_id);
create index if not exists listing_retailer_id_idx on public.listing (retailer_id);
create index if not exists listing_price_idx on public.listing (price);
create index if not exists listing_condition_idx on public.listing (condition);

-- Keep listing.last_updated current whenever a listing row changes.
create or replace function public.set_listing_last_updated()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.last_updated = now();
  return new;
end;
$$;

drop trigger if exists listing_set_last_updated on public.listing;
create trigger listing_set_last_updated
  before update on public.listing
  for each row execute function public.set_listing_last_updated();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- Catalog data is public and read-only: anyone may SELECT; no INSERT/UPDATE/
-- DELETE policies exist, so writes are only possible with the service-role key
-- (server side) or from the Supabase dashboard.
-- ---------------------------------------------------------------------------
alter table public.category enable row level security;
alter table public.maker enable row level security;
alter table public.platform enable row level security;
alter table public.product enable row level security;
alter table public.product_platform enable row level security;
alter table public.retailer enable row level security;
alter table public.listing enable row level security;

drop policy if exists "Public read access" on public.category;
create policy "Public read access" on public.category for select to anon, authenticated using (true);

drop policy if exists "Public read access" on public.maker;
create policy "Public read access" on public.maker for select to anon, authenticated using (true);

drop policy if exists "Public read access" on public.platform;
create policy "Public read access" on public.platform for select to anon, authenticated using (true);

drop policy if exists "Public read access" on public.product;
create policy "Public read access" on public.product for select to anon, authenticated using (true);

drop policy if exists "Public read access" on public.product_platform;
create policy "Public read access" on public.product_platform for select to anon, authenticated using (true);

drop policy if exists "Public read access" on public.retailer;
create policy "Public read access" on public.retailer for select to anon, authenticated using (true);

drop policy if exists "Public read access" on public.listing;
create policy "Public read access" on public.listing for select to anon, authenticated using (true);

commit;

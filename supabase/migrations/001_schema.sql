-- ============================================================
-- Glow Addict by Sayanita — Full Database Schema
-- Run in Supabase SQL Editor — safe to re-run (idempotent)
-- ============================================================

-- 0. Extensions
create extension if not exists "pgcrypto" with schema public;

-- ============================================================
-- 1. CUSTOM ENUMS (wrapped in DO for idempotency)
-- ============================================================
do $$ begin
  create type public.order_status as enum ('created', 'packed', 'shipped', 'delivered');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.payment_method as enum ('UPI', 'COD');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.payment_status as enum ('pending', 'pending_verification', 'paid', 'failed');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.claim_type as enum ('damage', 'missing');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.claim_status as enum ('pending', 'approved', 'rejected');
exception
  when duplicate_object then null;
end $$;

-- ============================================================
-- 2. PROFILES (extends Supabase Auth.users)
-- ============================================================
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text not null default '',
  phone       text,
  avatar_url  text,
  is_admin    boolean not null default false,
  created_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_self_select" on public.profiles;
create policy "profiles_self_select" on public.profiles for select using (auth.uid() = id);

drop policy if exists "profiles_self_insert" on public.profiles;
create policy "profiles_self_insert" on public.profiles for insert with check (auth.uid() = id);

drop policy if exists "profiles_self_update" on public.profiles;
create policy "profiles_self_update" on public.profiles for update using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, name, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', ''),
    new.raw_user_meta_data ->> 'phone'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- 3. PRODUCTS
-- ============================================================
create table if not exists public.products (
  id                    text primary key,
  sku                   text not null,
  title                 text not null,
  brand                 text not null,
  category              text not null,
  price                 numeric not null check (price >= 0),
  mrp                   numeric not null check (mrp >= 0),
  stock                 integer not null default 0 check (stock >= 0),
  image                 text not null,
  shades                text[] default '{}',
  authenticity_flag     boolean not null default true,
  description           text not null,
  extracted_text        text,
  cloudinary_public_id  text,
  ai_extraction         jsonb not null default '{}'::jsonb,
  slug                  text,
  ingredients           text,
  benefits              text,
  skin_type             text,
  product_type          text,
  tags                  text[] default '{}',
  seo_title             text,
  seo_description       text,
  seo_keywords          text[] default '{}',
  discount_percent      integer,
  variant               text,
  weight                text,
  ai_confidence         integer,
  status                text default 'active',
  created_at            timestamptz not null default now()
);

alter table public.products enable row level security;

drop policy if exists "products_public_select" on public.products;
create policy "products_public_select" on public.products for select using (true);

drop policy if exists "products_admin_all" on public.products;
create policy "products_admin_all" on public.products for all using (true) with check (true);

-- ============================================================
-- 4. ORDERS
-- ============================================================
create table if not exists public.orders (
  id                  text primary key,
  user_id             uuid references auth.users(id) on delete set null,
  customer_name       text not null,
  customer_phone      text not null,
  customer_email      text not null,
  street_address      text not null,
  city                text not null,
  state               text not null,
  zip_code            text not null,
  items               jsonb not null default '[]'::jsonb,
  total_amount        numeric not null check (total_amount >= 0),
  delivery_charge     numeric not null default 0,
  payment_method      public.payment_method not null,
  payment_status      public.payment_status not null default 'pending',
  order_status        public.order_status not null default 'created',
  upi_transaction_id  text,
  screenshot_url      text,
  courier             text,
  tracking_id         text,
  freebies            jsonb not null default '{}'::jsonb,
  admin_notes         text,
  created_at          timestamptz not null default now()
);

alter table public.orders enable row level security;

drop policy if exists "orders_owner_select" on public.orders;
create policy "orders_owner_select" on public.orders for select using (auth.uid() = user_id);

drop policy if exists "orders_owner_insert" on public.orders;
create policy "orders_owner_insert" on public.orders for insert with check (auth.uid() = user_id);

drop policy if exists "orders_owner_update_payment" on public.orders;
create policy "orders_owner_update_payment" on public.orders for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id and (payment_status = 'pending' or payment_status = 'pending_verification'));

drop policy if exists "orders_admin_all" on public.orders;
create policy "orders_admin_all" on public.orders for all using (true) with check (true);

-- ============================================================
-- 5. ORDER ITEMS (normalized)
-- ============================================================
create table if not exists public.order_items (
  id            uuid primary key default gen_random_uuid(),
  order_id      text not null references public.orders(id) on delete cascade,
  product_id    text not null references public.products(id) on delete set null,
  product_title text not null,
  product_brand text not null,
  product_image text not null,
  price         numeric not null,
  quantity      integer not null check (quantity > 0),
  selected_shade text,
  created_at    timestamptz not null default now()
);

alter table public.order_items enable row level security;

drop policy if exists "order_items_owner_select" on public.order_items;
create policy "order_items_owner_select" on public.order_items for select
  using (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id and orders.user_id = auth.uid()
    )
  );

drop policy if exists "order_items_insert" on public.order_items;
create policy "order_items_insert" on public.order_items for insert with check (true);

-- ============================================================
-- 6. CLAIMS (damage / missing item disputes)
-- ============================================================
create table if not exists public.claims (
  id                 text primary key,
  order_id           text not null references public.orders(id) on delete cascade,
  user_id            uuid references auth.users(id) on delete cascade,
  claim_type         public.claim_type not null,
  unboxing_video_url text not null,
  status             public.claim_status not null default 'pending',
  resolution_notes   text,
  created_at         timestamptz not null default now()
);

alter table public.claims enable row level security;

drop policy if exists "claims_owner_select" on public.claims;
create policy "claims_owner_select" on public.claims for select using (auth.uid() = user_id);

drop policy if exists "claims_owner_insert" on public.claims;
create policy "claims_owner_insert" on public.claims for insert with check (auth.uid() = user_id);

drop policy if exists "claims_admin_all" on public.claims;
create policy "claims_admin_all" on public.claims for all using (true) with check (true);

-- ============================================================
-- 7. STORAGE BUCKETS & POLICIES
-- ============================================================
do $$ begin
  -- Storage bucket insert — skip gracefully if the extension/table doesn't exist yet
  insert into storage.buckets (id, name, public)
  values
    ('product-images',     'product-images',     true),
    ('payment-screenshots','payment-screenshots',false),
    ('unboxing-videos',    'unboxing-videos',    false)
  on conflict (id) do nothing;
exception
  when undefined_table or undefined_object then null;
end $$;

-- Drop old policies first (storage policy names may conflict on re-run)
drop policy if exists "public read product images" on storage.objects;
drop policy if exists "public upload product images" on storage.objects;
drop policy if exists "product_images_select" on storage.objects;
drop policy if exists "product_images_insert" on storage.objects;
drop policy if exists "payment_screenshots_insert" on storage.objects;
drop policy if exists "payment_screenshots_select" on storage.objects;
drop policy if exists "unboxing_videos_insert" on storage.objects;
drop policy if exists "unboxing_videos_select" on storage.objects;

-- Product images — public read/write
create policy "product_images_select" on storage.objects for select
  using (bucket_id = 'product-images');

create policy "product_images_insert" on storage.objects for insert
  with check (bucket_id = 'product-images');

-- Payment screenshots
create policy "payment_screenshots_insert" on storage.objects for insert
  with check (bucket_id = 'payment-screenshots');

create policy "payment_screenshots_select" on storage.objects for select
  using (bucket_id = 'payment-screenshots');

-- Unboxing videos
create policy "unboxing_videos_insert" on storage.objects for insert
  with check (bucket_id = 'unboxing-videos');

create policy "unboxing_videos_select" on storage.objects for select
  using (bucket_id = 'unboxing-videos');

-- ============================================================
-- 8. INDEXES
-- ============================================================
create index if not exists idx_orders_user_id on public.orders(user_id);
create index if not exists idx_orders_payment_status on public.orders(payment_status);
create index if not exists idx_claims_order_id on public.claims(order_id);
create index if not exists idx_claims_user_id on public.claims(user_id);
create index if not exists idx_order_items_order_id on public.order_items(order_id);
create index if not exists idx_order_items_product_id on public.order_items(product_id);
create index if not exists idx_products_brand on public.products(brand);
create index if not exists idx_products_category on public.products(category);

-- ============================================================
-- 9. SEED DATA (6 initial products — safe to re-run)
-- ============================================================
insert into public.products (id, sku, title, brand, category, price, mrp, stock, image, authenticity_flag, description) values
  ('prod-1', 'COS-SNAIL-96', 'Advanced Snail 96 Mucin Power Essence', 'COSRX', 'Essence / Hydration', 1150, 1450, 15, 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80', true, 'Formulated with 96.3% Snail Secretion Filtrate, this essence protects the skin from moisture loss while improving skin elasticity.'),
  ('prod-2', 'ORD-NIAC-10', 'Niacinamide 10% + Zinc 1% Blemish Serum', 'The Ordinary', 'Serum / Blemish Control', 580, 650, 25, 'https://images.unsplash.com/photo-1608248597481-496100c80836?auto=format&fit=crop&w=600&q=80', true, 'A high-strength vitamin and mineral blemish formula with 10% pure niacinamide and 1% zinc PCA.'),
  ('prod-3', 'BOJ-RICE-SUN', 'Relief Sun : Rice + Probiotics SPF50+', 'Beauty of Joseon', 'Sunscreen / Protection', 1290, 1550, 10, 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=600&q=80', true, 'Lightweight and creamy organic sunscreen with a moist, non-sticky finish.'),
  ('prod-4', 'LAN-LIP-MASK', 'Lip Sleeping Mask Berry & Fruits', 'Laneige', 'Lip Care / Nourishing', 1380, 1620, 18, 'https://images.unsplash.com/photo-1631214524020-5e184106d93d?auto=format&fit=crop&w=600&q=80', true, 'Leave-on lip mask delivering intense moisture and antioxidants while you sleep.'),
  ('prod-5', 'CER-CLEAN-HYDR', 'Hydrating Facial Cleanser for Normal to Dry Skin', 'CeraVe', 'Cleanser / Barrier Repair', 1090, 1250, 8, 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80', true, 'Unique formula with three essential ceramides for cleansing, hydrating and restoring skin barrier.'),
  ('prod-6', 'ANU-TONER-77', 'Heartleaf 77% Soothing Calming Toner', 'Anua', 'Toner / Calming', 1450, 1750, 12, 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=600&q=80', true, 'Highly soothing toner infused with 77% Heartleaf Extract for sensitive, troubled skin.')
on conflict (id) do nothing;

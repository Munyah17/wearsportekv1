-- WearSportek database schema (run in Supabase SQL editor)
-- Roles: 'admin' | 'user' on profiles.role

create table if not exists profiles (
  id uuid primary key references auth.users on delete cascade,
  email text,
  full_name text default '',
  phone text,
  role text not null default 'user' check (role in ('admin','user')),
  created_at timestamptz default now()
);

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  tagline text,
  image_url text,
  sort_order int default 0,
  is_active boolean default true
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  category_slug text references categories(slug) on update cascade,
  name text not null,
  description text,
  price numeric(10,2) not null,
  compare_at_price numeric(10,2),
  images text[] default '{}',
  sizes text[] default '{}',
  stock int default 0,
  is_featured boolean default false,
  is_customizable boolean default false,
  custom_fee numeric(10,2),
  is_active boolean default true,
  badge text,
  created_at timestamptz default now()
);

create table if not exists banners (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  cta_label text,
  cta_link text,
  image_url text,
  sort_order int default 0,
  is_active boolean default true
);

create table if not exists delivery_zones (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  fee numeric(10,2) not null default 0,
  eta text,
  is_active boolean default true
);

create table if not exists payment_methods (
  id text primary key,
  label text not null,
  hint text,
  is_active boolean default true,
  sort_order int default 0
);

create table if not exists site_settings (
  id int primary key default 1,
  site_name text default 'WearSportek',
  tagline text,
  contact_phone text,
  contact_whatsapp text,
  contact_email text,
  address text,
  about_title text,
  about_body text,
  footer_text text,
  socials jsonb default '[]',
  customisation_fee numeric(10,2) default 5,
  customisation_name_fee numeric(10,2) default 3,
  customisation_number_fee numeric(10,2) default 3,
  announcement text,
  currency text default 'USD',
  constraint single_row check (id = 1)
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  user_id uuid references auth.users on delete set null,
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  delivery_zone_id uuid,
  delivery_address text,
  delivery_fee numeric(10,2) default 0,
  subtotal numeric(10,2) not null,
  total numeric(10,2) not null,
  payment_method text,
  paynow_reference text,
  paynow_poll_url text,
  status text default 'awaiting_payment'
    check (status in ('awaiting_payment','paid','failed','processing','shipped','delivered','cancelled'))
);

create table if not exists order_items (
  id bigint generated always as identity primary key,
  order_id uuid references orders(id) on delete cascade,
  product_id text,
  product_name text,
  size text,
  qty int not null,
  unit_price numeric(10,2) not null,
  custom_name text,
  custom_number text,
  custom_fee numeric(10,2) default 0
);

-- Auto-create a profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name',''));
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Helper: is current user an admin?
create or replace function public.is_admin()
returns boolean language sql security definer stable set search_path = public as $$
  select exists(select 1 from profiles where id = auth.uid() and role = 'admin');
$$;

-- RLS
alter table profiles enable row level security;
alter table categories enable row level security;
alter table products enable row level security;
alter table banners enable row level security;
alter table delivery_zones enable row level security;
alter table payment_methods enable row level security;
alter table site_settings enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

-- Public read for catalog/content
create policy "public read categories" on categories for select using (true);
create policy "public read products" on products for select using (true);
create policy "public read banners" on banners for select using (true);
create policy "public read zones" on delivery_zones for select using (true);
create policy "public read methods" on payment_methods for select using (true);
create policy "public read settings" on site_settings for select using (true);
custersnheilcn n;oadmi rasadalol
-- Tighten later: allow users to read own orders via customer_phone/email match.
create policy "anyone creates orders" on orders for insert with check (true);
create policy "users read own orders" on orders for select using (auth.uid() = user_id);
create policy "admin reads orders" on orders for select using (public.is_admin());
create policy "admin updates orders" on orders for update using (public.is_admin());
create policy "anyone creates order items" on order_items for insert with check (true););
create policy "users read own order items" on order_items for select using (
  exists (select 1 from orders where orders.id = order_items.order_id and orders.user_id = auth.uid())

create policy "admin reads order items" on order_items for select using (public.is_admin());

-- Profiles: user reads/updates self; admin reads all
create policy "read own profile" on profiles for select using (auth.uid() = id or public.is_admin());
create policy "update own profile" on profiles for update using (auth.uid() = id);

-- Admin write access to everything else
create policy "admin write categories" on categories for all using (public.is_admin()) with check (public.is_admin());
create policy "admin write products" on products for all using (public.is_admin()) with check (public.is_admin());
create policy "admin write banners" on banners for all using (public.is_admin()) with check (public.is_admin());
create policy "admin write zones" on delivery_zones for all using (public.is_admin()) with check (public.is_admin());
create policy "admin write methods" on payment_methods for all using (public.is_admin()) with check (public.is_admin());
create policy "admin write settings" on site_settings for all using (public.is_admin()) with check (public.is_admin());

insert into site_settings (id) values (1) on conflict (id) do nothing;

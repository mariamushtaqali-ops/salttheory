-- ─────────────────────────────────────────
-- Salt Theory — Supabase Schema
-- Run this entire file in the Supabase SQL editor
-- ─────────────────────────────────────────

-- Profiles (extends Supabase auth.users)
create table public.profiles (
  id              uuid references auth.users on delete cascade primary key,
  email           text not null,
  first_name      text,
  last_name       text,
  tier            text not null default 'free' check (tier in ('free', 'pro')),
  role            text check (role in ('home_cook', 'home_business', 'caterer', 'restaurant')),
  recipe_count    int not null default 0,
  costing_count   int not null default 0,
  billing_date    timestamptz,
  is_admin        boolean not null default false,
  created_at      timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, first_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'first_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Recipes
create table public.recipes (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references public.profiles on delete cascade not null,
  dish_name     text not null,
  occasion      text,
  cuisine       text,
  servings      text,
  dietary       text[],
  ingredients_on_hand text,
  output        jsonb not null,
  created_at    timestamptz not null default now()
);

-- Costings
create table public.costings (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references public.profiles on delete cascade not null,
  dish_name       text not null,
  ingredients     jsonb not null,
  packaging_cost  numeric not null default 0,
  selling_price   numeric not null,
  total_cost      numeric not null,
  profit          numeric not null,
  margin_pct      numeric not null,
  created_at      timestamptz not null default now()
);

-- Blog posts
create table public.blog_posts (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  title       text not null,
  excerpt     text,
  body        text not null,
  published   boolean not null default false,
  created_at  timestamptz not null default now()
);

-- Newsletter subscribers
create table public.subscribers (
  id          uuid primary key default gen_random_uuid(),
  email       text unique not null,
  source      text not null default 'homepage',
  created_at  timestamptz not null default now()
);

-- ── Row Level Security ─────────────────────
alter table public.profiles   enable row level security;
alter table public.recipes    enable row level security;
alter table public.costings   enable row level security;
alter table public.blog_posts enable row level security;
alter table public.subscribers enable row level security;

-- Profiles: users see only their own
create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Recipes: users manage their own
create policy "Users manage own recipes"
  on public.recipes for all using (auth.uid() = user_id);

-- Costings: users manage their own
create policy "Users manage own costings"
  on public.costings for all using (auth.uid() = user_id);

-- Blog posts: anyone can read published posts
create policy "Anyone can read published posts"
  on public.blog_posts for select using (published = true);

-- Subscribers: insert only (no reading your own row needed)
create policy "Anyone can subscribe"
  on public.subscribers for insert with check (true);

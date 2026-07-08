-- ─────────────────────────────────────────
-- Salt Theory — PR7 migration
-- Run this in the Supabase SQL editor before deploying the PR7 code.
-- Adds two new tables. Does not touch any existing table or data.
-- ─────────────────────────────────────────

-- Tracks one free Recipe Studio generation + one free Plate Profit costing
-- per anonymous visitor (identified by a server-set cookie, not personal data).
create table public.anon_usage (
  anon_id       uuid primary key,
  recipe_used   boolean not null default false,
  costing_used  boolean not null default false,
  created_at    timestamptz not null default now()
);

-- Lightweight event log for the funnel described in PR7
-- (Recipe completed, Costing completed, Signup panel shown, Account created, etc).
create table public.events (
  id          uuid primary key default gen_random_uuid(),
  event_name  text not null,
  anon_id     uuid,
  user_id     uuid references public.profiles on delete set null,
  meta        jsonb,
  created_at  timestamptz not null default now()
);

alter table public.anon_usage enable row level security;
alter table public.events     enable row level security;

-- Both tables are only ever written/read via server-side API routes using
-- the anon_id cookie as the key. Neither table stores personal data (no
-- email, no name), so permissive RLS is an acceptable tradeoff here —
-- unlike `profiles`, `recipes`, or `costings`, which stay locked to
-- auth.uid() as before and are NOT changed by this migration.
create policy "Server routes can manage anon_usage"
  on public.anon_usage for all using (true) with check (true);
create policy "Server routes can manage events"
  on public.events for all using (true) with check (true);

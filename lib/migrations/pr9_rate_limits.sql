-- Run this once in Supabase SQL Editor to enable rate limiting
-- on the recipe generator and newsletter signup endpoints.

create table if not exists public.rate_limits (
  key          text not null,
  window_start timestamptz not null,
  count        int not null default 1,
  primary key (key, window_start)
);

alter table public.rate_limits enable row level security;

drop policy if exists "Server routes can manage rate_limits" on public.rate_limits;
create policy "Server routes can manage rate_limits"
  on public.rate_limits for all using (true) with check (true);

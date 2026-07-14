-- Run this in the Supabase SQL editor before deploying the Safepay integration.
-- Adds a column to track which Safepay subscription a Pro user is on.
-- Nullable, no default needed — existing rows are unaffected.

alter table public.profiles
add column if not exists safepay_subscription_id text;

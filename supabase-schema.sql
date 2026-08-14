-- ============================================================
-- Coalition Tiers — Supabase schema
-- Run this once in your Supabase project's SQL Editor
-- (Dashboard -> SQL Editor -> New query -> paste -> Run).
-- ============================================================

create table if not exists players (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  name_key text not null unique,       -- lowercase name, used for case-insensitive uniqueness
  region text,                          -- optional, e.g. "NA", "EU" — shown on profile card
  tiers jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Safe to re-run: adds the region column if you already created the
-- table before this field existed.
alter table players add column if not exists region text;

create index if not exists players_name_key_idx on players (name_key);

-- Keep updated_at current on every edit
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists players_set_updated_at on players;
create trigger players_set_updated_at
  before update on players
  for each row execute function set_updated_at();

-- Row Level Security
alter table players enable row level security;

-- Anyone can VIEW the leaderboard (no login needed).
drop policy if exists "Public read access" on players;
create policy "Public read access" on players
  for select using (true);

-- Only a logged-in (authenticated) user can add, edit, or remove players.
-- Pair this with disabling public sign-ups in Supabase Auth settings
-- (see README.md) so the only account that can log in is the one you
-- create for yourself. This is enforced server-side by Postgres, so it
-- can't be bypassed from the browser even by someone editing the JS.
drop policy if exists "Public insert access" on players;
create policy "Authenticated insert access" on players
  for insert with check (auth.role() = 'authenticated');

drop policy if exists "Public update access" on players;
create policy "Authenticated update access" on players
  for update using (auth.role() = 'authenticated');

drop policy if exists "Public delete access" on players;
create policy "Authenticated delete access" on players
  for delete using (auth.role() = 'authenticated');

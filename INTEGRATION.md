-- ═══════════════════════════════════════════════════════════════
-- REPO PRO — Supabase SQL Setup
-- Run this in: Supabase Dashboard → SQL Editor → New Query
--
-- What this does:
--   1. Enables Realtime on both tables
--   2. Sets RLS so ALL logged-in users share the same data
--      (global inventory — not per-user)
--   3. Blocks anonymous / unauthenticated access
-- ═══════════════════════════════════════════════════════════════


-- ───────────────────────────────────────────────────────────────
-- 0. ENABLE REALTIME
--    Adds both tables to the Supabase Realtime publication so
--    your useRealtimeRepos / useRealtimeInventory hooks work.
-- ───────────────────────────────────────────────────────────────
alter publication supabase_realtime add table repos;
alter publication supabase_realtime add table inventory;


-- ───────────────────────────────────────────────────────────────
-- 1. REPOS TABLE — make sure RLS is on
-- ───────────────────────────────────────────────────────────────
alter table repos enable row level security;

-- Drop any old per-user policies that may exist
drop policy if exists "Users can view own repos"  on repos;
drop policy if exists "Users can insert own repos" on repos;
drop policy if exists "Users can update own repos" on repos;
drop policy if exists "Users can delete own repos" on repos;

-- ✅ Global: every logged-in user can SELECT all repos
create policy "Authenticated users can view all repos"
  on repos for select
  using ( auth.role() = 'authenticated' );

-- ✅ Global: every logged-in user can INSERT (we store user_id for audit)
create policy "Authenticated users can insert repos"
  on repos for insert
  with check ( auth.role() = 'authenticated' );

-- ✅ Global: every logged-in user can UPDATE any repo
--    (narrow this to "own" if you want only the creator to edit)
create policy "Authenticated users can update repos"
  on repos for update
  using ( auth.role() = 'authenticated' );

-- ✅ Global: every logged-in user can DELETE any repo
create policy "Authenticated users can delete repos"
  on repos for delete
  using ( auth.role() = 'authenticated' );


-- ───────────────────────────────────────────────────────────────
-- 2. INVENTORY TABLE — same pattern
-- ───────────────────────────────────────────────────────────────
alter table inventory enable row level security;

drop policy if exists "Users can view own inventory"   on inventory;
drop policy if exists "Users can insert own inventory" on inventory;
drop policy if exists "Users can update own inventory" on inventory;
drop policy if exists "Users can delete own inventory" on inventory;

create policy "Authenticated users can view all inventory"
  on inventory for select
  using ( auth.role() = 'authenticated' );

create policy "Authenticated users can insert inventory"
  on inventory for insert
  with check ( auth.role() = 'authenticated' );

create policy "Authenticated users can update inventory"
  on inventory for update
  using ( auth.role() = 'authenticated' );

create policy "Authenticated users can delete inventory"
  on inventory for delete
  using ( auth.role() = 'authenticated' );


-- ───────────────────────────────────────────────────────────────
-- 3. (OPTIONAL) AUDIT COLUMNS
--    If your tables don't yet have user_id / created_at:
-- ───────────────────────────────────────────────────────────────
-- alter table repos     add column if not exists user_id    uuid references auth.users(id);
-- alter table repos     add column if not exists created_at timestamptz default now();
-- alter table inventory add column if not exists user_id    uuid references auth.users(id);
-- alter table inventory add column if not exists created_at timestamptz default now();


-- ───────────────────────────────────────────────────────────────
-- 4. VERIFY — run these to confirm everything is active
-- ───────────────────────────────────────────────────────────────
-- select schemaname, tablename, rowsecurity
--   from pg_tables
--  where tablename in ('repos', 'inventory');
--
-- select * from pg_publication_tables
--  where pubname = 'supabase_realtime';

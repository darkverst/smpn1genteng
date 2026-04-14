-- =============================================================
-- SMPN1 GENTENG - MINIMAL SCHEMA UNTUK PROJECT SAAT INI
-- Fokus: tabel `settings` yang dipakai src/services/settingsRepository.ts
-- Jalankan di: Supabase Dashboard -> SQL Editor -> New Query -> Run
-- =============================================================

create extension if not exists pgcrypto;

create table if not exists public.settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists tr_settings_updated_at on public.settings;
create trigger tr_settings_updated_at
before update on public.settings
for each row
execute function public.set_updated_at();

-- Fungsi untuk membaca ukuran database dari frontend dashboard.
create or replace function public.get_database_storage_stats()
returns table (
  database_bytes bigint,
  database_size text,
  settings_bytes bigint,
  settings_size text,
  settings_rows bigint
)
language sql
security definer
set search_path = public
as $$
  select
    pg_database_size(current_database())::bigint as database_bytes,
    pg_size_pretty(pg_database_size(current_database()))::text as database_size,
    pg_total_relation_size('public.settings')::bigint as settings_bytes,
    pg_size_pretty(pg_total_relation_size('public.settings'))::text as settings_size,
    (select count(*) from public.settings)::bigint as settings_rows;
$$;

revoke all on function public.get_database_storage_stats() from public;
grant execute on function public.get_database_storage_stats() to anon, authenticated;

-- Seed key awal agar semua modul langsung jalan saat pertama deploy
insert into public.settings (key, value)
values
  ('news_items', '[]'::jsonb),
  ('agenda_items', '[]'::jsonb),
  ('gallery_items', '[]'::jsonb),
  ('contact_info', '{}'::jsonb),
  ('slider_items', '[]'::jsonb),
  ('profile_data', '{}'::jsonb),
  ('stats_data', '{}'::jsonb),
  ('footer_credit', '{}'::jsonb),
  ('seo_data', '{}'::jsonb),
  ('analytics_data', '{}'::jsonb),
  ('instagram_settings', '{}'::jsonb),
  ('sponsors_data', '{}'::jsonb),
  ('smpb_button', '{}'::jsonb),
  ('auth_settings', '{"username":"admin","password":"admin123","showDemoCredentials":true}'::jsonb)
on conflict (key) do nothing;

alter table public.settings enable row level security;

-- Arsitektur project saat ini belum memakai Supabase Auth session,
-- jadi kebijakan dibuka untuk anon agar dashboard tetap bisa CRUD settings.
drop policy if exists "settings public read" on public.settings;
create policy "settings public read"
on public.settings
for select
to anon, authenticated
using (true);

drop policy if exists "settings public write" on public.settings;
create policy "settings public write"
on public.settings
for insert
to anon, authenticated
with check (true);

drop policy if exists "settings public update" on public.settings;
create policy "settings public update"
on public.settings
for update
to anon, authenticated
using (true)
with check (true);

drop policy if exists "settings public delete" on public.settings;
create policy "settings public delete"
on public.settings
for delete
to anon, authenticated
using (true);

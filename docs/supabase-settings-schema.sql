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
  ('contact_info', '{
    "address": "Jl. Raya Genteng No. 01, Genteng, Kabupaten Banyuwangi, Jawa Timur 68465",
    "phone": "(0333) 845123",
    "email": "info@smpn1genteng.sch.id",
    "hours": "Senin - Sabtu: 07:00 - 14:00 WIB",
    "mapQuery": "SMP+Negeri+1+Genteng+Banyuwangi",
    "mapEmbedUrl": "",
    "mapDirectionsUrl": "",
    "facebook": "https://facebook.com",
    "instagram": "https://instagram.com",
    "youtube": "https://youtube.com"
  }'::jsonb),
  ('slider_items', '[]'::jsonb),
  ('profile_data', '{}'::jsonb),
  ('stats_data', '{
    "siswaAktif": "720+",
    "tenagaPendidik": "48",
    "prestasi": "150+",
    "akreditasi": "A"
  }'::jsonb),
  ('footer_credit', '{
    "copyrightText": "",
    "rightText": "Dibuat dengan ❤️ untuk pendidikan Indonesia",
    "showYear": true,
    "schoolName": "SMP Negeri 1 Genteng",
    "developerName": "",
    "developerUrl": ""
  }'::jsonb),
  ('seo_data', '{
    "metaTitle": "SMP Negeri 1 Genteng - Website Resmi",
    "metaDescription": "Website resmi SMP Negeri 1 Genteng, Kabupaten Banyuwangi, Jawa Timur. Unggul dalam Prestasi, Santun dalam Budi Pekerti. Informasi pendaftaran, berita kegiatan, agenda sekolah, dan galeri.",
    "metaKeywords": "SMPN 1 Genteng, SMP Negeri 1 Genteng, sekolah Banyuwangi, pendidikan Genteng, sekolah menengah pertama, PPDB Banyuwangi",
    "ogImage": "",
    "ogType": "website",
    "robots": "index, follow",
    "canonicalUrl": "",
    "googleVerification": "",
    "bingVerification": "",
    "googleAnalyticsId": ""
  }'::jsonb),
  ('analytics_data', '{
    "totalPageViews": 0,
    "totalSessions": 0,
    "dailyViews": [],
    "pageViews": {},
    "referrers": {},
    "lastUpdated": "2026-01-01T00:00:00.000Z"
  }'::jsonb),
  ('instagram_settings', '{
    "username": "@smpn1genteng",
    "profileUrl": "https://www.instagram.com/smpn1genteng",
    "showSection": true,
    "sectionTitle": "Instagram Sekolah",
    "embedType": "widget",
    "widgetCode": "<div class=\"elfsight-app-xxxxxx-xxxx-xxxx-xxxx-xxxxxxx\"></div>\n<!-- Dapatkan kode ini gratis di elfsight.com atau curator.io -->",
    "posts": []
  }'::jsonb),
  ('sponsors_data', '{
    "showSection": true,
    "title": "Didukung Oleh",
    "sponsors": []
  }'::jsonb),
  ('smpb_button', '{
    "isActive": false,
    "year": "2026",
    "link": "",
    "openInNewTab": true
  }'::jsonb),
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

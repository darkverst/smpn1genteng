-- =============================================================
-- WEB SEKOLAH WHITE-LABEL - SCHEMA DATABASE & TABEL SETTINGS
-- Fokus: tabel `settings` yang dipakai src/services/settingsRepository.ts
-- Jalankan di: Neon / Supabase Dashboard → SQL Editor → New Query → Run
-- =============================================================

create table if not exists public.settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Trigger untuk memperbarui kolom updated_at otomatis saat data diubah
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

-- Fungsi untuk membaca ukuran database dari frontend dashboard CMS
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

-- =============================================================
-- SEED DATA AWAL: EKSTRAKURIKULER (ESKUL)
-- Disimpan pada key 'extracurricular_items' di tabel public.settings.
-- Semua perubahan CRUD eskul dari dashboard CMS otomatis tersimpan ke key ini.
-- =============================================================

insert into public.settings (key, value, updated_at)
values (
  'extracurricular_items',
  '[
    {
      "id": "eskul-1",
      "name": "Pramuka MA Amanatulloh",
      "category": "Kepemimpinan",
      "description": "Gerakan Pramuka Gugus Depan MA Amanatulloh melatih kedisiplinan, kemandirian, dan kepemimpinan berwawasan kebangsaan.",
      "schedule": "Jumat, 14:00 - 16:30 WIB",
      "location": "Lapangan Utama & Aula Madrasah",
      "coach": "Kak Ahmad Muzakki, S.Pd",
      "image": "",
      "achievements": ["Juara 1 Lomba Pionering 2024", "Juara Umum Perkemahan Songsong Ramadhan 2023"],
      "isActive": true,
      "order": 1
    },
    {
      "id": "eskul-2",
      "name": "Hadrah & Shalawat Al-Banjari",
      "category": "Keagamaan",
      "description": "Seni musik Islam rebana/hadrah khas Al-Banjari untuk melestarikan tradisi shalawat dan mengisi acara madrasah.",
      "schedule": "Rabu, 15:00 - 17:00 WIB",
      "location": "Musholla / Ruang Seni",
      "coach": "Ust. M. Ridwan",
      "image": "",
      "achievements": ["Juara 2 Festival Banjari Santri Jawa Timur 2023"],
      "isActive": true,
      "order": 2
    },
    {
      "id": "eskul-3",
      "name": "Futsal Club",
      "category": "Olahraga",
      "description": "Pembinaan bakat siswa dalam olahraga futsal, taktik bermain, fisik prima, dan sportivitas tim.",
      "schedule": "Sabtu, 07:30 - 10:00 WIB",
      "location": "Lapangan Futsal Fajar",
      "coach": "Coach Dimas Prasetyo",
      "image": "",
      "achievements": ["Juara 2 Turnamen Futsal Antar MA se-Banyuwangi 2025"],
      "isActive": true,
      "order": 3
    },
    {
      "id": "eskul-4",
      "name": "Tahfidz & Tilawah Al-Qur''an",
      "category": "Keagamaan",
      "description": "Program intensif bimbingan hafalan Al-Qur''an juz 30 dan juz pilihan serta seni baca tilawah.",
      "schedule": "Senin & Kamis, 06:15 - 07:00 WIB",
      "location": "Masjid Pondok Pesantren",
      "coach": "Ustadzah Nurul Hidayah, Al-Hafidzah",
      "image": "",
      "achievements": ["Juara 1 MTQ Pelajar Tingkat Kecamatan Gambiran"],
      "isActive": true,
      "order": 4
    },
    {
      "id": "eskul-5",
      "name": "Palang Merah Remaja (PMR Wira)",
      "category": "Kepemimpinan",
      "description": "Pelatihan pertolongan pertama pada kecelakaan (PPPK), donor darah, dan aksi tanggap darurat.",
      "schedule": "Selasa, 14:30 - 16:30 WIB",
      "location": "Ruang UKS Madrasah",
      "coach": "Ibu Siti Khodijah, S.Kep",
      "image": "",
      "achievements": ["Juara Harapan 1 Lomba Pertolongan Pertama PMI 2024"],
      "isActive": true,
      "order": 5
    },
    {
      "id": "eskul-6",
      "name": "Seni Kaligrafi Islam (Khat)",
      "category": "Seni & Budaya",
      "description": "Belajar kaidah berbagai jenis khat Arab (Naskhi, Tsuluts, Diwani, Riq''ah) dan lukisan kanvas kaligrafi.",
      "schedule": "Kamis, 14:30 - 16:30 WIB",
      "location": "Laboratorium Kesenian",
      "coach": "Ust. Fahrur Rozi",
      "image": "",
      "achievements": ["Juara 2 Lomba Kaligrafi Kontemporer PORSENI MA 2023"],
      "isActive": true,
      "order": 6
    }
  ]'::jsonb,
  now()
)
on conflict (key) do update 
set value = excluded.value, updated_at = excluded.updated_at;

-- =============================================================
-- PENYESUAIAN & MIGRASI DATA (MIGRATION PATCH)
-- Query berikut aman dijalankan berulang kali (idempoten).
-- Digunakan untuk memastikan konfigurasi terbaru (bottomNavStyle
-- dan opsi slider showText/overlayOpacity) diterapkan ke data lama
-- tanpa menghapus atau menimpa data yang telah ada di database.
-- =============================================================

-- 1. Penyesuaian 'school_identity' agar memiliki field 'bottomNavStyle' (default: 'floating')
update public.settings
set value = value || '{"bottomNavStyle": "floating"}'::jsonb,
    updated_at = now()
where key = 'school_identity'
  and (value->>'bottomNavStyle' is null or value->>'bottomNavStyle' = '');

-- 2. Penyesuaian 'slider_items' agar setiap item memiliki default showText = true dan overlayOpacity = 70 jika belum ada
update public.settings
set value = (
  select jsonb_agg(
    case 
      when jsonb_typeof(item) = 'object' then
        item 
        || jsonb_build_object('showText', coalesce((item->>'showText')::boolean, true))
        || jsonb_build_object('overlayOpacity', coalesce((item->>'overlayOpacity')::int, 70))
      else item
    end
  )
  from jsonb_array_elements(value) as item
),
updated_at = now()
where key = 'slider_items'
  and jsonb_typeof(value) = 'array';

-- 3. Penyesuaian kategori galeri dan kategori eskul dinamis
insert into public.settings (key, value, updated_at)
values 
  ('gallery_categories', '["Akademik", "Event", "Wisata", "Seni", "Olahraga", "Video", "Otomotif"]'::jsonb, now()),
  ('eskul_categories', '["Keagamaan", "Olahraga", "Seni & Budaya", "Kepemimpinan", "Akademik", "Otomotif"]'::jsonb, now())
on conflict (key) do update
set value = case 
  when jsonb_typeof(public.settings.value) = 'array' and not (public.settings.value ? 'Otomotif') 
  then public.settings.value || '["Otomotif"]'::jsonb 
  else public.settings.value 
end,
updated_at = now();

-- 4. Penyesuaian 'gallery_items' agar setiap item memiliki array 'images' dan field 'description'
update public.settings
set value = (
  select jsonb_agg(
    case 
      when jsonb_typeof(item) = 'object' then
        item 
        || jsonb_build_object(
          'images', 
          case 
            when item->'images' is not null and jsonb_typeof(item->'images') = 'array' then item->'images'
            when coalesce(item->>'image', '') <> '' then jsonb_build_array(item->>'image')
            else '[]'::jsonb
          end
        )
        || jsonb_build_object('description', coalesce(item->>'description', ''))
      else item
    end
  )
  from jsonb_array_elements(value) as item
),
updated_at = now()
where key = 'gallery_items'
  and jsonb_typeof(value) = 'array';

-- 5. Penyesuaian 'extracurricular_items' agar menautkan eskul otomotif ke galeri otomotif jika tersedia
update public.settings
set value = (
  with gal as (
    select item->>'id' as gal_id, item->>'image' as gal_img
    from settings, jsonb_array_elements(value) as item
    where key = 'gallery_items' and (item->>'title' ilike '%otomotif%' or item->>'category' ilike '%otomotif%')
    limit 1
  )
  select jsonb_agg(
    case
      when jsonb_typeof(item) = 'object' and (item->>'name' ilike '%otomotif%' or item->>'name' ilike '%yamamoto%') then
        item
        || jsonb_build_object('galleryId', coalesce(item->>'galleryId', (select gal_id from gal)))
        || jsonb_build_object('category', 'Otomotif')
        || case 
             when (item->>'image' is null or item->>'image' = '') and (select gal_img from gal) is not null 
             then jsonb_build_object('image', (select gal_img from gal))
             else '{}'::jsonb
           end
      else item
    end
  )
  from jsonb_array_elements(value) as item
),
updated_at = now()
where key = 'extracurricular_items'
  and jsonb_typeof(value) = 'array';

-- =============================================================
-- DAFTAR SELURUH KEY PENGATURAN YANG DIDUKUNG (21 KEYS)
-- =============================================================
-- 1.  'school_identity'      -> Identitas terpusat (nama, logo, warna tema, model bottom nav, kontak, dsb)
-- 2.  'extracurricular_items'-> Daftar kegiatan ekstrakurikuler madrasah (CRUD dari Dashboard & tautan ke galleryId)
-- 3.  'slider_items'         -> Slide banner hero di halaman utama (opsi hanya gambar/teks & opasitas overlay)
-- 4.  'gallery_items'        -> Album galeri foto (cover + multiple images + deskripsi) & video YouTube
-- 5.  'gallery_categories'   -> Daftar kategori galeri dinamis (CRUD dari Dashboard)
-- 6.  'eskul_categories'     -> Daftar kategori ekstrakurikuler dinamis (CRUD dari Dashboard)
-- 7.  'news_items'           -> Berita madrasah
-- 8.  'agenda_items'         -> Agenda kegiatan
-- 9.  'teachers_data'        -> Data guru & tenaga kependidikan
-- 10. 'profile_data'         -> Profil visi misi & sambutan kepala madrasah
-- 11. 'stats_data'           -> Angka statistik madrasah
-- 12. 'download_documents'   -> Dokumen unduhan publik
-- 13. 'instagram_settings'   -> Feed & widget Instagram
-- 14. 'sponsors_data'        -> Mitra / sponsor madrasah
-- 15. 'smpb_button'          -> Tombol PPDB / SPMB
-- 16. 'auth_settings'        -> Akun login admin
-- 17. 'seo_data'             -> Pengaturan meta tag SEO
-- 18. 'analytics_data'       -> Pelacak kunjungan website
-- 19. 'brand_settings'       -> Logo & branding legacy
-- 20. 'contact_info'         -> Kontak legacy
-- 21. 'footer_credit'        -> Footer credit legacy


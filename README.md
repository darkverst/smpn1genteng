# Website Sekolah SMPN 1 Genteng

Website profil sekolah berbasis `React + Vite + Tailwind CSS + Supabase`.
Project ini dirancang untuk kebutuhan website sekolah yang bisa dikelola dari dashboard admin, dengan penyimpanan data utama di tabel `settings` pada Supabase.

## Fitur Utama

- Halaman publik: `Home`, `Profil`, `Berita`, `Agenda`, `Galeri`, `Download`, `Kontak`
- Dashboard admin untuk mengelola:
  - berita
  - agenda
  - galeri
  - slider hero
  - profil sekolah
  - statistik sekolah
  - logo sekolah
  - dokumen download Google Drive
  - SEO dan analytics dasar
  - Instagram
  - sponsor / mitra
  - tombol SMPB
  - backup / restore / setup awal website
- Integrasi Supabase untuk penyimpanan data `settings`
- Siap deploy ke Vercel dari repository GitHub

## Stack Teknologi

- `React 19`
- `Vite`
- `TypeScript`
- `Tailwind CSS`
- `React Router`
- `Supabase JS`
- `Vercel`

## Struktur Penting Project

```text
.
|-- docs/
|   |-- supabase-settings-schema.sql
|   |-- supabase-schema.sql
|   |-- school-identity-management.md
|   |-- school-identity.example.json
|   |-- sponsor-mitra-bug-analysis.md
|-- src/
|   |-- components/
|   |-- constants/
|   |-- context/
|   |-- pages/
|   |-- services/
|   |-- types.ts
|-- .env.example
|-- .env.vercel.example
|-- package.json
|-- vercel.json
```

## Cara Clone Dari GitHub

### 1. Clone repository

```bash
git clone https://github.com/darkverst/smpn1genteng.git
cd smpn1genteng
```

### 2. Install dependency

```bash
npm install
```

### 3. Copy file environment

```bash
cp .env.example .env
```

Jika memakai Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

### 4. Isi environment variable

Isi file `.env` dengan kredensial Supabase milik Anda:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

## Setup Supabase Dari Nol

Project ini menggunakan pendekatan `settings table`, bukan tabel terpisah untuk setiap modul konten.
Semua data utama website disimpan dalam tabel `public.settings`.

### 1. Buat project Supabase

- Buka [https://supabase.com](https://supabase.com)
- Buat project baru
- Tunggu sampai database aktif

### 2. Ambil URL dan ANON KEY

Di Supabase Dashboard:

- buka `Settings`
- pilih `API`
- salin:
  - `Project URL`
  - `anon public key`

Masukkan ke `.env` lokal dan ke environment Vercel saat deploy.

### 3. Jalankan schema yang benar

Gunakan file berikut:

- `docs/supabase-settings-schema.sql`

Langkahnya:

1. Buka Supabase Dashboard
2. Masuk ke `SQL Editor`
3. Klik `New Query`
4. Copy seluruh isi file `docs/supabase-settings-schema.sql`
5. Klik `Run`

File ini akan membuat:

- tabel `public.settings`
- trigger `updated_at`
- function `get_database_storage_stats()`
- seed awal untuk seluruh key settings utama
- policy read/write yang dibutuhkan aplikasi

### 4. Verifikasi key settings

Setelah SQL dijalankan, tabel `public.settings` minimal akan berisi key seperti:

- `news_items`
- `agenda_items`
- `gallery_items`
- `contact_info`
- `slider_items`
- `profile_data`
- `stats_data`
- `school_identity`
- `brand_settings`
- `download_documents`
- `footer_credit`
- `seo_data`
- `analytics_data`
- `instagram_settings`
- `sponsors_data`
- `smpb_button`
- `auth_settings`

## Menjalankan Project Secara Lokal

### Development mode

```bash
npm run dev
```

Biasanya Vite akan berjalan di:

- `http://localhost:5173`

### Build production lokal

```bash
npm run build
```

### Preview hasil build

```bash
npm run preview
```

## Login Dashboard

Secara default, data awal auth adalah:

- username: `admin`
- password: `admin123`

Segera ubah dari dashboard setelah website aktif di production.

## Cara Kerja Data Website

Semua modul website dibaca dari Supabase melalui service:

- `src/services/settingsRepository.ts`

State global aplikasi dikelola di:

- `src/context/AppContext.tsx`

Konsep pentingnya:

- setiap bagian website disimpan berdasarkan `key`
- frontend memuat data dari `public.settings`
- jika key belum ada, aplikasi dapat membuat key default yang aman
- perubahan dari dashboard akan melakukan `upsert` kembali ke Supabase
- identitas sekolah modern dipusatkan di key `school_identity`

## Manajemen Identitas Sekolah

Website ini memakai konfigurasi identitas sekolah terpusat melalui key:

- `school_identity`

Konfigurasi ini mengendalikan:

- nama sekolah untuk header dan footer
- logo sekolah
- alamat, telepon, email, dan jam operasional
- media sosial
- warna tema dasar global
- informasi legal footer

Dokumen pendukung:

- `docs/school-identity-management.md`
- `docs/school-identity.example.json`

### Cara Mengubah Identitas Tanpa Edit Kode

1. Login ke dashboard admin.
2. Buka menu `Identitas Sekolah`.
3. Ubah data identitas sesuai kebutuhan.
4. Klik `Simpan Identitas Sekolah`.
5. Cek hasilnya di header, footer, dan halaman publik.

### Versioning Konfigurasi

Setiap konfigurasi identitas membawa metadata:

- `schemaVersion`
- `revision`
- `updatedAt`

## Fitur Database Di Dashboard

Pada tab `Database` di dashboard ada beberapa fitur penting:

- `Setup Awal Website`
- `Sinkronisasi Key Database`
- `Isi Data Dummy`
- `Backup`
- `Restore`
- `Reset Semua Data`

### Peringatan Penting

Beberapa tombol bersifat sensitif:

- `Reset Semua Data` akan mengembalikan data ke state default
- `Restore` akan menimpa data aktif dengan isi file backup
- `Setup Awal Website` aman dipakai untuk key yang hilang dan section kosong, tetapi tetap sebaiknya dilakukan oleh admin utama

Untuk production, pastikan hanya admin yang memahami fungsi ini yang mengakses menu tersebut.

## Tutorial Push Ke GitHub

Jika Anda ingin membuat salinan project ini ke repository GitHub sendiri:

### 1. Inisialisasi repository baru

```bash
git init
git add .
git commit -m "Initial commit website sekolah"
```

### 2. Hubungkan ke repository GitHub

```bash
git remote add origin https://github.com/USERNAME/NAMA-REPO.git
git branch -M main
git push -u origin main
```

### 3. Update perubahan berikutnya

```bash
git add .
git commit -m "Update website sekolah"
git push origin main
```

## Tutorial Deploy Dari GitHub Ke Vercel

Rekomendasi deploy untuk project ini adalah `Vercel` karena project sudah disiapkan untuk frontend SPA dan punya file `vercel.json`.

### A. Push project ke GitHub terlebih dahulu

Pastikan code sudah ada di GitHub dan branch utama misalnya `main`.

### B. Import project ke Vercel

1. Login ke [https://vercel.com](https://vercel.com)
2. Klik `Add New Project`
3. Pilih repository GitHub yang ingin dideploy
4. Klik `Import`

### C. Pastikan pengaturan build benar

Biasanya Vercel akan mendeteksi `Vite` otomatis.

Gunakan konfigurasi berikut bila perlu:

- Framework Preset: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

### D. Isi Environment Variables di Vercel

Masuk ke:

- `Project Settings`
- `Environment Variables`

Isi minimal:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

Set environment ini minimal untuk:

- `Production`
- `Preview`

Jika salah satu environment tidak diisi, website preview dapat tampil dengan data kosong atau default.

### E. Deploy

- Klik `Deploy`
- Tunggu build selesai
- Setelah berhasil, buka domain Vercel yang diberikan

## Alur Deploy Update Dari GitHub

Setelah project terhubung ke Vercel:

1. edit code di lokal
2. commit perubahan
3. push ke branch `main`
4. Vercel akan auto deploy ulang

Contoh:

```bash
git add .
git commit -m "Perbarui konten dan fitur website"
git push origin main
```

## Checklist Deploy Production

Sebelum go live, pastikan:

- SQL `docs/supabase-settings-schema.sql` sudah dijalankan
- environment Vercel sudah terisi benar
- login admin default sudah diganti
- backup data sudah pernah diuji
- fitur `Download Dokumen`, `Sponsor`, `Instagram`, dan `Logo Sekolah` sudah dicek
- build lokal berhasil dengan `npm run build`

## Troubleshooting

### 1. Website tampil tetapi data kembali default / kosong

Cek hal berikut:

- `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY` di Vercel
- SQL schema Supabase sudah dijalankan atau belum
- policy `public.settings` aktif atau belum
- apakah pernah menjalankan `Reset Semua Data` atau `Restore` dari dashboard

### 2. Storage Supabase masih besar setelah reset database

Reset tabel `settings` tidak otomatis menghapus file di `Supabase Storage`.

Gunakan script:

```bash
npm run storage:clear -- --bucket website-assets
```

Atau cek semua bucket:

```bash
npm run storage:clear -- --all-buckets
```

Default script berjalan dalam mode `dry-run`, jadi hanya menampilkan daftar file dan total ukuran.

Untuk benar-benar menghapus file:

```bash
npm run storage:clear -- --bucket website-assets --confirm
```

Atau semua bucket:

```bash
npm run storage:clear -- --all-buckets --confirm
```

Environment yang dibutuhkan:

- `SUPABASE_URL` atau `VITE_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Contoh PowerShell:

```powershell
$env:SUPABASE_URL="https://YOUR_PROJECT_ID.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY="YOUR_SERVICE_ROLE_KEY"
```

Peringatan:

- penghapusan storage bersifat permanen
- jangan commit `SUPABASE_SERVICE_ROLE_KEY`
- jangan jalankan `--confirm` tanpa backup jika file masih dipakai

### 3. Sponsor / mitra tidak tampil mulus

Versi terbaru sudah memakai:

- grid statis untuk sponsor sedikit
- marquee loop ganda untuk sponsor banyak

Jika masih aneh, cek:

- logo sponsor terlalu besar / rasio tidak proporsional
- data sponsor kosong atau URL / logo tidak valid

### 4. Deploy Vercel gagal

Periksa:

- `npm install` berhasil
- `npm run build` lolos di lokal
- environment variables sudah diisi
- branch GitHub yang dipakai benar

### 5. Route halaman tidak terbuka saat refresh

Project ini sudah memakai `HashRouter` dan `vercel.json`, jadi seharusnya aman untuk SPA.
Jika tetap bermasalah, lakukan redeploy dan pastikan file `vercel.json` ikut ter-push.

## File Referensi Penting

- `README.md`
- `docs/supabase-settings-schema.sql`
- `src/services/settingsRepository.ts`
- `src/context/AppContext.tsx`

## Catatan

- File `docs/supabase-schema.sql` adalah referensi schema yang lebih besar dan bukan jalur runtime utama project saat ini.
- Untuk implementasi production saat ini, fokus utama ada pada `docs/supabase-settings-schema.sql`.

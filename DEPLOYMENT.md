# 🚀 Panduan Deployment: SMP Negeri 1 Genteng

## Website ke Vercel + Supabase (Database)

---

## 📋 Daftar Isi

1. [Arsitektur Sistem](#1-arsitektur-sistem)
2. [Persiapan Awal](#2-persiapan-awal)
3. [Setup Supabase (Database)](#3-setup-supabase-database)
4. [Setup Vercel (Hosting)](#4-setup-vercel-hosting)
5. [Integrasi Supabase ke React](#5-integrasi-supabase-ke-react)
6. [Migrasi dari localStorage ke Database](#6-migrasi-dari-localstorage-ke-database)
7. [Upload Gambar ke Supabase Storage](#7-upload-gambar-ke-supabase-storage)
8. [Custom Domain](#8-custom-domain)
9. [Keamanan](#9-keamanan)
10. [Maintenance & Backup](#10-maintenance--backup)

---

## 1. Arsitektur Sistem

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│                  │     │                  │     │                  │
│   Browser/HP     │────▶│   Vercel CDN     │────▶│    Supabase      │
│   (Pengunjung)   │     │   (Frontend)     │     │   (Database +    │
│                  │     │   React App      │     │    Storage +     │
│                  │◀────│   Static Files   │◀────│    Auth)         │
│                  │     │                  │     │                  │
└──────────────────┘     └──────────────────┘     └──────────────────┘
```

### Kenapa Vercel + Supabase?

| Fitur | Vercel (Hosting) | Supabase (Backend) |
|-------|------------------|--------------------|
| Harga | ✅ **Gratis** (hobby) | ✅ **Gratis** (500MB DB, 1GB storage) |
| Database | ❌ | ✅ PostgreSQL |
| Upload File | ❌ | ✅ Storage (1GB gratis) |
| Autentikasi | ❌ | ✅ Built-in Auth |
| CDN Global | ✅ | ✅ |
| SSL/HTTPS | ✅ Otomatis | ✅ Otomatis |
| Custom Domain | ✅ | ✅ |

**Biaya: Rp 0 untuk sekolah (free tier cukup)**

---

## 2. Persiapan Awal

### Yang Anda Butuhkan:
- ✅ Akun [GitHub](https://github.com) (gratis)
- ✅ Akun [Vercel](https://vercel.com) (gratis, login pakai GitHub)
- ✅ Akun [Supabase](https://supabase.com) (gratis, login pakai GitHub)
- ✅ Code editor: [VS Code](https://code.visualstudio.com) (gratis)
- ✅ [Node.js](https://nodejs.org) v18+ terinstall di komputer
- ✅ [Git](https://git-scm.com) terinstall di komputer

### Langkah 1: Upload Source Code ke GitHub

```bash
# Di terminal / command prompt, masuk ke folder project
cd smpn1-genteng-website

# Inisialisasi Git
git init

# Buat file .gitignore
echo "node_modules/
dist/
.env
.env.local
.env.production
" > .gitignore

# Commit semua file
git add .
git commit -m "Initial commit - Website SMPN 1 Genteng"

# Buat repository di GitHub, lalu:
git remote add origin https://github.com/USERNAME/smpn1-genteng.git
git branch -M main
git push -u origin main
```

---

## 3. Setup Supabase (Database)

### Langkah 1: Buat Project Supabase

1. Buka [supabase.com](https://supabase.com) → Sign Up (pakai GitHub)
2. Klik **"New Project"**
3. Isi:
   - **Name**: `smpn1-genteng`
   - **Database Password**: (buat password kuat, SIMPAN!)
   - **Region**: `Southeast Asia (Singapore)` ← paling dekat ke Indonesia
4. Klik **"Create new project"** → Tunggu 2-3 menit

### Langkah 2: Setup Database Schema

1. Di dashboard Supabase, klik **"SQL Editor"** (icon di sidebar kiri)
2. Klik **"New Query"**
3. Copy-paste isi file `docs/supabase-settings-schema.sql`
4. Klik **"Run"** (tombol hijau)
5. Pastikan tidak ada error (hijau semua ✅)

### Langkah 3: Setup Authentication

1. Di sidebar, klik **"Authentication"**
2. Klik **"Users"** → **"Add user"** → **"Create new user"**
   - Email: `admin@smpn1genteng.sch.id`
   - Password: `passwordKuatAnda123!`
   - ✅ Auto Confirm User
3. Klik **"Create user"**

### Langkah 4: Catat API Keys

1. Di sidebar, klik **"Settings"** → **"API"**
2. Catat 2 informasi penting:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: `eyJhbGciOi...` (key yang panjang)
3. **⚠️ JANGAN share `service_role key`** — itu akses penuh ke database!

### Langkah 5: Setup Storage (Upload Gambar)

1. Di sidebar, klik **"Storage"**
2. Jika bucket `images` belum ada, klik **"New Bucket"**
   - Name: `images`
   - ✅ Public bucket
3. Klik **"Create bucket"**

---

## 4. Setup Vercel (Hosting)

### Langkah 1: Deploy ke Vercel

1. Buka [vercel.com](https://vercel.com) → Sign Up (pakai GitHub)
2. Klik **"Add New"** → **"Project"**
3. Import repository `smpn1-genteng` dari GitHub
4. Di bagian **"Configure Project"**:
   - Framework Preset: `Vite`
   - Build Command: `npm run build` (otomatis)
   - Output Directory: `dist` (otomatis)
5. Di bagian **"Environment Variables"**, tambahkan:

   | Key | Value |
   |-----|-------|
   | `VITE_SUPABASE_URL` | `https://tjlzekjwrhuwftcayjxt.supabase.co` |
   | `VITE_SUPABASE_ANON_KEY` | gunakan nilai dari `.env.vercel.example` |

6. Klik **"Deploy"** → Tunggu 1-2 menit
7. ✅ Website live di `https://smpn1-genteng.vercel.app`

### Langkah 2: Setup Routing (SPA)

Buat file `vercel.json` di root project:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" }
      ]
    }
  ]
}
```

Commit dan push:
```bash
git add vercel.json
git commit -m "Add Vercel routing config"
git push
```

Vercel akan auto-deploy.

---

## 5. Integrasi Supabase ke React

### Langkah 1: Install Supabase Client

```bash
npm install @supabase/supabase-js
```

### Langkah 2: Buat Supabase Client

Buat file `src/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);
```

### Langkah 3: Buat file `.env` di root project

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Langkah 4: Buat Service Files

Lihat contoh lengkap di `docs/supabase-client-example.ts`

Buat file-file berikut:
- `src/services/newsService.ts` — CRUD berita
- `src/services/agendaService.ts` — CRUD agenda
- `src/services/galleryService.ts` — CRUD galeri
- `src/services/settingsService.ts` — Pengaturan (kontak, profil, SEO)
- `src/services/storageService.ts` — Upload gambar
- `src/services/analyticsService.ts` — Tracking pengunjung
- `src/services/authService.ts` — Login/logout

---

## 6. Migrasi dari localStorage ke Database

### Ubah AppContext.tsx secara bertahap:

**SEBELUM (localStorage):**
```typescript
const [news, setNews] = useState<NewsItem[]>(
  () => loadFromStorage('smpn1_news', initialNews)
);

// Save ke localStorage
useEffect(() => {
  localStorage.setItem('smpn1_news', JSON.stringify(news));
}, [news]);
```

**SESUDAH (Supabase):**
```typescript
const [news, setNews] = useState<NewsItem[]>([]);
const [loading, setLoading] = useState(true);

// Load dari Supabase
useEffect(() => {
  async function loadNews() {
    try {
      const { data } = await supabase
        .from('news')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });
      setNews(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }
  loadNews();
}, []);

// Tambah berita → simpan ke Supabase
const addNews = async (item) => {
  const { data } = await supabase
    .from('news')
    .insert(item)
    .select()
    .single();
  setNews(prev => [data, ...prev]);
};
```

### Urutan Migrasi (Satu per Satu):

```
1. ✅ Auth (Login/Logout)    → Supabase Auth
2. ✅ News (Berita)           → Tabel `news`
3. ✅ Agenda                  → Tabel `agenda`
4. ✅ Gallery (Galeri)        → Tabel `gallery`
5. ✅ Slider                  → Tabel `slider`
6. ✅ Settings (Kontak, dll)  → Tabel `settings`
7. ✅ Analytics               → Tabel `analytics_views`
8. ✅ Contact Messages        → Tabel `contact_messages`
9. ✅ Image Upload            → Supabase Storage
```

---

## 7. Upload Gambar ke Supabase Storage

**SEBELUM (base64 di localStorage):**
```typescript
// Gambar disimpan sebagai base64 string → boros memori
const reader = new FileReader();
reader.onload = () => setImage(reader.result as string);
reader.readAsDataURL(file);
```

**SESUDAH (Supabase Storage):**
```typescript
// Gambar di-upload ke cloud → URL publik
async function uploadImage(file: File): Promise<string> {
  const fileName = `news/${Date.now()}-${file.name}`;

  const { error } = await supabase.storage
    .from('images')
    .upload(fileName, file);

  if (error) throw error;

  const { data } = supabase.storage
    .from('images')
    .getPublicUrl(fileName);

  return data.publicUrl;
  // Hasil: https://xxxxx.supabase.co/storage/v1/object/public/images/news/123-foto.jpg
}
```

---

## 8. Custom Domain

### Menghubungkan Domain Sekolah (misal: smpn1genteng.sch.id)

#### Di Vercel:
1. Dashboard Vercel → Project → **Settings** → **Domains**
2. Tambahkan: `www.smpn1genteng.sch.id`
3. Vercel akan memberikan DNS records

#### Di Domain Provider (registrar domain):
Tambahkan DNS records:

| Type | Name | Value |
|------|------|-------|
| A | @ | `76.76.21.21` |
| CNAME | www | `cname.vercel-dns.com` |

Tunggu 1-24 jam untuk propagasi DNS.

#### SSL/HTTPS:
- ✅ Vercel otomatis menyediakan SSL certificate gratis!

---

## 9. Keamanan

### ⚠️ Checklist Keamanan WAJIB:

- [ ] **Ganti password admin default** (`admin123` → password kuat)
- [ ] **Jangan commit file `.env`** (sudah di .gitignore)
- [ ] **Aktifkan RLS** di semua tabel Supabase (sudah di schema SQL)
- [ ] **Jangan expose `service_role` key** di frontend
- [ ] **Gunakan HTTPS** (otomatis di Vercel)
- [ ] **Validasi input** di frontend dan backend

### Row Level Security (RLS):
```sql
-- Pengunjung hanya bisa BACA data publik
CREATE POLICY "Public read" ON news FOR SELECT USING (is_published = TRUE);

-- Hanya admin yang bisa CRUD
CREATE POLICY "Admin write" ON news FOR ALL USING (auth.role() = 'authenticated');
```

### Environment Variables:
```
✅ VITE_SUPABASE_URL        → Aman di frontend (read-only)
✅ VITE_SUPABASE_ANON_KEY   → Aman di frontend (dibatasi RLS)
❌ SUPABASE_SERVICE_ROLE_KEY → JANGAN PERNAH di frontend!
```

---

## 10. Maintenance & Backup

### Backup Database:
1. Supabase Dashboard → **Settings** → **Database**
2. Klik **"Download backup"** (otomatis setiap hari di Pro plan)

### Backup Manual:
```bash
# Export data menggunakan Supabase CLI
npx supabase db dump --db-url "postgresql://..." > backup.sql
```

### Monitoring:
- **Vercel**: Dashboard → Analytics (built-in)
- **Supabase**: Dashboard → Reports → Database & API usage

### Update Website:
```bash
# Edit kode di komputer
# Lalu commit & push ke GitHub
git add .
git commit -m "Update konten terbaru"
git push

# ✅ Vercel otomatis deploy ulang!
```

---

## 📱 Ringkasan Langkah (Quick Start)

```
1. Buat akun GitHub, Vercel, Supabase          [10 menit]
2. Upload kode ke GitHub                        [5 menit]
3. Buat project Supabase + jalankan SQL schema  [10 menit]
4. Setup Auth user di Supabase                  [5 menit]
5. Deploy ke Vercel + isi environment variables [5 menit]
6. Install @supabase/supabase-js               [2 menit]
7. Buat src/lib/supabase.ts                    [5 menit]
8. Migrasi AppContext.tsx (localStorage → DB)   [2-4 jam]
9. Test semua fitur                            [1 jam]
10. Setup custom domain (opsional)             [30 menit]
```

**Total waktu estimasi: 4-6 jam** (untuk developer pemula)

---

## ❓ FAQ

**Q: Apakah benar-benar gratis?**
A: Ya! Vercel free tier (100GB bandwidth/bulan) dan Supabase free tier (500MB database, 1GB storage) lebih dari cukup untuk website sekolah.

**Q: Berapa kapasitas upload foto?**
A: Supabase Storage free tier = 1GB. Jika foto di-compress (maks 500KB/foto), cukup untuk ~2000 foto.

**Q: Apa yang terjadi jika website ramai pengunjung?**
A: Vercel free tier mendukung 100GB bandwidth/bulan = ~100.000 pengunjung/bulan. Lebih dari cukup untuk website sekolah.

**Q: Bagaimana jika free tier tidak cukup?**
A: Upgrade Supabase Pro ($25/bulan) atau Vercel Pro ($20/bulan). Tapi untuk sekolah, free tier biasanya cukup.

**Q: Apakah data aman?**
A: Ya. Supabase menggunakan PostgreSQL + enkripsi + RLS. Data tersimpan di server Singapore (dekat Indonesia).

**Q: Bisa diakses dari HP?**
A: Ya. Website sudah responsive dan bisa diakses dari browser HP manapun.

---

## 📞 Bantuan

- Dokumentasi Vercel: https://vercel.com/docs
- Dokumentasi Supabase: https://supabase.com/docs
- Tutorial Video: Cari "Deploy React to Vercel Supabase" di YouTube

---

*Dokumen ini dibuat untuk membantu pengelola website SMP Negeri 1 Genteng dalam proses deployment.*

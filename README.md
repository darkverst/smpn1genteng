# 🏫 Web Sekolah White-Label

Portal website sekolah siap pakai dengan CMS (Content Management System) terintegrasi. Cocok untuk semua jenjang pendidikan: SD/MI, SMP/MTs, SMA/SMK/MA, dan universitas.

## ✨ Fitur Utama

- **CMS Dashboard** — Kelola seluruh konten website langsung dari dashboard admin
- **Identitas Sekolah Terpusat** — Ubah nama, logo, warna tema, dan seluruh branding dari satu panel
- **Multi-Tema** — Pilihan preset warna (forest, ocean, maroon, sunset, dll)
- **Halaman Lengkap** — Home, Profil, Berita, Agenda, Galeri, Ekstrakurikuler, Download, Kontak
- **Responsive & Mobile-First** — Tampil sempurna di semua perangkat
- **SEO Ready** — Meta tags, Open Graph, dan sitemap otomatis
- **Backup & Restore** — Ekspor/impor seluruh data sebagai JSON
- **Instagram Integration** — Tampilkan feed Instagram sekolah
- **Sponsor/Mitra** — Widget marquee sponsor dan mitra
- **Statistik Pengunjung** — Analytics bawaan sederhana

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Jalankan development server
npm run dev

# Build production
npm run build

# Jalankan test
npm run test:run
```

## ⚙️ Konfigurasi

1. Salin `.env.example` ke `.env`
2. Isi konfigurasi database (Neon/Supabase)
3. Jalankan `npm run dev`
4. Login ke dashboard admin di `/login` (default: admin/admin123)
5. Ubah identitas sekolah, logo, dan warna di tab **Identitas Sekolah**

## 🛠 Tech Stack

- **React 19** + **TypeScript**
- **Vite 7** (bundler)
- **Tailwind CSS 4** (styling)
- **Neon Database** (serverless PostgreSQL)
- **Supabase** (storage media)
- **Vitest** (testing)

## 📁 Struktur Project

```
src/
├── components/     # Komponen UI reusable
├── constants/      # Default settings & keys
├── context/        # AppContext (global state)
├── lib/            # Database clients
├── pages/          # Halaman-halaman utama
├── services/       # Repository & storage layer
├── types.ts        # TypeScript types & initial data
└── utils/          # Helper utilities
```

## 📄 License

Private — untuk penggunaan internal dan deployment klien.

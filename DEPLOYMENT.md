# Panduan Deployment: Web Sekolah White-Label

## Website ke Vercel + Supabase / Neon (Database)

---

## Daftar Isi

1. [Arsitektur Sistem](#1-arsitektur-sistem)
2. [Persiapan Awal](#2-persiapan-awal)
3. [Setup Neon (Database)](#3-setup-neon-database)
4. [Setup Vercel (Hosting)](#4-setup-vercel-hosting)
5. [Custom Domain](#5-custom-domain)
6. [Maintenance & Backup](#6-maintenance--backup)

---

## 1. Arsitektur Sistem

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│                  │     │                  │     │                  │
│   Browser/HP     │────▶│   Vercel CDN     │────▶│   Neon (DB)      │
│   (Pengunjung)   │     │   (Frontend)     │     │   PostgreSQL     │
│                  │     │   React App      │     │   Serverless     │
│                  │◀────│   Static Files   │◀────│   (HTTP API)     │
│                  │     │                  │     │                  │
└──────────────────┘     └──────────────────┘     └──────────────────┘
```

### Kenapa Vercel + Neon?

| Fitur | Vercel (Hosting) | Neon (Database) |
|-------|------------------|-----------------|
| Harga | Gratis (hobby) | Gratis (500MB DB) |
| Database | ❌ | PostgreSQL Serverless |
| CDN Global | ✅ | ✅ |
| SSL/HTTPS | ✅ Otomatis | ✅ Otomatis |
| Custom Domain | ✅ | ❌ |

---

## 2. Persiapan Awal

### Yang Anda Butuhkan:
- ✅ Akun [GitHub](https://github.com) (gratis)
- ✅ Akun [Vercel](https://vercel.com) (gratis, login pakai GitHub)
- ✅ Akun [Neon](https://neon.tech) (gratis, login pakai GitHub)
- ✅ [Node.js](https://nodejs.org) v18+ terinstall di komputer
- ✅ [Git](https://git-scm.com) terinstall di komputer

### Upload Source Code ke GitHub

```bash
cd web-sekolah-whitelabel
git init
git add .
git commit -m "Initial commit - Web Sekolah White-Label"
git remote add origin https://github.com/USERNAME/web-sekolah-whitelabel.git
git branch -M main
git push -u origin main
```

---

## 3. Setup Neon (Database)

### Langkah 1: Buat Project Neon

1. Buka [neon.tech](https://neon.tech) → Sign Up (pakai GitHub)
2. Klik **"New Project"**
3. Isi:
   - **Name**: `web-sekolah`
   - **Region**: `Singapore` (paling dekat ke Indonesia)
4. Klik **"Create Project"** → Tunggu beberapa detik

### Langkah 2: Setup Database Schema

1. Di dashboard Neon, buka **"SQL Editor"**
2. Copy-paste isi file `docs/neon-schema.sql`
3. Klik **"Run"**
4. Pastikan tidak ada error

### Langkah 3: Catat Connection String

1. Di dashboard Neon, klik **"Connection Details"**
2. Copy **connection string** dari tab **"Pooled"**
3. Format: `postgres://user:password@ep-xxxxx.region.aws.neon.tech/neondb?sslmode=require`
4. Simpan untuk langkah deploy

---

## 4. Setup Vercel (Hosting)

### Langkah 1: Deploy ke Vercel

1. Buka [vercel.com](https://vercel.com) → Sign Up (pakai GitHub)
2. Klik **"Add New"** → **"Project"**
3. Import repository dari GitHub
4. Framework Preset: `Vite`
5. Build Command: `npm run build`
6. Output Directory: `dist`
7. Di **"Environment Variables"**, tambahkan:
   - `VITE_DATABASE_URL` = connection string Neon dari langkah 3.3
8. Klik **"Deploy"** → Tunggu 1-2 menit
9. Website live!

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

## 5. Custom Domain

### Menghubungkan Domain Madrasah

#### Di Vercel:
1. Dashboard Vercel → Project → **Settings** → **Domains**
2. Tambahkan domain
3. Vercel akan memberikan DNS records

#### Di Domain Provider:
| Type | Name | Value |
|------|------|-------|
| A | @ | `76.76.21.21` |
| CNAME | www | `cname.vercel-dns.com` |

Tunggu 1-24 jam untuk propagasi DNS.

---

## 6. Maintenance & Backup

### Backup Database:
1. Dashboard project → **Settings** → **Database** tab
2. Klik **"Download Backup (.json)"**

### Update Website:
```bash
git add .
git commit -m "Update konten terbaru"
git push
```

Vercel otomatis deploy ulang.

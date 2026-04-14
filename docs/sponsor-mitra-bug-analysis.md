# Analisis Bug Sponsor/Mitra (Add/Delete)

## Ringkasan Eksekutif
- Gejala utama: proses tambah sponsor gagal dari sisi UI dashboard, dan penghapusan tidak konsisten pada data legacy.
- Root cause utama:
  - Modal form sponsor tidak dirender, sehingga alur `Tambah Sponsor` terhenti sebelum `saveSponsor()` dieksekusi.
  - Data `sponsorsData` dari `localStorage` tidak dinormalisasi/di-migrate; data lama berpotensi tidak sesuai skema (`sponsors` bukan array valid), yang dapat merusak operasi add/delete.
- Dampak:
  - Admin tidak bisa menginput data sponsor baru dari dashboard.
  - Operasi delete berisiko gagal/inkonsisten pada state sponsor yang malformed.

## Scope Audit
- Frontend data-flow: `Dashboard` -> `AppContext` -> persistence.
- Backend/API/database flow:
  - Tidak ada integrasi runtime ke backend/database pada codebase saat ini.
  - Operasi sponsor berjalan in-memory + `localStorage` (`key: smpn1_sponsors`).
- RBAC/permissions:
  - Tidak ada role model granular; akses admin berbasis flag login klien (`smpn1_auth`).
- Error handling/logging:
  - Sebelumnya minim pada jalur sponsor (silent fail untuk validasi/form).

## Hasil Debugging Sistematis

### 1) Frontend -> Backend/Data Layer
- Temuan:
  - Tidak ditemukan request HTTP/Supabase runtime untuk sponsor (`fetch`, `axios`, `supabase`) di folder `src`.
  - Jalur data sponsor sepenuhnya di `AppContext`:
    - `addSponsor`, `updateSponsor`, `deleteSponsor`
    - persist via `localStorage.setItem('smpn1_sponsors', ...)`
- Implikasi:
  - Validasi query `INSERT/DELETE` SQL tidak berlaku pada runtime saat ini.
  - Fokus perbaikan dipindah ke integrity state + UI flow.

### 2) Validasi Query INSERT/DELETE Database
- Status:
  - Tidak ada query database runtime untuk sponsor.
  - Dokumen SQL Supabase tersedia sebagai referensi, tetapi belum diintegrasikan.
- Risiko:
  - Ekspektasi environment production berbasis DB tidak sinkron dengan implementasi aktual.

### 3) Permission & RBAC
- Status saat ini:
  - Akses dashboard dikontrol oleh boolean login frontend (`isLoggedIn`).
  - Tidak ada role (`admin/editor`) enforcement per operasi sponsor.
- Risiko:
  - Authorization level belum memenuhi standar production-grade RBAC.

### 4) Error Handling & Logging
- Sebelum perbaikan:
  - Validasi `saveSponsor()` hanya `if (!name) return;` tanpa feedback.
  - Tidak ada exception logging pada jalur delete sponsor.
- Sesudah perbaikan:
  - Ditambahkan error UI pada modal sponsor.
  - Ditambahkan `try/catch` + `console.error` untuk save/delete sponsor.

## Root Cause Detail
1. **Missing UI Form Rendering**
   - State `showSponsorModal`, `sponsorForm`, `saveSponsor` tersedia tetapi modal sponsor tidak ada dalam JSX.
   - Klik tombol `Tambah Sponsor` hanya mengubah state, tanpa elemen form tampil ke user.
2. **Weak Data Normalization**
   - Loader state dari `localStorage` tidak memvalidasi bentuk data sponsor.
   - Data lama/korup berpotensi membuat operasi add/delete tidak stabil.

## Implementasi Perbaikan
- `src/pages/Dashboard.tsx`
  - Menambahkan modal `Tambah/Edit Sponsor/Mitra` yang lengkap:
    - field nama, URL, upload logo
    - feedback error validasi
    - aksi simpan
  - Menambahkan status sukses penyimpanan sponsor.
  - Menambahkan `try/catch` pada `saveSponsor` dan `confirmDelete`.
  - Menambahkan `aria-label` tombol edit/hapus sponsor untuk aksesibilitas dan testability.
- `src/utils/sponsors.ts`
  - Menambahkan utility:
    - `normalizeSponsorsData`
    - `addSponsorRecord`
    - `updateSponsorRecord`
    - `deleteSponsorRecord`
  - Utility memulihkan data sponsor malformed dari storage.
- `src/context/AppContext.tsx`
  - `loadFromStorage` ditingkatkan dengan mekanisme normalizer.
  - Jalur sponsor dipindah menggunakan utility ter-normalisasi.

## Test Plan & Hasil

### Unit Test
- File: `src/utils/sponsors.test.ts`
- Cakupan:
  - normalisasi data sponsor malformed dari storage
  - alur add lalu delete sponsor pada data normal

### Integration Test
- File: `src/pages/Dashboard.sponsors.integration.test.tsx`
- Skenario:
  - Login admin mock -> masuk dashboard
  - Buka tab sponsor
  - Tambah sponsor baru via modal
  - Verifikasi sponsor muncul di tabel
  - Hapus sponsor via tombol delete + konfirmasi
  - Verifikasi sponsor hilang dari tabel

### Regression Testing
- Build production (`vite build`) dan test suite dijalankan untuk memastikan:
  - fitur sponsor tidak merusak modul lain
  - jalur add/delete sponsor stabil setelah perbaikan

## Rekomendasi Lanjutan (Production Hardening)
- Integrasikan backend persisten (Supabase/API) untuk sponsor agar tidak bergantung `localStorage`.
- Implementasi RBAC nyata (admin/editor) di backend + token/session server-side.
- Tambahkan centralized logging (Sentry/Logtail) untuk error runtime CRUD admin.
- Tambahkan migrasi data otomatis saat boot app untuk seluruh domain data, bukan sponsor saja.

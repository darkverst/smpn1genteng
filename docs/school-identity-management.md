# Panduan Manajemen Identitas Sekolah

Dokumen ini menjelaskan cara mengelola identitas sekolah secara terpusat tanpa mengubah kode aplikasi.

## Tujuan

Sistem `school_identity` dibuat agar proses rebranding, takeover proyek, atau migrasi ke lembaga pendidikan lain dapat dilakukan dari dashboard admin dan database `settings`, bukan dengan edit manual file React.

## Sumber Data Utama

Key utama yang dipakai:

- `school_identity`

Key ini menjadi sumber untuk:

- header website
- footer website
- tema dasar global
- alamat dan kontak sekolah
- informasi legal footer

Key lama seperti `brand_settings`, `contact_info`, dan `footer_credit` tetap dipertahankan untuk kompatibilitas, tetapi nilainya sekarang diturunkan dari `school_identity`.

## Struktur Konfigurasi

Contoh bentuk data tersedia di:

- `docs/school-identity.example.json`

Field penting:

- `schemaVersion`: versi struktur data
- `revision`: nomor revisi konfigurasi
- `updatedAt`: waktu update terakhir
- `themePreset`: preset tema aktif, misalnya `ocean` atau `forest`
- `schoolName`: nama sekolah lengkap
- `schoolShortName`: nama singkat untuk header
- `schoolTagline`: subjudul header
- `legalName`: nama legal untuk footer
- `schoolLogo`: URL / base64 logo
- `showLogo`: status tampil logo
- `footerDescription`: deskripsi sekolah di footer
- `address`, `phone`, `email`, `hours`: data kontak utama
- `mapQuery`, `mapEmbedUrl`, `mapDirectionsUrl`: lokasi sekolah
- `facebook`, `instagram`, `youtube`: media sosial
- `primaryColor`, `secondaryColor`, `accentColor`, `footerBackgroundColor`: tema dasar global
- `legalNotice`, `copyrightText`, `showCurrentYear`: informasi legal
- `developerName`, `developerUrl`: kredit pengembang

## Cara Mengubah Identitas Tanpa Menyentuh Kode

1. Login ke dashboard admin.
2. Buka menu `Identitas Sekolah`.
3. Ubah nama sekolah, logo, kontak, warna tema, dan footer legal.
4. Klik `Simpan Identitas Sekolah`.
5. Cek hasilnya di halaman publik.

Perubahan langsung tersimpan ke Supabase pada key `school_identity`.

## Validasi Data

Sistem otomatis memvalidasi:

- nama sekolah wajib diisi
- nama singkat wajib diisi
- nama legal wajib diisi
- alamat, telepon, email wajib diisi
- email harus valid
- URL sosial, maps, dan developer harus valid
- warna tema harus memakai format hex, misalnya `#0f766e`

## Preset Tema

Admin dapat memilih preset tema siap pakai agar tidak perlu mengatur warna satu per satu.

Contoh preset:

- `Laut`
- `Hutan`
- `Maroon`
- `Midnight`

Saat preset dipilih:

- warna utama website berubah menyeluruh
- turunan `primary` dan `accent` untuk komponen Tailwind ikut diperbarui
- header, footer, tombol, badge, highlight, dan elemen dengan class `primary/accent` ikut menyesuaikan

Jika admin mengubah warna manual setelah memilih preset, sistem akan menandainya sebagai `custom`.

Jika validasi gagal, dashboard akan menampilkan daftar error dan data tidak disimpan.

## Versioning

Versioning dilakukan pada level data:

- `schemaVersion` naik jika struktur konfigurasi berubah
- `revision` naik setiap kali admin menyimpan identitas sekolah
- `updatedAt` dicatat otomatis saat save

Untuk audit manual, developer dapat mengekspor isi `school_identity` dari tabel `settings` sebelum dan sesudah perubahan.

## Caching

Repository settings memakai cache in-memory dengan TTL pendek agar pembacaan berulang dari tabel `settings` tidak selalu memukul jaringan.

Karakteristik cache:

- aktif di layer `settingsRepository`
- otomatis ter-refresh setelah save
- aman untuk alur admin karena save langsung memperbarui cache

## Migrasi Dari Data Lama

Saat aplikasi menemukan `school_identity` belum terisi, sistem akan mencoba membangun data identitas baru dari kombinasi:

- `brand_settings`
- `contact_info`
- `footer_credit`

Ini membuat migrasi ke skema baru tetap kompatibel dengan instalasi lama.

## Takeover Developer Baru

Langkah minimum untuk developer baru:

1. Clone repository.
2. Jalankan SQL `docs/supabase-settings-schema.sql`.
3. Pastikan key `school_identity` ada di tabel `settings`.
4. Baca `README.md`.
5. Baca contoh payload di `docs/school-identity.example.json`.
6. Lakukan perubahan identitas hanya dari dashboard admin, kecuali sedang mengubah schema.

## Kapan Perlu Edit Kode

Edit kode hanya diperlukan jika:

- ingin menambah field identitas baru
- ingin mengubah struktur `school_identity`
- ingin menambahkan target tampilan baru yang memakai konfigurasi identitas
- ingin menaikkan `schemaVersion`

Jika hanya ingin ganti nama sekolah, logo, alamat, kontak, warna, atau legal footer, tidak perlu mengubah kode.

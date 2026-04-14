-- =============================================================
-- DATABASE SCHEMA: SMP Negeri 1 Genteng
-- Platform: Supabase (PostgreSQL)
-- =============================================================
-- Jalankan SQL ini di Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- =============================================================

-- 1. Tabel Admin Users (Autentikasi)
-- =============================================================
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL, -- Gunakan bcrypt hash
  full_name VARCHAR(100) NOT NULL DEFAULT 'Administrator',
  email VARCHAR(100),
  role VARCHAR(20) NOT NULL DEFAULT 'admin', -- admin, editor
  last_login TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert default admin (password: admin123 - GANTI di production!)
-- Hash ini adalah bcrypt hash dari 'admin123'
INSERT INTO admin_users (username, password_hash, full_name, email, role) VALUES
('admin', '$2b$10$YourBcryptHashHere', 'Administrator', 'admin@smpn1genteng.sch.id', 'admin')
ON CONFLICT (username) DO NOTHING;

-- 2. Tabel Berita / News
-- =============================================================
CREATE TABLE IF NOT EXISTS news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  excerpt TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  category VARCHAR(50) NOT NULL DEFAULT 'Akademik',
  image_url TEXT DEFAULT '',
  author VARCHAR(100) NOT NULL DEFAULT 'Admin',
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  views_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index untuk performa query
CREATE INDEX IF NOT EXISTS idx_news_category ON news(category);
CREATE INDEX IF NOT EXISTS idx_news_published ON news(is_published);
CREATE INDEX IF NOT EXISTS idx_news_created ON news(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_slug ON news(slug);

-- 3. Tabel Agenda / Events
-- =============================================================
CREATE TABLE IF NOT EXISTS agenda (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  time VARCHAR(50) DEFAULT '',
  location VARCHAR(255) DEFAULT '',
  description TEXT DEFAULT '',
  type VARCHAR(50) NOT NULL DEFAULT 'Kegiatan', -- Ujian, Rapat, Kegiatan, Libur, Ekstrakurikuler
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agenda_date ON agenda(start_date);
CREATE INDEX IF NOT EXISTS idx_agenda_type ON agenda(type);
CREATE INDEX IF NOT EXISTS idx_agenda_active ON agenda(is_active);

-- 4. Tabel Galeri
-- =============================================================
CREATE TABLE IF NOT EXISTS gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  image_url TEXT DEFAULT '',
  category VARCHAR(50) NOT NULL DEFAULT 'Akademik',
  media_type VARCHAR(10) NOT NULL DEFAULT 'image', -- 'image' atau 'video'
  youtube_url TEXT DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gallery_category ON gallery(category);
CREATE INDEX IF NOT EXISTS idx_gallery_type ON gallery(media_type);

-- 5. Tabel Slider / Hero Banner
-- =============================================================
CREATE TABLE IF NOT EXISTS slider (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  subtitle TEXT DEFAULT '',
  image_url TEXT DEFAULT '',
  button_text VARCHAR(100) DEFAULT '',
  button_link VARCHAR(255) DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_slider_order ON slider(sort_order);

-- 6. Tabel Settings (Key-Value untuk semua pengaturan)
-- =============================================================
CREATE TABLE IF NOT EXISTS settings (
  key VARCHAR(100) PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert default settings
INSERT INTO settings (key, value) VALUES
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
('profile_data', '{
  "about": "<p>SMP Negeri 1 Genteng merupakan salah satu sekolah menengah pertama unggulan di Kabupaten Banyuwangi.</p>",
  "visi": "Mewujudkan peserta didik yang unggul dalam prestasi, beriman dan bertaqwa, berakhlak mulia, serta berbudaya lingkungan.",
  "misi": [
    "Melaksanakan pembelajaran yang aktif, kreatif, efektif, dan menyenangkan.",
    "Menumbuhkan semangat berprestasi dalam bidang akademik dan non-akademik.",
    "Mengembangkan potensi peserta didik secara optimal.",
    "Membentuk karakter peserta didik yang beriman dan berakhlak mulia.",
    "Mewujudkan lingkungan sekolah yang bersih, sehat, dan nyaman.",
    "Meningkatkan kerjasama dengan orang tua dan masyarakat."
  ],
  "sambutanKepsek": "<p>Selamat datang di website resmi SMP Negeri 1 Genteng.</p>",
  "namaKepsek": "Drs. Bambang Supriyadi, M.Pd.",
  "jabatanKepsek": "Kepala SMP Negeri 1 Genteng",
  "fotoKepsek": "",
  "facilities": [
    "Ruang Kelas Ber-AC (24 Ruang)",
    "Laboratorium IPA",
    "Laboratorium Komputer",
    "Perpustakaan Digital",
    "Lapangan Olahraga",
    "Aula Serbaguna"
  ]
}'::jsonb),
('stats_data', '{
  "siswaAktif": "720+",
  "tenagaPendidik": "48",
  "prestasi": "150+",
  "akreditasi": "A"
}'::jsonb),
('seo_data', '{
  "metaTitle": "SMP Negeri 1 Genteng - Website Resmi",
  "metaDescription": "Website resmi SMP Negeri 1 Genteng, Kabupaten Banyuwangi.",
  "metaKeywords": "SMPN 1 Genteng, SMP Negeri 1 Genteng, sekolah Banyuwangi",
  "ogImage": "",
  "ogType": "website",
  "robots": "index, follow",
  "canonicalUrl": "",
  "googleVerification": "",
  "bingVerification": "",
  "googleAnalyticsId": ""
}'::jsonb),
('footer_credit', '{
  "copyrightText": "",
  "rightText": "Dibuat dengan ❤️ untuk pendidikan Indonesia",
  "showYear": true,
  "schoolName": "SMP Negeri 1 Genteng",
  "developerName": "",
  "developerUrl": ""
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
('auth_settings', '{
  "username": "admin",
  "password": "admin123",
  "showDemoCredentials": true
}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- 7. Tabel Analytics (Page Views)
-- =============================================================
CREATE TABLE IF NOT EXISTS analytics_views (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  page_path VARCHAR(255) NOT NULL,
  session_id VARCHAR(100),
  user_agent TEXT,
  ip_address INET,
  referrer TEXT,
  country VARCHAR(10),
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analytics_date ON analytics_views(viewed_at);
CREATE INDEX IF NOT EXISTS idx_analytics_page ON analytics_views(page_path);
CREATE INDEX IF NOT EXISTS idx_analytics_session ON analytics_views(session_id);

-- 8. Tabel Contact Messages (Pesan dari form kontak)
-- =============================================================
CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  subject VARCHAR(255) NOT NULL DEFAULT '',
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  replied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_read ON contact_messages(is_read);
CREATE INDEX IF NOT EXISTS idx_messages_date ON contact_messages(created_at DESC);

-- =============================================================
-- ROW LEVEL SECURITY (RLS) - Sangat Penting!
-- =============================================================

-- Enable RLS pada semua tabel
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE agenda ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE slider ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Siapa saja bisa MEMBACA data publik
CREATE POLICY "Public read news" ON news FOR SELECT USING (is_published = TRUE);
CREATE POLICY "Public read agenda" ON agenda FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Public read gallery" ON gallery FOR SELECT USING (is_published = TRUE);
CREATE POLICY "Public read slider" ON slider FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Public read settings" ON settings FOR SELECT USING (TRUE);

-- Policy: Siapa saja bisa INSERT analytics & contact messages
CREATE POLICY "Anyone can track views" ON analytics_views FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Anyone can send message" ON contact_messages FOR INSERT WITH CHECK (TRUE);

-- Policy: Frontend project ini belum memakai session Supabase Auth.
-- Agar menu admin website bisa tetap menyimpan setting ke tabel settings,
-- key-value settings dibuka untuk anon dan authenticated.
CREATE POLICY "Public insert settings" ON settings FOR INSERT TO anon, authenticated WITH CHECK (TRUE);
CREATE POLICY "Public update settings" ON settings FOR UPDATE TO anon, authenticated USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "Public delete settings" ON settings FOR DELETE TO anon, authenticated USING (TRUE);

-- Policy: Hanya authenticated user (admin) yang bisa INSERT/UPDATE/DELETE
CREATE POLICY "Admin manage news" ON news FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin manage agenda" ON agenda FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin manage gallery" ON gallery FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin manage slider" ON slider FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin read messages" ON contact_messages FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admin update messages" ON contact_messages FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admin read analytics" ON analytics_views FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admin manage users" ON admin_users FOR ALL USING (auth.role() = 'authenticated');

-- =============================================================
-- STORAGE BUCKET untuk upload gambar
-- =============================================================
-- Jalankan di SQL Editor:
INSERT INTO storage.buckets (id, name, public) VALUES ('images', 'images', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Policy: Siapa saja bisa melihat gambar
CREATE POLICY "Public read images" ON storage.objects FOR SELECT USING (bucket_id = 'images');

-- Policy: Hanya authenticated yang bisa upload
CREATE POLICY "Admin upload images" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'images' AND auth.role() = 'authenticated'
);

CREATE POLICY "Admin delete images" ON storage.objects FOR DELETE USING (
  bucket_id = 'images' AND auth.role() = 'authenticated'
);

-- =============================================================
-- FUNCTIONS untuk Analytics
-- =============================================================

-- Function: Get daily views summary
CREATE OR REPLACE FUNCTION get_daily_views(days_count INTEGER DEFAULT 30)
RETURNS TABLE (
  view_date DATE,
  total_views BIGINT,
  unique_sessions BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    DATE(viewed_at) as view_date,
    COUNT(*) as total_views,
    COUNT(DISTINCT session_id) as unique_sessions
  FROM analytics_views
  WHERE viewed_at >= NOW() - (days_count || ' days')::INTERVAL
  GROUP BY DATE(viewed_at)
  ORDER BY view_date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get popular pages
CREATE OR REPLACE FUNCTION get_popular_pages(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  page VARCHAR,
  view_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    page_path as page,
    COUNT(*) as view_count
  FROM analytics_views
  GROUP BY page_path
  ORDER BY view_count DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get total stats
CREATE OR REPLACE FUNCTION get_analytics_summary()
RETURNS TABLE (
  total_views BIGINT,
  total_sessions BIGINT,
  today_views BIGINT,
  today_sessions BIGINT,
  week_views BIGINT,
  week_sessions BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM analytics_views) as total_views,
    (SELECT COUNT(DISTINCT session_id) FROM analytics_views) as total_sessions,
    (SELECT COUNT(*) FROM analytics_views WHERE DATE(viewed_at) = CURRENT_DATE) as today_views,
    (SELECT COUNT(DISTINCT session_id) FROM analytics_views WHERE DATE(viewed_at) = CURRENT_DATE) as today_sessions,
    (SELECT COUNT(*) FROM analytics_views WHERE viewed_at >= NOW() - INTERVAL '7 days') as week_views,
    (SELECT COUNT(DISTINCT session_id) FROM analytics_views WHERE viewed_at >= NOW() - INTERVAL '7 days') as week_sessions;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================
-- AUTO UPDATE TIMESTAMP
-- =============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_news_updated BEFORE UPDATE ON news FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_agenda_updated BEFORE UPDATE ON agenda FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_gallery_updated BEFORE UPDATE ON gallery FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_slider_updated BEFORE UPDATE ON slider FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_settings_updated BEFORE UPDATE ON settings FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================================
-- SAMPLE DATA (Opsional - untuk testing)
-- =============================================================
INSERT INTO news (title, slug, excerpt, content, category, author) VALUES
('Siswa Raih Juara 1 OSN Matematika', 'siswa-raih-juara-1-osn', 'Siswa SMPN 1 Genteng meraih prestasi gemilang.', '<p>Artikel lengkap di sini...</p>', 'Prestasi', 'Admin'),
('Pelantikan OSIS 2024/2025', 'pelantikan-osis-2024', 'Pengurus OSIS baru resmi dilantik.', '<p>Artikel lengkap di sini...</p>', 'OSIS', 'Admin')
ON CONFLICT DO NOTHING;

INSERT INTO agenda (title, start_date, end_date, time, location, type) VALUES
('Penilaian Akhir Semester', '2025-06-09', '2025-06-20', '07:30 - 12:00 WIB', 'Ruang Kelas', 'Ujian'),
('Rapat Wali Murid', '2025-06-21', NULL, '09:00 - 12:00 WIB', 'Aula Sekolah', 'Rapat')
ON CONFLICT DO NOTHING;

-- =============================================================
-- SELESAI! Database siap digunakan.
-- =============================================================

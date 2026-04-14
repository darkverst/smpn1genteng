// =============================================================
// CONTOH: Supabase Client Integration
// =============================================================
// File ini adalah REFERENSI cara mengintegrasikan Supabase
// ke dalam aplikasi React yang sudah ada.
//
// LANGKAH INSTALASI:
//   npm install @supabase/supabase-js
//
// LANGKAH SETUP:
//   1. Buat file: src/lib/supabase.ts
//   2. Buat file: .env (di root project)
//   3. Modifikasi AppContext.tsx untuk menggunakan Supabase
// =============================================================

// ─────────────────────────────────────────────
// FILE: .env (di root project, JANGAN commit ke git!)
// ─────────────────────────────────────────────
// VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
// VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

// ─────────────────────────────────────────────
// FILE: src/lib/supabase.ts
// ─────────────────────────────────────────────
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// ─────────────────────────────────────────────
// CONTOH: Service functions untuk News
// FILE: src/services/newsService.ts
// ─────────────────────────────────────────────

import { supabase } from '../lib/supabase';

export interface NewsRow {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  image_url: string;
  author: string;
  is_published: boolean;
  views_count: number;
  created_at: string;
  updated_at: string;
}

// Ambil semua berita (publik)
export async function fetchNews(category?: string) {
  let query = supabase
    .from('news')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false });

  if (category && category !== 'Semua') {
    query = query.eq('category', category);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as NewsRow[];
}

// Ambil berita berdasarkan slug
export async function fetchNewsBySlug(slug: string) {
  const { data, error } = await supabase
    .from('news')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (error) throw error;
  return data as NewsRow;
}

// Tambah berita (admin)
export async function createNews(news: Omit<NewsRow, 'id' | 'created_at' | 'updated_at' | 'views_count'>) {
  const { data, error } = await supabase
    .from('news')
    .insert(news)
    .select()
    .single();

  if (error) throw error;
  return data as NewsRow;
}

// Update berita (admin)
export async function updateNews(id: string, updates: Partial<NewsRow>) {
  const { data, error } = await supabase
    .from('news')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as NewsRow;
}

// Hapus berita (admin)
export async function deleteNews(id: string) {
  const { error } = await supabase
    .from('news')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ─────────────────────────────────────────────
// CONTOH: Service functions untuk Agenda
// FILE: src/services/agendaService.ts
// ─────────────────────────────────────────────

export interface AgendaRow {
  id: string;
  title: string;
  start_date: string;
  end_date: string | null;
  time: string;
  location: string;
  description: string;
  type: string;
  is_active: boolean;
  created_at: string;
}

export async function fetchAgenda(type?: string) {
  let query = supabase
    .from('agenda')
    .select('*')
    .eq('is_active', true)
    .order('start_date', { ascending: true });

  if (type) {
    query = query.eq('type', type);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as AgendaRow[];
}

export async function createAgenda(item: Omit<AgendaRow, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('agenda')
    .insert(item)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ─────────────────────────────────────────────
// CONTOH: Service functions untuk Gallery
// FILE: src/services/galleryService.ts
// ─────────────────────────────────────────────

export async function fetchGallery(category?: string) {
  let query = supabase
    .from('gallery')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false });

  if (category && category !== 'Semua') {
    if (category === 'Video') {
      query = query.eq('media_type', 'video');
    } else {
      query = query.eq('category', category);
    }
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

// ─────────────────────────────────────────────
// CONTOH: Upload gambar ke Supabase Storage
// FILE: src/services/storageService.ts
// ─────────────────────────────────────────────

export async function uploadImage(file: File, folder: string = 'news'): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

  const { error } = await supabase.storage
    .from('images')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) throw error;

  // Dapatkan public URL
  const { data } = supabase.storage
    .from('images')
    .getPublicUrl(fileName);

  return data.publicUrl;
}

export async function deleteImage(url: string) {
  // Extract path from URL
  const path = url.split('/images/')[1];
  if (!path) return;

  const { error } = await supabase.storage
    .from('images')
    .remove([path]);

  if (error) throw error;
}

// ─────────────────────────────────────────────
// CONTOH: Settings service (Contact, Profile, SEO, Stats)
// FILE: src/services/settingsService.ts
// ─────────────────────────────────────────────

export async function getSetting<T>(key: string): Promise<T> {
  const { data, error } = await supabase
    .from('settings')
    .select('value')
    .eq('key', key)
    .single();

  if (error) throw error;
  return data.value as T;
}

export async function updateSetting(key: string, value: unknown) {
  const { error } = await supabase
    .from('settings')
    .upsert({
      key,
      value,
      updated_at: new Date().toISOString(),
    });

  if (error) throw error;
}

// ─────────────────────────────────────────────
// CONTOH: Analytics tracking
// FILE: src/services/analyticsService.ts
// ─────────────────────────────────────────────

export async function trackPageView(pagePath: string, sessionId: string) {
  const { error } = await supabase
    .from('analytics_views')
    .insert({
      page_path: pagePath,
      session_id: sessionId,
      user_agent: navigator.userAgent,
      referrer: document.referrer || null,
    });

  if (error) console.error('Analytics error:', error);
}

export async function getAnalyticsSummary() {
  const { data, error } = await supabase
    .rpc('get_analytics_summary');

  if (error) throw error;
  return data[0];
}

export async function getDailyViews(days: number = 30) {
  const { data, error } = await supabase
    .rpc('get_daily_views', { days_count: days });

  if (error) throw error;
  return data;
}

// ─────────────────────────────────────────────
// CONTOH: Auth service (Login/Logout)
// FILE: src/services/authService.ts
// ─────────────────────────────────────────────

// OPSI 1: Menggunakan Supabase Auth (DIREKOMENDASIKAN)
export async function loginWithSupabaseAuth(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

export async function logoutSupabase() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// Listen to auth state changes
export function onAuthStateChange(callback: (isLoggedIn: boolean) => void) {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(!!session);
  });
}

// ─────────────────────────────────────────────
// CONTOH: Modified AppContext.tsx menggunakan Supabase
// FILE: src/context/AppContext.tsx (versi Supabase)
// ─────────────────────────────────────────────

/*
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import * as newsService from '../services/newsService';
import * as agendaService from '../services/agendaService';
import * as settingsService from '../services/settingsService';

export function AppProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Check auth state on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setIsLoggedIn(!!session);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Fetch news from Supabase
  useEffect(() => {
    async function loadNews() {
      try {
        const data = await newsService.fetchNews();
        setNews(data);
      } catch (err) {
        console.error('Failed to load news:', err);
      } finally {
        setLoading(false);
      }
    }
    loadNews();
  }, []);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const addNews = async (item) => {
    const created = await newsService.createNews(item);
    setNews(prev => [created, ...prev]);
  };

  // ... seterusnya untuk CRUD lainnya

  return (
    <AppContext.Provider value={{ isLoggedIn, login, logout, news, addNews, loading }}>
      {children}
    </AppContext.Provider>
  );
}
*/

// ─────────────────────────────────────────────
// CONTOH: Contact form mengirim ke Supabase
// ─────────────────────────────────────────────

/*
// Di halaman Kontak.tsx, ganti submit handler:

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setSubmitting(true);

  try {
    const { error } = await supabase
      .from('contact_messages')
      .insert({
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
      });

    if (error) throw error;

    alert('Pesan berhasil dikirim!');
    setFormData({ name: '', email: '', subject: '', message: '' });
  } catch (err) {
    alert('Gagal mengirim pesan. Silakan coba lagi.');
    console.error(err);
  } finally {
    setSubmitting(false);
  }
};
*/

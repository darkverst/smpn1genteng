import { createClient } from '@supabase/supabase-js';

function normalizeEnvValue(raw?: string): string {
  if (!raw) return '';
  return raw.trim().replace(/^['"`\s]+|['"`\s]+$/g, '');
}

const DEFAULT_SUPABASE_URL = 'https://tbrkiitpnognhdunyemo.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRicmtpaXRwbm9nbmhkdW55ZW1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEyMjk5MzUsImV4cCI6MjEwNjgwNTkzNX0.xDcCVnIbRaWg0VhbSkgBZ7u-Vf4w7hKHRJ5sALOcm28';

export const supabaseUrl =
  normalizeEnvValue(
    import.meta.env.VITE_SUPABASE_URL ||
    import.meta.env.NEXT_PUBLIC_ma_SUPABASE_URL ||
    import.meta.env.ma_SUPABASE_URL
  ) || DEFAULT_SUPABASE_URL;

export const supabaseAnonKey =
  normalizeEnvValue(
    import.meta.env.VITE_SUPABASE_ANON_KEY ||
    import.meta.env.NEXT_PUBLIC_ma_SUPABASE_ANON_KEY ||
    import.meta.env.ma_SUPABASE_ANON_KEY ||
    import.meta.env.ma_SUPABASE_PUBLISHABLE_KEY
  ) || DEFAULT_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : null;

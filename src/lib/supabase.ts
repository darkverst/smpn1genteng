import { createClient } from '@supabase/supabase-js';

function normalizeEnvValue(raw?: string): string {
  if (!raw) return '';
  return raw.trim().replace(/^['"`\s]+|['"`\s]+$/g, '');
}

const DEFAULT_SUPABASE_URL = '';
const DEFAULT_SUPABASE_ANON_KEY = '';

export const supabaseUrl =
  normalizeEnvValue(
    import.meta.env.VITE_SUPABASE_URL ||
    import.meta.env.NEXT_PUBLIC_SUPABASE_URL ||
    import.meta.env.SUPABASE_URL
  ) || DEFAULT_SUPABASE_URL;

export const supabaseAnonKey =
  normalizeEnvValue(
    import.meta.env.VITE_SUPABASE_ANON_KEY ||
    import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    import.meta.env.SUPABASE_ANON_KEY ||
    import.meta.env.SUPABASE_PUBLISHABLE_KEY
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

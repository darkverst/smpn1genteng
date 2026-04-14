import { isSupabaseConfigured, supabase } from '../lib/supabase';

const SETTINGS_TABLE = 'settings';

export async function loadSettings(keys: string[]): Promise<Record<string, unknown>> {
  if (!isSupabaseConfigured || !supabase) {
    console.error('[DB] Supabase belum dikonfigurasi. Data tidak dapat dimuat dari database.');
    return {};
  }

  const { data, error } = await supabase
    .from(SETTINGS_TABLE)
    .select('key, value')
    .in('key', keys);

  if (error) {
    console.error('[DB] Gagal memuat settings:', error);
    return {};
  }

  const result: Record<string, unknown> = {};
  for (const row of data ?? []) {
    if (typeof row.key === 'string') {
      result[row.key] = row.value;
    }
  }
  return result;
}

export async function saveSetting(key: string, value: unknown): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) {
    console.error(`[DB] Supabase belum dikonfigurasi. Setting "${key}" tidak tersimpan.`);
    return false;
  }

  const { error } = await supabase
    .from(SETTINGS_TABLE)
    .upsert({
      key,
      value,
      updated_at: new Date().toISOString(),
    });

  if (error) {
    console.error(`[DB] Gagal menyimpan setting "${key}":`, error);
    return false;
  }

  return true;
}

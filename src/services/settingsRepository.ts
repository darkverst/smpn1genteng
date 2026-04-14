import { isSupabaseConfigured, supabase } from '../lib/supabase';

const SETTINGS_TABLE = 'settings';

export interface DatabaseStorageStats {
  databaseBytes: number;
  databaseSize: string;
  settingsBytes: number;
  settingsSize: string;
  settingsRows: number;
}

function formatSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

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

export async function getDatabaseStorageStats(): Promise<DatabaseStorageStats | null> {
  if (!isSupabaseConfigured || !supabase) {
    console.error('[DB] Supabase belum dikonfigurasi. Statistik database tidak tersedia.');
    return null;
  }

  const { data: rpcData, error: rpcError } = await supabase.rpc('get_database_storage_stats');
  if (!rpcError) {
    const row = Array.isArray(rpcData) ? rpcData[0] : rpcData;
    if (row && typeof row === 'object') {
      const typed = row as Record<string, unknown>;
      const databaseBytes = Number(typed.database_bytes ?? 0);
      const settingsBytes = Number(typed.settings_bytes ?? 0);
      const settingsRows = Number(typed.settings_rows ?? 0);
      return {
        databaseBytes,
        databaseSize: typeof typed.database_size === 'string' ? typed.database_size : formatSize(databaseBytes),
        settingsBytes,
        settingsSize: typeof typed.settings_size === 'string' ? typed.settings_size : formatSize(settingsBytes),
        settingsRows,
      };
    }
  } else {
    console.warn('[DB] RPC get_database_storage_stats tidak tersedia, menggunakan fallback:', rpcError.message);
  }

  // Fallback: hitung perkiraan dari payload settings yang bisa dibaca client.
  const { data, error } = await supabase
    .from(SETTINGS_TABLE)
    .select('key, value');

  if (error) {
    console.error('[DB] Gagal memuat statistik fallback settings:', error);
    return null;
  }

  const settingsRows = (data ?? []).length;
  const settingsBytes = (data ?? []).reduce((total, item) => {
    const keyPart = typeof item.key === 'string' ? item.key : '';
    const valuePart = JSON.stringify(item.value ?? '');
    return total + new Blob([keyPart, valuePart]).size;
  }, 0);

  return {
    databaseBytes: settingsBytes,
    databaseSize: `${formatSize(settingsBytes)} (estimasi)`,
    settingsBytes,
    settingsSize: `${formatSize(settingsBytes)} (estimasi)`,
    settingsRows,
  };
}

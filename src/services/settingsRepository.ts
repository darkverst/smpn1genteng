import { isSupabaseConfigured, supabase } from '../lib/supabase';

const SETTINGS_TABLE = 'settings';

export interface DatabaseStorageStats {
  databaseBytes: number;
  databaseSize: string;
  settingsBytes: number;
  settingsSize: string;
  settingsRows: number;
}

export interface DatabaseConnectionStatus {
  isConnected: boolean;
  source: 'supabase' | 'environment' | 'unknown';
  message: string;
}

export interface ResetSettingsResult {
  success: boolean;
  resetCount: number;
  removedCount: number;
  message?: string;
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

export async function ensureDefaultSettings(defaultSettings: Record<string, unknown>): Promise<Record<string, unknown>> {
  const keys = Object.keys(defaultSettings);
  if (keys.length === 0) return {};

  if (!isSupabaseConfigured || !supabase) {
    console.error('[DB] Supabase belum dikonfigurasi. Menggunakan default lokal untuk settings.');
    return { ...defaultSettings };
  }

  const existingSettings = await loadSettings(keys);
  const missingPayload = keys
    .filter((key) => existingSettings[key] === undefined)
    .map((key) => ({
      key,
      value: defaultSettings[key],
      updated_at: new Date().toISOString(),
    }));

  if (missingPayload.length > 0) {
    const { error } = await supabase
      .from(SETTINGS_TABLE)
      .upsert(missingPayload, { onConflict: 'key' });

    if (error) {
      console.error('[DB] Gagal membuat key settings yang belum ada:', error);
    }
  }

  return {
    ...defaultSettings,
    ...existingSettings,
  };
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
    }, { onConflict: 'key' });

  if (error) {
    console.error(`[DB] Gagal menyimpan setting "${key}":`, error);
    return false;
  }

  return true;
}

export async function checkDatabaseConnection(): Promise<DatabaseConnectionStatus> {
  if (!isSupabaseConfigured || !supabase) {
    return {
      isConnected: false,
      source: 'environment',
      message: 'Environment Supabase belum valid. Periksa VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY.',
    };
  }

  const { data, error, count } = await supabase
    .from(SETTINGS_TABLE)
    .select('key, value', { count: 'exact' })
    .limit(1);

  if (error) {
    return {
      isConnected: false,
      source: 'supabase',
      message: `Gagal terhubung ke tabel settings: ${error.message}`,
    };
  }

  const existingRow = data?.[0];

  if (existingRow?.key && typeof existingRow.key === 'string') {
    const { error: writeError } = await supabase
      .from(SETTINGS_TABLE)
      .upsert({
        key: existingRow.key,
        value: existingRow.value ?? {},
        updated_at: new Date().toISOString(),
      }, { onConflict: 'key' });

    if (writeError) {
      return {
        isConnected: false,
        source: 'supabase',
        message: `Koneksi baca berhasil, tetapi hak tulis ke tabel settings gagal: ${writeError.message}`,
      };
    }
  } else {
    const probeKey = '__connection_probe__';
    const { error: insertError } = await supabase
      .from(SETTINGS_TABLE)
      .upsert({
        key: probeKey,
        value: { checkedAt: new Date().toISOString() },
        updated_at: new Date().toISOString(),
      }, { onConflict: 'key' });

    if (insertError) {
      return {
        isConnected: false,
        source: 'supabase',
        message: `Tabel settings terbaca, tetapi gagal membuat data uji tulis: ${insertError.message}`,
      };
    }

    const { error: deleteProbeError } = await supabase
      .from(SETTINGS_TABLE)
      .delete()
      .eq('key', probeKey);

    if (deleteProbeError) {
      return {
        isConnected: false,
        source: 'supabase',
        message: `Hak tulis tersedia, tetapi cleanup data uji gagal: ${deleteProbeError.message}`,
      };
    }
  }

  return {
    isConnected: true,
    source: 'supabase',
    message: `Terhubung ke Supabase. Baca/tulis tabel settings aktif (${count ?? 0} baris).`,
  };
}

export async function resetSettingsToDefault(defaultSettings: Record<string, unknown>): Promise<ResetSettingsResult> {
  if (!isSupabaseConfigured || !supabase) {
    return {
      success: false,
      resetCount: 0,
      removedCount: 0,
      message: 'Supabase belum dikonfigurasi.',
    };
  }

  const defaultEntries = Object.entries(defaultSettings);
  const defaultKeys = defaultEntries.map(([key]) => key);

  const { data: existingRows, error: existingError } = await supabase
    .from(SETTINGS_TABLE)
    .select('key');

  if (existingError) {
    return {
      success: false,
      resetCount: 0,
      removedCount: 0,
      message: `Gagal membaca key existing: ${existingError.message}`,
    };
  }

  const keysToRemove = (existingRows ?? [])
    .map((row) => row.key)
    .filter((key): key is string => typeof key === 'string' && !defaultKeys.includes(key));

  let removedCount = 0;
  if (keysToRemove.length > 0) {
    const { error: deleteError } = await supabase
      .from(SETTINGS_TABLE)
      .delete()
      .in('key', keysToRemove);
    if (deleteError) {
      return {
        success: false,
        resetCount: 0,
        removedCount: 0,
        message: `Gagal menghapus key di luar default: ${deleteError.message}`,
      };
    }
    removedCount = keysToRemove.length;
  }

  const upsertPayload = defaultEntries.map(([key, value]) => ({
    key,
    value,
    updated_at: new Date().toISOString(),
  }));

  const { error: upsertError } = await supabase
    .from(SETTINGS_TABLE)
    .upsert(upsertPayload);

  if (upsertError) {
    return {
      success: false,
      resetCount: 0,
      removedCount,
      message: `Gagal reset ke default: ${upsertError.message}`,
    };
  }

  return {
    success: true,
    resetCount: upsertPayload.length,
    removedCount,
  };
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

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { isNeonConfigured, sql } from '../lib/neon';

const SETTINGS_CACHE_TTL_MS = 60_000;
const settingsCache = new Map<string, { value: unknown; expiresAt: number }>();

export const isDbConfigured = isSupabaseConfigured || isNeonConfigured;

export interface MediaFolderStats {
  folder: string;
  count: number;
  bytes: number;
  size: string;
}

export interface DatabaseStorageStats {
  databaseBytes: number;
  databaseSize: string;
  settingsBytes: number;
  settingsSize: string;
  settingsRows: number;
  mediaBytes: number;
  mediaSize: string;
  mediaFiles: number;
  mediaFolders?: MediaFolderStats[];
}

export interface DatabaseConnectionStatus {
  isConnected: boolean;
  source: 'supabase' | 'neon' | 'environment' | 'unknown';
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

function getCachedSettings(keys: string[]): Record<string, unknown> | null {
  const now = Date.now();
  const cached: Record<string, unknown> = {};

  for (const key of keys) {
    const entry = settingsCache.get(key);
    if (!entry || entry.expiresAt < now) {
      if (entry && entry.expiresAt < now) {
        settingsCache.delete(key);
      }
      return null;
    }
    cached[key] = entry.value;
  }

  return cached;
}

function cacheSettings(settings: Record<string, unknown>) {
  const expiresAt = Date.now() + SETTINGS_CACHE_TTL_MS;
  for (const [key, value] of Object.entries(settings)) {
    settingsCache.set(key, { value, expiresAt });
  }
}

export function invalidateSettingsCache(keys?: string[]) {
  if (!keys || keys.length === 0) {
    settingsCache.clear();
    return;
  }

  for (const key of keys) {
    settingsCache.delete(key);
  }
}

async function fetchSettingsRows(keys: string[]): Promise<{
  success: boolean;
  settings: Record<string, unknown>;
  errorMessage?: string;
}> {
  // 1. Prioritaskan Supabase
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('key, value')
        .in('key', keys);

      if (error) {
        return {
          success: false,
          settings: {},
          errorMessage: error.message,
        };
      }

      const settings: Record<string, unknown> = {};
      for (const row of data ?? []) {
        if (typeof row.key === 'string') {
          settings[row.key] = row.value;
        }
      }

      return { success: true, settings };
    } catch (error) {
      return {
        success: false,
        settings: {},
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // 2. Fallback ke Neon PostgreSQL
  if (isNeonConfigured && sql) {
    try {
      const rows = await sql`SELECT key, value FROM settings WHERE key = ANY(${keys})` as { key: string; value: unknown }[];
      const settings: Record<string, unknown> = {};
      for (const row of rows ?? []) {
        if (typeof row.key === 'string') {
          settings[row.key] = row.value;
        }
      }

      return { success: true, settings };
    } catch (error) {
      return {
        success: false,
        settings: {},
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  return {
    success: false,
    settings: {},
    errorMessage: 'Database belum dikonfigurasi.',
  };
}

export async function loadSettings(keys: string[]): Promise<Record<string, unknown>> {
  if (!isDbConfigured) {
    console.error('[DB] Database belum dikonfigurasi. Data tidak dapat dimuat dari database.');
    return {};
  }

  const cached = getCachedSettings(keys);
  if (cached) {
    return cached;
  }

  const result = await fetchSettingsRows(keys);
  if (!result.success) {
    console.error('[DB] Gagal memuat settings:', result.errorMessage);
    return {};
  }

  cacheSettings(result.settings);
  return result.settings;
}

export async function ensureDefaultSettings(defaultSettings: Record<string, unknown>): Promise<Record<string, unknown>> {
  const keys = Object.keys(defaultSettings);
  if (keys.length === 0) return {};

  if (!isDbConfigured) {
    console.error('[DB] Database belum dikonfigurasi. Menggunakan default lokal untuk settings.');
    return { ...defaultSettings };
  }

  // 1. Handle via Supabase
  if (isSupabaseConfigured && supabase) {
    try {
      const { data: existingRows } = await supabase
        .from('settings')
        .select('key')
        .in('key', keys);

      const existingKeySet = new Set((existingRows ?? []).map((r) => r.key));
      const missingKeys = keys.filter((key) => !existingKeySet.has(key));

      if (missingKeys.length > 0) {
        const toInsert = missingKeys.map((key) => ({
          key,
          value: defaultSettings[key],
          updated_at: new Date().toISOString(),
        }));
        await supabase.from('settings').insert(toInsert);
      }
    } catch (err) {
      console.warn('[DB] Pengecekan key settings awal Supabase gagal, lanjut memuat data:', err);
    }
  } else if (isNeonConfigured && sql) {
    // 2. Handle via Neon
    try {
      const existingKeyRows = await sql`SELECT key FROM settings WHERE key = ANY(${keys})` as { key: string }[];
      const existingKeySet = new Set((existingKeyRows ?? []).map((r) => r.key));
      const missingKeys = keys.filter((key) => !existingKeySet.has(key));

      if (missingKeys.length > 0) {
        for (const key of missingKeys) {
          await sql`
            INSERT INTO settings (key, value, updated_at)
            VALUES (${key}, ${JSON.stringify(defaultSettings[key])}, ${new Date().toISOString()})
            ON CONFLICT (key) DO NOTHING
          `;
        }
      }
    } catch (keyErr) {
      console.warn('[DB] Pengecekan key settings awal Neon gagal, lanjut memuat data:', keyErr);
    }
  }

  // 3. Muat settings yang ada dari database
  const result = await fetchSettingsRows(keys);
  if (!result.success) {
    console.warn('[DB] Gagal membaca settings dari database, menggunakan fallback default:', result.errorMessage);
    return { ...defaultSettings };
  }

  const merged = {
    ...defaultSettings,
    ...result.settings,
  };
  cacheSettings(merged);

  return merged;
}

export async function saveSetting(key: string, value: unknown): Promise<boolean> {
  if (!isDbConfigured) {
    console.error(`[DB] Database belum dikonfigurasi. Setting "${key}" tidak tersimpan.`);
    return false;
  }

  // 1. Supabase
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from('settings')
        .upsert({
          key,
          value,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        console.error(`[DB] Gagal menyimpan setting "${key}" ke Supabase:`, error);
        return false;
      }

      cacheSettings({ [key]: value });
      return true;
    } catch (error) {
      console.error(`[DB] Gagal menyimpan setting "${key}":`, error);
      return false;
    }
  }

  // 2. Neon Fallback
  if (isNeonConfigured && sql) {
    try {
      await sql`
        INSERT INTO settings (key, value, updated_at)
        VALUES (${key}, ${JSON.stringify(value)}, ${new Date().toISOString()})
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = EXCLUDED.updated_at
      `;

      cacheSettings({ [key]: value });
      return true;
    } catch (error) {
      console.error(`[DB] Gagal menyimpan setting "${key}":`, error);
      return false;
    }
  }

  return false;
}

export interface ExportBackupData {
  data: Record<string, unknown>;
  keys: string[];
  source: string;
}

export async function exportAllSettings(fallbackKeys: string[] = []): Promise<ExportBackupData> {
  const result: Record<string, unknown> = {};
  const keys: string[] = [];

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('settings').select('key, value').order('key');
      if (!error && data && data.length > 0) {
        for (const row of data) {
          if (row.key) {
            result[row.key] = row.value;
            keys.push(row.key);
          }
        }
        return {
          data: result,
          keys,
          source: 'Supabase Cloud PostgreSQL (Singapore - ap-southeast-1)',
        };
      }
    } catch (err) {
      console.warn('[DB] Gagal membaca seluruh setting dari Supabase:', err);
    }
  }

  // Fallback via loadSettings
  if (fallbackKeys.length > 0) {
    const loaded = await loadSettings(fallbackKeys);
    for (const k of fallbackKeys) {
      if (loaded[k] !== undefined) {
        result[k] = loaded[k];
        keys.push(k);
      }
    }
  }

  return {
    data: result,
    keys,
    source: isSupabaseConfigured ? 'Supabase Cloud PostgreSQL (Singapore)' : 'Database',
  };
}

export async function checkDatabaseConnection(): Promise<DatabaseConnectionStatus> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { count, error } = await supabase
        .from('settings')
        .select('*', { count: 'exact', head: true });

      if (error) {
        return {
          isConnected: false,
          source: 'supabase',
          message: `Gagal terhubung ke Supabase: ${error.message}`,
        };
      }

      const probeKey = '__connection_probe__';
      await supabase.from('settings').upsert({
        key: probeKey,
        value: { checkedAt: new Date().toISOString() },
        updated_at: new Date().toISOString(),
      });

      return {
        isConnected: true,
        source: 'supabase',
        message: `Terhubung ke Supabase PostgreSQL (Singapore - ap-southeast-1). Baca/tulis tabel settings aktif (${count ?? 0} baris).`,
      };
    } catch (error) {
      return {
        isConnected: false,
        source: 'supabase',
        message: `Gagal terhubung ke Supabase: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  if (isNeonConfigured && sql) {
    try {
      const countResult = await sql`SELECT count(*)::int as cnt FROM settings` as { cnt: number }[];
      const count = countResult?.[0]?.cnt ?? 0;

      const probeKey = '__connection_probe__';
      await sql`
        INSERT INTO settings (key, value, updated_at)
        VALUES (${probeKey}, ${JSON.stringify({ checkedAt: new Date().toISOString() })}, ${new Date().toISOString()})
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = EXCLUDED.updated_at
      `;

      return {
        isConnected: true,
        source: 'neon',
        message: `Terhubung ke Neon database (Legacy Fallback). Baca/tulis tabel settings aktif (${count} baris).`,
      };
    } catch (error) {
      return {
        isConnected: false,
        source: 'neon',
        message: `Gagal terhubung ke tabel settings: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  return {
    isConnected: false,
    source: 'environment',
    message: 'Environment database belum valid. Periksa VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY.',
  };
}

export async function resetSettingsToDefault(defaultSettings: Record<string, unknown>): Promise<ResetSettingsResult> {
  if (!isDbConfigured) {
    return {
      success: false,
      resetCount: 0,
      removedCount: 0,
      message: 'Database belum dikonfigurasi.',
    };
  }

  const defaultEntries = Object.entries(defaultSettings);
  const defaultKeys = defaultEntries.map(([key]) => key);

  if (isSupabaseConfigured && supabase) {
    try {
      const { data: existingRows } = await supabase.from('settings').select('key');
      const keysToRemove = (existingRows ?? [])
        .map((row) => row.key)
        .filter((key): key is string => typeof key === 'string' && !defaultKeys.includes(key));

      let removedCount = 0;
      if (keysToRemove.length > 0) {
        await supabase.from('settings').delete().in('key', keysToRemove);
        removedCount = keysToRemove.length;
      }

      const toUpsert = defaultEntries.map(([key, value]) => ({
        key,
        value,
        updated_at: new Date().toISOString(),
      }));

      await supabase.from('settings').upsert(toUpsert);
      cacheSettings(defaultSettings);

      return {
        success: true,
        resetCount: defaultEntries.length,
        removedCount,
      };
    } catch (error) {
      return {
        success: false,
        resetCount: 0,
        removedCount: 0,
        message: `Gagal reset ke default: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  if (isNeonConfigured && sql) {
    try {
      const existingRows = await sql`SELECT key FROM settings` as { key: string }[];
      const keysToRemove = (existingRows ?? [])
        .map((row) => row.key)
        .filter((key): key is string => typeof key === 'string' && !defaultKeys.includes(key));

      let removedCount = 0;
      if (keysToRemove.length > 0) {
        await sql`DELETE FROM settings WHERE key = ANY(${keysToRemove})`;
        removedCount = keysToRemove.length;
      }

      for (const [key, value] of defaultEntries) {
        await sql`
          INSERT INTO settings (key, value, updated_at)
          VALUES (${key}, ${JSON.stringify(value)}, ${new Date().toISOString()})
          ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = EXCLUDED.updated_at
        `;
      }

      cacheSettings(defaultSettings);
      return {
        success: true,
        resetCount: defaultEntries.length,
        removedCount,
      };
    } catch (error) {
      return {
        success: false,
        resetCount: 0,
        removedCount: 0,
        message: `Gagal reset ke default: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  return {
    success: false,
    resetCount: 0,
    removedCount: 0,
    message: 'Database belum dikonfigurasi.',
  };
}

export async function getDatabaseStorageStats(): Promise<DatabaseStorageStats | null> {
  if (!isDbConfigured) {
    return null;
  }

  if (isSupabaseConfigured && supabase) {
    try {
      // 1. Data Tabel Settings (PostgreSQL)
      const { data, count } = await supabase.from('settings').select('key, value', { count: 'exact' });
      const settingsRows = count ?? (data ?? []).length;
      const settingsBytes = (data ?? []).reduce((total, item) => {
        const keyPart = typeof item.key === 'string' ? item.key : '';
        const valuePart = JSON.stringify(item.value ?? '');
        return total + new Blob([keyPart, valuePart]).size;
      }, 0);

      // 2. Data File Gambar & Media (Supabase Storage Bucket school-media)
      let mediaBytes = 0;
      let mediaFiles = 0;
      const mediaFolders: MediaFolderStats[] = [];

      try {
        const knownFolders = ['brand', 'eskul', 'gallery', 'news', 'profile', 'slider', 'teachers'];
        const folderSet = new Set(knownFolders);

        const { data: rootItems } = await supabase.storage.from('school-media').list('', { limit: 100 });
        for (const item of rootItems || []) {
          if (item.id === null) {
            folderSet.add(item.name);
          } else {
            const rootFileSize = item.metadata?.size || 0;
            mediaBytes += rootFileSize;
            mediaFiles += 1;
          }
        }

        const folderQueries = Array.from(folderSet).map(async (folder) => {
          const { data: files } = await supabase.storage.from('school-media').list(folder, { limit: 1000 });
          let bytes = 0;
          let fileCount = 0;
          for (const f of files || []) {
            if (f.id !== null) {
              fileCount += 1;
              bytes += f.metadata?.size || 0;
            }
          }
          return { folder, count: fileCount, bytes };
        });

        const folderResults = await Promise.all(folderQueries);
        for (const res of folderResults) {
          if (res.count > 0) {
            mediaFolders.push({
              folder: res.folder,
              count: res.count,
              bytes: res.bytes,
              size: formatSize(res.bytes),
            });
            mediaBytes += res.bytes;
            mediaFiles += res.count;
          }
        }
      } catch (mediaErr) {
        console.warn('[DB] Gagal menghitung statistik media storage:', mediaErr);
      }

      const totalCombinedBytes = settingsBytes + mediaBytes;

      return {
        databaseBytes: totalCombinedBytes,
        databaseSize: formatSize(totalCombinedBytes),
        settingsBytes,
        settingsSize: formatSize(settingsBytes),
        settingsRows,
        mediaBytes,
        mediaSize: formatSize(mediaBytes),
        mediaFiles,
        mediaFolders,
      };
    } catch (error) {
      console.warn('[DB] Gagal menghitung statistik Supabase:', error);
      return null;
    }
  }

  if (isNeonConfigured && sql) {
    try {
      const rows = await sql`SELECT key, value FROM settings` as { key: string; value: unknown }[];
      const settingsRows = (rows ?? []).length;
      const settingsBytes = (rows ?? []).reduce((total, item) => {
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
    } catch (error) {
      console.error('[DB] Gagal memuat statistik Neon:', error);
      return null;
    }
  }

  return null;
}

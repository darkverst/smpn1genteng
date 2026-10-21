/**
 * Utilitas Pengawasan & Proteksi Kuota Penyimpanan Lokal (LocalStorage Guard)
 * Mencegah QuotaExceededError dan memberikan transparansi pemakaian kapasitas penyimpanan browser.
 */

export const ESTIMATED_LOCALSTORAGE_LIMIT_BYTES = 5 * 1024 * 1024; // 5 MB perkiraan batas aman browser
export const WARNING_THRESHOLD_PERCENT = 75; // 75%
export const DANGER_THRESHOLD_PERCENT = 90; // 90%

export interface StorageUsageReport {
  usedBytes: number;
  totalBytes: number;
  remainingBytes: number;
  percentUsed: number;
  usedFormatted: string;
  totalFormatted: string;
  remainingFormatted: string;
  status: 'safe' | 'warning' | 'danger';
  itemCount: number;
}

/**
 * Format ukuran byte menjadi satuan yang mudah dibaca (B, KB, MB)
 */
export function formatStorageBytes(bytes: number, decimals = 1): string {
  if (!bytes || bytes <= 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Menghitung penggunaan byte aktual di LocalStorage saat ini
 */
export function getLocalStorageUsage(): StorageUsageReport {
  let usedBytes = 0;
  let itemCount = 0;

  try {
    if (typeof localStorage !== 'undefined') {
      itemCount = localStorage.length;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          const val = localStorage.getItem(key) || '';
          // Di JavaScript string disimpan dalam UTF-16 (rata-rata 2 byte per karakter)
          usedBytes += (key.length + val.length) * 2;
        }
      }
    }
  } catch {
    // Abaikan jika localStorage diblokir oleh browser / mode incognito ketat
  }

  const remainingBytes = Math.max(0, ESTIMATED_LOCALSTORAGE_LIMIT_BYTES - usedBytes);
  const percentUsed = Math.min(
    100,
    Math.round((usedBytes / ESTIMATED_LOCALSTORAGE_LIMIT_BYTES) * 100)
  );

  let status: 'safe' | 'warning' | 'danger' = 'safe';
  if (percentUsed >= DANGER_THRESHOLD_PERCENT) {
    status = 'danger';
  } else if (percentUsed >= WARNING_THRESHOLD_PERCENT) {
    status = 'warning';
  }

  return {
    usedBytes,
    totalBytes: ESTIMATED_LOCALSTORAGE_LIMIT_BYTES,
    remainingBytes,
    percentUsed,
    usedFormatted: formatStorageBytes(usedBytes),
    totalFormatted: formatStorageBytes(ESTIMATED_LOCALSTORAGE_LIMIT_BYTES),
    remainingFormatted: formatStorageBytes(remainingBytes),
    status,
    itemCount,
  };
}

/**
 * Memeriksa apakah penambahan data baru aman disimpan ke LocalStorage
 */
export function canSafelyWrite(bytesToAdd: number): { allowed: boolean; reason?: string } {
  const current = getLocalStorageUsage();
  const projectedBytes = current.usedBytes + bytesToAdd;

  if (projectedBytes > ESTIMATED_LOCALSTORAGE_LIMIT_BYTES * 0.95) {
    return {
      allowed: false,
      reason: `Penyimpanan lokal browser hampir penuh (${current.usedFormatted} dari ${current.totalFormatted}). Data tidak dapat disimpan untuk menghindari eror browser. Disarankan menyambungkan Supabase Storage.`,
    };
  }

  return { allowed: true };
}

/**
 * Menulis data ke localStorage dengan pengamanan kuota
 */
export function setItemWithQuotaGuard(key: string, value: string): { success: boolean; error?: string } {
  try {
    const bytesNeeded = (key.length + value.length) * 2;
    const check = canSafelyWrite(bytesNeeded);
    if (!check.allowed) {
      console.warn('[LocalStorageGuard]', check.reason);
      return { success: false, error: check.reason };
    }

    localStorage.setItem(key, value);
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Penyimpanan lokal penuh';
    console.error('[LocalStorageGuard] Gagal menyimpan ke localStorage:', message);
    return { success: false, error: message };
  }
}

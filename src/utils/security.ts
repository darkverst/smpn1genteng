/**
 * Keamanan dan Autentikasi Admin Portal Sekolah
 * Menggunakan Web Crypto API untuk hashing SHA-256 dan Session Token dengan masa kedaluwarsa.
 */

export const HASH_PREFIX = 'sha256:';
export const DEFAULT_SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 Jam
export const SESSION_STORAGE_KEY = 'smpn1_admin_session';
export const AUTH_LEGACY_KEY = 'smpn1_auth';

export interface AdminSession {
  token: string;
  username: string;
  issuedAt: number;
  expiresAt: number;
}

/**
 * Mendapatkan instance SubtleCrypto dari environment runtime (Browser / Node / jsdom)
 */
function getSubtleCrypto(): SubtleCrypto {
  const subtle =
    (typeof window !== 'undefined' && window.crypto?.subtle) ||
    (typeof globalThis !== 'undefined' && globalThis.crypto?.subtle);

  if (!subtle) {
    throw new Error('Web Crypto API (crypto.subtle) tidak tersedia pada environment ini.');
  }

  return subtle;
}

/**
 * Melakukan hashing kata sandi menggunakan SHA-256
 */
export async function hashPassword(plainPassword: string): Promise<string> {
  const subtle = getSubtleCrypto();
  const encoder = new TextEncoder();
  const data = encoder.encode(plainPassword);
  const hashBuffer = await subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  return `${HASH_PREFIX}${hex}`;
}

/**
 * Memeriksa apakah format kata sandi sudah dalam bentuk hash SHA-256
 */
export function isPasswordHashed(password: string): boolean {
  if (!password || typeof password !== 'string') return false;
  if (password.startsWith(HASH_PREFIX)) return true;
  // Deteksi raw 64-karakter hex string
  return /^[a-f0-9]{64}$/i.test(password);
}

/**
 * Memverifikasi input kata sandi dengan kata sandi yang tersimpan.
 * Mendukung backward-compatibility untuk kata sandi plaintext lama,
 * dan menandai `needsUpgrade: true` agar otomatis dimigrasikan ke hash.
 */
export async function verifyPassword(
  inputPassword: string,
  storedPassword: string
): Promise<{ isValid: boolean; needsUpgrade: boolean }> {
  if (!inputPassword || !storedPassword) {
    return { isValid: false, needsUpgrade: false };
  }

  if (isPasswordHashed(storedPassword)) {
    const rawStored = storedPassword.startsWith(HASH_PREFIX)
      ? storedPassword
      : `${HASH_PREFIX}${storedPassword.toLowerCase()}`;
    const hashedInput = await hashPassword(inputPassword);
    return {
      isValid: hashedInput === rawStored,
      needsUpgrade: false,
    };
  }

  // Kasus legacy plaintext: verifikasi langsung
  const isValid = inputPassword === storedPassword;
  return {
    isValid,
    needsUpgrade: isValid, // Jika benar, butuh upgrade ke hash
  };
}

/**
 * Membuat token session unik acak
 */
function generateSessionToken(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `sess_${Date.now()}_${Math.random().toString(36).substring(2, 12)}`;
}

/**
 * Membuat objek sesi admin baru dengan batas masa aktif
 */
export function createAdminSession(
  username: string,
  durationMs = DEFAULT_SESSION_DURATION_MS
): AdminSession {
  const now = Date.now();
  return {
    token: generateSessionToken(),
    username: username.trim(),
    issuedAt: now,
    expiresAt: now + durationMs,
  };
}

/**
 * Mengambil dan memvalidasi sesi admin dari localStorage.
 * Jika sesi telah kedaluwarsa atau rusak, otomatis dihapus dan mengembalikan null.
 */
export function getAdminSession(): AdminSession | null {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) {
      // Periksa fallback legacy jika sesi terstruktur belum ada
      const legacy = localStorage.getItem(AUTH_LEGACY_KEY);
      if (legacy === 'true') {
        // Upgrade transisi sesi lama ke sesi terstruktur 24 jam
        const migratedSession = createAdminSession('admin');
        saveAdminSession(migratedSession);
        return migratedSession;
      }
      return null;
    }

    const session = JSON.parse(raw) as AdminSession;
    if (!session || !session.expiresAt || !session.token) {
      clearAdminSession();
      return null;
    }

    if (Date.now() > session.expiresAt) {
      clearAdminSession();
      return null;
    }

    return session;
  } catch {
    clearAdminSession();
    return null;
  }
}

/**
 * Menyimpan sesi admin ke localStorage
 */
export function saveAdminSession(session: AdminSession): void {
  try {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    localStorage.setItem(AUTH_LEGACY_KEY, 'true');
  } catch {
    // Abaikan jika storage penuh
  }
}

/**
 * Menghapus seluruh status dan data sesi admin (logout)
 */
export function clearAdminSession(): void {
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    localStorage.removeItem(AUTH_LEGACY_KEY);
  } catch {
    // Abaikan error storage
  }
}

/**
 * Memeriksa apakah saat ini ada sesi admin yang sah dan belum kedaluwarsa
 */
export function isSessionValid(): boolean {
  return getAdminSession() !== null;
}

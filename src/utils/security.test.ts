import { describe, expect, it, beforeEach, vi } from 'vitest';
import {
  clearAdminSession,
  createAdminSession,
  getAdminSession,
  hashPassword,
  HASH_PREFIX,
  isPasswordHashed,
  isSessionValid,
  saveAdminSession,
  SESSION_STORAGE_KEY,
  verifyPassword,
} from './security';

describe('security utility', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('hashing dan verifikasi kata sandi', () => {
    it('menghasilkan hash SHA-256 berawalan sha256: dengan panjang karakter tepat', async () => {
      const plain = 'admin123';
      const hashed = await hashPassword(plain);

      expect(hashed.startsWith(HASH_PREFIX)).toBe(true);
      const hex = hashed.replace(HASH_PREFIX, '');
      expect(hex).toHaveLength(64);
      expect(/^[0-9a-f]{64}$/.test(hex)).toBe(true);
    });

    it('mengenali format kata sandi ter-hash dan plaintext dengan tepat', () => {
      expect(isPasswordHashed('admin123')).toBe(false);
      expect(isPasswordHashed('sha256:240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9')).toBe(true);
      expect(isPasswordHashed('240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9')).toBe(true);
    });

    it('memverifikasi kata sandi legacy (plaintext) dan menandai butuh upgrade', async () => {
      const input = 'admin123';
      const stored = 'admin123';

      const result = await verifyPassword(input, stored);
      expect(result.isValid).toBe(true);
      expect(result.needsUpgrade).toBe(true);
    });

    it('menolak kata sandi plaintext yang salah', async () => {
      const result = await verifyPassword('salah', 'admin123');
      expect(result.isValid).toBe(false);
      expect(result.needsUpgrade).toBe(false);
    });

    it('memverifikasi kata sandi ter-hash (SHA-256) dan tidak butuh upgrade', async () => {
      const plain = 'rahasiaSekolah2026';
      const hashed = await hashPassword(plain);

      const result = await verifyPassword(plain, hashed);
      expect(result.isValid).toBe(true);
      expect(result.needsUpgrade).toBe(false);

      const wrongResult = await verifyPassword('rahasiaLain', hashed);
      expect(wrongResult.isValid).toBe(false);
    });
  });

  describe('manajemen sesi admin dengan masa kedaluwarsa', () => {
    it('membuat sesi admin baru dengan durasi yang tepat', () => {
      const session = createAdminSession('superadmin', 60_000);
      expect(session.username).toBe('superadmin');
      expect(session.token).toBeTruthy();
      expect(session.expiresAt).toBeGreaterThan(session.issuedAt);
      expect(session.expiresAt - session.issuedAt).toBe(60_000);
    });

    it('menyimpan dan membaca sesi yang masih aktif', () => {
      const session = createAdminSession('admin');
      saveAdminSession(session);

      expect(isSessionValid()).toBe(true);
      const active = getAdminSession();
      expect(active?.username).toBe('admin');
      expect(active?.token).toBe(session.token);
    });

    it('otomatis membersihkan dan mengembalikan null jika sesi telah kedaluwarsa', () => {
      const now = Date.now();
      const expiredSession = {
        token: 'sess_expired_123',
        username: 'admin',
        issuedAt: now - 100_000,
        expiresAt: now - 1_000, // telah lewat 1 detik
      };

      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(expiredSession));

      expect(isSessionValid()).toBe(false);
      expect(getAdminSession()).toBeNull();
      expect(localStorage.getItem(SESSION_STORAGE_KEY)).toBeNull();
    });

    it('menghapus sesi secara tuntas saat logout', () => {
      const session = createAdminSession('admin');
      saveAdminSession(session);
      expect(isSessionValid()).toBe(true);

      clearAdminSession();
      expect(isSessionValid()).toBe(false);
      expect(getAdminSession()).toBeNull();
    });
  });
});

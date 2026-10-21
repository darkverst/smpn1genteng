import { describe, expect, it, beforeEach } from 'vitest';
import {
  canSafelyWrite,
  ESTIMATED_LOCALSTORAGE_LIMIT_BYTES,
  formatStorageBytes,
  getLocalStorageUsage,
  setItemWithQuotaGuard,
} from './storageQuota';

describe('storageQuota utility', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('formatStorageBytes', () => {
    it('memformat byte menjadi satuan B, KB, MB dengan tepat', () => {
      expect(formatStorageBytes(0)).toBe('0 B');
      expect(formatStorageBytes(512)).toBe('512 B');
      expect(formatStorageBytes(1024)).toBe('1 KB');
      expect(formatStorageBytes(1024 * 1024)).toBe('1 MB');
      expect(formatStorageBytes(5 * 1024 * 1024)).toBe('5 MB');
    });
  });

  describe('getLocalStorageUsage', () => {
    it('mengembalikan status aman saat penyimpanan masih kosong', () => {
      const usage = getLocalStorageUsage();
      expect(usage.usedBytes).toBe(0);
      expect(usage.percentUsed).toBe(0);
      expect(usage.status).toBe('safe');
      expect(usage.remainingBytes).toBe(ESTIMATED_LOCALSTORAGE_LIMIT_BYTES);
    });

    it('menghitung byte terpakai saat ada data di localStorage', () => {
      localStorage.setItem('testKey', 'hello world');
      const usage = getLocalStorageUsage();
      expect(usage.usedBytes).toBeGreaterThan(0);
      expect(usage.itemCount).toBe(1);
    });
  });

  describe('canSafelyWrite & setItemWithQuotaGuard', () => {
    it('mengizinkan penulisan jika ukuran data masih wajar', () => {
      const result = setItemWithQuotaGuard('normalKey', 'konten wajar');
      expect(result.success).toBe(true);
      expect(localStorage.getItem('normalKey')).toBe('konten wajar');
    });

    it('menolak penulisan data masif yang melebihi ambang batas kapasitas', () => {
      // Periksa batas sebelum menulis
      const check = canSafelyWrite(6 * 1024 * 1024); // 6 MB (lebih dari batas 5MB)
      expect(check.allowed).toBe(false);
      expect(check.reason).toContain('hampir penuh');
    });
  });
});

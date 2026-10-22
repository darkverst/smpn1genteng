import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

class MockStorage implements Storage {
  private store = new Map<string, string>();

  get length(): number {
    return this.store.size;
  }

  clear(): void {
    this.store.clear();
  }

  getItem(key: string): string | null {
    return this.store.has(key) ? this.store.get(key)! : null;
  }

  key(index: number): string | null {
    const keys = Array.from(this.store.keys());
    return keys[index] ?? null;
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  setItem(key: string, value: string): void {
    this.store.set(key, String(value));
  }
}

// Pastikan Web Crypto API & Web Storage tersedia di environment jsdom / Node 22+ & 26+
if (typeof window !== 'undefined') {
  if (!window.crypto) {
    (window as unknown as { crypto: Crypto }).crypto = globalThis.crypto;
  } else if (!window.crypto.subtle && globalThis.crypto?.subtle) {
    Object.defineProperty(window.crypto, 'subtle', {
      value: globalThis.crypto.subtle,
      writable: true,
      configurable: true,
    });
  }

  const mockLocal = new MockStorage();
  const mockSession = new MockStorage();

  Object.defineProperty(window, 'localStorage', {
    value: mockLocal,
    writable: true,
    configurable: true,
  });

  Object.defineProperty(window, 'sessionStorage', {
    value: mockSession,
    writable: true,
    configurable: true,
  });

  vi.stubGlobal('localStorage', mockLocal);
  vi.stubGlobal('sessionStorage', mockSession);
}

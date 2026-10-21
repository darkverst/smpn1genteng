import '@testing-library/jest-dom/vitest';

// Pastikan Web Crypto API tersedia di environment jsdom
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
}


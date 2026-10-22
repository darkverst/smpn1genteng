import { describe, it, expect } from 'vitest';
import { sanitizeHtml } from './sanitizeHtml';

describe('sanitizeHtml utility', () => {
  it('mengembalikan string kosong jika input null, undefined, atau bukan string', () => {
    expect(sanitizeHtml(null)).toBe('');
    expect(sanitizeHtml(undefined)).toBe('');
    expect(sanitizeHtml('')).toBe('');
    // @ts-expect-error test invalid type
    expect(sanitizeHtml(123)).toBe('');
  });

  it('mempertahankan elemen teks dan formatting aman', () => {
    const safeHtml = '<p>Selamat datang di <strong>Portal Sekolah</strong>. Kunjungi <a href="https://kemdikbud.go.id">Kemdikbud</a>.</p>';
    const result = sanitizeHtml(safeHtml);
    expect(result).toContain('<p>');
    expect(result).toContain('<strong>Portal Sekolah</strong>');
    expect(result).toContain('href="https://kemdikbud.go.id"');
  });

  it('menghapus tag script berbahaya secara tuntas', () => {
    const malicious = '<p>Halo</p><script>alert("XSS Attack!")</script><p>Dunia</p>';
    const result = sanitizeHtml(malicious);
    expect(result).not.toContain('<script');
    expect(result).not.toContain('alert(');
    expect(result).toContain('<p>Halo</p>');
    expect(result).toContain('<p>Dunia</p>');
  });

  it('menghapus event handler berbahaya seperti onerror dan onclick', () => {
    const maliciousImg = '<img src="invalid.jpg" onerror="alert(document.cookie)" alt="Foto">';
    const result = sanitizeHtml(maliciousImg);
    expect(result).not.toContain('onerror');
    expect(result).not.toContain('alert');
    expect(result).toContain('<img');
    expect(result).toContain('alt="Foto"');
  });

  it('menetralkan tautan dengan skema javascript:', () => {
    const maliciousLink = '<a href="javascript:void(fetch(\'https://hacker.com\'))">Klik Disini</a>';
    const result = sanitizeHtml(maliciousLink);
    expect(result).not.toContain('javascript:');
    expect(result).not.toContain('hacker.com');
  });

  it('menambahkan rel="noopener noreferrer" pada link dengan target="_blank"', () => {
    const externalLink = '<a href="https://sekolah.sch.id" target="_blank">Web Resmi</a>';
    const result = sanitizeHtml(externalLink);
    expect(result).toContain('rel="noopener noreferrer"');
  });
});

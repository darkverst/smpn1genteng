import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import SEOHead from './SEOHead';

const mockUseApp = vi.fn();

vi.mock('../context/AppContext', () => ({
  useApp: () => mockUseApp(),
}));

describe('SEOHead dynamic favicon', () => {
  beforeEach(() => {
    // Reset head links
    document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]').forEach(el => el.remove());
    mockUseApp.mockReturnValue({
      seoData: {
        metaTitle: 'Portal Sekolah',
        metaDescription: 'Deskripsi Sekolah',
        metaKeywords: 'sekolah',
        ogImage: '',
      },
      schoolIdentity: {
        schoolLogo: '',
      },
      brandSettings: {
        schoolLogo: '',
      },
    });
  });

  it('memperbarui favicon saat schoolIdentity.schoolLogo tersedia', () => {
    const testLogo = 'https://example.com/logo-sekolah.png';
    mockUseApp.mockReturnValue({
      seoData: {
        metaTitle: 'Portal Sekolah',
        metaDescription: 'Deskripsi Sekolah',
        metaKeywords: 'sekolah',
        ogImage: '',
      },
      schoolIdentity: {
        schoolLogo: testLogo,
      },
      brandSettings: {
        schoolLogo: '',
      },
    });

    render(<SEOHead />);

    const iconLink = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
    const shortcutLink = document.querySelector('link[rel="shortcut icon"]') as HTMLLinkElement;
    const appleIconLink = document.querySelector('link[rel="apple-touch-icon"]') as HTMLLinkElement;

    expect(iconLink).not.toBeNull();
    expect(iconLink?.href).toBe(testLogo);
    expect(shortcutLink?.href).toBe(testLogo);
    expect(appleIconLink?.href).toBe(testLogo);
  });

  it('menggunakan brandSettings.schoolLogo jika schoolIdentity belum diset', () => {
    const brandLogo = 'data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=';
    mockUseApp.mockReturnValue({
      seoData: {
        metaTitle: 'Portal Sekolah',
        metaDescription: 'Deskripsi',
        metaKeywords: 'sekolah',
        ogImage: '',
      },
      schoolIdentity: {
        schoolLogo: '',
      },
      brandSettings: {
        schoolLogo: brandLogo,
      },
    });

    render(<SEOHead />);

    const iconLink = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
    expect(iconLink).not.toBeNull();
    expect(iconLink?.getAttribute('href')).toBe(brandLogo);
    expect(iconLink?.getAttribute('type')).toBe('image/svg+xml');
  });
});

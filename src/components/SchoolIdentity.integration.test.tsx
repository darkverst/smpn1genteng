import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Navbar from './Navbar';
import Footer from './Footer';

const mockUseApp = vi.fn();

vi.mock('../context/AppContext', () => ({
  useApp: () => mockUseApp(),
}));

const baseIdentity = {
  schemaVersion: 1,
  revision: 1,
  updatedAt: '2026-04-17T08:00:00.000Z',
  schoolName: 'SMP Negeri Test',
  schoolShortName: 'SMPN Test',
  schoolTagline: 'Kabupaten Test',
  legalName: 'SMP Negeri Test Kabupaten',
  schoolLogo: '',
  showLogo: true,
  footerDescription: 'Sekolah pengujian identitas terpusat.',
  address: 'Jl. Test No. 1',
  phone: '(0333) 123456',
  email: 'info@test.sch.id',
  hours: 'Senin - Jumat',
  mapQuery: 'SMP Negeri Test',
  mapEmbedUrl: '',
  mapDirectionsUrl: '',
  facebook: 'https://facebook.com/test',
  instagram: 'https://instagram.com/test',
  youtube: 'https://youtube.com/test',
  primaryColor: '#0f766e',
  secondaryColor: '#0f5aa6',
  accentColor: '#f59e0b',
  footerBackgroundColor: '#082f49',
  legalNotice: 'Website resmi sekolah',
  copyrightText: '',
  showCurrentYear: true,
  developerName: 'Tim QA',
  developerUrl: 'https://qa.test',
};

function renderHeaderFooter() {
  return render(
    <MemoryRouter>
      <Navbar />
      <Footer />
    </MemoryRouter>,
  );
}

describe('School identity integration', () => {
  beforeEach(() => {
    mockUseApp.mockReturnValue({
      isLoggedIn: false,
      smpbButton: {
        isActive: false,
        year: '2026',
        link: '',
        openInNewTab: true,
      },
      schoolIdentity: baseIdentity,
    });
  });

  it('menampilkan nama sekolah dan informasi footer dari konfigurasi identitas terpusat', () => {
    renderHeaderFooter();

    expect(screen.getAllByText('SMPN Test').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Kabupaten Test').length).toBeGreaterThan(0);
    expect(screen.getByText('Sekolah pengujian identitas terpusat.')).toBeInTheDocument();
    expect(screen.getByText(/SMP Negeri Test Kabupaten/)).toBeInTheDocument();
    expect(screen.getByText(/Website resmi sekolah/)).toBeInTheDocument();
  });

  it('tetap stabil saat identitas dan tema diganti lalu komponen dirender ulang', () => {
    const view = renderHeaderFooter();

    mockUseApp.mockReturnValue({
      isLoggedIn: false,
      smpbButton: {
        isActive: false,
        year: '2026',
        link: '',
        openInNewTab: true,
      },
      schoolIdentity: {
        ...baseIdentity,
        schoolName: 'SMP Negeri Rebranding',
        schoolShortName: 'SMPN Rebranding',
        schoolTagline: 'Kabupaten Baru',
        footerBackgroundColor: '#111827',
        primaryColor: '#7c3aed',
      },
    });

    view.rerender(
      <MemoryRouter>
        <Navbar />
        <Footer />
      </MemoryRouter>,
    );

    expect(screen.getAllByText('SMPN Rebranding').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Kabupaten Baru').length).toBeGreaterThan(0);
  });
});

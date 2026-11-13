import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import SambutanSection from './SambutanSection';
import { initialProfileData, initialStatsData, initialSchoolIdentitySettings, SambutanStyle } from '../types';

const mockProfile = {
  ...initialProfileData,
  namaKepsek: 'Dr. H. Ahmad Fauzi, M.Pd.',
  jabatanKepsek: 'Kepala Sekolah',
  sambutanKepsek: '<p>Selamat datang di portal resmi sekolah unggulan kami.</p>',
};

const mockIdentity = {
  ...initialSchoolIdentitySettings,
  schoolName: 'SMA Negeri 1 Prestasi',
};

vi.mock('../context/AppContext', () => ({
  useApp: () => ({
    profileData: mockProfile,
    statsData: initialStatsData,
    schoolIdentity: mockIdentity,
    isLoggedIn: false,
    updateSchoolIdentity: vi.fn().mockReturnValue({ success: true, errors: [] }),
  }),
}));

describe('SambutanSection Component', () => {
  it('dapat menampilkan variasi default modern-card dengan data kepala sekolah', () => {
    render(
      <SambutanSection
        profileData={mockProfile}
        statsData={initialStatsData}
        schoolIdentity={mockIdentity}
        isAdmin={false}
      />
    );

    expect(screen.getAllByText('Dr. H. Ahmad Fauzi, M.Pd.')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Kepala Sekolah')[0]).toBeInTheDocument();
    expect(screen.getByText(/Selamat datang di portal resmi sekolah unggulan kami/i)).toBeInTheDocument();
  });

  const styles: SambutanStyle[] = [
    'modern-card',
    'executive-split',
    'quote-focus',
    'framed-academic',
    'glass-float',
    'overlap-banner',
  ];

  styles.forEach((style) => {
    it(`dapat merender variasi style "${style}" tanpa runtime error`, () => {
      const { container } = render(
        <SambutanSection
          styleOverride={style}
          profileData={mockProfile}
          statsData={initialStatsData}
          schoolIdentity={mockIdentity}
          isAdmin={false}
        />
      );

      const nameElements = screen.getAllByText('Dr. H. Ahmad Fauzi, M.Pd.');
      expect(nameElements.length).toBeGreaterThan(0);
      expect(container.querySelector('.profile-content')).toBeInTheDocument();
    });
  });

  it('tidak menampilkan bilah switcher preview cepat jika pengunjung bukan admin', () => {
    render(
      <SambutanSection
        profileData={mockProfile}
        statsData={initialStatsData}
        schoolIdentity={mockIdentity}
        isAdmin={false}
      />
    );

    expect(screen.queryByText(/Mode Admin: Pratinjau Tampilan Sambutan/i)).not.toBeInTheDocument();
  });

  it('menampilkan bilah switcher preview cepat jika admin sedang login dan dapat mengganti variasi', () => {
    render(
      <SambutanSection
        profileData={mockProfile}
        statsData={initialStatsData}
        schoolIdentity={mockIdentity}
        isAdmin={true}
      />
    );

    expect(screen.getByText(/Mode Admin: Pratinjau Tampilan Sambutan/i)).toBeInTheDocument();

    // Click Executive button
    const executiveBtn = screen.getByRole('button', { name: /Executive Split/i });
    fireEvent.click(executiveBtn);

    // Should switch to executive split layout containing "Amanat & Pesan Pimpinan"
    expect(screen.getByText(/Amanat & Pesan Pimpinan/i)).toBeInTheDocument();
  });
});

import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import Home from './Home';
import { SliderItem } from '../types';

const mockSliderItems: SliderItem[] = [
  {
    id: 'slide-1',
    title: 'Slide Gambar dengan Opasitas Kustom 35%',
    subtitle: 'Subtitle Slide 1',
    image: 'https://example.com/slide1.jpg',
    backgroundColor: '#0f766e',
    buttonText: 'Pelajari Lebih Lanjut',
    buttonLink: '/profil',
    overlayOpacity: 35,
  },
  {
    id: 'slide-2',
    title: 'Slide Gambar Default Opasitas',
    subtitle: 'Subtitle Slide 2',
    image: 'https://example.com/slide2.jpg',
    backgroundColor: '#16a34a',
    buttonText: 'Daftar',
    buttonLink: '/kontak',
    // overlayOpacity undefined -> should default to 70% (0.7)
  },
  {
    id: 'slide-3',
    title: 'Poster Banner PPDB Visual',
    subtitle: 'Subtitle ini harus disembunyikan',
    image: 'https://example.com/slide3-poster.jpg',
    backgroundColor: '#0f766e',
    buttonText: '',
    buttonLink: '/kontak',
    showText: false,
    // overlayOpacity undefined + showText false -> should default to 0% (0)
  },
];

vi.mock('../context/AppContext', () => ({
  useApp: () => ({
    news: [],
    agenda: [],
    sliderItems: mockSliderItems,
    extracurricular: [],
    sponsorsData: {
      showSection: false,
      sponsors: [],
    },
    profileData: {
      about: 'Tentang Sekolah Kami',
      visi: 'Visi Sekolah',
      misi: [],
      sambutanKepsek: 'Sambutan',
      namaKepsek: 'Kepala Sekolah',
      jabatanKepsek: 'Kepala Madrasah',
      fotoKepsek: '',
    },
    statsData: {
      siswaAktif: '180+',
      tenagaPendidik: '18',
      prestasi: '50+',
      akreditasi: 'C',
    },
    instagramSettings: {
      enabled: false,
      posts: [],
    },
    schoolIdentity: {
      schoolName: 'Portal Sekolah',
      schoolShortName: 'Sekolah',
      primaryColor: '#0f766e',
      secondaryColor: '#0f5aa6',
      accentColor: '#f59e0b',
      footerBackgroundColor: '#082f49',
    },
    trackEvent: vi.fn(),
  }),
}));

describe('Home Slider Overlay Transparency', () => {
  it('menerapkan opasitas overlay kustom pada slide gambar', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    // Slide 1 has overlayOpacity: 35
    const overlay1 = screen.getByTestId('slider-overlay-slide-1');
    expect(overlay1).toBeInTheDocument();
    expect(overlay1.style.opacity).toBe('0.35');

    // Slide 2 has undefined overlayOpacity -> defaults to 70% (0.7)
    const overlay2 = screen.getByTestId('slider-overlay-slide-2');
    expect(overlay2).toBeInTheDocument();
    expect(overlay2.style.opacity).toBe('0.7');

    // Slide 3 has undefined overlayOpacity + showText: false -> defaults to 0% (0)
    const overlay3 = screen.getByTestId('slider-overlay-slide-3');
    expect(overlay3).toBeInTheDocument();
    expect(overlay3.style.opacity).toBe('0');
  });

  it('menampilkan judul dan tombol slide pertama', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    expect(screen.getByText('Slide Gambar dengan Opasitas Kustom 35%')).toBeInTheDocument();
    expect(screen.getByText('Pelajari Lebih Lanjut')).toBeInTheDocument();
  });

  it('menyembunyikan teks dan subtitle ketika slide berstatus hanya gambar (showText: false)', () => {
    // Render with only slide-3 active
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    // Slide-3 title and subtitle should not be rendered on the active slide-1 view
    expect(screen.queryByText('Subtitle ini harus disembunyikan')).not.toBeInTheDocument();
  });
});

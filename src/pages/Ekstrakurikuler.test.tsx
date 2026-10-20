import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import Ekstrakurikuler from './Ekstrakurikuler';
import { ExtracurricularItem } from '../types';

const sampleEskul: ExtracurricularItem[] = [
  {
    id: 'eskul-1',
    name: 'Pramuka Sekolah',
    category: 'Kepanduan',
    description: 'Gerakan Pramuka Gugus Depan Sekolah',
    schedule: 'Jumat, 14:00 - 16:30 WIB',
    location: 'Lapangan Utama',
    coach: 'Kak Ahmad S.Pd',
    image: '',
    achievements: ['Juara 1 Lomba Pionering 2024'],
    isActive: true,
    order: 1,
  },
  {
    id: 'eskul-2',
    name: 'Paduan Suara & Musik',
    category: 'Keagamaan',
    description: 'Seni musik paduan suara dan instrumen',
    schedule: 'Rabu, 15:00 - 17:00 WIB',
    location: 'Aula Sekolah',
    coach: 'Kak Ridwan',
    image: '',
    achievements: ['Juara Umum Festival Seni se-Kabupaten'],
    isActive: true,
    order: 2,
  },
  {
    id: 'eskul-3',
    name: 'Futsal Club',
    category: 'Olahraga',
    description: 'Klub futsal pembinaan bakat olahraga',
    schedule: 'Sabtu, 07:30 - 10:00 WIB',
    location: 'Lapangan Futsal',
    coach: 'Coach Dimas',
    image: '',
    achievements: [],
    isActive: false, // Inactive should be hidden from public
    order: 3,
  },
];

vi.mock('../context/AppContext', () => ({
  useApp: () => ({
    extracurricular: sampleEskul,
    schoolIdentity: {
      schoolName: 'Portal Sekolah',
      schoolShortName: 'Sekolah',
    },
  }),
}));

describe('Ekstrakurikuler Page', () => {
  it('hanya menampilkan ekstrakurikuler yang berstatus aktif', () => {
    render(
      <MemoryRouter>
        <Ekstrakurikuler />
      </MemoryRouter>
    );

    expect(screen.getByText('Pramuka Sekolah')).toBeInTheDocument();
    expect(screen.getByText('Paduan Suara & Musik')).toBeInTheDocument();
    expect(screen.queryByText('Futsal Club')).not.toBeInTheDocument();
  });

  it('memfilter ekstrakurikuler berdasarkan kategori', () => {
    render(
      <MemoryRouter>
        <Ekstrakurikuler />
      </MemoryRouter>
    );

    // Click 'Keagamaan' tab button
    const keagamaanButtons = screen.getAllByRole('button', { name: /Keagamaan/i });
    fireEvent.click(keagamaanButtons[0]);

    expect(screen.getByText('Paduan Suara & Musik')).toBeInTheDocument();
    expect(screen.queryByText('Pramuka Sekolah')).not.toBeInTheDocument();
  });

  it('memfilter ekstrakurikuler berdasarkan input pencarian', () => {
    render(
      <MemoryRouter>
        <Ekstrakurikuler />
      </MemoryRouter>
    );

    const searchInput = screen.getByPlaceholderText(/Cari eskul/i);
    fireEvent.change(searchInput, { target: { value: 'Pramuka' } });

    expect(screen.getByText('Pramuka Sekolah')).toBeInTheDocument();
    expect(screen.queryByText('Paduan Suara & Musik')).not.toBeInTheDocument();
  });

  it('membuka modal detail saat tombol detail diklik', () => {
    render(
      <MemoryRouter>
        <Ekstrakurikuler />
      </MemoryRouter>
    );

    const detailButtons = screen.getAllByText(/Lihat Detail Eskul/i);
    fireEvent.click(detailButtons[0]);

    // Check modal contents
    expect(screen.getByText('Jadwal:')).toBeInTheDocument();
    expect(screen.getByText('Lokasi:')).toBeInTheDocument();
    expect(screen.getByText('Pembina / Pelatih:')).toBeInTheDocument();
  });
});

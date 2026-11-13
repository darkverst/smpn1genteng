import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import Tautan from './Tautan';
import { ExternalLink } from '../types';

const sampleLinks: ExternalLink[] = [
  {
    id: 'link-1',
    title: 'Dinas Pendidikan Kab. Banyuwangi',
    url: 'https://disdik.banyuwangikab.go.id',
    description: 'Portal resmi Dinas Pendidikan Banyuwangi',
    category: 'Pemerintah & Dinas',
    badge: 'Resmi',
    openInNewTab: true,
    isActive: true,
    order: 1,
  },
  {
    id: 'link-2',
    title: 'Portal CBT / E-Learning',
    url: 'https://cbt.sekolah.sch.id',
    description: 'Ujian Berbasis Komputer & Bahan Ajar Online',
    category: 'Akademik & Belajar',
    badge: 'Siswa',
    openInNewTab: true,
    isActive: true,
    order: 2,
  },
  {
    id: 'link-3',
    title: 'Situs Arsip Lama (Non-aktif)',
    url: 'https://archive.sekolah.sch.id',
    description: 'Situs lama yang sudah tidak aktif',
    category: 'Sub-Web Sekolah',
    openInNewTab: false,
    isActive: false, // Inactive
    order: 3,
  },
];

vi.mock('../context/AppContext', () => ({
  useApp: () => ({
    externalLinks: sampleLinks,
    schoolIdentity: {
      schoolName: 'Portal Sekolah Model',
      schoolShortName: 'Sekolah Model',
      buttonStyle: 'rounded',
      iconStyle: 'rounded',
    },
  }),
}));

describe('Tautan Page', () => {
  beforeEach(() => {
    // Mock navigator.clipboard
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockImplementation(() => Promise.resolve()),
      },
    });
  });

  it('hanya menampilkan tautan eksternal yang aktif', () => {
    render(
      <MemoryRouter>
        <Tautan />
      </MemoryRouter>
    );

    expect(screen.getByText('Dinas Pendidikan Kab. Banyuwangi')).toBeInTheDocument();
    expect(screen.getByText('Portal CBT / E-Learning')).toBeInTheDocument();
    expect(screen.queryByText('Situs Arsip Lama (Non-aktif)')).not.toBeInTheDocument();
  });

  it('memfilter tautan berdasarkan kategori yang dipilih', () => {
    render(
      <MemoryRouter>
        <Tautan />
      </MemoryRouter>
    );

    // Click category 'Akademik & Belajar'
    const catButton = screen.getByRole('button', { name: /Akademik & Belajar/i });
    fireEvent.click(catButton);

    expect(screen.getByText('Portal CBT / E-Learning')).toBeInTheDocument();
    expect(screen.queryByText('Dinas Pendidikan Kab. Banyuwangi')).not.toBeInTheDocument();
  });

  it('memfilter tautan berdasarkan kata kunci pencarian', () => {
    render(
      <MemoryRouter>
        <Tautan />
      </MemoryRouter>
    );

    const searchInput = screen.getByPlaceholderText(/Cari portal atau layanan/i);
    fireEvent.change(searchInput, { target: { value: 'Banyuwangi' } });

    expect(screen.getByText('Dinas Pendidikan Kab. Banyuwangi')).toBeInTheDocument();
    expect(screen.queryByText('Portal CBT / E-Learning')).not.toBeInTheDocument();
  });

  it('memastikan link eksternal memiliki atribut rel="noopener noreferrer" dan target="_blank"', () => {
    render(
      <MemoryRouter>
        <Tautan />
      </MemoryRouter>
    );

    const linkButtons = screen.getAllByRole('link', { name: /Buka Website Resmi/i });
    expect(linkButtons.length).toBe(2);

    expect(linkButtons[0]).toHaveAttribute('href', 'https://disdik.banyuwangikab.go.id');
    expect(linkButtons[0]).toHaveAttribute('target', '_blank');
    expect(linkButtons[0]).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('menampilkan fallback ketika tidak ada tautan yang cocok', () => {
    render(
      <MemoryRouter>
        <Tautan />
      </MemoryRouter>
    );

    const searchInput = screen.getByPlaceholderText(/Cari portal atau layanan/i);
    fireEvent.change(searchInput, { target: { value: 'ZzzNonExistentKeyword' } });

    expect(screen.getByText('Tautan Tidak Ditemukan')).toBeInTheDocument();

    const resetButton = screen.getByRole('button', { name: /Reset Pencarian/i });
    fireEvent.click(resetButton);

    expect(screen.getByText('Dinas Pendidikan Kab. Banyuwangi')).toBeInTheDocument();
  });
});

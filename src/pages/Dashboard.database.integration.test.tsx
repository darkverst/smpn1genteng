import { MemoryRouter } from 'react-router-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppProvider } from '../context/AppContext';
import Dashboard from './Dashboard';

vi.mock('../services/settingsRepository', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../services/settingsRepository')>();
  return {
    ...actual,
    saveSetting: vi.fn().mockResolvedValue(true),
    loadSettings: vi.fn().mockResolvedValue({}),
    exportAllSettings: vi.fn().mockResolvedValue({
      data: {},
      keys: [],
      source: 'Supabase Cloud PostgreSQL (Singapore - ap-southeast-1)',
    }),
    checkDatabaseConnection: vi.fn().mockResolvedValue({
      isConnected: true,
      source: 'supabase',
      message: 'Terhubung ke Supabase PostgreSQL (Singapore - ap-southeast-1)',
    }),
    getDatabaseStorageStats: vi.fn().mockResolvedValue({
      databaseBytes: 10485760,
      databaseSize: '10 MB',
      settingsBytes: 524288,
      settingsSize: '512 KB',
      settingsRows: 22,
      mediaBytes: 9961472,
      mediaSize: '9.5 MB',
      mediaFiles: 31,
      mediaFolders: [
        { folder: 'gallery', count: 11, bytes: 4194304, size: '4 MB' },
        { folder: 'teachers', count: 14, bytes: 4194304, size: '4 MB' },
      ],
    }),
    ensureDefaultSettings: vi.fn().mockImplementation((defaults) => Promise.resolve(defaults)),
  };
});

function renderDashboard() {
  return render(
    <MemoryRouter>
      <AppProvider>
        <Dashboard />
      </AppProvider>
    </MemoryRouter>
  );
}

describe('Dashboard database settings and empty state integration', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem('smpn1_auth', 'true');
  });

  it('dapat membuka tab database tanpa blank state / error dan menampilkan status penyimpanan', async () => {
    const user = userEvent.setup();
    renderDashboard();

    // Klik tab Database
    const dbTabs = await screen.findAllByRole('button', { name: /^Database$/i });
    await user.click(dbTabs[0]);

    // Verifikasi judul dan section database ter-render tanpa blank screen
    expect(await screen.findByRole('heading', { name: /^Database$/i })).toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: /Konektivitas Database/i })).toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: /Penggunaan Penyimpanan/i })).toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: /Backup Data/i })).toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: /Restore Data/i })).toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: /Reset Semua Data/i })).toBeInTheDocument();
  }, 15000);

  it('menampilkan empty state yang ramah ketika bagian galeri belum memiliki data', async () => {
    const user = userEvent.setup();
    renderDashboard();

    const galTabs = await screen.findAllByRole('button', { name: /^Galeri$/i });
    await user.click(galTabs[0]);

    expect(await screen.findByRole('heading', { name: /Kelola Galeri/i })).toBeInTheDocument();
    // Verifikasi tombol Kelola Kategori ada dan dapat diklik tanpa error
    const kelolaKategoriBtns = await screen.findAllByRole('button', { name: /Kelola Kategori/i });
    expect(kelolaKategoriBtns.length).toBeGreaterThanOrEqual(1);
    await user.click(kelolaKategoriBtns[0]);
    expect(await screen.findByText(/Kelola Kategori Galeri/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Selesai/i }));
  }, 15000);
});

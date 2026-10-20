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

describe('Dashboard slider editing integration', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem('smpn1_auth', 'true');
  });

  it('dapat menambah slide baru lalu mengedit dan memperbarui slide tanpa error', async () => {
    const user = userEvent.setup();
    renderDashboard();

    // 1. Pindah ke tab Slider
    const sliderTabs = await screen.findAllByRole('button', { name: /^Slider$/i });
    await user.click(sliderTabs[0]);

    // 2. Verifikasi tab header sudah aktif
    expect(await screen.findByRole('heading', { name: /Kelola Slider Hero/i })).toBeInTheDocument();

    // 3. Tambah Slide Baru
    const tambahButton = screen.getByRole('button', { name: /Tambah Slide/i });
    await user.click(tambahButton);

    expect(await screen.findByRole('heading', { name: 'Tambah Slide' })).toBeInTheDocument();

    // Coba simpan saat judul kosong untuk verifikasi validasi
    const simpanButton = screen.getByRole('button', { name: /Simpan/i });
    await user.click(simpanButton);
    expect(await screen.findByText(/Judul slide wajib diisi/i)).toBeInTheDocument();

    const inputJudul = screen.getByPlaceholderText(/Contoh: Berilmu, Beramal, Bertakwa|Contoh: Banner Brosur PPDB/i);
    await user.type(inputJudul, 'Slide Pertama Kami');
    await user.click(simpanButton);

    // Verifikasi slide baru sudah masuk ke daftar
    expect(await screen.findByText('Slide Pertama Kami')).toBeInTheDocument();

    // 4. Klik tombol Edit slide yang baru dibuat
    const editButton = await screen.findByRole('button', { name: /Edit slide Slide Pertama Kami/i });
    await user.click(editButton);

    // 5. Verifikasi modal terbuka dengan mode Edit Slide
    expect(await screen.findByRole('heading', { name: 'Edit Slide' })).toBeInTheDocument();

    // 6. Ubah judul slide
    const editJudulInput = screen.getByPlaceholderText(/Contoh: Berilmu, Beramal, Bertakwa|Contoh: Banner Brosur PPDB/i);
    await user.clear(editJudulInput);
    await user.type(editJudulInput, 'Slide Hasil Edit Berhasil');

    // Ubah ke mode 'Hanya Gambar'
    const modeHanyaGambarBtn = screen.getByRole('button', { name: /Hanya Gambar/i });
    await user.click(modeHanyaGambarBtn);

    // Simpan perubahan
    const simpanEditBtn = screen.getByRole('button', { name: /Simpan/i });
    await user.click(simpanEditBtn);

    // 7. Verifikasi modal tertutup dan perubahan ter-render
    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: 'Edit Slide' })).not.toBeInTheDocument();
    });

    expect(await screen.findByText('Slide Hasil Edit Berhasil')).toBeInTheDocument();
    expect(screen.getByText(/Hanya Gambar/i)).toBeInTheDocument();
    expect(screen.getByText(/Tersimpan!/i)).toBeInTheDocument();
  }, 15000);
});

import { MemoryRouter } from 'react-router-dom';
import { render, screen, waitFor, within } from '@testing-library/react';
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

describe('Dashboard sponsors integration', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem('smpn1_auth', 'true');
  });

  it('dapat menambah sponsor baru lalu menghapusnya kembali', async () => {
    const user = userEvent.setup();
    renderDashboard();

    const sponsorTabs = await screen.findAllByRole('button', { name: /Sponsor\/Mitra/i });
    await user.click(sponsorTabs[0]);

    await user.click(screen.getByRole('button', { name: /Tambah Sponsor/i }));

    await user.type(screen.getByLabelText(/Nama Sponsor/i), 'Mitra QA Otomasi');
    await user.type(screen.getByLabelText(/URL Website/i), 'https://mitra-qa.test');
    await user.click(screen.getByRole('button', { name: /Simpan Sponsor/i }));

    await screen.findByText('Mitra QA Otomasi');

    const row = screen.getByText('Mitra QA Otomasi').closest('tr');
    expect(row).not.toBeNull();
    await user.click(within(row as HTMLTableRowElement).getByRole('button', { name: /Hapus sponsor Mitra QA Otomasi/i }));
    await user.click(screen.getByRole('button', { name: /^Hapus$/i }));

    await waitFor(() => {
      expect(screen.queryByText('Mitra QA Otomasi')).not.toBeInTheDocument();
    });
  }, 15000);
});

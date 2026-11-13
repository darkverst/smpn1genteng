import { describe, expect, it, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { AppProvider } from '../context/AppContext';
import { createAdminSession, saveAdminSession, SESSION_STORAGE_KEY } from '../utils/security';

vi.mock('../services/settingsRepository', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../services/settingsRepository')>();
  return {
    ...actual,
    ensureDefaultSettings: vi.fn().mockResolvedValue({}),
    loadSettings: vi.fn().mockResolvedValue({}),
  };
});

function renderWithRouter(initialRoute = '/dashboard') {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <AppProvider>
        <Routes>
          <Route path="/login" element={<div data-testid="login-page">Halaman Login</div>} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <div data-testid="dashboard-content">Konten Dashboard Rahasia</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AppProvider>
    </MemoryRouter>
  );
}

describe('ProtectedRoute component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('mengalihkan pengguna yang belum login ke /login', async () => {
    renderWithRouter('/dashboard');
    expect(await screen.findByTestId('login-page')).toBeInTheDocument();
    expect(screen.queryByTestId('dashboard-content')).not.toBeInTheDocument();
  });

  it('mengizinkan akses ke dashboard jika sesi admin valid dan aktif', async () => {
    const session = createAdminSession('admin');
    saveAdminSession(session);

    renderWithRouter('/dashboard');
    expect(await screen.findByTestId('dashboard-content')).toBeInTheDocument();
    expect(screen.queryByTestId('login-page')).not.toBeInTheDocument();
  });

  it('mengalihkan ke /login jika token sesi telah kedaluwarsa', async () => {
    const expiredSession = {
      token: 'sess_expired_test',
      username: 'admin',
      issuedAt: Date.now() - 200_000,
      expiresAt: Date.now() - 1_000,
    };
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(expiredSession));

    renderWithRouter('/dashboard');
    expect(await screen.findByTestId('login-page')).toBeInTheDocument();
    expect(screen.queryByTestId('dashboard-content')).not.toBeInTheDocument();
  });
});

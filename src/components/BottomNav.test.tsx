import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import BottomNav from './BottomNav';
import { BottomNavStyle } from '../types';

let mockBottomNavStyle: BottomNavStyle = 'floating';
let mockIsLoggedIn = false;

vi.mock('../context/AppContext', () => ({
  useApp: () => ({
    isLoggedIn: mockIsLoggedIn,
    schoolIdentity: {
      schoolName: 'Portal Sekolah',
      bottomNavStyle: mockBottomNavStyle,
    },
  }),
}));

describe('BottomNav component', () => {
  it('menampilkan navigasi utama dan tombol lainnya', () => {
    mockBottomNavStyle = 'floating';
    render(
      <MemoryRouter initialEntries={['/']}>
        <BottomNav />
      </MemoryRouter>
    );

    expect(screen.getByText('Beranda')).toBeInTheDocument();
    expect(screen.getByText('Berita')).toBeInTheDocument();
    expect(screen.getByText('Agenda')).toBeInTheDocument();
    expect(screen.getByText('Lainnya')).toBeInTheDocument();

    const nav = screen.getByTestId('bottom-nav-container');
    expect(nav).toHaveAttribute('data-nav-style', 'floating');
  });

  it('mendukung berbagai variasi model bottom navigation (classic, dock, minimal, glass)', () => {
    const styles: BottomNavStyle[] = ['classic', 'dock', 'minimal', 'glass'];

    for (const style of styles) {
      mockBottomNavStyle = style;
      const { unmount } = render(
        <MemoryRouter initialEntries={['/']}>
          <BottomNav />
        </MemoryRouter>
      );

      const nav = screen.getByTestId('bottom-nav-container');
      expect(nav).toHaveAttribute('data-nav-style', style);
      unmount();
    }
  });

  it('dapat membuka dan menutup drawer menu Lainnya', () => {
    mockBottomNavStyle = 'dock';
    mockIsLoggedIn = false;
    render(
      <MemoryRouter initialEntries={['/']}>
        <BottomNav />
      </MemoryRouter>
    );

    expect(screen.queryByTestId('bottom-nav-drawer')).not.toBeInTheDocument();

    const moreButton = screen.getByRole('button', { name: /menu lainnya/i });
    fireEvent.click(moreButton);

    // Drawer opens
    expect(screen.getByTestId('bottom-nav-drawer')).toBeInTheDocument();
    expect(screen.getByText('Profil')).toBeInTheDocument();
    expect(screen.getByText('Eskul')).toBeInTheDocument();
    expect(screen.getByText('Galeri')).toBeInTheDocument();
    expect(screen.getByText('Kontak')).toBeInTheDocument();
    expect(screen.getByText('Download')).toBeInTheDocument();
    expect(screen.getByText('Login')).toBeInTheDocument();

    // Close drawer using close handle
    const closeHandle = screen.getByTitle('Tutup menu');
    fireEvent.click(closeHandle);
    expect(screen.queryByTestId('bottom-nav-drawer')).not.toBeInTheDocument();
  });
});

import { HashRouter, Routes, Route, useLocation, Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import BottomNav from './components/BottomNav';
import SEOHead from './components/SEOHead';
import Home from './pages/Home';
import Profil from './pages/Profil';
import Berita from './pages/Berita';
import Agenda from './pages/Agenda';
import Galeri from './pages/Galeri';
import Kontak from './pages/Kontak';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

/* Public layout with Navbar + Footer + BottomNav */
function PublicLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 main-content">
        <Outlet />
      </main>
      <div className="footer-wrapper">
        <Footer />
      </div>
      <BottomNav />
    </div>
  );
}

/* Scroll to top + track page view on route change */
function RouteTracker() {
  const { pathname } = useLocation();
  const { trackPageView } = useApp();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Don't track dashboard/login page views
    if (!pathname.startsWith('/dashboard') && !pathname.startsWith('/login')) {
      trackPageView(pathname);
    }
  }, [pathname, trackPageView]);

  return null;
}

/* Main router — Login & Dashboard are standalone pages (no Navbar/Footer) */
function AppRoutes() {
  return (
    <>
      <SEOHead />
      <RouteTracker />
      <Routes>
        {/* Standalone pages — NO Navbar, Footer, or BottomNav */}
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Public pages — wrapped in PublicLayout */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/profil" element={<Profil />} />
          <Route path="/berita" element={<Berita />} />
          <Route path="/berita/:id" element={<Berita />} />
          <Route path="/agenda" element={<Agenda />} />
          <Route path="/galeri" element={<Galeri />} />
          <Route path="/kontak" element={<Kontak />} />
        </Route>
      </Routes>
    </>
  );
}

export function App() {
  return (
    <HashRouter>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </HashRouter>
  );
}

import { HashRouter, Routes, Route, useLocation, Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import BottomNav from './components/BottomNav';
import SplashScreen from './components/SplashScreen';
import SEOHead from './components/SEOHead';
import Home from './pages/Home';
import Profil from './pages/Profil';
import Berita from './pages/Berita';
import Agenda from './pages/Agenda';
import Galeri from './pages/Galeri';
import Kontak from './pages/Kontak';
import Downloads from './pages/Downloads';
import Ekstrakurikuler from './pages/Ekstrakurikuler';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

/* Public layout with Navbar + Footer + BottomNav */
function PublicLayout() {
  return (
    <div className="flex flex-col h-dvh overflow-hidden">
      <Navbar />
      <div className="flex-1 overflow-y-auto" data-scroll-container>
        <main>
          <Outlet />
        </main>
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
          <Route path="/ekstrakurikuler" element={<Ekstrakurikuler />} />
          <Route path="/download" element={<Downloads />} />
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
        <AppInner />
      </AppProvider>
    </HashRouter>
  );
}

function AppInner() {
  const { isSettingsLoaded } = useApp();

  if (!isSettingsLoaded) {
    return <SplashScreen />;
  }

  return (
    <>
      <AppRoutes />
    </>
  );
}

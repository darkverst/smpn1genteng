import { HashRouter, Routes, Route, useLocation, Outlet } from 'react-router-dom';
import { useEffect, lazy, Suspense } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import BottomNav from './components/BottomNav';
import SplashScreen from './components/SplashScreen';
import SEOHead from './components/SEOHead';
import Home from './pages/Home';
import ProtectedRoute from './components/ProtectedRoute';

// Lazy load halaman admin dan sekunder untuk meminimalkan beban bundle awal
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Profil = lazy(() => import('./pages/Profil'));
const Berita = lazy(() => import('./pages/Berita'));
const Agenda = lazy(() => import('./pages/Agenda'));
const Galeri = lazy(() => import('./pages/Galeri'));
const Downloads = lazy(() => import('./pages/Downloads'));
const Ekstrakurikuler = lazy(() => import('./pages/Ekstrakurikuler'));
const Kontak = lazy(() => import('./pages/Kontak'));

/* Public layout with Navbar + Footer + BottomNav */
function PublicLayout() {
  return (
    <div className="flex flex-col h-dvh overflow-hidden site-public-layout">
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
      <Suspense fallback={<SplashScreen />}>
        <Routes>
          {/* Standalone pages — NO Navbar, Footer, or BottomNav */}
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

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
      </Suspense>
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

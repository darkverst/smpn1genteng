import { type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { isSessionValid } from '../utils/security';
import SplashScreen from './SplashScreen';

interface ProtectedRouteProps {
  children?: ReactNode;
}

/**
 * Route guard component untuk melindungi rute privat (Dashboard Admin)
 * Mencegah render komponen sebelum autentikasi terverifikasi dan sesi valid.
 */
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isLoggedIn, isSettingsLoaded } = useApp();
  const location = useLocation();

  if (!isSettingsLoaded) {
    return <SplashScreen />;
  }

  // Periksa status login di AppContext dan validitas session token (tidak kedaluwarsa)
  if (!isLoggedIn || !isSessionValid()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children ? <>{children}</> : null;
}

import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { ArrowLeft, LogIn, GraduationCap, AlertCircle, Eye, EyeOff, Shield } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getButtonStyle, getCardStyle, getIconBadgeStyle, getIconSvgEffect } from '../utils/themeStyles';
import { cn } from '../utils/cn';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isLoggedIn, authSettings, schoolIdentity } = useApp();
  const navigate = useNavigate();

  // If already logged in, redirect to dashboard immediately
  if (isLoggedIn) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const success = await login(username, password);
      if (success) {
        navigate('/dashboard', { replace: true });
      } else {
        setError('Username atau password salah. Silakan coba lagi.');
      }
    } catch {
      setError('Terjadi kendala saat verifikasi autentikasi. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-100 px-4 py-8 site-login-layout"
      data-icon-style={schoolIdentity.iconStyle || 'material'}
      data-button-style={schoolIdentity.buttonStyle || 'rounded'}
      data-card-style={schoolIdentity.cardStyle || 'modern'}
    >
      <div className="w-full max-w-md animate-fadeIn">
        {/* Card */}
        <div className={cn("bg-white p-6 sm:p-8 lg:p-10 border border-gray-100 shadow-2xl ui-card", getCardStyle(schoolIdentity.cardStyle))}>
          <div className="mb-4 sm:mb-5">
            <Link
              to="/"
              className={cn(
                "inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 px-3.5 py-1.5 transition-colors border border-gray-200 ui-btn",
                getButtonStyle(schoolIdentity.buttonStyle)
              )}
            >
              <ArrowLeft className={cn("h-4 w-4", getIconSvgEffect(schoolIdentity.iconStyle))} />
              Kembali ke Home
            </Link>
          </div>

          {/* Logo */}
          <div className="text-center mb-6 sm:mb-8">
            <div
              className={cn(
                "w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-primary-400 to-primary-600 text-white flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg overflow-hidden ui-icon-badge",
                getIconBadgeStyle(schoolIdentity.iconStyle)
              )}
            >
              {schoolIdentity.showLogo && schoolIdentity.schoolLogo ? (
                <img
                  src={schoolIdentity.schoolLogo}
                  alt={schoolIdentity.schoolName || 'Logo'}
                  className={cn("w-full h-full object-contain p-2 bg-white/90", getIconSvgEffect(schoolIdentity.iconStyle))}
                />
              ) : (
                <GraduationCap className={cn("h-9 w-9 sm:h-11 sm:w-11", getIconSvgEffect(schoolIdentity.iconStyle))} />
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900">Dashboard Admin</h1>
            <p className="text-gray-500 text-xs sm:text-sm mt-1">{schoolIdentity.schoolName || 'Portal Sekolah'}</p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 sm:mb-6 bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl flex items-center gap-2 text-xs sm:text-sm animate-scaleIn">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-1.5">Username</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-300 transition-all"
                placeholder="Masukkan username"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-300 transition-all pr-12"
                  placeholder="Masukkan password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 no-theme-style"
                >
                  {showPassword ? <EyeOff className={cn("h-4 w-4 sm:h-5 sm:w-5", getIconSvgEffect(schoolIdentity.iconStyle))} /> : <Eye className={cn("h-4 w-4 sm:h-5 sm:w-5", getIconSvgEffect(schoolIdentity.iconStyle))} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={cn(
                "w-full bg-primary-500 hover:bg-primary-600 active:bg-primary-700 disabled:bg-primary-300 text-white py-3 sm:py-3.5 font-semibold text-sm transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 ui-btn",
                getButtonStyle(schoolIdentity.buttonStyle)
              )}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className={cn("h-4 w-4", getIconSvgEffect(schoolIdentity.iconStyle))} />
                  Masuk
                </>
              )}
            </button>
          </form>

          {/* Demo credentials */}
          {authSettings.showDemoCredentials && (
            <div className={cn("mt-5 sm:mt-6 bg-primary-50 p-3 sm:p-4 border border-primary-100 ui-card", getCardStyle(schoolIdentity.cardStyle))}>
              <div className="flex items-center gap-2 text-primary-700 text-[11px] sm:text-xs font-semibold mb-1.5 sm:mb-2">
                <div className={cn("w-6 h-6 bg-primary-100 text-primary-700 flex items-center justify-center shrink-0 ui-icon-badge", getIconBadgeStyle(schoolIdentity.iconStyle))}>
                  <Shield className={cn("h-3.5 w-3.5", getIconSvgEffect(schoolIdentity.iconStyle))} />
                </div>
                Demo Credentials
              </div>
              <div className="text-[11px] sm:text-xs text-primary-600 space-y-0.5">
                <p>Username: <code className="bg-primary-100 px-1.5 py-0.5 rounded font-mono">{authSettings.username}</code></p>
                <p>Password: <code className="bg-primary-100 px-1.5 py-0.5 rounded font-mono">{authSettings.password}</code></p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

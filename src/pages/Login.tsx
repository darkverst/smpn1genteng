import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { LogIn, GraduationCap, AlertCircle, Eye, EyeOff, Shield } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isLoggedIn, authSettings } = useApp();
  const navigate = useNavigate();

  // If already logged in, redirect to dashboard immediately
  if (isLoggedIn) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      const success = login(username, password);
      if (success) {
        navigate('/dashboard', { replace: true });
      } else {
        setError('Username atau password salah. Silakan coba lagi.');
      }
      setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-100 px-4 py-8">
      <div className="w-full max-w-md animate-fadeIn">
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 lg:p-10 border border-gray-100">
          {/* Logo */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg">
              <GraduationCap className="h-8 w-8 sm:h-9 sm:w-9 text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900">Dashboard Admin</h1>
            <p className="text-gray-500 text-xs sm:text-sm mt-1">SMP Negeri 1 Genteng</p>
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                >
                  {showPassword ? <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Eye className="h-4 w-4 sm:h-5 sm:w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300 text-white py-3 sm:py-3.5 rounded-xl font-semibold text-sm transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  Masuk
                </>
              )}
            </button>
          </form>

          {/* Demo credentials */}
          {authSettings.showDemoCredentials && (
            <div className="mt-5 sm:mt-6 bg-primary-50 rounded-xl p-3 sm:p-4 border border-primary-100">
              <div className="flex items-center gap-2 text-primary-700 text-[11px] sm:text-xs font-semibold mb-1.5 sm:mb-2">
                <Shield className="h-3.5 w-3.5" />
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

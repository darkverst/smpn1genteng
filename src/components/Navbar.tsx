import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { GraduationCap, LogIn, LayoutDashboard, Menu, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import DbIndicator from './DbIndicator';
import { getButtonStyle, getIconBadgeStyle } from '../utils/themeStyles';

const navLinks = [
  { path: '/', label: 'Home' },
  { path: '/profil', label: 'Profil' },
  { path: '/berita', label: 'Berita' },
  { path: '/agenda', label: 'Agenda' },
  { path: '/galeri', label: 'Galeri' },
  { path: '/ekstrakurikuler', label: 'Eskul' },
  { path: '/tautan', label: 'Tautan' },
  { path: '/download', label: 'Download' },
  { path: '/kontak', label: 'Kontak' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const { isLoggedIn, smpbButton, schoolIdentity } = useApp();
  const menuRef = useRef<HTMLDivElement>(null);
  const smpbLabel = `${smpbButton.label || 'SMPB'} (${smpbButton.year || new Date().getFullYear()})`;
  const headerName = schoolIdentity.schoolShortName || schoolIdentity.schoolName || 'Portal Sekolah';
  const headerTagline = schoolIdentity.schoolTagline || 'Website Resmi';

  useEffect(() => {
    const el = document.querySelector<HTMLElement>('[data-scroll-container]');
    const target = el || window;
    const handleScroll = () => {
      const scrollTop = el ? el.scrollTop : window.scrollY;
      setScrolled(scrollTop > 20);
    };
    target.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => target.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <nav className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-white shadow-sm'
      }`}>
        {/* Top accent bar */}
        <div
          className="h-0.5 lg:h-1"
          style={{ background: `linear-gradient(90deg, ${schoolIdentity.primaryColor}, ${schoolIdentity.secondaryColor}, ${schoolIdentity.accentColor})` }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 lg:h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2.5 group">
              <div
                className={getIconBadgeStyle(schoolIdentity.iconStyle, "w-9 h-9 lg:w-10 lg:h-10 flex items-center justify-center overflow-hidden")}
                style={{ background: `linear-gradient(135deg, ${schoolIdentity.primaryColor}, ${schoolIdentity.secondaryColor})` }}
              >
                {schoolIdentity.showLogo && schoolIdentity.schoolLogo ? (
                  <img src={schoolIdentity.schoolLogo} alt={`Logo ${headerName}`} className="h-full w-full object-contain bg-white p-1.5" />
                ) : (
                  <GraduationCap className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
                )}
              </div>
              <div>
                <h1 className="text-base lg:text-lg font-bold text-primary-900 leading-tight">
                  {headerName}
                </h1>
                <p className="text-[10px] lg:text-[11px] text-primary-500 font-medium -mt-0.5 hidden sm:block">
                  {headerTagline}
                </p>
              </div>
            </Link>

            {/* Desktop Nav - only on lg+ */}
            <div className="hidden lg:flex items-center space-x-1">
              {navLinks.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive(link.path)
                      ? 'bg-primary-50 text-primary-700 shadow-sm'
                      : 'text-gray-600 hover:bg-primary-50/50 hover:text-primary-600'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="w-px h-6 bg-gray-200 mx-2" />
              <div className="flex items-center gap-1.5 mr-1.5">
                <DbIndicator />
              </div>
              <div className="w-px h-5 bg-gray-300 mr-2" />
              {smpbButton.isActive && smpbButton.link && (
                <a
                  href={smpbButton.link}
                  target={smpbButton.openInNewTab ? '_blank' : '_self'}
                  rel={smpbButton.openInNewTab ? 'noopener noreferrer' : undefined}
                  className={getButtonStyle(schoolIdentity.buttonStyle, "px-4 py-2 bg-accent-400 hover:bg-accent-500 text-primary-950 text-sm font-semibold transition-colors")}
                >
                  {smpbLabel}
                </a>
              )}
              {isLoggedIn ? (
                <Link
                  to="/dashboard"
                  className={getButtonStyle(schoolIdentity.buttonStyle, "flex items-center gap-1.5 px-4 py-2 bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition-colors")}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
              ) : (
                <Link
                  to="/login"
                  className={getButtonStyle(schoolIdentity.buttonStyle, "flex items-center gap-1.5 px-4 py-2 border-2 border-primary-500 text-primary-600 text-sm font-medium hover:bg-primary-500 hover:text-white transition-all")}
                >
                  <LogIn className="h-4 w-4" />
                  Login
                </Link>
              )}
            </div>

            {/* Tablet: Hamburger button (md to lg) */}
            <div className="hidden md:flex lg:hidden items-center gap-2">
              {smpbButton.isActive && smpbButton.link && (
                <a
                  href={smpbButton.link}
                  target={smpbButton.openInNewTab ? '_blank' : '_self'}
                  rel={smpbButton.openInNewTab ? 'noopener noreferrer' : undefined}
                  className="px-3 py-1.5 bg-accent-400 text-primary-950 rounded-lg text-xs font-semibold"
                >
                  {smpbLabel}
                </a>
              )}
              {isLoggedIn ? (
                <Link
                  to="/dashboard"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-500 text-white rounded-lg text-xs font-semibold"
                >
                  <LayoutDashboard className="h-3.5 w-3.5" />
                  Dashboard
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center gap-1 px-3 py-1.5 border border-primary-400 text-primary-600 rounded-lg text-xs font-semibold"
                >
                  <LogIn className="h-3.5 w-3.5" />
                  Login
                </Link>
              )}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Toggle menu"
              >
                {menuOpen ? (
                  <X className="h-5 w-5 text-gray-700" />
                ) : (
                  <Menu className="h-5 w-5 text-gray-700" />
                )}
              </button>
            </div>

            {/* Mobile: only Login/Admin button (bottom nav handles navigation) */}
            <div className="flex items-center gap-2 md:hidden">
              <DbIndicator />
              {smpbButton.isActive && smpbButton.link && (
                <a
                  href={smpbButton.link}
                  target={smpbButton.openInNewTab ? '_blank' : '_self'}
                  rel={smpbButton.openInNewTab ? 'noopener noreferrer' : undefined}
                  className="px-3 py-1.5 bg-accent-400 text-primary-950 rounded-lg text-xs font-semibold"
                >
                  SMPB
                </a>
              )}
              {isLoggedIn ? (
                <Link
                  to="/dashboard"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-500 text-white rounded-lg text-xs font-semibold"
                >
                  <LayoutDashboard className="h-3.5 w-3.5" />
                  Admin
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center gap-1 px-3 py-1.5 border border-primary-400 text-primary-600 rounded-lg text-xs font-semibold"
                >
                  <LogIn className="h-3.5 w-3.5" />
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Tablet hamburger overlay & drawer */}
      {menuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm animate-fadeIn hidden md:block lg:hidden"
            onClick={() => setMenuOpen(false)}
          />
          {/* Drawer panel */}
          <div
            ref={menuRef}
            className="fixed top-[57px] right-0 z-50 w-72 max-h-[calc(100vh-57px)] bg-white shadow-2xl rounded-bl-2xl border-l border-b border-gray-100 overflow-y-auto hidden md:block lg:hidden animate-slideX"
          >
            <div className="p-4 space-y-1">
              {navLinks.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive(link.path)
                      ? 'bg-primary-50 text-primary-700 shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="h-px bg-gray-100 my-2" />
              {smpbButton.isActive && smpbButton.link && (
                <a
                  href={smpbButton.link}
                  target={smpbButton.openInNewTab ? '_blank' : '_self'}
                  rel={smpbButton.openInNewTab ? 'noopener noreferrer' : undefined}
                  className={getButtonStyle(schoolIdentity.buttonStyle, "flex items-center justify-center px-4 py-3 bg-accent-400 text-primary-900 text-sm font-bold")}
                >
                  {smpbLabel}
                </a>
              )}
              {isLoggedIn ? (
                <Link
                  to="/dashboard"
                  onClick={() => setMenuOpen(false)}
                  className={getButtonStyle(schoolIdentity.buttonStyle, "flex items-center gap-2 px-4 py-3 bg-primary-50 text-primary-700 text-sm font-semibold")}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard Admin
                </Link>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className={getButtonStyle(schoolIdentity.buttonStyle, "flex items-center gap-2 px-4 py-3 bg-primary-50 text-primary-700 text-sm font-semibold")}
                >
                  <LogIn className="h-4 w-4" />
                  Login Admin
                </Link>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}

import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Newspaper, Calendar, User, Camera, MessageSquare, LayoutDashboard, LogIn, Download, ChevronDown, Trophy } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface NavItem {
  path: string;
  label: string;
  icon: typeof Home;
}

const primaryItems: NavItem[] = [
  { path: '/', label: 'Beranda', icon: Home },
  { path: '/berita', label: 'Berita', icon: Newspaper },
  { path: '/agenda', label: 'Agenda', icon: Calendar },
];

const secondaryItems: NavItem[] = [
  { path: '/profil', label: 'Profil', icon: User },
  { path: '/ekstrakurikuler', label: 'Eskul', icon: Trophy },
  { path: '/galeri', label: 'Galeri', icon: Camera },
  { path: '/kontak', label: 'Kontak', icon: MessageSquare },
  { path: '/download', label: 'Download', icon: Download },
];

export default function BottomNav() {
  const location = useLocation();
  const { isLoggedIn, schoolIdentity } = useApp();
  const [showMore, setShowMore] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  const navStyle = schoolIdentity.bottomNavStyle || 'floating';

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const isMoreActive = [...secondaryItems, { path: '/login' }, { path: '/dashboard' }].some(
    item => isActive(item.path)
  );

  const isSomeMoreActive = showMore || isMoreActive;

  useEffect(() => { setShowMore(false); }, [location.pathname]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setShowMore(false);
      }
    };
    if (showMore) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showMore]);

  // Style configurations
  const getWrapperClass = () => {
    switch (navStyle) {
      case 'classic':
      case 'minimal':
        return 'w-full';
      case 'dock':
        return 'px-3 pb-2 pt-1 flex justify-center';
      case 'glass':
      case 'floating':
      default:
        return 'px-3 sm:px-4 pb-2.5 pt-1';
    }
  };

  const getNavContainerClass = () => {
    switch (navStyle) {
      case 'classic':
        return 'relative border-t border-white/10 bg-slate-900/95 backdrop-blur-2xl px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]';
      case 'minimal':
        return 'relative border-t border-white/10 bg-slate-950/95 backdrop-blur-md px-3 py-1 pb-[max(0.35rem,env(safe-area-inset-bottom))]';
      case 'dock':
        return 'relative max-w-sm w-full mx-auto rounded-full bg-slate-900/90 backdrop-blur-2xl border border-primary-500/30 shadow-xl shadow-primary-950/60 px-3 py-1.5';
      case 'glass':
        return 'relative max-w-md mx-auto rounded-2xl bg-white/10 dark:bg-slate-900/50 backdrop-blur-2xl border border-white/25 shadow-2xl px-2 py-1.5';
      case 'floating':
      default:
        return 'relative max-w-md mx-auto rounded-3xl bg-slate-900/90 backdrop-blur-2xl border border-white/15 shadow-2xl shadow-black/50 px-2 py-1.5';
    }
  };

  const getDrawerContainerClass = () => {
    switch (navStyle) {
      case 'classic':
      case 'minimal':
        return 'animate-slideUp border-t border-white/10 bg-slate-900/95 backdrop-blur-2xl';
      case 'dock':
        return 'animate-slideUp max-w-sm mx-auto mb-2 rounded-3xl border border-primary-500/30 bg-slate-900/95 backdrop-blur-2xl shadow-2xl overflow-hidden';
      case 'glass':
        return 'animate-slideUp max-w-md mx-auto mb-2 rounded-2xl border border-white/20 bg-slate-900/85 backdrop-blur-2xl shadow-2xl overflow-hidden';
      case 'floating':
      default:
        return 'animate-slideUp max-w-md mx-auto mb-2 rounded-3xl border border-white/15 bg-slate-900/95 backdrop-blur-2xl shadow-2xl overflow-hidden';
    }
  };

  const getActiveIconClass = () => {
    switch (navStyle) {
      case 'minimal':
        return 'bg-white/10 text-primary-300 scale-105';
      case 'dock':
        return 'bg-primary-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.5)] -translate-y-1.5 scale-110 ring-2 ring-white/20';
      case 'glass':
        return 'bg-white/20 text-white shadow-[0_0_12px_rgba(255,255,255,0.3)] border border-white/30 -translate-y-1.5';
      case 'classic':
        return 'bg-primary-600 text-white shadow-md shadow-primary-950 -translate-y-1';
      case 'floating':
      default:
        return 'bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30 -translate-y-2';
    }
  };

  const getIconSizeClass = () => {
    return navStyle === 'minimal' ? 'w-10 h-10 rounded-xl' : 'w-11 h-11 sm:w-12 sm:h-12 rounded-2xl';
  };

  return (
    <>
      {/* Backdrop */}
      {showMore && (
        <div
          className="fixed inset-0 z-40 bg-black/30 md:hidden animate-fadeIn backdrop-blur-xs"
          onClick={() => setShowMore(false)}
        />
      )}

      <div ref={moreRef} className="z-50 md:hidden select-none">
        {/* Expanded panel */}
        {showMore && (
          <div className={getDrawerContainerClass()} data-testid="bottom-nav-drawer">
            <div className="max-w-md mx-auto px-4 pt-4 pb-2">
              <div className="grid grid-cols-4 gap-1">
                {secondaryItems.map(item => {
                  const active = isActive(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setShowMore(false)}
                      className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-2xl transition-all active:scale-90 ${
                        active ? 'bg-primary-500/20' : 'hover:bg-white/5'
                      }`}
                    >
                      <div className={`flex items-center justify-center w-11 h-11 rounded-xl mb-1 transition-all ${
                        active ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30' : 'text-slate-400'
                      }`}>
                        <item.icon className="h-5 w-5" />
                      </div>
                      <span className={`text-[10px] leading-tight text-center ${
                        active ? 'font-semibold text-primary-300' : 'font-medium text-slate-400'
                      }`}>
                        {item.label}
                      </span>
                    </Link>
                  );
                })}

                {/* Login / Dashboard */}
                {isLoggedIn ? (
                  <Link
                    to="/dashboard"
                    onClick={() => setShowMore(false)}
                    className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-2xl transition-all active:scale-90 ${
                      isActive('/dashboard') ? 'bg-primary-500/20' : 'hover:bg-white/5'
                    }`}
                  >
                    <div className={`flex items-center justify-center w-11 h-11 rounded-xl mb-1 transition-all ${
                      isActive('/dashboard') ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30' : 'text-slate-400'
                    }`}>
                      <LayoutDashboard className="h-5 w-5" />
                    </div>
                    <span className={`text-[10px] leading-tight text-center ${
                      isActive('/dashboard') ? 'font-semibold text-primary-300' : 'font-medium text-slate-400'
                    }`}>
                      Dashboard
                    </span>
                  </Link>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setShowMore(false)}
                    className="flex flex-col items-center justify-center py-2.5 px-1 rounded-2xl transition-all active:scale-90 hover:bg-white/5"
                  >
                    <div className="flex items-center justify-center w-11 h-11 rounded-xl mb-1 text-slate-400">
                      <LogIn className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] leading-tight text-center font-medium text-slate-400">
                      Login
                    </span>
                  </Link>
                )}
              </div>
            </div>

            {/* Close handle */}
            <div className="flex justify-center pb-3 pt-1">
              <div
                onClick={() => setShowMore(false)}
                className="h-1 w-10 rounded-full bg-slate-600 active:scale-90 transition-transform cursor-pointer"
                title="Tutup menu"
              />
            </div>
          </div>
        )}

        {/* Main bar */}
        <div className={getWrapperClass()}>
          <nav
            data-testid="bottom-nav-container"
            data-nav-style={navStyle}
            className={getNavContainerClass()}
          >
            <div className="flex items-center justify-around">
              {primaryItems.map(item => {
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`relative flex flex-1 flex-col items-center justify-center py-1.5 transition-all active:scale-90 ${
                      active ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className={`flex items-center justify-center ${getIconSizeClass()} transition-all duration-300 ${
                      active ? getActiveIconClass() : ''
                    }`}>
                      <item.icon className={`h-5 w-5 transition-all ${active ? 'stroke-[2.5px]' : 'stroke-[1.75px]'}`} />
                    </div>
                    <span className={`text-[10px] font-medium mt-0.5 transition-all ${
                      active ? 'text-white font-semibold' : 'text-slate-400'
                    }`}>
                      {item.label}
                    </span>
                    {active && navStyle !== 'minimal' && (
                      <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary-400" />
                    )}
                  </Link>
                );
              })}

              {/* More button */}
              <button
                onClick={() => setShowMore(!showMore)}
                className={`relative flex flex-1 flex-col items-center justify-center py-1.5 transition-all active:scale-90 ${
                  isSomeMoreActive ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
                aria-label="Menu lainnya"
              >
                <div className={`flex items-center justify-center ${getIconSizeClass()} transition-all duration-300 ${
                  isSomeMoreActive ? getActiveIconClass() : ''
                }`}>
                  <ChevronDown className={`h-5 w-5 transition-transform duration-300 ${showMore ? 'rotate-180' : ''}`} />
                </div>
                <span className={`text-[10px] font-medium mt-0.5 transition-all ${
                  isSomeMoreActive ? 'text-white font-semibold' : 'text-slate-400'
                }`}>
                  Lainnya
                </span>
                {isSomeMoreActive && navStyle !== 'minimal' && (
                  <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary-400" />
                )}
              </button>
            </div>
          </nav>
        </div>
      </div>
    </>
  );
}

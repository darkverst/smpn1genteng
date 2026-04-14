import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Newspaper, Calendar, LayoutGrid, User, Camera, MessageSquare, LayoutDashboard, LogIn } from 'lucide-react';
import { useApp } from '../context/AppContext';

const mainItems = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/berita', label: 'Berita', icon: Newspaper },
  { path: '/agenda', label: 'Agenda', icon: Calendar },
];

const moreItems = [
  { path: '/profil', label: 'Profil', icon: User },
  { path: '/galeri', label: 'Galeri', icon: Camera },
  { path: '/kontak', label: 'Kontak', icon: MessageSquare },
];

export default function BottomNav() {
  const location = useLocation();
  const { isLoggedIn } = useApp();
  const [showMore, setShowMore] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const isMoreActive = [...moreItems, { path: '/login' }, { path: '/dashboard' }].some(
    item => isActive(item.path)
  );

  // Close on route change
  useEffect(() => {
    setShowMore(false);
  }, [location.pathname]);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setShowMore(false);
      }
    };
    if (showMore) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showMore]);

  return (
    <>
      {/* Backdrop when more panel is open */}
      {showMore && (
        <div
          className="fixed inset-0 z-40 bg-black/20 md:hidden animate-fadeIn"
          onClick={() => setShowMore(false)}
        />
      )}

      {/* Bottom Nav Container - only visible below md */}
      <div ref={moreRef} className="fixed bottom-0 left-0 right-0 z-50 md:hidden">

        {/* Expandable "Lainnya" panel */}
        {showMore && (
          <div className="bg-white border-t border-x border-gray-200 rounded-t-2xl shadow-[0_-8px_30px_rgba(0,0,0,0.12)] mx-2 mb-0 animate-slideUp overflow-hidden">
            <div className="px-2 pt-3 pb-2">
              <div className="flex items-center justify-between px-3 mb-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Menu Lainnya</span>
                <button
                  onClick={() => setShowMore(false)}
                  className="text-[10px] text-primary-500 font-semibold"
                >
                  Tutup
                </button>
              </div>
              <div className="grid grid-cols-3 gap-1">
                {moreItems.map(item => {
                  const active = isActive(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setShowMore(false)}
                      className={`flex flex-col items-center justify-center py-3 px-2 rounded-xl transition-all ${
                        active
                          ? 'bg-primary-50 text-primary-600'
                          : 'text-gray-500 hover:bg-gray-50 active:bg-gray-100'
                      }`}
                    >
                      <div className={`flex items-center justify-center w-10 h-10 rounded-xl mb-1 transition-all ${
                        active ? 'bg-primary-100' : 'bg-gray-100'
                      }`}>
                        <item.icon className={`h-5 w-5 ${active ? 'stroke-[2.5px]' : 'stroke-[1.5px]'}`} />
                      </div>
                      <span className={`text-[11px] font-medium ${active ? 'font-semibold' : ''}`}>
                        {item.label}
                      </span>
                    </Link>
                  );
                })}

                {/* Login / Dashboard link */}
                {isLoggedIn ? (
                  <Link
                    to="/dashboard"
                    onClick={() => setShowMore(false)}
                    className="flex flex-col items-center justify-center py-3 px-2 rounded-xl text-gray-500 hover:bg-gray-50 active:bg-gray-100 transition-all"
                  >
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl mb-1 bg-primary-500">
                      <LayoutDashboard className="h-5 w-5 text-white stroke-[1.5px]" />
                    </div>
                    <span className="text-[11px] font-medium">Dashboard</span>
                  </Link>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setShowMore(false)}
                    className="flex flex-col items-center justify-center py-3 px-2 rounded-xl text-gray-500 hover:bg-gray-50 active:bg-gray-100 transition-all"
                  >
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl mb-1 bg-gray-100">
                      <LogIn className="h-5 w-5 stroke-[1.5px]" />
                    </div>
                    <span className="text-[11px] font-medium">Login</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Main bottom bar */}
        <nav className="bg-white/95 backdrop-blur-xl border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
          <div className="flex items-center justify-around px-2 h-16 max-w-lg mx-auto">
            {mainItems.map(item => {
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex flex-col items-center justify-center flex-1 h-full relative transition-all duration-200 ${
                    active ? 'text-primary-600' : 'text-gray-400'
                  }`}
                >
                  {active && (
                    <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary-500 rounded-full" />
                  )}
                  <div className={`flex items-center justify-center w-10 h-7 rounded-2xl transition-all duration-200 ${
                    active ? 'bg-primary-50 scale-105' : ''
                  }`}>
                    <item.icon className={`h-5 w-5 transition-all ${active ? 'stroke-[2.5px]' : 'stroke-[1.5px]'}`} />
                  </div>
                  <span className={`text-[10px] mt-0.5 leading-tight ${active ? 'font-bold' : 'font-medium'}`}>
                    {item.label}
                  </span>
                </Link>
              );
            })}

            {/* Lainnya button */}
            <button
              onClick={() => setShowMore(!showMore)}
              className={`flex flex-col items-center justify-center flex-1 h-full relative transition-all duration-200 ${
                showMore || isMoreActive ? 'text-primary-600' : 'text-gray-400'
              }`}
            >
              {isMoreActive && !showMore && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary-500 rounded-full" />
              )}
              <div className={`flex items-center justify-center w-10 h-7 rounded-2xl transition-all duration-200 ${
                showMore ? 'bg-primary-50 scale-105 rotate-45' : isMoreActive ? 'bg-primary-50 scale-105' : ''
              }`}>
                <LayoutGrid className={`h-5 w-5 transition-all ${showMore || isMoreActive ? 'stroke-[2.5px]' : 'stroke-[1.5px]'}`} />
              </div>
              <span className={`text-[10px] mt-0.5 leading-tight ${showMore || isMoreActive ? 'font-bold' : 'font-medium'}`}>
                Lainnya
              </span>
            </button>
          </div>
          {/* Safe area spacer for notched phones */}
          <div className="h-[env(safe-area-inset-bottom)]" />
        </nav>
      </div>
    </>
  );
}

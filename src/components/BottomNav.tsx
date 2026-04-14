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
          className="fixed inset-0 z-40 bg-slate-950/20 md:hidden animate-fadeIn"
          onClick={() => setShowMore(false)}
        />
      )}

      {/* Bottom Nav Container - only visible below md */}
      <div ref={moreRef} className="fixed bottom-0 left-0 right-0 z-50 md:hidden pointer-events-none">

        {/* Expandable "Lainnya" panel */}
        {showMore && (
          <div className="pointer-events-auto mx-3 mb-2 rounded-[28px] border border-white/70 bg-white/95 animate-slideUp overflow-hidden shadow-[0_18px_45px_rgba(15,23,42,0.16)] backdrop-blur-xl">
            <div className="max-w-md mx-auto px-4 pt-3 pb-3">
              <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-slate-200" />
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.22em]">Menu Lainnya</span>
                <button
                  onClick={() => setShowMore(false)}
                  className="rounded-full bg-primary-50 px-3 py-1 text-[10px] text-primary-600 font-semibold"
                >
                  Tutup
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {moreItems.map(item => {
                  const active = isActive(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setShowMore(false)}
                      className={`flex flex-col items-center justify-center py-3 px-2 rounded-2xl border transition-all ${
                        active
                          ? 'bg-primary-50 text-primary-600 border-primary-100 shadow-sm'
                          : 'text-gray-500 border-slate-100 bg-slate-50/80 hover:bg-gray-50 active:bg-gray-100'
                      }`}
                    >
                      <div className={`flex items-center justify-center w-10 h-10 rounded-2xl mb-1.5 transition-all ${
                        active ? 'bg-primary-100' : 'bg-white border border-slate-100'
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
                    className="flex flex-col items-center justify-center py-3 px-2 rounded-2xl border border-slate-100 bg-slate-50/80 text-gray-500 hover:bg-gray-50 active:bg-gray-100 transition-all"
                  >
                    <div className="flex items-center justify-center w-10 h-10 rounded-2xl mb-1.5 bg-primary-500">
                      <LayoutDashboard className="h-5 w-5 text-white stroke-[1.5px]" />
                    </div>
                    <span className="text-[11px] font-medium">Dashboard</span>
                  </Link>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setShowMore(false)}
                    className="flex flex-col items-center justify-center py-3 px-2 rounded-2xl border border-slate-100 bg-slate-50/80 text-gray-500 hover:bg-gray-50 active:bg-gray-100 transition-all"
                  >
                    <div className="flex items-center justify-center w-10 h-10 rounded-2xl mb-1.5 bg-white border border-slate-100">
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
        <nav className="pointer-events-auto bg-transparent px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <div className="max-w-md mx-auto">
            <div className="relative rounded-[24px] border border-white/70 bg-white/92 px-2 pt-1 pb-7 shadow-[0_18px_45px_rgba(15,23,42,0.16)] backdrop-blur-xl">
              <div className="flex items-start justify-around">
                {mainItems.map(item => {
                  const active = isActive(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`relative flex flex-1 min-w-0 flex-col items-center transition-colors ${active ? 'text-primary-500' : 'text-slate-400'}`}
                    >
                      <div className="h-10 flex items-center justify-center">
                        {!active && <item.icon className="h-5 w-5 stroke-[1.75px]" />}
                      </div>
                      {active && (
                        <div className="absolute -top-6 flex flex-col items-center">
                          <div className="flex h-14 w-14 items-center justify-center rounded-full border-[6px] border-slate-100 bg-white text-primary-500 shadow-[0_10px_24px_rgba(15,23,42,0.14)]">
                            <item.icon className="h-6 w-6 stroke-[2px]" />
                          </div>
                        </div>
                      )}
                      <span className={`absolute -bottom-4 text-[11px] leading-none ${active ? 'font-bold text-primary-500' : 'font-medium text-slate-400'}`}>
                        {item.label}
                      </span>
                    </Link>
                  );
                })}

                <button
                  onClick={() => setShowMore(!showMore)}
                  className={`relative flex flex-1 min-w-0 flex-col items-center transition-colors ${showMore || isMoreActive ? 'text-primary-500' : 'text-slate-400'}`}
                >
                  <div className="h-10 flex items-center justify-center">
                    {!(showMore || isMoreActive) && <LayoutGrid className="h-5 w-5 stroke-[1.75px]" />}
                  </div>
                  {(showMore || isMoreActive) && (
                    <div className="absolute -top-6 flex flex-col items-center">
                      <div className={`flex h-14 w-14 items-center justify-center rounded-full border-[6px] border-slate-100 bg-white text-primary-500 shadow-[0_10px_24px_rgba(15,23,42,0.14)] ${showMore ? 'rotate-45' : ''}`}>
                        <LayoutGrid className="h-6 w-6 stroke-[2px]" />
                      </div>
                    </div>
                  )}
                  <span className={`absolute -bottom-4 text-[11px] leading-none ${showMore || isMoreActive ? 'font-bold text-primary-500' : 'font-medium text-slate-400'}`}>
                    Lainnya
                  </span>
                </button>
              </div>
            </div>
          </div>
        </nav>
      </div>
    </>
  );
}

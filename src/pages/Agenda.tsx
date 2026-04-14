import { useState } from 'react';
import { Calendar } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AgendaCard } from '../components/Cards';
import { AGENDA_TYPES } from '../types';

export default function Agenda() {
  const { agenda } = useApp();
  const [activeType, setActiveType] = useState('Semua');

  const filtered = activeType === 'Semua' ? agenda : agenda.filter(a => a.type === activeType);

  return (
    <div className="page-enter">
      <section className="bg-gradient-to-r from-primary-700 via-primary-600 to-primary-500 py-10 sm:py-16 lg:py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-3 py-1 text-primary-100 text-xs sm:text-sm mb-3 border border-white/10">
            <Calendar className="h-3.5 w-3.5" /> Agenda Sekolah
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-5xl font-extrabold text-white mb-3">Agenda Sekolah</h1>
          <p className="text-primary-100 text-sm sm:text-lg max-w-2xl mx-auto">
            Jadwal kegiatan dan acara penting di SMP Negeri 1 Genteng.
          </p>
        </div>
      </section>

      {/* Sticky filter - top-14 on mobile/tablet, top-16 on desktop */}
      <section className="py-4 sm:py-6 bg-white border-b border-gray-100 sticky top-14 lg:top-16 z-40 backdrop-blur-md bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => setActiveType('Semua')}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                activeType === 'Semua' ? 'bg-primary-500 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Semua
            </button>
            {AGENDA_TYPES.map(type => (
              <button
                key={type}
                onClick={() => setActiveType(type)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                  activeType === type ? 'bg-primary-500 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-8 sm:py-12 lg:py-16 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {filtered.length > 0 ? (
            <div className="space-y-3 sm:space-y-4">
              {filtered.map((item, i) => (
                <div key={item.id} className="animate-fadeInUp" style={{ animationDelay: `${i * 0.08}s` }}>
                  <AgendaCard item={item} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Tidak Ada Agenda</h3>
              <p className="text-gray-500 text-sm">Belum ada agenda untuk kategori ini.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

import { useEffect } from 'react';
import { Calendar, Clock, MapPin, X } from 'lucide-react';
import { AgendaItem, CATEGORY_COLORS } from '../types';

function formatFullDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

interface AgendaDetailModalProps {
  item: AgendaItem | null;
  onClose: () => void;
}

export default function AgendaDetailModal({ item, onClose }: AgendaDetailModalProps) {
  useEffect(() => {
    if (!item) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [item, onClose]);

  if (!item) return null;

  return (
    <div
      className="fixed inset-0 z-[70] bg-slate-950/75 backdrop-blur-sm overflow-y-auto overscroll-contain animate-fadeIn"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="agenda-detail-title"
    >
      <div className="min-h-full flex items-center justify-center px-4 py-6 sm:px-6 sm:py-10">
        <div
          className="relative w-full max-w-2xl bg-white rounded-[28px] shadow-2xl border border-white/70 overflow-hidden max-h-[calc(100vh-3rem)] sm:max-h-[min(90vh,48rem)] flex flex-col"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="bg-gradient-to-r from-primary-700 via-primary-600 to-primary-500 px-5 sm:px-7 py-5 sm:py-6 text-white">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${CATEGORY_COLORS[item.type] || 'bg-white/20 text-white'}`}>
                  {item.type}
                </span>
                <h2 id="agenda-detail-title" className="mt-3 text-xl sm:text-2xl font-extrabold leading-tight">{item.title}</h2>
                <p className="mt-2 text-sm text-primary-100">Klik di luar popup atau tekan `Esc` untuk menutup.</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="shrink-0 rounded-xl bg-white/10 hover:bg-white/20 p-2 transition-colors"
                aria-label="Tutup detail agenda"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="p-5 sm:p-7 space-y-5 overflow-y-auto">
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Tanggal Mulai</p>
                <p className="mt-1 text-sm sm:text-base font-bold text-slate-900">{formatFullDate(item.date)}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Tanggal Selesai</p>
                <p className="mt-1 text-sm sm:text-base font-bold text-slate-900">
                  {item.endDate ? formatFullDate(item.endDate) : 'Satu hari'}
                </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
                <div className="flex items-center gap-2 text-slate-500">
                  <Clock className="h-4 w-4" />
                  <p className="text-xs font-semibold uppercase tracking-wide">Waktu</p>
                </div>
                <p className="mt-1 text-sm sm:text-base font-bold text-slate-900">{item.time && item.time !== '-' ? item.time : 'Menyesuaikan'}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
                <div className="flex items-center gap-2 text-slate-500">
                  <MapPin className="h-4 w-4" />
                  <p className="text-xs font-semibold uppercase tracking-wide">Lokasi</p>
                </div>
                <p className="mt-1 text-sm sm:text-base font-bold text-slate-900">{item.location && item.location !== '-' ? item.location : 'Lokasi akan diinformasikan'}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-100 p-4 sm:p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Deskripsi Agenda</p>
              <p className="mt-2 text-sm sm:text-base leading-7 text-slate-700 whitespace-pre-line">
                {item.description || 'Deskripsi agenda belum tersedia.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

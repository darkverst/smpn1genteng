import {
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Info,
  Loader2,
  X,
  CloudCheck,
  HardDrive,
  Globe,
} from 'lucide-react';
import { isSupabaseStorageUrl, isBase64DataUrl } from '../services/storageService';

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface AdminToastProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

export function AdminToastContainer({ toasts, onDismiss }: AdminToastProps) {
  if (toasts.length === 0) return null;

  return (
    <aside
      aria-label="Notifikasi Sistem"
      className="fixed bottom-4 right-4 sm:top-5 sm:right-5 sm:bottom-auto z-[9999] flex flex-col gap-2.5 max-w-sm sm:max-w-md w-full px-3 sm:px-0 pointer-events-none"
    >
      {toasts.map((toast) => {
        let bgCls = 'bg-white border-gray-200 text-gray-800';
        let icon = <Info className="h-5 w-5 text-blue-500 shrink-0" />;

        if (toast.type === 'success') {
          bgCls = 'bg-emerald-50 border-emerald-200 text-emerald-950 shadow-emerald-100';
          icon = <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />;
        } else if (toast.type === 'error') {
          bgCls = 'bg-rose-50 border-rose-200 text-rose-950 shadow-rose-100';
          icon = <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0" />;
        } else if (toast.type === 'warning') {
          bgCls = 'bg-amber-50 border-amber-200 text-amber-950 shadow-amber-100';
          icon = <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />;
        } else if (toast.type === 'loading') {
          bgCls = 'bg-indigo-50 border-indigo-200 text-indigo-950 shadow-indigo-100';
          icon = <Loader2 className="h-5 w-5 text-indigo-600 animate-spin shrink-0" />;
        }

        return (
          <div
            key={toast.id}
            role="status"
            className={`pointer-events-auto rounded-xl border p-3.5 sm:p-4 shadow-lg backdrop-blur-md transition-all duration-300 animate-fadeIn flex items-start gap-3 ${bgCls}`}
          >
            <div className="pt-0.5">{icon}</div>
            <div className="flex-1 min-w-0 pr-1">
              <h4 className="text-xs sm:text-sm font-bold leading-tight">{toast.title}</h4>
              {toast.message && (
                <p className="text-[11px] sm:text-xs mt-1 opacity-90 leading-relaxed break-words whitespace-pre-line">
                  {toast.message}
                </p>
              )}
            </div>
            {toast.type !== 'loading' && (
              <button
                type="button"
                onClick={() => onDismiss(toast.id)}
                className="opacity-60 hover:opacity-100 p-1 rounded-md transition-opacity -mr-1 -mt-1 text-gray-500 hover:text-gray-800"
                aria-label="Tutup notifikasi"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        );
      })}
    </aside>
  );
}

/**
 * Visual badge untuk status penyimpanan gambar (Cloud CDN vs Lokal).
 */
export function ImageStorageBadge({
  url,
  className = '',
}: {
  url?: string | null;
  className?: string;
}) {
  if (!url) return null;

  if (isSupabaseStorageUrl(url)) {
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-[11px] font-semibold ${className}`}
        title="Gambar tersimpan secara aman di Supabase Cloud Storage CDN"
      >
        <CloudCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
        <span>Tersimpan di Cloud Storage Supabase</span>
      </div>
    );
  }

  if (isBase64DataUrl(url)) {
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-[11px] font-semibold ${className}`}
        title="Format Base64 tersimpan di dalam database lokal (belum diunggah ke storage terpisah)"
      >
        <HardDrive className="h-3.5 w-3.5 text-amber-600 shrink-0" />
        <span>Format Base64 Lokal</span>
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 bg-sky-50 text-sky-800 border border-sky-200 rounded-lg text-[11px] font-semibold ${className}`}
      title="URL Gambar Eksternal"
    >
      <Globe className="h-3.5 w-3.5 text-sky-600 shrink-0" />
      <span>URL Gambar Eksternal</span>
    </div>
  );
}

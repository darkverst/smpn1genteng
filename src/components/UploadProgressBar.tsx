import { Loader2, CheckCircle2, AlertTriangle, Cloud, Sparkles, X } from 'lucide-react';

export interface UploadState {
  isActive: boolean;
  fileName: string;
  stage: 'compressing' | 'uploading' | 'verifying' | 'done' | 'error';
  message: string;
  percent: number;
  stats?: {
    originalSize: string;
    compressedSize: string;
    savedPercent: number;
    isCloudStorage: boolean;
  };
}

interface UploadProgressBarProps {
  uploadState: UploadState;
  onClose?: () => void;
}

export function UploadProgressBar({ uploadState, onClose }: UploadProgressBarProps) {
  if (!uploadState.isActive) return null;

  const isDone = uploadState.stage === 'done';
  const isError = uploadState.stage === 'error';

  return (
    <div className="fixed bottom-4 left-4 sm:left-auto sm:right-6 sm:bottom-6 z-[9990] max-w-sm sm:max-w-md w-[calc(100%-2rem)] sm:w-full bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 animate-slideUp transition-all duration-300">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={`p-2 rounded-xl shrink-0 ${
            isDone
              ? 'bg-emerald-100 text-emerald-700'
              : isError
              ? 'bg-rose-100 text-rose-700'
              : 'bg-primary-100 text-primary-700 animate-pulse'
          }`}>
            {isDone ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : isError ? (
              <AlertTriangle className="h-5 w-5" />
            ) : (
              <Cloud className="h-5 w-5" />
            )}
          </div>
          <div className="min-w-0">
            <h4 className="text-xs sm:text-sm font-bold text-gray-900 truncate">
              {isDone ? 'Upload Selesai!' : isError ? 'Upload Terkendala' : 'Mengunggah Media...'}
            </h4>
            <p className="text-[11px] text-gray-500 truncate">{uploadState.fileName || 'Memproses file'}</p>
          </div>
        </div>

        {(isDone || isError) && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-md transition-colors"
            aria-label="Tutup status upload"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mt-3">
        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full transition-all duration-300 rounded-full ${
              isDone ? 'bg-emerald-500' : isError ? 'bg-rose-500' : 'bg-primary-600'
            }`}
            style={{ width: `${Math.min(100, Math.max(5, uploadState.percent))}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-1.5 text-[11px]">
          <span className="text-gray-600 flex items-center gap-1 font-medium">
            {!isDone && !isError && <Loader2 className="h-3 w-3 animate-spin text-primary-600" />}
            {uploadState.message}
          </span>
          <span className="text-gray-400 font-semibold">{uploadState.percent}%</span>
        </div>
      </div>

      {/* Stats jika selesai */}
      {uploadState.stats && (
        <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-600 bg-gray-50/80 -mx-4 -mb-4 px-4 py-2.5 rounded-b-2xl">
          <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
            <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
            <span>Hemat {uploadState.stats.savedPercent}%</span>
            <span className="text-gray-400">({uploadState.stats.originalSize} → {uploadState.stats.compressedSize})</span>
          </div>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
            uploadState.stats.isCloudStorage
              ? 'bg-emerald-100 text-emerald-800'
              : 'bg-amber-100 text-amber-800'
          }`}>
            {uploadState.stats.isCloudStorage ? 'CDN Cloud' : 'Lokal'}
          </span>
        </div>
      )}
    </div>
  );
}

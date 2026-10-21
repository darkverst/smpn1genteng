import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, ChevronDown, ChevronUp, Copy, Check, DatabaseZap } from 'lucide-react';

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode | ((props: { error: Error; resetErrorBoundary: () => void }) => ReactNode);
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onReset?: () => void;
  title?: string;
  subtitle?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
  copied: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
    errorInfo: null,
    showDetails: false,
    copied: false
  };

  public static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    // Also log in dev console
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
  }

  public resetErrorBoundary = (): void => {
    if (this.props.onReset) {
      this.props.onReset();
    }
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
      copied: false
    });
  };

  private handleCopyError = (): void => {
    const { error, errorInfo } = this.state;
    const text = `Error: ${error?.message || 'Unknown error'}\n\nStack:\n${error?.stack || 'No stack trace'}\n\nComponent Stack:\n${errorInfo?.componentStack || 'No component stack'}`;
    navigator.clipboard?.writeText(text).then(() => {
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 2000);
    }).catch(() => {
      // Fallback
    });
  };

  private handleClearCache = (): void => {
    const confirmed = window.confirm(
      'Apakah Anda yakin ingin membersihkan cache lokal browser? Data formulir yang belum tersimpan mungkin akan direset.'
    );
    if (confirmed) {
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch (err) {
        console.warn('Gagal membersihkan storage:', err);
      }
      window.location.reload();
    }
  };

  public render(): ReactNode {
    if (!this.state.hasError) {
      return this.props.children;
    }

    if (this.props.fallback) {
      if (typeof this.props.fallback === 'function') {
        return this.props.fallback({
          error: this.state.error || new Error('Terjadi kesalahan'),
          resetErrorBoundary: this.resetErrorBoundary
        });
      }
      return this.props.fallback;
    }

    const title = this.props.title || 'Terjadi Kendala pada Halaman';
    const subtitle =
      this.props.subtitle ||
      'Aplikasi mengalami kesalahan teknis yang tidak terduga. Data utama sekolah Anda tetap tersimpan dengan aman.';

    return (
      <div className="min-h-[50vh] flex items-center justify-center p-4 sm:p-6 bg-slate-50/50">
        <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl border border-red-100 p-6 sm:p-8 text-center animate-fade-in">
          {/* Icon Badge */}
          <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4 ring-8 ring-red-50/50 shadow-inner">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
            {title}
          </h2>
          <p className="text-sm text-gray-600 mb-6 leading-relaxed">
            {subtitle}
          </p>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
            <button
              onClick={() => window.location.reload()}
              type="button"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white text-sm font-semibold shadow-sm shadow-primary-500/20 transition-all duration-150"
            >
              <RefreshCw className="w-4 h-4" />
              Muat Ulang Halaman
            </button>

            <button
              onClick={this.resetErrorBoundary}
              type="button"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold transition-all duration-150"
            >
              Coba Pulihkan
            </button>

            <a
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-semibold transition-all duration-150"
            >
              <Home className="w-4 h-4" />
              Ke Beranda
            </a>
          </div>

          {/* Secondary Action: Reset Local Storage */}
          <div className="pt-4 border-t border-gray-100">
            <button
              onClick={this.handleClearCache}
              type="button"
              className="inline-flex items-center gap-1.5 text-xs text-amber-700 hover:text-amber-800 font-medium py-1 px-2 rounded-lg hover:bg-amber-50 transition-colors"
            >
              <DatabaseZap className="w-3.5 h-3.5" />
              Jika masalah berulang: Bersihkan Cache Offline Browser
            </button>
          </div>

          {/* Technical Diagnostics Accordion */}
          {this.state.error && (
            <div className="mt-4 text-left">
              <button
                type="button"
                onClick={() => this.setState((prev) => ({ showDetails: !prev.showDetails }))}
                className="w-full flex items-center justify-between text-xs text-gray-500 hover:text-gray-800 py-2 px-3 rounded-lg bg-gray-50 border border-gray-100"
              >
                <span className="font-semibold">Detail Teknis (Informasi Diagnostik)</span>
                {this.state.showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {this.state.showDetails && (
                <div className="mt-2 p-3 bg-slate-900 text-slate-100 rounded-xl text-xs font-mono relative overflow-hidden border border-slate-800">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                    <span className="text-red-400 font-bold truncate pr-2">
                      {this.state.error.name}: {this.state.error.message}
                    </span>
                    <button
                      type="button"
                      onClick={this.handleCopyError}
                      className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors shrink-0"
                    >
                      {this.state.copied ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>Tersalin</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Salin Error</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="max-h-48 overflow-y-auto text-[11px] text-slate-400 whitespace-pre-wrap font-mono leading-relaxed">
                    {this.state.error.stack || 'No stack trace available'}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }
}

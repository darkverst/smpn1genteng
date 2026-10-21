import { useState, useMemo } from "react";
import {
  Activity,
  BarChart3,
  CheckCircle,
  Eye,
  FileSearch,
  FileText,
  Globe,
  ImagePlus,
  Link2,
  MousePointerClick,
  RotateCcw,
  Save,
  Search,
  Shield,
  Tag,
  TrendingUp,
  Users,
  X
} from "lucide-react";
import { uploadImageWithDetails } from "../../../services/storageService";
import { ImageStorageBadge } from "../../../components/AdminToast";
import type { SEOData, AnalyticsData } from "../../../types";

/* Simple mini bar chart component */
function MiniBarChart({ data, maxBars = 30 }: { data: { label: string; value: number; secondary?: number }[]; maxBars?: number }) {
  const sliced = data.slice(-maxBars);
  const maxVal = Math.max(...sliced.map(d => Math.max(d.value, d.secondary || 0)), 1);
  return (
    <div className="flex items-end gap-[3px] sm:gap-1 h-32 sm:h-40 w-full">
      {sliced.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-[2px] h-full justify-end group relative min-w-0">
          {/* Tooltip */}
          <div className="absolute bottom-full mb-1 bg-gray-900 text-white text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
            {d.label}: {d.value} views{d.secondary ? `, ${d.secondary} sesi` : ''}
          </div>
          {d.secondary !== undefined && d.secondary > 0 && (
            <div
              className="w-full bg-green-400 rounded-t-sm min-h-[2px] transition-all"
              style={{ height: `${(d.secondary / maxVal) * 100}%` }}
            />
          )}
          <div
            className="w-full bg-primary-400 hover:bg-primary-500 rounded-t-sm min-h-[2px] transition-all cursor-pointer"
            style={{ height: `${(d.value / maxVal) * 100}%` }}
          />
          {/* Show date label for every 5th bar */}
          {(i % Math.ceil(sliced.length / 6) === 0 || i === sliced.length - 1) && (
            <span className="text-[7px] sm:text-[8px] text-gray-400 mt-0.5 truncate w-full text-center">
              {d.label.slice(5)}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

export interface SEOAnalyticsTabProps {
  seoForm: SEOData;
  setSeoForm: (s: SEOData) => void;
  saveSeo: () => void;
  seoSaved: boolean;
  analyticsData: AnalyticsData;
  resetAnalytics: () => void;
  inputCls: string;
  labelCls: string;
}

export default function SEOAnalyticsTab({
  seoForm, setSeoForm, saveSeo, seoSaved,
  analyticsData, resetAnalytics,
  inputCls, labelCls,
}: SEOAnalyticsTabProps) {
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Calculate analytics derived data
  const today = new Date().toISOString().split('T')[0];
  const last7Days = new Date(); last7Days.setDate(last7Days.getDate() - 7);
  const last7Str = last7Days.toISOString().split('T')[0];
  const last30Days = new Date(); last30Days.setDate(last30Days.getDate() - 30);
  const last30Str = last30Days.toISOString().split('T')[0];

  const todayViews = analyticsData.dailyViews.find(d => d.date === today)?.views || 0;
  const todaySessions = analyticsData.dailyViews.find(d => d.date === today)?.sessions || 0;
  const weekViews = analyticsData.dailyViews.filter(d => d.date >= last7Str).reduce((a, b) => a + b.views, 0);
  const weekSessions = analyticsData.dailyViews.filter(d => d.date >= last7Str).reduce((a, b) => a + b.sessions, 0);
  const monthViews = analyticsData.dailyViews.filter(d => d.date >= last30Str).reduce((a, b) => a + b.views, 0);

  // Prepare chart data (last 30 days)
  const chartData = useMemo(() => {
    const result: { label: string; value: number; secondary: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const found = analyticsData.dailyViews.find(dv => dv.date === dateStr);
      result.push({
        label: dateStr,
        value: found?.views || 0,
        secondary: found?.sessions || 0,
      });
    }
    return result;
  }, [analyticsData.dailyViews]);

  // Sort pages by views
  const topPages = useMemo(() => {
    return Object.entries(analyticsData.pageViews)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10);
  }, [analyticsData.pageViews]);

  // Sort referrers
  const topReferrers = useMemo(() => {
    return Object.entries(analyticsData.referrers)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);
  }, [analyticsData.referrers]);

  const [ogUploadState, setOgUploadState] = useState<{ isUploading: boolean; message: string }>({
    isUploading: false,
    message: '',
  });

  const handleOgImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) { alert('Ukuran file maksimal 15MB'); return; }
    setOgUploadState({ isUploading: true, message: 'Mengompresi dan mengunggah gambar SEO...' });
    try {
      const res = await uploadImageWithDetails(file, 'seo', { maxWidth: 1200, maxHeight: 630, quality: 0.8 });
      setSeoForm({ ...seoForm, ogImage: res.url });
    } catch {
      alert('Gagal memproses gambar SEO.');
    } finally {
      setOgUploadState({ isUploading: false, message: '' });
      e.target.value = '';
    }
  };

  return (
    <div className="animate-fadeIn space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg sm:text-2xl font-extrabold text-gray-900">SEO & Analitik</h2>
        {seoSaved && <span className="flex items-center gap-1 text-green-600 text-xs sm:text-sm font-semibold animate-fadeIn"><CheckCircle className="h-4 w-4" /> Tersimpan!</span>}
      </div>

      {/* ---- ANALYTICS SECTION ---- */}
      <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm sm:text-base font-bold text-gray-900 flex items-center gap-2">
            <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-primary-500" />
            Statistik Pengunjung
          </h3>
          <button
            onClick={() => setShowResetConfirm(true)}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors"
          >
            <RotateCcw className="h-3 w-3" /> Reset
          </button>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-5">
          {[
            { icon: Eye, label: 'Total Views', value: analyticsData.totalPageViews, color: 'from-primary-400 to-primary-600', bg: 'bg-primary-50' },
            { icon: Users, label: 'Total Sesi', value: analyticsData.totalSessions, color: 'from-green-400 to-green-600', bg: 'bg-green-50' },
            { icon: MousePointerClick, label: 'Views Hari Ini', value: todayViews, sub: `${todaySessions} sesi`, color: 'from-accent-400 to-accent-600', bg: 'bg-amber-50' },
            { icon: TrendingUp, label: '7 Hari Terakhir', value: weekViews, sub: `${weekSessions} sesi`, color: 'from-purple-400 to-purple-600', bg: 'bg-purple-50' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-xl p-3 sm:p-4 border border-gray-100`}>
              <div className={`w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br ${s.color} rounded-lg flex items-center justify-center mb-1.5 shadow-sm`}>
                <s.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
              </div>
              <div className="text-lg sm:text-xl font-extrabold text-gray-900">{s.value.toLocaleString()}</div>
              <div className="text-[10px] sm:text-xs text-gray-500">{s.label}</div>
              {'sub' in s && s.sub && <div className="text-[9px] sm:text-[10px] text-gray-400 mt-0.5">{s.sub}</div>}
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs sm:text-sm font-semibold text-gray-700">Grafik 30 Hari Terakhir</h4>
            <div className="flex items-center gap-3 text-[10px] sm:text-xs">
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-primary-400 rounded-sm" /> Views</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-green-400 rounded-sm" /> Sesi</span>
            </div>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 sm:p-4 border border-gray-100">
            <MiniBarChart data={chartData} maxBars={30} />
          </div>
          <div className="flex justify-between mt-1 px-1">
            <span className="text-[9px] text-gray-400">30 hari lalu</span>
            <span className="text-[9px] text-gray-400">Hari ini</span>
          </div>
        </div>

        {/* Top pages & referrers */}
        <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
              <FileSearch className="h-3.5 w-3.5 text-primary-500" /> Halaman Populer
            </h4>
            <div className="bg-gray-50 rounded-xl border border-gray-100 overflow-hidden">
              {topPages.length > 0 ? topPages.map(([page, views], i) => (
                <div key={page} className="flex items-center justify-between px-3 py-2 border-b border-gray-100 last:border-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[10px] text-gray-400 font-bold w-4">{i + 1}.</span>
                    <span className="text-xs sm:text-sm text-gray-700 truncate">{page}</span>
                  </div>
                  <span className="text-xs font-semibold text-primary-600 shrink-0">{views}</span>
                </div>
              )) : (
                <div className="px-3 py-4 text-center text-xs text-gray-400">Belum ada data</div>
              )}
            </div>
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
              <Link2 className="h-3.5 w-3.5 text-green-500" /> Sumber Referral
            </h4>
            <div className="bg-gray-50 rounded-xl border border-gray-100 overflow-hidden">
              {topReferrers.length > 0 ? topReferrers.map(([ref, count], i) => (
                <div key={ref} className="flex items-center justify-between px-3 py-2 border-b border-gray-100 last:border-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[10px] text-gray-400 font-bold w-4">{i + 1}.</span>
                    <span className="text-xs sm:text-sm text-gray-700 truncate">{ref}</span>
                  </div>
                  <span className="text-xs font-semibold text-green-600 shrink-0">{count}</span>
                </div>
              )) : (
                <div className="px-3 py-4 text-center text-xs text-gray-400">Belum ada data referral</div>
              )}
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="mt-4 bg-primary-50 rounded-xl p-3 border border-primary-100">
          <p className="text-[10px] sm:text-xs text-primary-700 leading-relaxed">
            <strong>ℹ️ Info:</strong> Data analitik disimpan di database. Pastikan koneksi database aktif agar tracking lintas perangkat konsisten, 
            hubungkan Google Analytics ID di pengaturan SEO di bawah. Total views bulan ini: <strong>{monthViews.toLocaleString()}</strong>.
          </p>
        </div>
      </div>

      {/* ---- SEO SETTINGS SECTION ---- */}
      <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 space-y-4">
        <h3 className="text-sm sm:text-base font-bold text-gray-900 flex items-center gap-2">
          <Search className="h-4 w-4 sm:h-5 sm:w-5 text-primary-500" />
          Pengaturan Meta SEO
        </h3>

        {/* SEO Preview */}
        <div className="bg-gray-50 rounded-xl p-3 sm:p-4 border border-gray-100">
          <p className="text-[10px] sm:text-xs text-gray-400 mb-1 font-medium">Preview Google Search:</p>
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <p className="text-blue-700 text-sm sm:text-base font-medium truncate hover:underline cursor-pointer">
              {seoForm.metaTitle || 'Judul Halaman'}
            </p>
            <p className="text-green-700 text-xs truncate mt-0.5">
              {seoForm.canonicalUrl || 'https://sekolah.sch.id'}
            </p>
            <p className="text-gray-600 text-xs mt-1 line-clamp-2 leading-relaxed">
              {seoForm.metaDescription || 'Deskripsi halaman akan muncul di sini...'}
            </p>
          </div>
        </div>

        <div>
          <label className={labelCls}><Tag className="inline h-3.5 w-3.5 mr-1" />Meta Title</label>
          <input type="text" value={seoForm.metaTitle} onChange={e => setSeoForm({ ...seoForm, metaTitle: e.target.value })} className={inputCls} placeholder="Judul website untuk hasil pencarian" />
          <p className="text-[10px] text-gray-400 mt-1">{seoForm.metaTitle.length}/60 karakter (ideal: 50-60)</p>
        </div>

        <div>
          <label className={labelCls}><FileText className="inline h-3.5 w-3.5 mr-1" />Meta Description</label>
          <textarea rows={3} value={seoForm.metaDescription} onChange={e => setSeoForm({ ...seoForm, metaDescription: e.target.value })} className={inputCls + ' resize-none'} placeholder="Deskripsi singkat website..." />
          <p className="text-[10px] text-gray-400 mt-1">{seoForm.metaDescription.length}/160 karakter (ideal: 150-160)</p>
        </div>

        <div>
          <label className={labelCls}><Tag className="inline h-3.5 w-3.5 mr-1" />Meta Keywords</label>
          <input type="text" value={seoForm.metaKeywords} onChange={e => setSeoForm({ ...seoForm, metaKeywords: e.target.value })} className={inputCls} placeholder="kata kunci 1, kata kunci 2, ..." />
          <p className="text-[10px] text-gray-400 mt-1">Pisahkan dengan koma. Contoh: nama sekolah, pendidikan, SMA/SMK/MA</p>
        </div>

        <div>
          <label className={labelCls}><Shield className="inline h-3.5 w-3.5 mr-1" />Robots Meta</label>
          <select value={seoForm.robots} onChange={e => setSeoForm({ ...seoForm, robots: e.target.value })} className={inputCls}>
            <option value="index, follow">index, follow (Rekomendasi)</option>
            <option value="index, nofollow">index, nofollow</option>
            <option value="noindex, follow">noindex, follow</option>
            <option value="noindex, nofollow">noindex, nofollow</option>
          </select>
        </div>
      </div>

      {/* Open Graph */}
      <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 space-y-4">
        <h3 className="text-sm sm:text-base font-bold text-gray-900 flex items-center gap-2">
          <Globe className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
          Open Graph (Social Media)
        </h3>

        <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className={labelCls}>OG Type</label>
            <select value={seoForm.ogType} onChange={e => setSeoForm({ ...seoForm, ogType: e.target.value })} className={inputCls}>
              <option value="website">website</option>
              <option value="article">article</option>
              <option value="school">school</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Canonical URL</label>
            <input type="url" value={seoForm.canonicalUrl} onChange={e => setSeoForm({ ...seoForm, canonicalUrl: e.target.value })} className={inputCls} placeholder="https://sekolah.sch.id" />
          </div>
        </div>

        <div>
          <label className={labelCls}>OG Image (Gambar Share)</label>
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center">
            {ogUploadState.isUploading ? (
              <div className="py-4 flex flex-col items-center justify-center gap-2">
                <div className="h-6 w-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-gray-500 font-medium">{ogUploadState.message}</p>
              </div>
            ) : seoForm.ogImage ? (
              <div className="flex flex-col items-center gap-2">
                <div className="relative inline-block">
                  <img src={seoForm.ogImage} alt="OG" className="h-24 sm:h-32 rounded-lg object-cover" />
                  <button onClick={() => setSeoForm({ ...seoForm, ogImage: '' })} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md"><X className="h-3 w-3" /></button>
                </div>
                <ImageStorageBadge url={seoForm.ogImage} />
              </div>
            ) : (
              <label className="cursor-pointer">
                <ImagePlus className="h-8 w-8 text-gray-300 mx-auto mb-1" />
                <p className="text-xs text-gray-500">Upload gambar share (1200x630px ideal)</p>
                <input type="file" accept="image/*" className="hidden" onChange={handleOgImageUpload} />
              </label>
            )}
          </div>
        </div>
      </div>

      {/* Verification & Analytics */}
      <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 space-y-4">
        <h3 className="text-sm sm:text-base font-bold text-gray-900 flex items-center gap-2">
          <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
          Verifikasi & Analytics
        </h3>

        <div>
          <label className={labelCls}>Google Analytics ID</label>
          <input type="text" value={seoForm.googleAnalyticsId} onChange={e => setSeoForm({ ...seoForm, googleAnalyticsId: e.target.value })} className={inputCls} placeholder="G-XXXXXXXXXX atau UA-XXXXXXX-X" />
          <p className="text-[10px] text-gray-400 mt-1">Masukkan Measurement ID dari Google Analytics 4 untuk tracking pengunjung secara real-time.</p>
        </div>

        <div>
          <label className={labelCls}>Google Search Console Verification</label>
          <input type="text" value={seoForm.googleVerification} onChange={e => setSeoForm({ ...seoForm, googleVerification: e.target.value })} className={inputCls} placeholder="Kode verifikasi dari Google Search Console" />
          <p className="text-[10px] text-gray-400 mt-1">Didapat dari Google Search Console → Settings → Ownership Verification → HTML Tag.</p>
        </div>

        <div>
          <label className={labelCls}>Bing Webmaster Verification</label>
          <input type="text" value={seoForm.bingVerification} onChange={e => setSeoForm({ ...seoForm, bingVerification: e.target.value })} className={inputCls} placeholder="Kode verifikasi Bing Webmaster" />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button onClick={saveSeo} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-xl text-sm font-semibold hover:bg-primary-600 shadow-lg">
          <Save className="h-4 w-4" /> Simpan Pengaturan SEO
        </button>
      </div>

      {/* Reset Analytics Confirmation */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 animate-fadeIn" onClick={() => setShowResetConfirm(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-5 sm:p-6 animate-scaleIn" onClick={e => e.stopPropagation()}>
            <div className="text-center">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <RotateCcw className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-1">Reset Data Analitik?</h3>
              <p className="text-gray-500 text-xs sm:text-sm mb-4">Semua data statistik pengunjung akan dihapus dan dimulai dari nol.</p>
              <div className="flex gap-2">
                <button onClick={() => setShowResetConfirm(false)} className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium">Batal</button>
                <button onClick={() => { resetAnalytics(); setShowResetConfirm(false); }} className="flex-1 px-4 py-2.5 bg-amber-500 text-white rounded-xl text-sm font-semibold">Reset</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
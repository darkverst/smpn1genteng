import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ExternalLink as ExternalLinkIcon,
  Search,
  Globe,
  Link2,
  Building2,
  GraduationCap,
  Users,
  Compass,
  ArrowRight,
  ShieldCheck,
  Share2,
  Check
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { EXTERNAL_LINK_CATEGORIES } from '../types';
import { getButtonStyle } from '../utils/themeStyles';

const CATEGORY_ICONS: Record<string, typeof Globe> = {
  'Pemerintah & Dinas': Building2,
  'Sub-Web Sekolah': GraduationCap,
  'Akademik & Belajar': Globe,
  'PPDB & Pendaftaran': Compass,
  'Organisasi Siswa': Users,
  'Lainnya': Link2,
};

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'Pemerintah & Dinas': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  'Sub-Web Sekolah': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  'Akademik & Belajar': { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  'PPDB & Pendaftaran': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  'Organisasi Siswa': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  'Lainnya': { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' },
};

export default function Tautan() {
  const { externalLinks, schoolIdentity } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const activeLinks = useMemo(() => {
    return (externalLinks || [])
      .filter(link => link.isActive)
      .sort((a, b) => a.order - b.order);
  }, [externalLinks]);

  const categories = useMemo(() => {
    const presentCats = activeLinks.map(l => l.category).filter(Boolean);
    const set = new Set([...EXTERNAL_LINK_CATEGORIES, ...presentCats]);
    return ['Semua', ...Array.from(set)];
  }, [activeLinks]);

  const filteredLinks = useMemo(() => {
    return activeLinks.filter(link => {
      const matchCategory = selectedCategory === 'Semua' || link.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        link.title.toLowerCase().includes(q) ||
        link.url.toLowerCase().includes(q) ||
        (link.description && link.description.toLowerCase().includes(q)) ||
        (link.badge && link.badge.toLowerCase().includes(q));
      return matchCategory && matchSearch;
    });
  }, [activeLinks, selectedCategory, searchQuery]);

  const handleCopyLink = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getCleanDomain = (rawUrl: string) => {
    try {
      const parsed = new URL(rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`);
      return parsed.hostname;
    } catch {
      return rawUrl;
    }
  };

  return (
    <div className="page-enter">
      {/* Hero Header */}
      <section className="bg-gradient-to-r from-primary-700 via-primary-600 to-primary-500 py-10 sm:py-16 lg:py-20 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-3.5 py-1 text-primary-100 text-xs sm:text-sm mb-3 border border-white/10 backdrop-blur-sm">
            <Link2 className="h-3.5 w-3.5 text-accent-300" />
            <span>Direktori Tautan & Layanan Terkait</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-5xl font-extrabold text-white mb-3 tracking-tight">
            Tautan Eksternal & Portal Terkait
          </h1>
          <p className="text-primary-100 text-sm sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Akses langsung ke portal resmi pemerintah, dinas pendidikan, sub-website sekolah, platform pembelajaran, serta layanan penting lainnya.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="py-8 sm:py-12 lg:py-16 bg-slate-50 min-h-[60vh]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Controls: Search and Categories */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5 mb-8 sm:mb-10 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Category Pills */}
              <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
                {categories.map(cat => {
                  const isActive = selectedCategory === cat;
                  const Icon = CATEGORY_ICONS[cat] || Globe;
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap shrink-0 ${
                        isActive
                          ? 'bg-primary-500 text-white shadow-sm shadow-primary-500/25 ring-2 ring-primary-500/30'
                          : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200/60'
                      }`}
                    >
                      {cat !== 'Semua' && <Icon className="h-3.5 w-3.5" />}
                      <span>{cat}</span>
                    </button>
                  );
                })}
              </div>

              {/* Search Box */}
              <div className="relative w-full md:w-72 shrink-0">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari portal atau layanan..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-gray-50 hover:bg-white focus:bg-white border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Links Grid */}
          {filteredLinks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {filteredLinks.map(link => {
                const CategoryIcon = CATEGORY_ICONS[link.category] || Globe;
                const catColor = CATEGORY_COLORS[link.category] || CATEGORY_COLORS['Lainnya'];
                const domain = getCleanDomain(link.url);
                const isCopied = copiedId === link.id;

                return (
                  <div
                    key={link.id}
                    className="group bg-white rounded-2xl border border-gray-100 hover:border-primary-200/70 p-5 sm:p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Bar: Category badge & Badges */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg border ${catColor.bg} ${catColor.text} ${catColor.border}`}>
                          <CategoryIcon className="h-3 w-3" />
                          <span>{link.category}</span>
                        </span>

                        <div className="flex items-center gap-1.5">
                          {link.badge && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-accent-100 text-accent-800 border border-accent-200/50">
                              {link.badge}
                            </span>
                          )}
                          <button
                            onClick={() => handleCopyLink(link.id, link.url)}
                            title="Salin alamat link"
                            className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            {isCopied ? (
                              <Check className="h-3.5 w-3.5 text-green-600" />
                            ) : (
                              <Share2 className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Title & Domain */}
                      <h3 className="text-base sm:text-lg font-bold text-gray-900 group-hover:text-primary-600 transition-colors leading-snug line-clamp-2 mb-1.5">
                        {link.title}
                      </h3>

                      <p className="text-xs text-primary-600/90 font-mono flex items-center gap-1 mb-2.5">
                        <Globe className="h-3 w-3 shrink-0" />
                        <span className="truncate">{domain}</span>
                      </p>

                      {/* Description */}
                      <p className="text-xs sm:text-sm text-gray-600 leading-relaxed line-clamp-3 mb-5">
                        {link.description || 'Kunjungi tautan untuk mengakses layanan dan informasi lebih lanjut.'}
                      </p>
                    </div>

                    {/* Action Button */}
                    <a
                      href={link.url}
                      target={link.openInNewTab ? '_blank' : '_self'}
                      rel="noopener noreferrer"
                      className={getButtonStyle(
                        schoolIdentity.buttonStyle,
                        "w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-50 hover:bg-primary-500 text-primary-700 hover:text-white rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 group/btn"
                      )}
                    >
                      <span>Buka Website Resmi</span>
                      <ExternalLinkIcon className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                    </a>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 sm:p-12 text-center max-w-md mx-auto shadow-sm">
              <div className="w-12 h-12 bg-gray-100 text-gray-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Search className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-1">Tautan Tidak Ditemukan</h3>
              <p className="text-xs sm:text-sm text-gray-500 mb-4">
                Tidak ada tautan yang sesuai dengan filter atau kata kunci "{searchQuery}".
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('Semua');
                  setSearchQuery('');
                }}
                className="px-4 py-2 bg-primary-50 text-primary-600 hover:bg-primary-100 rounded-xl text-xs font-semibold transition-colors"
              >
                Reset Pencarian
              </button>
            </div>
          )}

          {/* Bottom Suggestion Banner */}
          <div className="mt-12 sm:mt-16 bg-gradient-to-br from-primary-900 to-primary-800 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg">
            <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-48 h-48 bg-primary-400/10 rounded-full blur-2xl" />
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left space-y-2">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-accent-300 uppercase tracking-wider">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Keamanan & Validitas Tautan</span>
                </div>
                <h4 className="text-lg sm:text-2xl font-extrabold text-white">
                  Tautan Eksternal Diverifikasi oleh Sekolah
                </h4>
                <p className="text-xs sm:text-sm text-primary-200 max-w-xl">
                  Seluruh tautan yang ditampilkan mengarah ke portal resmi pemerintah, dinas pendidikan terkait, dan lembaga kredibel. Selalu pastikan alamat domain resmi sebelum memasukkan data pribadi.
                </p>
              </div>
              <Link
                to="/kontak"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-accent-400 hover:bg-accent-500 text-primary-950 font-bold text-xs sm:text-sm shadow-md transition-all shrink-0"
              >
                <span>Usulkan Tautan Baru</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

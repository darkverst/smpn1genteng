import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Award, Calendar, MapPin, Users, Search, Trophy, CheckCircle, Sparkles, X, ChevronRight, Camera, ExternalLink, Images } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DEFAULT_ESKUL_CATEGORIES, ExtracurricularItem } from '../types';

const CATEGORY_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  'Keagamaan': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  'Olahraga': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  'Seni & Budaya': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  'Kepemimpinan': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  'Akademik': { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200' },
};

export default function Ekstrakurikuler() {
  const { extracurricular, eskulCategories, gallery = [], schoolIdentity } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<ExtracurricularItem | null>(null);

  const activeItems = useMemo(() => {
    return extracurricular.filter(item => item.isActive);
  }, [extracurricular]);

  const availableCategories = useMemo(() => {
    const base = eskulCategories && eskulCategories.length > 0 ? eskulCategories : DEFAULT_ESKUL_CATEGORIES;
    const usedCats = activeItems.map(i => i.category).filter(Boolean);
    return ['Semua', ...Array.from(new Set([...base, ...usedCats]))];
  }, [eskulCategories, activeItems]);

  const filteredItems = useMemo(() => {
    return activeItems.filter(item => {
      const matchCategory = selectedCategory === 'Semua' || item.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.coach.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q) ||
        (item.achievements && item.achievements.some(a => a.toLowerCase().includes(q)));
      return matchCategory && matchSearch;
    });
  }, [activeItems, selectedCategory, searchQuery]);

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
            <Trophy className="h-3.5 w-3.5 text-accent-300" />
            <span>Pengembangan Bakat & Minat Siswa</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-5xl font-extrabold text-white mb-3 tracking-tight">
            Ekstrakurikuler {schoolIdentity.schoolName || 'Sekolah'}
          </h1>
          <p className="text-primary-100 text-sm sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Menumbuhkan potensi kepemimpinan, bakat, minat, seni, olahraga, dan wawasan peserta didik.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="py-8 sm:py-12 lg:py-16 bg-slate-50 min-h-[60vh]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Controls: Category Filter & Search */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5 mb-8 sm:mb-10 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Category Pills */}
              <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
                {availableCategories.map(cat => {
                  const isActive = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                        isActive
                          ? 'bg-primary-600 text-white shadow-md shadow-primary-500/20'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>

              {/* Search Bar */}
              <div className="relative min-w-[240px] sm:w-72">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Cari eskul, pembina, prestasi..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Total Results Counter */}
            <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
              <span>Menampilkan <strong className="text-gray-900">{filteredItems.length}</strong> kegiatan ekstrakurikuler</span>
              {selectedCategory !== 'Semua' && (
                <span>Filter: <strong className="text-primary-600">{selectedCategory}</strong></span>
              )}
            </div>
          </div>

          {/* Cards Grid */}
          {filteredItems.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 sm:p-16 text-center border border-gray-100 shadow-sm">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-gray-400">
                <Trophy className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Tidak ada ekstrakurikuler ditemukan</h3>
              <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
                Coba sesuaikan kata kunci pencarian Anda atau pilih kategori lain.
              </p>
              <button
                onClick={() => { setSelectedCategory('Semua'); setSearchQuery(''); }}
                className="px-4 py-2 bg-primary-600 text-white text-xs sm:text-sm font-semibold rounded-xl hover:bg-primary-700 transition-colors"
              >
                Reset Filter
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {filteredItems.map(item => {
                const badge = CATEGORY_STYLES[item.category] || { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' };

                return (
                  <div
                    key={item.id}
                    className="group bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col hover:-translate-y-1"
                  >
                    {/* Header Image or Decorative Gradient */}
                    <div className="relative h-44 sm:h-48 overflow-hidden bg-gradient-to-br from-primary-800 via-primary-700 to-primary-900">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-white text-center relative overflow-hidden">
                          <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-2 border border-white/20 backdrop-blur-sm group-hover:scale-110 transition-transform">
                            <Award className="h-7 w-7 text-accent-300" />
                          </div>
                          <span className="text-xs uppercase tracking-widest text-primary-200 font-semibold">{item.category}</span>
                        </div>
                      )}

                      {/* Category Badge overlay */}
                      <div className="absolute top-3 left-3">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md shadow-sm border ${badge.bg}/90 ${badge.text} ${badge.border}`}>
                          <Sparkles className="h-3 w-3" />
                          {item.category}
                        </span>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-5 sm:p-6 flex-1 flex flex-col">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors mb-2">
                        {item.name}
                      </h3>

                      <p className="text-xs sm:text-sm text-gray-600 line-clamp-3 leading-relaxed mb-4 flex-1">
                        {item.description}
                      </p>

                      {/* Metadata Details */}
                      <div className="space-y-2 pt-3 border-t border-gray-100 text-xs text-gray-600">
                        {item.schedule && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3.5 w-3.5 text-primary-600 shrink-0" />
                            <span className="truncate">{item.schedule}</span>
                          </div>
                        )}
                        {item.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3.5 w-3.5 text-primary-600 shrink-0" />
                            <span className="truncate">{item.location}</span>
                          </div>
                        )}
                        {item.coach && (
                          <div className="flex items-center gap-2">
                            <Users className="h-3.5 w-3.5 text-primary-600 shrink-0" />
                            <span className="truncate">Pembina: <strong>{item.coach}</strong></span>
                          </div>
                        )}
                      </div>

                      {/* Achievements Preview */}
                      {item.achievements && item.achievements.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-gray-100">
                          <div className="flex items-center gap-1.5 text-accent-700 text-xs font-semibold mb-1.5">
                            <Trophy className="h-3.5 w-3.5 text-accent-500" />
                            <span>Prestasi Terkini:</span>
                          </div>
                          <ul className="space-y-1">
                            {item.achievements.slice(0, 2).map((ach, idx) => (
                              <li key={idx} className="flex items-start gap-1.5 text-[11px] text-gray-600">
                                <CheckCircle className="h-3 w-3 text-emerald-500 mt-0.5 shrink-0" />
                                <span className="line-clamp-1">{ach}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Linked Gallery Badge */}
                      {item.galleryId && (() => {
                        const linkedGallery = gallery.find(g => g.id === item.galleryId);
                        if (!linkedGallery) return null;
                        const pCount = (linkedGallery.images && linkedGallery.images.length > 0) ? linkedGallery.images.length : (linkedGallery.image ? 1 : 0);
                        return (
                          <div className="flex items-center gap-1.5 text-xs text-primary-700 bg-primary-50 px-2.5 py-1.5 rounded-xl border border-primary-100 mt-3">
                            <Camera className="h-3.5 w-3.5 text-primary-600 shrink-0" />
                            <span className="truncate">Galeri: <strong>{linkedGallery.title}</strong></span>
                            {pCount > 1 && (
                              <span className="ml-auto text-[10px] font-semibold bg-primary-200 text-primary-800 px-1.5 py-0.5 rounded-full shrink-0">
                                {pCount} Foto
                              </span>
                            )}
                          </div>
                        );
                      })()}

                      {/* Detail Button */}
                      <button
                        onClick={() => setSelectedItem(item)}
                        className="mt-5 w-full py-2.5 px-4 bg-primary-50 hover:bg-primary-600 text-primary-700 hover:text-white rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 group/btn"
                      >
                        <span>Lihat Detail Eskul</span>
                        <ChevronRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-gray-100 animate-scaleUp max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="relative h-48 bg-gradient-to-br from-primary-800 to-primary-600 shrink-0">
              {selectedItem.image ? (
                <img src={selectedItem.image} alt={selectedItem.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-white">
                  <Trophy className="h-12 w-12 text-accent-300 mb-2" />
                  <span className="text-xs uppercase tracking-wider font-semibold text-primary-200">
                    {selectedItem.category}
                  </span>
                </div>
              )}
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-3 right-3 w-9 h-9 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center backdrop-blur-sm transition-colors"
                aria-label="Tutup modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-primary-100 text-primary-700 text-xs font-semibold rounded-full">
                  {selectedItem.category}
                </span>
                <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                  <CheckCircle className="h-3.5 w-3.5" /> Aktif
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900">
                {selectedItem.name}
              </h3>

              <p className="text-sm text-gray-600 leading-relaxed">
                {selectedItem.description}
              </p>

              <div className="bg-gray-50 rounded-2xl p-4 space-y-2.5 text-xs sm:text-sm text-gray-700 border border-gray-100">
                {selectedItem.schedule && (
                  <div className="flex items-start gap-2.5">
                    <Calendar className="h-4 w-4 text-primary-600 mt-0.5 shrink-0" />
                    <div>
                      <span className="font-semibold text-gray-900">Jadwal:</span> {selectedItem.schedule}
                    </div>
                  </div>
                )}
                {selectedItem.location && (
                  <div className="flex items-start gap-2.5">
                    <MapPin className="h-4 w-4 text-primary-600 mt-0.5 shrink-0" />
                    <div>
                      <span className="font-semibold text-gray-900">Lokasi:</span> {selectedItem.location}
                    </div>
                  </div>
                )}
                {selectedItem.coach && (
                  <div className="flex items-start gap-2.5">
                    <Users className="h-4 w-4 text-primary-600 mt-0.5 shrink-0" />
                    <div>
                      <span className="font-semibold text-gray-900">Pembina / Pelatih:</span> {selectedItem.coach}
                    </div>
                  </div>
                )}
              </div>

              {/* Achievements */}
              {selectedItem.achievements && selectedItem.achievements.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                    <Trophy className="h-3.5 w-3.5 text-accent-500" />
                    Daftar Prestasi & Penghargaan
                  </h4>
                  <ul className="space-y-1.5">
                    {selectedItem.achievements.map((ach, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-gray-700 bg-amber-50/60 border border-amber-200/60 rounded-xl p-2.5">
                        <CheckCircle className="h-3.5 w-3.5 text-accent-600 mt-0.5 shrink-0" />
                        <span>{ach}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Linked Gallery Documentation Section */}
              {selectedItem.galleryId && (() => {
                const linkedGallery = gallery.find(g => g.id === selectedItem.galleryId);
                if (!linkedGallery) return null;
                const albumPhotos = linkedGallery.images && linkedGallery.images.length > 0
                  ? linkedGallery.images
                  : (linkedGallery.image ? [linkedGallery.image] : []);
                return (
                  <div className="space-y-2.5 pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                        <Camera className="h-3.5 w-3.5 text-primary-600" />
                        Dokumentasi Kegiatan di Galeri
                      </h4>
                      <Link
                        to="/galeri"
                        className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1"
                      >
                        <span>Buka Galeri</span>
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </div>
                    <p className="text-xs text-gray-600 font-medium">
                      Album: <strong className="text-gray-900">{linkedGallery.title}</strong>
                    </p>
                    {albumPhotos.length > 0 && (
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-1">
                        {albumPhotos.slice(0, 8).map((photoUrl, pIdx) => (
                          <div key={pIdx} className="aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-200 group">
                            <img src={photoUrl} alt={`${linkedGallery.title} ${pIdx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                          </div>
                        ))}
                      </div>
                    )}
                    <Link
                      to="/galeri"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-600 hover:text-primary-700 mt-1"
                    >
                      <Images className="h-3.5 w-3.5" />
                      <span>Lihat {albumPhotos.length} foto dokumentasi lengkap di Galeri</span>
                      <ChevronRight className="h-3 w-3" />
                    </Link>
                  </div>
                );
              })()}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setSelectedItem(null)}
                className="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs sm:text-sm font-semibold rounded-xl transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

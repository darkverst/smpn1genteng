import { useState, useEffect } from 'react';
import { Camera, X, ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { GalleryCard } from '../components/Cards';
import InstagramFeed from '../components/InstagramFeed';
import { GALLERY_CATEGORIES, GRADIENTS, extractYoutubeId } from '../types';

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function Galeri() {
  const { gallery, instagramSettings } = useApp();
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const filtered = activeCategory === 'Semua'
    ? gallery
    : activeCategory === 'Video'
      ? gallery.filter(g => g.mediaType === 'video')
      : gallery.filter(g => g.category === activeCategory);

  const openLightbox = (idx: number) => setLightboxIndex(idx);
  const closeLightbox = () => setLightboxIndex(null);
  const prevImage = () => setLightboxIndex(prev => prev !== null ? (prev - 1 + filtered.length) % filtered.length : null);
  const nextImage = () => setLightboxIndex(prev => prev !== null ? (prev + 1) % filtered.length : null);

  const currentItem = lightboxIndex !== null ? filtered[lightboxIndex] : null;
  const isCurrentVideo = currentItem?.mediaType === 'video' && currentItem?.youtubeUrl;
  const currentVideoId = isCurrentVideo ? extractYoutubeId(currentItem.youtubeUrl) : null;

  useEffect(() => {
    if (lightboxIndex !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [lightboxIndex]);

  return (
    <div className="page-enter">
      <section className="bg-gradient-to-r from-primary-700 via-primary-600 to-primary-500 py-10 sm:py-16 lg:py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-3 py-1 text-primary-100 text-xs sm:text-sm mb-3 border border-white/10">
            <Camera className="h-3.5 w-3.5" /> Galeri Foto & Video
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-5xl font-extrabold text-white mb-3">Galeri Foto & Video</h1>
          <p className="text-primary-100 text-sm sm:text-lg max-w-2xl mx-auto">
            Dokumentasi kegiatan dan momen berharga di SMP Negeri 1 Genteng.
          </p>
        </div>
      </section>

      {/* Sticky filter - top-14 on mobile/tablet, top-16 on desktop */}
      <section className="py-4 sm:py-6 bg-white border-b border-gray-100 sticky top-14 lg:top-16 z-40 backdrop-blur-md bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {GALLERY_CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => { setActiveCategory(cat); setLightboxIndex(null); }}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                  activeCategory === cat ? 'bg-primary-500 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat === 'Video' && <Play className="inline h-3 w-3 mr-1 -mt-0.5" />}
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-8 sm:py-12 lg:py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filtered.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
              {filtered.map((item, i) => (
                <div key={item.id} className="animate-fadeInUp" style={{ animationDelay: `${(i % 8) * 0.06}s` }}>
                  <GalleryCard item={item} index={i} onClick={() => openLightbox(i)} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Camera className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Tidak Ada Konten</h3>
              <p className="text-gray-500 text-sm">Belum ada foto atau video untuk kategori ini.</p>
            </div>
          )}
        </div>
      </section>

      {/* Instagram Feed Section */}
      {instagramSettings.showSection && instagramSettings.posts.length > 0 && (
        <section className="py-10 sm:py-14 lg:py-16 bg-gradient-to-br from-pink-50 via-white to-purple-50 border-t border-pink-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-6 sm:mb-8 animate-fadeInUp">
              <div className="inline-flex items-center gap-2 bg-pink-50 rounded-full px-3 py-1 sm:px-4 sm:py-1.5 text-pink-600 text-xs sm:text-sm font-medium mb-2 border border-pink-100">
                <span className="text-base">📸</span>
                Postingan Instagram
              </div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-gray-900">
                {instagramSettings.sectionTitle}
              </h2>
              <p className="text-gray-500 text-sm mt-1 max-w-lg mx-auto">
                Konten terbaru dari akun Instagram resmi SMPN 1 Genteng
              </p>
            </div>
            <InstagramFeed settings={instagramSettings} maxPosts={6} compact={false} />
          </div>
        </section>
      )}

      {/* Lightbox */}
      {lightboxIndex !== null && currentItem && (
        <div className="fixed inset-0 z-[60] bg-black flex flex-col animate-fadeIn" onClick={closeLightbox}>
          <div className="flex items-center justify-between p-3 sm:p-4 relative z-10" onClick={e => e.stopPropagation()}>
            <p className="text-white/60 text-xs sm:text-sm">{lightboxIndex + 1} / {filtered.length}</p>
            <button onClick={closeLightbox} className="text-white/70 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors">
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="flex-1 flex items-center justify-center relative px-2 sm:px-16" onClick={e => e.stopPropagation()}>
            <button onClick={prevImage} className="absolute left-2 sm:left-4 text-white/60 hover:text-white p-1.5 sm:p-2 rounded-full hover:bg-white/10 transition-colors z-10">
              <ChevronLeft className="h-7 w-7 sm:h-10 sm:w-10" />
            </button>
            <button onClick={nextImage} className="absolute right-2 sm:right-4 text-white/60 hover:text-white p-1.5 sm:p-2 rounded-full hover:bg-white/10 transition-colors z-10">
              <ChevronRight className="h-7 w-7 sm:h-10 sm:w-10" />
            </button>

            <div className="w-full max-w-5xl mx-auto px-8 sm:px-4">
              {isCurrentVideo && currentVideoId ? (
                <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                  <iframe
                    src={`https://www.youtube.com/embed/${currentVideoId}?autoplay=1`}
                    className="absolute inset-0 w-full h-full rounded-xl sm:rounded-2xl"
                    allowFullScreen
                    allow="autoplay; encrypted-media"
                    title={currentItem.title}
                  />
                </div>
              ) : currentItem.image ? (
                <img
                  src={currentItem.image}
                  alt={currentItem.title}
                  className="max-w-full max-h-[60vh] sm:max-h-[70vh] mx-auto rounded-xl sm:rounded-2xl object-contain"
                />
              ) : (
                <div
                  className="w-full aspect-video max-h-[60vh] rounded-xl sm:rounded-2xl flex items-center justify-center"
                  style={{ background: GRADIENTS[lightboxIndex % GRADIENTS.length] }}
                >
                  <Camera className="h-16 w-16 sm:h-20 sm:w-20 text-white/30" />
                </div>
              )}
            </div>
          </div>

          <div className="text-center p-4 sm:p-6 relative z-10" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-center gap-2 mb-1">
              <h3 className="text-white text-sm sm:text-lg font-bold">{currentItem.title}</h3>
              {isCurrentVideo && (
                <span className="px-2 py-0.5 bg-red-600 text-white text-[10px] rounded-full font-semibold">Video</span>
              )}
            </div>
            <p className="text-white/50 text-xs sm:text-sm">
              {currentItem.category} • {formatDate(currentItem.date)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

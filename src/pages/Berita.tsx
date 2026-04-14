import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, User, Tag, Share2, Newspaper } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { NewsCard } from '../components/Cards';
import { NEWS_CATEGORIES, CATEGORY_COLORS } from '../types';

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

function NewsDetail() {
  const { id } = useParams<{ id: string }>();
  const { news } = useApp();
  const navigate = useNavigate();
  const item = news.find(n => n.id === id);

  if (!item) {
    return (
      <div className="page-enter py-20 text-center px-4">
        <div className="max-w-md mx-auto">
          <Newspaper className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Berita Tidak Ditemukan</h2>
          <p className="text-gray-500 text-sm mb-6">Berita yang Anda cari tidak tersedia.</p>
          <Link to="/berita" className="inline-flex items-center gap-2 bg-primary-500 text-white px-6 py-3 rounded-xl font-semibold text-sm">
            <ArrowLeft className="h-4 w-4" /> Kembali ke Berita
          </Link>
        </div>
      </div>
    );
  }

  const relatedNews = news.filter(n => n.id !== item.id && n.category === item.category).slice(0, 3);
  const colorClass = CATEGORY_COLORS[item.category] || 'bg-gray-100 text-gray-800';
  const isHtmlContent = /<[a-z][\s\S]*>/i.test(item.content);

  return (
    <div className="page-enter">
      <section className="bg-gradient-to-r from-primary-700 via-primary-600 to-primary-500 py-8 sm:py-12 lg:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-primary-200 hover:text-white text-sm mb-4 sm:mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Kembali
          </button>
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3 sm:mb-4 ${colorClass}`}>
            {item.category}
          </span>
          <h1 className="text-xl sm:text-2xl lg:text-4xl font-extrabold text-white leading-tight mb-3 sm:mb-4">{item.title}</h1>
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-primary-200 text-xs sm:text-sm">
            <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />{formatDate(item.date)}</span>
            <span className="flex items-center gap-1.5"><User className="h-3.5 w-3.5" />{item.author}</span>
            <span className="flex items-center gap-1.5"><Tag className="h-3.5 w-3.5" />{item.category}</span>
          </div>
        </div>
      </section>

      <section className="py-8 sm:py-12 lg:py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {item.image && (
            <div className="mb-6 sm:mb-8 -mt-4 sm:-mt-8 relative z-10">
              <img src={item.image} alt={item.title} className="w-full max-h-[400px] sm:max-h-[500px] object-cover rounded-xl sm:rounded-2xl shadow-xl" />
            </div>
          )}
          <p className="text-sm sm:text-lg text-gray-600 leading-relaxed font-medium mb-6 sm:mb-8 border-l-4 border-primary-400 pl-3 sm:pl-4 bg-primary-50/50 py-2 sm:py-3 rounded-r-lg">
            {item.excerpt}
          </p>
          {isHtmlContent ? (
            <div className="article-content text-sm sm:text-base" dangerouslySetInnerHTML={{ __html: item.content }} />
          ) : (
            <div className="article-content text-sm sm:text-base">
              {item.content.split('\n').map((p, i) => p.trim() && <p key={i}>{p}</p>)}
            </div>
          )}
          <div className="mt-8 pt-4 sm:pt-6 border-t border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
              <Share2 className="h-4 w-4" /> Bagikan
            </div>
            <Link to="/berita" className="text-primary-500 font-semibold text-xs sm:text-sm flex items-center gap-1">
              <ArrowLeft className="h-4 w-4" /> Semua Berita
            </Link>
          </div>
        </div>
      </section>

      {relatedNews.length > 0 && (
        <section className="py-8 sm:py-12 lg:py-16 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 mb-6 sm:mb-8">Berita Terkait</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {relatedNews.map((n, i) => <NewsCard key={n.id} item={n} index={i} />)}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function NewsListing() {
  const { news } = useApp();
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = news.filter(item => {
    const matchCategory = activeCategory === 'Semua' || item.category === activeCategory;
    const matchSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        item.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="page-enter">
      <section className="bg-gradient-to-r from-primary-700 via-primary-600 to-primary-500 py-10 sm:py-16 lg:py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-3 py-1 text-primary-100 text-xs sm:text-sm mb-3 border border-white/10">
            <Newspaper className="h-3.5 w-3.5" /> Berita & Kegiatan
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-5xl font-extrabold text-white mb-3">Berita Kegiatan</h1>
          <p className="text-primary-100 text-sm sm:text-lg max-w-2xl mx-auto">
            Ikuti perkembangan terbaru seputar kegiatan dan prestasi SMP Negeri 1 Genteng.
          </p>
        </div>
      </section>

      {/* Sticky filter - top-14 on mobile/tablet, top-16 on desktop */}
      <section className="py-4 sm:py-6 bg-white border-b border-gray-100 sticky top-14 lg:top-16 z-40 backdrop-blur-md bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center justify-between">
            <div className="flex gap-2 overflow-x-auto pb-1 w-full sm:w-auto no-scrollbar">
              {NEWS_CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                    activeCategory === cat ? 'bg-primary-500 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <input
              type="text"
              placeholder="Cari berita..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-56 lg:w-64 px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
            />
          </div>
        </div>
      </section>

      <section className="py-8 sm:py-12 lg:py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filtered.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filtered.map((item, i) => (
                <div key={item.id} className="animate-fadeInUp" style={{ animationDelay: `${i * 0.08}s` }}>
                  <NewsCard item={item} index={i} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Newspaper className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Tidak Ada Berita</h3>
              <p className="text-gray-500 text-sm">Belum ada berita untuk kategori ini.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default function Berita() {
  const { id } = useParams<{ id: string }>();
  return id ? <NewsDetail /> : <NewsListing />;
}

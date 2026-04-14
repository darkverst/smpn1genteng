import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, ArrowRight, User, BookOpen, Trophy, Palette, Dumbbell, Flag, Users, Play } from 'lucide-react';
import { NewsItem, AgendaItem, GalleryItem, GRADIENTS, CATEGORY_COLORS, getYoutubeThumbnail } from '../types';

const categoryIcons: Record<string, React.ReactNode> = {
  Prestasi: <Trophy className="h-8 w-8" />,
  OSIS: <Users className="h-8 w-8" />,
  Pramuka: <Flag className="h-8 w-8" />,
  Akademik: <BookOpen className="h-8 w-8" />,
  Olahraga: <Dumbbell className="h-8 w-8" />,
  Seni: <Palette className="h-8 w-8" />,
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

function getMonthShort(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('id-ID', { month: 'short' }).toUpperCase();
}

function getDay(dateStr: string): string {
  return new Date(dateStr).getDate().toString();
}

// ============ NEWS CARD ============
export function NewsCard({ item, index = 0 }: { item: NewsItem; index?: number }) {
  const gradient = GRADIENTS[index % GRADIENTS.length];
  const icon = categoryIcons[item.category] || <BookOpen className="h-8 w-8" />;
  const colorClass = CATEGORY_COLORS[item.category] || 'bg-gray-100 text-gray-800';

  return (
    <Link
      to={`/berita/${item.id}`}
      className="group bg-white rounded-2xl shadow-sm hover:shadow-xl active:scale-[0.98] transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col"
    >
      <div className="relative h-40 sm:h-48 overflow-hidden">
        {item.image ? (
          <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-white/30 group-hover:scale-105 transition-transform duration-500"
            style={{ background: gradient }}
          >
            {icon}
          </div>
        )}
        <div className="absolute top-3 left-3">
          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${colorClass}`}>
            {item.category}
          </span>
        </div>
      </div>
      <div className="p-4 sm:p-5 flex flex-col flex-1">
        <div className="flex items-center gap-2 text-[11px] text-gray-400 mb-1.5">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatDate(item.date)}
          </span>
          <span className="flex items-center gap-1">
            <User className="h-3 w-3" />
            {item.author}
          </span>
        </div>
        <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-1.5 line-clamp-2 group-hover:text-primary-600 transition-colors leading-snug">
          {item.title}
        </h3>
        <p className="text-xs sm:text-sm text-gray-500 line-clamp-2 flex-1">{item.excerpt}</p>
        <div className="mt-3 flex items-center text-primary-500 text-xs sm:text-sm font-semibold group-hover:text-primary-700 transition-colors">
          Baca Selengkapnya
          <ArrowRight className="h-3.5 w-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  );
}

// ============ AGENDA CARD ============
export function AgendaCard({ item, onClick }: { item: AgendaItem; onClick?: () => void }) {
  const colorClass = CATEGORY_COLORS[item.type] || 'bg-gray-100 text-gray-700';
  const isClickable = typeof onClick === 'function';
  const containerClass = `bg-white rounded-2xl shadow-sm hover:shadow-lg active:scale-[0.99] transition-all duration-300 border border-gray-100 overflow-hidden group ${isClickable ? 'w-full text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-300' : ''}`;
  const content = (
    <div className="flex">
      <div className="w-16 sm:w-20 bg-gradient-to-b from-primary-500 to-primary-600 flex flex-col items-center justify-center text-white shrink-0 py-3 sm:py-4">
        <span className="text-xl sm:text-2xl font-extrabold leading-none">{getDay(item.date)}</span>
        <span className="text-[10px] sm:text-xs font-semibold mt-0.5 opacity-90">{getMonthShort(item.date)}</span>
      </div>
      <div className="flex-1 p-3 sm:p-4 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <h3 className="text-sm sm:text-base font-bold text-gray-900 group-hover:text-primary-600 transition-colors leading-snug line-clamp-2">
            {item.title}
          </h3>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap shrink-0 ${colorClass}`}>
            {item.type}
          </span>
        </div>
        <p className="text-xs sm:text-sm text-gray-500 mb-2 line-clamp-2">{item.description}</p>
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-gray-400">
          {item.time !== '-' && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {item.time}
            </span>
          )}
          {item.location !== '-' && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {item.location}
            </span>
          )}
          {item.endDate && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              s/d {formatDate(item.endDate)}
            </span>
          )}
        </div>
        {isClickable && (
          <p className="mt-3 text-[11px] sm:text-xs font-semibold text-primary-500">
            Klik untuk melihat detail agenda
          </p>
        )}
      </div>
    </div>
  );

  if (isClickable) {
    return (
      <button type="button" onClick={onClick} className={containerClass}>
        {content}
      </button>
    );
  }

  return <div className={containerClass}>{content}</div>;
}

// ============ GALLERY CARD ============
export function GalleryCard({ item, index = 0, onClick }: { item: GalleryItem; index?: number; onClick?: () => void }) {
  const gradient = GRADIENTS[index % GRADIENTS.length];
  const colorClass = CATEGORY_COLORS[item.category] || 'bg-gray-100 text-gray-700';
  const isVideo = item.mediaType === 'video' && item.youtubeUrl;
  const thumbnail = isVideo ? getYoutubeThumbnail(item.youtubeUrl) : item.image;

  return (
    <div
      className="group relative rounded-2xl overflow-hidden shadow-sm hover:shadow-xl active:scale-[0.97] transition-all duration-300 cursor-pointer aspect-square"
      onClick={onClick}
    >
      {thumbnail ? (
        <img src={thumbnail} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
      ) : (
        <div className="w-full h-full group-hover:scale-110 transition-transform duration-500" style={{ background: gradient }} />
      )}
      {isVideo && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="w-11 h-11 sm:w-14 sm:h-14 bg-red-600/90 rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
            <Play className="h-5 w-5 sm:h-6 sm:w-6 text-white fill-white ml-0.5" />
          </div>
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 transform translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
        <div className="flex items-center gap-1 mb-1">
          <span className={`inline-block px-1.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-semibold ${colorClass}`}>
            {item.category}
          </span>
          {isVideo && (
            <span className="inline-block px-1.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-semibold bg-red-100 text-red-700">
              Video
            </span>
          )}
        </div>
        <h3 className="text-white text-xs sm:text-sm font-bold leading-snug line-clamp-2">{item.title}</h3>
      </div>
    </div>
  );
}

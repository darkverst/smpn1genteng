import { useEffect, useMemo, useRef, useState } from 'react';
import { Instagram, Heart, ExternalLink, Image, Play } from 'lucide-react';
import { InstagramPost, InstagramSettings, GRADIENTS } from '../types';

interface InstagramFeedProps {
  settings: InstagramSettings;
  maxPosts?: number;
  compact?: boolean;
}

/* Load the Instagram embed script once */
function loadInstagramScript() {
  if (document.getElementById('instagram-embed-script')) return;
  const script = document.createElement('script');
  script.id = 'instagram-embed-script';
  script.src = 'https://www.instagram.com/embed.js';
  script.async = true;
  script.defer = true;
  document.body.appendChild(script);
}

/* Process Instagram embeds after DOM update */
function processEmbeds() {
  if (typeof (window as any).instgrm !== 'undefined') {
    (window as any).instgrm.Embeds.process();
  }
}

function buildWidgetMarkup(widgetCode: string): string {
  return widgetCode.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '').trim();
}

function injectWidgetCode(container: HTMLDivElement, widgetCode: string) {
  container.innerHTML = '';

  const template = document.createElement('template');
  template.innerHTML = widgetCode.trim();

  Array.from(template.content.childNodes).forEach((node) => {
    if (node.nodeName.toLowerCase() === 'script') {
      const sourceScript = node as HTMLScriptElement;
      const script = document.createElement('script');

      Array.from(sourceScript.attributes).forEach((attribute) => {
        script.setAttribute(attribute.name, attribute.value);
      });

      script.text = sourceScript.text;
      container.appendChild(script);
      return;
    }

    container.appendChild(node.cloneNode(true));
  });
}

/* Extract shortcode from Instagram URL */
function extractShortcode(url: string): string | null {
  const match = url.match(/instagram\.com\/(?:p|reel|tv)\/([A-Za-z0-9_-]+)/);
  return match ? match[1] : null;
}

/* Single manual Instagram post card */
function InstagramCard({ post, index }: { post: InstagramPost; index: number }) {
  const shortcode = extractShortcode(post.postUrl);
  const formattedDate = post.date
    ? new Date(post.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
    : '';

  const gradient = GRADIENTS[index % GRADIENTS.length];
  const isReel = post.postUrl.includes('/reel/');

  return (
    <a
      href={post.postUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-pink-200 hover:-translate-y-1"
    >
      {/* Image / Thumbnail */}
      <div className="relative aspect-square overflow-hidden">
        {post.thumbnail ? (
          <img
            src={post.thumbnail}
            alt={post.caption}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ background: gradient }}
          >
            {isReel ? (
              <Play className="h-12 w-12 text-white/60" />
            ) : (
              <Image className="h-12 w-12 text-white/60" />
            )}
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-4 text-white">
            <span className="flex items-center gap-1.5 text-sm font-semibold drop-shadow">
              <Heart className="h-4 w-4 fill-white" />
              {post.likes || '—'}
            </span>
            <ExternalLink className="h-4 w-4 drop-shadow" />
          </div>
        </div>

        {/* Reel badge */}
        {isReel && (
          <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
            <Play className="h-2.5 w-2.5 fill-white" /> Reel
          </div>
        )}

        {/* Instagram icon */}
        <div className="absolute top-2 left-2 w-6 h-6 bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 rounded-lg flex items-center justify-center shadow">
          <Instagram className="h-3.5 w-3.5 text-white" />
        </div>
      </div>

      {/* Caption */}
      <div className="p-3">
        <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
          {post.caption || `Lihat postingan di Instagram${shortcode ? ` (${shortcode})` : ''}`}
        </p>
        <div className="flex items-center justify-between mt-2">
          <span className="text-[10px] text-gray-400">{formattedDate}</span>
          {post.likes && (
            <span className="flex items-center gap-1 text-[10px] text-pink-500">
              <Heart className="h-2.5 w-2.5 fill-pink-500" /> {post.likes}
            </span>
          )}
        </div>
      </div>
    </a>
  );
}

/* Embed card using Instagram's official embed */
function InstagramEmbedCard({ post }: { post: InstagramPost }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadInstagramScript();
    const timer = setTimeout(() => {
      processEmbeds();
      setLoaded(true);
    }, 800);
    return () => clearTimeout(timer);
  }, [post.embedCode, post.postUrl]);

  const shortcode = extractShortcode(post.postUrl);

  // If custom embed code is provided, render it
  if (post.embedCode && post.embedCode.trim()) {
    return (
      <div ref={containerRef} className="instagram-embed-container rounded-2xl overflow-hidden shadow-sm border border-gray-100">
        <div
          dangerouslySetInnerHTML={{ __html: post.embedCode }}
          className="[&_iframe]:!max-width-full [&_.instagram-media]:!margin-0"
        />
        {!loaded && (
          <div className="h-32 flex items-center justify-center bg-gray-50">
            <div className="w-5 h-5 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
    );
  }

  // Fallback: generate embed from URL
  if (shortcode) {
    const embedHtml = `<blockquote class="instagram-media" data-instgrm-permalink="https://www.instagram.com/p/${shortcode}/" data-instgrm-version="14" style="background:#FFF;border:0;border-radius:3px;box-shadow:0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15);margin:0;max-width:100%;min-width:326px;padding:0;width:calc(100% - 2px)"><div style="padding:16px"></div></blockquote>`;
    return (
      <div ref={containerRef} className="rounded-2xl overflow-hidden shadow-sm border border-gray-100 bg-white">
        <div dangerouslySetInnerHTML={{ __html: embedHtml }} />
      </div>
    );
  }

  return null;
}

export default function InstagramFeed({ settings, maxPosts = 6, compact = false }: InstagramFeedProps) {
  const widgetMarkup = useMemo(() => buildWidgetMarkup(settings.widgetCode || ''), [settings.widgetCode]);
  const widgetContainerRef = useRef<HTMLDivElement>(null);
  const widgetEnabled = settings.embedType === 'widget' && !!settings.widgetCode.trim();
  const visiblePosts = settings.posts.slice(0, maxPosts);
  const hasManualContent = visiblePosts.length > 0;
  const hasEmbeds = visiblePosts.some(p => p.isEmbed);

  useEffect(() => {
    if (!widgetEnabled || !widgetContainerRef.current) return;
    injectWidgetCode(widgetContainerRef.current, settings.widgetCode);
  }, [widgetEnabled, settings.widgetCode]);

  useEffect(() => {
    if (hasEmbeds) {
      loadInstagramScript();
      const timer = setTimeout(processEmbeds, 1000);
      return () => clearTimeout(timer);
    }
  }, [hasEmbeds]);

  if (!settings.showSection || (!widgetEnabled && !hasManualContent)) return null;

  return (
    <div className="w-full">
      {/* Header */}
      <div className={`flex items-center justify-between mb-4 sm:mb-6 ${compact ? '' : ''}`}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
            <Instagram className="h-5 w-5 sm:h-5 sm:w-5 text-white" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900">{settings.sectionTitle || 'Instagram Sekolah'}</h3>
            <a
              href={settings.profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs sm:text-sm text-pink-500 hover:text-pink-600 font-medium transition-colors"
            >
              {settings.username}
            </a>
          </div>
        </div>
        <a
          href={settings.profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs sm:text-sm bg-gradient-to-r from-pink-500 to-purple-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-medium hover:shadow-lg transition-all hover:scale-105"
        >
          <Instagram className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Ikuti Kami</span>
          <span className="sm:hidden">Follow</span>
        </a>
      </div>

      {/* Posts Grid */}
      {widgetEnabled ? (
        <div className="instagram-widget-container min-h-[320px] w-full bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 p-2 sm:p-3">
          {widgetMarkup ? (
            <div
              ref={widgetContainerRef}
              className="[&_iframe]:!max-w-full [&_iframe]:!w-full [&_.elfsight-app]:min-h-[300px] [&_[class*='elfsight-app-']]:min-h-[300px]"
            />
          ) : null}
        </div>
      ) : hasEmbeds ? (
        /* Embed layout - single column or 2 cols */
        <div className="grid sm:grid-cols-2 gap-4">
          {visiblePosts.map((post, i) => (
            <div key={post.id} className="animate-fadeInUp" style={{ animationDelay: `${i * 0.1}s` }}>
              {post.isEmbed ? (
                <InstagramEmbedCard post={post} />
              ) : (
                <InstagramCard post={post} index={i} />
              )}
            </div>
          ))}
        </div>
      ) : (
        /* Card grid layout */
        <div className={`grid grid-cols-2 ${compact ? 'sm:grid-cols-3' : 'sm:grid-cols-3 lg:grid-cols-6'} gap-2 sm:gap-3`}>
          {visiblePosts.map((post, i) => (
            <div key={post.id} className="animate-fadeInUp" style={{ animationDelay: `${i * 0.08}s` }}>
              <InstagramCard post={post} index={i} />
            </div>
          ))}
        </div>
      )}

      {/* View more link */}
      {settings.posts.length > maxPosts && (
        <div className="text-center mt-4 sm:mt-6">
          <a
            href={settings.profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-pink-500 hover:text-pink-600 font-semibold transition-colors"
          >
            Lihat semua di Instagram <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      )}
    </div>
  );
}

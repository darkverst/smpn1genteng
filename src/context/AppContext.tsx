import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  NewsItem, AgendaItem, GalleryItem, ContactInfo, SliderItem, ProfileData, StatsData, FooterCredit, SEOData, AnalyticsData, DailyView,
  InstagramSettings, InstagramPost, SponsorsData, Sponsor, SmpbButtonSettings, AuthSettings,
  initialNews, initialAgenda, initialGallery, initialContactInfo, initialSliderItems, initialProfileData, initialStatsData, initialFooterCredit, initialSEOData, initialAnalyticsData, initialInstagramSettings, initialSponsorsData, initialSmpbButtonSettings, initialAuthSettings
} from '../types';
import { addSponsorRecord, deleteSponsorRecord, normalizeSponsorsData, updateSponsorRecord } from '../utils/sponsors';
import { ensureDefaultSettings, saveSetting } from '../services/settingsRepository';
import { SETTINGS_DB_KEYS } from '../constants/settingsKeys';
import {
  DEFAULT_AGENDA_ITEMS,
  DEFAULT_GALLERY_ITEMS,
  DEFAULT_INSTAGRAM_SETTINGS,
  DEFAULT_NEWS_ITEMS,
  DEFAULT_SETTINGS_BY_KEY,
  DEFAULT_SLIDER_ITEMS,
  DEFAULT_SPONSORS_DATA,
} from '../constants/defaultSettings';

interface AppState {
  isSettingsLoaded: boolean;
  isLoggedIn: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  news: NewsItem[];
  addNews: (item: Omit<NewsItem, 'id'>) => void;
  updateNews: (id: string, item: Partial<NewsItem>) => void;
  deleteNews: (id: string) => void;
  agenda: AgendaItem[];
  addAgenda: (item: Omit<AgendaItem, 'id'>) => void;
  updateAgenda: (id: string, item: Partial<AgendaItem>) => void;
  deleteAgenda: (id: string) => void;
  gallery: GalleryItem[];
  addGallery: (item: Omit<GalleryItem, 'id'>) => void;
  updateGallery: (id: string, item: Partial<GalleryItem>) => void;
  deleteGallery: (id: string) => void;
  contactInfo: ContactInfo;
  updateContactInfo: (info: Partial<ContactInfo>) => void;
  sliderItems: SliderItem[];
  addSliderItem: (item: Omit<SliderItem, 'id'>) => void;
  updateSliderItem: (id: string, item: Partial<SliderItem>) => void;
  deleteSliderItem: (id: string) => void;
  reorderSlider: (items: SliderItem[]) => void;
  profileData: ProfileData;
  updateProfileData: (data: Partial<ProfileData>) => void;
  statsData: StatsData;
  updateStatsData: (data: Partial<StatsData>) => void;
  footerCredit: FooterCredit;
  updateFooterCredit: (data: Partial<FooterCredit>) => void;
  seoData: SEOData;
  updateSEOData: (data: Partial<SEOData>) => void;
  analyticsData: AnalyticsData;
  trackPageView: (path: string) => void;
  resetAnalytics: () => void;
  instagramSettings: InstagramSettings;
  updateInstagramSettings: (data: Partial<InstagramSettings>) => void;
  addInstagramPost: (post: Omit<InstagramPost, 'id'>) => void;
  updateInstagramPost: (id: string, post: Partial<InstagramPost>) => void;
  deleteInstagramPost: (id: string) => void;
  reorderInstagramPosts: (posts: InstagramPost[]) => void;
  sponsorsData: SponsorsData;
  updateSponsorsData: (data: Partial<SponsorsData>) => void;
  addSponsor: (sponsor: Omit<Sponsor, 'id'>) => void;
  updateSponsor: (id: string, sponsor: Partial<Sponsor>) => void;
  deleteSponsor: (id: string) => void;
  smpbButton: SmpbButtonSettings;
  updateSmpbButton: (data: Partial<SmpbButtonSettings>) => void;
  authSettings: AuthSettings;
  updateAdminCredentials: (data: { username?: string; password: string }) => void;
  updateAuthUiSettings: (data: Partial<Pick<AuthSettings, 'showDemoCredentials'>>) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

function mergeObjectWithFallback<T extends object>(raw: unknown, fallback: T): T {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return fallback;
  return { ...fallback, ...(raw as Partial<T>) };
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

function getTodayStr(): string {
  return new Date().toISOString().split('T')[0];
}

function ensureSessionId(): boolean {
  const existing = sessionStorage.getItem('smpn1_session_id');
  if (existing) return false; // existing session
  sessionStorage.setItem('smpn1_session_id', generateId());
  return true; // new session
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [isSettingsLoaded, setIsSettingsLoaded] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('smpn1_auth') === 'true');
  const [news, setNews] = useState<NewsItem[]>([...DEFAULT_NEWS_ITEMS] as NewsItem[]);
  const [agenda, setAgenda] = useState<AgendaItem[]>([...DEFAULT_AGENDA_ITEMS] as AgendaItem[]);
  const [gallery, setGallery] = useState<GalleryItem[]>([...DEFAULT_GALLERY_ITEMS] as GalleryItem[]);
  const [contactInfo, setContactInfo] = useState<ContactInfo>(initialContactInfo);
  const [sliderItems, setSliderItems] = useState<SliderItem[]>([...DEFAULT_SLIDER_ITEMS] as SliderItem[]);
  const [profileData, setProfileData] = useState<ProfileData>(initialProfileData);
  const [statsData, setStatsData] = useState<StatsData>(initialStatsData);
  const [footerCredit, setFooterCredit] = useState<FooterCredit>(initialFooterCredit);
  const [seoData, setSeoData] = useState<SEOData>(initialSEOData);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>(initialAnalyticsData);
  const [instagramSettings, setInstagramSettings] = useState<InstagramSettings>(DEFAULT_INSTAGRAM_SETTINGS);
  const [sponsorsData, setSponsorsData] = useState<SponsorsData>(DEFAULT_SPONSORS_DATA);
  const [smpbButton, setSmpbButton] = useState<SmpbButtonSettings>(initialSmpbButtonSettings);
  const [authSettings, setAuthSettings] = useState<AuthSettings>(initialAuthSettings);

  const persistSetting = useCallback((key: string, value: unknown) => {
    void saveSetting(key, value);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const hydrateFromDatabase = async () => {
      const settings = await ensureDefaultSettings(DEFAULT_SETTINGS_BY_KEY);
      if (cancelled) return;

      setNews(Array.isArray(settings[SETTINGS_DB_KEYS.news]) ? (settings[SETTINGS_DB_KEYS.news] as NewsItem[]) : [...DEFAULT_NEWS_ITEMS] as NewsItem[]);
      setAgenda(Array.isArray(settings[SETTINGS_DB_KEYS.agenda]) ? (settings[SETTINGS_DB_KEYS.agenda] as AgendaItem[]) : [...DEFAULT_AGENDA_ITEMS] as AgendaItem[]);
      setGallery(Array.isArray(settings[SETTINGS_DB_KEYS.gallery]) ? (settings[SETTINGS_DB_KEYS.gallery] as GalleryItem[]) : [...DEFAULT_GALLERY_ITEMS] as GalleryItem[]);
      setContactInfo(mergeObjectWithFallback(settings[SETTINGS_DB_KEYS.contact], initialContactInfo));
      setSliderItems(Array.isArray(settings[SETTINGS_DB_KEYS.slider]) ? (settings[SETTINGS_DB_KEYS.slider] as SliderItem[]) : [...DEFAULT_SLIDER_ITEMS] as SliderItem[]);
      setProfileData(mergeObjectWithFallback(settings[SETTINGS_DB_KEYS.profile], initialProfileData));
      setStatsData(mergeObjectWithFallback(settings[SETTINGS_DB_KEYS.stats], initialStatsData));
      setFooterCredit(mergeObjectWithFallback(settings[SETTINGS_DB_KEYS.footer], initialFooterCredit));
      setSeoData(mergeObjectWithFallback(settings[SETTINGS_DB_KEYS.seo], initialSEOData));
      setAnalyticsData(mergeObjectWithFallback(settings[SETTINGS_DB_KEYS.analytics], initialAnalyticsData));
      setInstagramSettings(mergeObjectWithFallback(settings[SETTINGS_DB_KEYS.instagram], DEFAULT_INSTAGRAM_SETTINGS));
      setSponsorsData(normalizeSponsorsData(settings[SETTINGS_DB_KEYS.sponsors], DEFAULT_SPONSORS_DATA));
      setSmpbButton(mergeObjectWithFallback(settings[SETTINGS_DB_KEYS.smpbButton], initialSmpbButtonSettings));
      setAuthSettings(mergeObjectWithFallback(settings[SETTINGS_DB_KEYS.auth], initialAuthSettings));
      setIsSettingsLoaded(true);
    };

    void hydrateFromDatabase();

    return () => {
      cancelled = true;
    };
  }, []);

  // Track new session on mount
  useEffect(() => {
    if (!isSettingsLoaded) return;
    const isNewSession = ensureSessionId();
    if (isNewSession) {
      setAnalyticsData(prev => {
        const today = getTodayStr();
        const dailyViews = [...prev.dailyViews];
        const todayIdx = dailyViews.findIndex(d => d.date === today);
        if (todayIdx >= 0) {
          dailyViews[todayIdx] = { ...dailyViews[todayIdx], sessions: dailyViews[todayIdx].sessions + 1 };
        } else {
          dailyViews.push({ date: today, views: 0, sessions: 1 });
        }
        // Keep only last 90 days
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - 90);
        const cutoffStr = cutoff.toISOString().split('T')[0];
        const filtered = dailyViews.filter(d => d.date >= cutoffStr);
        const next = {
          ...prev,
          totalSessions: prev.totalSessions + 1,
          dailyViews: filtered,
          lastUpdated: new Date().toISOString(),
        };
        persistSetting(SETTINGS_DB_KEYS.analytics, next);
        return next;
      });
    }
  }, [isSettingsLoaded, persistSetting]);

  const login = (username: string, password: string): boolean => {
    if (username === authSettings.username && password === authSettings.password) {
      setIsLoggedIn(true);
      localStorage.setItem('smpn1_auth', 'true');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('smpn1_auth');
  };

  const addNews = (item: Omit<NewsItem, 'id'>) => setNews(prev => {
    const next = [{ ...item, id: generateId() }, ...prev];
    persistSetting(SETTINGS_DB_KEYS.news, next);
    return next;
  });
  const updateNews = (id: string, updates: Partial<NewsItem>) => setNews(prev => {
    const next = prev.map(n => n.id === id ? { ...n, ...updates } : n);
    persistSetting(SETTINGS_DB_KEYS.news, next);
    return next;
  });
  const deleteNews = (id: string) => setNews(prev => {
    const next = prev.filter(n => n.id !== id);
    persistSetting(SETTINGS_DB_KEYS.news, next);
    return next;
  });

  const addAgenda = (item: Omit<AgendaItem, 'id'>) => setAgenda(prev => {
    const next = [{ ...item, id: generateId() }, ...prev];
    persistSetting(SETTINGS_DB_KEYS.agenda, next);
    return next;
  });
  const updateAgenda = (id: string, updates: Partial<AgendaItem>) => setAgenda(prev => {
    const next = prev.map(a => a.id === id ? { ...a, ...updates } : a);
    persistSetting(SETTINGS_DB_KEYS.agenda, next);
    return next;
  });
  const deleteAgenda = (id: string) => setAgenda(prev => {
    const next = prev.filter(a => a.id !== id);
    persistSetting(SETTINGS_DB_KEYS.agenda, next);
    return next;
  });

  const addGallery = (item: Omit<GalleryItem, 'id'>) => setGallery(prev => {
    const next = [{ ...item, id: generateId() }, ...prev];
    persistSetting(SETTINGS_DB_KEYS.gallery, next);
    return next;
  });
  const updateGallery = (id: string, updates: Partial<GalleryItem>) => setGallery(prev => {
    const next = prev.map(g => g.id === id ? { ...g, ...updates } : g);
    persistSetting(SETTINGS_DB_KEYS.gallery, next);
    return next;
  });
  const deleteGallery = (id: string) => setGallery(prev => {
    const next = prev.filter(g => g.id !== id);
    persistSetting(SETTINGS_DB_KEYS.gallery, next);
    return next;
  });

  const updateContactInfo = (info: Partial<ContactInfo>) => setContactInfo(prev => {
    const next = { ...prev, ...info };
    persistSetting(SETTINGS_DB_KEYS.contact, next);
    return next;
  });

  const addSliderItem = (item: Omit<SliderItem, 'id'>) => setSliderItems(prev => {
    const next = [...prev, { ...item, id: generateId() }];
    persistSetting(SETTINGS_DB_KEYS.slider, next);
    return next;
  });
  const updateSliderItem = (id: string, updates: Partial<SliderItem>) => setSliderItems(prev => {
    const next = prev.map(s => s.id === id ? { ...s, ...updates } : s);
    persistSetting(SETTINGS_DB_KEYS.slider, next);
    return next;
  });
  const deleteSliderItem = (id: string) => setSliderItems(prev => {
    const next = prev.filter(s => s.id !== id);
    persistSetting(SETTINGS_DB_KEYS.slider, next);
    return next;
  });
  const reorderSlider = (items: SliderItem[]) => {
    setSliderItems(items);
    persistSetting(SETTINGS_DB_KEYS.slider, items);
  };

  const updateProfileData = (data: Partial<ProfileData>) => setProfileData(prev => {
    const next = { ...prev, ...data };
    persistSetting(SETTINGS_DB_KEYS.profile, next);
    return next;
  });
  const updateStatsData = (data: Partial<StatsData>) => setStatsData(prev => {
    const next = { ...prev, ...data };
    persistSetting(SETTINGS_DB_KEYS.stats, next);
    return next;
  });
  const updateFooterCredit = (data: Partial<FooterCredit>) => setFooterCredit(prev => {
    const next = { ...prev, ...data };
    persistSetting(SETTINGS_DB_KEYS.footer, next);
    return next;
  });
  const updateSEOData = (data: Partial<SEOData>) => setSeoData(prev => {
    const next = { ...prev, ...data };
    persistSetting(SETTINGS_DB_KEYS.seo, next);
    return next;
  });

  const trackPageView = useCallback((path: string) => {
    setAnalyticsData(prev => {
      const today = getTodayStr();
      const dailyViews: DailyView[] = [...prev.dailyViews];
      const todayIdx = dailyViews.findIndex(d => d.date === today);
      if (todayIdx >= 0) {
        dailyViews[todayIdx] = { ...dailyViews[todayIdx], views: dailyViews[todayIdx].views + 1 };
      } else {
        dailyViews.push({ date: today, views: 1, sessions: 0 });
      }
      const pageViews = { ...prev.pageViews };
      const cleanPath = path === '/' ? 'Home' : path.replace(/^\//, '').split('/')[0].charAt(0).toUpperCase() + path.replace(/^\//, '').split('/')[0].slice(1);
      pageViews[cleanPath] = (pageViews[cleanPath] || 0) + 1;

      // Track referrer
      const referrers = { ...prev.referrers };
      const ref = document.referrer;
      if (ref) {
        try {
          const refHost = new URL(ref).hostname;
          if (refHost && refHost !== window.location.hostname) {
            referrers[refHost] = (referrers[refHost] || 0) + 1;
          }
        } catch { /* ignore */ }
      }

      const next = {
        ...prev,
        totalPageViews: prev.totalPageViews + 1,
        dailyViews,
        pageViews,
        referrers,
        lastUpdated: new Date().toISOString(),
      };
      persistSetting(SETTINGS_DB_KEYS.analytics, next);
      return next;
    });
  }, [persistSetting]);

  const resetAnalytics = () => {
    setAnalyticsData(initialAnalyticsData);
    persistSetting(SETTINGS_DB_KEYS.analytics, initialAnalyticsData);
  };

  const updateInstagramSettings = (data: Partial<InstagramSettings>) =>
    setInstagramSettings(prev => {
      const next = { ...prev, ...data };
      persistSetting(SETTINGS_DB_KEYS.instagram, next);
      return next;
    });

  const addInstagramPost = (post: Omit<InstagramPost, 'id'>) =>
    setInstagramSettings(prev => {
      const next = { ...prev, posts: [{ ...post, id: generateId() }, ...prev.posts] };
      persistSetting(SETTINGS_DB_KEYS.instagram, next);
      return next;
    });

  const updateInstagramPost = (id: string, updates: Partial<InstagramPost>) =>
    setInstagramSettings(prev => {
      const next = { ...prev, posts: prev.posts.map(p => p.id === id ? { ...p, ...updates } : p) };
      persistSetting(SETTINGS_DB_KEYS.instagram, next);
      return next;
    });

  const deleteInstagramPost = (id: string) =>
    setInstagramSettings(prev => {
      const next = { ...prev, posts: prev.posts.filter(p => p.id !== id) };
      persistSetting(SETTINGS_DB_KEYS.instagram, next);
      return next;
    });

  const reorderInstagramPosts = (posts: InstagramPost[]) =>
    setInstagramSettings(prev => {
      const next = { ...prev, posts };
      persistSetting(SETTINGS_DB_KEYS.instagram, next);
      return next;
    });

  const updateSponsorsData = (data: Partial<SponsorsData>) =>
    setSponsorsData(prev => {
      const next = normalizeSponsorsData({ ...prev, ...data }, DEFAULT_SPONSORS_DATA);
      persistSetting(SETTINGS_DB_KEYS.sponsors, next);
      return next;
    });

  const addSponsor = (sponsor: Omit<Sponsor, 'id'>) =>
    setSponsorsData(prev => {
      const next = addSponsorRecord(normalizeSponsorsData(prev, DEFAULT_SPONSORS_DATA), sponsor);
      persistSetting(SETTINGS_DB_KEYS.sponsors, next);
      return next;
    });

  const updateSponsor = (id: string, updates: Partial<Sponsor>) =>
    setSponsorsData(prev => {
      const next = updateSponsorRecord(normalizeSponsorsData(prev, DEFAULT_SPONSORS_DATA), id, updates);
      persistSetting(SETTINGS_DB_KEYS.sponsors, next);
      return next;
    });

  const deleteSponsor = (id: string) =>
    setSponsorsData(prev => {
      const next = deleteSponsorRecord(normalizeSponsorsData(prev, DEFAULT_SPONSORS_DATA), id);
      persistSetting(SETTINGS_DB_KEYS.sponsors, next);
      return next;
    });
  const updateSmpbButton = (data: Partial<SmpbButtonSettings>) => setSmpbButton(prev => {
    const next = { ...prev, ...data };
    persistSetting(SETTINGS_DB_KEYS.smpbButton, next);
    return next;
  });
  const updateAdminCredentials = ({ username, password }: { username?: string; password: string }) =>
    setAuthSettings(prev => {
      const next: AuthSettings = {
        ...prev,
        username: username?.trim() ? username.trim() : prev.username,
        password,
      };
      persistSetting(SETTINGS_DB_KEYS.auth, next);
      return next;
    });
  const updateAuthUiSettings = (data: Partial<Pick<AuthSettings, 'showDemoCredentials'>>) =>
    setAuthSettings(prev => {
      const next = { ...prev, ...data };
      persistSetting(SETTINGS_DB_KEYS.auth, next);
      return next;
    });

  return (
    <AppContext.Provider value={{
      isSettingsLoaded,
      isLoggedIn, login, logout,
      news, addNews, updateNews, deleteNews,
      agenda, addAgenda, updateAgenda, deleteAgenda,
      gallery, addGallery, updateGallery, deleteGallery,
      contactInfo, updateContactInfo,
      sliderItems, addSliderItem, updateSliderItem, deleteSliderItem, reorderSlider,
      profileData, updateProfileData,
      statsData, updateStatsData,
      footerCredit, updateFooterCredit,
      seoData, updateSEOData,
      analyticsData, trackPageView, resetAnalytics,
      instagramSettings, updateInstagramSettings, addInstagramPost, updateInstagramPost, deleteInstagramPost, reorderInstagramPosts,
      sponsorsData, updateSponsorsData, addSponsor, updateSponsor, deleteSponsor,
      smpbButton, updateSmpbButton,
      authSettings, updateAdminCredentials, updateAuthUiSettings,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

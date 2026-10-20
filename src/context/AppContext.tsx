import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  NewsItem, AgendaItem, GalleryItem, ContactInfo, SliderItem, ProfileData, StatsData, FooterCredit, SEOData, AnalyticsData, DailyView,
  BrandSettings, DownloadDocument, DownloadDocumentsData, InstagramSettings, InstagramPost, SponsorsData, Sponsor, SmpbButtonSettings, AuthSettings, SchoolIdentitySettings, TeacherData, ExtracurricularItem,
  initialNews, initialAgenda, initialGallery, initialContactInfo, initialSliderItems, initialProfileData, initialStatsData, initialBrandSettings, initialDownloadDocumentsData, initialFooterCredit, initialSEOData, initialAnalyticsData, initialInstagramSettings, initialSponsorsData, initialSmpbButtonSettings, initialAuthSettings, initialSchoolIdentitySettings, initialTeachers
} from '../types';
import { addSponsorRecord, deleteSponsorRecord, normalizeSponsorsData, updateSponsorRecord } from '../utils/sponsors';
import {
  createTailwindThemeScale,
  buildLegacySettingsFromSchoolIdentity,
  createSchoolIdentityFromLegacy,
  normalizeSchoolIdentity,
  prepareSchoolIdentityForSave,
  validateSchoolIdentity,
} from '../utils/schoolIdentity';
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
  DEFAULT_EXTRACURRICULAR_ITEMS,
  DEFAULT_GALLERY_CATEGORY_LIST,
  DEFAULT_ESKUL_CATEGORY_LIST,
} from '../constants/defaultSettings';

const SETTINGS_STORAGE_CACHE_KEY = 'ma_settings_cache_v1';

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
  schoolIdentity: SchoolIdentitySettings;
  updateSchoolIdentity: (data: SchoolIdentitySettings) => { success: boolean; errors: string[] };
  brandSettings: BrandSettings;
  updateBrandSettings: (data: Partial<BrandSettings>) => void;
  downloadDocuments: DownloadDocumentsData;
  updateDownloadDocuments: (data: Partial<DownloadDocumentsData>) => void;
  addDownloadDocument: (item: Omit<DownloadDocument, 'id'>) => void;
  updateDownloadDocument: (id: string, item: Partial<DownloadDocument>) => void;
  deleteDownloadDocument: (id: string) => void;
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
  teachers: TeacherData[];
  addTeacher: (teacher: Omit<TeacherData, 'id'>) => void;
  updateTeacher: (id: string, teacher: Partial<TeacherData>) => void;
  deleteTeacher: (id: string) => void;
  extracurricular: ExtracurricularItem[];
  addExtracurricular: (item: Omit<ExtracurricularItem, 'id'>) => void;
  updateExtracurricular: (id: string, item: Partial<ExtracurricularItem>) => void;
  deleteExtracurricular: (id: string) => void;
  reorderExtracurricular: (items: ExtracurricularItem[]) => void;
  galleryCategories: string[];
  addGalleryCategory: (category: string) => void;
  updateGalleryCategory: (oldCategory: string, newCategory: string) => void;
  deleteGalleryCategory: (category: string) => void;
  eskulCategories: string[];
  addEskulCategory: (category: string) => void;
  updateEskulCategory: (oldCategory: string, newCategory: string) => void;
  deleteEskulCategory: (category: string) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

function mergeObjectWithFallback<T extends object>(raw: unknown, fallback: T): T {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return fallback;
  return { ...fallback, ...(raw as Partial<T>) };
}

function normalizeDownloadDocumentsData(raw: unknown, fallback: DownloadDocumentsData): DownloadDocumentsData {
  const merged = mergeObjectWithFallback(raw, fallback);
  return {
    ...merged,
    documents: Array.isArray(merged.documents) ? merged.documents : fallback.documents,
  };
}

function applySchoolTheme(identity: SchoolIdentitySettings) {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  const scale = createTailwindThemeScale(identity);
  root.style.setProperty('--color-primary-50', scale.primary50);
  root.style.setProperty('--color-primary-100', scale.primary100);
  root.style.setProperty('--color-primary-200', scale.primary200);
  root.style.setProperty('--color-primary-300', scale.primary300);
  root.style.setProperty('--color-primary-400', scale.primary400);
  root.style.setProperty('--color-primary-500', scale.primary500);
  root.style.setProperty('--color-primary-600', scale.primary600);
  root.style.setProperty('--color-primary-700', scale.primary700);
  root.style.setProperty('--color-primary-800', scale.primary800);
  root.style.setProperty('--color-primary-900', scale.primary900);
  root.style.setProperty('--color-primary-950', scale.primary950);
  root.style.setProperty('--color-accent-300', scale.accent300);
  root.style.setProperty('--color-accent-400', scale.accent400);
  root.style.setProperty('--color-accent-500', scale.accent500);
  root.style.setProperty('--color-accent-600', scale.accent600);
  root.style.setProperty('--school-primary', identity.primaryColor);
  root.style.setProperty('--school-secondary', identity.secondaryColor);
  root.style.setProperty('--school-accent', identity.accentColor);
  root.style.setProperty('--school-footer-bg', identity.footerBackgroundColor);
}

function toIdentityComparable(identity: SchoolIdentitySettings) {
  const { revision, updatedAt, ...rest } = identity;
  return rest;
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

function safeWriteCache(key: string, value: unknown) {
  try {
    const currentRaw = localStorage.getItem(SETTINGS_STORAGE_CACHE_KEY);
    const current = currentRaw ? JSON.parse(currentRaw) : {};
    current[key] = value;
    localStorage.setItem(SETTINGS_STORAGE_CACHE_KEY, JSON.stringify(current));
  } catch {
    // Ignore quota errors
  }
}

function safeCacheAllSettings(settings: Record<string, unknown>) {
  try {
    localStorage.setItem(SETTINGS_STORAGE_CACHE_KEY, JSON.stringify(settings));
  } catch {
    // Ignore quota errors
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [isSettingsLoaded, setIsSettingsLoaded] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('smpn1_auth') === 'true');
  const [news, setNews] = useState<NewsItem[]>([...DEFAULT_NEWS_ITEMS] as NewsItem[]);
  const [agenda, setAgenda] = useState<AgendaItem[]>([...DEFAULT_AGENDA_ITEMS] as AgendaItem[]);
  const [gallery, setGallery] = useState<GalleryItem[]>([...DEFAULT_GALLERY_ITEMS] as GalleryItem[]);
  const [schoolIdentity, setSchoolIdentity] = useState<SchoolIdentitySettings>(initialSchoolIdentitySettings);
  const [contactInfo, setContactInfo] = useState<ContactInfo>(initialContactInfo);
  const [sliderItems, setSliderItems] = useState<SliderItem[]>([...DEFAULT_SLIDER_ITEMS] as SliderItem[]);
  const [profileData, setProfileData] = useState<ProfileData>(initialProfileData);
  const [statsData, setStatsData] = useState<StatsData>(initialStatsData);
  const [brandSettings, setBrandSettings] = useState<BrandSettings>(initialBrandSettings);
  const [downloadDocuments, setDownloadDocuments] = useState<DownloadDocumentsData>(initialDownloadDocumentsData);
  const [footerCredit, setFooterCredit] = useState<FooterCredit>(initialFooterCredit);
  const [seoData, setSeoData] = useState<SEOData>(initialSEOData);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>(initialAnalyticsData);
  const [instagramSettings, setInstagramSettings] = useState<InstagramSettings>(DEFAULT_INSTAGRAM_SETTINGS);
  const [sponsorsData, setSponsorsData] = useState<SponsorsData>(DEFAULT_SPONSORS_DATA);
  const [smpbButton, setSmpbButton] = useState<SmpbButtonSettings>(initialSmpbButtonSettings);
  const [authSettings, setAuthSettings] = useState<AuthSettings>(initialAuthSettings);
  const [teachers, setTeachers] = useState<TeacherData[]>(initialTeachers);
  const [extracurricular, setExtracurricular] = useState<ExtracurricularItem[]>([...DEFAULT_EXTRACURRICULAR_ITEMS]);
  const [galleryCategories, setGalleryCategories] = useState<string[]>([...DEFAULT_GALLERY_CATEGORY_LIST]);
  const [eskulCategories, setEskulCategories] = useState<string[]>([...DEFAULT_ESKUL_CATEGORY_LIST]);

  const persistSetting = useCallback((key: string, value: unknown) => {
    void saveSetting(key, value);
    safeWriteCache(key, value);
  }, []);

  useEffect(() => {
    let cancelled = false;

    // 1. Baca cache lokal terlebih dahulu untuk loading instan (0ms)
    try {
      const localCachedRaw = localStorage.getItem(SETTINGS_STORAGE_CACHE_KEY);
      if (localCachedRaw) {
        const cached = JSON.parse(localCachedRaw) as Record<string, unknown>;
        if (cached && typeof cached === 'object') {
          if (cached[SETTINGS_DB_KEYS.schoolIdentity]) {
            const idObj = normalizeSchoolIdentity(cached[SETTINGS_DB_KEYS.schoolIdentity], initialSchoolIdentitySettings);
            const cachedBrand = cached[SETTINGS_DB_KEYS.brand] as { schoolLogo?: string } | undefined;
            if (!idObj.schoolLogo && cachedBrand?.schoolLogo) {
              idObj.schoolLogo = cachedBrand.schoolLogo;
            }
            setSchoolIdentity(idObj);
            applySchoolTheme(idObj);
          }
          if (Array.isArray(cached[SETTINGS_DB_KEYS.news])) setNews(cached[SETTINGS_DB_KEYS.news] as NewsItem[]);
          if (Array.isArray(cached[SETTINGS_DB_KEYS.agenda])) setAgenda(cached[SETTINGS_DB_KEYS.agenda] as AgendaItem[]);
          if (Array.isArray(cached[SETTINGS_DB_KEYS.gallery])) setGallery(cached[SETTINGS_DB_KEYS.gallery] as GalleryItem[]);
          if (Array.isArray(cached[SETTINGS_DB_KEYS.slider])) setSliderItems(cached[SETTINGS_DB_KEYS.slider] as SliderItem[]);
          if (Array.isArray(cached[SETTINGS_DB_KEYS.extracurricular])) setExtracurricular(cached[SETTINGS_DB_KEYS.extracurricular] as ExtracurricularItem[]);
          if (Array.isArray(cached[SETTINGS_DB_KEYS.teachers])) setTeachers(cached[SETTINGS_DB_KEYS.teachers] as TeacherData[]);
          if (Array.isArray(cached[SETTINGS_DB_KEYS.galleryCategories])) setGalleryCategories(cached[SETTINGS_DB_KEYS.galleryCategories] as string[]);
          if (Array.isArray(cached[SETTINGS_DB_KEYS.eskulCategories])) setEskulCategories(cached[SETTINGS_DB_KEYS.eskulCategories] as string[]);
          setIsSettingsLoaded(true);
        }
      }
    } catch {
      // Abaikan jika localStorage tidak tersedia
    }

    // 2. Guard timeout: Jangan biarkan splash screen menggantung lebih dari 2.5 detik
    const timeoutGuard = setTimeout(() => {
      if (!cancelled) {
        setIsSettingsLoaded(true);
      }
    }, 2500);

    const hydrateFromDatabase = async () => {
      try {
        const settings = await ensureDefaultSettings(DEFAULT_SETTINGS_BY_KEY);
        if (cancelled) return;

        // Simpan cache terbaru ke localStorage secara aman
        safeCacheAllSettings(settings);

        const legacyBrand = mergeObjectWithFallback(settings[SETTINGS_DB_KEYS.brand], initialBrandSettings);
        const legacyContact = mergeObjectWithFallback(settings[SETTINGS_DB_KEYS.contact], initialContactInfo);
        const legacyFooter = mergeObjectWithFallback(settings[SETTINGS_DB_KEYS.footer], initialFooterCredit);
        const migratedIdentity = createSchoolIdentityFromLegacy(legacyBrand, legacyContact, legacyFooter);
        const storedIdentity = normalizeSchoolIdentity(settings[SETTINGS_DB_KEYS.schoolIdentity], migratedIdentity);
        const identityRaw = settings[SETTINGS_DB_KEYS.schoolIdentity];
        const identityLooksLikeDefault = JSON.stringify(toIdentityComparable(normalizeSchoolIdentity(identityRaw, initialSchoolIdentitySettings))) === JSON.stringify(toIdentityComparable(normalizeSchoolIdentity(initialSchoolIdentitySettings)));
        const legacyLooksCustomized = JSON.stringify(toIdentityComparable(migratedIdentity)) !== JSON.stringify(toIdentityComparable(normalizeSchoolIdentity(initialSchoolIdentitySettings)));
        const resolvedIdentity = identityLooksLikeDefault && legacyLooksCustomized ? migratedIdentity : storedIdentity;
        if (!resolvedIdentity.schoolLogo && legacyBrand.schoolLogo) {
          resolvedIdentity.schoolLogo = legacyBrand.schoolLogo;
        }
        if (resolvedIdentity.youtube === 'https://youtube.com' && legacyContact.youtube && legacyContact.youtube !== 'https://youtube.com') {
          resolvedIdentity.youtube = legacyContact.youtube;
        }
        if (resolvedIdentity.facebook === 'https://facebook.com' && legacyContact.facebook && legacyContact.facebook !== 'https://facebook.com') {
          resolvedIdentity.facebook = legacyContact.facebook;
        }
        if (resolvedIdentity.instagram === 'https://instagram.com' && legacyContact.instagram && legacyContact.instagram !== 'https://instagram.com') {
          resolvedIdentity.instagram = legacyContact.instagram;
        }
        const resolvedLegacy = buildLegacySettingsFromSchoolIdentity(resolvedIdentity);

        setNews(Array.isArray(settings[SETTINGS_DB_KEYS.news]) ? (settings[SETTINGS_DB_KEYS.news] as NewsItem[]) : [...DEFAULT_NEWS_ITEMS] as NewsItem[]);
        setAgenda(Array.isArray(settings[SETTINGS_DB_KEYS.agenda]) ? (settings[SETTINGS_DB_KEYS.agenda] as AgendaItem[]) : [...DEFAULT_AGENDA_ITEMS] as AgendaItem[]);
        setGallery(Array.isArray(settings[SETTINGS_DB_KEYS.gallery]) ? (settings[SETTINGS_DB_KEYS.gallery] as GalleryItem[]) : [...DEFAULT_GALLERY_ITEMS] as GalleryItem[]);
        setSchoolIdentity(resolvedIdentity);
        applySchoolTheme(resolvedIdentity);
        setContactInfo(resolvedLegacy.contactInfo);
        setSliderItems(Array.isArray(settings[SETTINGS_DB_KEYS.slider]) ? (settings[SETTINGS_DB_KEYS.slider] as SliderItem[]) : [...DEFAULT_SLIDER_ITEMS] as SliderItem[]);
        setProfileData(mergeObjectWithFallback(settings[SETTINGS_DB_KEYS.profile], initialProfileData));
        setStatsData(mergeObjectWithFallback(settings[SETTINGS_DB_KEYS.stats], initialStatsData));
        setBrandSettings(resolvedLegacy.brandSettings);
        setDownloadDocuments(normalizeDownloadDocumentsData(settings[SETTINGS_DB_KEYS.downloads], initialDownloadDocumentsData));
        setFooterCredit(resolvedLegacy.footerCredit);
        setSeoData(mergeObjectWithFallback(settings[SETTINGS_DB_KEYS.seo], initialSEOData));
        setAnalyticsData(mergeObjectWithFallback(settings[SETTINGS_DB_KEYS.analytics], initialAnalyticsData));
        setInstagramSettings(mergeObjectWithFallback(settings[SETTINGS_DB_KEYS.instagram], DEFAULT_INSTAGRAM_SETTINGS));
        setSponsorsData(normalizeSponsorsData(settings[SETTINGS_DB_KEYS.sponsors], DEFAULT_SPONSORS_DATA));
        setSmpbButton(mergeObjectWithFallback(settings[SETTINGS_DB_KEYS.smpbButton], initialSmpbButtonSettings));
        setAuthSettings(mergeObjectWithFallback(settings[SETTINGS_DB_KEYS.auth], initialAuthSettings));
        setTeachers(Array.isArray(settings[SETTINGS_DB_KEYS.teachers]) ? (settings[SETTINGS_DB_KEYS.teachers] as TeacherData[]) : initialTeachers);
        setExtracurricular(Array.isArray(settings[SETTINGS_DB_KEYS.extracurricular]) ? (settings[SETTINGS_DB_KEYS.extracurricular] as ExtracurricularItem[]) : [...DEFAULT_EXTRACURRICULAR_ITEMS]);

        const rawGalCats = Array.isArray(settings[SETTINGS_DB_KEYS.galleryCategories]) ? (settings[SETTINGS_DB_KEYS.galleryCategories] as string[]) : [...DEFAULT_GALLERY_CATEGORY_LIST];
        const galItems = Array.isArray(settings[SETTINGS_DB_KEYS.gallery]) ? (settings[SETTINGS_DB_KEYS.gallery] as GalleryItem[]) : [...DEFAULT_GALLERY_ITEMS] as GalleryItem[];
        const allGalCats = Array.from(new Set([...rawGalCats, ...galItems.map(g => g.category).filter(Boolean)]));
        setGalleryCategories(allGalCats);

        const rawEskulCats = Array.isArray(settings[SETTINGS_DB_KEYS.eskulCategories]) ? (settings[SETTINGS_DB_KEYS.eskulCategories] as string[]) : [...DEFAULT_ESKUL_CATEGORY_LIST];
        const eskulItems = Array.isArray(settings[SETTINGS_DB_KEYS.extracurricular]) ? (settings[SETTINGS_DB_KEYS.extracurricular] as ExtracurricularItem[]) : [...DEFAULT_EXTRACURRICULAR_ITEMS];
        const allEskulCats = Array.from(new Set([...rawEskulCats, ...eskulItems.map(e => e.category).filter(Boolean)]));
        setEskulCategories(allEskulCats);

        if ((identityLooksLikeDefault && legacyLooksCustomized) || (!storedIdentity.schoolLogo && resolvedIdentity.schoolLogo)) {
          persistSetting(SETTINGS_DB_KEYS.schoolIdentity, resolvedIdentity);
        }
        try {
          localStorage.setItem(SETTINGS_STORAGE_CACHE_KEY, JSON.stringify(settings));
        } catch {
          // Ignore quota errors
        }
        window.dispatchEvent(new CustomEvent('db:synced'));
      } catch (error) {
        console.error('[App] Gagal sinkronisasi settings dari database. State lokal default dipakai sementara tanpa menimpa data database.', error);
      } finally {
        clearTimeout(timeoutGuard);
        if (!cancelled) {
          setIsSettingsLoaded(true);
        }
      }
    };

    void hydrateFromDatabase();

    return () => {
      cancelled = true;
      clearTimeout(timeoutGuard);
    };
  }, []);

  useEffect(() => {
    applySchoolTheme(schoolIdentity);
  }, [schoolIdentity]);

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
    const next = prev.map(s => String(s.id) === String(id) ? { ...s, ...updates } : s);
    persistSetting(SETTINGS_DB_KEYS.slider, next);
    return next;
  });
  const deleteSliderItem = (id: string) => setSliderItems(prev => {
    const next = prev.filter(s => String(s.id) !== String(id));
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
  const updateSchoolIdentity = (data: SchoolIdentitySettings) => {
    const next = prepareSchoolIdentityForSave(schoolIdentity, data);
    const errors = validateSchoolIdentity(next);
    if (errors.length > 0) {
      return { success: false, errors };
    }

    const legacy = buildLegacySettingsFromSchoolIdentity(next);
    setSchoolIdentity(next);
    setBrandSettings(legacy.brandSettings);
    setContactInfo(legacy.contactInfo);
    setFooterCredit(legacy.footerCredit);
    persistSetting(SETTINGS_DB_KEYS.schoolIdentity, next);
    persistSetting(SETTINGS_DB_KEYS.brand, legacy.brandSettings);
    persistSetting(SETTINGS_DB_KEYS.contact, legacy.contactInfo);
    persistSetting(SETTINGS_DB_KEYS.footer, legacy.footerCredit);
    return { success: true, errors: [] };
  };
  const updateBrandSettings = (data: Partial<BrandSettings>) => {
    setBrandSettings(prev => {
      const next = { ...prev, ...data };
      persistSetting(SETTINGS_DB_KEYS.brand, next);
      return next;
    });
    if (data.schoolLogo !== undefined || data.schoolName !== undefined || data.showLogo !== undefined) {
      setSchoolIdentity(prev => {
        const next = {
          ...prev,
          ...(data.schoolLogo !== undefined ? { schoolLogo: data.schoolLogo } : {}),
          ...(data.schoolName !== undefined ? { schoolName: data.schoolName } : {}),
          ...(data.showLogo !== undefined ? { showLogo: data.showLogo } : {}),
        };
        persistSetting(SETTINGS_DB_KEYS.schoolIdentity, next);
        return next;
      });
    }
  };
  const updateDownloadDocuments = (data: Partial<DownloadDocumentsData>) => setDownloadDocuments(prev => {
    const next = normalizeDownloadDocumentsData({ ...prev, ...data }, initialDownloadDocumentsData);
    persistSetting(SETTINGS_DB_KEYS.downloads, next);
    return next;
  });
  const addDownloadDocument = (item: Omit<DownloadDocument, 'id'>) => setDownloadDocuments(prev => {
    const next = {
      ...prev,
      documents: [{ ...item, id: generateId() }, ...prev.documents],
    };
    persistSetting(SETTINGS_DB_KEYS.downloads, next);
    return next;
  });
  const updateDownloadDocument = (id: string, item: Partial<DownloadDocument>) => setDownloadDocuments(prev => {
    const next = {
      ...prev,
      documents: prev.documents.map((doc) => (doc.id === id ? { ...doc, ...item } : doc)),
    };
    persistSetting(SETTINGS_DB_KEYS.downloads, next);
    return next;
  });
  const deleteDownloadDocument = (id: string) => setDownloadDocuments(prev => {
    const next = {
      ...prev,
      documents: prev.documents.filter((doc) => doc.id !== id),
    };
    persistSetting(SETTINGS_DB_KEYS.downloads, next);
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
  const addTeacher = (teacher: Omit<TeacherData, 'id'>) => setTeachers(prev => {
    const next = [...prev, { ...teacher, id: generateId() }];
    persistSetting(SETTINGS_DB_KEYS.teachers, next);
    return next;
  });
  const updateTeacher = (id: string, updates: Partial<TeacherData>) => setTeachers(prev => {
    const next = prev.map(t => t.id === id ? { ...t, ...updates } : t);
    persistSetting(SETTINGS_DB_KEYS.teachers, next);
    return next;
  });
  const deleteTeacher = (id: string) => setTeachers(prev => {
    const next = prev.filter(t => t.id !== id);
    persistSetting(SETTINGS_DB_KEYS.teachers, next);
    return next;
  });

  const addExtracurricular = (item: Omit<ExtracurricularItem, 'id'>) => setExtracurricular(prev => {
    const next = [...prev, { ...item, id: generateId() }];
    persistSetting(SETTINGS_DB_KEYS.extracurricular, next);
    return next;
  });
  const updateExtracurricular = (id: string, updates: Partial<ExtracurricularItem>) => setExtracurricular(prev => {
    const next = prev.map(e => e.id === id ? { ...e, ...updates } : e);
    persistSetting(SETTINGS_DB_KEYS.extracurricular, next);
    return next;
  });
  const deleteExtracurricular = (id: string) => setExtracurricular(prev => {
    const next = prev.filter(e => e.id !== id);
    persistSetting(SETTINGS_DB_KEYS.extracurricular, next);
    return next;
  });
  const reorderExtracurricular = (items: ExtracurricularItem[]) => {
    setExtracurricular(items);
    persistSetting(SETTINGS_DB_KEYS.extracurricular, items);
  };

  const addGalleryCategory = (cat: string) => {
    const trimmed = cat.trim();
    if (!trimmed) return;
    setGalleryCategories(prev => {
      if (prev.includes(trimmed)) return prev;
      const next = [...prev, trimmed];
      persistSetting(SETTINGS_DB_KEYS.galleryCategories, next);
      return next;
    });
  };

  const updateGalleryCategory = (oldCat: string, newCat: string) => {
    const trimmed = newCat.trim();
    if (!trimmed || oldCat === trimmed) return;
    setGalleryCategories(prev => {
      const next = prev.map(c => c === oldCat ? trimmed : c);
      persistSetting(SETTINGS_DB_KEYS.galleryCategories, next);
      return next;
    });
    setGallery(prev => {
      let changed = false;
      const next = prev.map(g => {
        if (g.category === oldCat) {
          changed = true;
          return { ...g, category: trimmed };
        }
        return g;
      });
      if (changed) persistSetting(SETTINGS_DB_KEYS.gallery, next);
      return next;
    });
  };

  const deleteGalleryCategory = (cat: string) => {
    setGalleryCategories(prev => {
      const next = prev.filter(c => c !== cat);
      persistSetting(SETTINGS_DB_KEYS.galleryCategories, next);
      return next;
    });
  };

  const addEskulCategory = (cat: string) => {
    const trimmed = cat.trim();
    if (!trimmed) return;
    setEskulCategories(prev => {
      if (prev.includes(trimmed)) return prev;
      const next = [...prev, trimmed];
      persistSetting(SETTINGS_DB_KEYS.eskulCategories, next);
      return next;
    });
  };

  const updateEskulCategory = (oldCat: string, newCat: string) => {
    const trimmed = newCat.trim();
    if (!trimmed || oldCat === trimmed) return;
    setEskulCategories(prev => {
      const next = prev.map(c => c === oldCat ? trimmed : c);
      persistSetting(SETTINGS_DB_KEYS.eskulCategories, next);
      return next;
    });
    setExtracurricular(prev => {
      let changed = false;
      const next = prev.map(e => {
        if (e.category === oldCat) {
          changed = true;
          return { ...e, category: trimmed };
        }
        return e;
      });
      if (changed) persistSetting(SETTINGS_DB_KEYS.extracurricular, next);
      return next;
    });
  };

  const deleteEskulCategory = (cat: string) => {
    setEskulCategories(prev => {
      const next = prev.filter(c => c !== cat);
      persistSetting(SETTINGS_DB_KEYS.eskulCategories, next);
      return next;
    });
  };

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
      schoolIdentity, updateSchoolIdentity,
      brandSettings, updateBrandSettings,
      downloadDocuments, updateDownloadDocuments, addDownloadDocument, updateDownloadDocument, deleteDownloadDocument,
      footerCredit, updateFooterCredit,
      seoData, updateSEOData,
      analyticsData, trackPageView, resetAnalytics,
      instagramSettings, updateInstagramSettings, addInstagramPost, updateInstagramPost, deleteInstagramPost, reorderInstagramPosts,
      sponsorsData, updateSponsorsData, addSponsor, updateSponsor, deleteSponsor,
      smpbButton, updateSmpbButton,
      authSettings, updateAdminCredentials, updateAuthUiSettings,
      teachers, addTeacher, updateTeacher, deleteTeacher,
      extracurricular, addExtracurricular, updateExtracurricular, deleteExtracurricular, reorderExtracurricular,
      galleryCategories, addGalleryCategory, updateGalleryCategory, deleteGalleryCategory,
      eskulCategories, addEskulCategory, updateEskulCategory, deleteEskulCategory,
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

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import * as XLSX from 'xlsx';
import {
  LayoutDashboard, Newspaper, Calendar, Camera, LogOut, Plus, Edit, Trash2, X, Save, Eye, TrendingUp,
  GraduationCap, ImagePlus, Phone, Sliders, FileText, Youtube, MapPin, Mail, Clock, Globe, ArrowUp, ArrowDown,
  Home, ChevronLeft, BarChart3, Users, Award, BookOpen, Star, Search, Activity, MousePointerClick,
  FileSearch, Tag, Link2, Shield, CheckCircle, RotateCcw, Instagram, Heart, ExternalLink, ToggleLeft, ToggleRight,
  Download, Upload, Database, HardDrive, AlertTriangle, RefreshCw, Info, Trophy,
  Image, Type, Smartphone, Images, FileSpreadsheet
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  NewsItem, AgendaItem, GalleryItem, SliderItem, ProfileData, StatsData, SEOData,
  DownloadDocument, DownloadDocumentsData, InstagramPost, InstagramSettings, Sponsor, SchoolIdentitySettings, TeacherData,
  ExtracurricularItem, ESKUL_CATEGORIES, initialExtracurricular,
  NEWS_CATEGORIES, AGENDA_TYPES, GALLERY_CATEGORIES, CATEGORY_COLORS, getYoutubeThumbnail,
  initialNews, initialAgenda, initialGallery, initialContactInfo, initialSliderItems, initialProfileData, initialStatsData,
  initialDownloadDocumentsData, initialSEOData, initialAnalyticsData, initialInstagramSettings, initialSchoolIdentitySettings,
  initialSponsorsData, initialSmpbButtonSettings, initialAuthSettings
} from '../types';
import RichTextEditor from '../components/RichTextEditor';
import { SETTINGS_DB_KEYS } from '../constants/settingsKeys';
import { DEFAULT_SETTINGS_BY_KEY } from '../constants/defaultSettings';
import { applyThemePreset, SCHOOL_THEME_PRESETS, BOTTOM_NAV_STYLES } from '../utils/schoolIdentity';
import {
  uploadImageWithDetails,
  formatBytes,
} from '../services/storageService';
import { AdminToastContainer, ImageStorageBadge, type Toast } from '../components/AdminToast';
import { UploadProgressBar, type UploadState } from '../components/UploadProgressBar';
import {
  checkDatabaseConnection,
  ensureDefaultSettings,
  exportAllSettings,
  getDatabaseStorageStats,
  loadSettings,
  resetSettingsToDefault,
  saveSetting,
  type DatabaseConnectionStatus,
  type DatabaseStorageStats,
} from '../services/settingsRepository';

type Tab = 'overview' | 'news' | 'agenda' | 'gallery' | 'slider' | 'contact' | 'profile' | 'stats' | 'branding' | 'downloads' | 'seo' | 'instagram' | 'sponsors' | 'guru' | 'eskul' | 'security' | 'database';
type TabGroupId = 'ringkasan' | 'konten' | 'identitas' | 'promosi' | 'sistem';

const emptyEskul: Omit<ExtracurricularItem, 'id'> = {
  name: '',
  category: 'Keagamaan',
  description: '',
  schedule: '',
  location: '',
  coach: '',
  image: '',
  achievements: [],
  isActive: true,
  order: 0,
  galleryId: '',
};

const emptyInstagramPost: Omit<InstagramPost, 'id'> = { postUrl: '', caption: '', thumbnail: '', likes: '', date: new Date().toISOString().split('T')[0], isEmbed: false, embedCode: '' };

const emptyNews: Omit<NewsItem, 'id'> = { title: '', excerpt: '', content: '', category: 'Akademik', image: '', date: new Date().toISOString().split('T')[0], author: 'Admin' };
const emptyAgenda: Omit<AgendaItem, 'id'> = { title: '', date: '', endDate: '', time: '', location: '', description: '', type: 'Kegiatan' };
const emptyGallery: Omit<GalleryItem, 'id'> = { title: '', image: '', images: [], description: '', category: 'Akademik', date: new Date().toISOString().split('T')[0], mediaType: 'image', youtubeUrl: '' };
const emptySlider: Omit<SliderItem, 'id'> = { title: '', subtitle: '', image: '', backgroundColor: '#0f766e', buttonText: '', buttonLink: '', overlayOpacity: 70, showText: true };
const emptySponsor: Omit<Sponsor, 'id'> = { name: '', logo: '', url: '' };
const emptyTeacher: Omit<TeacherData, 'id'> = { name: '', position: '', subject: '', education: '', phone: '', gender: 'L', photo: '', socialMedia: {} };
const emptyDownloadDocument: Omit<DownloadDocument, 'id'> = {
  title: '',
  description: '',
  category: 'Umum',
  googleDriveLink: '',
  fileType: 'PDF',
  publishedAt: new Date().toISOString().split('T')[0],
  isActive: true,
};

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

export default function Dashboard() {
  const {
    isLoggedIn, logout,
    news, addNews, updateNews, deleteNews,
    agenda, addAgenda, updateAgenda, deleteAgenda,
    gallery, addGallery, updateGallery, deleteGallery,
    sliderItems, addSliderItem, updateSliderItem, deleteSliderItem, reorderSlider,
    profileData, updateProfileData,
    statsData, updateStatsData,
    schoolIdentity, updateSchoolIdentity,
    downloadDocuments, updateDownloadDocuments, addDownloadDocument, updateDownloadDocument, deleteDownloadDocument,
    seoData, updateSEOData,
    analyticsData, resetAnalytics,
    instagramSettings, updateInstagramSettings, addInstagramPost, updateInstagramPost, deleteInstagramPost, reorderInstagramPosts,
    sponsorsData, updateSponsorsData, addSponsor, updateSponsor, deleteSponsor,
    smpbButton, updateSmpbButton,
    authSettings, updateAdminCredentials, updateAuthUiSettings,
    teachers, addTeacher, updateTeacher, deleteTeacher,
    extracurricular, addExtracurricular, updateExtracurricular, deleteExtracurricular,
    galleryCategories, addGalleryCategory, updateGalleryCategory, deleteGalleryCategory,
    eskulCategories, addEskulCategory, updateEskulCategory, deleteEskulCategory,
  } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [activeTabGroup, setActiveTabGroup] = useState<TabGroupId>('ringkasan');
  const [isMobileAdminMenuOpen, setIsMobileAdminMenuOpen] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<TabGroupId, boolean>>({
    ringkasan: false,
    konten: false,
    identitas: false,
    promosi: false,
    sistem: false,
  });

  const [showNewsModal, setShowNewsModal] = useState(false);
  const [showAgendaModal, setShowAgendaModal] = useState(false);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [showSliderModal, setShowSliderModal] = useState(false);
  const [editingNewsId, setEditingNewsId] = useState<string | null>(null);
  const [editingAgendaId, setEditingAgendaId] = useState<string | null>(null);
  const [editingGalleryId, setEditingGalleryId] = useState<string | null>(null);
  const [editingSlideId, setEditingSlideId] = useState<string | null>(null);
  const [sliderSaved, setSliderSaved] = useState(false);
  const sliderSavedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggerSliderSaved = useCallback(() => {
    if (sliderSavedTimeoutRef.current) {
      clearTimeout(sliderSavedTimeoutRef.current);
    }
    setSliderSaved(true);
    sliderSavedTimeoutRef.current = setTimeout(() => {
      setSliderSaved(false);
      sliderSavedTimeoutRef.current = null;
    }, 3000);
  }, []);
  const [sliderError, setSliderError] = useState('');
  const [isImageProcessing, setIsImageProcessing] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [uploadState, setUploadState] = useState<UploadState>({
    isActive: false,
    fileName: '',
    stage: 'compressing',
    message: '',
    percent: 0,
  });

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: Toast = { ...toast, id };
    setToasts((prev) => [...prev, newToast]);
    const duration = toast.duration ?? (toast.type === 'error' ? 6000 : 4000);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const notifySaved = useCallback((title: string, message?: string) => {
    addToast({
      type: 'success',
      title,
      message: message || 'Perubahan telah tersimpan dan disinkronkan ke database Supabase.',
    });
  }, [addToast]);
  const [editingSponsorId, setEditingSponsorId] = useState<string | null>(null);
  const [showSponsorModal, setShowSponsorModal] = useState(false);
  const [sponsorSaved, setSponsorSaved] = useState(false);
  const [sponsorError, setSponsorError] = useState('');
  const [newsForm, setNewsForm] = useState(emptyNews);
  const [agendaForm, setAgendaForm] = useState(emptyAgenda);
  const [galleryForm, setGalleryForm] = useState(emptyGallery);
  const [sliderForm, setSliderForm] = useState(emptySlider);
  const [sponsorForm, setSponsorForm] = useState(emptySponsor);
  const [showGuruModal, setShowGuruModal] = useState(false);
  const [editingGuruId, setEditingGuruId] = useState<string | null>(null);
  const [guruSaved, setGuruSaved] = useState(false);
  const [guruError, setGuruError] = useState('');
  const [guruForm, setGuruForm] = useState(emptyTeacher);
  const [showEskulModal, setShowEskulModal] = useState(false);
  const [editingEskulId, setEditingEskulId] = useState<string | null>(null);
  const [eskulSaved, setEskulSaved] = useState(false);
  const [eskulError, setEskulError] = useState('');
  const [eskulForm, setEskulForm] = useState(emptyEskul);
  const [eskulSearch, setEskulSearch] = useState('');
  const [eskulCategoryFilter, setEskulCategoryFilter] = useState('Semua');
  const [newAchievementText, setNewAchievementText] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: string; id: string } | null>(null);

  // Category management modals
  const [showGalCatModal, setShowGalCatModal] = useState(false);
  const [newGalCatName, setNewGalCatName] = useState('');
  const [editingGalCat, setEditingGalCat] = useState<{ oldName: string; newName: string } | null>(null);

  const [showEskulCatModal, setShowEskulCatModal] = useState(false);
  const [newEskulCatName, setNewEskulCatName] = useState('');
  const [editingEskulCat, setEditingEskulCat] = useState<{ oldName: string; newName: string } | null>(null);

  const [showInstagramModal, setShowInstagramModal] = useState(false);
  const [editingInstagramId, setEditingInstagramId] = useState<string | null>(null);
  const [instagramForm, setInstagramForm] = useState<Omit<InstagramPost, 'id'>>(emptyInstagramPost);
  const [instagramSettingsForm, setInstagramSettingsForm] = useState<Pick<InstagramSettings, 'username' | 'profileUrl' | 'showSection' | 'sectionTitle' | 'embedType' | 'widgetCode'>>({
    username: instagramSettings.username,
    profileUrl: instagramSettings.profileUrl,
    showSection: instagramSettings.showSection,
    sectionTitle: instagramSettings.sectionTitle,
    embedType: instagramSettings.embedType || 'widget',
    widgetCode: instagramSettings.widgetCode || '',
  });
  const [instagramSettingsSaved, setInstagramSettingsSaved] = useState(false);

  const [profileForm, setProfileForm] = useState<ProfileData>(profileData);
  const [misiInput, setMisiInput] = useState('');
  const [facilityInput, setFacilityInput] = useState('');
  const [identityForm, setIdentityForm] = useState<SchoolIdentitySettings>(schoolIdentity);
  const [identitySaved, setIdentitySaved] = useState(false);
  const [identityErrors, setIdentityErrors] = useState<string[]>([]);
  const [smpbForm, setSmpbForm] = useState(smpbButton);
  const [smpbSaved, setSmpbSaved] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [statsForm, setStatsForm] = useState<StatsData>(statsData);
  const [statsSaved, setStatsSaved] = useState(false);
  const [downloadsForm, setDownloadsForm] = useState<DownloadDocumentsData>(downloadDocuments);
  const [downloadsSaved, setDownloadsSaved] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [editingDownloadId, setEditingDownloadId] = useState<string | null>(null);
  const [downloadForm, setDownloadForm] = useState<Omit<DownloadDocument, 'id'>>(emptyDownloadDocument);
  const [downloadError, setDownloadError] = useState('');
  const [seoForm, setSeoForm] = useState<SEOData>(seoData);
  const [seoSaved, setSeoSaved] = useState(false);
  const [credentialsForm, setCredentialsForm] = useState({ username: authSettings.username, password: '', confirmPassword: '' });
  const [securitySaved, setSecuritySaved] = useState(false);
  const [securityError, setSecurityError] = useState('');

  const overviewSetupSummary = useMemo(() => {
    const items = [
      { label: 'Berita', count: news.length },
      { label: 'Agenda', count: agenda.length },
      { label: 'Galeri', count: gallery.length },
      { label: 'Ekstrakurikuler', count: extracurricular.length },
      { label: 'Slider Hero', count: sliderItems.length },
      { label: 'Dokumen Download', count: downloadDocuments.documents.length },
      { label: 'Instagram', count: instagramSettings.posts.length },
      { label: 'Sponsor/Mitra', count: sponsorsData.sponsors.length },
    ];
    const pendingItems = items.filter((item) => item.count === 0);

    return {
      pendingItems,
      isFreshInstall: pendingItems.length === items.length,
      hasSetupWarning: pendingItems.length > 0,
    };
  }, [agenda.length, downloadDocuments.documents.length, extracurricular.length, gallery.length, instagramSettings.posts.length, news.length, sliderItems.length, sponsorsData.sponsors.length]);

  useEffect(() => { setIdentityForm(schoolIdentity); }, [schoolIdentity]);
  useEffect(() => { setSmpbForm(smpbButton); }, [smpbButton]);
  useEffect(() => { setProfileForm(profileData); }, [profileData]);
  useEffect(() => { setStatsForm(statsData); }, [statsData]);
  useEffect(() => { setDownloadsForm(downloadDocuments); }, [downloadDocuments]);
  useEffect(() => { setSeoForm(seoData); }, [seoData]);
  useEffect(() => {
    setCredentialsForm(prev => ({ ...prev, username: authSettings.username }));
  }, [authSettings.username]);

  // If not logged in, redirect to login immediately
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => { logout(); navigate('/', { replace: true }); };

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    setForm: (fn: (prev: any) => any) => void,
    field = 'image',
    folder = 'uploads'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) {
      addToast({
        type: 'error',
        title: 'Ukuran File Terlalu Besar',
        message: 'Ukuran file maksimal 15MB. Silakan pilih foto dengan ukuran lebih kecil.',
      });
      return;
    }

    setIsImageProcessing(true);
    setUploadState({
      isActive: true,
      fileName: file.name,
      stage: 'compressing',
      message: `Mengoptimalkan gambar (${formatBytes(file.size)})...`,
      percent: 25,
    });

    try {
      const result = await uploadImageWithDetails(file, folder, undefined, (progress) => {
        setUploadState((prev) => ({
          ...prev,
          stage: progress.stage,
          message: progress.message,
          percent: progress.percent ?? prev.percent,
        }));
      });

      setForm((prev: any) => ({ ...prev, [field]: result.url }));

      if (result.isCloudStorage) {
        addToast({
          type: 'success',
          title: 'Gambar Berhasil Terupload ke Cloud Storage!',
          message: `${file.name} dikompresi dari ${formatBytes(result.originalSize)} jadi ${formatBytes(result.compressedSize)} (hemat ${result.savedPercent}%) dan tersimpan di CDN Supabase.`,
        });
        setUploadState({
          isActive: true,
          fileName: file.name,
          stage: 'done',
          message: 'Tersimpan di Cloud Storage CDN',
          percent: 100,
          stats: {
            originalSize: formatBytes(result.originalSize),
            compressedSize: formatBytes(result.compressedSize),
            savedPercent: result.savedPercent,
            isCloudStorage: true,
          },
        });
      } else {
        addToast({
          type: 'warning',
          title: 'Gambar Disimpan di Penyimpanan Cadangan (Lokal)',
          message: result.error
            ? `Cloud storage tidak terhubung (${result.error}). Gambar tersimpan sementara di lokal.`
            : 'Gambar disimpan dalam format lokal (Base64).',
        });
        setUploadState({
          isActive: true,
          fileName: file.name,
          stage: 'done',
          message: 'Tersimpan di format lokal',
          percent: 100,
          stats: {
            originalSize: formatBytes(result.originalSize),
            compressedSize: formatBytes(result.compressedSize),
            savedPercent: result.savedPercent,
            isCloudStorage: false,
          },
        });
      }

      setTimeout(() => {
        setUploadState((prev) => ({ ...prev, isActive: false }));
      }, 4000);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Kesalahan jaringan saat memproses gambar.';
      addToast({
        type: 'error',
        title: 'Gagal Memproses Gambar',
        message: errorMsg,
      });
      setUploadState({
        isActive: true,
        fileName: file.name,
        stage: 'error',
        message: `Gagal: ${errorMsg}`,
        percent: 100,
      });
    } finally {
      setIsImageProcessing(false);
      e.target.value = '';
    }
  };

  // News
  const openNewsAdd = () => { setNewsForm(emptyNews); setEditingNewsId(null); setShowNewsModal(true); };
  const openNewsEdit = (item: NewsItem) => {
    setNewsForm({ title: item.title, excerpt: item.excerpt, content: item.content, category: item.category, image: item.image, date: item.date, author: item.author });
    setEditingNewsId(item.id); setShowNewsModal(true);
  };
  const saveNews = () => {
    if (!newsForm.title || !newsForm.excerpt) return;
    if (editingNewsId) updateNews(editingNewsId, newsForm); else addNews(newsForm);
    setShowNewsModal(false);
    notifySaved('Berita Berhasil Disimpan!');
  };

  // Agenda
  const openAgendaAdd = () => { setAgendaForm(emptyAgenda); setEditingAgendaId(null); setShowAgendaModal(true); };
  const openAgendaEdit = (item: AgendaItem) => {
    setAgendaForm({ title: item.title, date: item.date, endDate: item.endDate, time: item.time, location: item.location, description: item.description, type: item.type });
    setEditingAgendaId(item.id); setShowAgendaModal(true);
  };
  const saveAgenda = () => {
    if (!agendaForm.title || !agendaForm.date) return;
    if (editingAgendaId) updateAgenda(editingAgendaId, agendaForm); else addAgenda(agendaForm);
    setShowAgendaModal(false);
    notifySaved('Agenda Berhasil Disimpan!');
  };

  // Gallery
  const handleMultipleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsImageProcessing(true);
    const total = files.length;
    setUploadState({
      isActive: true,
      fileName: `${total} foto kegiatan`,
      stage: 'compressing',
      message: `Menyiapkan ${total} foto untuk diunggah...`,
      percent: 10,
    });

    try {
      const uploadedList: string[] = [];
      let cloudCount = 0;
      for (let i = 0; i < total; i++) {
        const file = files[i];
        if (file.size > 15 * 1024 * 1024) continue;
        const progressPercent = Math.round(((i + 1) / total) * 100);
        setUploadState({
          isActive: true,
          fileName: file.name,
          stage: 'uploading',
          message: `Mengunggah foto ${i + 1} dari ${total} (${file.name})...`,
          percent: progressPercent,
        });

        const res = await uploadImageWithDetails(file, 'gallery', { maxWidth: 1200, maxHeight: 1200, quality: 0.8 });
        uploadedList.push(res.url);
        if (res.isCloudStorage) cloudCount++;
      }

      setGalleryForm(prev => {
        const existing = prev.images && prev.images.length > 0 ? prev.images : (prev.image ? [prev.image] : []);
        const nextImages = [...existing, ...uploadedList];
        const cover = prev.image || nextImages[0] || '';
        return {
          ...prev,
          images: nextImages,
          image: cover,
        };
      });

      addToast({
        type: 'success',
        title: 'Upload Galeri Selesai!',
        message: `${uploadedList.length} foto berhasil diunggah (${cloudCount} tersimpan langsung di Supabase Cloud Storage CDN).`,
      });

      setUploadState({
        isActive: true,
        fileName: `${uploadedList.length} Foto Berhasil`,
        stage: 'done',
        message: `${cloudCount} dari ${uploadedList.length} tersimpan di CDN Supabase`,
        percent: 100,
      });

      setTimeout(() => {
        setUploadState((prev) => ({ ...prev, isActive: false }));
      }, 4000);
    } catch (err) {
      console.error('Gagal memproses gambar:', err);
      const errorMsg = err instanceof Error ? err.message : 'Pastikan format gambar valid.';
      addToast({
        type: 'error',
        title: 'Gagal Mengunggah Galeri',
        message: errorMsg,
      });
    } finally {
      setIsImageProcessing(false);
      e.target.value = '';
    }
  };


  const removeGalleryPhoto = (indexToRemove: number) => {
    setGalleryForm(prev => {
      const currentList = prev.images && prev.images.length > 0 ? prev.images : (prev.image ? [prev.image] : []);
      const photoToRemove = currentList[indexToRemove];
      const nextList = currentList.filter((_, idx) => idx !== indexToRemove);
      let nextCover = prev.image;
      if (prev.image === photoToRemove) {
        nextCover = nextList[0] || '';
      }
      return {
        ...prev,
        images: nextList,
        image: nextCover,
      };
    });
  };

  const setGalleryCover = (photoUrl: string) => {
    setGalleryForm(prev => ({
      ...prev,
      image: photoUrl,
    }));
  };

  const openGalleryAdd = () => {
    setGalleryForm({
      ...emptyGallery,
      category: (galleryCategories && galleryCategories[0]) || 'Akademik',
      date: new Date().toISOString().split('T')[0],
    });
    setEditingGalleryId(null);
    setShowGalleryModal(true);
  };

  const openGalleryEdit = (item: GalleryItem) => {
    const imgs = item.images && item.images.length > 0 ? [...item.images] : (item.image ? [item.image] : []);
    setGalleryForm({
      title: item.title,
      image: item.image || imgs[0] || '',
      images: imgs,
      description: item.description || '',
      category: item.category,
      date: item.date,
      mediaType: item.mediaType || 'image',
      youtubeUrl: item.youtubeUrl || '',
    });
    setEditingGalleryId(item.id);
    setShowGalleryModal(true);
  };

  const saveGallery = () => {
    if (!galleryForm.title) return;
    const cover = galleryForm.image || (galleryForm.images && galleryForm.images[0]) || '';
    const payload: Omit<GalleryItem, 'id'> = {
      ...galleryForm,
      image: cover,
      images: galleryForm.images && galleryForm.images.length > 0 ? galleryForm.images : (cover ? [cover] : []),
    };
    if (editingGalleryId) updateGallery(editingGalleryId, payload);
    else addGallery(payload);
    setShowGalleryModal(false);
    notifySaved('Album Galeri Berhasil Disimpan!');
  };

  // Gallery Categories Handlers
  const handleAddGalCat = () => {
    const trimmed = newGalCatName.trim();
    if (!trimmed) return;
    addGalleryCategory(trimmed);
    setNewGalCatName('');
  };
  const handleUpdateGalCat = () => {
    if (!editingGalCat || !editingGalCat.newName.trim()) return;
    updateGalleryCategory(editingGalCat.oldName, editingGalCat.newName.trim());
    setEditingGalCat(null);
  };
  const handleDeleteGalCat = (cat: string) => {
    if (window.confirm(`Yakin ingin menghapus kategori galeri "${cat}"?`)) {
      deleteGalleryCategory(cat);
    }
  };

  // Eskul Categories Handlers
  const handleAddEskulCat = () => {
    const trimmed = newEskulCatName.trim();
    if (!trimmed) return;
    addEskulCategory(trimmed);
    setNewEskulCatName('');
  };
  const handleUpdateEskulCat = () => {
    if (!editingEskulCat || !editingEskulCat.newName.trim()) return;
    updateEskulCategory(editingEskulCat.oldName, editingEskulCat.newName.trim());
    setEditingEskulCat(null);
  };
  const handleDeleteEskulCat = (cat: string) => {
    if (window.confirm(`Yakin ingin menghapus kategori eskul "${cat}"?`)) {
      deleteEskulCategory(cat);
    }
  };

  // Slider
  const closeSliderModal = () => {
    setShowSliderModal(false);
    setEditingSlideId(null);
    setSliderForm(emptySlider);
    setSliderError('');
  };
  const openSliderAdd = () => {
    setSliderForm(emptySlider);
    setEditingSlideId(null);
    setSliderError('');
    setShowSliderModal(true);
  };
  const openSliderEdit = (item: SliderItem) => {
    setSliderForm({
      title: item.title || '',
      subtitle: item.subtitle || '',
      image: item.image || '',
      backgroundColor: item.backgroundColor || '#0f766e',
      buttonText: item.buttonText || '',
      buttonLink: item.buttonLink || '',
      overlayOpacity: item.overlayOpacity !== undefined ? item.overlayOpacity : (item.showText === false ? 0 : 70),
      showText: item.showText !== false,
    });
    setEditingSlideId(item.id);
    setSliderError('');
    setShowSliderModal(true);
  };
  const saveSlider = () => {
    if (isImageProcessing) return;
    const titleVal = sliderForm.title.trim();
    if (!titleVal && sliderForm.showText !== false) {
      setSliderError('Judul slide wajib diisi.');
      return;
    }
    const finalForm: Omit<SliderItem, 'id'> = {
      title: titleVal || 'Slide Banner Visual',
      subtitle: sliderForm.subtitle.trim(),
      image: sliderForm.image,
      backgroundColor: sliderForm.backgroundColor || '#0f766e',
      buttonText: sliderForm.buttonText.trim(),
      buttonLink: sliderForm.buttonLink.trim(),
      overlayOpacity: sliderForm.overlayOpacity !== undefined ? sliderForm.overlayOpacity : (sliderForm.showText === false ? 0 : 70),
      showText: sliderForm.showText !== false,
    };
    if (editingSlideId) {
      updateSliderItem(editingSlideId, finalForm);
    } else {
      addSliderItem(finalForm);
    }
    closeSliderModal();
    triggerSliderSaved();
    notifySaved('Slide Banner Berhasil Disimpan!');
  };
  const moveSlider = (idx: number, dir: 'up' | 'down') => {
    const arr = [...sliderItems];
    const s = dir === 'up' ? idx - 1 : idx + 1;
    if (s < 0 || s >= arr.length) return;
    [arr[idx], arr[s]] = [arr[s], arr[idx]];
    reorderSlider(arr);
  };

  // Stats
  const saveStats = () => {
    updateStatsData(statsForm);
    setStatsSaved(true);
    notifySaved('Statistik Sekolah Berhasil Disimpan!');
    setTimeout(() => setStatsSaved(false), 2000);
  };

  const saveIdentity = () => {
    const normalizedIdentity: SchoolIdentitySettings = {
      ...identityForm,
      schoolName: identityForm.schoolName.trim(),
      schoolShortName: identityForm.schoolShortName.trim(),
      schoolTagline: identityForm.schoolTagline.trim(),
      legalName: identityForm.legalName.trim(),
      footerDescription: identityForm.footerDescription.trim(),
      address: identityForm.address.trim(),
      phone: identityForm.phone.trim(),
      email: identityForm.email.trim(),
      hours: identityForm.hours.trim(),
      mapQuery: identityForm.mapQuery.trim(),
      mapEmbedUrl: identityForm.mapEmbedUrl.trim(),
      mapDirectionsUrl: identityForm.mapDirectionsUrl.trim(),
      facebook: identityForm.facebook.trim(),
      instagram: identityForm.instagram.trim(),
      youtube: identityForm.youtube.trim(),
      legalNotice: identityForm.legalNotice.trim(),
      copyrightText: identityForm.copyrightText.trim(),
      developerName: identityForm.developerName.trim(),
      developerUrl: identityForm.developerUrl.trim(),
    };

    const result = updateSchoolIdentity(normalizedIdentity);
    if (!result.success) {
      setIdentitySaved(false);
      setIdentityErrors(result.errors);
      return;
    }

    setIdentityErrors([]);
    setIdentitySaved(true);
    notifySaved('Identitas & Logo Sekolah Berhasil Disimpan!');
    setTimeout(() => setIdentitySaved(false), 2000);
  };

  const saveDownloadsPage = () => {
    updateDownloadDocuments({
      pageTitle: downloadsForm.pageTitle.trim(),
      pageDescription: downloadsForm.pageDescription.trim(),
      showPage: downloadsForm.showPage,
    });
    setDownloadsSaved(true);
    notifySaved('Pengaturan Halaman Unduhan Berhasil Disimpan!');
    setTimeout(() => setDownloadsSaved(false), 2000);
  };

  const openDownloadAdd = () => {
    setDownloadForm(emptyDownloadDocument);
    setEditingDownloadId(null);
    setDownloadError('');
    setShowDownloadModal(true);
  };

  const openDownloadEdit = (item: DownloadDocument) => {
    setDownloadForm({
      title: item.title,
      description: item.description,
      category: item.category,
      googleDriveLink: item.googleDriveLink,
      fileType: item.fileType,
      publishedAt: item.publishedAt,
      isActive: item.isActive,
    });
    setEditingDownloadId(item.id);
    setDownloadError('');
    setShowDownloadModal(true);
  };

  const saveDownload = () => {
    if (!downloadForm.title.trim()) {
      setDownloadError('Nama dokumen wajib diisi.');
      return;
    }
    if (!downloadForm.googleDriveLink.trim()) {
      setDownloadError('Link Google Drive wajib diisi.');
      return;
    }
    if (editingDownloadId) updateDownloadDocument(editingDownloadId, downloadForm);
    else addDownloadDocument(downloadForm);
    setShowDownloadModal(false);
    notifySaved('Dokumen Unduhan Berhasil Disimpan!');
  };

  // SEO
  const saveSeo = () => {
    updateSEOData(seoForm);
    setSeoSaved(true);
    notifySaved('Konfigurasi SEO Berhasil Disimpan!');
    setTimeout(() => setSeoSaved(false), 2000);
  };

  const saveSmpbSettings = () => {
    updateSmpbButton({
      isActive: smpbForm.isActive,
      label: smpbForm.label.trim(),
      year: smpbForm.year.trim(),
      link: smpbForm.link.trim(),
      openInNewTab: smpbForm.openInNewTab,
    });
    setSmpbSaved(true);
    notifySaved('Pengaturan SPMB Berhasil Disimpan!');
    setTimeout(() => setSmpbSaved(false), 2000);
  };

  const saveAdminCredentials = () => {
    const username = credentialsForm.username.trim();
    const password = credentialsForm.password.trim();
    const confirmPassword = credentialsForm.confirmPassword.trim();
    if (!password) {
      setSecurityError('Password baru wajib diisi.');
      return;
    }
    if (password.length < 6) {
      setSecurityError('Password minimal 6 karakter.');
      return;
    }
    if (password !== confirmPassword) {
      setSecurityError('Konfirmasi password tidak sama.');
      return;
    }
    updateAdminCredentials({
      username: username || authSettings.username,
      password,
    });
    setSecurityError('');
    setSecuritySaved(true);
    notifySaved('Kredensial Admin Berhasil Diperbarui!');
    setCredentialsForm(prev => ({ ...prev, password: '', confirmPassword: '' }));
    setTimeout(() => setSecuritySaved(false), 2000);
  };

  // Profile
  const addMisi = () => { if (misiInput.trim()) { setProfileForm(p => ({ ...p, misi: [...p.misi, misiInput.trim()] })); setMisiInput(''); } };
  const removeMisi = (i: number) => { setProfileForm(p => ({ ...p, misi: p.misi.filter((_, idx) => idx !== i) })); };
  const addFacility = () => { if (facilityInput.trim()) { setProfileForm(p => ({ ...p, facilities: [...p.facilities, facilityInput.trim()] })); setFacilityInput(''); } };
  const removeFacility = (i: number) => { setProfileForm(p => ({ ...p, facilities: p.facilities.filter((_, idx) => idx !== i) })); };
  const saveProfile = () => {
    updateProfileData(profileForm);
    setProfileSaved(true);
    notifySaved('Profil Sekolah Berhasil Disimpan!');
    setTimeout(() => setProfileSaved(false), 2000);
  };

  const confirmDelete = () => {
    if (!deleteConfirm) return;
    try {
      if (deleteConfirm.type === 'news') deleteNews(deleteConfirm.id);
      if (deleteConfirm.type === 'agenda') deleteAgenda(deleteConfirm.id);
      if (deleteConfirm.type === 'gallery') deleteGallery(deleteConfirm.id);
      if (deleteConfirm.type === 'slider') deleteSliderItem(deleteConfirm.id);
      if (deleteConfirm.type === 'instagram') deleteInstagramPost(deleteConfirm.id);
      if (deleteConfirm.type === 'sponsor') deleteSponsor(deleteConfirm.id);
      if (deleteConfirm.type === 'guru') deleteTeacher(deleteConfirm.id);
      if (deleteConfirm.type === 'eskul') deleteExtracurricular(deleteConfirm.id);
      if (deleteConfirm.type === 'download') deleteDownloadDocument(deleteConfirm.id);
    } catch (err) {
      console.error('Gagal menghapus data:', err);
    }
    setDeleteConfirm(null);
  };

  // Sponsors
  const openSponsorAdd = () => {
    setSponsorForm(emptySponsor);
    setEditingSponsorId(null);
    setSponsorError('');
    setShowSponsorModal(true);
  };
  const openSponsorEdit = (item: Sponsor) => {
    setSponsorForm({ name: item.name, logo: item.logo, url: item.url });
    setEditingSponsorId(item.id);
    setSponsorError('');
    setShowSponsorModal(true);
  };
  const saveSponsor = () => {
    if (!sponsorForm.name.trim()) {
      setSponsorError('Nama sponsor wajib diisi.');
      return;
    }
    try {
      if (editingSponsorId) {
        updateSponsor(editingSponsorId, sponsorForm);
      } else {
        addSponsor(sponsorForm);
      }
      setSponsorSaved(true);
      setSponsorError('');
      setShowSponsorModal(false);
      notifySaved('Data Sponsor Berhasil Disimpan!');
      setTimeout(() => setSponsorSaved(false), 2000);
    } catch (err) {
      console.error('Gagal menyimpan sponsor:', err);
      setSponsorError('Terjadi kesalahan saat menyimpan sponsor.');
    }
  };

  // Guru handlers
  const openGuruAdd = () => {
    setGuruForm(emptyTeacher);
    setEditingGuruId(null);
    setGuruError('');
    setShowGuruModal(true);
  };
  const openGuruEdit = (item: TeacherData) => {
    setGuruForm({ name: item.name, position: item.position, subject: item.subject, education: item.education, phone: item.phone, gender: item.gender, photo: item.photo, socialMedia: item.socialMedia || {} });
    setEditingGuruId(item.id);
    setGuruError('');
    setShowGuruModal(true);
  };
  const saveGuru = () => {
    if (!guruForm.name.trim()) {
      setGuruError('Nama guru wajib diisi.');
      return;
    }
    try {
      if (editingGuruId) {
        updateTeacher(editingGuruId, guruForm);
      } else {
        addTeacher(guruForm);
      }
      setGuruSaved(true);
      setGuruError('');
      setShowGuruModal(false);
      notifySaved('Data Guru Berhasil Disimpan!');
      setTimeout(() => setGuruSaved(false), 2000);
    } catch (err) {
      console.error('Gagal menyimpan guru:', err);
      setGuruError('Terjadi kesalahan saat menyimpan guru.');
    }
  };

  const downloadGuruTemplate = () => {
    const wb = XLSX.utils.book_new();
    const templateRows = [
      {
        'Nama Lengkap': 'Ahmad Faiq Fazaudin, S.Pd',
        'Jabatan': 'Kepala Madrasah',
        'Jenis Kelamin': 'L',
        'Guru Mapel': 'Al-Qur\'an Hadits',
        'Pendidikan': 'S1 Pendidikan Agama Islam',
        'No. Telepon': '0812-3456-7890',
        'Facebook': 'https://facebook.com/username',
        'Instagram': 'https://instagram.com/username',
        'YouTube': 'https://youtube.com/@madrasah',
        'WhatsApp': '081234567890',
      },
      {
        'Nama Lengkap': 'Siti Nurhaliza, M.Pd',
        'Jabatan': 'Guru Mapel',
        'Jenis Kelamin': 'P',
        'Guru Mapel': 'Matematika',
        'Pendidikan': 'S2 Pendidikan Matematika',
        'No. Telepon': '0852-3092-6049',
        'Facebook': '',
        'Instagram': 'https://instagram.com/sitinurhaliza',
        'YouTube': '',
        'WhatsApp': '085230926049',
      },
      {
        'Nama Lengkap': 'Budi Santoso, S.Kom',
        'Jabatan': 'Staf IT & TU',
        'Jenis Kelamin': 'L',
        'Guru Mapel': 'Informatika',
        'Pendidikan': 'S1 Teknik Informatika',
        'No. Telepon': '0878-1234-5678',
        'Facebook': '',
        'Instagram': '',
        'YouTube': '',
        'WhatsApp': '087812345678',
      },
    ];

    const ws = XLSX.utils.json_to_sheet(templateRows);
    ws['!cols'] = [
      { wch: 32 }, // Nama Lengkap
      { wch: 22 }, // Jabatan
      { wch: 15 }, // Jenis Kelamin
      { wch: 24 }, // Guru Mapel
      { wch: 28 }, // Pendidikan
      { wch: 18 }, // No. Telepon
      { wch: 30 }, // Facebook
      { wch: 30 }, // Instagram
      { wch: 30 }, // YouTube
      { wch: 18 }, // WhatsApp
    ];
    XLSX.utils.book_append_sheet(wb, ws, 'Template Data Guru');

    // Sheet 2: Petunjuk Pengisian
    const petunjukRows = [
      { 'Nama Kolom': 'Nama Lengkap', 'Wajib': 'Ya', 'Keterangan': 'Nama lengkap guru beserta gelar (wajib diisi)' },
      { 'Nama Kolom': 'Jabatan', 'Wajib': 'Opsional', 'Keterangan': 'Contoh: Kepala Madrasah, Waka Kurikulum, Guru Mapel, Staf TU' },
      { 'Nama Kolom': 'Jenis Kelamin', 'Wajib': 'Opsional', 'Keterangan': 'Isi L untuk Laki-Laki atau P untuk Perempuan' },
      { 'Nama Kolom': 'Guru Mapel', 'Wajib': 'Opsional', 'Keterangan': 'Mata pelajaran yang diampu' },
      { 'Nama Kolom': 'Pendidikan', 'Wajib': 'Opsional', 'Keterangan': 'Pendidikan terakhir (contoh: S1 PAI, S2 Manajemen)' },
      { 'Nama Kolom': 'No. Telepon', 'Wajib': 'Opsional', 'Keterangan': 'Nomor HP atau telepon' },
      { 'Nama Kolom': 'Facebook', 'Wajib': 'Opsional', 'Keterangan': 'Link akun Facebook (opsional)' },
      { 'Nama Kolom': 'Instagram', 'Wajib': 'Opsional', 'Keterangan': 'Link akun atau username Instagram (opsional)' },
      { 'Nama Kolom': 'YouTube', 'Wajib': 'Opsional', 'Keterangan': 'Link channel YouTube (opsional)' },
      { 'Nama Kolom': 'WhatsApp', 'Wajib': 'Opsional', 'Keterangan': 'Nomor WhatsApp aktif' },
    ];
    const wsPetunjuk = XLSX.utils.json_to_sheet(petunjukRows);
    wsPetunjuk['!cols'] = [{ wch: 18 }, { wch: 12 }, { wch: 55 }];
    XLSX.utils.book_append_sheet(wb, wsPetunjuk, 'Petunjuk Pengisian');

    XLSX.writeFile(wb, 'template-data-guru.xlsx');
    addToast({
      type: 'success',
      title: 'Template Berhasil Diunduh',
      message: 'File template-data-guru.xlsx siap diisi. Silakan gunakan tombol Import Excel untuk menambahkan data massal.',
    });
  };

  const exportGuru = () => {
    const wb = XLSX.utils.book_new();
    const rows = teachers.map(t => ({
      'Nama Lengkap': t.name,
      'Jabatan': t.position,
      'Jenis Kelamin': t.gender === 'L' ? 'Laki-Laki' : 'Perempuan',
      'Guru Mapel': t.subject,
      'Pendidikan': t.education,
      'No. Telepon': t.phone,
      'Facebook': t.socialMedia?.facebook || '',
      'Instagram': t.socialMedia?.instagram || '',
      'YouTube': t.socialMedia?.youtube || '',
      'WhatsApp': t.socialMedia?.whatsapp || '',
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    ws['!cols'] = [
      { wch: 35 }, { wch: 18 }, { wch: 14 }, { wch: 22 },
      { wch: 28 }, { wch: 18 }, { wch: 30 }, { wch: 30 },
      { wch: 30 }, { wch: 18 }
    ];
    XLSX.utils.book_append_sheet(wb, ws, 'Data Guru');
    XLSX.writeFile(wb, `data-guru-${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const importGuru = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = new Uint8Array(ev.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows: any[] = XLSX.utils.sheet_to_json(ws);
        if (!rows.length) throw new Error('File Excel kosong atau tidak memiliki baris data.');
        let importedCount = 0;
        rows.forEach(r => {
          const name = (r['Nama Lengkap'] || r['Nama'] || r['name'] || '').toString().trim();
          if (!name) return;
          const genderRaw = (r['Jenis Kelamin'] || r['gender'] || '').toString().trim().toUpperCase();
          addTeacher({
            name,
            position: (r['Jabatan'] || r['position'] || '').toString().trim(),
            subject: (r['Guru Mapel'] || r['Mata Pelajaran'] || r['Mapel'] || r['subject'] || '').toString().trim(),
            education: (r['Pendidikan'] || r['Pendidikan Terakhir'] || r['education'] || '').toString().trim(),
            phone: (r['No. Telepon'] || r['No Telp'] || r['Telepon'] || r['phone'] || '').toString().trim(),
            gender: genderRaw.startsWith('P') ? 'P' as const : 'L' as const,
            photo: '',
            socialMedia: {
              facebook: (r['Facebook'] || r['socialMedia?.facebook'] || '').toString().trim() || undefined,
              instagram: (r['Instagram'] || r['socialMedia?.instagram'] || '').toString().trim() || undefined,
              youtube: (r['YouTube'] || r['socialMedia?.youtube'] || '').toString().trim() || undefined,
              whatsapp: (r['WhatsApp'] || r['socialMedia?.whatsapp'] || '').toString().trim() || undefined,
            },
          });
          importedCount++;
        });

        if (importedCount === 0) {
          throw new Error('Tidak ditemukan baris data guru yang valid dalam file Excel.');
        }

        setGuruSaved(true);
        notifySaved('Import Guru Berhasil!', `${importedCount} data guru berhasil diimpor dan disimpan ke database.`);
        setTimeout(() => setGuruSaved(false), 2000);
      } catch (err: any) {
        const errorMsg = err?.message || 'Format file Excel tidak valid.';
        setGuruError(errorMsg);
        addToast({
          type: 'error',
          title: 'Import Guru Gagal',
          message: errorMsg,
        });
        setTimeout(() => setGuruError(''), 4000);
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = '';
  };

  // Instagram handlers
  const openInstagramAdd = () => {
    setInstagramForm(emptyInstagramPost);
    setEditingInstagramId(null);
    setShowInstagramModal(true);
  };
  const openInstagramEdit = (post: InstagramPost) => {
    setInstagramForm({ postUrl: post.postUrl, caption: post.caption, thumbnail: post.thumbnail, likes: post.likes, date: post.date, isEmbed: post.isEmbed, embedCode: post.embedCode });
    setEditingInstagramId(post.id);
    setShowInstagramModal(true);
  };
  const saveInstagram = () => {
    if (!instagramForm.postUrl && !instagramForm.caption) return;
    if (editingInstagramId) updateInstagramPost(editingInstagramId, instagramForm);
    else addInstagramPost(instagramForm);
    setShowInstagramModal(false);
    notifySaved('Postingan Instagram Berhasil Disimpan!');
  };
  const moveInstagram = (idx: number, dir: 'up' | 'down') => {
    const arr = [...instagramSettings.posts];
    const s = dir === 'up' ? idx - 1 : idx + 1;
    if (s < 0 || s >= arr.length) return;
    [arr[idx], arr[s]] = [arr[s], arr[idx]];
    reorderInstagramPosts(arr);
  };
  const saveInstagramSettings = () => {
    updateInstagramSettings(instagramSettingsForm);
    setInstagramSettingsSaved(true);
    notifySaved('Pengaturan Instagram Berhasil Disimpan!');
    setTimeout(() => setInstagramSettingsSaved(false), 2000);
  };

  // Eskul Handlers
  const openEskulAdd = () => {
    setEditingEskulId(null);
    setEskulForm({
      ...emptyEskul,
      category: (eskulCategories && eskulCategories[0]) || 'Keagamaan',
    });
    setNewAchievementText('');
    setEskulError('');
    setShowEskulModal(true);
  };

  const openEskulEdit = (item: ExtracurricularItem) => {
    setEditingEskulId(item.id);
    setEskulForm({
      name: item.name,
      category: item.category,
      description: item.description,
      schedule: item.schedule,
      location: item.location,
      coach: item.coach,
      image: item.image,
      achievements: item.achievements ? [...item.achievements] : [],
      isActive: item.isActive,
      order: item.order ?? 0,
      galleryId: item.galleryId || '',
    });
    setNewAchievementText('');
    setEskulError('');
    setShowEskulModal(true);
  };

  const syncPhotoFromGallery = () => {
    if (!eskulForm.galleryId) {
      alert('Pilih album galeri terlebih dahulu untuk mensinkronkan foto.');
      return;
    }
    const linked = gallery.find(g => g.id === eskulForm.galleryId);
    if (!linked) {
      alert('Album galeri tidak ditemukan.');
      return;
    }
    const cover = linked.image || (linked.images && linked.images[0]);
    if (!cover) {
      alert(`Album "${linked.title}" belum memiliki foto untuk disinkronkan.`);
      return;
    }
    setEskulForm(prev => ({ ...prev, image: cover }));
  };

  const saveEskul = () => {
    if (!eskulForm.name.trim()) {
      setEskulError('Nama ekstrakurikuler wajib diisi.');
      return;
    }
    try {
      if (editingEskulId) {
        updateExtracurricular(editingEskulId, eskulForm);
      } else {
        addExtracurricular(eskulForm);
      }
      setShowEskulModal(false);
      setEditingEskulId(null);
      setEskulSaved(true);
      notifySaved('Data Ekstrakurikuler Berhasil Disimpan!');
      setTimeout(() => setEskulSaved(false), 2000);
    } catch {
      setEskulError('Gagal menyimpan data ekstrakurikuler.');
    }
  };

  const toggleEskulActive = (item: ExtracurricularItem) => {
    updateExtracurricular(item.id, { isActive: !item.isActive });
    setEskulSaved(true);
    setTimeout(() => setEskulSaved(false), 2000);
  };

  const addAchievement = () => {
    if (!newAchievementText.trim()) return;
    setEskulForm(prev => ({
      ...prev,
      achievements: [...(prev.achievements || []), newAchievementText.trim()],
    }));
    setNewAchievementText('');
  };

  const removeAchievement = (idx: number) => {
    setEskulForm(prev => ({
      ...prev,
      achievements: (prev.achievements || []).filter((_, i) => i !== idx),
    }));
  };

  const tabs = [
    { id: 'overview' as Tab, label: 'Overview', icon: LayoutDashboard },
    { id: 'news' as Tab, label: 'Berita', icon: Newspaper },
    { id: 'agenda' as Tab, label: 'Agenda', icon: Calendar },
    { id: 'gallery' as Tab, label: 'Galeri', icon: Camera },
    { id: 'slider' as Tab, label: 'Slider', icon: Sliders },
    { id: 'profile' as Tab, label: 'Profil', icon: FileText },
    { id: 'stats' as Tab, label: 'Statistik', icon: BarChart3 },
    { id: 'branding' as Tab, label: 'Identitas Sekolah', icon: GraduationCap },
    { id: 'downloads' as Tab, label: 'Dokumen Download', icon: Download },
    { id: 'seo' as Tab, label: 'SEO & Analitik', icon: Search },
    { id: 'instagram' as Tab, label: 'Instagram', icon: Instagram },
    { id: 'sponsors' as Tab, label: 'Sponsor/Mitra', icon: Link2 },
    { id: 'guru' as Tab, label: 'Data Guru', icon: Users },
    { id: 'eskul' as Tab, label: 'Ekstrakurikuler', icon: Trophy },
    { id: 'security' as Tab, label: 'Keamanan', icon: Shield },
    { id: 'contact' as Tab, label: 'Tombol SMPB', icon: Phone },
    { id: 'database' as Tab, label: 'Database', icon: Database },
  ];

  const tabGroups: { id: TabGroupId; label: string; description: string; tabs: typeof tabs }[] = [
    {
      id: 'ringkasan',
      label: 'Ringkasan',
      description: 'Overview dashboard',
      tabs: tabs.filter((tab) => ['overview'].includes(tab.id)),
    },
    {
      id: 'konten',
      label: 'Konten Utama',
      description: 'Kelola isi website',
      tabs: tabs.filter((tab) => ['news', 'agenda', 'gallery', 'slider', 'profile', 'downloads', 'guru', 'eskul'].includes(tab.id)),
    },
    {
      id: 'identitas',
      label: 'Identitas',
      description: 'Identitas, brand, dan statistik',
      tabs: tabs.filter((tab) => ['branding', 'stats', 'sponsors', 'instagram'].includes(tab.id)),
    },
    {
      id: 'promosi',
      label: 'Promosi',
      description: 'SEO dan tombol publik',
      tabs: tabs.filter((tab) => ['seo', 'contact'].includes(tab.id)),
    },
    {
      id: 'sistem',
      label: 'Sistem',
      description: 'Keamanan dan database',
      tabs: tabs.filter((tab) => ['security', 'database'].includes(tab.id)),
    },
  ];

  useEffect(() => {
    const currentGroup = tabGroups.find((group) => group.tabs.some((tab) => tab.id === activeTab));
    if (currentGroup && currentGroup.id !== activeTabGroup) {
      setActiveTabGroup(currentGroup.id);
    }
    if (currentGroup && collapsedGroups[currentGroup.id]) {
      setCollapsedGroups((prev) => ({ ...prev, [currentGroup.id]: false }));
    }
  }, [activeTab]);

  const toggleGroupCollapse = (groupId: TabGroupId) => {
    setCollapsedGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const activeGroupMeta = tabGroups.find((group) => group.id === activeTabGroup) ?? tabGroups[0];
  const activeTabMeta = tabs.find((tab) => tab.id === activeTab) ?? tabs[0];
  const activeThemePreset = SCHOOL_THEME_PRESETS.find((preset) => preset.id === identityForm.themePreset);

  const inputCls = "w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 bg-white";
  const labelCls = "block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-1.5";

  return (
    <div className="page-enter min-h-screen bg-slate-100">
      {/* Mobile Top Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2 sm:gap-3">
          <Link to="/" className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg lg:hidden">
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </Link>
          <Link to="/" className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg hidden lg:flex">
            <Home className="h-5 w-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-sm sm:text-lg font-bold text-gray-900">Dashboard Admin</h1>
            <p className="text-[10px] sm:text-xs text-gray-500 hidden sm:block">Kelola konten website {schoolIdentity.schoolName || 'sekolah'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/" className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-primary-600 hover:bg-primary-50 rounded-lg text-xs sm:text-sm font-medium">
            <Eye className="h-3.5 w-3.5" /> Lihat Situs
          </Link>
          <button onClick={handleLogout} className="flex items-center gap-1.5 px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg text-xs sm:text-sm font-medium transition-colors">
            <LogOut className="h-3.5 w-3.5" /><span className="hidden sm:inline">Keluar</span>
          </button>
        </div>
      </div>

      {/* Grouped Tabs (mobile) + Sidebar (desktop) */}
      <div className="lg:flex">
        {/* Mobile Tabs */}
        <div className="lg:hidden bg-white border-b border-gray-200 sticky top-[52px] z-20">
          <button
            onClick={() => setIsMobileAdminMenuOpen((prev) => !prev)}
            className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
          >
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-gray-500">{activeGroupMeta.label}</p>
              <p className="mt-1 text-xs font-semibold text-gray-800">{activeTabMeta.label}</p>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-semibold text-primary-600">
              <span>{isMobileAdminMenuOpen ? 'Tutup Menu' : 'Buka Menu'}</span>
              <ChevronLeft className={`h-4 w-4 shrink-0 transition-transform ${isMobileAdminMenuOpen ? '-rotate-90' : '-rotate-180'}`} />
            </div>
          </button>

          {isMobileAdminMenuOpen && (
            <div className="max-h-[calc(100vh-112px)] overflow-y-auto border-t border-gray-100 px-3 py-3 space-y-2">
              {tabGroups.map(group => {
                const isCollapsed = collapsedGroups[group.id];
                return (
                  <div key={group.id} className="rounded-2xl border border-gray-100 bg-gray-50/70">
                    <button
                      onClick={() => {
                        setActiveTabGroup(group.id);
                        toggleGroupCollapse(group.id);
                      }}
                      className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
                    >
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-500">{group.label}</p>
                        <p className="mt-1 text-[11px] text-gray-400">{group.description}</p>
                      </div>
                      <ChevronLeft className={`h-4 w-4 shrink-0 text-gray-400 transition-transform ${isCollapsed ? '-rotate-90' : '-rotate-180'}`} />
                    </button>
                    {!isCollapsed && (
                      <div className="grid grid-cols-2 gap-2 border-t border-gray-100 px-3 py-3">
                        {group.tabs.map(tab => (
                          <button
                            key={tab.id}
                            onClick={() => {
                              setActiveTabGroup(group.id);
                              setActiveTab(tab.id);
                              setIsMobileAdminMenuOpen(false);
                            }}
                            className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-medium transition-all ${
                              activeTab === tab.id ? 'bg-primary-500 text-white shadow-sm' : 'bg-white text-gray-600'
                            }`}
                          >
                            <tab.icon className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate text-left">{tab.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Desktop Sidebar */}
        <aside className="hidden lg:block sticky top-[52px] w-60 h-[calc(100vh-52px)] bg-white border-r border-gray-200 overflow-y-auto shrink-0">
          <nav className="p-3 space-y-4">
            {tabGroups.map(group => (
              <div key={group.id}>
                <button
                  onClick={() => {
                    setActiveTabGroup(group.id);
                    toggleGroupCollapse(group.id);
                  }}
                  className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left hover:bg-gray-50"
                >
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-400">{group.label}</p>
                    <p className="mt-1 text-[11px] text-gray-500">{group.description}</p>
                  </div>
                  <ChevronLeft className={`h-4 w-4 shrink-0 text-gray-400 transition-transform ${collapsedGroups[group.id] ? '-rotate-90' : '-rotate-180'}`} />
                </button>
                {!collapsedGroups[group.id] && (
                  <div className="mt-2 space-y-1">
                    {group.tabs.map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setActiveTabGroup(group.id);
                          setActiveTab(tab.id);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                          activeTab === tab.id ? 'bg-primary-50 text-primary-700 shadow-sm' : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <tab.icon className="h-5 w-5" />
                        {tab.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
          <div className="p-3 border-t border-gray-100 mt-2">
            <div className="bg-primary-50 rounded-xl p-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                  <GraduationCap className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-xs font-bold text-primary-900">Admin</p>
                  <p className="text-[10px] text-primary-500">Administrator</p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-3 sm:p-4 lg:p-6 min-h-[calc(100vh-52px)] max-w-full overflow-x-hidden">
          {/* ======= OVERVIEW ======= */}
          {activeTab === 'overview' && (
            <div className="animate-fadeIn">
              <h2 className="text-lg sm:text-2xl font-extrabold text-gray-900 mb-4 sm:mb-6">Overview</h2>
              {overviewSetupSummary.hasSetupWarning && (
                <div className={`mb-4 sm:mb-6 rounded-2xl border p-4 sm:p-5 ${
                  overviewSetupSummary.isFreshInstall
                    ? 'border-amber-200 bg-amber-50'
                    : 'border-blue-200 bg-blue-50'
                }`}>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
                        <AlertTriangle className={`h-4 w-4 ${
                          overviewSetupSummary.isFreshInstall ? 'text-amber-600' : 'text-blue-600'
                        }`} />
                        {overviewSetupSummary.isFreshInstall ? 'Website masih tahap setup awal' : 'Masih ada section yang belum terisi'}
                      </div>
                      <p className="mt-1 text-xs sm:text-sm text-gray-700 leading-relaxed">
                        {overviewSetupSummary.isFreshInstall
                          ? 'Database terlihat masih kosong. Buka tab Database untuk sinkronisasi key settings dan isi data dummy awal bila diperlukan.'
                          : 'Sebagian konten utama website masih kosong. Anda bisa melengkapinya manual atau gunakan pengisian data dummy untuk section yang belum terisi.'}
                      </p>
                      <p className="mt-2 text-xs text-gray-600">
                        Section kosong: {overviewSetupSummary.pendingItems.map((item) => item.label).join(', ')}.
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab('database')}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary-500 text-white text-xs sm:text-sm font-semibold hover:bg-primary-600"
                    >
                      <Database className="h-4 w-4" />
                      Buka Pengaturan Database
                    </button>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6 sm:mb-8">
                {[
                  { icon: Newspaper, label: 'Berita', value: news.length, color: 'from-primary-400 to-primary-600', bg: 'bg-primary-50' },
                  { icon: Calendar, label: 'Agenda', value: agenda.length, color: 'from-green-400 to-green-600', bg: 'bg-green-50' },
                  { icon: Camera, label: 'Galeri', value: gallery.length, color: 'from-accent-400 to-accent-600', bg: 'bg-amber-50' },
                  { icon: Trophy, label: 'Ekstrakurikuler', value: extracurricular.length, color: 'from-amber-400 to-amber-600', bg: 'bg-amber-50' },
                  { icon: Eye, label: 'Total Views', value: analyticsData.totalPageViews, color: 'from-purple-400 to-purple-600', bg: 'bg-purple-50' },
                ].map(stat => (
                  <div key={stat.label} className={`${stat.bg} rounded-xl sm:rounded-2xl p-3 sm:p-5 border border-gray-100`}>
                    <div className="flex items-center justify-between mb-2 sm:mb-3">
                      <div className={`w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br ${stat.color} rounded-lg sm:rounded-xl flex items-center justify-center shadow-sm`}>
                        <stat.icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                      </div>
                      <TrendingUp className="h-3.5 w-3.5 text-green-500" />
                    </div>
                    <div className="text-xl sm:text-2xl font-extrabold text-gray-900">{stat.value}</div>
                    <div className="text-[11px] sm:text-xs text-gray-500">{stat.label}</div>
                  </div>
                ))}
              </div>
              <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
                <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <h3 className="font-bold text-gray-900 text-sm sm:text-base">Berita Terbaru</h3>
                    <button onClick={() => setActiveTab('news')} className="text-primary-500 text-xs sm:text-sm font-medium">Lihat Semua</button>
                  </div>
                  <div className="space-y-2 sm:space-y-3">
                    {news.slice(0, 4).map(item => (
                      <div key={item.id} className="flex items-start gap-2 sm:gap-3 pb-2 sm:pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                        <span className={`shrink-0 px-1.5 sm:px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-semibold ${CATEGORY_COLORS[item.category] || 'bg-gray-100 text-gray-700'}`}>{item.category}</span>
                        <div className="min-w-0"><p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{item.title}</p><p className="text-[10px] sm:text-xs text-gray-400">{item.date}</p></div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <h3 className="font-bold text-gray-900 text-sm sm:text-base">Agenda Mendatang</h3>
                    <button onClick={() => setActiveTab('agenda')} className="text-primary-500 text-xs sm:text-sm font-medium">Lihat Semua</button>
                  </div>
                  <div className="space-y-2 sm:space-y-3">
                    {agenda.slice(0, 4).map(item => (
                      <div key={item.id} className="flex items-start gap-2 sm:gap-3 pb-2 sm:pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                        <span className={`shrink-0 px-1.5 sm:px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-semibold ${CATEGORY_COLORS[item.type] || 'bg-gray-100 text-gray-700'}`}>{item.type}</span>
                        <div className="min-w-0"><p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{item.title}</p><p className="text-[10px] sm:text-xs text-gray-400">{item.date}</p></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======= NEWS ======= */}
          {activeTab === 'news' && (
            <div className="animate-fadeIn">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-2xl font-extrabold text-gray-900">Kelola Berita</h2>
                <button onClick={openNewsAdd} className="flex items-center gap-1.5 bg-primary-500 hover:bg-primary-600 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold shadow-md">
                  <Plus className="h-4 w-4" /> <span className="hidden sm:inline">Tambah</span> Berita
                </button>
              </div>
              {news.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 sm:p-12 text-center border border-gray-100 shadow-sm">
                  <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-3 text-primary-600">
                    <Newspaper className="h-7 w-7" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-1">Belum Ada Berita</h3>
                  <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto mb-4">
                    Belum ada artikel atau publikasi berita yang terdaftar. Tambahkan berita pertama madrasah sekarang.
                  </p>
                  <button onClick={openNewsAdd} className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md transition-all">
                    <Plus className="h-4 w-4" /> Tambah Berita Baru
                  </button>
                </div>
              ) : (
                <div className="space-y-2 sm:space-y-0 sm:bg-white sm:rounded-2xl sm:shadow-sm sm:border sm:border-gray-100 sm:overflow-hidden">
                  <div className="hidden sm:grid sm:grid-cols-12 bg-gray-50 text-gray-600 text-xs font-semibold px-4 py-3">
                    <div className="col-span-5">Judul</div>
                    <div className="col-span-2">Kategori</div>
                    <div className="col-span-3">Tanggal</div>
                    <div className="col-span-2 text-right">Aksi</div>
                  </div>
                  {news.map(item => (
                    <div key={item.id} className="bg-white rounded-xl sm:rounded-none border border-gray-100 sm:border-0 sm:border-b sm:border-gray-50 p-3 sm:px-4 sm:py-3 sm:grid sm:grid-cols-12 sm:items-center sm:hover:bg-gray-50 transition-colors">
                      <div className="sm:col-span-5 mb-1 sm:mb-0">
                        <p className="text-sm font-semibold text-gray-900 line-clamp-1">{item.title}</p>
                        <p className="text-[11px] text-gray-400 sm:hidden mt-0.5">{item.date}</p>
                      </div>
                      <div className="sm:col-span-2 mb-2 sm:mb-0">
                        <span className={`px-2 py-0.5 rounded text-[10px] sm:text-xs font-semibold ${CATEGORY_COLORS[item.category] || 'bg-gray-100 text-gray-700'}`}>{item.category}</span>
                      </div>
                      <div className="hidden sm:block sm:col-span-3 text-sm text-gray-500">{item.date}</div>
                      <div className="sm:col-span-2 flex gap-1.5 sm:justify-end">
                        <button onClick={() => openNewsEdit(item)} className="flex items-center gap-1 px-2.5 py-1.5 bg-primary-50 text-primary-600 rounded-lg text-xs font-medium hover:bg-primary-100"><Edit className="h-3.5 w-3.5" /><span className="sm:hidden">Edit</span></button>
                        <button onClick={() => setDeleteConfirm({ type: 'news', id: item.id })} className="flex items-center gap-1 px-2.5 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100"><Trash2 className="h-3.5 w-3.5" /><span className="sm:hidden">Hapus</span></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ======= AGENDA ======= */}
          {activeTab === 'agenda' && (
            <div className="animate-fadeIn">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-2xl font-extrabold text-gray-900">Kelola Agenda</h2>
                <button onClick={openAgendaAdd} className="flex items-center gap-1.5 bg-primary-500 hover:bg-primary-600 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold shadow-md">
                  <Plus className="h-4 w-4" /> <span className="hidden sm:inline">Tambah</span> Agenda
                </button>
              </div>
              {agenda.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 sm:p-12 text-center border border-gray-100 shadow-sm">
                  <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-3 text-primary-600">
                    <Calendar className="h-7 w-7" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-1">Belum Ada Agenda</h3>
                  <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto mb-4">
                    Belum ada agenda kegiatan atau kalender akademik yang ditambahkan. Tambahkan agenda kegiatan madrasah di sini.
                  </p>
                  <button onClick={openAgendaAdd} className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md transition-all">
                    <Plus className="h-4 w-4" /> Tambah Agenda Baru
                  </button>
                </div>
              ) : (
                <div className="space-y-2 sm:space-y-0 sm:bg-white sm:rounded-2xl sm:shadow-sm sm:border sm:border-gray-100 sm:overflow-hidden">
                  <div className="hidden sm:grid sm:grid-cols-12 bg-gray-50 text-gray-600 text-xs font-semibold px-4 py-3">
                    <div className="col-span-4">Kegiatan</div>
                    <div className="col-span-2">Tipe</div>
                    <div className="col-span-2">Tanggal</div>
                    <div className="col-span-2">Lokasi</div>
                    <div className="col-span-2 text-right">Aksi</div>
                  </div>
                  {agenda.map(item => (
                    <div key={item.id} className="bg-white rounded-xl sm:rounded-none border border-gray-100 sm:border-0 sm:border-b sm:border-gray-50 p-3 sm:px-4 sm:py-3 sm:grid sm:grid-cols-12 sm:items-center sm:hover:bg-gray-50 transition-colors">
                      <div className="sm:col-span-4 mb-1 sm:mb-0">
                        <p className="text-sm font-semibold text-gray-900 line-clamp-1">{item.title}</p>
                        <p className="text-[11px] text-gray-400 sm:hidden mt-0.5">{item.date} · {item.location}</p>
                      </div>
                      <div className="sm:col-span-2 mb-2 sm:mb-0">
                        <span className={`px-2 py-0.5 rounded text-[10px] sm:text-xs font-semibold ${CATEGORY_COLORS[item.type] || 'bg-gray-100 text-gray-700'}`}>{item.type}</span>
                      </div>
                      <div className="hidden sm:block sm:col-span-2 text-sm text-gray-500">{item.date}</div>
                      <div className="hidden sm:block sm:col-span-2 text-sm text-gray-500 truncate">{item.location}</div>
                      <div className="sm:col-span-2 flex gap-1.5 sm:justify-end">
                        <button onClick={() => openAgendaEdit(item)} className="flex items-center gap-1 px-2.5 py-1.5 bg-primary-50 text-primary-600 rounded-lg text-xs font-medium hover:bg-primary-100"><Edit className="h-3.5 w-3.5" /><span className="sm:hidden">Edit</span></button>
                        <button onClick={() => setDeleteConfirm({ type: 'agenda', id: item.id })} className="flex items-center gap-1 px-2.5 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100"><Trash2 className="h-3.5 w-3.5" /><span className="sm:hidden">Hapus</span></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ======= GALLERY ======= */}
          {activeTab === 'gallery' && (
            <div className="animate-fadeIn">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div>
                  <h2 className="text-lg sm:text-2xl font-extrabold text-gray-900">Kelola Galeri</h2>
                  <p className="text-xs sm:text-sm text-gray-500">{gallery.length} item dokumentasi terdaftar</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowGalCatModal(true)}
                    className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors border border-gray-200"
                  >
                    <Tag className="h-4 w-4 text-gray-500" />
                    <span className="hidden sm:inline">Kelola</span> Kategori
                  </button>
                  <button onClick={openGalleryAdd} className="flex items-center gap-1.5 bg-primary-500 hover:bg-primary-600 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold shadow-md">
                    <Plus className="h-4 w-4" /> <span className="hidden sm:inline">Tambah</span> Media
                  </button>
                </div>
              </div>
              {gallery.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 sm:p-12 text-center border border-gray-100 shadow-sm">
                  <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-3 text-primary-600">
                    <Camera className="h-7 w-7" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-1">Belum Ada Media Galeri</h3>
                  <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto mb-4">
                    Belum ada album foto atau video kegiatan yang diunggah. Tambahkan album foto atau video YouTube.
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <button onClick={openGalleryAdd} className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md transition-all">
                      <Plus className="h-4 w-4" /> Tambah Media
                    </button>
                    <button onClick={() => setShowGalCatModal(true)} className="inline-flex items-center gap-1.5 px-3 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs sm:text-sm font-semibold border border-gray-200">
                      <Tag className="h-4 w-4 text-gray-500" /> Kelola Kategori
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
                  {gallery.map(item => {
                    const pCount = (item.images && item.images.length > 0) ? item.images.length : (item.image ? 1 : 0);
                    return (
                      <div key={item.id} className="bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-sm border border-gray-100 group">
                        <div className="aspect-video bg-gray-100 relative">
                          {item.mediaType === 'video' && item.youtubeUrl ? (
                            <img src={getYoutubeThumbnail(item.youtubeUrl)} alt="" className="w-full h-full object-cover" />
                          ) : item.image ? (
                            <img src={item.image} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-50">
                              {item.mediaType === 'video' ? <Youtube className="h-8 w-8 text-gray-300" /> : <Camera className="h-8 w-8 text-gray-300" />}
                            </div>
                          )}
                          {item.mediaType !== 'video' && pCount > 1 && (
                            <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md text-white px-2 py-0.5 rounded-md text-[10px] font-semibold flex items-center gap-1 z-10">
                              <Images className="h-3 w-3" />
                              <span>{pCount} Foto</span>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100">
                            <button onClick={() => openGalleryEdit(item)} className="p-2 bg-white rounded-lg shadow-md"><Edit className="h-4 w-4 text-primary-600" /></button>
                            <button onClick={() => setDeleteConfirm({ type: 'gallery', id: item.id })} className="p-2 bg-white rounded-lg shadow-md"><Trash2 className="h-4 w-4 text-red-600" /></button>
                          </div>
                        </div>
                        <div className="p-2 sm:p-3">
                          <p className="text-xs sm:text-sm font-semibold text-gray-900 truncate">{item.title}</p>
                          <p className="text-[10px] text-gray-400">{item.category}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ======= SLIDER ======= */}
          {activeTab === 'slider' && (
            <div className="animate-fadeIn">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg sm:text-2xl font-extrabold text-gray-900">Kelola Slider Hero</h2>
                  {sliderSaved && (
                    <span className="flex items-center gap-1 text-green-600 text-xs sm:text-sm font-semibold animate-fadeIn">
                      <CheckCircle className="h-4 w-4" /> Tersimpan!
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('Kembalikan slider ke 3 slide bawaan default madrasah?')) {
                        reorderSlider([...initialSliderItems]);
                        triggerSliderSaved();
                      }
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors"
                    title="Kembalikan 3 slide default madrasah"
                  >
                    <RotateCcw className="h-4 w-4" /> <span className="hidden sm:inline">Reset</span> Default
                  </button>
                  <button onClick={openSliderAdd} className="flex items-center gap-1.5 bg-primary-500 hover:bg-primary-600 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold shadow-md">
                    <Plus className="h-4 w-4" /> <span className="hidden sm:inline">Tambah</span> Slide
                  </button>
                </div>
              </div>
              {sliderItems.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 sm:p-12 text-center border border-gray-100 shadow-sm">
                  <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-3 text-primary-600">
                    <Sliders className="h-7 w-7" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-1">Belum Ada Slide Banner</h3>
                  <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto mb-4">
                    Slider banner hero beranda masih kosong. Anda dapat menambahkan slide baru atau memuat 3 slide default madrasah.
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <button onClick={openSliderAdd} className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md transition-all">
                      <Plus className="h-4 w-4" /> Tambah Slide
                    </button>
                    <button
                      onClick={() => {
                        reorderSlider([...initialSliderItems]);
                        triggerSliderSaved();
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs sm:text-sm font-semibold border border-gray-200"
                    >
                      <RotateCcw className="h-4 w-4 text-gray-500" /> Muat Slide Default
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 sm:space-y-3">
                  {sliderItems.map((item, idx) => (
                    <div key={item.id} className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-sm border border-gray-100 flex items-center gap-2 sm:gap-4">
                      <div className="flex flex-col gap-1 shrink-0">
                        <button onClick={() => moveSlider(idx, 'up')} disabled={idx === 0} className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"><ArrowUp className="h-4 w-4 text-gray-400" /></button>
                        <button onClick={() => moveSlider(idx, 'down')} disabled={idx === sliderItems.length - 1} className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"><ArrowDown className="h-4 w-4 text-gray-400" /></button>
                      </div>
                      <div className="w-16 h-10 sm:w-24 sm:h-14 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                        {item.image ? (
                          <img src={item.image} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full" style={{ background: `linear-gradient(135deg, ${item.backgroundColor || '#0f766e'}, var(--school-secondary))` }} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-gray-900 truncate">{item.title}</p>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-primary-50 text-primary-700 border border-primary-100">
                            Overlay {item.overlayOpacity !== undefined ? `${item.overlayOpacity}%` : (item.showText === false ? '0%' : '70%')}
                          </span>
                          {item.showText === false ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                              <Image className="h-3 w-3" /> Hanya Gambar
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                              <Type className="h-3 w-3" /> Gambar & Teks
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-gray-400 truncate">
                          {item.showText === false ? '(Teks disembunyikan di tampilan website)' : item.subtitle}
                        </p>
                      </div>
                      <div className="flex gap-1.5 shrink-0">
                        <button onClick={() => openSliderEdit(item)} aria-label={`Edit slide ${item.title}`} title="Edit Slide" className="p-2 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100"><Edit className="h-4 w-4" /></button>
                        <button onClick={() => setDeleteConfirm({ type: 'slider', id: item.id })} aria-label={`Hapus slide ${item.title}`} title="Hapus Slide" className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ======= PROFILE ======= */}
          {activeTab === 'profile' && (
            <div className="animate-fadeIn space-y-4 sm:space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg sm:text-2xl font-extrabold text-gray-900">Kelola Profil</h2>
                {profileSaved && <span className="flex items-center gap-1 text-green-600 text-xs sm:text-sm font-semibold animate-fadeIn"><CheckCircle className="h-4 w-4" /> Tersimpan!</span>}
              </div>
              <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 space-y-3 sm:space-y-4">
                <h3 className="text-sm sm:text-base font-bold text-gray-900">Tentang Sekolah</h3>
                <RichTextEditor value={profileForm.about} onChange={v => setProfileForm({ ...profileForm, about: v })} placeholder="Tentang sekolah..." />
              </div>
              <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 space-y-3 sm:space-y-4">
                <h3 className="text-sm sm:text-base font-bold text-gray-900">Kepala Sekolah</h3>
                <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                  <div><label className={labelCls}>Nama</label><input type="text" value={profileForm.namaKepsek} onChange={e => setProfileForm({ ...profileForm, namaKepsek: e.target.value })} className={inputCls} /></div>
                  <div><label className={labelCls}>Jabatan</label><input type="text" value={profileForm.jabatanKepsek} onChange={e => setProfileForm({ ...profileForm, jabatanKepsek: e.target.value })} className={inputCls} /></div>
                </div>
                <div>
                  <label className={labelCls}>Foto Kepala Sekolah</label>
                  <p className="text-xs text-gray-400 mb-2">Foto akan ditampilkan besar di halaman Home (sambutan) dan Profil. Gunakan foto formal ukuran portrait (rasio 3:4). Maks 2MB.</p>
                  <div className="flex flex-col sm:flex-row items-start gap-4">
                    {profileForm.fotoKepsek ? (
                      <div className="flex flex-col items-center gap-2 shrink-0">
                        <div className="relative group shrink-0">
                          <img src={profileForm.fotoKepsek} alt="" className="w-28 h-36 sm:w-36 sm:h-48 rounded-xl sm:rounded-2xl object-cover shadow-md border-2 border-gray-100" />
                          <button onClick={() => setProfileForm({ ...profileForm, fotoKepsek: '' })} className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-md transition-colors">
                            <X className="h-3.5 w-3.5" />
                          </button>
                          <div className="absolute bottom-2 left-2 right-2 bg-black/60 backdrop-blur-sm rounded-lg px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <p className="text-[10px] text-white text-center">Klik × untuk ganti</p>
                          </div>
                        </div>
                        <ImageStorageBadge url={profileForm.fotoKepsek} />
                      </div>
                    ) : (
                      <label className="cursor-pointer flex flex-col items-center justify-center gap-2 w-28 h-36 sm:w-36 sm:h-48 border-2 border-dashed border-primary-300 bg-primary-50/50 rounded-xl sm:rounded-2xl text-primary-400 hover:border-primary-400 hover:bg-primary-50 transition-colors">
                        <ImagePlus className="h-7 w-7 sm:h-8 sm:w-8" />
                        <span className="text-xs font-medium text-center px-2">Upload Foto Kepsek</span>
                        <input type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(e, setProfileForm, 'fotoKepsek')} />
                      </label>
                    )}
                    <div className="flex-1 bg-gray-50 rounded-xl p-3 border border-gray-100">
                      <p className="text-xs font-semibold text-gray-700 mb-1.5">📌 Panduan foto:</p>
                      <ul className="text-[11px] text-gray-500 space-y-1">
                        <li>• Gunakan foto formal (pakaian dinas / jas)</li>
                        <li>• Orientasi portrait (tegak), rasio 3:4</li>
                        <li>• Background polos atau setting ruangan</li>
                        <li>• Resolusi minimal 400×500 piksel</li>
                        <li>• Format: JPG, PNG (maks 2MB)</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div><label className={labelCls}>Sambutan</label><RichTextEditor value={profileForm.sambutanKepsek} onChange={v => setProfileForm({ ...profileForm, sambutanKepsek: v })} placeholder="Sambutan kepala sekolah..." /></div>
              </div>
              <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 space-y-3 sm:space-y-4">
                <h3 className="text-sm sm:text-base font-bold text-gray-900">Visi & Misi</h3>
                <div><label className={labelCls}>Visi</label><textarea rows={2} value={profileForm.visi} onChange={e => setProfileForm({ ...profileForm, visi: e.target.value })} className={inputCls + ' resize-none'} /></div>
                <div>
                  <label className={labelCls}>Misi</label>
                  <div className="space-y-1.5 mb-2">
                    {profileForm.misi.map((m, i) => (
                      <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                        <span className="text-xs text-gray-400 font-bold">{i + 1}.</span>
                        <span className="flex-1 text-sm text-gray-700">{m}</span>
                        <button onClick={() => removeMisi(i)} className="text-red-400 hover:text-red-600"><X className="h-4 w-4" /></button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input type="text" value={misiInput} onChange={e => setMisiInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addMisi()} className={inputCls} placeholder="Tambah misi baru..." />
                    <button onClick={addMisi} className="px-4 py-2.5 bg-primary-500 text-white rounded-xl text-sm font-semibold shrink-0"><Plus className="h-4 w-4" /></button>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 space-y-3 sm:space-y-4">
                <h3 className="text-sm sm:text-base font-bold text-gray-900">Fasilitas</h3>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {profileForm.facilities.map((f, i) => (
                    <span key={i} className="inline-flex items-center gap-1 bg-primary-50 text-primary-700 px-2.5 py-1 rounded-lg text-xs font-medium">
                      {f} <button onClick={() => removeFacility(i)} className="text-primary-400 hover:text-red-500"><X className="h-3 w-3" /></button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input type="text" value={facilityInput} onChange={e => setFacilityInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addFacility()} className={inputCls} placeholder="Tambah fasilitas..." />
                  <button onClick={addFacility} className="px-4 py-2.5 bg-primary-500 text-white rounded-xl text-sm font-semibold shrink-0"><Plus className="h-4 w-4" /></button>
                </div>
              </div>
              <button onClick={saveProfile} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-xl text-sm font-semibold hover:bg-primary-600 shadow-lg">
                <Save className="h-4 w-4" /> Simpan Profil
              </button>
            </div>
          )}

          {/* ======= STATS ======= */}
          {activeTab === 'stats' && (
            <div className="animate-fadeIn space-y-4 sm:space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg sm:text-2xl font-extrabold text-gray-900">Kelola Statistik</h2>
                {statsSaved && <span className="flex items-center gap-1 text-green-600 text-xs sm:text-sm font-semibold animate-fadeIn"><CheckCircle className="h-4 w-4" /> Tersimpan!</span>}
              </div>
              <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
                <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-4">Preview</h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {[
                    { icon: Users, label: 'Siswa Aktif', value: statsForm.siswaAktif, color: 'from-primary-400 to-primary-600' },
                    { icon: BookOpen, label: 'Tenaga Pendidik', value: statsForm.tenagaPendidik, color: 'from-green-400 to-green-600' },
                    { icon: Award, label: 'Prestasi', value: statsForm.prestasi, color: 'from-accent-400 to-accent-600' },
                    { icon: Star, label: 'Akreditasi', value: statsForm.akreditasi, color: 'from-purple-400 to-purple-600' },
                  ].map(s => (
                    <div key={s.label} className="bg-gray-50 rounded-xl p-3 sm:p-4 border border-gray-100">
                      <div className={`w-8 h-8 bg-gradient-to-br ${s.color} rounded-lg flex items-center justify-center mb-2 shadow-sm`}>
                        <s.icon className="h-4 w-4 text-white" />
                      </div>
                      <div className="text-lg sm:text-xl font-extrabold text-gray-900">{s.value || '-'}</div>
                      <div className="text-[10px] sm:text-xs text-gray-500">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 space-y-3 sm:space-y-4">
                <h3 className="text-sm sm:text-base font-bold text-gray-900">Edit Statistik</h3>
                <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                  <div><label className={labelCls}><Users className="inline h-3.5 w-3.5 mr-1" />Siswa Aktif</label><input type="text" value={statsForm.siswaAktif} onChange={e => setStatsForm({ ...statsForm, siswaAktif: e.target.value })} className={inputCls} /><p className="text-[10px] text-gray-400 mt-1">Format: 720+, 800, 1.200</p></div>
                  <div><label className={labelCls}><BookOpen className="inline h-3.5 w-3.5 mr-1" />Tenaga Pendidik</label><input type="text" value={statsForm.tenagaPendidik} onChange={e => setStatsForm({ ...statsForm, tenagaPendidik: e.target.value })} className={inputCls} /></div>
                  <div><label className={labelCls}><Award className="inline h-3.5 w-3.5 mr-1" />Prestasi</label><input type="text" value={statsForm.prestasi} onChange={e => setStatsForm({ ...statsForm, prestasi: e.target.value })} className={inputCls} /></div>
                  <div><label className={labelCls}><Star className="inline h-3.5 w-3.5 mr-1" />Akreditasi</label><input type="text" value={statsForm.akreditasi} onChange={e => setStatsForm({ ...statsForm, akreditasi: e.target.value })} className={inputCls} /></div>
                </div>
              </div>
              <button onClick={saveStats} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-xl text-sm font-semibold hover:bg-primary-600 shadow-lg">
                <Save className="h-4 w-4" /> Simpan Statistik
              </button>
            </div>
          )}

          {/* ======= BRANDING ======= */}
          {activeTab === 'branding' && (
            <div className="animate-fadeIn space-y-4 sm:space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg sm:text-2xl font-extrabold text-gray-900">Identitas Sekolah Terpusat</h2>
                  <p className="mt-1 text-xs sm:text-sm text-gray-500">Satu titik kontrol untuk header, footer, tema dasar, dan informasi legal website.</p>
                </div>
                {identitySaved && <span className="flex items-center gap-1 text-green-600 text-xs sm:text-sm font-semibold animate-fadeIn"><CheckCircle className="h-4 w-4" /> Tersimpan!</span>}
              </div>
              <div className="grid gap-4 lg:grid-cols-[330px_minmax(0,1fr)]">
                <div className="space-y-4">
                  <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-gray-900">Status Konfigurasi</p>
                      <span className="rounded-full bg-primary-50 px-3 py-1 text-[11px] font-semibold text-primary-700">
                        v{identityForm.schemaVersion}.{identityForm.revision}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">Konfigurasi ini tersimpan di database `school_identity` dan menjadi sumber utama header serta footer.</p>
                    <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                      <div className="rounded-xl bg-gray-50 p-3">
                        <p className="text-gray-400">Schema</p>
                        <p className="mt-1 font-semibold text-gray-800">{identityForm.schemaVersion}</p>
                      </div>
                      <div className="rounded-xl bg-gray-50 p-3">
                        <p className="text-gray-400">Revisi</p>
                        <p className="mt-1 font-semibold text-gray-800">{identityForm.revision}</p>
                      </div>
                    </div>
                    <p className="mt-3 text-[11px] text-gray-400">Update terakhir: {new Date(identityForm.updatedAt || Date.now()).toLocaleString('id-ID')}</p>
                    <p className="mt-2 text-[11px] text-gray-500">
                      Preset tema: <span className="font-semibold text-gray-700">{activeThemePreset?.label || 'Custom'}</span>
                    </p>
                  </div>

                  <div className="rounded-2xl border border-dashed border-primary-200 bg-white p-4 shadow-sm">
                    <p className="text-sm font-bold text-gray-900 mb-3">Preview Header</p>
                    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-gray-50">
                      <div style={{ background: `linear-gradient(90deg, ${identityForm.primaryColor}, ${identityForm.secondaryColor}, ${identityForm.accentColor})` }} className="h-1" />
                      <div className="flex items-center gap-3 p-4">
                        <div
                          className="flex h-16 w-16 items-center justify-center rounded-2xl text-white shadow-md overflow-hidden"
                          style={{ background: `linear-gradient(135deg, ${identityForm.primaryColor}, ${identityForm.secondaryColor})` }}
                        >
                          {identityForm.showLogo && identityForm.schoolLogo ? (
                            <img src={identityForm.schoolLogo} alt="Logo sekolah" className="h-full w-full object-contain bg-white p-1.5" />
                          ) : (
                            <GraduationCap className="h-8 w-8" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-base font-bold text-gray-900">{identityForm.schoolShortName || identityForm.schoolName}</p>
                          <p className="truncate text-xs font-medium" style={{ color: identityForm.primaryColor }}>{identityForm.schoolTagline}</p>
                        </div>
                      </div>
                    </div>
                    <p className="mt-3 text-sm font-bold text-gray-900">Preview Footer</p>
                    <div className="mt-3 rounded-2xl p-4 text-white" style={{ backgroundColor: identityForm.footerBackgroundColor }}>
                      <p className="text-sm font-semibold">{identityForm.schoolShortName || identityForm.schoolName}</p>
                      <p className="mt-1 text-xs text-white/80">{identityForm.footerDescription}</p>
                      <div className="mt-4 flex items-center justify-between gap-2 text-[11px] text-white/70">
                        <span>{identityForm.showCurrentYear ? `© ${new Date().getFullYear()} ` : ''}{identityForm.legalName || identityForm.schoolName}</span>
                        <span>{identityForm.legalNotice || 'Informasi legal footer'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-6 shadow-sm">
                    <h3 className="text-sm sm:text-base font-bold text-gray-900">Identitas Utama</h3>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className={labelCls}>Nama Sekolah</label>
                        <input type="text" value={identityForm.schoolName} onChange={(e) => setIdentityForm({ ...identityForm, schoolName: e.target.value })} className={inputCls} placeholder="Contoh: SMA Negeri 1 / MA Teladan" />
                      </div>
                      <div>
                        <label className={labelCls}>Nama Singkat Header</label>
                        <input type="text" value={identityForm.schoolShortName} onChange={(e) => setIdentityForm({ ...identityForm, schoolShortName: e.target.value })} className={inputCls} placeholder="Contoh: SMAN 1 / MA Teladan" />
                      </div>
                      <div>
                        <label className={labelCls}>Tagline Header</label>
                        <input type="text" value={identityForm.schoolTagline} onChange={(e) => setIdentityForm({ ...identityForm, schoolTagline: e.target.value })} className={inputCls} placeholder="Contoh: Unggul, Berkarakter, Berprestasi" />
                      </div>
                      <div>
                        <label className={labelCls}>Nama Legal Footer</label>
                        <input type="text" value={identityForm.legalName} onChange={(e) => setIdentityForm({ ...identityForm, legalName: e.target.value })} className={inputCls} placeholder="Contoh: Yayasan Pendidikan / Lembaga" />
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className={labelCls}>Deskripsi Footer</label>
                      <textarea rows={3} value={identityForm.footerDescription} onChange={(e) => setIdentityForm({ ...identityForm, footerDescription: e.target.value })} className={inputCls + ' resize-none'} placeholder="Deskripsi singkat sekolah untuk footer." />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-6 shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h3 className="text-sm sm:text-base font-bold text-gray-900">Logo Sekolah</h3>
                        <p className="mt-1 text-xs text-gray-500">Dipakai di navbar, footer, dan bagian identitas halaman publik.</p>
                      </div>
                      <button
                        onClick={() => setIdentityForm({ ...identityForm, showLogo: !identityForm.showLogo })}
                        className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold ${identityForm.showLogo ? 'bg-primary-500 text-white' : 'border border-gray-200 bg-white text-gray-600'}`}
                      >
                        {identityForm.showLogo ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                        {identityForm.showLogo ? 'Aktif' : 'Nonaktif'}
                      </button>
                    </div>
                    <div className="mt-4">
                      {identityForm.schoolLogo ? (
                        <div className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-4 sm:flex-row sm:items-center">
                          <img src={identityForm.schoolLogo} alt="Logo sekolah" className="h-20 w-20 rounded-2xl border border-gray-200 bg-white p-2 object-contain" />
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-900">Logo siap digunakan</p>
                            <p className="text-xs text-gray-500">Format PNG transparan atau JPG persegi, maksimal 2MB.</p>
                            <div className="mt-1.5">
                              <ImageStorageBadge url={identityForm.schoolLogo} />
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <label className="cursor-pointer rounded-xl border border-primary-200 bg-white px-4 py-2 text-xs font-semibold text-primary-600 hover:bg-primary-50">
                              Ganti
                              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, setIdentityForm, 'schoolLogo')} />
                            </label>
                            <button onClick={() => setIdentityForm({ ...identityForm, schoolLogo: '' })} className="rounded-xl border border-red-200 bg-white px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50">
                              Hapus
                            </button>
                          </div>
                        </div>
                      ) : (
                        <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-primary-300 bg-primary-50/50 px-6 py-10 text-center text-primary-500 hover:bg-primary-50">
                          <Upload className="h-8 w-8" />
                          <span className="text-sm font-semibold">Upload logo sekolah</span>
                          <span className="text-xs text-primary-400">Klik untuk memilih file gambar</span>
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, setIdentityForm, 'schoolLogo')} />
                        </label>
                      )}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-6 shadow-sm">
                    <h3 className="text-sm sm:text-base font-bold text-gray-900">Kontak & Lokasi</h3>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <label className={labelCls}>Alamat</label>
                        <textarea rows={2} value={identityForm.address} onChange={(e) => setIdentityForm({ ...identityForm, address: e.target.value })} className={inputCls + ' resize-none'} />
                      </div>
                      <div>
                        <label className={labelCls}>Telepon</label>
                        <input type="text" value={identityForm.phone} onChange={(e) => setIdentityForm({ ...identityForm, phone: e.target.value })} className={inputCls} />
                      </div>
                      <div>
                        <label className={labelCls}>Email</label>
                        <input type="email" value={identityForm.email} onChange={(e) => setIdentityForm({ ...identityForm, email: e.target.value })} className={inputCls} />
                      </div>
                      <div>
                        <label className={labelCls}>Jam Operasional</label>
                        <input type="text" value={identityForm.hours} onChange={(e) => setIdentityForm({ ...identityForm, hours: e.target.value })} className={inputCls} />
                      </div>
                      <div>
                        <label className={labelCls}>Query Google Maps</label>
                        <input type="text" value={identityForm.mapQuery} onChange={(e) => setIdentityForm({ ...identityForm, mapQuery: e.target.value })} className={inputCls} placeholder="Contoh: SMA Negeri 1 Jakarta" />
                      </div>
                      <div>
                        <label className={labelCls}>URL Embed Maps</label>
                        <input type="url" value={identityForm.mapEmbedUrl} onChange={(e) => setIdentityForm({ ...identityForm, mapEmbedUrl: e.target.value })} className={inputCls} placeholder="https://www.google.com/maps/embed?pb=..." />
                      </div>
                      <div>
                        <label className={labelCls}>Link Arah Maps</label>
                        <input type="url" value={identityForm.mapDirectionsUrl} onChange={(e) => setIdentityForm({ ...identityForm, mapDirectionsUrl: e.target.value })} className={inputCls} placeholder="https://maps.app.goo.gl/..." />
                      </div>
                    </div>
                    <div className="mt-4 grid gap-4 sm:grid-cols-3">
                      <div>
                        <label className={labelCls}>Facebook</label>
                        <input type="url" value={identityForm.facebook} onChange={(e) => setIdentityForm({ ...identityForm, facebook: e.target.value })} className={inputCls} placeholder="https://facebook.com/..." />
                      </div>
                      <div>
                        <label className={labelCls}>Instagram</label>
                        <input type="url" value={identityForm.instagram} onChange={(e) => setIdentityForm({ ...identityForm, instagram: e.target.value })} className={inputCls} placeholder="https://instagram.com/..." />
                      </div>
                      <div>
                        <label className={labelCls}>YouTube</label>
                        <input type="url" value={identityForm.youtube} onChange={(e) => setIdentityForm({ ...identityForm, youtube: e.target.value })} className={inputCls} placeholder="https://youtube.com/..." />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-6 shadow-sm">
                    <h3 className="text-sm sm:text-base font-bold text-gray-900">Tema Dasar Global</h3>
                    <p className="mt-1 text-xs text-gray-500">Pilih preset agar warna utama website langsung menyesuaikan secara menyeluruh. Jika perlu, admin masih bisa mengubah warna manual.</p>
                    <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                      {SCHOOL_THEME_PRESETS.map((preset) => {
                        const isActive = identityForm.themePreset === preset.id;
                        return (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => setIdentityForm(applyThemePreset(identityForm, preset.id))}
                            className={`rounded-2xl border p-3 text-left transition-all ${isActive ? 'border-primary-400 bg-primary-50 shadow-sm' : 'border-gray-200 bg-white hover:border-primary-200 hover:bg-gray-50'}`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="h-5 w-5 rounded-full border border-white/70 shadow-sm" style={{ backgroundColor: preset.primaryColor }} />
                              <span className="h-5 w-5 rounded-full border border-white/70 shadow-sm" style={{ backgroundColor: preset.secondaryColor }} />
                              <span className="h-5 w-5 rounded-full border border-white/70 shadow-sm" style={{ backgroundColor: preset.accentColor }} />
                              <span className="h-5 w-5 rounded-full border border-white/70 shadow-sm" style={{ backgroundColor: preset.footerBackgroundColor }} />
                            </div>
                            <p className="mt-3 text-sm font-semibold text-gray-900">{preset.label}</p>
                            <p className="mt-1 text-xs text-gray-500">{preset.description}</p>
                            {isActive && <p className="mt-2 text-[11px] font-semibold text-primary-600">Preset aktif</p>}
                          </button>
                        );
                      })}
                    </div>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                      {[
                        { key: 'primaryColor', label: 'Warna Utama' },
                        { key: 'secondaryColor', label: 'Warna Sekunder' },
                        { key: 'accentColor', label: 'Warna Aksen' },
                        { key: 'footerBackgroundColor', label: 'Warna Footer' },
                      ].map((item) => (
                        <div key={item.key}>
                          <label className={labelCls}>{item.label}</label>
                          <div className="flex items-center gap-3">
                            <input
                              type="color"
                              value={identityForm[item.key as keyof Pick<SchoolIdentitySettings, 'primaryColor' | 'secondaryColor' | 'accentColor' | 'footerBackgroundColor'>]}
                              onChange={(e) => setIdentityForm({ ...identityForm, themePreset: 'custom', [item.key]: e.target.value })}
                              className="h-11 w-14 rounded-xl border border-gray-200 bg-white p-1"
                            />
                            <input
                              type="text"
                              value={identityForm[item.key as keyof Pick<SchoolIdentitySettings, 'primaryColor' | 'secondaryColor' | 'accentColor' | 'footerBackgroundColor'>]}
                              onChange={(e) => setIdentityForm({ ...identityForm, themePreset: 'custom', [item.key]: e.target.value })}
                              className={inputCls}
                              placeholder="#0f766e"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Model Navigasi Bawah (Mobile Bottom Nav) */}
                  <div className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-6 shadow-sm">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <h3 className="text-sm sm:text-base font-bold text-gray-900 flex items-center gap-2">
                          <Smartphone className="h-4 w-4 text-primary-600" />
                          Model Navigasi Bawah (Mobile Bottom Navigation)
                        </h3>
                        <p className="mt-1 text-xs text-gray-500">
                          Pilih model dan gaya bilah menu bawah pada layar smartphone / mobile. Perubahan langsung aktif di seluruh halaman publik.
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                      {BOTTOM_NAV_STYLES.map((style) => {
                        const isActive = (identityForm.bottomNavStyle || 'floating') === style.id;
                        return (
                          <button
                            key={style.id}
                            type="button"
                            onClick={() => setIdentityForm({ ...identityForm, bottomNavStyle: style.id })}
                            className={`rounded-2xl border p-3.5 text-left transition-all relative flex flex-col justify-between ${
                              isActive
                                ? 'border-primary-500 bg-primary-50/80 shadow-md ring-1 ring-primary-500'
                                : 'border-gray-200 bg-white hover:border-primary-200 hover:bg-gray-50'
                            }`}
                          >
                            <div>
                              {/* Mini Visual Mockup */}
                              <div className={`h-12 rounded-xl p-1.5 flex items-center justify-around border transition-all ${
                                style.id === 'glass'
                                  ? 'bg-slate-800/80 border-white/20 backdrop-blur-sm'
                                  : style.id === 'dock'
                                  ? 'bg-slate-900 border-primary-500/30 rounded-full px-2'
                                  : style.id === 'minimal'
                                  ? 'bg-slate-950 border-white/5'
                                  : style.id === 'classic'
                                  ? 'bg-slate-900 border-t border-white/10 rounded-none'
                                  : 'bg-slate-900 border-white/15 rounded-2xl'
                              }`}>
                                <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${
                                  isActive
                                    ? style.id === 'dock'
                                      ? 'bg-primary-500 text-white shadow-[0_0_8px_rgba(34,197,94,0.6)] scale-110 rounded-full'
                                      : style.id === 'glass'
                                      ? 'bg-white/30 text-white'
                                      : style.id === 'minimal'
                                      ? 'bg-white/10 text-primary-300'
                                      : 'bg-primary-500 text-white shadow-sm'
                                    : 'bg-white/10 text-white/40'
                                }`}>
                                  <Home className="h-2.5 w-2.5" />
                                </div>
                                <div className="w-5 h-5 rounded-md flex items-center justify-center bg-white/5 text-white/30">
                                  <Newspaper className="h-2.5 w-2.5" />
                                </div>
                                <div className="w-5 h-5 rounded-md flex items-center justify-center bg-white/5 text-white/30">
                                  <Calendar className="h-2.5 w-2.5" />
                                </div>
                              </div>

                              <p className="mt-3 text-xs sm:text-sm font-bold text-gray-900 leading-tight">
                                {style.label}
                              </p>
                              <p className="mt-1 text-[11px] text-gray-500 leading-snug">
                                {style.description}
                              </p>
                            </div>

                            {isActive ? (
                              <div className="mt-3 pt-2 border-t border-primary-200/60 flex items-center gap-1 text-[11px] font-bold text-primary-700">
                                <CheckCircle className="h-3.5 w-3.5" />
                                <span>Aktif</span>
                              </div>
                            ) : (
                              <div className="mt-3 pt-2 text-[11px] font-medium text-gray-400">
                                Klik untuk memilih
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-6 shadow-sm">
                    <h3 className="text-sm sm:text-base font-bold text-gray-900">Informasi Legal Footer</h3>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <label className={labelCls}>Catatan Legal / Credit</label>
                        <input type="text" value={identityForm.legalNotice} onChange={(e) => setIdentityForm({ ...identityForm, legalNotice: e.target.value })} className={inputCls} placeholder="Dibuat dengan sepenuh hati untuk pendidikan Indonesia" />
                      </div>
                      <div>
                        <label className={labelCls}>Copyright Tambahan</label>
                        <input type="text" value={identityForm.copyrightText} onChange={(e) => setIdentityForm({ ...identityForm, copyrightText: e.target.value })} className={inputCls} placeholder="All Rights Reserved" />
                      </div>
                      <div className="flex items-center gap-3 pt-7">
                        <button
                          type="button"
                          onClick={() => setIdentityForm({ ...identityForm, showCurrentYear: !identityForm.showCurrentYear })}
                          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold ${identityForm.showCurrentYear ? 'bg-primary-500 text-white' : 'border border-gray-200 bg-white text-gray-600'}`}
                        >
                          {identityForm.showCurrentYear ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                          {identityForm.showCurrentYear ? 'Tahun Aktif' : 'Tahun Nonaktif'}
                        </button>
                      </div>
                      <div>
                        <label className={labelCls}>Nama Developer</label>
                        <input type="text" value={identityForm.developerName} onChange={(e) => setIdentityForm({ ...identityForm, developerName: e.target.value })} className={inputCls} placeholder="Nama / Tim Pengembang" />
                      </div>
                      <div>
                        <label className={labelCls}>URL Developer</label>
                        <input type="url" value={identityForm.developerUrl} onChange={(e) => setIdentityForm({ ...identityForm, developerUrl: e.target.value })} className={inputCls} placeholder="https://developer.com" />
                      </div>
                    </div>
                  </div>

                  {identityErrors.length > 0 && (
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
                      <p className="text-sm font-bold text-red-700">Validasi identitas sekolah gagal</p>
                      <ul className="mt-2 space-y-1 text-xs text-red-600">
                        {identityErrors.map((error) => (
                          <li key={error}>- {error}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button onClick={saveIdentity} className="flex items-center justify-center gap-2 rounded-xl bg-primary-500 px-6 py-3 text-sm font-semibold text-white hover:bg-primary-600 shadow-lg">
                      <Save className="h-4 w-4" /> Simpan Identitas Sekolah
                    </button>
                    <Link to="/" className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                      <Eye className="h-4 w-4" /> Lihat Website
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======= DOWNLOADS ======= */}
          {activeTab === 'downloads' && (
            <div className="animate-fadeIn space-y-4 sm:space-y-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg sm:text-2xl font-extrabold text-gray-900">Dokumen Download</h2>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">Kelola halaman download dokumen dan daftar tautan Google Drive.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {downloadsSaved && <span className="flex items-center gap-1 text-green-600 text-xs sm:text-sm font-semibold animate-fadeIn"><CheckCircle className="h-4 w-4" /> Tersimpan!</span>}
                  <button onClick={openDownloadAdd} className="flex items-center gap-1.5 bg-primary-500 hover:bg-primary-600 text-white px-3 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold shadow-md">
                    <Plus className="h-4 w-4" /> Tambah Dokumen
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 space-y-4">
                <div className="grid gap-4 lg:grid-cols-2">
                  <div>
                    <label className={labelCls}>Judul Halaman</label>
                    <input type="text" value={downloadsForm.pageTitle} onChange={(e) => setDownloadsForm({ ...downloadsForm, pageTitle: e.target.value })} className={inputCls} placeholder="Download Dokumen" />
                  </div>
                  <div>
                    <label className={labelCls}>Status Halaman</label>
                    <button
                      onClick={() => setDownloadsForm({ ...downloadsForm, showPage: !downloadsForm.showPage })}
                      className={`inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold ${downloadsForm.showPage ? 'bg-primary-500 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}
                    >
                      {downloadsForm.showPage ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                      {downloadsForm.showPage ? 'Halaman Aktif' : 'Halaman Nonaktif'}
                    </button>
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Deskripsi Halaman</label>
                  <textarea rows={3} value={downloadsForm.pageDescription} onChange={(e) => setDownloadsForm({ ...downloadsForm, pageDescription: e.target.value })} className={inputCls + ' resize-none'} placeholder="Deskripsi singkat untuk membantu pengunjung memahami halaman download." />
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <button onClick={saveDownloadsPage} className="flex items-center justify-center gap-2 rounded-xl bg-primary-500 px-6 py-3 text-sm font-semibold text-white hover:bg-primary-600 shadow-lg">
                    <Save className="h-4 w-4" /> Simpan Pengaturan Halaman
                  </button>
                  <Link to="/download" className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                    <Eye className="h-4 w-4" /> Preview Halaman
                  </Link>
                </div>
              </div>

              <div className="space-y-2 sm:space-y-0 sm:bg-white sm:rounded-2xl sm:shadow-sm sm:border sm:border-gray-100 sm:overflow-hidden">
                <div className="hidden sm:grid sm:grid-cols-12 bg-gray-50 text-gray-600 text-xs font-semibold px-4 py-3">
                  <div className="col-span-3">Nama Dokumen</div>
                  <div className="col-span-2">Kategori</div>
                  <div className="col-span-2">Jenis File</div>
                  <div className="col-span-2">Tanggal</div>
                  <div className="col-span-1">Status</div>
                  <div className="col-span-2 text-right">Aksi</div>
                </div>
                {downloadDocuments.documents.map(item => (
                  <div key={item.id} className="bg-white rounded-xl sm:rounded-none border border-gray-100 sm:border-0 sm:border-b sm:border-gray-50 p-3 sm:px-4 sm:py-3 sm:grid sm:grid-cols-12 sm:items-center sm:hover:bg-gray-50 transition-colors">
                    <div className="sm:col-span-3">
                      <p className="text-sm font-semibold text-gray-900 line-clamp-1">{item.title}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5 sm:hidden">{item.category} · {item.fileType} · {item.publishedAt}</p>
                    </div>
                    <div className="hidden sm:block sm:col-span-2 text-sm text-gray-500">{item.category}</div>
                    <div className="hidden sm:block sm:col-span-2 text-sm text-gray-500">{item.fileType}</div>
                    <div className="hidden sm:block sm:col-span-2 text-sm text-gray-500">{item.publishedAt}</div>
                    <div className="sm:col-span-1 mt-2 sm:mt-0">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ${item.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {item.isActive ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </div>
                    <div className="sm:col-span-2 mt-3 sm:mt-0 flex gap-1.5 sm:justify-end">
                      <button onClick={() => openDownloadEdit(item)} className="flex items-center gap-1 px-2.5 py-1.5 bg-primary-50 text-primary-600 rounded-lg text-xs font-medium hover:bg-primary-100"><Edit className="h-3.5 w-3.5" /><span className="sm:hidden">Edit</span></button>
                      <button onClick={() => window.open(item.googleDriveLink, '_blank', 'noopener,noreferrer')} className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-medium hover:bg-emerald-100"><ExternalLink className="h-3.5 w-3.5" /><span className="sm:hidden">Buka</span></button>
                      <button onClick={() => setDeleteConfirm({ type: 'download', id: item.id })} className="flex items-center gap-1 px-2.5 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100"><Trash2 className="h-3.5 w-3.5" /><span className="sm:hidden">Hapus</span></button>
                    </div>
                  </div>
                ))}
                {downloadDocuments.documents.length === 0 && (
                  <div className="bg-white px-4 py-10 text-center text-sm text-gray-500">
                    Belum ada dokumen download. Klik tombol "Tambah Dokumen" untuk mulai membuat daftar.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ======= SEO & ANALYTICS ======= */}
          {activeTab === 'seo' && <SEOAnalyticsTab
            seoForm={seoForm}
            setSeoForm={setSeoForm}
            saveSeo={saveSeo}
            seoSaved={seoSaved}
            analyticsData={analyticsData}
            resetAnalytics={resetAnalytics}
            inputCls={inputCls}
            labelCls={labelCls}
          />}

          {/* ======= INSTAGRAM ======= */}
          {activeTab === 'instagram' && (
            <div className="animate-fadeIn space-y-4 sm:space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg sm:text-2xl font-extrabold text-gray-900">Kelola Instagram</h2>
                {instagramSettingsSaved && <span className="flex items-center gap-1 text-green-600 text-xs sm:text-sm font-semibold animate-fadeIn"><CheckCircle className="h-4 w-4" /> Tersimpan!</span>}
              </div>

              {/* Instagram Account Link */}
              <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 space-y-4">
                <h3 className="text-sm sm:text-base font-bold text-gray-900 flex items-center gap-2">
                  <Instagram className="h-4 w-4 sm:h-5 sm:w-5 text-pink-500" />
                  Akun Instagram Sekolah
                </h3>

                {/* Account Preview Card */}
                <div className="bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 rounded-xl p-4 sm:p-5 text-white">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30">
                      <Instagram className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-base sm:text-lg font-bold truncate">{instagramSettingsForm.username || '@username'}</p>
                      <p className="text-xs sm:text-sm text-white/80 truncate">{instagramSettingsForm.profileUrl || 'https://instagram.com/...'}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${instagramSettingsForm.showSection ? 'bg-green-400/30 text-green-100' : 'bg-red-400/30 text-red-100'}`}>
                          {instagramSettingsForm.showSection ? '● Aktif' : '○ Nonaktif'}
                        </span>
                        <span className="text-[10px] text-white/60">{instagramSettings.posts.length} postingan</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className={labelCls}><Instagram className="inline h-3.5 w-3.5 mr-1" />Username Instagram</label>
                    <input type="text" value={instagramSettingsForm.username} onChange={e => setInstagramSettingsForm({ ...instagramSettingsForm, username: e.target.value })} className={inputCls} placeholder="@sekolah_official" />
                    <p className="text-[10px] text-gray-400 mt-1">Masukkan username termasuk tanda @</p>
                  </div>
                  <div>
                    <label className={labelCls}><Link2 className="inline h-3.5 w-3.5 mr-1" />URL Profil Instagram</label>
                    <input type="url" value={instagramSettingsForm.profileUrl} onChange={e => setInstagramSettingsForm({ ...instagramSettingsForm, profileUrl: e.target.value })} className={inputCls} placeholder="https://www.instagram.com/sekolah_official" />
                  </div>
                </div>
                <div>
                  <label className={labelCls}><Tag className="inline h-3.5 w-3.5 mr-1" />Judul Section</label>
                  <input type="text" value={instagramSettingsForm.sectionTitle} onChange={e => setInstagramSettingsForm({ ...instagramSettingsForm, sectionTitle: e.target.value })} className={inputCls} placeholder="Instagram Sekolah" />
                  <p className="text-[10px] text-gray-400 mt-1">Judul yang ditampilkan di halaman Home dan Galeri</p>
                </div>
                
                {/* Embedded / Widget Setup */}
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 sm:p-4 space-y-3">
                  <div>
                    <label className={labelCls}>Metode Tampilan Feed</label>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      <button
                        onClick={() => setInstagramSettingsForm({ ...instagramSettingsForm, embedType: 'widget' })}
                        className={`py-2 px-3 rounded-lg text-xs font-semibold border ${instagramSettingsForm.embedType === 'widget' ? 'bg-blue-500 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                      >
                        Otomatis (Widget)
                      </button>
                      <button
                        onClick={() => setInstagramSettingsForm({ ...instagramSettingsForm, embedType: 'manual' })}
                        className={`py-2 px-3 rounded-lg text-xs font-semibold border ${instagramSettingsForm.embedType === 'manual' ? 'bg-blue-500 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                      >
                        Manual (Satu per satu)
                      </button>
                    </div>
                  </div>
                  
                  {instagramSettingsForm.embedType === 'widget' && (
                    <div className="space-y-2 animate-fadeIn">
                      <div className="bg-white p-3 rounded-lg border border-blue-100 text-xs text-blue-800 leading-relaxed">
                        <strong>💡 Cara Menampilkan Feed Otomatis:</strong><br />
                        Karena kebijakan privasi Instagram, Anda perlu menggunakan layanan pihak ketiga yang gratis.<br />
                        1. Buka <a href="https://elfsight.com/instagram-feed-instashow/" target="_blank" rel="noreferrer" className="underline font-semibold text-blue-600">elfsight.com</a> atau <a href="https://curator.io" target="_blank" rel="noreferrer" className="underline font-semibold text-blue-600">curator.io</a><br />
                        2. Buat widget Instagram Feed gratis<br />
                        3. Hubungkan akun Instagram sekolah Anda<br />
                        4. Copy kode Embed (HTML/Script) yang diberikan, dan paste ke dalam kotak di bawah ini:
                      </div>
                      <label className={labelCls}>Kode Widget Embed</label>
                      <textarea 
                        rows={4} 
                        value={instagramSettingsForm.widgetCode || ''} 
                        onChange={e => setInstagramSettingsForm({ ...instagramSettingsForm, widgetCode: e.target.value })} 
                        className={`${inputCls} font-mono text-[10px] sm:text-xs`} 
                        placeholder={'<script src="https://apps.elfsight.com/p/platform.js" defer></script>\n<div class="elfsight-app-xxxx-xxxx-xxxx"></div>'} 
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between bg-gray-50 rounded-xl p-3 sm:p-4 border border-gray-100">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Tampilkan di Website</p>
                    <p className="text-[10px] sm:text-xs text-gray-500">Aktifkan untuk menampilkan feed Instagram di halaman Home & Galeri</p>
                  </div>
                  <button
                    onClick={() => setInstagramSettingsForm({ ...instagramSettingsForm, showSection: !instagramSettingsForm.showSection })}
                    className="shrink-0"
                  >
                    {instagramSettingsForm.showSection
                      ? <ToggleRight className="h-8 w-8 text-green-500" />
                      : <ToggleLeft className="h-8 w-8 text-gray-300" />
                    }
                  </button>
                </div>
                <button onClick={saveInstagramSettings} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-white rounded-xl text-sm font-semibold hover:opacity-90 shadow-lg transition-opacity">
                  <Save className="h-4 w-4" /> Simpan Pengaturan Instagram
                </button>
              </div>

              {/* Instagram Posts Management */}
              <div className={`bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 space-y-4 ${instagramSettingsForm.embedType === 'widget' ? 'opacity-50 pointer-events-none' : ''}`}>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm sm:text-base font-bold text-gray-900 flex items-center gap-2">
                    <Heart className="h-4 w-4 text-pink-500" />
                    Postingan Instagram ({instagramSettings.posts.length})
                  </h3>
                  <button onClick={openInstagramAdd} className="flex items-center gap-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold shadow-md hover:opacity-90 transition-opacity">
                    <Plus className="h-4 w-4" /> <span className="hidden sm:inline">Tambah</span> Post
                  </button>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                  <p className="text-[10px] sm:text-xs text-amber-700 leading-relaxed">
                    <strong>💡 Cara menambahkan post:</strong> Buka Instagram → pilih postingan → klik ⋯ → "Salin Tautan" → paste URL di form. 
                    Upload juga thumbnail (screenshot) dari postingan tersebut.
                  </p>
                </div>

                {instagramSettings.posts.length === 0 ? (
                  <div className="text-center py-8 sm:py-12">
                    <Instagram className="h-12 w-12 text-gray-200 mx-auto mb-3" />
                    <p className="text-sm text-gray-400">Belum ada postingan</p>
                    <p className="text-xs text-gray-300 mt-1">Klik "Tambah Post" untuk menambahkan</p>
                  </div>
                ) : (
                  <div className="space-y-2 sm:space-y-3">
                    {instagramSettings.posts.map((post, idx) => (
                      <div key={post.id} className="bg-gray-50 rounded-xl p-3 sm:p-4 border border-gray-100 flex items-start gap-3">
                        <div className="flex flex-col gap-1 shrink-0 pt-1">
                          <button onClick={() => moveInstagram(idx, 'up')} disabled={idx === 0} className="p-1 hover:bg-gray-200 rounded disabled:opacity-30"><ArrowUp className="h-3.5 w-3.5 text-gray-400" /></button>
                          <button onClick={() => moveInstagram(idx, 'down')} disabled={idx === instagramSettings.posts.length - 1} className="p-1 hover:bg-gray-200 rounded disabled:opacity-30"><ArrowDown className="h-3.5 w-3.5 text-gray-400" /></button>
                        </div>
                        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-200 rounded-lg overflow-hidden shrink-0">
                          {post.thumbnail ? (
                            <img src={post.thumbnail} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                              <Instagram className="h-6 w-6 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm text-gray-900 line-clamp-2 font-medium">{post.caption || 'Tanpa caption'}</p>
                          <div className="flex items-center gap-2 sm:gap-3 mt-1.5 text-[10px] sm:text-xs text-gray-400">
                            <span className="flex items-center gap-0.5"><Heart className="h-3 w-3" />{post.likes || '0'}</span>
                            <span>{post.date}</span>
                            {post.postUrl && (
                              <a href={post.postUrl} target="_blank" rel="noopener noreferrer" className="text-pink-500 hover:text-pink-600 flex items-center gap-0.5">
                                <ExternalLink className="h-3 w-3" /> Lihat
                              </a>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-1.5 shrink-0">
                          <button onClick={() => openInstagramEdit(post)} className="p-2 bg-white text-primary-600 rounded-lg hover:bg-primary-50 border border-gray-200"><Edit className="h-3.5 w-3.5" /></button>
                          <button onClick={() => setDeleteConfirm({ type: 'instagram', id: post.id })} className="p-2 bg-white text-red-600 rounded-lg hover:bg-red-50 border border-gray-200"><Trash2 className="h-3.5 w-3.5" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ======= SPONSORS ======= */}
          {activeTab === 'sponsors' && (
            <div className="animate-fadeIn space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">Kelola Sponsor & Mitra</h2>
                  <p className="text-xs sm:text-sm text-gray-500">Atur logo sponsor atau instansi terkait</p>
                </div>
                <button onClick={openSponsorAdd} className="flex items-center justify-center gap-2 px-4 py-2 sm:py-2.5 bg-primary-600 text-white rounded-xl text-xs sm:text-sm font-semibold hover:bg-primary-700 transition-colors w-full sm:w-auto">
                  <Plus className="h-4 w-4" /> Tambah Sponsor
                </button>
              </div>
              {sponsorSaved && (
                <div className="flex items-center gap-2 text-green-600 text-xs sm:text-sm font-semibold animate-fadeIn">
                  <CheckCircle className="h-4 w-4" /> Data sponsor berhasil disimpan.
                </div>
              )}

              {/* Sponsor Settings */}
              <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 mb-6">
                <h3 className="text-sm font-bold text-gray-900 mb-4">Pengaturan Section</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Judul Section</label>
                    <input
                      type="text"
                      className={inputCls}
                      value={sponsorsData.title}
                      onChange={(e) => updateSponsorsData({ title: e.target.value })}
                      placeholder="Misal: Didukung Oleh"
                    />
                  </div>
                  <div className="flex items-center h-full pt-4 sm:pt-6">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <div className="relative">
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={sponsorsData.showSection}
                          onChange={(e) => updateSponsorsData({ showSection: e.target.checked })}
                        />
                        <div className={`block w-12 h-7 rounded-full transition-colors ${sponsorsData.showSection ? 'bg-primary-500' : 'bg-gray-300'}`}></div>
                        <div className={`dot absolute left-1 top-1 bg-white w-5 h-5 rounded-full transition-transform ${sponsorsData.showSection ? 'transform translate-x-5' : ''}`}></div>
                      </div>
                      <span className="text-sm font-medium text-gray-700">Tampilkan di Beranda</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto no-scrollbar">
                  <table className="w-full min-w-[600px] text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50/50 border-b border-gray-100">
                        <th className="p-3 sm:p-4 text-xs font-semibold text-gray-500 w-24">Logo</th>
                        <th className="p-3 sm:p-4 text-xs font-semibold text-gray-500">Nama</th>
                        <th className="p-3 sm:p-4 text-xs font-semibold text-gray-500 hidden md:table-cell">URL</th>
                        <th className="p-3 sm:p-4 text-xs font-semibold text-gray-500 text-right w-24 sm:w-32">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {sponsorsData.sponsors.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                          <td className="p-3 sm:p-4">
                            <div className="w-16 h-12 bg-gray-100 rounded-lg flex items-center justify-center p-2">
                              {item.logo ? <img src={item.logo} alt="" className="max-h-full max-w-full object-contain mix-blend-multiply" /> : <ImagePlus className="h-4 w-4 text-gray-400" />}
                            </div>
                          </td>
                          <td className="p-3 sm:p-4 font-medium text-gray-900 text-xs sm:text-sm">{item.name}</td>
                          <td className="p-3 sm:p-4 text-xs sm:text-sm text-gray-500 hidden md:table-cell truncate max-w-[200px]">{item.url}</td>
                          <td className="p-3 sm:p-4 text-right">
                            <div className="flex items-center justify-end gap-1 sm:gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                              <button aria-label={`Edit sponsor ${item.name}`} onClick={() => openSponsorEdit(item)} className="p-1.5 sm:p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit className="h-4 w-4 sm:h-4.5 sm:w-4.5" /></button>
                              <button aria-label={`Hapus sponsor ${item.name}`} onClick={() => setDeleteConfirm({ type: 'sponsor', id: item.id })} className="p-1.5 sm:p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="h-4 w-4 sm:h-4.5 sm:w-4.5" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {sponsorsData.sponsors.length === 0 && (
                        <tr><td colSpan={4} className="p-8 text-center text-sm text-gray-500">Belum ada data sponsor.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ======= GURU ======= */}
          {activeTab === 'guru' && (
            <div className="animate-fadeIn space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">Kelola Data Guru & Karyawan</h2>
                  <p className="text-xs sm:text-sm text-gray-500">{teachers.length} orang guru & staf</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={downloadGuruTemplate}
                    type="button"
                    className="flex items-center justify-center gap-1.5 px-3 py-2 sm:py-2.5 border border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl text-xs sm:text-sm font-semibold transition-colors shadow-xs w-full sm:w-auto cursor-pointer"
                    title="Unduh format tabel Excel standar untuk penambahan data guru secara massal"
                  >
                    <FileSpreadsheet className="h-4 w-4 text-emerald-600" /> Template Excel
                  </button>
                  <button onClick={exportGuru} className="flex items-center justify-center gap-1.5 px-3 py-2 sm:py-2.5 border border-gray-200 text-gray-600 rounded-xl text-xs sm:text-sm font-medium hover:bg-gray-50 transition-colors w-full sm:w-auto">
                    <Download className="h-4 w-4" /> Export
                  </button>
                  <label className="flex items-center justify-center gap-1.5 px-3 py-2 sm:py-2.5 border border-gray-200 text-gray-600 rounded-xl text-xs sm:text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer w-full sm:w-auto">
                    <Upload className="h-4 w-4" /> Import Excel
                    <input type="file" accept=".xlsx,.xls" className="hidden" onChange={importGuru} />
                  </label>
                  <button onClick={openGuruAdd} className="flex items-center justify-center gap-2 px-4 py-2 sm:py-2.5 bg-primary-600 text-white rounded-xl text-xs sm:text-sm font-semibold hover:bg-primary-700 transition-colors w-full sm:w-auto">
                    <Plus className="h-4 w-4" /> Tambah Guru
                  </button>
                </div>
              </div>
              {guruSaved && (
                <div className="flex items-center gap-2 text-green-600 text-xs sm:text-sm font-semibold animate-fadeIn">
                  <CheckCircle className="h-4 w-4" /> Data guru berhasil disimpan.
                </div>
              )}
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto no-scrollbar">
                  <table className="w-full min-w-[700px] text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50/50 border-b border-gray-100">
                        <th className="p-3 sm:p-4 text-xs font-semibold text-gray-500">Nama</th>
                        <th className="p-3 sm:p-4 text-xs font-semibold text-gray-500 hidden sm:table-cell">Jabatan</th>
                        <th className="p-3 sm:p-4 text-xs font-semibold text-gray-500 hidden lg:table-cell">Mapel</th>
                        <th className="p-3 sm:p-4 text-xs font-semibold text-gray-500 hidden md:table-cell">Pendidikan</th>
                        <th className="p-3 sm:p-4 text-xs font-semibold text-gray-500 text-right w-24 sm:w-32">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {teachers.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                          <td className="p-3 sm:p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-xs sm:text-sm shrink-0">
                                {item.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium text-gray-900 text-xs sm:text-sm truncate">{item.name}</p>
                                <p className="text-[10px] sm:text-xs text-gray-400 md:hidden">{item.position}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-3 sm:p-4 text-xs sm:text-sm text-gray-700 hidden sm:table-cell">{item.position}</td>
                          <td className="p-3 sm:p-4 text-xs sm:text-sm text-gray-500 hidden lg:table-cell">{item.subject}</td>
                          <td className="p-3 sm:p-4 text-xs sm:text-sm text-gray-500 hidden md:table-cell">{item.education}</td>
                          <td className="p-3 sm:p-4 text-right">
                            <div className="flex items-center justify-end gap-1 sm:gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                              <button aria-label={`Edit ${item.name}`} onClick={() => openGuruEdit(item)} className="p-1.5 sm:p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit className="h-4 w-4 sm:h-4.5 sm:w-4.5" /></button>
                              <button aria-label={`Hapus ${item.name}`} onClick={() => setDeleteConfirm({ type: 'guru', id: item.id })} className="p-1.5 sm:p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="h-4 w-4 sm:h-4.5 sm:w-4.5" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {teachers.length === 0 && (
                        <tr><td colSpan={5} className="p-8 text-center text-sm text-gray-500">Belum ada data guru.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ======= EKSTRAKURIKULER ======= */}
          {activeTab === 'eskul' && (
            <div className="animate-fadeIn space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">Kelola Ekstrakurikuler</h2>
                  <p className="text-xs sm:text-sm text-gray-500">{extracurricular.length} kegiatan ekstrakurikuler terdaftar</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowEskulCatModal(true)}
                    className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors border border-gray-200"
                  >
                    <Tag className="h-4 w-4 text-gray-500" />
                    <span className="hidden sm:inline">Kelola</span> Kategori
                  </button>
                  <button
                    onClick={openEskulAdd}
                    className="flex items-center justify-center gap-2 px-4 py-2 sm:py-2.5 bg-primary-600 text-white rounded-xl text-xs sm:text-sm font-semibold hover:bg-primary-700 transition-colors shadow-sm"
                  >
                    <Plus className="h-4 w-4" /> Tambah Eskul
                  </button>
                </div>
              </div>

              {eskulSaved && (
                <div className="flex items-center gap-2 text-green-600 text-xs sm:text-sm font-semibold animate-fadeIn">
                  <CheckCircle className="h-4 w-4" /> Data ekstrakurikuler berhasil disimpan.
                </div>
              )}

              {/* Filter & Search Bar */}
              <div className="bg-white rounded-xl sm:rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
                  {['Semua', ...eskulCategories].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setEskulCategoryFilter(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                        eskulCategoryFilter === cat
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                  <input
                    type="text"
                    value={eskulSearch}
                    onChange={e => setEskulSearch(e.target.value)}
                    placeholder="Cari nama atau pembina..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500 focus:bg-white"
                  />
                  {eskulSearch && (
                    <button onClick={() => setEskulSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Eskul Table */}
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto no-scrollbar">
                  <table className="w-full min-w-[700px] text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50/50 border-b border-gray-100">
                        <th className="p-3 sm:p-4 text-xs font-semibold text-gray-500">Nama & Kategori</th>
                        <th className="p-3 sm:p-4 text-xs font-semibold text-gray-500 hidden sm:table-cell">Pembina</th>
                        <th className="p-3 sm:p-4 text-xs font-semibold text-gray-500 hidden md:table-cell">Jadwal & Lokasi</th>
                        <th className="p-3 sm:p-4 text-xs font-semibold text-gray-500 hidden lg:table-cell">Prestasi</th>
                        <th className="p-3 sm:p-4 text-xs font-semibold text-gray-500 text-center">Status</th>
                        <th className="p-3 sm:p-4 text-xs font-semibold text-gray-500 text-right w-24 sm:w-32">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {extracurricular
                        .filter(item => {
                          const matchCategory = eskulCategoryFilter === 'Semua' || item.category === eskulCategoryFilter;
                          const q = eskulSearch.toLowerCase().trim();
                          const matchSearch =
                            !q ||
                            item.name.toLowerCase().includes(q) ||
                            item.coach.toLowerCase().includes(q) ||
                            item.description.toLowerCase().includes(q);
                          return matchCategory && matchSearch;
                        })
                        .map(item => (
                          <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                            <td className="p-3 sm:p-4">
                              <div className="flex items-center gap-3">
                                {item.image ? (
                                  <img src={item.image} alt="" className="w-10 h-10 rounded-xl object-cover border border-gray-200 shrink-0" />
                                ) : (
                                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white shrink-0 shadow-sm">
                                    <Trophy className="h-5 w-5" />
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <p className="font-semibold text-gray-900 text-xs sm:text-sm truncate">{item.name}</p>
                                  <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                                    <span className="inline-block px-2 py-0.5 bg-primary-50 text-primary-700 text-[10px] font-medium rounded-full">
                                      {item.category}
                                    </span>
                                    {item.galleryId && (() => {
                                      const linked = gallery.find(g => g.id === item.galleryId);
                                      return linked ? (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-sky-50 text-sky-700 text-[10px] font-medium rounded-full border border-sky-100">
                                          <Camera className="h-2.5 w-2.5 text-sky-600" /> {linked.title}
                                        </span>
                                      ) : null;
                                    })()}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="p-3 sm:p-4 text-xs sm:text-sm text-gray-700 hidden sm:table-cell">
                              {item.coach || '-'}
                            </td>
                            <td className="p-3 sm:p-4 text-xs text-gray-500 hidden md:table-cell">
                              <p className="font-medium text-gray-800">{item.schedule || '-'}</p>
                              <p className="text-[11px] text-gray-400">{item.location || '-'}</p>
                            </td>
                            <td className="p-3 sm:p-4 text-xs text-gray-500 hidden lg:table-cell">
                              {item.achievements && item.achievements.length > 0 ? (
                                <span className="inline-flex items-center gap-1 text-accent-700 bg-amber-50 px-2 py-0.5 rounded-full text-[11px] font-medium border border-amber-200">
                                  <Award className="h-3 w-3" /> {item.achievements.length} Prestasi
                                </span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                            <td className="p-3 sm:p-4 text-center">
                              <button
                                onClick={() => toggleEskulActive(item)}
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                                  item.isActive
                                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                }`}
                              >
                                {item.isActive ? (
                                  <><CheckCircle className="h-3 w-3" /> Aktif</>
                                ) : (
                                  <>Nonaktif</>
                                )}
                              </button>
                            </td>
                            <td className="p-3 sm:p-4 text-right">
                              <div className="flex items-center justify-end gap-1 sm:gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                <button
                                  aria-label={`Edit ${item.name}`}
                                  onClick={() => openEskulEdit(item)}
                                  className="p-1.5 sm:p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                >
                                  <Edit className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
                                </button>
                                <button
                                  aria-label={`Hapus ${item.name}`}
                                  onClick={() => setDeleteConfirm({ type: 'eskul', id: item.id })}
                                  className="p-1.5 sm:p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                >
                                  <Trash2 className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      {extracurricular.length === 0 && (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-sm text-gray-500">
                            Belum ada data ekstrakurikuler. Klik tombol "Tambah Eskul" untuk menambahkan.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ======= SECURITY ======= */}
          {activeTab === 'security' && (
            <div className="animate-fadeIn space-y-4 sm:space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg sm:text-2xl font-extrabold text-gray-900">Keamanan Admin</h2>
                {securitySaved && <span className="flex items-center gap-1 text-green-600 text-xs sm:text-sm font-semibold animate-fadeIn"><CheckCircle className="h-4 w-4" /> Tersimpan!</span>}
              </div>

              <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 space-y-3 sm:space-y-4">
                <h3 className="text-sm sm:text-base font-bold text-gray-900">Kredensial Login Admin</h3>
                <p className="text-xs text-gray-500">Ubah username/password admin yang dipakai untuk masuk ke dashboard.</p>
                <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className={labelCls}>Username</label>
                    <input
                      type="text"
                      value={credentialsForm.username}
                      onChange={(e) => setCredentialsForm({ ...credentialsForm, username: e.target.value })}
                      className={inputCls}
                      placeholder="admin"
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Password Baru</label>
                    <input
                      type="password"
                      value={credentialsForm.password}
                      onChange={(e) => setCredentialsForm({ ...credentialsForm, password: e.target.value })}
                      className={inputCls}
                      placeholder="Minimal 6 karakter"
                    />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Konfirmasi Password Baru</label>
                  <input
                    type="password"
                    value={credentialsForm.confirmPassword}
                    onChange={(e) => setCredentialsForm({ ...credentialsForm, confirmPassword: e.target.value })}
                    className={inputCls}
                    placeholder="Ulangi password baru"
                  />
                </div>
                {securityError && (
                  <p className="text-xs sm:text-sm text-red-600">{securityError}</p>
                )}
                <button onClick={saveAdminCredentials} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-xl text-sm font-semibold hover:bg-primary-600 shadow-lg">
                  <Save className="h-4 w-4" /> Simpan Kredensial
                </button>
              </div>

              <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 space-y-3 sm:space-y-4">
                <h3 className="text-sm sm:text-base font-bold text-gray-900">Tampilan Login</h3>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-700">Tampilkan tulisan demo credential</p>
                    <p className="text-[10px] sm:text-xs text-gray-400">Jika nonaktif, blok "Demo Credentials" di halaman login akan disembunyikan.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateAuthUiSettings({ showDemoCredentials: !authSettings.showDemoCredentials })}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${authSettings.showDemoCredentials ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                  >
                    {authSettings.showDemoCredentials ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                    {authSettings.showDemoCredentials ? 'Tampil' : 'Sembunyi'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ======= BACKUP & RESTORE ======= */}
          {activeTab === 'database' && <DatabaseSettingsTab />}

          {/* ======= CONTACT ======= */}
          {activeTab === 'contact' && (
            <div className="animate-fadeIn space-y-4 sm:space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg sm:text-2xl font-extrabold text-gray-900">Tombol SMPB</h2>
                  <p className="mt-1 text-xs sm:text-sm text-gray-500">Pengaturan tombol publik untuk penerimaan siswa baru.</p>
                </div>
                {smpbSaved && <span className="flex items-center gap-1 text-green-600 text-xs sm:text-sm font-semibold animate-fadeIn"><CheckCircle className="h-4 w-4" /> Tersimpan!</span>}
              </div>
              <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm sm:text-base font-bold text-gray-900">Tombol SMPB</h3>
                </div>
                <div className="bg-gray-50 rounded-xl border border-gray-100 p-3 sm:p-4">
                  <p className="text-[10px] sm:text-xs text-gray-500 mb-1">Preview:</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-800">{smpbForm.label || 'SMPB'} ({smpbForm.year || '-'})</span>
                    <span className={`text-xs font-semibold ${smpbForm.isActive && smpbForm.link ? 'text-green-600' : 'text-gray-400'}`}>
                      {smpbForm.isActive && smpbForm.link ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-700">Aktifkan tombol di navbar</p>
                    <p className="text-[10px] sm:text-xs text-gray-400">Tombol tampil jika aktif dan URL diisi</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSmpbForm({ ...smpbForm, isActive: !smpbForm.isActive })}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${smpbForm.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                  >
                    {smpbForm.isActive ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                    {smpbForm.isActive ? 'Aktif' : 'Nonaktif'}
                  </button>
                </div>
                <div className="grid sm:grid-cols-3 gap-3 sm:gap-4">
                  <div>
                    <label className={labelCls}>Label Tombol</label>
                    <input
                      type="text"
                      value={smpbForm.label}
                      onChange={e => setSmpbForm({ ...smpbForm, label: e.target.value })}
                      className={inputCls}
                      placeholder="SMPB / PPDB"
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Tahun</label>
                    <input
                      type="text"
                      value={smpbForm.year}
                      onChange={e => setSmpbForm({ ...smpbForm, year: e.target.value })}
                      className={inputCls}
                      placeholder="2026"
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Target Link SMPB</label>
                    <input
                      type="url"
                      value={smpbForm.link}
                      onChange={e => setSmpbForm({ ...smpbForm, link: e.target.value })}
                      className={inputCls}
                      placeholder="https://..."
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={smpbForm.openInNewTab} onChange={e => setSmpbForm({ ...smpbForm, openInNewTab: e.target.checked })} className="sr-only peer" />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-500"></div>
                  </label>
                  <span className="text-xs sm:text-sm text-gray-700">Buka link di tab baru</span>
                </div>
                <button onClick={saveSmpbSettings} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-xl text-sm font-semibold hover:bg-primary-600 shadow-lg">
                  <Save className="h-4 w-4" /> Simpan Tombol SMPB
                </button>
              </div>
              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-xs text-blue-700">
                Pengaturan alamat, logo, footer legal, dan tema dasar global sekarang dipusatkan di menu <strong>Identitas Sekolah</strong> agar proses rebranding lebih aman dan tidak tersebar di banyak panel.
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ======= MODALS - Bottom sheet on mobile ======= */}
      {showNewsModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-start sm:justify-center sm:p-4 overflow-y-auto animate-fadeIn" onClick={() => setShowNewsModal(false)}>
          <div className="bg-white w-full sm:rounded-2xl sm:max-w-3xl sm:my-8 rounded-t-2xl animate-slideUp sm:animate-scaleIn max-h-[92vh] sm:max-h-none flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100 shrink-0">
              <h3 className="text-base sm:text-lg font-bold text-gray-900">{editingNewsId ? 'Edit Berita' : 'Tambah Berita'}</h3>
              <button onClick={() => setShowNewsModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="h-5 w-5 text-gray-500" /></button>
            </div>
            <div className="p-4 sm:p-6 space-y-3 sm:space-y-4 overflow-y-auto flex-1">
              <div><label className={labelCls}>Judul *</label><input type="text" value={newsForm.title} onChange={e => setNewsForm({ ...newsForm, title: e.target.value })} className={inputCls} placeholder="Judul berita" /></div>
              <div className="grid grid-cols-3 gap-2 sm:gap-4">
                <div><label className={labelCls}>Kategori</label><select value={newsForm.category} onChange={e => setNewsForm({ ...newsForm, category: e.target.value })} className={inputCls}>{NEWS_CATEGORIES.filter(c => c !== 'Semua').map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                <div><label className={labelCls}>Tanggal</label><input type="date" value={newsForm.date} onChange={e => setNewsForm({ ...newsForm, date: e.target.value })} className={inputCls} /></div>
                <div><label className={labelCls}>Penulis</label><input type="text" value={newsForm.author} onChange={e => setNewsForm({ ...newsForm, author: e.target.value })} className={inputCls} /></div>
              </div>
              <div><label className={labelCls}>Ringkasan *</label><textarea rows={2} value={newsForm.excerpt} onChange={e => setNewsForm({ ...newsForm, excerpt: e.target.value })} className={inputCls + ' resize-none'} placeholder="Ringkasan singkat" /></div>
              <div>
                <label className={labelCls}>Konten (Rich Text)</label>
                <RichTextEditor value={newsForm.content} onChange={v => setNewsForm({ ...newsForm, content: v })} placeholder="Isi berita..." />
              </div>
              <div>
                <label className={labelCls}>Foto Thumbnail</label>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 sm:p-6 text-center">
                  {newsForm.image ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="relative inline-block">
                        <img src={newsForm.image} alt="" className="h-24 sm:h-32 rounded-lg object-cover" />
                        <button onClick={() => setNewsForm({ ...newsForm, image: '' })} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md">
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                      <ImageStorageBadge url={newsForm.image} />
                    </div>
                  ) : (
                    <label className="cursor-pointer"><ImagePlus className="h-8 w-8 sm:h-10 sm:w-10 text-gray-300 mx-auto mb-1" /><p className="text-xs sm:text-sm text-gray-500">Upload foto (maks 2MB)</p><input type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(e, setNewsForm)} /></label>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 sm:gap-3 p-4 sm:p-6 border-t border-gray-100 shrink-0">
              <button onClick={() => setShowNewsModal(false)} className="px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium">Batal</button>
              <button onClick={saveNews} className="flex items-center gap-2 px-5 py-2.5 bg-primary-500 text-white rounded-xl text-sm font-semibold shadow-md"><Save className="h-4 w-4" /> Simpan</button>
            </div>
          </div>
        </div>
      )}

      {showAgendaModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-start sm:justify-center sm:p-4 overflow-y-auto animate-fadeIn" onClick={() => setShowAgendaModal(false)}>
          <div className="bg-white w-full sm:rounded-2xl sm:max-w-lg sm:my-8 rounded-t-2xl animate-slideUp sm:animate-scaleIn max-h-[92vh] sm:max-h-none flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100 shrink-0">
              <h3 className="text-base sm:text-lg font-bold text-gray-900">{editingAgendaId ? 'Edit Agenda' : 'Tambah Agenda'}</h3>
              <button onClick={() => setShowAgendaModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="h-5 w-5 text-gray-500" /></button>
            </div>
            <div className="p-4 sm:p-6 space-y-3 sm:space-y-4 overflow-y-auto flex-1">
              <div><label className={labelCls}>Nama Kegiatan *</label><input type="text" value={agendaForm.title} onChange={e => setAgendaForm({ ...agendaForm, title: e.target.value })} className={inputCls} /></div>
              <div className="grid grid-cols-2 gap-2 sm:gap-4">
                <div><label className={labelCls}>Tgl Mulai *</label><input type="date" value={agendaForm.date} onChange={e => setAgendaForm({ ...agendaForm, date: e.target.value })} className={inputCls} /></div>
                <div><label className={labelCls}>Tgl Selesai</label><input type="date" value={agendaForm.endDate} onChange={e => setAgendaForm({ ...agendaForm, endDate: e.target.value })} className={inputCls} /></div>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:gap-4">
                <div><label className={labelCls}>Waktu</label><input type="text" value={agendaForm.time} onChange={e => setAgendaForm({ ...agendaForm, time: e.target.value })} className={inputCls} placeholder="07:30 - 12:00 WIB" /></div>
                <div><label className={labelCls}>Tipe</label><select value={agendaForm.type} onChange={e => setAgendaForm({ ...agendaForm, type: e.target.value })} className={inputCls}>{AGENDA_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
              </div>
              <div><label className={labelCls}>Lokasi</label><input type="text" value={agendaForm.location} onChange={e => setAgendaForm({ ...agendaForm, location: e.target.value })} className={inputCls} /></div>
              <div><label className={labelCls}>Deskripsi</label><textarea rows={3} value={agendaForm.description} onChange={e => setAgendaForm({ ...agendaForm, description: e.target.value })} className={inputCls + ' resize-none'} /></div>
            </div>
            <div className="flex items-center justify-end gap-2 sm:gap-3 p-4 sm:p-6 border-t border-gray-100 shrink-0">
              <button onClick={() => setShowAgendaModal(false)} className="px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium">Batal</button>
              <button onClick={saveAgenda} className="flex items-center gap-2 px-5 py-2.5 bg-primary-500 text-white rounded-xl text-sm font-semibold shadow-md"><Save className="h-4 w-4" /> Simpan</button>
            </div>
          </div>
        </div>
      )}

      {showGalleryModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-start sm:justify-center sm:p-4 overflow-y-auto animate-fadeIn" onClick={() => setShowGalleryModal(false)}>
          <div className="bg-white w-full sm:rounded-2xl sm:max-w-lg sm:my-8 rounded-t-2xl animate-slideUp sm:animate-scaleIn max-h-[92vh] sm:max-h-none flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100 shrink-0">
              <h3 className="text-base sm:text-lg font-bold text-gray-900">{editingGalleryId ? 'Edit Media' : 'Tambah Media'}</h3>
              <button onClick={() => setShowGalleryModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="h-5 w-5 text-gray-500" /></button>
            </div>
            <div className="p-4 sm:p-6 space-y-3 sm:space-y-4 overflow-y-auto flex-1">
              <div><label className={labelCls}>Judul *</label><input type="text" value={galleryForm.title} onChange={e => setGalleryForm({ ...galleryForm, title: e.target.value })} className={inputCls} /></div>
              <div>
                <label className={labelCls}>Jenis Media</label>
                <div className="flex gap-2 sm:gap-3">
                  <button type="button" onClick={() => setGalleryForm({ ...galleryForm, mediaType: 'image', youtubeUrl: '' })}
                    className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-medium border-2 flex items-center justify-center gap-1.5 ${galleryForm.mediaType === 'image' ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-500'}`}>
                    <Camera className="h-4 w-4" /> Foto
                  </button>
                  <button type="button" onClick={() => setGalleryForm({ ...galleryForm, mediaType: 'video', image: '' })}
                    className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-medium border-2 flex items-center justify-center gap-1.5 ${galleryForm.mediaType === 'video' ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-200 text-gray-500'}`}>
                    <Youtube className="h-4 w-4" /> YouTube
                  </button>
                </div>
              </div>
              {galleryForm.mediaType === 'video' ? (
                <div>
                  <label className={labelCls}>URL YouTube</label>
                  <input type="url" value={galleryForm.youtubeUrl} onChange={e => setGalleryForm({ ...galleryForm, youtubeUrl: e.target.value })} className={inputCls} placeholder="https://youtube.com/watch?v=..." />
                  {galleryForm.youtubeUrl && getYoutubeThumbnail(galleryForm.youtubeUrl) && (
                    <img src={getYoutubeThumbnail(galleryForm.youtubeUrl)} alt="Preview" className="h-28 rounded-lg object-cover mt-2" />
                  )}
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className={labelCls}>Foto Kegiatan (Wadah / Album)</label>
                    {galleryForm.images && galleryForm.images.length > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-primary-600 font-semibold">
                          {galleryForm.images.length} Foto diunggah
                        </span>
                        <ImageStorageBadge url={galleryForm.image || galleryForm.images[0]} />
                      </div>
                    )}
                  </div>

                  {galleryForm.images && galleryForm.images.length > 0 ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 max-h-56 overflow-y-auto p-2 bg-gray-50 rounded-xl border border-gray-200">
                        {galleryForm.images.map((imgUrl, idx) => {
                          const isCover = galleryForm.image === imgUrl || (!galleryForm.image && idx === 0);
                          return (
                            <div key={idx} className={`relative aspect-square rounded-xl overflow-hidden border-2 group bg-white ${isCover ? 'border-primary-500 ring-2 ring-primary-500/30' : 'border-gray-200'}`}>
                              <img src={imgUrl} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                              {isCover && (
                                <span className="absolute top-1 left-1 bg-primary-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow z-10">
                                  Cover
                                </span>
                              )}
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 p-1 z-20">
                                {!isCover && (
                                  <button
                                    type="button"
                                    onClick={() => setGalleryCover(imgUrl)}
                                    className="px-2 py-0.5 bg-primary-600 hover:bg-primary-700 text-white text-[9px] font-semibold rounded shadow transition-colors"
                                  >
                                    Jadikan Cover
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => removeGalleryPhoto(idx)}
                                  className="p-1 bg-red-600 hover:bg-red-700 text-white rounded-full shadow transition-colors"
                                  title="Hapus foto ini"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <label className="flex items-center justify-center gap-2 p-2.5 border-2 border-dashed border-primary-300 rounded-xl text-xs font-semibold text-primary-600 hover:bg-primary-50 cursor-pointer transition-colors">
                        <Plus className="h-4 w-4" />
                        <span>Tambah Foto Lagi ke Album Ini</span>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          className="hidden"
                          onChange={handleMultipleGalleryUpload}
                        />
                      </label>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-primary-400 transition-colors">
                      <label className="cursor-pointer block">
                        <ImagePlus className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                        <p className="text-xs sm:text-sm font-semibold text-gray-700">Upload Foto Kegiatan (Bisa pilih banyak foto)</p>
                        <p className="text-[11px] text-gray-400 mt-1">Format: JPG, PNG, WebP (maks 10MB/foto)</p>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          className="hidden"
                          onChange={handleMultipleGalleryUpload}
                        />
                      </label>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className={labelCls}>Deskripsi Kegiatan (opsional)</label>
                <textarea
                  rows={2}
                  value={galleryForm.description || ''}
                  onChange={e => setGalleryForm({ ...galleryForm, description: e.target.value })}
                  className={inputCls + ' resize-none'}
                  placeholder="Keterangan atau catatan seputar kegiatan..."
                />
              </div>

              <div className="grid grid-cols-2 gap-2 sm:gap-4">
                <div>
                  <label className={labelCls}>Kategori</label>
                  <select
                    value={galleryForm.category}
                    onChange={e => setGalleryForm({ ...galleryForm, category: e.target.value })}
                    className={inputCls}
                  >
                    {galleryCategories.filter(c => c !== 'Semua' && c !== 'Video').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Tanggal</label>
                  <input type="date" value={galleryForm.date} onChange={e => setGalleryForm({ ...galleryForm, date: e.target.value })} className={inputCls} />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 sm:gap-3 p-4 sm:p-6 border-t border-gray-100 shrink-0">
              <button onClick={() => setShowGalleryModal(false)} className="px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium">Batal</button>
              <button
                onClick={saveGallery}
                disabled={isImageProcessing}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold shadow-md text-white transition-colors ${
                  isImageProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary-500 hover:bg-primary-600'
                }`}
              >
                {isImageProcessing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                <span>{isImageProcessing ? 'Memproses...' : 'Simpan'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {showSliderModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-start sm:justify-center sm:p-4 overflow-y-auto animate-fadeIn" onClick={closeSliderModal}>
          <div className="bg-white w-full sm:rounded-2xl sm:max-w-lg sm:my-8 rounded-t-2xl animate-slideUp sm:animate-scaleIn max-h-[92vh] sm:max-h-none flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100 shrink-0">
              <h3 className="text-base sm:text-lg font-bold text-gray-900">{editingSlideId ? 'Edit Slide' : 'Tambah Slide'}</h3>
              <button onClick={closeSliderModal} className="p-2 hover:bg-gray-100 rounded-lg"><X className="h-5 w-5 text-gray-500" /></button>
            </div>
            <div className="p-4 sm:p-6 space-y-3 sm:space-y-4 overflow-y-auto flex-1">
              {sliderError && (
                <div className="p-3 bg-red-50 text-red-700 text-xs sm:text-sm rounded-xl border border-red-200">
                  {sliderError}
                </div>
              )}
              {/* Mode Tampilan Slide: Gambar & Teks vs Hanya Gambar */}
              <div className="bg-gray-50 rounded-2xl p-3 sm:p-4 border border-gray-200 space-y-2.5">
                <label className="text-xs sm:text-sm font-bold text-gray-900 block">
                  Mode Tampilan Konten Slide
                </label>
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => setSliderForm({ ...sliderForm, showText: true })}
                    className={`flex items-start gap-2.5 p-3 rounded-xl border text-left transition-all ${
                      sliderForm.showText !== false
                        ? 'border-primary-500 bg-primary-50 text-primary-900 font-semibold shadow-sm ring-1 ring-primary-500'
                        : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Type className="h-4 w-4 shrink-0 text-primary-600 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold leading-tight">Gambar & Teks</p>
                      <p className="text-[10px] text-gray-500 mt-0.5 leading-snug">Menampilkan judul, subtitle, dan tombol aksi di atas gambar</p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSliderForm({
                        ...sliderForm,
                        showText: false,
                        overlayOpacity: sliderForm.overlayOpacity === 70 ? 0 : sliderForm.overlayOpacity,
                      });
                    }}
                    className={`flex items-start gap-2.5 p-3 rounded-xl border text-left transition-all ${
                      sliderForm.showText === false
                        ? 'border-primary-500 bg-primary-50 text-primary-900 font-semibold shadow-sm ring-1 ring-primary-500'
                        : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Image className="h-4 w-4 shrink-0 text-primary-600 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold leading-tight">Hanya Gambar</p>
                      <p className="text-[10px] text-gray-500 mt-0.5 leading-snug">Banner grafis murni, teks & tombol tidak ditampilkan</p>
                    </div>
                  </button>
                </div>
                {sliderForm.showText === false && (
                  <p className="text-[11px] text-amber-800 bg-amber-50 p-2.5 rounded-xl border border-amber-200 leading-relaxed">
                    💡 <strong>Mode Hanya Gambar</strong> sangat cocok untuk poster, flyer PPDB, atau banner acara yang di gambarnya sudah terdapat teks tulisan. Teks judul di bawah hanya digunakan sebagai nama arsip di dashboard admin.
                  </p>
                )}
              </div>

              <div>
                <label className={labelCls}>
                  {sliderForm.showText === false ? 'Judul / Nama Slide (Label Arsip Admin) *' : 'Judul Slide *'}
                </label>
                <input
                  type="text"
                  value={sliderForm.title}
                  onChange={e => setSliderForm({ ...sliderForm, title: e.target.value })}
                  className={inputCls}
                  placeholder={sliderForm.showText === false ? 'Contoh: Banner Brosur PPDB' : 'Contoh: Berilmu, Beramal, Bertakwa'}
                />
              </div>

              {sliderForm.showText !== false && (
                <div>
                  <label className={labelCls}>Subtitle</label>
                  <textarea
                    rows={2}
                    value={sliderForm.subtitle}
                    onChange={e => setSliderForm({ ...sliderForm, subtitle: e.target.value })}
                    className={inputCls + ' resize-none'}
                    placeholder="Deskripsi singkat slide..."
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 sm:gap-4">
                <div>
                  <label className={labelCls}>
                    {sliderForm.showText === false ? 'Teks Tombol (Opsional)' : 'Teks Tombol'}
                  </label>
                  <input
                    type="text"
                    value={sliderForm.buttonText}
                    onChange={e => setSliderForm({ ...sliderForm, buttonText: e.target.value })}
                    className={inputCls}
                    placeholder="Pelajari Selengkapnya"
                  />
                </div>
                <div>
                  <label className={labelCls}>
                    {sliderForm.showText === false ? 'Link Banner (Klik Gambar)' : 'Link Tombol'}
                  </label>
                  <input
                    type="text"
                    value={sliderForm.buttonLink}
                    onChange={e => setSliderForm({ ...sliderForm, buttonLink: e.target.value })}
                    className={inputCls}
                    placeholder="/kontak atau https://..."
                  />
                </div>
              </div>

              <div>
                <label className={labelCls}>Gambar Latar</label>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center">
                  {isImageProcessing ? (
                    <div className="py-4 flex flex-col items-center justify-center gap-2">
                      <div className="h-6 w-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                      <p className="text-xs text-gray-500 font-medium">Sedang memproses dan mengompres gambar...</p>
                    </div>
                  ) : sliderForm.image ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="relative inline-block">
                        <img src={sliderForm.image} alt="" className="h-28 rounded-lg object-cover" />
                        <button onClick={() => setSliderForm({ ...sliderForm, image: '' })} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md">
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                      <ImageStorageBadge url={sliderForm.image} />
                    </div>
                  ) : (
                    <label className="cursor-pointer"><ImagePlus className="h-10 w-10 text-gray-300 mx-auto mb-1" /><p className="text-xs text-gray-500">Upload gambar (maks 2MB)</p><input type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(e, setSliderForm)} /></label>
                  )}
                </div>
                <p className="mt-2 text-[11px] text-gray-400">Jika gambar tidak diisi, slide akan menggunakan warna background yang dipilih di bawah.</p>
              </div>
              <div>
                <label className={labelCls}>Warna Background Saat Tanpa Gambar</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={sliderForm.backgroundColor || '#0f766e'}
                    onChange={e => setSliderForm({ ...sliderForm, backgroundColor: e.target.value })}
                    className="h-11 w-14 rounded-xl border border-gray-200 bg-white p-1"
                  />
                  <input
                    type="text"
                    value={sliderForm.backgroundColor || '#0f766e'}
                    onChange={e => setSliderForm({ ...sliderForm, backgroundColor: e.target.value })}
                    className={inputCls}
                    placeholder="#0f766e"
                  />
                </div>
              </div>

              {/* Slider Overlay & Transparency Setting */}
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs sm:text-sm font-bold text-gray-900 flex items-center gap-1.5">
                    <Sliders className="h-4 w-4 text-primary-600" />
                    Transparansi / Opasitas Overlay Lapisan Gelap
                  </label>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-primary-100 text-primary-700">
                    {sliderForm.overlayOpacity ?? (sliderForm.showText === false ? 0 : 70)}%
                  </span>
                </div>

                <p className="text-[11px] text-gray-500 leading-relaxed">
                  Mengatur kepekatan lapisan gelap di atas gambar slide. Semakin rendah angkanya (misal 0% - 30%), gambar semakin terang dan jelas. Semakin tinggi (misal 70% - 85%), lapisan semakin gelap agar teks putih di atasnya sangat kontras dan mudah dibaca.
                </p>

                {/* Range Slider */}
                <div className="space-y-1">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={sliderForm.overlayOpacity ?? (sliderForm.showText === false ? 0 : 70)}
                    onChange={e => setSliderForm({ ...sliderForm, overlayOpacity: Number(e.target.value) })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                  />
                  <div className="flex justify-between text-[10px] text-gray-400 font-medium">
                    <span>0% (Bening / Tanpa Overlay)</span>
                    <span>50% (Sedang)</span>
                    <span>100% (Sangat Gelap)</span>
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-[10px] text-gray-500 font-medium mr-1">Preset Cepat:</span>
                  {[
                    { label: '0% Bening', value: 0 },
                    { label: '30% Tipis', value: 30 },
                    { label: '50% Sedang', value: 50 },
                    { label: '70% Standar', value: 70 },
                    { label: '85% Gelap', value: 85 },
                  ].map(preset => (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => setSliderForm({ ...sliderForm, overlayOpacity: preset.value })}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                        (sliderForm.overlayOpacity ?? (sliderForm.showText === false ? 0 : 70)) === preset.value
                          ? 'bg-primary-600 text-white shadow-sm'
                          : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                {/* Live Preview Box */}
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                      Live Preview Slide:
                    </p>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      sliderForm.showText === false ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {sliderForm.showText === false ? 'Mode: Hanya Gambar' : 'Mode: Gambar & Teks'}
                    </span>
                  </div>
                  <div className="relative h-28 rounded-xl overflow-hidden border border-gray-200 bg-gray-900 shadow-inner flex items-center justify-center p-3 text-center">
                    {sliderForm.image ? (
                      <img src={sliderForm.image} alt="" className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                      <div
                        className="absolute inset-0"
                        style={{
                          background: `linear-gradient(120deg, ${sliderForm.backgroundColor || '#0f766e'}, #064e3b)`,
                        }}
                      />
                    )}
                    <div
                      className="absolute inset-0 bg-gradient-to-r from-primary-950 via-primary-900 to-primary-800 transition-opacity duration-200"
                      style={{ opacity: (sliderForm.overlayOpacity ?? (sliderForm.showText === false ? 0 : 70)) / 100 }}
                    />
                    {sliderForm.showText === false ? (
                      <div className="relative z-10 px-3 py-1 bg-black/60 backdrop-blur-xs rounded-full text-white text-[10px] font-semibold flex items-center gap-1.5 border border-white/20">
                        <Image className="h-3 w-3 text-amber-300" />
                        <span>Hanya Gambar Visual (Teks & Tombol Disembunyikan)</span>
                      </div>
                    ) : (
                      <div className="relative z-10 max-w-xs text-white">
                        <p className="text-xs font-bold line-clamp-1 drop-shadow-sm">
                          {sliderForm.title || 'Contoh Judul Slide'}
                        </p>
                        <p className="text-[10px] text-primary-200 line-clamp-1 drop-shadow-sm mt-0.5">
                          {sliderForm.subtitle || 'Preview keterbacaan teks di atas gambar'}
                        </p>
                        {sliderForm.buttonText && (
                          <span className="inline-block mt-1.5 px-2 py-0.5 bg-accent-400 text-primary-950 rounded text-[9px] font-bold shadow">
                            {sliderForm.buttonText}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 sm:gap-3 p-4 sm:p-6 border-t border-gray-100 shrink-0">
              <button onClick={closeSliderModal} className="px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium">Batal</button>
              <button
                onClick={saveSlider}
                disabled={isImageProcessing}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold shadow-md transition-all"
              >
                <Save className="h-4 w-4" /> {isImageProcessing ? 'Memproses...' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Instagram Post Modal */}
      {showInstagramModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-start sm:justify-center sm:p-4 overflow-y-auto animate-fadeIn" onClick={() => setShowInstagramModal(false)}>
          <div className="bg-white w-full sm:rounded-2xl sm:max-w-lg sm:my-8 rounded-t-2xl animate-slideUp sm:animate-scaleIn max-h-[92vh] sm:max-h-none flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100 shrink-0">
              <h3 className="text-base sm:text-lg font-bold text-gray-900">{editingInstagramId ? 'Edit Postingan' : 'Tambah Postingan'}</h3>
              <button onClick={() => setShowInstagramModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="h-5 w-5 text-gray-500" /></button>
            </div>
            <div className="p-4 sm:p-6 space-y-3 sm:space-y-4 overflow-y-auto flex-1">
              <div>
                <label className={labelCls}><Link2 className="inline h-3.5 w-3.5 mr-1" />URL Postingan Instagram *</label>
                <input type="url" value={instagramForm.postUrl} onChange={e => setInstagramForm({ ...instagramForm, postUrl: e.target.value })} className={inputCls} placeholder="https://www.instagram.com/p/ABC123/" />
                <p className="text-[10px] text-gray-400 mt-1">Buka Instagram → pilih postingan → ⋯ → "Salin Tautan"</p>
              </div>
              <div>
                <label className={labelCls}>Caption / Keterangan</label>
                <textarea rows={3} value={instagramForm.caption} onChange={e => setInstagramForm({ ...instagramForm, caption: e.target.value })} className={inputCls + ' resize-none'} placeholder="Caption yang ditampilkan..." />
              </div>
              <div className="grid grid-cols-2 gap-2 sm:gap-4">
                <div>
                  <label className={labelCls}><Heart className="inline h-3.5 w-3.5 mr-1" />Jumlah Likes</label>
                  <input type="text" value={instagramForm.likes} onChange={e => setInstagramForm({ ...instagramForm, likes: e.target.value })} className={inputCls} placeholder="128" />
                </div>
                <div>
                  <label className={labelCls}>Tanggal</label>
                  <input type="date" value={instagramForm.date} onChange={e => setInstagramForm({ ...instagramForm, date: e.target.value })} className={inputCls} />
                </div>
              </div>
              <div>
                <label className={labelCls}>Thumbnail / Gambar Postingan</label>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center">
                  {instagramForm.thumbnail ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="relative inline-block">
                        <img src={instagramForm.thumbnail} alt="" className="h-32 rounded-lg object-cover" />
                        <button onClick={() => setInstagramForm({ ...instagramForm, thumbnail: '' })} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md">
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                      <ImageStorageBadge url={instagramForm.thumbnail} />
                    </div>
                  ) : (
                    <label className="cursor-pointer"><ImagePlus className="h-10 w-10 text-gray-300 mx-auto mb-1" /><p className="text-xs text-gray-500">Screenshot postingan (maks 2MB)</p><input type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(e, setInstagramForm, 'thumbnail')} /></label>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3 border border-gray-100">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={instagramForm.isEmbed} onChange={e => setInstagramForm({ ...instagramForm, isEmbed: e.target.checked })} className="sr-only peer" />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-pink-500"></div>
                </label>
                <div>
                  <span className="text-xs sm:text-sm text-gray-700 font-medium">Gunakan Embed Instagram</span>
                  <p className="text-[10px] text-gray-400">Aktifkan jika ingin menampilkan postingan langsung dari Instagram</p>
                </div>
              </div>
              {instagramForm.isEmbed && (
                <div>
                  <label className={labelCls}>Kode Embed</label>
                  <textarea rows={4} value={instagramForm.embedCode} onChange={e => setInstagramForm({ ...instagramForm, embedCode: e.target.value })} className={inputCls + ' resize-none font-mono text-xs'} placeholder='<blockquote class="instagram-media" ...' />
                  <p className="text-[10px] text-gray-400 mt-1">Buka Instagram Web → postingan → ⋯ → "Embed" → salin kode embed</p>
                </div>
              )}
            </div>
            <div className="flex items-center justify-end gap-2 sm:gap-3 p-4 sm:p-6 border-t border-gray-100 shrink-0">
              <button onClick={() => setShowInstagramModal(false)} className="px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium">Batal</button>
              <button onClick={saveInstagram} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl text-sm font-semibold shadow-md"><Save className="h-4 w-4" /> Simpan</button>
            </div>
          </div>
        </div>
      )}

      {showSponsorModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-start sm:justify-center sm:p-4 overflow-y-auto animate-fadeIn" onClick={() => setShowSponsorModal(false)}>
          <div className="bg-white w-full sm:rounded-2xl sm:max-w-lg sm:my-8 rounded-t-2xl animate-slideUp sm:animate-scaleIn max-h-[92vh] sm:max-h-none flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100 shrink-0">
              <h3 className="text-base sm:text-lg font-bold text-gray-900">{editingSponsorId ? 'Edit Sponsor/Mitra' : 'Tambah Sponsor/Mitra'}</h3>
              <button onClick={() => setShowSponsorModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="h-5 w-5 text-gray-500" /></button>
            </div>
            <div className="p-4 sm:p-6 space-y-3 sm:space-y-4 overflow-y-auto flex-1">
              {sponsorError && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-700 rounded-xl px-3 py-2 text-xs sm:text-sm">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>{sponsorError}</span>
                </div>
              )}
              <div>
                <label htmlFor="sponsor-name" className={labelCls}>Nama Sponsor *</label>
                <input id="sponsor-name" type="text" value={sponsorForm.name} onChange={e => setSponsorForm({ ...sponsorForm, name: e.target.value })} className={inputCls} placeholder="Contoh: Bank Jatim" />
              </div>
              <div>
                <label htmlFor="sponsor-url" className={labelCls}>URL Website (opsional)</label>
                <input id="sponsor-url" type="url" value={sponsorForm.url} onChange={e => setSponsorForm({ ...sponsorForm, url: e.target.value })} className={inputCls} placeholder="https://..." />
              </div>
              <div>
                <label className={labelCls}>Logo Sponsor</label>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center">
                  {sponsorForm.logo ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="relative inline-block">
                        <img src={sponsorForm.logo} alt="" className="h-20 rounded-lg object-contain bg-gray-50 p-2" />
                        <button onClick={() => setSponsorForm({ ...sponsorForm, logo: '' })} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md">
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                      <ImageStorageBadge url={sponsorForm.logo} />
                    </div>
                  ) : (
                    <label className="cursor-pointer">
                      <ImagePlus className="h-10 w-10 text-gray-300 mx-auto mb-1" />
                      <p className="text-xs text-gray-500">Upload logo (maks 2MB)</p>
                      <input type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(e, setSponsorForm, 'logo')} />
                    </label>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 sm:gap-3 p-4 sm:p-6 border-t border-gray-100 shrink-0">
              <button onClick={() => setShowSponsorModal(false)} className="px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium">Batal</button>
              <button onClick={saveSponsor} className="flex items-center gap-2 px-5 py-2.5 bg-primary-500 text-white rounded-xl text-sm font-semibold shadow-md"><Save className="h-4 w-4" /> Simpan Sponsor</button>
            </div>
          </div>
        </div>
      )}

      {showGuruModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-start sm:justify-center sm:p-4 overflow-y-auto animate-fadeIn" onClick={() => setShowGuruModal(false)}>
          <div className="bg-white w-full sm:rounded-2xl sm:max-w-lg sm:my-8 rounded-t-2xl animate-slideUp sm:animate-scaleIn max-h-[92vh] sm:max-h-none flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100 shrink-0">
              <h3 className="text-base sm:text-lg font-bold text-gray-900">{editingGuruId ? 'Edit Guru/Karyawan' : 'Tambah Guru/Karyawan'}</h3>
              <button onClick={() => setShowGuruModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="h-5 w-5 text-gray-500" /></button>
            </div>
            <div className="p-4 sm:p-6 space-y-3 sm:space-y-4 overflow-y-auto flex-1">
              {guruError && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-700 rounded-xl px-3 py-2 text-xs sm:text-sm">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>{guruError}</span>
                </div>
              )}
              <div>
                <label htmlFor="guru-name" className={labelCls}>Nama Lengkap *</label>
                <input id="guru-name" type="text" value={guruForm.name} onChange={e => setGuruForm({ ...guruForm, name: e.target.value })} className={inputCls} placeholder="Contoh: Ahmad Faiq Fazaudin" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="guru-position" className={labelCls}>Jabatan</label>
                  <input id="guru-position" type="text" value={guruForm.position} onChange={e => setGuruForm({ ...guruForm, position: e.target.value })} className={inputCls} placeholder="Kepala Madrasah" />
                </div>
                <div>
                  <label htmlFor="guru-gender" className={labelCls}>Jenis Kelamin</label>
                  <select id="guru-gender" value={guruForm.gender} onChange={e => setGuruForm({ ...guruForm, gender: e.target.value as 'L' | 'P' })} className={inputCls}>
                    <option value="L">Laki-Laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="guru-subject" className={labelCls}>Guru Mapel</label>
                <input id="guru-subject" type="text" value={guruForm.subject} onChange={e => setGuruForm({ ...guruForm, subject: e.target.value })} className={inputCls} placeholder="Matematika" />
              </div>
              <div>
                <label htmlFor="guru-education" className={labelCls}>Pendidikan</label>
                <input id="guru-education" type="text" value={guruForm.education} onChange={e => setGuruForm({ ...guruForm, education: e.target.value })} className={inputCls} placeholder="S1 Pendidikan Matematika" />
              </div>
              <div>
                <label htmlFor="guru-phone" className={labelCls}>No. Telepon</label>
                <input id="guru-phone" type="text" value={guruForm.phone} onChange={e => setGuruForm({ ...guruForm, phone: e.target.value })} className={inputCls} placeholder="0852-3092-6049" />
              </div>
              <div>
                <label className={labelCls}>Foto Guru</label>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center">
                  {guruForm.photo ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="relative inline-block">
                        <img src={guruForm.photo} alt="" className="h-24 w-24 rounded-full object-cover bg-gray-50" />
                        <button onClick={() => setGuruForm({ ...guruForm, photo: '' })} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md">
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                      <ImageStorageBadge url={guruForm.photo} />
                    </div>
                  ) : (
                    <label className="cursor-pointer">
                      <ImagePlus className="h-10 w-10 text-gray-300 mx-auto mb-1" />
                      <p className="text-xs text-gray-500">Upload foto (max 10MB)</p>
                      <input type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(e, setGuruForm, 'photo')} />
                    </label>
                  )}
                </div>
              </div>
              <div>
                <p className={labelCls}>Media Sosial (opsional)</p>
                <div className="space-y-2">
                  <input type="url" value={guruForm.socialMedia?.facebook || ''} onChange={e => setGuruForm({ ...guruForm, socialMedia: { ...guruForm.socialMedia, facebook: e.target.value } })} className={inputCls} placeholder="Facebook: https://facebook.com/..." />
                  <input type="url" value={guruForm.socialMedia?.instagram || ''} onChange={e => setGuruForm({ ...guruForm, socialMedia: { ...guruForm.socialMedia, instagram: e.target.value } })} className={inputCls} placeholder="Instagram: https://instagram.com/..." />
                  <input type="url" value={guruForm.socialMedia?.youtube || ''} onChange={e => setGuruForm({ ...guruForm, socialMedia: { ...guruForm.socialMedia, youtube: e.target.value } })} className={inputCls} placeholder="YouTube: https://youtube.com/..." />
                  <input type="text" value={guruForm.socialMedia?.whatsapp || ''} onChange={e => setGuruForm({ ...guruForm, socialMedia: { ...guruForm.socialMedia, whatsapp: e.target.value } })} className={inputCls} placeholder="WhatsApp: 0852-3092-6049" />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 sm:gap-3 p-4 sm:p-6 border-t border-gray-100 shrink-0">
              <button onClick={() => setShowGuruModal(false)} className="px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium">Batal</button>
              <button onClick={saveGuru} className="flex items-center gap-2 px-5 py-2.5 bg-primary-500 text-white rounded-xl text-sm font-semibold shadow-md"><Save className="h-4 w-4" /> Simpan Guru</button>
            </div>
          </div>
        </div>
      )}

      {showEskulModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-start sm:justify-center sm:p-4 overflow-y-auto animate-fadeIn" onClick={() => setShowEskulModal(false)}>
          <div className="bg-white w-full sm:rounded-2xl sm:max-w-lg sm:my-8 rounded-t-2xl animate-slideUp sm:animate-scaleIn max-h-[92vh] sm:max-h-none flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100 shrink-0">
              <h3 className="text-base sm:text-lg font-bold text-gray-900">{editingEskulId ? 'Edit Ekstrakurikuler' : 'Tambah Ekstrakurikuler'}</h3>
              <button onClick={() => setShowEskulModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="h-5 w-5 text-gray-500" /></button>
            </div>
            <div className="p-4 sm:p-6 space-y-3 sm:space-y-4 overflow-y-auto flex-1">
              {eskulError && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-700 rounded-xl px-3 py-2 text-xs sm:text-sm">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>{eskulError}</span>
                </div>
              )}
              <div>
                <label htmlFor="eskul-name" className={labelCls}>Nama Ekstrakurikuler *</label>
                <input id="eskul-name" type="text" value={eskulForm.name} onChange={e => setEskulForm({ ...eskulForm, name: e.target.value })} className={inputCls} placeholder="Contoh: Pramuka (Gugus Depan)" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="eskul-category" className={labelCls}>Kategori</label>
                  <select id="eskul-category" value={eskulForm.category} onChange={e => setEskulForm({ ...eskulForm, category: e.target.value })} className={inputCls}>
                    {eskulCategories.filter(c => c !== 'Semua').map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="eskul-coach" className={labelCls}>Pembina / Pelatih</label>
                  <input id="eskul-coach" type="text" value={eskulForm.coach} onChange={e => setEskulForm({ ...eskulForm, coach: e.target.value })} className={inputCls} placeholder="Kak Ahmad Zaini, S.Pd" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="eskul-schedule" className={labelCls}>Jadwal Kegiatan</label>
                  <input id="eskul-schedule" type="text" value={eskulForm.schedule} onChange={e => setEskulForm({ ...eskulForm, schedule: e.target.value })} className={inputCls} placeholder="Jumat, 14:00 - 16:30 WIB" />
                </div>
                <div>
                  <label htmlFor="eskul-location" className={labelCls}>Lokasi</label>
                  <input id="eskul-location" type="text" value={eskulForm.location} onChange={e => setEskulForm({ ...eskulForm, location: e.target.value })} className={inputCls} placeholder="Halaman Utama" />
                </div>
              </div>
              <div>
                <label htmlFor="eskul-desc" className={labelCls}>Deskripsi</label>
                <textarea id="eskul-desc" rows={3} value={eskulForm.description} onChange={e => setEskulForm({ ...eskulForm, description: e.target.value })} className={inputCls + ' resize-none'} placeholder="Jelaskan tujuan dan kegiatan ekstrakurikuler..." />
              </div>
              <div>
                <label className={labelCls}>Foto / Banner Eskul</label>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center">
                  {eskulForm.image ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="relative inline-block">
                        <img src={eskulForm.image} alt="" className="h-28 rounded-xl object-cover bg-gray-50 border border-gray-100" />
                        <button onClick={() => setEskulForm({ ...eskulForm, image: '' })} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md">
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                      <ImageStorageBadge url={eskulForm.image} />
                    </div>
                  ) : (
                    <label className="cursor-pointer">
                      <ImagePlus className="h-10 w-10 text-gray-300 mx-auto mb-1" />
                      <p className="text-xs text-gray-500">Upload foto/logo eskul (max 10MB)</p>
                      <input type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(e, setEskulForm, 'image')} />
                    </label>
                  )}
                </div>
              </div>

              {/* Tautan Album Galeri & Sinkronisasi */}
              <div className="bg-primary-50/50 rounded-xl p-3.5 border border-primary-100 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="eskul-gallery" className="text-xs sm:text-sm font-bold text-gray-900 flex items-center gap-1.5">
                    <Camera className="h-4 w-4 text-primary-600" />
                    <span>Tautkan ke Galeri Dokumentasi</span>
                  </label>
                  {eskulForm.galleryId && (
                    <button
                      type="button"
                      onClick={syncPhotoFromGallery}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary-700 bg-white hover:bg-primary-50 px-2 py-0.5 rounded-lg border border-primary-200 shadow-sm transition-colors"
                      title="Salin foto cover dari album galeri ini ke foto eskul"
                    >
                      <RefreshCw className="h-3 w-3 text-primary-600" />
                      <span>Sinkronkan Foto Galeri</span>
                    </button>
                  )}
                </div>
                <select
                  id="eskul-gallery"
                  value={eskulForm.galleryId || ''}
                  onChange={e => setEskulForm({ ...eskulForm, galleryId: e.target.value })}
                  className={inputCls + ' bg-white'}
                >
                  <option value="">-- Tidak Ditautkan ke Galeri --</option>
                  {gallery.filter(g => g.mediaType !== 'video').map(g => {
                    const pCount = (g.images && g.images.length > 0) ? g.images.length : (g.image ? 1 : 0);
                    return (
                      <option key={g.id} value={g.id}>
                        {g.title} ({pCount} Foto - {g.category})
                      </option>
                    );
                  })}
                </select>
                {eskulForm.galleryId && (() => {
                  const linked = gallery.find(g => g.id === eskulForm.galleryId);
                  if (!linked) return null;
                  const pCount = (linked.images && linked.images.length > 0) ? linked.images.length : (linked.image ? 1 : 0);
                  return (
                    <div className="flex items-center gap-2.5 p-2 bg-white rounded-lg border border-primary-100 text-xs">
                      {linked.image || (linked.images && linked.images[0]) ? (
                        <img src={linked.image || linked.images?.[0]} alt="" className="w-10 h-10 rounded-lg object-cover border border-gray-200 shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center text-primary-600 font-bold shrink-0">
                          <Camera className="h-5 w-5" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-gray-900 truncate">{linked.title}</p>
                        <p className="text-[11px] text-gray-500">{pCount} foto di album • Terhubung ke profil publik eskul</p>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Prestasi List */}
              <div>
                <label className={labelCls}>Daftar Prestasi (opsional)</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newAchievementText}
                    onChange={e => setNewAchievementText(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addAchievement(); } }}
                    placeholder="Ketik prestasi lalu klik Tambah..."
                    className={inputCls}
                  />
                  <button
                    type="button"
                    onClick={addAchievement}
                    className="px-3 py-2 bg-primary-600 text-white rounded-xl text-xs font-semibold hover:bg-primary-700 shrink-0"
                  >
                    Tambah
                  </button>
                </div>
                {eskulForm.achievements && eskulForm.achievements.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {eskulForm.achievements.map((ach, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-800 text-xs rounded-lg border border-amber-200">
                        <Award className="h-3 w-3 text-amber-600" />
                        <span>{ach}</span>
                        <button type="button" onClick={() => removeAchievement(idx)} className="text-amber-500 hover:text-red-600 ml-1">
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Status Aktif */}
              <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3 border border-gray-100">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={eskulForm.isActive} onChange={e => setEskulForm({ ...eskulForm, isActive: e.target.checked })} className="sr-only peer" />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
                </label>
                <div>
                  <span className="text-xs sm:text-sm text-gray-700 font-medium">Status Aktif</span>
                  <p className="text-[10px] text-gray-400">Tampilkan kegiatan ini pada website publik</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 sm:gap-3 p-4 sm:p-6 border-t border-gray-100 shrink-0">
              <button onClick={() => setShowEskulModal(false)} className="px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium">Batal</button>
              <button onClick={saveEskul} className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-semibold shadow-md hover:bg-primary-700"><Save className="h-4 w-4" /> {editingEskulId ? 'Perbarui Eskul' : 'Simpan Eskul'}</button>
            </div>
          </div>
        </div>
      )}

      {showDownloadModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 animate-fadeIn" onClick={() => setShowDownloadModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-5 sm:p-6 animate-scaleIn" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-3 mb-5">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900">{editingDownloadId ? 'Edit Dokumen Download' : 'Tambah Dokumen Download'}</h3>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">Masukkan informasi dokumen dan tempel link Google Drive.</p>
              </div>
              <button onClick={() => setShowDownloadModal(false)} className="p-2 rounded-lg hover:bg-gray-100">
                <X className="h-4 w-4 text-gray-500" />
              </button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className={labelCls}>Nama Dokumen</label>
                <input type="text" value={downloadForm.title} onChange={e => setDownloadForm({ ...downloadForm, title: e.target.value })} className={inputCls} placeholder="Contoh: Formulir Pendaftaran Ulang" />
              </div>
              <div>
                <label className={labelCls}>Kategori</label>
                <input type="text" value={downloadForm.category} onChange={e => setDownloadForm({ ...downloadForm, category: e.target.value })} className={inputCls} placeholder="Umum / PPDB / Akademik" />
              </div>
              <div>
                <label className={labelCls}>Jenis File</label>
                <input type="text" value={downloadForm.fileType} onChange={e => setDownloadForm({ ...downloadForm, fileType: e.target.value })} className={inputCls} placeholder="PDF, DOCX, XLSX" />
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls}>Keterangan Singkat</label>
                <textarea rows={3} value={downloadForm.description} onChange={e => setDownloadForm({ ...downloadForm, description: e.target.value })} className={inputCls + ' resize-none'} placeholder="Jelaskan isi atau fungsi dokumen." />
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls}>Link Google Drive</label>
                <input type="url" value={downloadForm.googleDriveLink} onChange={e => setDownloadForm({ ...downloadForm, googleDriveLink: e.target.value })} className={inputCls} placeholder="https://drive.google.com/..." />
              </div>
              <div>
                <label className={labelCls}>Tanggal Update</label>
                <input type="date" value={downloadForm.publishedAt} onChange={e => setDownloadForm({ ...downloadForm, publishedAt: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Status Dokumen</label>
                <button
                  onClick={() => setDownloadForm({ ...downloadForm, isActive: !downloadForm.isActive })}
                  className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold ${downloadForm.isActive ? 'bg-primary-500 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}
                >
                  {downloadForm.isActive ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                  {downloadForm.isActive ? 'Dokumen Aktif' : 'Dokumen Nonaktif'}
                </button>
              </div>
            </div>
            {downloadError && <p className="mt-4 text-sm text-red-600">{downloadError}</p>}
            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowDownloadModal(false)} className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium">Batal</button>
              <button onClick={saveDownload} className="flex-1 px-4 py-2.5 bg-primary-500 text-white rounded-xl text-sm font-semibold">Simpan</button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 animate-fadeIn" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-5 sm:p-6 animate-scaleIn" onClick={e => e.stopPropagation()}>
            <div className="text-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Trash2 className="h-6 w-6 sm:h-7 sm:w-7 text-red-600" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1 sm:mb-2">Konfirmasi Hapus</h3>
              <p className="text-gray-500 text-xs sm:text-sm mb-4 sm:mb-6">Apakah Anda yakin ingin menghapus item ini?</p>
              <div className="flex gap-2 sm:gap-3">
                <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium">Batal</button>
                <button onClick={confirmDelete} className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl text-sm font-semibold">Hapus</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Kelola Kategori Galeri */}
      {showGalCatModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 overflow-y-auto animate-fadeIn" onClick={() => setShowGalCatModal(false)}>
          <div className="bg-white w-full max-w-md rounded-2xl p-5 shadow-2xl animate-scaleIn space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Tag className="h-4 w-4 text-primary-600" /> Kelola Kategori Galeri
              </h3>
              <button onClick={() => setShowGalCatModal(false)} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form Tambah Kategori */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newGalCatName}
                onChange={e => setNewGalCatName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddGalCat(); } }}
                placeholder="Nama kategori galeri baru..."
                className={inputCls}
              />
              <button
                type="button"
                onClick={handleAddGalCat}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-semibold shrink-0"
              >
                Tambah
              </button>
            </div>

            {/* List Kategori */}
            <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
              {galleryCategories.map(cat => {
                const isEditing = editingGalCat?.oldName === cat;
                return (
                  <div key={cat} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl border border-gray-100">
                    {isEditing ? (
                      <div className="flex items-center gap-2 flex-1 mr-2">
                        <input
                          type="text"
                          value={editingGalCat.newName}
                          onChange={e => setEditingGalCat({ ...editingGalCat, newName: e.target.value })}
                          className="w-full px-2 py-1 text-xs border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500"
                          autoFocus
                        />
                        <button onClick={handleUpdateGalCat} className="p-1 text-green-600 hover:bg-green-50 rounded" title="Simpan"><Save className="h-3.5 w-3.5" /></button>
                        <button onClick={() => setEditingGalCat(null)} className="p-1 text-gray-400 hover:bg-gray-100 rounded" title="Batal"><X className="h-3.5 w-3.5" /></button>
                      </div>
                    ) : (
                      <span className="text-xs sm:text-sm font-medium text-gray-800">{cat}</span>
                    )}
                    {!isEditing && (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setEditingGalCat({ oldName: cat, newName: cat })}
                          className="p-1.5 text-gray-500 hover:text-primary-600 hover:bg-white rounded-lg transition-colors"
                          title="Ubah nama"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteGalCat(cat)}
                          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-white rounded-lg transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="pt-2 border-t border-gray-100 flex justify-end">
              <button
                type="button"
                onClick={() => setShowGalCatModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 text-xs font-semibold rounded-xl hover:bg-gray-200"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Kelola Kategori Eskul */}
      {showEskulCatModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 overflow-y-auto animate-fadeIn" onClick={() => setShowEskulCatModal(false)}>
          <div className="bg-white w-full max-w-md rounded-2xl p-5 shadow-2xl animate-scaleIn space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Tag className="h-4 w-4 text-primary-600" /> Kelola Kategori Ekstrakurikuler
              </h3>
              <button onClick={() => setShowEskulCatModal(false)} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form Tambah Kategori */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newEskulCatName}
                onChange={e => setNewEskulCatName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddEskulCat(); } }}
                placeholder="Nama kategori eskul baru..."
                className={inputCls}
              />
              <button
                type="button"
                onClick={handleAddEskulCat}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-semibold shrink-0"
              >
                Tambah
              </button>
            </div>

            {/* List Kategori */}
            <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
              {eskulCategories.map(cat => {
                const isEditing = editingEskulCat?.oldName === cat;
                return (
                  <div key={cat} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl border border-gray-100">
                    {isEditing ? (
                      <div className="flex items-center gap-2 flex-1 mr-2">
                        <input
                          type="text"
                          value={editingEskulCat.newName}
                          onChange={e => setEditingEskulCat({ ...editingEskulCat, newName: e.target.value })}
                          className="w-full px-2 py-1 text-xs border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500"
                          autoFocus
                        />
                        <button onClick={handleUpdateEskulCat} className="p-1 text-green-600 hover:bg-green-50 rounded" title="Simpan"><Save className="h-3.5 w-3.5" /></button>
                        <button onClick={() => setEditingEskulCat(null)} className="p-1 text-gray-400 hover:bg-gray-100 rounded" title="Batal"><X className="h-3.5 w-3.5" /></button>
                      </div>
                    ) : (
                      <span className="text-xs sm:text-sm font-medium text-gray-800">{cat}</span>
                    )}
                    {!isEditing && (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setEditingEskulCat({ oldName: cat, newName: cat })}
                          className="p-1.5 text-gray-500 hover:text-primary-600 hover:bg-white rounded-lg transition-colors"
                          title="Ubah nama"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteEskulCat(cat)}
                          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-white rounded-lg transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="pt-2 border-t border-gray-100 flex justify-end">
              <button
                type="button"
                onClick={() => setShowEskulCatModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 text-xs font-semibold rounded-xl hover:bg-gray-200"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notifikasi & Progres Upload */}
      <AdminToastContainer toasts={toasts} onDismiss={dismissToast} />
      <UploadProgressBar
        uploadState={uploadState}
        onClose={() => setUploadState((prev) => ({ ...prev, isActive: false }))}
      />
    </div>
  );
}

/* ============================================
   SEO & ANALYTICS TAB (separated for clarity)
   ============================================ */
function SEOAnalyticsTab({
  seoForm, setSeoForm, saveSeo, seoSaved,
  analyticsData, resetAnalytics,
  inputCls, labelCls,
}: {
  seoForm: SEOData;
  setSeoForm: (s: SEOData) => void;
  saveSeo: () => void;
  seoSaved: boolean;
  analyticsData: import('../types').AnalyticsData;
  resetAnalytics: () => void;
  inputCls: string;
  labelCls: string;
}) {
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

/* ============================================
   DATABASE TAB (Storage + Backup/Restore)
   ============================================ */
const BACKUP_DATABASE_KEYS = [
  { key: SETTINGS_DB_KEYS.news, label: 'Berita', icon: '📰' },
  { key: SETTINGS_DB_KEYS.agenda, label: 'Agenda', icon: '📅' },
  { key: SETTINGS_DB_KEYS.gallery, label: 'Galeri', icon: '📷' },
  { key: SETTINGS_DB_KEYS.contact, label: 'Kontak', icon: '📞' },
  { key: SETTINGS_DB_KEYS.slider, label: 'Slider Hero', icon: '🖼️' },
  { key: SETTINGS_DB_KEYS.extracurricular, label: 'Ekstrakurikuler', icon: '🏆' },
  { key: SETTINGS_DB_KEYS.teachers, label: 'Data Guru', icon: '👨‍🏫' },
  { key: SETTINGS_DB_KEYS.galleryCategories, label: 'Kategori Galeri', icon: '🏷️' },
  { key: SETTINGS_DB_KEYS.eskulCategories, label: 'Kategori Eskul', icon: '🏷️' },
  { key: SETTINGS_DB_KEYS.profile, label: 'Profil', icon: '📋' },
  { key: SETTINGS_DB_KEYS.stats, label: 'Statistik', icon: '📊' },
  { key: SETTINGS_DB_KEYS.schoolIdentity, label: 'Identitas Sekolah', icon: '🧭' },
  { key: SETTINGS_DB_KEYS.brand, label: 'Logo Sekolah', icon: '🏫' },
  { key: SETTINGS_DB_KEYS.downloads, label: 'Dokumen Download', icon: '⬇️' },
  { key: SETTINGS_DB_KEYS.footer, label: 'Footer Credit', icon: '📝' },
  { key: SETTINGS_DB_KEYS.seo, label: 'SEO', icon: '🔍' },
  { key: SETTINGS_DB_KEYS.analytics, label: 'Analitik', icon: '📈' },
  { key: SETTINGS_DB_KEYS.instagram, label: 'Instagram', icon: '📸' },
  { key: SETTINGS_DB_KEYS.sponsors, label: 'Sponsor/Mitra', icon: '🤝' },
  { key: SETTINGS_DB_KEYS.smpbButton, label: 'Tombol SMPB', icon: '🎓' },
  { key: SETTINGS_DB_KEYS.auth, label: 'Keamanan Admin', icon: '🔐' },
] as const;

const MEDIA_FOLDER_META: Record<string, { label: string; icon: string }> = {
  gallery: { label: 'Galeri Kegiatan', icon: '📸' },
  teachers: { label: 'Guru & Karyawan', icon: '👨‍🏫' },
  news: { label: 'Berita & Artikel', icon: '📰' },
  slider: { label: 'Banner Beranda', icon: '🖼️' },
  profile: { label: 'Profil Madrasah', icon: '👤' },
  eskul: { label: 'Ekstrakurikuler', icon: '⚽' },
  brand: { label: 'Logo & Branding', icon: '🏷️' },
};

const INITIAL_SETUP_CONTENT_KEYS = [
  SETTINGS_DB_KEYS.news,
  SETTINGS_DB_KEYS.agenda,
  SETTINGS_DB_KEYS.gallery,
  SETTINGS_DB_KEYS.slider,
  SETTINGS_DB_KEYS.extracurricular,
] as const;

const INITIAL_SETUP_DEMO_VALUES: Record<string, unknown> = {
  [SETTINGS_DB_KEYS.news]: initialNews,
  [SETTINGS_DB_KEYS.agenda]: initialAgenda,
  [SETTINGS_DB_KEYS.gallery]: initialGallery,
  [SETTINGS_DB_KEYS.slider]: initialSliderItems,
  [SETTINGS_DB_KEYS.extracurricular]: initialExtracurricular,
  [SETTINGS_DB_KEYS.instagram]: initialInstagramSettings,
  [SETTINGS_DB_KEYS.sponsors]: initialSponsorsData,
};

function getSetupItemCount(key: string, value: unknown): number {
  if (Array.isArray(value)) return value.length;
  if (!value || typeof value !== 'object') return 0;

  if (key === SETTINGS_DB_KEYS.instagram) {
    const posts = (value as { posts?: unknown[] }).posts;
    return Array.isArray(posts) ? posts.length : 0;
  }

  if (key === SETTINGS_DB_KEYS.sponsors) {
    const sponsors = (value as { sponsors?: unknown[] }).sponsors;
    return Array.isArray(sponsors) ? sponsors.length : 0;
  }

  return 0;
}

function isSetupItemMissingOrEmpty(key: string, value: unknown): boolean {
  if (value === undefined || value === null) return true;
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

function DatabaseSettingsTab() {
  const [restoreStatus, setRestoreStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [restoreMessage, setRestoreMessage] = useState('');
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [backupInfo, setBackupInfo] = useState<{ date: string; size: string } | null>(null);
  const [showResetAllConfirm, setShowResetAllConfirm] = useState(false);
  const [settingsSnapshot, setSettingsSnapshot] = useState<Record<string, unknown>>({});
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [databaseStats, setDatabaseStats] = useState<DatabaseStorageStats | null>(null);
  const [databaseStatsError, setDatabaseStatsError] = useState('');
  const [isLoadingDatabaseStats, setIsLoadingDatabaseStats] = useState(false);
  const [databaseConnection, setDatabaseConnection] = useState<DatabaseConnectionStatus>({
    isConnected: false,
    source: 'unknown',
    message: 'Memeriksa koneksi database...',
  });
  const [isCheckingConnection, setIsCheckingConnection] = useState(false);
  const [isRunningInitialWebsiteSetup, setIsRunningInitialWebsiteSetup] = useState(false);
  const [isSyncingInitialSetup, setIsSyncingInitialSetup] = useState(false);
  const [isSeedingInitialDemo, setIsSeedingInitialDemo] = useState(false);
  const [isExportingBackup, setIsExportingBackup] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const refreshSettingsSnapshot = useCallback(async () => {
    setIsLoadingSettings(true);
    try {
      const keys = BACKUP_DATABASE_KEYS.map((item) => item.key);
      const data = await loadSettings(keys as string[]);
      setSettingsSnapshot(data);
    } catch {
      // ignore
    } finally {
      setIsLoadingSettings(false);
    }
  }, []);

  const refreshDatabaseStats = useCallback(async () => {
    setIsLoadingDatabaseStats(true);
    const stats = await getDatabaseStorageStats();
    if (!stats) {
      setDatabaseStatsError('Statistik database belum tersedia. Pastikan tabel settings di Supabase telah aktif.');
    } else {
      setDatabaseStats(stats);
      setDatabaseStatsError('');
    }
    setIsLoadingDatabaseStats(false);
  }, []);

  const refreshDatabaseConnection = useCallback(async () => {
    setIsCheckingConnection(true);
    const status = await checkDatabaseConnection();
    setDatabaseConnection(status);
    setIsCheckingConnection(false);
  }, []);

  useEffect(() => {
    void refreshSettingsSnapshot();
    void refreshDatabaseStats();
    void refreshDatabaseConnection();
  }, [refreshSettingsSnapshot, refreshDatabaseStats, refreshDatabaseConnection]);

  // Calculate storage usage
  const storageData = useMemo(() => {
    let totalSize = 0;
    const items = BACKUP_DATABASE_KEYS.map(({ key, label, icon }) => {
      const raw = settingsSnapshot[key];
      const data = raw !== undefined ? JSON.stringify(raw) : '';
      const size = data ? new Blob([data]).size : 0;
      totalSize += size;
      let count = 0;
      if (raw !== undefined) {
        try {
          const parsed = raw;
          if (Array.isArray(parsed)) count = parsed.length;
          else if (parsed && typeof parsed === 'object' && 'posts' in parsed && Array.isArray((parsed as { posts?: unknown[] }).posts)) {
            count = ((parsed as { posts?: unknown[] }).posts || []).length;
          } else if (parsed && typeof parsed === 'object') {
            count = Object.keys(parsed).length;
          }
        } catch { count = 0; }
      }
      return { key, label, icon, size, count, exists: raw !== undefined };
    });
    return { items, totalSize };
  }, [settingsSnapshot]);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const initialSetupSummary = useMemo(() => {
    if (isLoadingSettings) {
      return {
        pendingItems: [],
        hasSetupWarning: false,
        isFreshInstall: false,
      };
    }
    const labels = new Map(BACKUP_DATABASE_KEYS.map((item) => [item.key, item.label]));
    const items = INITIAL_SETUP_CONTENT_KEYS.map((key) => {
      const value = settingsSnapshot[key];
      return {
        key,
        label: labels.get(key) || key,
        count: getSetupItemCount(key, value),
        missingOrEmpty: isSetupItemMissingOrEmpty(key, value),
      };
    });
    const pendingItems = items.filter((item) => item.missingOrEmpty);

    return {
      pendingItems,
      hasSetupWarning: pendingItems.length > 0,
      isFreshInstall: pendingItems.length === items.length,
    };
  }, [isLoadingSettings, settingsSnapshot]);

  const refreshDatabasePanel = useCallback(async () => {
    await Promise.all([
      refreshSettingsSnapshot(),
      refreshDatabaseStats(),
      refreshDatabaseConnection(),
    ]);
  }, [refreshDatabaseConnection, refreshDatabaseStats, refreshSettingsSnapshot]);

  const handleSyncInitialSetup = async () => {
    setIsSyncingInitialSetup(true);
    setRestoreStatus('idle');
    setRestoreMessage('');

    try {
      await ensureDefaultSettings(DEFAULT_SETTINGS_BY_KEY);
      await refreshDatabasePanel();
      setRestoreStatus('success');
      setRestoreMessage('Sinkronisasi database selesai. Semua key settings wajib sudah dibuat dengan default aman.');
    } catch {
      setRestoreStatus('error');
      setRestoreMessage('Sinkronisasi gagal. Periksa koneksi database dan jalankan schema terbaru.');
    } finally {
      setIsSyncingInitialSetup(false);
    }
  };

  const handleSeedInitialDemo = async () => {
    const confirmed = window.confirm(
      'Isi data dummy awal hanya untuk section konten yang masih kosong. Data yang sudah ada tidak akan ditimpa. Lanjutkan?'
    );
    if (!confirmed) return;

    setIsSeedingInitialDemo(true);
    setRestoreStatus('idle');
    setRestoreMessage('');

    try {
      const currentSettings = await loadSettings([...INITIAL_SETUP_CONTENT_KEYS] as string[]);
      let seededCount = 0;

      for (const key of INITIAL_SETUP_CONTENT_KEYS) {
        if (!isSetupItemMissingOrEmpty(key, currentSettings[key])) continue;
        const saved = await saveSetting(key, INITIAL_SETUP_DEMO_VALUES[key]);
        if (saved) seededCount += 1;
      }

      await refreshDatabasePanel();

      setRestoreStatus('success');
      setRestoreMessage(
        seededCount > 0
          ? `Data dummy awal berhasil diisi untuk ${seededCount} section yang masih kosong.`
          : 'Tidak ada section kosong yang perlu diisi. Semua data utama sudah tersedia.'
      );
    } catch {
      setRestoreStatus('error');
      setRestoreMessage('Pengisian data dummy gagal. Periksa koneksi database lalu coba lagi.');
    } finally {
      setIsSeedingInitialDemo(false);
    }
  };

  const handleInitialWebsiteSetup = async () => {
    const confirmed = window.confirm(
      'Setup Awal Website akan menjalankan sinkronisasi key database lalu mengisi data dummy hanya pada section yang masih kosong. Data yang sudah ada tidak akan ditimpa. Lanjutkan?'
    );
    if (!confirmed) return;

    setIsRunningInitialWebsiteSetup(true);
    setRestoreStatus('idle');
    setRestoreMessage('');

    try {
      await ensureDefaultSettings(DEFAULT_SETTINGS_BY_KEY);

      const currentSettings = await loadSettings([...INITIAL_SETUP_CONTENT_KEYS] as string[]);
      let seededCount = 0;

      for (const key of INITIAL_SETUP_CONTENT_KEYS) {
        if (!isSetupItemMissingOrEmpty(key, currentSettings[key])) continue;
        const saved = await saveSetting(key, INITIAL_SETUP_DEMO_VALUES[key]);
        if (saved) seededCount += 1;
      }

      await refreshDatabasePanel();

      setRestoreStatus('success');
      setRestoreMessage(
        seededCount > 0
          ? `Setup awal website selesai. Key database berhasil disinkronkan dan ${seededCount} section kosong diisi data dummy.`
          : 'Setup awal website selesai. Key database berhasil disinkronkan dan tidak ada section kosong yang perlu diisi data dummy.'
      );
    } catch {
      setRestoreStatus('error');
      setRestoreMessage('Setup awal website gagal. Periksa koneksi database dan coba lagi.');
    } finally {
      setIsRunningInitialWebsiteSetup(false);
    }
  };

  // BACKUP - Export all data
  const handleBackup = async () => {
    setIsExportingBackup(true);
    try {
      const fallbackKeys = BACKUP_DATABASE_KEYS.map((item) => item.key as string);
      const { data: dbData, keys: exportedKeys, source } = await exportAllSettings(fallbackKeys);

      const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
      const backup: Record<string, unknown> = {
        _meta: {
          version: '2.0',
          date: new Date().toISOString(),
          app: 'Portal Sekolah CMS',
          school: schoolIdentity.schoolName || 'Sekolah',
          source,
          totalKeys: exportedKeys.length,
          keys: exportedKeys,
          mediaSummary: databaseStats
            ? {
                mediaSize: databaseStats.mediaSize,
                mediaFiles: databaseStats.mediaFiles,
                storageBucket: 'school-media',
              }
            : undefined,
        },
      };

      exportedKeys.forEach((key) => {
        if (dbData[key] !== undefined) {
          backup[key] = dbData[key];
        }
      });

      const jsonStr = JSON.stringify(backup, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup_sekolah_${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      const sizeFormatted = formatSize(blob.size);
      setBackupInfo({
        date: new Date().toLocaleString('id-ID'),
        size: sizeFormatted,
      });

      notifySaved(
        'Backup Berhasil Diunduh!',
        `File backup_sekolah_${dateStr}.json (${sizeFormatted}) berisi ${exportedKeys.length} data settings berhasil disimpan.`
      );
    } catch (err) {
      console.error('[Backup] Gagal mengunduh backup:', err);
      addToast({
        type: 'error',
        title: 'Backup Gagal',
        message: 'Terjadi kesalahan saat mengekspor data backup.',
      });
    } finally {
      setIsExportingBackup(false);
    }
  };

  // RESTORE - Import data from file
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith('.json')) {
      setRestoreStatus('error');
      setRestoreMessage('File harus berformat .json');
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      setRestoreStatus('error');
      setRestoreMessage('Ukuran file terlalu besar (maks 50MB)');
      return;
    }
    setPendingFile(file);
    setShowRestoreConfirm(true);
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const performRestore = () => {
    if (!pendingFile) return;
    setShowRestoreConfirm(false);

    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const content = ev.target?.result as string;
        const data = JSON.parse(content);

        // Validate backup file
        if (!data._meta) {
          setRestoreStatus('error');
          setRestoreMessage('File backup tidak valid — tidak memiliki metadata.');
          return;
        }

        let restoredCount = 0;
        const keysToRestore = Object.keys(data).filter((k) => k !== '_meta');
        const restoreOperations = keysToRestore.map(async (key) => {
          const success = await saveSetting(key, data[key]);
          if (success) restoredCount++;
        });
        await Promise.all(restoreOperations);
        await refreshSettingsSnapshot();
        await refreshDatabaseStats();
        await refreshDatabaseConnection();

        setRestoreStatus('success');
        setRestoreMessage(`Berhasil! ${restoredCount} data berhasil dipulihkan dari backup tanggal ${new Date(data._meta.date).toLocaleString('id-ID')}. Halaman akan dimuat ulang...`);

        // Reload page after 2.5 seconds to apply changes
        setTimeout(() => { window.location.reload(); }, 2500);
      } catch {
        setRestoreStatus('error');
        setRestoreMessage('Gagal membaca file. Pastikan file berformat JSON yang valid.');
      }
    };
    reader.onerror = () => {
      setRestoreStatus('error');
      setRestoreMessage('Gagal membaca file.');
    };
    reader.readAsText(pendingFile);
    setPendingFile(null);
  };

  // RESET ALL - Clear all data
  const handleResetAll = () => {
    void (async () => {
      const result = await resetSettingsToDefault(DEFAULT_SETTINGS_BY_KEY);
      if (!result.success) {
        setShowResetAllConfirm(false);
        setRestoreStatus('error');
        setRestoreMessage(result.message || 'Gagal reset data ke default.');
        return;
      }
      await refreshSettingsSnapshot();
      await refreshDatabaseStats();
      await refreshDatabaseConnection();
      setShowResetAllConfirm(false);
      setRestoreStatus('success');
      setRestoreMessage(`Reset berhasil: ${result.resetCount} key diatur ulang ke default${result.removedCount > 0 ? ` dan ${result.removedCount} key lama dihapus` : ''}. Halaman akan dimuat ulang...`);
      setTimeout(() => { window.location.reload(); }, 2500);
    })();
  };

  return (
    <div className="animate-fadeIn space-y-4 sm:space-y-6">
      <h2 className="text-lg sm:text-2xl font-extrabold text-gray-900">Database</h2>

      {/* Status Banner */}
      {restoreStatus !== 'idle' && (
        <div className={`rounded-xl p-3 sm:p-4 border flex items-start gap-3 animate-fadeIn ${
          restoreStatus === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
        }`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
            restoreStatus === 'success' ? 'bg-green-100' : 'bg-red-100'
          }`}>
            {restoreStatus === 'success'
              ? <CheckCircle className="h-4 w-4 text-green-600" />
              : <AlertTriangle className="h-4 w-4 text-red-600" />
            }
          </div>
          <div className="flex-1">
            <p className={`text-sm font-semibold ${restoreStatus === 'success' ? 'text-green-800' : 'text-red-800'}`}>
              {restoreStatus === 'success' ? 'Berhasil!' : 'Terjadi Kesalahan'}
            </p>
            <p className={`text-xs mt-0.5 ${restoreStatus === 'success' ? 'text-green-600' : 'text-red-600'}`}>
              {restoreMessage}
            </p>
          </div>
          <button onClick={() => setRestoreStatus('idle')} className="shrink-0 p-1 hover:bg-white/50 rounded">
            <X className="h-4 w-4 text-gray-400" />
          </button>
        </div>
      )}

      {initialSetupSummary.hasSetupWarning && (
        <div className={`rounded-xl sm:rounded-2xl p-4 sm:p-5 border ${
          initialSetupSummary.isFreshInstall
            ? 'bg-amber-50 border-amber-200'
            : 'bg-blue-50 border-blue-200'
        }`}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-gray-900 flex items-center gap-2">
                <AlertTriangle className={`h-4 w-4 sm:h-5 sm:w-5 ${
                  initialSetupSummary.isFreshInstall ? 'text-amber-600' : 'text-blue-600'
                }`} />
                {initialSetupSummary.isFreshInstall ? 'Fresh Install Terdeteksi' : 'Setup Awal Belum Lengkap'}
              </h3>
              <p className="text-xs sm:text-sm text-gray-700 mt-1 leading-relaxed">
                {initialSetupSummary.isFreshInstall
                  ? 'Konten utama website masih kosong. Lakukan sinkronisasi key settings lalu isi data dummy awal jika Anda ingin mendapatkan contoh konten untuk memulai.'
                  : 'Masih ada section konten yang kosong atau belum terbentuk. Sinkronisasi akan membuat key yang hilang, sedangkan data dummy hanya mengisi section kosong.'}
              </p>
              <p className="text-[11px] sm:text-xs text-gray-600 mt-2">
                Section perlu perhatian: {initialSetupSummary.pendingItems.map((item) => item.label).join(', ')}.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 shrink-0">
              <button
                type="button"
                onClick={() => void handleInitialWebsiteSetup()}
                disabled={isRunningInitialWebsiteSetup || isSyncingInitialSetup || isSeedingInitialDemo}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-green-600 text-white text-xs sm:text-sm font-semibold hover:bg-green-700 disabled:opacity-60"
              >
                <CheckCircle className={`h-4 w-4 ${isRunningInitialWebsiteSetup ? 'animate-pulse' : ''}`} />
                {isRunningInitialWebsiteSetup ? 'Menjalankan Setup...' : 'Setup Awal Website'}
              </button>
              <button
                type="button"
                onClick={() => void handleSyncInitialSetup()}
                disabled={isRunningInitialWebsiteSetup || isSyncingInitialSetup || isSeedingInitialDemo}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary-500 text-white text-xs sm:text-sm font-semibold hover:bg-primary-600 disabled:opacity-60"
              >
                <RefreshCw className={`h-4 w-4 ${isSyncingInitialSetup ? 'animate-spin' : ''}`} />
                Sinkronisasi Key
              </button>
              <button
                type="button"
                onClick={() => void handleSeedInitialDemo()}
                disabled={isRunningInitialWebsiteSetup || isSyncingInitialSetup || isSeedingInitialDemo}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 text-xs sm:text-sm font-semibold hover:bg-gray-50 disabled:opacity-60"
              >
                <Upload className={`h-4 w-4 ${isSeedingInitialDemo ? 'animate-pulse' : ''}`} />
                {isSeedingInitialDemo ? 'Mengisi Dummy...' : 'Isi Data Dummy Awal'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Database Connectivity */}
      <div className={`rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border ${
        databaseConnection.isConnected ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'
      }`}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-gray-900 flex items-center gap-2">
              <Database className={`h-4 w-4 sm:h-5 sm:w-5 ${databaseConnection.isConnected ? 'text-green-600' : 'text-amber-600'}`} />
              Konektivitas Database
            </h3>
            <p className={`text-xs sm:text-sm mt-1 ${
              databaseConnection.isConnected ? 'text-green-700' : 'text-amber-700'
            }`}>
              {databaseConnection.message}
            </p>
            <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
              Status: {databaseConnection.isConnected ? 'Terkoneksi ke Supabase Cloud (Active)' : 'Belum terkoneksi'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              void refreshDatabaseConnection();
              void refreshDatabaseStats();
            }}
            disabled={isCheckingConnection || isLoadingDatabaseStats}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2.5 text-[12px] sm:text-xs font-semibold text-white shadow-lg transition-all duration-200 active:scale-95 disabled:opacity-60 disabled:active:scale-100 cursor-pointer touch-manipulation select-none"
            style={{
              background: databaseConnection.isConnected
                ? 'linear-gradient(135deg, #059669, #10b981)'
                : 'linear-gradient(135deg, #d97706, #f59e0b)',
            }}
          >
            <RefreshCw
              className={`h-4 w-4 ${(isCheckingConnection || isLoadingDatabaseStats) ? 'animate-spin' : ''}`}
            />
            {isCheckingConnection ? 'Memeriksa...' : 'Cek Ulang'}
          </button>
        </div>

        {/* Supabase & Cloud Storage Info Badges */}
        <div className="mt-4 pt-3 border-t border-green-200/70 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="bg-white/80 rounded-xl p-2.5 border border-green-100 shadow-xs">
            <span className="text-gray-500 block text-[10px] font-medium">Provider Database</span>
            <span className="font-bold text-gray-800 flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
              Supabase Cloud
            </span>
          </div>
          <div className="bg-white/80 rounded-xl p-2.5 border border-green-100 shadow-xs">
            <span className="text-gray-500 block text-[10px] font-medium">Region Server</span>
            <span className="font-semibold text-gray-800 mt-0.5 block">Singapore (ap-southeast-1)</span>
          </div>
          <div className="bg-white/80 rounded-xl p-2.5 border border-green-100 shadow-xs">
            <span className="text-gray-500 block text-[10px] font-medium">Storage Bucket</span>
            <span className="font-semibold text-gray-800 mt-0.5 block">school-media (Public CDN)</span>
          </div>
          <div className="bg-white/80 rounded-xl p-2.5 border border-green-100 shadow-xs">
            <span className="text-gray-500 block text-[10px] font-medium">Tabel Settings</span>
            <span className="font-semibold text-gray-800 mt-0.5 block">public.settings (JSONB)</span>
          </div>
        </div>
      </div>

      {/* Storage Overview */}
      <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between gap-2 mb-4">
          <h3 className="text-sm sm:text-base font-bold text-gray-900 flex items-center gap-2">
            <HardDrive className="h-4 w-4 sm:h-5 sm:w-5 text-primary-500" />
            Penggunaan Penyimpanan
          </h3>
          <button
            type="button"
            onClick={() => void refreshDatabaseStats()}
            disabled={isLoadingDatabaseStats}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-200 text-[11px] sm:text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-60"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoadingDatabaseStats ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        <div className="bg-gradient-to-br from-primary-50 via-white to-emerald-50 rounded-2xl p-4 sm:p-5 border border-primary-100 mb-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div>
              <p className="text-xs sm:text-sm font-bold text-gray-900 flex items-center gap-1.5">
                <HardDrive className="h-4 w-4 text-primary-600" />
                Penyimpanan Database & Media Cloud
              </p>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Total akumulasi data tabel PostgreSQL dan file gambar di Supabase Storage
              </p>
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-semibold bg-emerald-100 text-emerald-800 self-start sm:self-auto">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              {isLoadingDatabaseStats ? 'Memuat...' : 'Realtime Sync'}
            </span>
          </div>

          {databaseStats ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                <div className="rounded-xl bg-white/90 border border-primary-200/80 p-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-medium text-gray-500">Total Keseluruhan</p>
                    <span className="text-[10px] font-semibold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-md">DB + Storage</span>
                  </div>
                  <p className="text-lg sm:text-xl font-extrabold text-primary-900 mt-1">{databaseStats.databaseSize}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">Tabel Database + File Gambar</p>
                </div>

                <div className="rounded-xl bg-white/90 border border-emerald-200/80 p-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-medium text-gray-500">File Gambar & Media</p>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">Bucket school-media</span>
                  </div>
                  <p className="text-lg sm:text-xl font-extrabold text-emerald-700 mt-1">{databaseStats.mediaSize || '0 B'}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{databaseStats.mediaFiles ?? 0} file foto/gambar terunggah</p>
                </div>

                <div className="rounded-xl bg-white/90 border border-blue-200/80 p-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-medium text-gray-500">Data Tabel Settings</p>
                    <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">PostgreSQL JSONB</span>
                  </div>
                  <p className="text-lg sm:text-xl font-extrabold text-blue-700 mt-1">{databaseStats.settingsSize}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{databaseStats.settingsRows} baris konfigurasi website</p>
                </div>
              </div>

              {/* Rincian Media Per Kategori / Folder */}
              {databaseStats.mediaFolders && databaseStats.mediaFolders.length > 0 && (
                <div className="rounded-xl bg-white/80 border border-gray-200/70 p-3">
                  <p className="text-[11px] font-bold text-gray-700 mb-2 flex items-center justify-between">
                    <span>📁 Rincian File Media Berdasarkan Kategori:</span>
                    <span className="text-[10px] font-normal text-gray-500">{databaseStats.mediaFiles} file di Storage CDN</span>
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {databaseStats.mediaFolders.map((f) => {
                      const meta = MEDIA_FOLDER_META[f.folder] || { label: f.folder, icon: '📁' };
                      return (
                        <div key={f.folder} className="bg-gray-50/80 hover:bg-gray-100/80 rounded-lg p-2 border border-gray-100 transition-colors">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-800 truncate">
                            <span>{meta.icon}</span>
                            <span className="truncate">{meta.label}</span>
                          </div>
                          <div className="flex items-baseline justify-between mt-1 text-[11px]">
                            <span className="text-gray-500">{f.count} file</span>
                            <span className="font-bold text-emerald-600">{f.size}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-[11px] sm:text-xs text-primary-700">
              {databaseStatsError || 'Statistik database belum tersedia.'}
            </p>
          )}
        </div>

        {/* Total usage bar */}
        <div className="bg-gray-50 rounded-xl p-3 sm:p-4 border border-gray-100 mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-2">
            <span className="text-xs sm:text-sm font-semibold text-gray-700">Proporsi Penggunaan Penyimpanan</span>
            <div className="flex items-center gap-3 text-xs">
              <span className="inline-flex items-center gap-1 text-[11px] text-blue-700 font-medium">
                <span className="w-2 h-2 rounded-full bg-blue-500 inline-block"></span> Tabel DB: {databaseStats?.settingsSize || formatSize(storageData.totalSize)}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span> Media Gambar: {databaseStats?.mediaSize || '0 B'}
              </span>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden flex">
            {databaseStats && databaseStats.databaseBytes > 0 ? (
              <>
                <div
                  className="bg-blue-500 h-full transition-all duration-500"
                  style={{ width: `${Math.max(2, (databaseStats.settingsBytes / databaseStats.databaseBytes) * 100)}%` }}
                  title={`Tabel Settings: ${databaseStats.settingsSize}`}
                />
                <div
                  className="bg-emerald-500 h-full transition-all duration-500"
                  style={{ width: `${Math.min(98, (databaseStats.mediaBytes / databaseStats.databaseBytes) * 100)}%` }}
                  title={`Media Cloud: ${databaseStats.mediaSize}`}
                />
              </>
            ) : (
              <div
                className="bg-gradient-to-r from-primary-400 to-primary-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min((storageData.totalSize / (5 * 1024 * 1024)) * 100, 100)}%` }}
              />
            )}
          </div>
          <div className="flex items-center justify-between mt-1.5 text-[10px] text-gray-400">
            <span>Total Digunakan: {databaseStats?.databaseSize || formatSize(storageData.totalSize)}</span>
            <span>Alokasi Supabase Free Tier: 1.0 GB Storage & 500 MB DB</span>
          </div>
        </div>

        {/* Individual data items */}
        {isLoadingSettings ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
            {BACKUP_DATABASE_KEYS.map(item => (
              <div key={item.key} className="rounded-xl p-2.5 sm:p-3 border bg-gray-50/70 border-gray-100 animate-pulse">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-base sm:text-lg">{item.icon}</span>
                  <span className="text-xs font-semibold text-gray-500 truncate">{item.label}</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-[10px] text-gray-400">Memuat data...</span>
                  <span className="text-[10px] font-medium text-gray-400">-</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
            {storageData.items.map(item => (
              <div key={item.key} className={`rounded-xl p-2.5 sm:p-3 border transition-all ${item.exists ? 'bg-white border-gray-100 shadow-sm' : 'bg-gray-50/70 border-gray-100 opacity-60'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-base sm:text-lg">{item.icon}</span>
                  <span className="text-xs font-semibold text-gray-700 truncate">{item.label}</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-[10px] text-gray-400">
                    {item.count > 0 ? `${item.count} item` : '0 item'}
                  </span>
                  <span className="text-[10px] font-medium text-primary-500">{formatSize(item.size)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Backup Section */}
      <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 space-y-4">
        <h3 className="text-sm sm:text-base font-bold text-gray-900 flex items-center gap-2">
          <Download className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
          Backup Data Website
        </h3>
        <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
          Download seluruh data website (berita, agenda, galeri, guru, ekstrakurikuler, profil, identitas madrasah, dan pengaturan) sebagai file JSON terstruktur. 
          File backup ini dapat digunakan untuk memulihkan (*restore*) data kapan saja dengan aman.
        </p>

        <div className="bg-green-50 rounded-xl p-3 sm:p-4 border border-green-100">
          <div className="flex items-start gap-3">
            <Info className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
            <div className="text-xs text-green-700 leading-relaxed">
              <p className="font-semibold mb-1">Cakupan Data Backup:</p>
              <p>Berita, Agenda, Galeri Kegiatan, Banner Slider, Guru & Staf, Ekstrakurikuler, Mitra Sponsor, Profil, Statistik, Kontak, Identitas & Branding Sekolah, Dokumen Unduhan, SEO, Analitik, Instagram, SMPB, dan Keamanan Admin.</p>
              <p className="mt-1 text-green-800 font-medium">✨ Penyimpanan Cloud: File gambar kini tersimpan di Supabase Cloud Storage (CDN), sehingga file backup JSON sangat ringkas dan proses download cepat.</p>
            </div>
          </div>
        </div>

        <button
          onClick={handleBackup}
          disabled={isExportingBackup}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-green-500 text-white rounded-xl text-sm font-semibold hover:bg-green-600 disabled:opacity-60 shadow-lg transition-colors cursor-pointer"
        >
          {isExportingBackup ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" /> Menyiapkan Backup...
            </>
          ) : (
            <>
              <Download className="h-4 w-4" /> Download Backup (.json)
            </>
          )}
        </button>

        {backupInfo && (
          <div className="flex items-center gap-2 text-xs text-green-600 animate-fadeIn">
            <CheckCircle className="h-3.5 w-3.5" />
            <span>Backup terakhir: {backupInfo.date} ({backupInfo.size})</span>
          </div>
        )}
      </div>

      {/* Restore Section */}
      <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 space-y-4">
        <h3 className="text-sm sm:text-base font-bold text-gray-900 flex items-center gap-2">
          <Upload className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
          Restore Data
        </h3>
        <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
          Pulihkan data dari file backup JSON yang telah didownload sebelumnya. 
          Data saat ini akan <strong>ditimpa</strong> dengan data dari file backup.
        </p>

        <div className="bg-amber-50 rounded-xl p-3 sm:p-4 border border-amber-100">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-700 leading-relaxed">
              <p className="font-semibold mb-1">⚠️ Perhatian:</p>
              <ul className="space-y-0.5">
                <li>• Data saat ini akan <strong>ditimpa</strong> oleh data dari file backup</li>
                <li>• Pastikan file yang diupload adalah backup yang benar</li>
                <li>• Disarankan backup data saat ini terlebih dahulu sebelum restore</li>
                <li>• Halaman akan dimuat ulang otomatis setelah restore berhasil</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-2 border-dashed border-blue-200 rounded-xl p-6 sm:p-8 text-center hover:border-blue-400 hover:bg-blue-50/50 transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-10 w-10 sm:h-12 sm:w-12 text-blue-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-gray-700">Pilih file backup</p>
          <p className="text-xs text-gray-400 mt-1">Format: .json (maks 50MB)</p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleFileSelect}
          />
        </div>
      </div>

      {/* Reset All Section */}
      <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-red-100 space-y-4">
        <h3 className="text-sm sm:text-base font-bold text-red-600 flex items-center gap-2">
          <RefreshCw className="h-4 w-4 sm:h-5 sm:w-5" />
          Reset Semua Data
        </h3>
        <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
          Kembalikan semua key settings ke data bawaan aplikasi dan hapus key tambahan non-default.
          Pastikan Anda sudah membuat backup terlebih dahulu!
        </p>
        <button onClick={() => setShowResetAllConfirm(true)} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 shadow-lg transition-colors">
          <RefreshCw className="h-4 w-4" /> Reset ke Default
        </button>
      </div>

      {/* Restore Confirmation Modal */}
      {showRestoreConfirm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 animate-fadeIn" onClick={() => { setShowRestoreConfirm(false); setPendingFile(null); }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-5 sm:p-6 animate-scaleIn" onClick={e => e.stopPropagation()}>
            <div className="text-center">
              <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="h-7 w-7 text-blue-600" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">Restore Data?</h3>
              <p className="text-gray-500 text-xs sm:text-sm mb-1">File: <strong>{pendingFile?.name}</strong></p>
              <p className="text-gray-400 text-xs mb-4">({pendingFile ? formatSize(pendingFile.size) : ''})</p>
              <p className="text-amber-600 text-xs mb-4 bg-amber-50 p-2 rounded-lg">
                ⚠️ Data saat ini akan ditimpa. Pastikan Anda sudah membuat backup!
              </p>
              <div className="flex gap-2 sm:gap-3">
                <button onClick={() => { setShowRestoreConfirm(false); setPendingFile(null); }} className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium">Batal</button>
                <button onClick={performRestore} className="flex-1 px-4 py-2.5 bg-blue-500 text-white rounded-xl text-sm font-semibold">Restore</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reset All Confirmation Modal */}
      {showResetAllConfirm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 animate-fadeIn" onClick={() => setShowResetAllConfirm(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-5 sm:p-6 animate-scaleIn" onClick={e => e.stopPropagation()}>
            <div className="text-center">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="h-7 w-7 text-red-600" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">Reset Semua Data?</h3>
              <p className="text-gray-500 text-xs sm:text-sm mb-4">
                Tindakan ini akan menghapus <strong>SEMUA</strong> data (berita, galeri, profil, dll) dan mengembalikannya ke data bawaan. Tindakan ini <strong>tidak bisa dibatalkan</strong>!
              </p>
              <div className="flex gap-2 sm:gap-3">
                <button onClick={() => setShowResetAllConfirm(false)} className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium">Batal</button>
                <button onClick={handleResetAll} className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl text-sm font-semibold">Reset Semua</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* End of DatabaseSettingsTab */}
    </div>
  );
}

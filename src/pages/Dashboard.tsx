import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard, Newspaper, Calendar, Camera, LogOut, Plus, Edit, Trash2, X, Save, Eye, TrendingUp,
  GraduationCap, ImagePlus, Phone, Sliders, FileText, Youtube, MapPin, Mail, Clock, Globe, ArrowUp, ArrowDown,
  Home, ChevronLeft, BarChart3, Users, Award, BookOpen, Star, Search, Activity, MousePointerClick,
  FileSearch, Tag, Link2, Shield, CheckCircle, RotateCcw, Instagram, Heart, ExternalLink, ToggleLeft, ToggleRight,
  Download, Upload, Database, HardDrive, AlertTriangle, RefreshCw, Info
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  NewsItem, AgendaItem, GalleryItem, SliderItem, ContactInfo, ProfileData, StatsData, FooterCredit, SEOData,
  InstagramPost, InstagramSettings, Sponsor,
  NEWS_CATEGORIES, AGENDA_TYPES, GALLERY_CATEGORIES, CATEGORY_COLORS, getYoutubeThumbnail,
  initialNews, initialAgenda, initialGallery, initialContactInfo, initialSliderItems, initialProfileData, initialStatsData,
  initialFooterCredit, initialSEOData, initialAnalyticsData, initialInstagramSettings, initialSponsorsData, initialSmpbButtonSettings,
  initialAuthSettings
} from '../types';
import RichTextEditor from '../components/RichTextEditor';
import { SETTINGS_DB_KEYS } from '../constants/settingsKeys';
import { DEFAULT_SETTINGS_BY_KEY } from '../constants/defaultSettings';
import {
  checkDatabaseConnection,
  getDatabaseStorageStats,
  loadSettings,
  resetSettingsToDefault,
  saveSetting,
  type DatabaseConnectionStatus,
  type DatabaseStorageStats,
} from '../services/settingsRepository';

type Tab = 'overview' | 'news' | 'agenda' | 'gallery' | 'slider' | 'contact' | 'profile' | 'stats' | 'seo' | 'instagram' | 'sponsors' | 'security' | 'database';

const emptyInstagramPost: Omit<InstagramPost, 'id'> = { postUrl: '', caption: '', thumbnail: '', likes: '', date: new Date().toISOString().split('T')[0], isEmbed: false, embedCode: '' };

const emptyNews: Omit<NewsItem, 'id'> = { title: '', excerpt: '', content: '', category: 'Akademik', image: '', date: new Date().toISOString().split('T')[0], author: 'Admin' };
const emptyAgenda: Omit<AgendaItem, 'id'> = { title: '', date: '', endDate: '', time: '', location: '', description: '', type: 'Kegiatan' };
const emptyGallery: Omit<GalleryItem, 'id'> = { title: '', image: '', category: 'Akademik', date: new Date().toISOString().split('T')[0], mediaType: 'image', youtubeUrl: '' };
const emptySlider: Omit<SliderItem, 'id'> = { title: '', subtitle: '', image: '', buttonText: '', buttonLink: '' };
const emptySponsor: Omit<Sponsor, 'id'> = { name: '', logo: '', url: '' };

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
    contactInfo, updateContactInfo,
    sliderItems, addSliderItem, updateSliderItem, deleteSliderItem, reorderSlider,
    profileData, updateProfileData,
    statsData, updateStatsData,
    footerCredit, updateFooterCredit,
    seoData, updateSEOData,
    analyticsData, resetAnalytics,
    instagramSettings, updateInstagramSettings, addInstagramPost, updateInstagramPost, deleteInstagramPost, reorderInstagramPosts,
    sponsorsData, updateSponsorsData, addSponsor, updateSponsor, deleteSponsor,
    smpbButton, updateSmpbButton,
    authSettings, updateAdminCredentials, updateAuthUiSettings,
  } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const [showNewsModal, setShowNewsModal] = useState(false);
  const [showAgendaModal, setShowAgendaModal] = useState(false);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [showSliderModal, setShowSliderModal] = useState(false);
  const [editingNewsId, setEditingNewsId] = useState<string | null>(null);
  const [editingAgendaId, setEditingAgendaId] = useState<string | null>(null);
  const [editingGalleryId, setEditingGalleryId] = useState<string | null>(null);
  const [editingSlideId, setEditingSliderId] = useState<string | null>(null);
  const [editingSponsorId, setEditingSponsorId] = useState<string | null>(null);
  const [showSponsorModal, setShowSponsorModal] = useState(false);
  const [sponsorSaved, setSponsorSaved] = useState(false);
  const [sponsorError, setSponsorError] = useState('');
  const [newsForm, setNewsForm] = useState(emptyNews);
  const [agendaForm, setAgendaForm] = useState(emptyAgenda);
  const [galleryForm, setGalleryForm] = useState(emptyGallery);
  const [sliderForm, setSliderForm] = useState(emptySlider);
  const [sponsorForm, setSponsorForm] = useState(emptySponsor);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: string; id: string } | null>(null);

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

  const [contactForm, setContactForm] = useState<ContactInfo>(contactInfo);
  const [profileForm, setProfileForm] = useState<ProfileData>(profileData);
  const [misiInput, setMisiInput] = useState('');
  const [facilityInput, setFacilityInput] = useState('');
  const [contactSaved, setContactSaved] = useState(false);
  const [footerForm, setFooterForm] = useState<FooterCredit>(footerCredit);
  const [footerSaved, setFooterSaved] = useState(false);
  const [smpbForm, setSmpbForm] = useState(smpbButton);
  const [smpbSaved, setSmpbSaved] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [statsForm, setStatsForm] = useState<StatsData>(statsData);
  const [statsSaved, setStatsSaved] = useState(false);
  const [seoForm, setSeoForm] = useState<SEOData>(seoData);
  const [seoSaved, setSeoSaved] = useState(false);
  const [credentialsForm, setCredentialsForm] = useState({ username: authSettings.username, password: '', confirmPassword: '' });
  const [securitySaved, setSecuritySaved] = useState(false);
  const [securityError, setSecurityError] = useState('');

  useEffect(() => { setContactForm(contactInfo); }, [contactInfo]);
  useEffect(() => { setFooterForm(footerCredit); }, [footerCredit]);
  useEffect(() => { setSmpbForm(smpbButton); }, [smpbButton]);
  useEffect(() => { setProfileForm(profileData); }, [profileData]);
  useEffect(() => { setStatsForm(statsData); }, [statsData]);
  useEffect(() => { setSeoForm(seoData); }, [seoData]);
  useEffect(() => {
    setCredentialsForm(prev => ({ ...prev, username: authSettings.username }));
  }, [authSettings.username]);

  // If not logged in, redirect to login immediately
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => { logout(); navigate('/', { replace: true }); };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, setForm: (fn: (prev: any) => any) => void, field = 'image') => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { alert('Ukuran file maksimal 2MB'); return; }
    const reader = new FileReader();
    reader.onloadend = () => setForm((prev: any) => ({ ...prev, [field]: reader.result as string }));
    reader.readAsDataURL(file);
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
  };

  // Gallery
  const openGalleryAdd = () => { setGalleryForm(emptyGallery); setEditingGalleryId(null); setShowGalleryModal(true); };
  const openGalleryEdit = (item: GalleryItem) => {
    setGalleryForm({ title: item.title, image: item.image, category: item.category, date: item.date, mediaType: item.mediaType || 'image', youtubeUrl: item.youtubeUrl || '' });
    setEditingGalleryId(item.id); setShowGalleryModal(true);
  };
  const saveGallery = () => {
    if (!galleryForm.title) return;
    if (editingGalleryId) updateGallery(editingGalleryId, galleryForm); else addGallery(galleryForm);
    setShowGalleryModal(false);
  };

  // Slider
  const openSliderAdd = () => { setSliderForm(emptySlider); setEditingSliderId(null); setShowSliderModal(true); };
  const openSliderEdit = (item: SliderItem) => {
    setSliderForm({ title: item.title, subtitle: item.subtitle, image: item.image, buttonText: item.buttonText, buttonLink: item.buttonLink });
    setEditingSliderId(item.id); setShowSliderModal(true);
  };
  const saveSlider = () => {
    if (!sliderForm.title) return;
    if (editingSlideId) updateSliderItem(editingSlideId, sliderForm); else addSliderItem(sliderForm);
    setShowSliderModal(false);
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
    setTimeout(() => setStatsSaved(false), 2000);
  };

  // SEO
  const saveSeo = () => {
    updateSEOData(seoForm);
    setSeoSaved(true);
    setTimeout(() => setSeoSaved(false), 2000);
  };

  // Contact
  const saveContact = () => {
    updateContactInfo(contactForm);
    setContactSaved(true);
    setTimeout(() => setContactSaved(false), 2000);
  };

  // Footer Credit
  const saveFooterCredit = () => {
    updateFooterCredit(footerForm);
    setFooterSaved(true);
    setTimeout(() => setFooterSaved(false), 2000);
  };

  const saveSmpbSettings = () => {
    updateSmpbButton({
      isActive: smpbForm.isActive,
      year: smpbForm.year.trim(),
      link: smpbForm.link.trim(),
      openInNewTab: smpbForm.openInNewTab,
    });
    setSmpbSaved(true);
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
      setTimeout(() => setSponsorSaved(false), 2000);
    } catch (err) {
      console.error('Gagal menyimpan sponsor:', err);
      setSponsorError('Terjadi kesalahan saat menyimpan sponsor.');
    }
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
    setTimeout(() => setInstagramSettingsSaved(false), 2000);
  };

  const tabs = [
    { id: 'overview' as Tab, label: 'Overview', icon: LayoutDashboard },
    { id: 'news' as Tab, label: 'Berita', icon: Newspaper },
    { id: 'agenda' as Tab, label: 'Agenda', icon: Calendar },
    { id: 'gallery' as Tab, label: 'Galeri', icon: Camera },
    { id: 'slider' as Tab, label: 'Slider', icon: Sliders },
    { id: 'profile' as Tab, label: 'Profil', icon: FileText },
    { id: 'stats' as Tab, label: 'Statistik', icon: BarChart3 },
    { id: 'seo' as Tab, label: 'SEO & Analitik', icon: Search },
    { id: 'instagram' as Tab, label: 'Instagram', icon: Instagram },
    { id: 'sponsors' as Tab, label: 'Sponsor/Mitra', icon: Link2 },
    { id: 'security' as Tab, label: 'Keamanan', icon: Shield },
    { id: 'contact' as Tab, label: 'Kontak', icon: Phone },
    { id: 'database' as Tab, label: 'Database', icon: Database },
  ];

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
            <p className="text-[10px] sm:text-xs text-gray-500 hidden sm:block">Kelola konten website SMPN 1 Genteng</p>
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

      {/* Horizontal Scrollable Tabs (mobile) + Sidebar (desktop) */}
      <div className="lg:flex">
        {/* Mobile Tabs */}
        <div className="lg:hidden bg-white border-b border-gray-200 sticky top-[52px] z-20">
          <div className="flex overflow-x-auto no-scrollbar px-2 py-1.5 gap-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all shrink-0 ${
                  activeTab === tab.id ? 'bg-primary-500 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Desktop Sidebar */}
        <aside className="hidden lg:block sticky top-[52px] w-60 h-[calc(100vh-52px)] bg-white border-r border-gray-200 overflow-y-auto shrink-0">
          <nav className="p-3 space-y-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeTab === tab.id ? 'bg-primary-50 text-primary-700 shadow-sm' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                {tab.label}
              </button>
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
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
                {[
                  { icon: Newspaper, label: 'Berita', value: news.length, color: 'from-primary-400 to-primary-600', bg: 'bg-primary-50' },
                  { icon: Calendar, label: 'Agenda', value: agenda.length, color: 'from-green-400 to-green-600', bg: 'bg-green-50' },
                  { icon: Camera, label: 'Galeri', value: gallery.length, color: 'from-accent-400 to-accent-600', bg: 'bg-amber-50' },
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
            </div>
          )}

          {/* ======= GALLERY ======= */}
          {activeTab === 'gallery' && (
            <div className="animate-fadeIn">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-2xl font-extrabold text-gray-900">Kelola Galeri</h2>
                <button onClick={openGalleryAdd} className="flex items-center gap-1.5 bg-primary-500 hover:bg-primary-600 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold shadow-md">
                  <Plus className="h-4 w-4" /> <span className="hidden sm:inline">Tambah</span> Media
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
                {gallery.map(item => (
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
                ))}
              </div>
            </div>
          )}

          {/* ======= SLIDER ======= */}
          {activeTab === 'slider' && (
            <div className="animate-fadeIn">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-2xl font-extrabold text-gray-900">Kelola Slider Hero</h2>
                <button onClick={openSliderAdd} className="flex items-center gap-1.5 bg-primary-500 hover:bg-primary-600 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold shadow-md">
                  <Plus className="h-4 w-4" /> <span className="hidden sm:inline">Tambah</span> Slide
                </button>
              </div>
              <div className="space-y-2 sm:space-y-3">
                {sliderItems.map((item, idx) => (
                  <div key={item.id} className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-sm border border-gray-100 flex items-center gap-2 sm:gap-4">
                    <div className="flex flex-col gap-1 shrink-0">
                      <button onClick={() => moveSlider(idx, 'up')} disabled={idx === 0} className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"><ArrowUp className="h-4 w-4 text-gray-400" /></button>
                      <button onClick={() => moveSlider(idx, 'down')} disabled={idx === sliderItems.length - 1} className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"><ArrowDown className="h-4 w-4 text-gray-400" /></button>
                    </div>
                    <div className="w-16 h-10 sm:w-24 sm:h-14 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                      {item.image ? <img src={item.image} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gradient-to-br from-primary-400 to-primary-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{item.title}</p>
                      <p className="text-[11px] text-gray-400 truncate">{item.subtitle}</p>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <button onClick={() => openSliderEdit(item)} className="p-2 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100"><Edit className="h-4 w-4" /></button>
                      <button onClick={() => setDeleteConfirm({ type: 'slider', id: item.id })} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
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
                      <div className="relative group shrink-0">
                        <img src={profileForm.fotoKepsek} alt="" className="w-28 h-36 sm:w-36 sm:h-48 rounded-xl sm:rounded-2xl object-cover shadow-md border-2 border-gray-100" />
                        <button onClick={() => setProfileForm({ ...profileForm, fotoKepsek: '' })} className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-md transition-colors">
                          <X className="h-3.5 w-3.5" />
                        </button>
                        <div className="absolute bottom-2 left-2 right-2 bg-black/60 backdrop-blur-sm rounded-lg px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <p className="text-[10px] text-white text-center">Klik × untuk ganti</p>
                        </div>
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
                    <input type="text" value={instagramSettingsForm.username} onChange={e => setInstagramSettingsForm({ ...instagramSettingsForm, username: e.target.value })} className={inputCls} placeholder="@smpn1genteng" />
                    <p className="text-[10px] text-gray-400 mt-1">Masukkan username termasuk tanda @</p>
                  </div>
                  <div>
                    <label className={labelCls}><Link2 className="inline h-3.5 w-3.5 mr-1" />URL Profil Instagram</label>
                    <input type="url" value={instagramSettingsForm.profileUrl} onChange={e => setInstagramSettingsForm({ ...instagramSettingsForm, profileUrl: e.target.value })} className={inputCls} placeholder="https://www.instagram.com/smpn1genteng" />
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
                <h2 className="text-lg sm:text-2xl font-extrabold text-gray-900">Kelola Kontak</h2>
                {contactSaved && <span className="flex items-center gap-1 text-green-600 text-xs sm:text-sm font-semibold animate-fadeIn"><CheckCircle className="h-4 w-4" /> Tersimpan!</span>}
              </div>
              <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 space-y-3 sm:space-y-4">
                <h3 className="text-sm sm:text-base font-bold text-gray-900">Informasi Kontak</h3>
                <div><label className={labelCls}><MapPin className="inline h-3.5 w-3.5 mr-1" />Alamat</label><textarea rows={2} value={contactForm.address} onChange={e => setContactForm({ ...contactForm, address: e.target.value })} className={inputCls + ' resize-none'} /></div>
                <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                  <div><label className={labelCls}><Phone className="inline h-3.5 w-3.5 mr-1" />Telepon</label><input type="text" value={contactForm.phone} onChange={e => setContactForm({ ...contactForm, phone: e.target.value })} className={inputCls} /></div>
                  <div><label className={labelCls}><Mail className="inline h-3.5 w-3.5 mr-1" />Email</label><input type="email" value={contactForm.email} onChange={e => setContactForm({ ...contactForm, email: e.target.value })} className={inputCls} /></div>
                </div>
                <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                  <div><label className={labelCls}><Clock className="inline h-3.5 w-3.5 mr-1" />Jam Operasional</label><input type="text" value={contactForm.hours} onChange={e => setContactForm({ ...contactForm, hours: e.target.value })} className={inputCls} /></div>
                  <div><label className={labelCls}><Globe className="inline h-3.5 w-3.5 mr-1" />Google Maps Query</label><input type="text" value={contactForm.mapQuery} onChange={e => setContactForm({ ...contactForm, mapQuery: e.target.value })} className={inputCls} placeholder="SMP Negeri 1 Genteng Banyuwangi" /></div>
                </div>
                <div className="rounded-xl border border-blue-100 bg-blue-50 p-3 sm:p-4 space-y-3">
                  <div>
                    <h4 className="text-sm font-bold text-blue-900">Pengaturan Google Maps</h4>
                    <p className="text-[11px] sm:text-xs text-blue-700 mt-1">
                      Gunakan query untuk mode sederhana, atau isi URL embed agar peta yang tampil sesuai titik lokasi sekolah.
                    </p>
                  </div>
                  <div>
                    <label className={labelCls}>URL Embed Google Maps</label>
                    <input
                      type="url"
                      value={contactForm.mapEmbedUrl}
                      onChange={e => setContactForm({ ...contactForm, mapEmbedUrl: e.target.value })}
                      className={inputCls}
                      placeholder="https://www.google.com/maps/embed?pb=..."
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Link Buka Google Maps</label>
                    <input
                      type="url"
                      value={contactForm.mapDirectionsUrl}
                      onChange={e => setContactForm({ ...contactForm, mapDirectionsUrl: e.target.value })}
                      className={inputCls}
                      placeholder="https://maps.app.goo.gl/... atau https://www.google.com/maps/search/?api=1..."
                    />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 space-y-3 sm:space-y-4">
                <h3 className="text-sm sm:text-base font-bold text-gray-900">Media Sosial</h3>
                <div><label className={labelCls}>Facebook</label><input type="url" value={contactForm.facebook} onChange={e => setContactForm({ ...contactForm, facebook: e.target.value })} className={inputCls} placeholder="https://facebook.com/..." /></div>
                <div><label className={labelCls}>Instagram</label><input type="url" value={contactForm.instagram} onChange={e => setContactForm({ ...contactForm, instagram: e.target.value })} className={inputCls} placeholder="https://instagram.com/..." /></div>
                <div><label className={labelCls}>YouTube</label><input type="url" value={contactForm.youtube} onChange={e => setContactForm({ ...contactForm, youtube: e.target.value })} className={inputCls} placeholder="https://youtube.com/..." /></div>
              </div>

              <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm sm:text-base font-bold text-gray-900">Tombol SMPB</h3>
                  {smpbSaved && <span className="flex items-center gap-1 text-green-600 text-xs font-semibold animate-fadeIn"><CheckCircle className="h-3.5 w-3.5" /> Tersimpan!</span>}
                </div>
                <div className="bg-gray-50 rounded-xl border border-gray-100 p-3 sm:p-4">
                  <p className="text-[10px] sm:text-xs text-gray-500 mb-1">Preview:</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-800">SMPB ({smpbForm.year || '-'})</span>
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
                <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className={labelCls}>Tahun SMPB</label>
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
              <button onClick={saveContact} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-xl text-sm font-semibold hover:bg-primary-600 shadow-lg">
                <Save className="h-4 w-4" /> Simpan Kontak
              </button>

              {/* FOOTER CREDIT EDITOR */}
              <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 space-y-3 sm:space-y-4 mt-4 sm:mt-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm sm:text-base font-bold text-gray-900 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary-500" />
                    Credit Footer
                  </h3>
                  {footerSaved && <span className="flex items-center gap-1 text-green-600 text-xs font-semibold animate-fadeIn"><CheckCircle className="h-3.5 w-3.5" /> Tersimpan!</span>}
                </div>

                {/* Preview */}
                <div className="bg-primary-950 rounded-xl p-3 sm:p-4">
                  <p className="text-[10px] sm:text-xs text-primary-300 mb-1">Preview Footer:</p>
                  <div className="flex flex-col sm:flex-row justify-between items-center text-[11px] sm:text-sm text-primary-400 gap-1">
                    <p>{footerForm.showYear ? `© ${new Date().getFullYear()} ` : ''}{footerForm.schoolName || 'SMP Negeri 1 Genteng'}{footerForm.copyrightText ? ` — ${footerForm.copyrightText}` : ''}</p>
                    <p>
                      {footerForm.rightText || ''}
                      {footerForm.developerName ? (
                        <>
                          {footerForm.rightText ? ' oleh ' : 'Developed by '}
                          <span className="text-primary-300 underline">{footerForm.developerName}</span>
                        </>
                      ) : null}
                    </p>
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Nama Sekolah</label>
                  <input type="text" value={footerForm.schoolName} onChange={e => setFooterForm({ ...footerForm, schoolName: e.target.value })} className={inputCls} placeholder="SMP Negeri 1 Genteng" />
                  <p className="text-[10px] text-gray-400 mt-1">Nama yang tampil di copyright footer</p>
                </div>

                <div>
                  <label className={labelCls}>Teks Tambahan Copyright (opsional)</label>
                  <input type="text" value={footerForm.copyrightText} onChange={e => setFooterForm({ ...footerForm, copyrightText: e.target.value })} className={inputCls} placeholder="All rights reserved" />
                  <p className="text-[10px] text-gray-400 mt-1">Contoh: "All Rights Reserved" → © 2025 SMP Negeri 1 Genteng — All Rights Reserved</p>
                </div>

                <div className="flex items-center gap-3">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={footerForm.showYear} onChange={e => setFooterForm({ ...footerForm, showYear: e.target.checked })} className="sr-only peer" />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-500"></div>
                  </label>
                  <span className="text-xs sm:text-sm text-gray-700">Tampilkan tahun otomatis (© {new Date().getFullYear()})</span>
                </div>

                <div>
                  <label className={labelCls}>Teks Kanan Footer</label>
                  <input type="text" value={footerForm.rightText} onChange={e => setFooterForm({ ...footerForm, rightText: e.target.value })} className={inputCls} placeholder="Dibuat dengan ❤️ untuk pendidikan Indonesia" />
                  <p className="text-[10px] text-gray-400 mt-1">Teks yang muncul di sisi kanan footer</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className={labelCls}>Nama Developer (opsional)</label>
                    <input type="text" value={footerForm.developerName} onChange={e => setFooterForm({ ...footerForm, developerName: e.target.value })} className={inputCls} placeholder="Nama / Tim Pengembang" />
                  </div>
                  <div>
                    <label className={labelCls}>URL Developer (opsional)</label>
                    <input type="url" value={footerForm.developerUrl} onChange={e => setFooterForm({ ...footerForm, developerUrl: e.target.value })} className={inputCls} placeholder="https://developer.com" />
                    <p className="text-[10px] text-gray-400 mt-1">Jika diisi, nama developer akan menjadi link</p>
                  </div>
                </div>

                <button onClick={saveFooterCredit} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-xl text-sm font-semibold hover:bg-primary-600 shadow-lg">
                  <Save className="h-4 w-4" /> Simpan Credit Footer
                </button>
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
                    <div className="relative inline-block"><img src={newsForm.image} alt="" className="h-24 sm:h-32 rounded-lg object-cover" /><button onClick={() => setNewsForm({ ...newsForm, image: '' })} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"><X className="h-3 w-3" /></button></div>
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
                  <label className={labelCls}>Upload Foto</label>
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center">
                    {galleryForm.image ? (
                      <div className="relative inline-block"><img src={galleryForm.image} alt="" className="h-32 rounded-lg object-cover" /><button onClick={() => setGalleryForm({ ...galleryForm, image: '' })} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"><X className="h-3 w-3" /></button></div>
                    ) : (
                      <label className="cursor-pointer"><ImagePlus className="h-10 w-10 text-gray-300 mx-auto mb-1" /><p className="text-xs text-gray-500">Upload (maks 2MB)</p><input type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(e, setGalleryForm)} /></label>
                    )}
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-2 sm:gap-4">
                <div><label className={labelCls}>Kategori</label><select value={galleryForm.category} onChange={e => setGalleryForm({ ...galleryForm, category: e.target.value })} className={inputCls}>{GALLERY_CATEGORIES.filter(c => c !== 'Semua' && c !== 'Video').map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                <div><label className={labelCls}>Tanggal</label><input type="date" value={galleryForm.date} onChange={e => setGalleryForm({ ...galleryForm, date: e.target.value })} className={inputCls} /></div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 sm:gap-3 p-4 sm:p-6 border-t border-gray-100 shrink-0">
              <button onClick={() => setShowGalleryModal(false)} className="px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium">Batal</button>
              <button onClick={saveGallery} className="flex items-center gap-2 px-5 py-2.5 bg-primary-500 text-white rounded-xl text-sm font-semibold shadow-md"><Save className="h-4 w-4" /> Simpan</button>
            </div>
          </div>
        </div>
      )}

      {showSliderModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-start sm:justify-center sm:p-4 overflow-y-auto animate-fadeIn" onClick={() => setShowSliderModal(false)}>
          <div className="bg-white w-full sm:rounded-2xl sm:max-w-lg sm:my-8 rounded-t-2xl animate-slideUp sm:animate-scaleIn max-h-[92vh] sm:max-h-none flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100 shrink-0">
              <h3 className="text-base sm:text-lg font-bold text-gray-900">{editingSlideId ? 'Edit Slide' : 'Tambah Slide'}</h3>
              <button onClick={() => setShowSliderModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="h-5 w-5 text-gray-500" /></button>
            </div>
            <div className="p-4 sm:p-6 space-y-3 sm:space-y-4 overflow-y-auto flex-1">
              <div><label className={labelCls}>Judul *</label><input type="text" value={sliderForm.title} onChange={e => setSliderForm({ ...sliderForm, title: e.target.value })} className={inputCls} /></div>
              <div><label className={labelCls}>Subtitle</label><textarea rows={2} value={sliderForm.subtitle} onChange={e => setSliderForm({ ...sliderForm, subtitle: e.target.value })} className={inputCls + ' resize-none'} /></div>
              <div className="grid grid-cols-2 gap-2 sm:gap-4">
                <div><label className={labelCls}>Teks Tombol</label><input type="text" value={sliderForm.buttonText} onChange={e => setSliderForm({ ...sliderForm, buttonText: e.target.value })} className={inputCls} /></div>
                <div><label className={labelCls}>Link Tombol</label><input type="text" value={sliderForm.buttonLink} onChange={e => setSliderForm({ ...sliderForm, buttonLink: e.target.value })} className={inputCls} /></div>
              </div>
              <div>
                <label className={labelCls}>Gambar Latar</label>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center">
                  {sliderForm.image ? (
                    <div className="relative inline-block"><img src={sliderForm.image} alt="" className="h-28 rounded-lg object-cover" /><button onClick={() => setSliderForm({ ...sliderForm, image: '' })} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"><X className="h-3 w-3" /></button></div>
                  ) : (
                    <label className="cursor-pointer"><ImagePlus className="h-10 w-10 text-gray-300 mx-auto mb-1" /><p className="text-xs text-gray-500">Upload gambar (maks 2MB)</p><input type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(e, setSliderForm)} /></label>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 sm:gap-3 p-4 sm:p-6 border-t border-gray-100 shrink-0">
              <button onClick={() => setShowSliderModal(false)} className="px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium">Batal</button>
              <button onClick={saveSlider} className="flex items-center gap-2 px-5 py-2.5 bg-primary-500 text-white rounded-xl text-sm font-semibold shadow-md"><Save className="h-4 w-4" /> Simpan</button>
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
                    <div className="relative inline-block"><img src={instagramForm.thumbnail} alt="" className="h-32 rounded-lg object-cover" /><button onClick={() => setInstagramForm({ ...instagramForm, thumbnail: '' })} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"><X className="h-3 w-3" /></button></div>
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
                    <div className="relative inline-block">
                      <img src={sponsorForm.logo} alt="" className="h-20 rounded-lg object-contain bg-gray-50 p-2" />
                      <button onClick={() => setSponsorForm({ ...sponsorForm, logo: '' })} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"><X className="h-3 w-3" /></button>
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

  const handleOgImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { alert('Ukuran file maksimal 2MB'); return; }
    const reader = new FileReader();
    reader.onloadend = () => setSeoForm({ ...seoForm, ogImage: reader.result as string });
    reader.readAsDataURL(file);
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
            <strong>ℹ️ Info:</strong> Data analitik disimpan di database. Pastikan koneksi Supabase aktif agar tracking lintas perangkat konsisten, 
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
              {seoForm.canonicalUrl || 'https://smpn1genteng.sch.id'}
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
          <p className="text-[10px] text-gray-400 mt-1">Pisahkan dengan koma. Contoh: SMPN 1 Genteng, sekolah, pendidikan</p>
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
            <input type="url" value={seoForm.canonicalUrl} onChange={e => setSeoForm({ ...seoForm, canonicalUrl: e.target.value })} className={inputCls} placeholder="https://smpn1genteng.sch.id" />
          </div>
        </div>

        <div>
          <label className={labelCls}>OG Image (Gambar Share)</label>
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center">
            {seoForm.ogImage ? (
              <div className="relative inline-block">
                <img src={seoForm.ogImage} alt="OG" className="h-24 sm:h-32 rounded-lg object-cover" />
                <button onClick={() => setSeoForm({ ...seoForm, ogImage: '' })} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"><X className="h-3 w-3" /></button>
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
  { key: SETTINGS_DB_KEYS.profile, label: 'Profil', icon: '📋' },
  { key: SETTINGS_DB_KEYS.stats, label: 'Statistik', icon: '📊' },
  { key: SETTINGS_DB_KEYS.footer, label: 'Footer Credit', icon: '📝' },
  { key: SETTINGS_DB_KEYS.seo, label: 'SEO', icon: '🔍' },
  { key: SETTINGS_DB_KEYS.analytics, label: 'Analitik', icon: '📈' },
  { key: SETTINGS_DB_KEYS.instagram, label: 'Instagram', icon: '📸' },
  { key: SETTINGS_DB_KEYS.sponsors, label: 'Sponsor/Mitra', icon: '🤝' },
  { key: SETTINGS_DB_KEYS.smpbButton, label: 'Tombol SMPB', icon: '🎓' },
  { key: SETTINGS_DB_KEYS.auth, label: 'Keamanan Admin', icon: '🔐' },
] as const;

function DatabaseSettingsTab() {
  const [restoreStatus, setRestoreStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [restoreMessage, setRestoreMessage] = useState('');
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [backupInfo, setBackupInfo] = useState<{ date: string; size: string } | null>(null);
  const [showResetAllConfirm, setShowResetAllConfirm] = useState(false);
  const [settingsSnapshot, setSettingsSnapshot] = useState<Record<string, unknown>>({});
  const [databaseStats, setDatabaseStats] = useState<DatabaseStorageStats | null>(null);
  const [databaseStatsError, setDatabaseStatsError] = useState('');
  const [isLoadingDatabaseStats, setIsLoadingDatabaseStats] = useState(false);
  const [databaseConnection, setDatabaseConnection] = useState<DatabaseConnectionStatus>({
    isConnected: false,
    source: 'unknown',
    message: 'Memeriksa koneksi database...',
  });
  const [isCheckingConnection, setIsCheckingConnection] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const refreshSettingsSnapshot = useCallback(async () => {
    const keys = BACKUP_DATABASE_KEYS.map((item) => item.key);
    const data = await loadSettings(keys as string[]);
    setSettingsSnapshot(data);
  }, []);

  const refreshDatabaseStats = useCallback(async () => {
    setIsLoadingDatabaseStats(true);
    const stats = await getDatabaseStorageStats();
    if (!stats) {
      setDatabaseStatsError('Statistik database belum tersedia. Jalankan SQL schema terbaru di Supabase.');
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

  // BACKUP - Export all data
  const handleBackup = async () => {
    const keys = BACKUP_DATABASE_KEYS.map((item) => item.key);
    const databaseValues = await loadSettings(keys as string[]);
    const backup: Record<string, unknown> = {
      _meta: {
        version: '2.0',
        date: new Date().toISOString(),
        app: 'SMPN1 Genteng CMS',
        source: 'database',
        keys,
      },
    };

    BACKUP_DATABASE_KEYS.forEach(({ key }) => {
      if (databaseValues[key] !== undefined) {
        backup[key] = databaseValues[key];
      }
    });

    const jsonStr = JSON.stringify(backup, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
    a.href = url;
    a.download = `smpn1_backup_${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setBackupInfo({
      date: new Date().toLocaleString('id-ID'),
      size: formatSize(blob.size),
    });
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
        const restoreOperations = BACKUP_DATABASE_KEYS
          .filter(({ key }) => data[key] !== undefined)
          .map(async ({ key }) => {
            const success = await saveSetting(key, data[key]);
            if (success) restoredCount++;
          });
        await Promise.all(restoreOperations);
        await refreshSettingsSnapshot();
        await refreshDatabaseStats();
        await refreshDatabaseConnection();

        setRestoreStatus('success');
        setRestoreMessage(`Berhasil! ${restoredCount} data berhasil dipulihkan dari backup tanggal ${new Date(data._meta.date).toLocaleString('id-ID')}. Halaman akan dimuat ulang...`);

        // Reload page after 2 seconds to apply changes
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
              Status: {databaseConnection.isConnected ? 'Terkoneksi ke website' : 'Belum terkoneksi'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              void refreshDatabaseConnection();
              void refreshDatabaseStats();
            }}
            disabled={isCheckingConnection || isLoadingDatabaseStats}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-200 text-[11px] sm:text-xs font-semibold text-gray-700 hover:bg-white/70 disabled:opacity-60"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${(isCheckingConnection || isLoadingDatabaseStats) ? 'animate-spin' : ''}`} />
            Cek Ulang
          </button>
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

        <div className="bg-primary-50 rounded-xl p-3 sm:p-4 border border-primary-100 mb-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs sm:text-sm font-semibold text-primary-800">Ukuran Database Supabase</p>
            <span className="text-[10px] sm:text-xs text-primary-600">
              {isLoadingDatabaseStats ? 'Memuat...' : 'Realtime'}
            </span>
          </div>
          {databaseStats ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
              <div className="rounded-lg bg-white/80 border border-primary-100 p-2.5">
                <p className="text-[10px] text-primary-600">Total Database</p>
                <p className="text-sm font-bold text-primary-800">{databaseStats.databaseSize}</p>
              </div>
              <div className="rounded-lg bg-white/80 border border-primary-100 p-2.5">
                <p className="text-[10px] text-primary-600">Tabel Settings</p>
                <p className="text-sm font-bold text-primary-800">{databaseStats.settingsSize}</p>
              </div>
              <div className="rounded-lg bg-white/80 border border-primary-100 p-2.5">
                <p className="text-[10px] text-primary-600">Jumlah Baris</p>
                <p className="text-sm font-bold text-primary-800">{databaseStats.settingsRows} rows</p>
              </div>
            </div>
          ) : (
            <p className="text-[11px] sm:text-xs text-primary-700">
              {databaseStatsError || 'Statistik database belum tersedia.'}
            </p>
          )}
        </div>

        {/* Total usage bar */}
        <div className="bg-gray-50 rounded-xl p-3 sm:p-4 border border-gray-100 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm font-semibold text-gray-700">Total Data</span>
            <span className="text-xs sm:text-sm font-bold text-primary-600">{formatSize(storageData.totalSize)}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-gradient-to-r from-primary-400 to-primary-600 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${Math.min((storageData.totalSize / (5 * 1024 * 1024)) * 100, 100)}%` }}
            />
          </div>
          <p className="text-[10px] text-gray-400 mt-1">Perkiraan ukuran JSON data pada tabel settings database</p>
        </div>

        {/* Individual data items */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
          {storageData.items.map(item => (
            <div key={item.key} className={`rounded-xl p-2.5 sm:p-3 border ${item.exists ? 'bg-white border-gray-100' : 'bg-gray-50 border-gray-100 opacity-50'}`}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-base sm:text-lg">{item.icon}</span>
                <span className="text-xs font-semibold text-gray-700 truncate">{item.label}</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-[10px] text-gray-400">{item.count} item</span>
                <span className="text-[10px] font-medium text-primary-500">{formatSize(item.size)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Backup Section */}
      <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 space-y-4">
        <h3 className="text-sm sm:text-base font-bold text-gray-900 flex items-center gap-2">
          <Download className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
          Backup Data
        </h3>
        <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
          Download seluruh data website (berita, agenda, galeri, pengaturan, dll) sebagai file JSON. 
          File backup ini bisa digunakan untuk memulihkan data kapan saja.
        </p>

        <div className="bg-green-50 rounded-xl p-3 sm:p-4 border border-green-100">
          <div className="flex items-start gap-3">
            <Info className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
            <div className="text-xs text-green-700 leading-relaxed">
              <p className="font-semibold mb-1">Yang termasuk dalam backup:</p>
              <p>Berita, Agenda, Galeri, Slider, Profil, Statistik, Kontak, Footer, SEO, Analitik, Instagram, SMPB, dan keamanan admin.</p>
              <p className="mt-1 text-green-600">⚠️ File gambar yang diupload (base64) juga termasuk, sehingga ukuran file bisa cukup besar.</p>
            </div>
          </div>
        </div>

        <button onClick={handleBackup} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-green-500 text-white rounded-xl text-sm font-semibold hover:bg-green-600 shadow-lg transition-colors">
          <Download className="h-4 w-4" /> Download Backup (.json)
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
    </div>
  );
}

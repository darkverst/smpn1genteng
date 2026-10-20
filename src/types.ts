export interface NewsItem {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  image: string;
  date: string;
  author: string;
}

export interface AgendaItem {
  id: string;
  title: string;
  date: string;
  endDate: string;
  time: string;
  location: string;
  description: string;
  type: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  image: string;
  images?: string[];
  description?: string;
  category: string;
  date: string;
  mediaType: 'image' | 'video';
  youtubeUrl: string;
}

export interface ContactInfo {
  address: string;
  phone: string;
  email: string;
  hours: string;
  mapQuery: string;
  mapEmbedUrl: string;
  mapDirectionsUrl: string;
  facebook: string;
  instagram: string;
  youtube: string;
}

export interface SliderItem {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  backgroundColor: string;
  buttonText: string;
  buttonLink: string;
  overlayOpacity?: number; // Nilai 0 - 100 (persentase opasitas overlay lapisan gelap, default: 70)
  showText?: boolean; // true = dengan teks & tombol (default), false = hanya gambar visual saja
}

export interface ProfileData {
  about: string;
  visi: string;
  misi: string[];
  sambutanKepsek: string;
  namaKepsek: string;
  jabatanKepsek: string;
  fotoKepsek: string;
  facilities: string[];
}

export interface StatsData {
  siswaAktif: string;
  tenagaPendidik: string;
  prestasi: string;
  akreditasi: string;
}

export interface BrandSettings {
  schoolLogo: string;
  showLogo: boolean;
  schoolName: string;
  schoolTagline: string;
}

export type BottomNavStyle = 'floating' | 'classic' | 'dock' | 'minimal' | 'glass';

export interface SchoolIdentitySettings {
  schemaVersion: number;
  revision: number;
  updatedAt: string;
  themePreset: string;
  bottomNavStyle?: BottomNavStyle;
  schoolName: string;
  schoolShortName: string;
  schoolTagline: string;
  legalName: string;
  schoolLogo: string;
  showLogo: boolean;
  footerDescription: string;
  address: string;
  phone: string;
  email: string;
  hours: string;
  mapQuery: string;
  mapEmbedUrl: string;
  mapDirectionsUrl: string;
  facebook: string;
  instagram: string;
  youtube: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  footerBackgroundColor: string;
  legalNotice: string;
  copyrightText: string;
  showCurrentYear: boolean;
  developerName: string;
  developerUrl: string;
}

export interface DownloadDocument {
  id: string;
  title: string;
  description: string;
  category: string;
  googleDriveLink: string;
  fileType: string;
  publishedAt: string;
  isActive: boolean;
}

export interface DownloadDocumentsData {
  pageTitle: string;
  pageDescription: string;
  showPage: boolean;
  documents: DownloadDocument[];
}

export interface InstagramPost {
  id: string;
  postUrl: string;        // Full Instagram post URL e.g. https://www.instagram.com/p/ABC123/
  caption: string;        // Custom caption/description
  thumbnail: string;      // Uploaded thumbnail image (base64 or URL)
  likes: string;          // Display likes count (manual)
  date: string;           // Post date
  isEmbed: boolean;       // Use Instagram embed script vs manual card
  embedCode: string;      // Raw embed code from Instagram
}

export interface InstagramSettings {
  username: string;       // @handle
  profileUrl: string;     // Full profile URL
  showSection: boolean;   // Toggle visibility on Home/Gallery
  sectionTitle: string;   // Custom section title
  embedType: 'manual' | 'widget';
  widgetCode: string;
  posts: InstagramPost[];
}

export interface FooterCredit {
  copyrightText: string;
  rightText: string;
  showYear: boolean;
  schoolName: string;
  developerName: string;
  developerUrl: string;
}

export interface Sponsor {
  id: string;
  name: string;
  logo: string; // Base64 or URL
  url: string; // Clickable link
}

export interface SponsorsData {
  showSection: boolean;
  title: string;
  sponsors: Sponsor[];
}

export interface SmpbButtonSettings {
  isActive: boolean;
  label: string;
  year: string;
  link: string;
  openInNewTab: boolean;
}

export interface AuthSettings {
  username: string;
  password: string;
  showDemoCredentials: boolean;
}

export interface SEOData {
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  ogImage: string;
  ogType: string;
  robots: string;
  canonicalUrl: string;
  googleVerification: string;
  bingVerification: string;
  googleAnalyticsId: string;
}

export interface DailyView {
  date: string;
  views: number;
  sessions: number;
}

export interface AnalyticsData {
  totalPageViews: number;
  totalSessions: number;
  dailyViews: DailyView[];
  pageViews: Record<string, number>;
  referrers: Record<string, number>;
  lastUpdated: string;
}

export function extractYoutubeId(url: string): string | null {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

export function getYoutubeThumbnail(url: string): string {
  const id = extractYoutubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : '';
}

export const NEWS_CATEGORIES = ['Semua', 'Prestasi', 'OSIS', 'Pramuka', 'Akademik', 'Olahraga', 'Seni'];
export const DEFAULT_GALLERY_CATEGORIES = ['Akademik', 'Event', 'Wisata', 'Seni', 'Olahraga', 'Video'];
export const GALLERY_CATEGORIES = ['Semua', ...DEFAULT_GALLERY_CATEGORIES];
export const AGENDA_TYPES = ['Ujian', 'Rapat', 'Kegiatan', 'Libur', 'Ekstrakurikuler'];

export const CATEGORY_COLORS: Record<string, string> = {
  Prestasi: 'bg-amber-100 text-amber-800',
  OSIS: 'bg-blue-100 text-blue-800',
  Pramuka: 'bg-green-100 text-green-800',
  Akademik: 'bg-purple-100 text-purple-800',
  Olahraga: 'bg-red-100 text-red-800',
  Seni: 'bg-pink-100 text-pink-800',
  Video: 'bg-indigo-100 text-indigo-800',
  Ujian: 'bg-red-100 text-red-700',
  Rapat: 'bg-blue-100 text-blue-700',
  Kegiatan: 'bg-green-100 text-green-700',
  Libur: 'bg-orange-100 text-orange-700',
  Ekstrakurikuler: 'bg-purple-100 text-purple-700',
  Event: 'bg-cyan-100 text-cyan-800',
  Wisata: 'bg-teal-100 text-teal-800',
};

export const GRADIENTS = [
  'linear-gradient(135deg, #0ea5e9, #0369a1)',
  'linear-gradient(135deg, #f59e0b, #b45309)',
  'linear-gradient(135deg, #10b981, #047857)',
  'linear-gradient(135deg, #8b5cf6, #6d28d9)',
  'linear-gradient(135deg, #ef4444, #b91c1c)',
  'linear-gradient(135deg, #ec4899, #be185d)',
  'linear-gradient(135deg, #06b6d4, #0e7490)',
  'linear-gradient(135deg, #84cc16, #4d7c0f)',
  'linear-gradient(135deg, #f97316, #c2410c)',
];

export const initialContactInfo: ContactInfo = {
  address: 'Jl. Pendidikan No. 1, Kota Pelajar, Indonesia',
  phone: '(021) 12345678',
  email: 'info@sekolah.sch.id',
  hours: 'Senin - Jumat: 07:00 - 15:00 WIB',
  mapQuery: 'Sekolah',
  mapEmbedUrl: '',
  mapDirectionsUrl: '',
  facebook: 'https://facebook.com',
  instagram: 'https://instagram.com',
  youtube: 'https://youtube.com',
};

export function getGoogleMapsEmbedUrl(contactInfo: Pick<ContactInfo, 'mapEmbedUrl' | 'mapQuery' | 'address'>): string {
  if (contactInfo.mapEmbedUrl?.trim()) {
    return contactInfo.mapEmbedUrl.trim();
  }

  const fallbackQuery = contactInfo.mapQuery?.trim() || contactInfo.address?.trim() || 'Sekolah';
  return `https://maps.google.com/maps?q=${encodeURIComponent(fallbackQuery)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
}

export function getGoogleMapsDirectionsUrl(contactInfo: Pick<ContactInfo, 'mapDirectionsUrl' | 'mapQuery' | 'address'>): string {
  if (contactInfo.mapDirectionsUrl?.trim()) {
    return contactInfo.mapDirectionsUrl.trim();
  }

  const destination = contactInfo.mapQuery?.trim() || contactInfo.address?.trim() || 'Sekolah';
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destination)}`;
}

export const initialSliderItems: SliderItem[] = [
  {
    id: '1',
    title: 'Membangun Generasi Cerdas & Berkarakter',
    subtitle: 'Membentuk generasi muda yang cerdas, berkarakter unggul, berakhlak mulia, dan siap menghadapi tantangan masa depan.',
    image: '',
    backgroundColor: '#16a34a',
    buttonText: 'Profil Sekolah',
    buttonLink: '/profil',
    overlayOpacity: 70,
  },
  {
    id: '2',
    title: 'Pendaftaran Peserta Didik Baru',
    subtitle: 'Bergabunglah bersama keluarga besar sekolah kami. Raih masa depan cemerlang bersama kami.',
    image: '',
    backgroundColor: '#059669',
    buttonText: 'Info Selengkapnya',
    buttonLink: '/kontak',
    overlayOpacity: 70,
  },
  {
    id: '3',
    title: 'Prestasi di Berbagai Bidang',
    subtitle: 'Peserta didik terus menorehkan prestasi membanggakan di berbagai kompetisi akademik dan non-akademik.',
    image: '',
    backgroundColor: '#15803d',
    buttonText: 'Lihat Berita',
    buttonLink: '/berita',
    overlayOpacity: 70,
  },
];

export const initialStatsData: StatsData = {
  siswaAktif: '500+',
  tenagaPendidik: '30+',
  prestasi: '50+',
  akreditasi: 'A',
};

export const initialBrandSettings: BrandSettings = {
  schoolLogo: '',
  showLogo: true,
  schoolName: 'Nama Sekolah',
  schoolTagline: 'Unggul, Berkarakter, Berprestasi',
};

export const initialSchoolIdentitySettings: SchoolIdentitySettings = {
  schemaVersion: 1,
  revision: 1,
  updatedAt: new Date().toISOString(),
  themePreset: 'forest',
  bottomNavStyle: 'floating',
  schoolName: 'Nama Sekolah',
  schoolShortName: 'Sekolah',
  schoolTagline: 'Unggul, Berkarakter, Berprestasi',
  legalName: 'Yayasan Pendidikan Sekolah',
  schoolLogo: '',
  showLogo: true,
  footerDescription: 'Membentuk generasi cerdas, berkarakter unggul, dan berakhlak mulia melalui pendidikan yang berkualitas.',
  address: 'Jl. Pendidikan No. 1, Kota Pelajar, Indonesia',
  phone: '(021) 12345678',
  email: 'info@sekolah.sch.id',
  hours: 'Senin - Jumat: 07:00 - 15:00 WIB',
  mapQuery: 'Sekolah',
  mapEmbedUrl: '',
  mapDirectionsUrl: '',
  facebook: 'https://facebook.com',
  instagram: 'https://instagram.com',
  youtube: 'https://youtube.com',
  primaryColor: '#16a34a',
  secondaryColor: '#059669',
  accentColor: '#eab308',
  footerBackgroundColor: '#064e3b',
  legalNotice: 'Dibuat dengan sepenuh hati untuk pendidikan Indonesia',
  copyrightText: '',
  showCurrentYear: true,
  developerName: '',
  developerUrl: '',
};

export const initialDownloadDocumentsData: DownloadDocumentsData = {
  pageTitle: 'Download Dokumen',
  pageDescription: 'Silakan pilih dokumen yang dibutuhkan lalu buka atau unduh melalui tautan Google Drive yang tersedia.',
  showPage: true,
  documents: [],
};

export const initialInstagramSettings: InstagramSettings = {
  username: '@sekolah_official',
  profileUrl: 'https://www.instagram.com',
  showSection: true,
  sectionTitle: 'Instagram Resmi',
  embedType: 'widget',
  widgetCode: '',
  posts: [],
};

export const initialFooterCredit: FooterCredit = {
  copyrightText: '',
  rightText: 'Dibuat dengan sepenuh hati untuk pendidikan Indonesia',
  showYear: true,
  schoolName: 'Nama Sekolah',
  developerName: '',
  developerUrl: '',
};

export const initialSEOData: SEOData = {
  metaTitle: 'Website Resmi Sekolah',
  metaDescription: 'Website resmi sekolah - Informasi PPDB, berita kegiatan terbaru, agenda sekolah, dan galeri prestasi.',
  metaKeywords: 'sekolah, portal sekolah, website sekolah, profil sekolah, berita sekolah, agenda kegiatan, ppdb',
  ogImage: '',
  ogType: 'website',
  robots: 'index, follow',
  canonicalUrl: '',
  googleVerification: '',
  bingVerification: '',
  googleAnalyticsId: '',
};

export const initialAnalyticsData: AnalyticsData = {
  totalPageViews: 0,
  totalSessions: 0,
  dailyViews: [],
  pageViews: {},
  referrers: {},
  lastUpdated: new Date().toISOString(),
};

export const initialProfileData: ProfileData = {
  about: '<p>Sekolah kami berkomitmen untuk memberikan pendidikan yang berkualitas dengan berlandaskan nilai-nilai karakter, keilmuan, dan budi pekerti luhur.</p><p>Dengan tenaga pendidik yang kompeten dan lingkungan belajar yang kondusif, sekolah berupaya mencetak generasi muda yang cerdas, terampil, dan berakhlak mulia.</p>',
  visi: 'Mewujudkan peserta didik yang cerdas, berkarakter unggul, berprestasi, dan berakhlak mulia.',
  misi: [
    'Menyelenggarakan pendidikan yang berkualitas dan relevan dengan perkembangan zaman.',
    'Mengembangkan potensi akademik dan non-akademik peserta didik secara optimal.',
    'Membentuk karakter peserta didik yang beriman, disiplin, dan berakhlak mulia.',
    'Menumbuhkan semangat belajar, berkarya, dan berkompetisi yang sehat.',
    'Menciptakan lingkungan sekolah yang bersih, nyaman, aman, dan kondusif.',
    'Menjalin kerjasama yang harmonis dengan orang tua, masyarakat, dan mitra terkait.',
  ],
  sambutanKepsek: '<p>Assalamualaikum Wr. Wb. / Salam Sejahtera. Selamat datang di website resmi sekolah kami.</p><p>Website ini hadir sebagai media informasi dan komunikasi bagi seluruh civitas akademika, alumni, wali murid, serta masyarakat umum. Kami berharap melalui website ini, informasi seputar kegiatan, prestasi, dan perkembangan sekolah dapat diakses dengan mudah dan transparan.</p><p>Kami senantiasa berupaya memberikan pelayanan pendidikan terbaik demi masa depan cerah putra-putri bangsa.</p><p>Terima kasih atas kepercayaan dan dukungan yang diberikan kepada sekolah kami.</p>',
  namaKepsek: 'Nama Kepala Sekolah, M.Pd',
  jabatanKepsek: 'Kepala Sekolah',
  fotoKepsek: '',
  facilities: [
    'Ruang Kelas',
    'Laboratorium Komputer',
    'Perpustakaan',
    'Tempat Ibadah',
    'Lapangan Olahraga',
    'Kantin Sehat',
    'UKS',
    'Ruang OSIS',
    'Toilet',
    'Ruang Guru',
    'Ruang Tata Usaha',
    'Koperasi Sekolah',
  ],
};

export const initialNews: NewsItem[] = [];

export const initialAgenda: AgendaItem[] = [];

export const initialGallery: GalleryItem[] = [];

export const initialSponsorsData: SponsorsData = {
  showSection: false,
  title: 'Didukung Oleh',
  sponsors: [],
};

export interface TeacherData {
  id: string;
  name: string;
  position: string;
  subject: string;
  education: string;
  phone: string;
  gender: 'L' | 'P';
  photo: string;
  socialMedia: {
    facebook?: string;
    instagram?: string;
    youtube?: string;
    whatsapp?: string;
  };
}

export const initialSmpbButtonSettings: SmpbButtonSettings = {
  isActive: false,
  label: 'SMPB',
  year: new Date().getFullYear().toString(),
  link: '',
  openInNewTab: true,
};

export const initialTeachers: TeacherData[] = [];

export const initialAuthSettings: AuthSettings = {
  username: 'admin',
  password: 'admin123',
  showDemoCredentials: true,
};

export interface ExtracurricularItem {
  id: string;
  name: string;
  category: string;
  description: string;
  schedule: string;
  location: string;
  coach: string;
  image: string;
  achievements?: string[];
  isActive: boolean;
  order?: number;
  galleryId?: string;
}

export const DEFAULT_ESKUL_CATEGORIES = [
  'Keagamaan',
  'Olahraga',
  'Seni & Budaya',
  'Kepemimpinan',
  'Akademik',
  'Otomotif',
];

export const ESKUL_CATEGORIES = [
  'Semua',
  'Keagamaan',
  'Olahraga',
  'Seni & Budaya',
  'Kepemimpinan',
  'Akademik',
  'Otomotif',
];

export const initialExtracurricular: ExtracurricularItem[] = [
  {
    id: 'eskul-1',
    name: 'Pramuka (Gugus Depan)',
    category: 'Kepemimpinan',
    description: 'Kegiatan kepanduan untuk membentuk karakter disiplin, kemandirian, dan kepemimpinan berwawasan kebangsaan.',
    schedule: 'Jumat, 14:00 - 16:30 WIB',
    location: 'Halaman Utama Sekolah',
    coach: 'Kak Ahmad, S.Pd',
    image: '',
    achievements: ['Juara 2 Lomba Tingkat Penegak', 'Pramuka Garuda Berprestasi'],
    isActive: true,
    order: 1,
  },
  {
    id: 'eskul-2',
    name: 'Seni Musik & Rebana',
    category: 'Seni & Budaya',
    description: 'Wadah pembinaan bakat seni musik, olah vokal, dan perkusi tradisional/modern.',
    schedule: 'Sabtu, 13:30 - 15:30 WIB',
    location: 'Aula Sekolah',
    coach: 'Kak Syukron, S.Pd.I',
    image: '',
    achievements: ['Juara 1 Festival Seni Pelajar', 'Penampil Terbaik Pentas Seni'],
    isActive: true,
    order: 2,
  },
  {
    id: 'eskul-3',
    name: 'Klub Futsal & Sepak Bola',
    category: 'Olahraga',
    description: 'Pengembangan bakat olahraga futsal, kebugaran jasmani, strategi bertanding, dan sportivitas tim.',
    schedule: 'Selasa & Kamis, 15:30 - 17:00 WIB',
    location: 'Lapangan Olahraga',
    coach: 'Coach Hendra',
    image: '',
    achievements: ['Juara Turnamen Antar Sekolah'],
    isActive: true,
    order: 3,
  },
  {
    id: 'eskul-4',
    name: 'Klub Sains & Olimpiade',
    category: 'Akademik',
    description: 'Bimbingan intensif persiapan kompetisi dan olimpiade sains serta pengembangan riset ilmiah remaja.',
    schedule: 'Senin & Rabu, 15:00 - 16:30 WIB',
    location: 'Laboratorium IPA',
    coach: 'Ibu Nurul, M.Si',
    image: '',
    achievements: ['Medali Perunggu Olimpiade Sains'],
    isActive: true,
    order: 4,
  },
  {
    id: 'eskul-5',
    name: 'Palang Merah Remaja (PMR)',
    category: 'Kepemimpinan',
    description: 'Pelatihan pertolongan pertama, kepedulian sosial kemanusiaan, dan tanggap darurat bencana.',
    schedule: 'Rabu, 14:00 - 16:00 WIB',
    location: 'Ruang UKS',
    coach: 'Kak Azizah, S.Kep',
    image: '',
    achievements: ['PMR Teladan Tingkat Daerah'],
    isActive: true,
    order: 5,
  },
  {
    id: 'eskul-6',
    name: 'Seni Rupa & Kaligrafi',
    category: 'Seni & Budaya',
    description: 'Mempelajari ragam seni lukis, desain grafis dasar, dan seni kaligrafi kanvas.',
    schedule: 'Sabtu, 09:00 - 11:30 WIB',
    location: 'Laboratorium Seni',
    coach: 'Bapak Rahman, S.Sn',
    image: '',
    achievements: ['Juara 2 Lomba Cipta Seni Pelajar'],
    isActive: true,
    order: 6,
  },
];


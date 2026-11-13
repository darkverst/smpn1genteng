import {
  type BottomNavStyle,
  type BrandSettings,
  type ButtonStyle,
  type CardStyle,
  type ContactInfo,
  type FooterCredit,
  type HeroCurveStyle,
  type SambutanStyle,
  type IconStyle,
  initialSchoolIdentitySettings,
  type SchoolIdentitySettings,
} from '../types';

export const SCHOOL_IDENTITY_SCHEMA_VERSION = 1;

export const ICON_STYLES = [
  {
    id: 'material' as const,
    label: 'Material Design',
    badge: 'Elevated & Crisp',
    description: 'Ikon tegas berbingkai elevasi halus dengan bayangan khas Google Material Design.',
  },
  {
    id: '3d' as const,
    label: '3D Clay & Glass',
    badge: 'Timbul & Glossy',
    description: 'Ikon timbul bervolume 3D dengan efek glossy bevel dan bayangan berlapis ceria.',
  },
  {
    id: 'flat' as const,
    label: 'Flat Design',
    badge: 'Minimalis Bersih',
    description: 'Ikon datar bersih tanpa drop-shadow atau gradien tebal, modern dan elegan.',
  },
  {
    id: 'outline' as const,
    label: 'Modern Outline',
    badge: 'Garis Presisi',
    description: 'Ikon garis sleek dengan bingkai tepi bergaris tegas dan latar transparan.',
  },
  {
    id: 'duotone' as const,
    label: 'Duotone Glow',
    badge: 'Neon Ambient',
    description: 'Ikon dua warna cerah dengan pendaran cahaya neon halus di sekelilingnya.',
  },
] as const;

export const VALID_ICON_STYLES: IconStyle[] = ['material', '3d', 'flat', 'outline', 'duotone'];

export function sanitizeIconStyle(value: unknown, fallback: IconStyle = 'material'): IconStyle {
  return typeof value === 'string' && VALID_ICON_STYLES.includes(value as IconStyle)
    ? (value as IconStyle)
    : fallback;
}

export const BUTTON_STYLES = [
  {
    id: 'rounded' as const,
    label: 'Modern Rounded',
    badge: 'Rounded-xl',
    description: 'Sudut membulat modern proporsional dengan bayangan halus, nyaman di segala layar.',
  },
  {
    id: 'pill' as const,
    label: 'Pill Capsule',
    badge: 'Rounded-full',
    description: 'Bentuk kapsul lonjong membulat penuh yang ramah, santai, dan dinamis.',
  },
  {
    id: 'flat' as const,
    label: 'Flat Design',
    badge: 'Tegas & Rapi',
    description: 'Sudut tegas minimalis tanpa gradien, fokus tinggi pada keterbacaan konten.',
  },
  {
    id: '3d' as const,
    label: '3D Pressable Clay',
    badge: 'Efek Tekan 3D',
    description: 'Tombol timbul bervolume dengan border bawah 3D yang membal nyata saat diklik.',
  },
  {
    id: 'glass' as const,
    label: 'Glassmorphism',
    badge: 'Kaca Transparan',
    description: 'Efek frosted glass transparan mewah dengan border pantulan cahaya dan blur.',
  },
  {
    id: 'glow' as const,
    label: 'Neon Glow',
    badge: 'Pendar Ambient',
    description: 'Tombol modern bergradien hidup dengan pendaran bayangan neon sesuai warna tema.',
  },
] as const;

export const VALID_BUTTON_STYLES: ButtonStyle[] = ['rounded', 'pill', 'flat', '3d', 'glass', 'glow'];

export function sanitizeButtonStyle(value: unknown, fallback: ButtonStyle = 'rounded'): ButtonStyle {
  return typeof value === 'string' && VALID_BUTTON_STYLES.includes(value as ButtonStyle)
    ? (value as ButtonStyle)
    : fallback;
}

export const CARD_STYLES = [
  {
    id: 'modern' as const,
    label: 'Modern Soft',
    badge: 'Default Clean',
    description: 'Kartu membulat rounded-2xl dengan bayangan lembut dan border abu-abu bersih.',
  },
  {
    id: 'flat' as const,
    label: 'Flat Clean',
    badge: 'Datar & Presisi',
    description: 'Kartu kotak rapi tanpa drop-shadow, border 1.5px tegas, gaya web tech modern.',
  },
  {
    id: '3d' as const,
    label: '3D Claymorphism',
    badge: 'Pop Art 3D',
    description: 'Kartu timbul dengan bayangan solid bertingkat 4px yang ceria dan menonjol.',
  },
  {
    id: 'glass' as const,
    label: 'Glassmorphism',
    badge: 'Frosted Glass',
    description: 'Kartu kaca transparan elegan dengan backdrop blur dan kilauan batas tipis.',
  },
  {
    id: 'bordered' as const,
    label: 'Academic Bordered',
    badge: 'Outline Resmi',
    description: 'Desain akademik resmi dengan border outline presisi dan kesan formal terpercaya.',
  },
] as const;

export const VALID_CARD_STYLES: CardStyle[] = ['modern', 'flat', '3d', 'glass', 'bordered'];

export function sanitizeCardStyle(value: unknown, fallback: CardStyle = 'modern'): CardStyle {
  return typeof value === 'string' && VALID_CARD_STYLES.includes(value as CardStyle)
    ? (value as CardStyle)
    : fallback;
}

export const BOTTOM_NAV_STYLES = [
  {
    id: 'floating' as const,
    label: 'Melayang (Floating Island)',
    description: 'Pill melayang dengan sudut membulat dan bayangan elegan.',
  },
  {
    id: 'classic' as const,
    label: 'Klasik (Docked Bar)',
    description: 'Bilah navigasi standar menempel penuh di tepi bawah layar.',
  },
  {
    id: 'dock' as const,
    label: 'Dynamic Dock (macOS)',
    description: 'Dock terpusat dengan efek glow aksen pada menu aktif.',
  },
  {
    id: 'minimal' as const,
    label: 'Minimalis (Compact Sleek)',
    description: 'Desain ringkas dan ramping, memaksimalkan area konten.',
  },
  {
    id: 'glass' as const,
    label: 'Glassmorphism (Frosted)',
    description: 'Efek kaca transparan modern dengan pantulan cahaya halus.',
  },
  {
    id: 'pill' as const,
    label: 'Pill Capsule (Oval Ramping)',
    description: 'Kapsul oval ramping terpusat dengan visual modern kekinian.',
  },
  {
    id: 'curved' as const,
    label: 'Curved Notch (Bilah Melengkung)',
    description: 'Bilah bawah dengan lekukan halus dan tombol aktif timbul menonjol.',
  },
  {
    id: 'glow' as const,
    label: 'Neon Glow (Cyber Accent)',
    description: 'Desain berbingkai neon dengan pendaran cahaya warna utama.',
  },
] as const;

export const VALID_BOTTOM_NAV_STYLES: BottomNavStyle[] = [
  'floating',
  'classic',
  'dock',
  'minimal',
  'glass',
  'pill',
  'curved',
  'glow',
];

function sanitizeBottomNavStyle(value: unknown, fallback: BottomNavStyle = 'floating'): BottomNavStyle {
  return typeof value === 'string' && VALID_BOTTOM_NAV_STYLES.includes(value as BottomNavStyle)
    ? (value as BottomNavStyle)
    : fallback;
}

export const HERO_CURVE_STYLES = [
  {
    id: 'wave-double' as const,
    label: 'Gelombang Ganda 3D (Layered Wave)',
    badge: 'Rekomendasi',
    description: 'Dua lapis gelombang lembut bertingkat dengan kedalaman bayangan dan opasitas dinamis.',
  },
  {
    id: 'wave-smooth' as const,
    label: 'Gelombang Asimetris (Smooth Flow)',
    badge: 'Dinamis',
    description: 'Lekukan ombak S-curve asimetris elegan yang mengalir berirama dari sudut ke sudut.',
  },
  {
    id: 'arc-concave' as const,
    label: 'Busur Cekung Elegan (Concave Arc)',
    badge: 'Fokus & Mewah',
    description: 'Lengkungan kubah cekung anggun yang memusatkan pandangan ke konten tengah hero slide.',
  },
  {
    id: 'wave-peaks' as const,
    label: 'Puncak Kembar (Twin Crests)',
    badge: 'Simetris & Ceria',
    description: 'Dua puncak lengkungan berirama harmonis khas portal akademik modern berstandar tinggi.',
  },
  {
    id: 'curve-glow' as const,
    label: 'Garis Pendar Aksen (Accent Crest)',
    badge: 'Garis Kilau Aksen',
    description: 'Lengkungan landai dengan garis pembatas bergradasi warna aksen sekolah yang bercahaya.',
  },
  {
    id: 'wave-classic' as const,
    label: 'Gelombang Klasik (Default Asli)',
    badge: 'Bentuk Dasar',
    description: 'Garis lengkung gelombang tunggal standar bawaan awal website.',
  },
] as const;

export const VALID_HERO_CURVE_STYLES: HeroCurveStyle[] = [
  'wave-double',
  'wave-smooth',
  'arc-concave',
  'wave-peaks',
  'curve-glow',
  'wave-classic',
];

export function sanitizeHeroCurveStyle(value: unknown, fallback: HeroCurveStyle = 'wave-double'): HeroCurveStyle {
  return typeof value === 'string' && VALID_HERO_CURVE_STYLES.includes(value as HeroCurveStyle)
    ? (value as HeroCurveStyle)
    : fallback;
}

export const SAMBUTAN_STYLES = [
  {
    id: 'modern-card' as const,
    label: 'Modern Card & Glow',
    badge: 'Populer & Seimbang',
    description: 'Tata letak 2 kolom modern dengan kartu foto floating frosted glass, quote serif, dan 4 kartu pilar info.',
  },
  {
    id: 'executive-split' as const,
    label: 'Executive Split Card',
    badge: 'Mewah & Berwibawa',
    description: 'Desain eksekutif formal dengan border aksen elegan, blok kutipan highlight, dan tipografi berkelas.',
  },
  {
    id: 'quote-focus' as const,
    label: 'Kutipan Terpusat (Quote Focus)',
    badge: 'Fokus & Minimalis',
    description: 'Tata letak terpusat dengan quote serif raksasa, avatar melingkar berlis ganda, dan ringkasan pilar terpadu.',
  },
  {
    id: 'framed-academic' as const,
    label: 'Bingkai Akademik Formal',
    badge: 'Klasik Prestisius',
    description: 'Gaya piagam akademik dengan sudut dekoratif, bingkai foto berlis ganda, dan lencana jabatan resmi.',
  },
  {
    id: 'glass-float' as const,
    label: 'Glassmorphism & Floating Elements',
    badge: 'Ultra Modern',
    description: 'Efek kaca transparan (backdrop-blur) dengan pendaran warna aurora dan kartu pilar melayang.',
  },
  {
    id: 'overlap-banner' as const,
    label: 'Banner Asimetris 3D (Overlap)',
    badge: 'Dinamis Kontemporer',
    description: 'Foto kepala sekolah memotong batas banner gradasi primer, menghadirkan ilusi kedalaman 3D yang berani.',
  },
] as const;

export const VALID_SAMBUTAN_STYLES: SambutanStyle[] = [
  'modern-card',
  'executive-split',
  'quote-focus',
  'framed-academic',
  'glass-float',
  'overlap-banner',
];

export function sanitizeSambutanStyle(value: unknown, fallback: SambutanStyle = 'modern-card'): SambutanStyle {
  return typeof value === 'string' && VALID_SAMBUTAN_STYLES.includes(value as SambutanStyle)
    ? (value as SambutanStyle)
    : fallback;
}

export const SCHOOL_THEME_PRESETS = [
  {
    id: 'emerald',
    label: 'Hijau Madrasah',
    category: 'Islami & Madrasah',
    description: 'Hijau zamrud sejuk khas madrasah, pesantren, dan yayasan Islam.',
    primaryColor: '#059669',
    secondaryColor: '#047857',
    accentColor: '#f59e0b',
    footerBackgroundColor: '#064e3b',
  },
  {
    id: 'forest',
    label: 'Hijau Pinus',
    category: 'Alami & Lingkungan',
    description: 'Nuansa hijau alam sejuk dan menenangkan dengan aksen emas.',
    primaryColor: '#166534',
    secondaryColor: '#15803d',
    accentColor: '#eab308',
    footerBackgroundColor: '#14532d',
  },
  {
    id: 'ocean',
    label: 'Biru Toska',
    category: 'Umum & Kejuruan',
    description: 'Paduan biru-toska modern yang segar, ramah, dan profesional.',
    primaryColor: '#0f766e',
    secondaryColor: '#0f5aa6',
    accentColor: '#f59e0b',
    footerBackgroundColor: '#082f49',
  },
  {
    id: 'sapphire',
    label: 'Biru Negeri',
    category: 'Negeri & Formal',
    description: 'Biru formal terpercaya, standar untuk SMA/SMK Negeri dan institusi resmi.',
    primaryColor: '#1d4ed8',
    secondaryColor: '#1e40af',
    accentColor: '#38bdf8',
    footerBackgroundColor: '#172554',
  },
  {
    id: 'royal',
    label: 'Royal Indigo',
    category: 'Modern & Unggulan',
    description: 'Ungu-indigo modern, berkelas, melambangkan prestasi dan teknologi.',
    primaryColor: '#4f46e5',
    secondaryColor: '#4338ca',
    accentColor: '#a855f7',
    footerBackgroundColor: '#1e1b4b',
  },
  {
    id: 'maroon',
    label: 'Maroon Klasik',
    category: 'Akademik Klasik',
    description: 'Merah marun berwibawa, mencerminkan almamater kuat dan tradisi pendidikan.',
    primaryColor: '#9f1239',
    secondaryColor: '#881337',
    accentColor: '#f59e0b',
    footerBackgroundColor: '#4c0519',
  },
  {
    id: 'crimson',
    label: 'Merah Semangat',
    category: 'Dinamis & Aktif',
    description: 'Merah berani penuh energi untuk sekolah berprestasi tinggi dan olahraga.',
    primaryColor: '#dc2626',
    secondaryColor: '#b91c1c',
    accentColor: '#fbbf24',
    footerBackgroundColor: '#450a0a',
  },
  {
    id: 'sunset',
    label: 'Oranye Kreatif',
    category: 'Vokasi & Seni',
    description: 'Oranye ceria penuh inspirasi, cocok untuk SMK kreatif dan seni budaya.',
    primaryColor: '#ea580c',
    secondaryColor: '#c2410c',
    accentColor: '#facc15',
    footerBackgroundColor: '#431407',
  },
  {
    id: 'amber',
    label: 'Emas Cendikia',
    category: 'Hangat & Humanis',
    description: 'Warna hangat keemasan yang melambangkan kejayaan dan kemuliaan ilmu.',
    primaryColor: '#d97706',
    secondaryColor: '#b45309',
    accentColor: '#fde047',
    footerBackgroundColor: '#451a03',
  },
  {
    id: 'teal',
    label: 'Teal Edukasi',
    category: 'Modern & Terbuka',
    description: 'Teal seimbang dan bersih, ramah untuk semua jenjang pendidikan.',
    primaryColor: '#0d9488',
    secondaryColor: '#0f766e',
    accentColor: '#f59e0b',
    footerBackgroundColor: '#134e4a',
  },
  {
    id: 'cyber',
    label: 'Cyan Teknologi',
    category: 'Sains & TI',
    description: 'Nuansa biru sains dan digital untuk SMK IT, lab komputer, dan teknologi.',
    primaryColor: '#0284c7',
    secondaryColor: '#0369a1',
    accentColor: '#06b6d4',
    footerBackgroundColor: '#082f49',
  },
  {
    id: 'midnight',
    label: 'Midnight Slate',
    category: 'Eksklusif & Futuristik',
    description: 'Gelap elegan profesional dengan kontras aksen modern yang memukau.',
    primaryColor: '#334155',
    secondaryColor: '#1e293b',
    accentColor: '#38bdf8',
    footerBackgroundColor: '#0f172a',
  },
] as const;

export type ThemePresetId = typeof SCHOOL_THEME_PRESETS[number]['id'];

const HEX_COLOR_REGEX = /^#(?:[0-9a-fA-F]{3}){1,2}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function sanitizeString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value.trim() : fallback;
}

function sanitizeBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

function sanitizePositiveInt(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? Math.floor(value) : fallback;
}

function sanitizeUrl(value: unknown, fallback = ''): string {
  const trimmed = sanitizeString(value, fallback);
  if (!trimmed) return '';
  if (trimmed.startsWith('data:image/')) return trimmed;

  try {
    const parsed = new URL(trimmed);
    return ['http:', 'https:'].includes(parsed.protocol) ? trimmed : fallback;
  } catch {
    return fallback;
  }
}

function sanitizeColor(value: unknown, fallback: string): string {
  const trimmed = sanitizeString(value, fallback);
  return HEX_COLOR_REGEX.test(trimmed) ? trimmed : fallback;
}

function sanitizeIsoDate(value: unknown, fallback: string): string {
  const trimmed = sanitizeString(value, fallback);
  return Number.isNaN(Date.parse(trimmed)) ? fallback : trimmed;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const sanitized = hex.replace('#', '').trim();
  if (![3, 6].includes(sanitized.length)) return null;

  const normalized = sanitized.length === 3
    ? sanitized.split('').map((char) => char + char).join('')
    : sanitized;

  const int = Number.parseInt(normalized, 16);
  if (Number.isNaN(int)) return null;

  return {
    r: (int >> 16) & 255,
    g: (int >> 8) & 255,
    b: int & 255,
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((value) => clamp(Math.round(value), 0, 255).toString(16).padStart(2, '0')).join('')}`;
}

function mixHex(colorA: string, colorB: string, amount: number): string {
  const rgbA = hexToRgb(colorA);
  const rgbB = hexToRgb(colorB);
  if (!rgbA || !rgbB) return colorA;

  return rgbToHex(
    rgbA.r + (rgbB.r - rgbA.r) * amount,
    rgbA.g + (rgbB.g - rgbA.g) * amount,
    rgbA.b + (rgbB.b - rgbA.b) * amount,
  );
}

function darkenHex(color: string, amount: number): string {
  return mixHex(color, '#000000', amount);
}

function lightenHex(color: string, amount: number): string {
  return mixHex(color, '#ffffff', amount);
}

export function getThemePresetById(presetId: string | undefined) {
  return SCHOOL_THEME_PRESETS.find((preset) => preset.id === presetId);
}

export function applyThemePreset(identity: SchoolIdentitySettings, presetId: string): SchoolIdentitySettings {
  const preset = getThemePresetById(presetId);
  if (!preset) return { ...identity, themePreset: 'custom' };

  return {
    ...identity,
    themePreset: preset.id,
    primaryColor: preset.primaryColor,
    secondaryColor: preset.secondaryColor,
    accentColor: preset.accentColor,
    footerBackgroundColor: preset.footerBackgroundColor,
  };
}

export function createTailwindThemeScale(identity: Pick<SchoolIdentitySettings, 'primaryColor' | 'accentColor'>) {
  const primaryBase = identity.primaryColor;
  const accentBase = identity.accentColor;

  return {
    primary50: lightenHex(primaryBase, 0.92),
    primary100: lightenHex(primaryBase, 0.84),
    primary200: lightenHex(primaryBase, 0.68),
    primary300: lightenHex(primaryBase, 0.46),
    primary400: lightenHex(primaryBase, 0.22),
    primary500: primaryBase,
    primary600: darkenHex(primaryBase, 0.1),
    primary700: darkenHex(primaryBase, 0.22),
    primary800: darkenHex(primaryBase, 0.34),
    primary900: darkenHex(primaryBase, 0.48),
    primary950: darkenHex(primaryBase, 0.62),
    accent300: lightenHex(accentBase, 0.28),
    accent400: lightenHex(accentBase, 0.14),
    accent500: accentBase,
    accent600: darkenHex(accentBase, 0.14),
  };
}

export function createSchoolIdentityFromLegacy(
  brandSettings: BrandSettings,
  contactInfo: ContactInfo,
  footerCredit: FooterCredit,
): SchoolIdentitySettings {
  return normalizeSchoolIdentity({
    ...initialSchoolIdentitySettings,
    themePreset: initialSchoolIdentitySettings.themePreset,
    schoolName: footerCredit.schoolName || brandSettings.schoolName || initialSchoolIdentitySettings.schoolName,
    schoolShortName: brandSettings.schoolName || initialSchoolIdentitySettings.schoolShortName,
    schoolTagline: brandSettings.schoolTagline || initialSchoolIdentitySettings.schoolTagline,
    legalName: footerCredit.schoolName || brandSettings.schoolName || initialSchoolIdentitySettings.legalName,
    schoolLogo: brandSettings.schoolLogo || initialSchoolIdentitySettings.schoolLogo,
    showLogo: brandSettings.showLogo,
    footerDescription: initialSchoolIdentitySettings.footerDescription,
    address: contactInfo.address || initialSchoolIdentitySettings.address,
    phone: contactInfo.phone || initialSchoolIdentitySettings.phone,
    email: contactInfo.email || initialSchoolIdentitySettings.email,
    hours: contactInfo.hours || initialSchoolIdentitySettings.hours,
    mapQuery: contactInfo.mapQuery || initialSchoolIdentitySettings.mapQuery,
    mapEmbedUrl: contactInfo.mapEmbedUrl || initialSchoolIdentitySettings.mapEmbedUrl,
    mapDirectionsUrl: contactInfo.mapDirectionsUrl || initialSchoolIdentitySettings.mapDirectionsUrl,
    facebook: contactInfo.facebook || '',
    instagram: contactInfo.instagram || '',
    youtube: contactInfo.youtube || '',
    legalNotice: footerCredit.rightText || initialSchoolIdentitySettings.legalNotice,
    copyrightText: footerCredit.copyrightText || '',
    showCurrentYear: footerCredit.showYear,
    developerName: footerCredit.developerName || '',
    developerUrl: footerCredit.developerUrl || '',
  });
}

export function buildLegacySettingsFromSchoolIdentity(identity: SchoolIdentitySettings): {
  brandSettings: BrandSettings;
  contactInfo: ContactInfo;
  footerCredit: FooterCredit;
} {
  const schoolNameForHeader = identity.schoolShortName || identity.schoolName;

  return {
    brandSettings: {
      schoolLogo: identity.schoolLogo,
      showLogo: identity.showLogo,
      schoolName: schoolNameForHeader,
      schoolTagline: identity.schoolTagline,
    },
    contactInfo: {
      address: identity.address,
      phone: identity.phone,
      email: identity.email,
      hours: identity.hours,
      mapQuery: identity.mapQuery,
      mapEmbedUrl: identity.mapEmbedUrl,
      mapDirectionsUrl: identity.mapDirectionsUrl,
      facebook: identity.facebook,
      instagram: identity.instagram,
      youtube: identity.youtube,
    },
    footerCredit: {
      copyrightText: identity.copyrightText,
      rightText: identity.legalNotice,
      showYear: identity.showCurrentYear,
      schoolName: identity.legalName || identity.schoolName,
      developerName: identity.developerName,
      developerUrl: identity.developerUrl,
    },
  };
}

export function normalizeSchoolIdentity(raw: unknown, fallback: SchoolIdentitySettings = initialSchoolIdentitySettings): SchoolIdentitySettings {
  const source = raw && typeof raw === 'object' && !Array.isArray(raw)
    ? raw as Partial<SchoolIdentitySettings>
    : {};

  return {
    schemaVersion: SCHOOL_IDENTITY_SCHEMA_VERSION,
    revision: sanitizePositiveInt(source.revision, fallback.revision),
    updatedAt: sanitizeIsoDate(source.updatedAt, fallback.updatedAt),
    themePreset: sanitizeString(source.themePreset, fallback.themePreset),
    bottomNavStyle: sanitizeBottomNavStyle(source.bottomNavStyle, fallback.bottomNavStyle || 'floating'),
    heroCurveStyle: sanitizeHeroCurveStyle(source.heroCurveStyle, fallback.heroCurveStyle || 'wave-double'),
    sambutanStyle: sanitizeSambutanStyle(source.sambutanStyle, fallback.sambutanStyle || 'modern-card'),
    iconStyle: sanitizeIconStyle(source.iconStyle, fallback.iconStyle || 'material'),
    buttonStyle: sanitizeButtonStyle(source.buttonStyle, fallback.buttonStyle || 'rounded'),
    cardStyle: sanitizeCardStyle(source.cardStyle, fallback.cardStyle || 'modern'),
    schoolName: sanitizeString(source.schoolName, fallback.schoolName),
    schoolShortName: sanitizeString(source.schoolShortName, fallback.schoolShortName),
    schoolTagline: sanitizeString(source.schoolTagline, fallback.schoolTagline),
    legalName: sanitizeString(source.legalName, fallback.legalName),
    schoolLogo: sanitizeUrl(source.schoolLogo, fallback.schoolLogo),
    showLogo: sanitizeBoolean(source.showLogo, fallback.showLogo),
    footerDescription: sanitizeString(source.footerDescription, fallback.footerDescription),
    address: sanitizeString(source.address, fallback.address),
    phone: sanitizeString(source.phone, fallback.phone),
    email: sanitizeString(source.email, fallback.email),
    hours: sanitizeString(source.hours, fallback.hours),
    mapQuery: sanitizeString(source.mapQuery, fallback.mapQuery),
    mapEmbedUrl: sanitizeUrl(source.mapEmbedUrl, fallback.mapEmbedUrl),
    mapDirectionsUrl: sanitizeUrl(source.mapDirectionsUrl, fallback.mapDirectionsUrl),
    facebook: sanitizeUrl(source.facebook, fallback.facebook),
    instagram: sanitizeUrl(source.instagram, fallback.instagram),
    youtube: sanitizeUrl(source.youtube, fallback.youtube),
    primaryColor: sanitizeColor(source.primaryColor, fallback.primaryColor),
    secondaryColor: sanitizeColor(source.secondaryColor, fallback.secondaryColor),
    accentColor: sanitizeColor(source.accentColor, fallback.accentColor),
    footerBackgroundColor: sanitizeColor(source.footerBackgroundColor, fallback.footerBackgroundColor),
    legalNotice: sanitizeString(source.legalNotice, fallback.legalNotice),
    copyrightText: sanitizeString(source.copyrightText, fallback.copyrightText),
    showCurrentYear: sanitizeBoolean(source.showCurrentYear, fallback.showCurrentYear),
    developerName: sanitizeString(source.developerName, fallback.developerName),
    developerUrl: sanitizeUrl(source.developerUrl, fallback.developerUrl),
  };
}

export function validateSchoolIdentity(identity: SchoolIdentitySettings): string[] {
  const errors: string[] = [];

  if (!identity.schoolName) errors.push('Nama sekolah wajib diisi.');
  if (!identity.schoolShortName) errors.push('Nama singkat sekolah wajib diisi.');
  if (!identity.legalName) errors.push('Nama legal sekolah wajib diisi.');
  if (!identity.address) errors.push('Alamat sekolah wajib diisi.');
  if (!identity.phone) errors.push('Nomor telepon sekolah wajib diisi.');
  if (!identity.email) errors.push('Email sekolah wajib diisi.');
  if (identity.email && !EMAIL_REGEX.test(identity.email)) errors.push('Format email sekolah tidak valid.');

  const urlFields: Array<[string, string]> = [
    ['Logo sekolah', identity.schoolLogo],
    ['Google Maps embed', identity.mapEmbedUrl],
    ['Google Maps directions', identity.mapDirectionsUrl],
    ['Facebook', identity.facebook],
    ['Instagram', identity.instagram],
    ['YouTube', identity.youtube],
    ['URL developer', identity.developerUrl],
  ];

  for (const [label, value] of urlFields) {
    if (!value || value.startsWith('data:image/')) continue;
    try {
      const parsed = new URL(value);
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        errors.push(`${label} harus menggunakan URL http/https yang valid.`);
      }
    } catch {
      errors.push(`${label} harus menggunakan URL yang valid.`);
    }
  }

  const colorFields: Array<[string, string]> = [
    ['Warna utama', identity.primaryColor],
    ['Warna sekunder', identity.secondaryColor],
    ['Warna aksen', identity.accentColor],
    ['Warna footer', identity.footerBackgroundColor],
  ];

  for (const [label, value] of colorFields) {
    if (!HEX_COLOR_REGEX.test(value)) {
      errors.push(`${label} harus menggunakan format hex, misalnya #0f766e.`);
    }
  }

  return errors;
}

export function prepareSchoolIdentityForSave(current: SchoolIdentitySettings, draft: SchoolIdentitySettings): SchoolIdentitySettings {
  const normalized = normalizeSchoolIdentity(draft, current);
  const payload = JSON.stringify({ ...normalized, revision: current.revision, updatedAt: current.updatedAt });
  const currentPayload = JSON.stringify({ ...current, revision: current.revision, updatedAt: current.updatedAt });
  const hasChanged = payload !== currentPayload;

  return {
    ...normalized,
    revision: hasChanged ? current.revision + 1 : current.revision,
    updatedAt: new Date().toISOString(),
  };
}

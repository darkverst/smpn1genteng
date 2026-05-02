import {
  type BrandSettings,
  type ContactInfo,
  type FooterCredit,
  initialSchoolIdentitySettings,
  type SchoolIdentitySettings,
} from '../types';

export const SCHOOL_IDENTITY_SCHEMA_VERSION = 1;

export const SCHOOL_THEME_PRESETS = [
  {
    id: 'ocean',
    label: 'Laut',
    description: 'Biru-hijau modern untuk sekolah umum.',
    primaryColor: '#0f766e',
    secondaryColor: '#0f5aa6',
    accentColor: '#f59e0b',
    footerBackgroundColor: '#082f49',
  },
  {
    id: 'forest',
    label: 'Hutan',
    description: 'Hijau alami dengan aksen hangat.',
    primaryColor: '#166534',
    secondaryColor: '#1d4ed8',
    accentColor: '#eab308',
    footerBackgroundColor: '#14532d',
  },
  {
    id: 'maroon',
    label: 'Maroon',
    description: 'Nuansa formal untuk identitas institusi.',
    primaryColor: '#9f1239',
    secondaryColor: '#7c2d12',
    accentColor: '#f59e0b',
    footerBackgroundColor: '#4c0519',
  },
  {
    id: 'midnight',
    label: 'Midnight',
    description: 'Gelap elegan dengan aksen cerah.',
    primaryColor: '#1d4ed8',
    secondaryColor: '#312e81',
    accentColor: '#f97316',
    footerBackgroundColor: '#111827',
  },
] as const;

type ThemePresetId = typeof SCHOOL_THEME_PRESETS[number]['id'];

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

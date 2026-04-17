import {
  initialAnalyticsData,
  initialAuthSettings,
  initialContactInfo,
  initialFooterCredit,
  initialInstagramSettings,
  initialProfileData,
  initialSEOData,
  initialSmpbButtonSettings,
  initialSponsorsData,
  initialStatsData,
} from '../types';
import { SETTINGS_DB_KEYS } from './settingsKeys';

export const DEFAULT_NEWS_ITEMS = [] as const;
export const DEFAULT_AGENDA_ITEMS = [] as const;
export const DEFAULT_GALLERY_ITEMS = [] as const;
export const DEFAULT_SLIDER_ITEMS = [] as const;
export const DEFAULT_INSTAGRAM_SETTINGS = {
  ...initialInstagramSettings,
  widgetCode: '',
  posts: [],
};
export const DEFAULT_SPONSORS_DATA = {
  ...initialSponsorsData,
  sponsors: [],
};

export const DEFAULT_SETTINGS_BY_KEY: Record<string, unknown> = {
  [SETTINGS_DB_KEYS.news]: DEFAULT_NEWS_ITEMS,
  [SETTINGS_DB_KEYS.agenda]: DEFAULT_AGENDA_ITEMS,
  [SETTINGS_DB_KEYS.gallery]: DEFAULT_GALLERY_ITEMS,
  [SETTINGS_DB_KEYS.contact]: initialContactInfo,
  [SETTINGS_DB_KEYS.slider]: DEFAULT_SLIDER_ITEMS,
  [SETTINGS_DB_KEYS.profile]: initialProfileData,
  [SETTINGS_DB_KEYS.stats]: initialStatsData,
  [SETTINGS_DB_KEYS.footer]: initialFooterCredit,
  [SETTINGS_DB_KEYS.seo]: initialSEOData,
  [SETTINGS_DB_KEYS.analytics]: initialAnalyticsData,
  [SETTINGS_DB_KEYS.instagram]: DEFAULT_INSTAGRAM_SETTINGS,
  [SETTINGS_DB_KEYS.sponsors]: DEFAULT_SPONSORS_DATA,
  [SETTINGS_DB_KEYS.smpbButton]: initialSmpbButtonSettings,
  [SETTINGS_DB_KEYS.auth]: initialAuthSettings,
};

export const REQUIRED_SETTINGS_KEYS = Object.keys(DEFAULT_SETTINGS_BY_KEY);

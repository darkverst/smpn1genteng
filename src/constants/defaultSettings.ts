import {
  initialAgenda,
  initialAnalyticsData,
  initialAuthSettings,
  initialContactInfo,
  initialFooterCredit,
  initialGallery,
  initialInstagramSettings,
  initialNews,
  initialProfileData,
  initialSEOData,
  initialSliderItems,
  initialSmpbButtonSettings,
  initialSponsorsData,
  initialStatsData,
} from '../types';
import { SETTINGS_DB_KEYS } from './settingsKeys';

export const DEFAULT_SETTINGS_BY_KEY: Record<string, unknown> = {
  [SETTINGS_DB_KEYS.news]: initialNews,
  [SETTINGS_DB_KEYS.agenda]: initialAgenda,
  [SETTINGS_DB_KEYS.gallery]: initialGallery,
  [SETTINGS_DB_KEYS.contact]: initialContactInfo,
  [SETTINGS_DB_KEYS.slider]: initialSliderItems,
  [SETTINGS_DB_KEYS.profile]: initialProfileData,
  [SETTINGS_DB_KEYS.stats]: initialStatsData,
  [SETTINGS_DB_KEYS.footer]: initialFooterCredit,
  [SETTINGS_DB_KEYS.seo]: initialSEOData,
  [SETTINGS_DB_KEYS.analytics]: initialAnalyticsData,
  [SETTINGS_DB_KEYS.instagram]: initialInstagramSettings,
  [SETTINGS_DB_KEYS.sponsors]: initialSponsorsData,
  [SETTINGS_DB_KEYS.smpbButton]: initialSmpbButtonSettings,
  [SETTINGS_DB_KEYS.auth]: initialAuthSettings,
};

export const REQUIRED_SETTINGS_KEYS = Object.keys(DEFAULT_SETTINGS_BY_KEY);

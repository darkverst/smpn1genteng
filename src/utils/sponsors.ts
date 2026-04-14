import { Sponsor, SponsorsData } from '../types';

function makeId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

function sanitizeSponsor(raw: unknown): Sponsor | null {
  if (!raw || typeof raw !== 'object') return null;
  const item = raw as Record<string, unknown>;
  const name = typeof item.name === 'string' ? item.name.trim() : '';
  const logo = typeof item.logo === 'string' ? item.logo : '';
  const url = typeof item.url === 'string' ? item.url.trim() : '';
  if (!name) return null;
  return {
    id: typeof item.id === 'string' && item.id.trim() ? item.id : makeId(),
    name,
    logo,
    url,
  };
}

export function normalizeSponsorsData(raw: unknown, fallback: SponsorsData): SponsorsData {
  const source = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  const list = Array.isArray(source.sponsors) ? source.sponsors : fallback.sponsors;
  const sponsors = list
    .map(sanitizeSponsor)
    .filter((item): item is Sponsor => item !== null);

  return {
    showSection: typeof source.showSection === 'boolean' ? source.showSection : fallback.showSection,
    title: typeof source.title === 'string' && source.title.trim() ? source.title : fallback.title,
    sponsors,
  };
}

export function addSponsorRecord(current: SponsorsData, sponsor: Omit<Sponsor, 'id'>): SponsorsData {
  return {
    ...current,
    sponsors: [...current.sponsors, { ...sponsor, id: makeId() }],
  };
}

export function updateSponsorRecord(current: SponsorsData, id: string, updates: Partial<Sponsor>): SponsorsData {
  return {
    ...current,
    sponsors: current.sponsors.map((item) => (item.id === id ? { ...item, ...updates } : item)),
  };
}

export function deleteSponsorRecord(current: SponsorsData, id: string): SponsorsData {
  return {
    ...current,
    sponsors: current.sponsors.filter((item) => item.id !== id),
  };
}

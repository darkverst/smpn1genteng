import { cn } from './cn';
import type { ButtonStyle, CardStyle, IconStyle } from '../types';

/**
 * Menghasilkan kelas Tailwind untuk tombol berdasarkan ButtonStyle yang dipilih
 */
export function getButtonStyle(
  style: ButtonStyle | undefined,
  baseClass = ''
): string {
  const resolved = style || 'rounded';
  let styleClass = '';

  switch (resolved) {
    case 'pill':
      styleClass = 'rounded-full';
      break;
    case 'flat':
      styleClass = 'rounded-md shadow-none border-0 active:scale-[0.98]';
      break;
    case '3d':
      styleClass = 'rounded-xl shadow-[0_4px_0_0_rgba(0,0,0,0.28)] active:translate-y-1 active:shadow-[0_1px_0_0_rgba(0,0,0,0.28)] hover:brightness-105';
      break;
    case 'glass':
      styleClass = 'rounded-xl backdrop-blur-md bg-white/20 hover:bg-white/30 border border-white/40 shadow-lg';
      break;
    case 'glow':
      styleClass = 'rounded-xl shadow-[0_0_18px_rgba(22,163,74,0.5)] hover:shadow-[0_0_26px_rgba(234,179,8,0.7)]';
      break;
    case 'rounded':
    default:
      styleClass = 'rounded-xl shadow-md hover:shadow-lg active:scale-95';
      break;
  }

  return cn(baseClass, styleClass);
}

/**
 * Menghasilkan kelas Tailwind untuk kartu/kontainer berdasarkan CardStyle yang dipilih
 */
export function getCardStyle(
  style: CardStyle | undefined,
  baseClass = ''
): string {
  const resolved = style || 'modern';
  let styleClass = '';

  switch (resolved) {
    case 'flat':
      styleClass = 'rounded-lg shadow-none border-2 border-gray-200 hover:border-primary-400';
      break;
    case '3d':
      styleClass = 'rounded-2xl border-2 border-slate-900/10 shadow-[5px_5px_0_0_rgba(15,23,42,0.1)] hover:shadow-[7px_7px_0_0_rgba(15,23,42,0.15)] hover:-translate-x-0.5 hover:-translate-y-0.5';
      break;
    case 'glass':
      styleClass = 'rounded-2xl backdrop-blur-md bg-white/85 border border-white/80 shadow-xl hover:shadow-2xl';
      break;
    case 'bordered':
      styleClass = 'rounded-xl shadow-xs border border-slate-300 hover:border-slate-500';
      break;
    case 'modern':
    default:
      styleClass = 'rounded-2xl shadow-sm hover:shadow-lg border border-gray-100';
      break;
  }

  return cn(baseClass, styleClass);
}

/**
 * Menghasilkan kelas Tailwind untuk badge ikon berdasarkan IconStyle yang dipilih
 */
export function getIconBadgeStyle(
  style: IconStyle | undefined,
  baseClass = ''
): string {
  const resolved = style || 'material';
  let styleClass = '';

  switch (resolved) {
    case '3d':
      styleClass = 'rounded-2xl shadow-xl [box-shadow:0_8px_16px_-2px_rgba(0,0,0,0.25),inset_0_2px_4px_rgba(255,255,255,0.7),inset_0_-2px_4px_rgba(0,0,0,0.25)] border-t border-white/60 transform rotate-1 hover:rotate-0 hover:scale-105 active:scale-95';
      break;
    case 'flat':
      styleClass = 'rounded-xl shadow-none border-0';
      break;
    case 'outline':
      styleClass = 'rounded-xl bg-transparent border-2 border-current shadow-none hover:bg-current/10';
      break;
    case 'duotone':
      styleClass = 'rounded-2xl ring-4 ring-primary-300/40 shadow-[0_0_18px_rgba(34,197,94,0.45)] hover:shadow-[0_0_24px_rgba(34,197,94,0.65)]';
      break;
    case 'material':
    default:
      styleClass = 'rounded-xl shadow-md border border-black/5 hover:shadow-lg';
      break;
  }

  return cn(baseClass, styleClass);
}

/**
 * Menghasilkan kelas efek SVG di dalam ikon badge (drop shadow 3D / duotone glow)
 */
export function getIconSvgEffect(style: IconStyle | undefined): string {
  switch (style) {
    case '3d':
      return 'drop-shadow-[0_2px_3px_rgba(0,0,0,0.4)]';
    case 'duotone':
      return 'drop-shadow-[0_0_4px_rgba(250,204,21,0.8)]';
    case 'material':
      return 'drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)]';
    case 'flat':
    case 'outline':
    default:
      return 'drop-shadow-none';
  }
}

/**
 * Menghasilkan kelas Tailwind untuk lencana/badge seksi judul halaman
 */
export function getSectionBadgeStyle(
  style: IconStyle | ButtonStyle | undefined,
  baseClass = ''
): string {
  const resolved = style || 'material';
  let styleClass = '';

  switch (resolved) {
    case '3d':
      styleClass = 'rounded-2xl shadow-md [box-shadow:0_4px_8px_-1px_rgba(0,0,0,0.15),inset_0_1px_2px_rgba(255,255,255,0.8)] border border-primary-200/60';
      break;
    case 'flat':
      styleClass = 'rounded-md shadow-none border border-primary-200';
      break;
    case 'outline':
      styleClass = 'rounded-xl bg-transparent border-2 border-primary-500';
      break;
    case 'pill':
      styleClass = 'rounded-full border border-primary-100 shadow-xs';
      break;
    case 'glow':
    case 'duotone':
      styleClass = 'rounded-full ring-2 ring-primary-400/40 shadow-[0_0_12px_rgba(34,197,94,0.3)]';
      break;
    case 'glass':
      styleClass = 'rounded-xl backdrop-blur-md bg-white/60 border border-white/60 shadow-sm';
      break;
    case 'material':
    case 'rounded':
    default:
      styleClass = 'rounded-full shadow-xs border border-primary-100';
      break;
  }

  return cn(baseClass, styleClass);
}

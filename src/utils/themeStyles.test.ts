import { describe, expect, it } from 'vitest';
import {
  getButtonStyle,
  getCardStyle,
  getIconBadgeStyle,
  getIconSvgEffect,
  getSectionBadgeStyle,
} from './themeStyles';

describe('themeStyles utility', () => {
  it('menghasilkan kelas tombol yang sesuai dengan ButtonStyle', () => {
    expect(getButtonStyle('pill')).toContain('rounded-full');
    expect(getButtonStyle('flat')).toContain('shadow-none');
    expect(getButtonStyle('3d')).toContain('border-b-4');
    expect(getButtonStyle('glass')).toContain('backdrop-blur-md');
    expect(getButtonStyle('glow')).toContain('shadow-[');
    expect(getButtonStyle('rounded')).toContain('rounded-xl');
    expect(getButtonStyle(undefined)).toContain('rounded-xl');
  });

  it('menggabungkan baseClass dengan kelas ButtonStyle menggunakan twMerge', () => {
    const res = getButtonStyle('pill', 'px-6 py-3 font-bold rounded-xl');
    expect(res).toContain('px-6');
    expect(res).toContain('rounded-full');
    expect(res).not.toContain('rounded-xl');
  });

  it('menghasilkan kelas kartu yang sesuai dengan CardStyle', () => {
    expect(getCardStyle('flat')).toContain('shadow-none');
    expect(getCardStyle('3d')).toContain('shadow-[5px_5px_0_0_rgba(15,23,42,0.1)]');
    expect(getCardStyle('glass')).toContain('backdrop-blur-md');
    expect(getCardStyle('bordered')).toContain('border-slate-300');
    expect(getCardStyle('modern')).toContain('shadow-sm');
  });

  it('menghasilkan kelas badge ikon dan efek svg yang sesuai dengan IconStyle', () => {
    expect(getIconBadgeStyle('3d')).toContain('rotate-1');
    expect(getIconBadgeStyle('flat')).toContain('shadow-none');
    expect(getIconBadgeStyle('outline')).toContain('bg-transparent');
    expect(getIconBadgeStyle('duotone')).toContain('ring-4');
    expect(getIconBadgeStyle('material')).toContain('shadow-md');

    expect(getIconSvgEffect('3d')).toContain('drop-shadow-[0_2px_3px_rgba(0,0,0,0.4)]');
    expect(getIconSvgEffect('flat')).toBe('drop-shadow-none');
  });

  it('menghasilkan kelas badge seksi judul yang sesuai dengan IconStyle atau ButtonStyle', () => {
    expect(getSectionBadgeStyle('3d')).toContain('shadow-md');
    expect(getSectionBadgeStyle('flat')).toContain('shadow-none');
    expect(getSectionBadgeStyle('outline')).toContain('border-2');
    expect(getSectionBadgeStyle('pill')).toContain('rounded-full');
    expect(getSectionBadgeStyle('glow')).toContain('ring-2');
  });
});

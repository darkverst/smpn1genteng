import { describe, expect, it } from 'vitest';
import {
  initialBrandSettings,
  initialContactInfo,
  initialFooterCredit,
  initialSchoolIdentitySettings,
} from '../types';
import {
  applyThemePreset,
  buildLegacySettingsFromSchoolIdentity,
  createTailwindThemeScale,
  createSchoolIdentityFromLegacy,
  normalizeSchoolIdentity,
  validateSchoolIdentity,
} from './schoolIdentity';

describe('school identity utils', () => {
  it('migrasi dari legacy settings menghasilkan konfigurasi identitas yang konsisten', () => {
    const migrated = createSchoolIdentityFromLegacy(
      {
        ...initialBrandSettings,
        schoolName: 'SMPN Test',
        schoolTagline: 'Kabupaten Test',
      },
      {
        ...initialContactInfo,
        address: 'Jl. Test No. 1',
        email: 'admin@test.sch.id',
      },
      {
        ...initialFooterCredit,
        schoolName: 'SMP Negeri Test',
        rightText: 'Resmi milik sekolah',
      },
    );

    expect(migrated.schoolShortName).toBe('SMPN Test');
    expect(migrated.legalName).toBe('SMP Negeri Test');
    expect(migrated.address).toBe('Jl. Test No. 1');
    expect(migrated.legalNotice).toBe('Resmi milik sekolah');
  });

  it('normalisasi dan validasi memperbaiki data rusak lalu memberi error untuk input tidak valid', () => {
    const normalized = normalizeSchoolIdentity({
      schoolName: '  SMPN QA  ',
      schoolShortName: '  SMPN QA ',
      legalName: '  SMP Negeri QA ',
      address: ' Jl. QA ',
      phone: ' 123 ',
      email: 'admin@qa.sch.id',
      primaryColor: 'biru',
      schoolLogo: 'ftp://logo.invalid',
      showCurrentYear: 'yes',
    }, initialSchoolIdentitySettings);

    expect(normalized.schoolName).toBe('SMPN QA');
    expect(normalized.primaryColor).toBe(initialSchoolIdentitySettings.primaryColor);
    expect(normalized.schoolLogo).toBe(initialSchoolIdentitySettings.schoolLogo);
    expect(normalized.showCurrentYear).toBe(initialSchoolIdentitySettings.showCurrentYear);

    const errors = validateSchoolIdentity({
      ...normalized,
      email: 'email-tidak-valid',
      developerUrl: 'notaurl',
      accentColor: 'orange',
    });

    expect(errors).toEqual(expect.arrayContaining([
      'Format email sekolah tidak valid.',
      'URL developer harus menggunakan URL yang valid.',
      'Warna aksen harus menggunakan format hex, misalnya #0f766e.',
    ]));
  });

  it('buildLegacySettingsFromSchoolIdentity menjaga sinkronisasi untuk komponen lama', () => {
    const legacy = buildLegacySettingsFromSchoolIdentity({
      ...initialSchoolIdentitySettings,
      schoolName: 'SMP Negeri Sinkron',
      schoolShortName: 'SMPN Sinkron',
      schoolTagline: 'Kabupaten Sinkron',
      legalName: 'SMP Negeri Sinkron Kabupaten',
      legalNotice: 'Hak cipta sekolah',
    });

    expect(legacy.brandSettings.schoolName).toBe('SMPN Sinkron');
    expect(legacy.contactInfo.email).toBe(initialSchoolIdentitySettings.email);
    expect(legacy.footerCredit.schoolName).toBe('SMP Negeri Sinkron Kabupaten');
    expect(legacy.footerCredit.rightText).toBe('Hak cipta sekolah');
  });

  it('preset tema mengubah warna identitas dan menghasilkan skala warna global', () => {
    const themed = applyThemePreset(initialSchoolIdentitySettings, 'maroon');
    const scale = createTailwindThemeScale(themed);

    expect(themed.themePreset).toBe('maroon');
    expect(themed.primaryColor).toBe('#9f1239');
    expect(scale.primary500).toBe('#9f1239');
    expect(scale.primary50).not.toBe(scale.primary500);
    expect(scale.accent600).not.toBe(scale.accent500);
  });
});

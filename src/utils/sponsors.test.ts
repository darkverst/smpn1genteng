import { describe, expect, it } from 'vitest';
import { initialSponsorsData } from '../types';
import { addSponsorRecord, deleteSponsorRecord, normalizeSponsorsData } from './sponsors';

describe('sponsors utils', () => {
  it('normalizeSponsorsData memperbaiki data sponsor yang tidak valid dari storage', () => {
    const malformed = {
      showSection: 'yes',
      title: '',
      sponsors: [
        { id: '', name: '  Sponsor A  ', logo: 12, url: ' https://a.test ' },
        { foo: 'bar' },
      ],
    };

    const normalized = normalizeSponsorsData(malformed, initialSponsorsData);

    expect(normalized.showSection).toBe(initialSponsorsData.showSection);
    expect(normalized.title).toBe(initialSponsorsData.title);
    expect(normalized.sponsors).toHaveLength(1);
    expect(normalized.sponsors[0].name).toBe('Sponsor A');
    expect(normalized.sponsors[0].url).toBe('https://a.test');
    expect(normalized.sponsors[0].id).toBeTruthy();
  });

  it('addSponsorRecord dan deleteSponsorRecord menambah lalu menghapus sponsor', () => {
    const added = addSponsorRecord(initialSponsorsData, {
      name: 'Sponsor QA',
      logo: '',
      url: 'https://qa.test',
    });

    const inserted = added.sponsors.find((item) => item.name === 'Sponsor QA');
    expect(inserted).toBeTruthy();

    const removed = deleteSponsorRecord(added, inserted!.id);
    expect(removed.sponsors.some((item) => item.id === inserted!.id)).toBe(false);
  });
});

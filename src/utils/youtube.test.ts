import { describe, it, expect } from 'vitest';
import { extractYoutubeId, getYoutubeThumbnail } from '../types';

describe('YouTube URL parser & thumbnail extractor', () => {
  const VIDEO_ID = 'dQw4w9WgXcQ';

  it('mengekstrak ID dari format standar watch?v=', () => {
    expect(extractYoutubeId(`https://www.youtube.com/watch?v=${VIDEO_ID}`)).toBe(VIDEO_ID);
    expect(extractYoutubeId(`http://youtube.com/watch?v=${VIDEO_ID}`)).toBe(VIDEO_ID);
  });

  it('mengekstrak ID saat parameter v bukan parameter pertama di URL', () => {
    expect(extractYoutubeId(`https://www.youtube.com/watch?feature=shared&v=${VIDEO_ID}&t=45s`)).toBe(VIDEO_ID);
    expect(extractYoutubeId(`https://m.youtube.com/watch?app=desktop&v=${VIDEO_ID}`)).toBe(VIDEO_ID);
  });

  it('mengekstrak ID dari format pendek youtu.be', () => {
    expect(extractYoutubeId(`https://youtu.be/${VIDEO_ID}`)).toBe(VIDEO_ID);
    expect(extractYoutubeId(`https://youtu.be/${VIDEO_ID}?t=120`)).toBe(VIDEO_ID);
  });

  it('mengekstrak ID dari format embed, shorts, dan live', () => {
    expect(extractYoutubeId(`https://www.youtube.com/embed/${VIDEO_ID}`)).toBe(VIDEO_ID);
    expect(extractYoutubeId(`https://www.youtube.com/shorts/${VIDEO_ID}`)).toBe(VIDEO_ID);
    expect(extractYoutubeId(`https://www.youtube.com/live/${VIDEO_ID}`)).toBe(VIDEO_ID);
  });

  it('mengembalikan null jika URL tidak valid atau bukan video YouTube', () => {
    expect(extractYoutubeId('')).toBeNull();
    // @ts-expect-error test invalid type
    expect(extractYoutubeId(null)).toBeNull();
    expect(extractYoutubeId('https://google.com')).toBeNull();
    expect(extractYoutubeId('https://youtube.com/about')).toBeNull();
  });

  it('menghasilkan URL thumbnail berkualitas tinggi', () => {
    expect(getYoutubeThumbnail(`https://www.youtube.com/watch?feature=shared&v=${VIDEO_ID}`))
      .toBe(`https://img.youtube.com/vi/${VIDEO_ID}/hqdefault.jpg`);
    expect(getYoutubeThumbnail('https://invalid.com')).toBe('');
  });
});

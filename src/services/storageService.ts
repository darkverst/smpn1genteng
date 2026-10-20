import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { compressImage } from '../utils/imageCompress';

export const BUCKET_NAME = 'school-media';

export interface UploadProgressInfo {
  stage: 'compressing' | 'uploading' | 'verifying' | 'done' | 'error';
  message: string;
  percent?: number;
}

export type UploadProgressCallback = (info: UploadProgressInfo) => void;

export interface UploadResult {
  url: string;
  isCloudStorage: boolean;
  originalSize: number;
  compressedSize: number;
  savedPercent: number;
  format: string;
  error?: string;
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (!bytes || bytes <= 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function isSupabaseStorageUrl(url?: string | null): boolean {
  if (!url || typeof url !== 'string') return false;
  return url.includes('.supabase.co/storage/v1/object/public/') || url.includes('/storage/v1/object/public/');
}

export function isBase64DataUrl(url?: string | null): boolean {
  if (!url || typeof url !== 'string') return false;
  return url.startsWith('data:image/');
}

function dataUrlToBlob(dataUrl: string): { blob: Blob; mime: string; ext: string; size: number } {
  const parts = dataUrl.split(',');
  const mimeMatch = parts[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
  const bstr = atob(parts[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  let ext = 'jpg';
  if (mime.includes('png')) ext = 'png';
  else if (mime.includes('webp')) ext = 'webp';
  else if (mime.includes('svg')) ext = 'svg';

  const blob = new Blob([u8arr], { type: mime });
  return { blob, mime, ext, size: blob.size };
}

export async function uploadImageWithDetails(
  file: File,
  folder = 'uploads',
  options = { maxWidth: 1200, maxHeight: 1200, quality: 0.8 },
  onProgress?: UploadProgressCallback
): Promise<UploadResult> {
  const originalSize = file.size;

  // 1. Tahap Kompresi Client-side
  onProgress?.({
    stage: 'compressing',
    message: `Mengoptimalkan gambar (${formatBytes(originalSize)})...`,
    percent: 25,
  });

  const compressedDataUrl = await compressImage(file, options);
  const { blob, mime, ext, size: compressedSize } = dataUrlToBlob(compressedDataUrl);
  const savedPercent = originalSize > compressedSize
    ? Math.round(((originalSize - compressedSize) / originalSize) * 100)
    : 0;

  // 2. Jika Supabase belum dikonfigurasi, gunakan fallback base64
  if (!isSupabaseConfigured || !supabase) {
    onProgress?.({
      stage: 'done',
      message: 'Supabase belum terhubung, gambar disimpan dalam format lokal.',
      percent: 100,
    });
    return {
      url: compressedDataUrl,
      isCloudStorage: false,
      originalSize,
      compressedSize,
      savedPercent,
      format: ext,
      error: 'Supabase Storage belum dikonfigurasi.',
    };
  }

  // 3. Tahap Upload ke Supabase Cloud Storage
  try {
    onProgress?.({
      stage: 'uploading',
      message: `Mengunggah ke Cloud Storage (${formatBytes(compressedSize)})...`,
      percent: 65,
    });

    const cleanFileName = file.name
      ? file.name.replace(/\.[^/.]+$/, '').toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 30)
      : 'image';
    const uniqueId = Math.random().toString(36).substring(2, 8);
    const filePath = `${folder}/${Date.now()}-${cleanFileName}-${uniqueId}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, blob, {
        contentType: mime,
        upsert: true,
      });

    if (uploadError) {
      console.warn('[Storage] Gagal upload ke Supabase Storage, fallback ke base64:', uploadError.message);
      onProgress?.({
        stage: 'error',
        message: `Gagal upload ke Cloud Storage: ${uploadError.message}. Gambar dialihkan ke penyimpanan cadangan.`,
        percent: 100,
      });
      return {
        url: compressedDataUrl,
        isCloudStorage: false,
        originalSize,
        compressedSize,
        savedPercent,
        format: ext,
        error: uploadError.message,
      };
    }

    // 4. Verifikasi & Pengambilan URL Publik CDN
    onProgress?.({
      stage: 'verifying',
      message: 'Memverifikasi URL publik CDN...',
      percent: 90,
    });

    const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);
    const publicUrl = data.publicUrl;

    onProgress?.({
      stage: 'done',
      message: 'Berhasil diunggah ke Supabase Cloud Storage!',
      percent: 100,
    });

    return {
      url: publicUrl,
      isCloudStorage: true,
      originalSize,
      compressedSize,
      savedPercent,
      format: ext,
    };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Kesalahan jaringan saat upload.';
    console.error('[Storage] Error upload gambar:', err);
    onProgress?.({
      stage: 'error',
      message: `Gagal mengunggah: ${errorMsg}`,
      percent: 100,
    });
    return {
      url: compressedDataUrl,
      isCloudStorage: false,
      originalSize,
      compressedSize,
      savedPercent,
      format: ext,
      error: errorMsg,
    };
  }
}

export async function uploadImageToStorage(
  file: File,
  folder = 'uploads',
  options = { maxWidth: 1200, maxHeight: 1200, quality: 0.8 }
): Promise<string> {
  const result = await uploadImageWithDetails(file, folder, options);
  return result.url;
}

export interface CompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: string;
}

const DEFAULTS: Required<CompressOptions> = {
  maxWidth: 1200,
  maxHeight: 1200,
  quality: 0.78,
  format: 'image/webp',
};

export function compressImage(file: File, opts?: CompressOptions): Promise<string> {
  const { maxWidth, maxHeight, quality, format } = { ...DEFAULTS, ...opts };

  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      let { width, height } = img;
      if (width > maxWidth) { height = Math.round(height * maxWidth / width); width = maxWidth; }
      if (height > maxHeight) { width = Math.round(width * maxHeight / height); height = maxHeight; }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) { resolve(img.src); return; }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      const isPng = file.type === 'image/png' || file.name.toLowerCase().endsWith('.png');
      const outFormat = isPng ? 'image/webp' : format;

      const result = canvas.toDataURL(outFormat, isPng ? 0.85 : quality);
      resolve(result);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Gagal membaca gambar'));
    };

    img.src = url;
  });
}

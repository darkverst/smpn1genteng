import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://tbrkiitpnognhdunyemo.supabase.co';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceKey) {
  console.error('Error: SUPABASE_SERVICE_ROLE_KEY environment variable is required.');
  process.exit(1);
}

const supabase = createClient(url, serviceKey);
const BUCKET = 'school-media';

function dataUrlToBuffer(dataUrl) {
  const matches = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!matches) return null;
  const mime = matches[1];
  const buffer = Buffer.from(matches[2], 'base64');
  let ext = 'jpg';
  if (mime.includes('png')) ext = 'png';
  else if (mime.includes('webp')) ext = 'webp';
  else if (mime.includes('svg')) ext = 'svg';
  return { buffer, mime, ext };
}

async function uploadBase64(dataUrl, folder, filename) {
  if (!dataUrl || !dataUrl.startsWith('data:')) return dataUrl;
  const parsed = dataUrlToBuffer(dataUrl);
  if (!parsed) return dataUrl;

  const filePath = `${folder}/${filename}.${parsed.ext}`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(filePath, parsed.buffer, {
      contentType: parsed.mime,
      upsert: true,
    });

  if (error) {
    console.error(`  Gagal upload ${filePath}:`, error.message);
    return dataUrl;
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
  console.log(`  Uploaded ${filePath} (${(parsed.buffer.length / 1024).toFixed(1)} KB) -> ${data.publicUrl}`);
  return data.publicUrl;
}

async function run() {
  console.log('=== MEMINDAHKAN FOTO BASE64 KE SUPABASE STORAGE ===');

  // 1. Teachers Data
  console.log('\n1. Memproses Data Guru...');
  const { data: teacherRow } = await supabase.from('settings').select('value').eq('key', 'teachers_data').single();
  if (teacherRow && Array.isArray(teacherRow.value)) {
    const updatedTeachers = [];
    for (let i = 0; i < teacherRow.value.length; i++) {
      const t = { ...teacherRow.value[i] };
      if (t.photo && t.photo.startsWith('data:')) {
        const slug = (t.name || `guru-${i}`).toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 30);
        t.photo = await uploadBase64(t.photo, 'teachers', `guru-${i}-${slug}`);
      }
      updatedTeachers.push(t);
    }
    await supabase.from('settings').upsert({
      key: 'teachers_data',
      value: updatedTeachers,
      updated_at: new Date().toISOString(),
    });
    console.log('teachers_data berhasil diperbarui dengan URL Storage!');
  }

  // 2. Gallery Items
  console.log('\n2. Memproses Galeri...');
  const { data: galleryRow } = await supabase.from('settings').select('value').eq('key', 'gallery_items').single();
  if (galleryRow && Array.isArray(galleryRow.value)) {
    const updatedGallery = [];
    for (let i = 0; i < galleryRow.value.length; i++) {
      const g = { ...galleryRow.value[i] };
      const slug = (g.title || `galeri-${i}`).toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 30);
      if (g.image && g.image.startsWith('data:')) {
        g.image = await uploadBase64(g.image, 'gallery', `galeri-${i}-cover-${slug}`);
      }
      if (Array.isArray(g.images)) {
        const nextImgs = [];
        for (let j = 0; j < g.images.length; j++) {
          const img = g.images[j];
          if (img && img.startsWith('data:')) {
            const uploadedUrl = await uploadBase64(img, 'gallery', `galeri-${i}-img-${j}-${slug}`);
            nextImgs.push(uploadedUrl);
          } else {
            nextImgs.push(img);
          }
        }
        g.images = nextImgs;
      }
      updatedGallery.push(g);
    }
    await supabase.from('settings').upsert({
      key: 'gallery_items',
      value: updatedGallery,
      updated_at: new Date().toISOString(),
    });
    console.log('gallery_items berhasil diperbarui dengan URL Storage!');
  }

  // 3. News Items
  console.log('\n3. Memproses Berita...');
  const { data: newsRow } = await supabase.from('settings').select('value').eq('key', 'news_items').single();
  if (newsRow && Array.isArray(newsRow.value)) {
    const updatedNews = [];
    for (let i = 0; i < newsRow.value.length; i++) {
      const n = { ...newsRow.value[i] };
      if (n.image && n.image.startsWith('data:')) {
        const slug = (n.title || `berita-${i}`).toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 30);
        n.image = await uploadBase64(n.image, 'news', `berita-${i}-${slug}`);
      }
      updatedNews.push(n);
    }
    await supabase.from('settings').upsert({
      key: 'news_items',
      value: updatedNews,
      updated_at: new Date().toISOString(),
    });
    console.log('news_items berhasil diperbarui dengan URL Storage!');
  }

  // 4. Extracurricular Items
  console.log('\n4. Memproses Eskul...');
  const { data: eskulRow } = await supabase.from('settings').select('value').eq('key', 'extracurricular_items').single();
  if (eskulRow && Array.isArray(eskulRow.value)) {
    const updatedEskul = [];
    for (let i = 0; i < eskulRow.value.length; i++) {
      const e = { ...eskulRow.value[i] };
      if (e.image && e.image.startsWith('data:')) {
        const slug = (e.name || `eskul-${i}`).toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 30);
        e.image = await uploadBase64(e.image, 'eskul', `eskul-${i}-${slug}`);
      }
      updatedEskul.push(e);
    }
    await supabase.from('settings').upsert({
      key: 'extracurricular_items',
      value: updatedEskul,
      updated_at: new Date().toISOString(),
    });
    console.log('extracurricular_items berhasil diperbarui dengan URL Storage!');
  }

  // 5. School Identity & Brand Logo
  console.log('\n5. Memproses Logo Sekolah...');
  const { data: identRow } = await supabase.from('settings').select('value').eq('key', 'school_identity').single();
  if (identRow && identRow.value && identRow.value.schoolLogo && identRow.value.schoolLogo.startsWith('data:')) {
    const logoUrl = await uploadBase64(identRow.value.schoolLogo, 'brand', 'school-logo');
    await supabase.from('settings').upsert({
      key: 'school_identity',
      value: { ...identRow.value, schoolLogo: logoUrl },
      updated_at: new Date().toISOString(),
    });
    const { data: brandRow } = await supabase.from('settings').select('value').eq('key', 'brand_settings').single();
    if (brandRow && brandRow.value) {
      await supabase.from('settings').upsert({
        key: 'brand_settings',
        value: { ...brandRow.value, schoolLogo: logoUrl },
        updated_at: new Date().toISOString(),
      });
    }
    console.log('schoolLogo berhasil dipindahkan ke Storage!');
  }

  // 6. Slider Items
  console.log('\n6. Memproses Slider...');
  const { data: sliderRow } = await supabase.from('settings').select('value').eq('key', 'slider_items').single();
  if (sliderRow && Array.isArray(sliderRow.value)) {
    const updatedSlider = [];
    for (let i = 0; i < sliderRow.value.length; i++) {
      const s = { ...sliderRow.value[i] };
      if (s.image && s.image.startsWith('data:')) {
        s.image = await uploadBase64(s.image, 'slider', `slider-${i}`);
      }
      updatedSlider.push(s);
    }
    await supabase.from('settings').upsert({
      key: 'slider_items',
      value: updatedSlider,
      updated_at: new Date().toISOString(),
    });
    console.log('slider_items berhasil diperbarui dengan URL Storage!');
  }

  console.log('\n✨ SEMUA FOTO BERHASIL DIPINDAHKAN KE SUPABASE STORAGE!');
}

run().catch(console.error);

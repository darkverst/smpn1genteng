import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs';
import path from 'node:path';

const DEFAULT_SUPABASE_URL = 'https://tbrkiitpnognhdunyemo.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRicmtpaXRwbm9nbmhkdW55ZW1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEyMjk5MzUsImV4cCI6MjEwNjgwNTkzNX0.xDcCVnIbRaWg0VhbSkgBZ7u-Vf4w7hKHRJ5sALOcm28';

async function run() {
  let supabaseUrl = process.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  let supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

  if (fs.existsSync(path.resolve('.env'))) {
    const envContent = fs.readFileSync(path.resolve('.env'), 'utf8');
    const urlMatch = envContent.match(/VITE_SUPABASE_URL=([^\r\n]+)/);
    if (urlMatch) supabaseUrl = urlMatch[1].trim();
    const keyMatch = envContent.match(/VITE_SUPABASE_ANON_KEY=([^\r\n]+)/);
    if (keyMatch) supabaseKey = keyMatch[1].trim();
  }

  console.log(`Menghubungkan ke Supabase Cloud: ${supabaseUrl}...`);
  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('Membaca seluruh data tabel settings dari Supabase...');
  const { data: rows, error } = await supabase.from('settings').select('key, value').order('key');
  if (error) {
    throw new Error(`Gagal membaca tabel settings: ${error.message}`);
  }

  console.log(`Ditemukan ${rows?.length ?? 0} data key.`);

  const keyList = (rows ?? []).map((r) => r.key);
  const backup = {
    _meta: {
      version: '2.0',
      date: new Date().toISOString(),
      app: 'Portal Sekolah CMS',
      school: 'Website Sekolah',
      source: 'Supabase Cloud PostgreSQL',
      totalRows: rows?.length ?? 0,
      keys: keyList,
    },
  };

  for (const row of rows ?? []) {
    backup[row.key] = row.value;
    const sizeStr = (JSON.stringify(row.value).length / 1024).toFixed(1);
    console.log(`  ✓ Key "${row.key}" (${sizeStr} KB)`);
  }

  const jsonStr = JSON.stringify(backup, null, 2);
  const nowStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const outPath = path.resolve(`backup_sekolah_${nowStr}.json`);
  const downloadsPath = path.resolve('/home/darkverst/Downloads/backup_ma_amanatulloh.json');

  fs.writeFileSync(outPath, jsonStr, 'utf8');
  console.log(`\n✅ Backup berhasil disimpan di: ${outPath}`);

  try {
    fs.writeFileSync(downloadsPath, jsonStr, 'utf8');
    console.log(`✅ Backup juga disalin ke Downloads: ${downloadsPath}`);
  } catch (err) {
    // Abaikan jika folder downloads tidak ada di environment tertentu
  }

  const stat = fs.statSync(outPath);
  console.log(`📦 Ukuran total file: ${(stat.size / 1024).toFixed(1)} KB (${stat.size} bytes)`);
}

run().catch((err) => {
  console.error('Error saat membuat backup:', err);
  process.exit(1);
});

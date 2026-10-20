import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs';
import path from 'node:path';

const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://tbrkiitpnognhdunyemo.supabase.co';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceKey) {
  console.error('Error: SUPABASE_SERVICE_ROLE_KEY environment variable is required.');
  process.exit(1);
}

const supabase = createClient(url, serviceKey);

async function run() {
  const backupFile = path.resolve('backup-ma-amanatulloh-2026-10-06.json');
  console.log(`Membaca file backup: ${backupFile}`);
  const content = fs.readFileSync(backupFile, 'utf8');
  const backup = JSON.parse(content);

  const keys = Object.keys(backup).filter(k => k !== '_meta');
  console.log(`Ditemukan ${keys.length} keys untuk dimigrasikan ke Supabase.`);

  let successCount = 0;
  for (const key of keys) {
    process.stdout.write(`Migrasi "${key}"... `);
    const value = backup[key];
    const sizeKB = (JSON.stringify(value).length / 1024).toFixed(1);

    const { error } = await supabase.from('settings').upsert({
      key,
      value,
      updated_at: new Date().toISOString()
    });

    if (error) {
      console.log(`GAGAL: ${error.message}`);
    } else {
      console.log(`SUKSES (${sizeKB} KB)`);
      successCount++;
    }
  }

  console.log(`\n🎉 Selesai! ${successCount} dari ${keys.length} keys berhasil dimigrasikan ke Supabase.`);
}

run().catch(console.error);

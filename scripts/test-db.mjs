import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';
import dns from 'node:dns';

dns.setDefaultResultOrder('ipv4first');

async function testConnection() {
  const envPath = path.resolve('.env');
  if (!fs.existsSync(envPath)) {
    console.error('\x1b[31m[ERROR]\x1b[0m File .env tidak ditemukan di root project.');
    console.log('\nSilakan buat file .env dengan isi:');
    console.log('VITE_DATABASE_URL=postgres://YOUR_USER:YOUR_PASSWORD@ep-XXXXX.region.aws.neon.tech/neondb?sslmode=require\n');
    process.exit(1);
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const match = envContent.match(/VITE_DATABASE_URL=(.+)/);
  if (!match || !match[1].trim() || match[1].includes('YOUR_USER')) {
    console.error('\x1b[31m[ERROR]\x1b[0m VITE_DATABASE_URL di file .env belum diisi atau masih menggunakan placeholder.');
    console.log('Format yang diharapkan:');
    console.log('VITE_DATABASE_URL=postgres://username:password@ep-xxxxx.region.aws.neon.tech/neondb?sslmode=require\n');
    process.exit(1);
  }

  const dbUrl = match[1].trim().replace(/^['"`\s]+|['"`\s]+$/g, '');
  console.log('\x1b[34m[INFO]\x1b[0m Mencoba menghubungkan ke database Neon...');
  
  try {
    const sql = neon(dbUrl);
    const result = await sql`SELECT NOW() as current_time, version();`;
    console.log('\x1b[32m[SUKSES]\x1b[0m Terhubung ke database PostgreSQL!');
    console.log(`Server Time : ${result[0]?.current_time}`);
    console.log(`Version     : ${result[0]?.version?.split(' ')?.[0]} ${result[0]?.version?.split(' ')?.[1]}`);

    // Test settings table
    try {
      const tableCheck = await sql`
        SELECT table_name FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'settings';
      `;
      if (tableCheck.length === 0) {
        console.warn('\x1b[33m[PERINGATAN]\x1b[0m Tabel "settings" belum ada di database.');
        console.log('Jalankan SQL di docs/neon-schema.sql pada Neon SQL Editor atau jalankan: npm run seed');
      } else {
        const count = await sql`SELECT count(*)::int as cnt FROM settings;`;
        console.log(`\x1b[32m[SUKSES]\x1b[0m Tabel "settings" ditemukan dengan ${count[0]?.cnt} baris data.`);
      }
    } catch (tblErr) {
      console.warn('\x1b[33m[PERINGATAN]\x1b[0m Gagal memeriksa tabel settings:', tblErr.message);
    }
  } catch (err) {
    console.error('\x1b[31m[ERROR]\x1b[0m Gagal menghubungkan ke database:', err.message);
    process.exit(1);
  }
}

testConnection();

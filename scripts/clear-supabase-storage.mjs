import { createClient } from '@supabase/supabase-js';

function normalizeEnvValue(raw) {
  if (!raw) return '';
  return raw.trim().replace(/^['"`\s]+|['"`\s]+$/g, '');
}

function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let value = bytes;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value.toFixed(value >= 10 || unitIndex === 0 ? 0 : 2)} ${units[unitIndex]}`;
}

function parseArgs(argv) {
  const options = {
    bucket: '',
    allBuckets: false,
    confirm: false,
    help: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--bucket') {
      options.bucket = argv[index + 1] ?? '';
      index += 1;
    } else if (arg === '--all-buckets') {
      options.allBuckets = true;
    } else if (arg === '--confirm') {
      options.confirm = true;
    } else if (arg === '--help' || arg === '-h') {
      options.help = true;
    }
  }

  return options;
}

function printHelp() {
  console.log(`
Reset Supabase Storage secara aman.

Contoh:
  node scripts/clear-supabase-storage.mjs --bucket website-assets
  node scripts/clear-supabase-storage.mjs --bucket website-assets --confirm
  node scripts/clear-supabase-storage.mjs --all-buckets
  node scripts/clear-supabase-storage.mjs --all-buckets --confirm

Opsi:
  --bucket <nama>     Target satu bucket
  --all-buckets       Target semua bucket
  --confirm           Jalankan penghapusan sungguhan
  --help, -h          Tampilkan bantuan

Environment:
  SUPABASE_URL atau VITE_SUPABASE_URL
  SUPABASE_SERVICE_ROLE_KEY

Catatan:
  Tanpa --confirm script hanya melakukan dry-run, menampilkan file yang ditemukan
  dan estimasi ukuran total tanpa menghapus apa pun.
`);
}

function isFolderEntry(entry) {
  return entry.id == null;
}

async function listFilesRecursively(client, bucket, prefix = '') {
  const allFiles = [];
  let offset = 0;
  const limit = 100;

  while (true) {
    const { data, error } = await client.storage.from(bucket).list(prefix, {
      limit,
      offset,
      sortBy: { column: 'name', order: 'asc' },
    });

    if (error) {
      throw new Error(`Gagal membaca bucket "${bucket}" pada prefix "${prefix || '/'}": ${error.message}`);
    }

    if (!data || data.length === 0) {
      break;
    }

    for (const entry of data) {
      const nextPath = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (isFolderEntry(entry)) {
        const nestedFiles = await listFilesRecursively(client, bucket, nextPath);
        allFiles.push(...nestedFiles);
      } else {
        allFiles.push({
          path: nextPath,
          size: entry.metadata?.size ?? 0,
        });
      }
    }

    if (data.length < limit) {
      break;
    }
    offset += limit;
  }

  return allFiles;
}

async function removeFilesInChunks(client, bucket, files, chunkSize = 100) {
  for (let index = 0; index < files.length; index += chunkSize) {
    const chunk = files.slice(index, index + chunkSize);
    const { error } = await client.storage.from(bucket).remove(chunk.map((file) => file.path));
    if (error) {
      throw new Error(`Gagal menghapus file pada bucket "${bucket}": ${error.message}`);
    }
    console.log(`  - Menghapus ${Math.min(index + chunk.length, files.length)}/${files.length} file`);
  }
}

async function resolveBuckets(client, options) {
  if (options.bucket) {
    return [options.bucket];
  }

  const { data, error } = await client.storage.listBuckets();
  if (error) {
    throw new Error(`Gagal membaca daftar bucket: ${error.message}`);
  }

  if (options.allBuckets) {
    return (data ?? []).map((bucket) => bucket.name);
  }

  throw new Error('Tentukan --bucket <nama> atau gunakan --all-buckets.');
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    printHelp();
    return;
  }

  const supabaseUrl = normalizeEnvValue(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL);
  const serviceRoleKey = normalizeEnvValue(process.env.SUPABASE_SERVICE_ROLE_KEY);

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Environment belum lengkap. Isi SUPABASE_URL atau VITE_SUPABASE_URL, lalu SUPABASE_SERVICE_ROLE_KEY.');
  }

  const client = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const buckets = await resolveBuckets(client, options);
  if (buckets.length === 0) {
    console.log('Tidak ada bucket yang ditemukan.');
    return;
  }

  console.log(options.confirm ? 'Mode hapus aktif.' : 'Mode dry-run aktif. Tambahkan --confirm untuk menghapus file.');

  for (const bucket of buckets) {
    console.log(`\nBucket: ${bucket}`);
    const files = await listFilesRecursively(client, bucket);
    const totalBytes = files.reduce((sum, file) => sum + file.size, 0);

    console.log(`  Total file : ${files.length}`);
    console.log(`  Total size : ${formatBytes(totalBytes)}`);

    if (files.length > 0) {
      const preview = files.slice(0, 10);
      for (const file of preview) {
        console.log(`  - ${file.path} (${formatBytes(file.size)})`);
      }
      if (files.length > preview.length) {
        console.log(`  ... dan ${files.length - preview.length} file lainnya`);
      }
    }

    if (!options.confirm || files.length === 0) {
      continue;
    }

    await removeFilesInChunks(client, bucket, files);
    console.log(`  Selesai membersihkan bucket "${bucket}".`);
  }

  console.log('\nProses selesai.');
}

main().catch((error) => {
  console.error(`\nError: ${error.message}`);
  process.exitCode = 1;
});

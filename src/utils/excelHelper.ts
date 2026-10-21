import type { TeacherData } from '../types';

/**
 * Memuat pustaka XLSX (SheetJS) secara asinkron/on-demand
 * Mencegah bundle utama terbebani oleh pustaka Excel berukuran besar.
 */
async function loadXLSX() {
  return await import('xlsx');
}

/**
 * Mengunduh template Excel untuk pengisian data guru massal
 */
export async function downloadGuruTemplate(
  onSuccess?: (message: string) => void,
  onError?: (err: Error) => void
): Promise<void> {
  try {
    const XLSX = await loadXLSX();
    const wb = XLSX.utils.book_new();

    // Sheet 1: Format Pengisian Data Guru
    const templateRows = [
      {
        'Nama Lengkap': 'Ahmad Fauzi, S.Pd.',
        'Jabatan': 'Guru Pengajar',
        'Jenis Kelamin': 'L',
        'Guru Mapel': 'Matematika',
        'Pendidikan': 'S1 Pendidikan Matematika',
        'No. Telepon': '081234567890',
        'Facebook': 'https://facebook.com/contoh',
        'Instagram': '@contoh_guru',
        'YouTube': '',
        'WhatsApp': '081234567890',
      },
      {
        'Nama Lengkap': 'Siti Rahmawati, M.Pd.',
        'Jabatan': 'Waka Kurikulum',
        'Jenis Kelamin': 'P',
        'Guru Mapel': 'Bahasa Indonesia',
        'Pendidikan': 'S2 Pendidikan Bahasa',
        'No. Telepon': '081298765432',
        'Facebook': '',
        'Instagram': '@siti_rahma',
        'YouTube': '',
        'WhatsApp': '081298765432',
      },
    ];

    const wsData = XLSX.utils.json_to_sheet(templateRows);
    wsData['!cols'] = [
      { wch: 30 },
      { wch: 20 },
      { wch: 15 },
      { wch: 25 },
      { wch: 30 },
      { wch: 18 },
      { wch: 30 },
      { wch: 25 },
      { wch: 25 },
      { wch: 18 },
    ];
    XLSX.utils.book_append_sheet(wb, wsData, 'Data Guru');

    // Sheet 2: Petunjuk Pengisian
    const petunjukRows = [
      { 'Nama Kolom': 'Nama Lengkap', Wajib: 'Wajib', Keterangan: 'Nama lengkap beserta gelar' },
      { 'Nama Kolom': 'Jabatan', Wajib: 'Wajib', Keterangan: 'Jabatan di sekolah (contoh: Kepala Sekolah, Guru Pengajar)' },
      { 'Nama Kolom': 'Jenis Kelamin', Wajib: 'Wajib', Keterangan: 'Isi dengan "L" untuk Laki-laki atau "P" untuk Perempuan' },
      { 'Nama Kolom': 'Guru Mapel', Wajib: 'Opsional', Keterangan: 'Mata pelajaran yang diampu (kosongkan jika tenaga kependidikan/staf)' },
      { 'Nama Kolom': 'Pendidikan', Wajib: 'Opsional', Keterangan: 'Pendidikan terakhir (contoh: S1 PAI, S2 Manajemen)' },
      { 'Nama Kolom': 'No. Telepon', Wajib: 'Opsional', Keterangan: 'Nomor HP atau telepon' },
      { 'Nama Kolom': 'Facebook', Wajib: 'Opsional', Keterangan: 'Link akun Facebook (opsional)' },
      { 'Nama Kolom': 'Instagram', Wajib: 'Opsional', Keterangan: 'Link akun atau username Instagram (opsional)' },
      { 'Nama Kolom': 'YouTube', Wajib: 'Opsional', Keterangan: 'Link channel YouTube (opsional)' },
      { 'Nama Kolom': 'WhatsApp', Wajib: 'Opsional', Keterangan: 'Nomor WhatsApp aktif' },
    ];
    const wsPetunjuk = XLSX.utils.json_to_sheet(petunjukRows);
    wsPetunjuk['!cols'] = [{ wch: 18 }, { wch: 12 }, { wch: 55 }];
    XLSX.utils.book_append_sheet(wb, wsPetunjuk, 'Petunjuk Pengisian');

    XLSX.writeFile(wb, 'template-data-guru.xlsx');
    onSuccess?.(
      'File template-data-guru.xlsx siap diisi. Silakan gunakan tombol Import Excel untuk menambahkan data massal.'
    );
  } catch (error) {
    onError?.(error instanceof Error ? error : new Error('Gagal mengunduh template Excel'));
  }
}

/**
 * Mengekspor seluruh data guru yang ada ke berkas spreadsheet Excel
 */
export async function exportGuruToExcel(teachers: TeacherData[]): Promise<void> {
  const XLSX = await loadXLSX();
  const wb = XLSX.utils.book_new();
  const rows = teachers.map((t) => ({
    'Nama Lengkap': t.name,
    'Jabatan': t.position,
    'Jenis Kelamin': t.gender === 'L' ? 'Laki-Laki' : 'Perempuan',
    'Guru Mapel': t.subject,
    'Pendidikan': t.education,
    'No. Telepon': t.phone,
    'Facebook': t.socialMedia?.facebook || '',
    'Instagram': t.socialMedia?.instagram || '',
    'YouTube': t.socialMedia?.youtube || '',
    'WhatsApp': t.socialMedia?.whatsapp || '',
  }));
  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = [
    { wch: 35 },
    { wch: 18 },
    { wch: 14 },
    { wch: 22 },
    { wch: 28 },
    { wch: 18 },
    { wch: 30 },
    { wch: 30 },
    { wch: 30 },
    { wch: 18 },
  ];
  XLSX.utils.book_append_sheet(wb, ws, 'Data Guru');
  XLSX.writeFile(wb, `data-guru-${new Date().toISOString().slice(0, 10)}.xlsx`);
}

/**
 * Membaca dan mem-parsing berkas Excel yang diunggah pengguna menjadi data guru
 */
export async function parseGuruExcel(file: File): Promise<Omit<TeacherData, 'id'>[]> {
  const XLSX = await loadXLSX();
  const data = await file.arrayBuffer();
  const wb = XLSX.read(new Uint8Array(data), { type: 'array' });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(ws);

  if (!rows || !rows.length) {
    throw new Error('File Excel kosong atau tidak memiliki baris data.');
  }

  const results: Omit<TeacherData, 'id'>[] = [];

  rows.forEach((r) => {
    const name = String(r['Nama Lengkap'] || r['nama'] || r['Nama'] || '').trim();
    if (!name) return; // Lewati baris tanpa nama

    const position = String(r['Jabatan'] || r['jabatan'] || 'Guru Pengajar').trim();
    const rawGender = String(r['Jenis Kelamin'] || r['gender'] || r['JK'] || 'L').trim().toUpperCase();
    const gender: 'L' | 'P' = rawGender.startsWith('P') || rawGender === 'PEREMPUAN' ? 'P' : 'L';
    const subject = String(r['Guru Mapel'] || r['mapel'] || r['Mata Pelajaran'] || '').trim();
    const education = String(r['Pendidikan'] || r['pendidikan'] || '').trim();
    const phone = String(r['No. Telepon'] || r['telepon'] || r['no_hp'] || r['hp'] || '').trim();

    const socialMedia: TeacherData['socialMedia'] = {};
    if (r['Facebook']) socialMedia.facebook = String(r['Facebook']).trim();
    if (r['Instagram']) socialMedia.instagram = String(r['Instagram']).trim();
    if (r['YouTube']) socialMedia.youtube = String(r['YouTube']).trim();
    if (r['WhatsApp']) socialMedia.whatsapp = String(r['WhatsApp']).trim();

    results.push({
      name,
      position,
      gender,
      subject,
      education,
      phone,
      photo: '',
      socialMedia,
    });
  });

  return results;
}

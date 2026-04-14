export interface NewsItem {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  image: string;
  date: string;
  author: string;
}

export interface AgendaItem {
  id: string;
  title: string;
  date: string;
  endDate: string;
  time: string;
  location: string;
  description: string;
  type: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  image: string;
  category: string;
  date: string;
  mediaType: 'image' | 'video';
  youtubeUrl: string;
}

export interface ContactInfo {
  address: string;
  phone: string;
  email: string;
  hours: string;
  mapQuery: string;
  facebook: string;
  instagram: string;
  youtube: string;
}

export interface SliderItem {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  buttonText: string;
  buttonLink: string;
}

export interface ProfileData {
  about: string;
  visi: string;
  misi: string[];
  sambutanKepsek: string;
  namaKepsek: string;
  jabatanKepsek: string;
  fotoKepsek: string;
  facilities: string[];
}

export interface StatsData {
  siswaAktif: string;
  tenagaPendidik: string;
  prestasi: string;
  akreditasi: string;
}

export interface InstagramPost {
  id: string;
  postUrl: string;        // Full Instagram post URL e.g. https://www.instagram.com/p/ABC123/
  caption: string;        // Custom caption/description
  thumbnail: string;      // Uploaded thumbnail image (base64 or URL)
  likes: string;          // Display likes count (manual)
  date: string;           // Post date
  isEmbed: boolean;       // Use Instagram embed script vs manual card
  embedCode: string;      // Raw embed code from Instagram
}

export interface InstagramSettings {
  username: string;       // @handle
  profileUrl: string;     // Full profile URL
  showSection: boolean;   // Toggle visibility on Home/Gallery
  sectionTitle: string;   // Custom section title
  embedType: 'manual' | 'widget';
  widgetCode: string;
  posts: InstagramPost[];
}

export interface FooterCredit {
  copyrightText: string;
  rightText: string;
  showYear: boolean;
  schoolName: string;
  developerName: string;
  developerUrl: string;
}

export interface Sponsor {
  id: string;
  name: string;
  logo: string; // Base64 or URL
  url: string; // Clickable link
}

export interface SponsorsData {
  showSection: boolean;
  title: string;
  sponsors: Sponsor[];
}

export interface SmpbButtonSettings {
  isActive: boolean;
  year: string;
  link: string;
  openInNewTab: boolean;
}

export interface SEOData {
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  ogImage: string;
  ogType: string;
  robots: string;
  canonicalUrl: string;
  googleVerification: string;
  bingVerification: string;
  googleAnalyticsId: string;
}

export interface DailyView {
  date: string;
  views: number;
  sessions: number;
}

export interface AnalyticsData {
  totalPageViews: number;
  totalSessions: number;
  dailyViews: DailyView[];
  pageViews: Record<string, number>;
  referrers: Record<string, number>;
  lastUpdated: string;
}

export function extractYoutubeId(url: string): string | null {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

export function getYoutubeThumbnail(url: string): string {
  const id = extractYoutubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : '';
}

export const NEWS_CATEGORIES = ['Semua', 'Prestasi', 'OSIS', 'Pramuka', 'Akademik', 'Olahraga', 'Seni'];
export const GALLERY_CATEGORIES = ['Semua', 'Akademik', 'Event', 'Wisata', 'Seni', 'Olahraga', 'Video'];
export const AGENDA_TYPES = ['Ujian', 'Rapat', 'Kegiatan', 'Libur', 'Ekstrakurikuler'];

export const CATEGORY_COLORS: Record<string, string> = {
  Prestasi: 'bg-amber-100 text-amber-800',
  OSIS: 'bg-blue-100 text-blue-800',
  Pramuka: 'bg-green-100 text-green-800',
  Akademik: 'bg-purple-100 text-purple-800',
  Olahraga: 'bg-red-100 text-red-800',
  Seni: 'bg-pink-100 text-pink-800',
  Video: 'bg-indigo-100 text-indigo-800',
  Ujian: 'bg-red-100 text-red-700',
  Rapat: 'bg-blue-100 text-blue-700',
  Kegiatan: 'bg-green-100 text-green-700',
  Libur: 'bg-orange-100 text-orange-700',
  Ekstrakurikuler: 'bg-purple-100 text-purple-700',
  Event: 'bg-cyan-100 text-cyan-800',
  Wisata: 'bg-teal-100 text-teal-800',
};

export const GRADIENTS = [
  'linear-gradient(135deg, #0ea5e9, #0369a1)',
  'linear-gradient(135deg, #f59e0b, #b45309)',
  'linear-gradient(135deg, #10b981, #047857)',
  'linear-gradient(135deg, #8b5cf6, #6d28d9)',
  'linear-gradient(135deg, #ef4444, #b91c1c)',
  'linear-gradient(135deg, #ec4899, #be185d)',
  'linear-gradient(135deg, #06b6d4, #0e7490)',
  'linear-gradient(135deg, #84cc16, #4d7c0f)',
  'linear-gradient(135deg, #f97316, #c2410c)',
];

export const initialContactInfo: ContactInfo = {
  address: 'Jl. Raya Genteng No. 01, Genteng, Kabupaten Banyuwangi, Jawa Timur 68465',
  phone: '(0333) 845123',
  email: 'info@smpn1genteng.sch.id',
  hours: 'Senin - Sabtu: 07:00 - 14:00 WIB',
  mapQuery: 'SMP+Negeri+1+Genteng+Banyuwangi',
  facebook: 'https://facebook.com',
  instagram: 'https://instagram.com',
  youtube: 'https://youtube.com',
};

export const initialSliderItems: SliderItem[] = [
  {
    id: '1',
    title: 'Unggul dalam Prestasi, Santun dalam Budi Pekerti',
    subtitle: 'Membentuk generasi penerus bangsa yang cerdas, berkarakter, berakhlak mulia, dan siap menghadapi tantangan masa depan.',
    image: '',
    buttonText: 'Profil Sekolah',
    buttonLink: '/profil',
  },
  {
    id: '2',
    title: 'Pendaftaran Peserta Didik Baru Tahun Ajaran 2025/2026',
    subtitle: 'Bergabunglah bersama keluarga besar SMPN 1 Genteng. Raih masa depan cemerlang bersama kami.',
    image: '',
    buttonText: 'Info Selengkapnya',
    buttonLink: '/kontak',
  },
  {
    id: '3',
    title: 'Prestasi Gemilang di Tingkat Nasional',
    subtitle: 'Siswa-siswi kami terus menorehkan prestasi membanggakan di berbagai kompetisi akademik dan non-akademik.',
    image: '',
    buttonText: 'Lihat Berita',
    buttonLink: '/berita',
  },
];

export const initialStatsData: StatsData = {
  siswaAktif: '720+',
  tenagaPendidik: '48',
  prestasi: '150+',
  akreditasi: 'A',
};

export const initialInstagramSettings: InstagramSettings = {
  username: '@smpn1genteng',
  profileUrl: 'https://www.instagram.com/smpn1genteng',
  showSection: true,
  sectionTitle: 'Instagram Sekolah',
  embedType: 'widget',
  widgetCode: '<div class="elfsight-app-xxxxxx-xxxx-xxxx-xxxx-xxxxxxx"></div>\n<!-- Dapatkan kode ini gratis di elfsight.com atau curator.io -->',
  posts: [
    {
      id: '1',
      postUrl: 'https://www.instagram.com/p/example1/',
      caption: 'Kegiatan Upacara Bendera Hari Senin berjalan dengan khidmat. Seluruh civitas akademika SMPN 1 Genteng mengikuti upacara dengan penuh semangat. 🇮🇩 #SMPN1Genteng #UpacaraBendera',
      thumbnail: '',
      likes: '128',
      date: '2025-01-06',
      isEmbed: false,
      embedCode: '',
    },
    {
      id: '2',
      postUrl: 'https://www.instagram.com/p/example2/',
      caption: 'Siswa-siswi kami meraih prestasi gemilang di Olimpiade Sains Nasional tingkat Provinsi Jawa Timur! Selamat dan terus semangat! 🏆 #Prestasi #OSN #SMPN1Genteng',
      thumbnail: '',
      likes: '245',
      date: '2025-01-05',
      isEmbed: false,
      embedCode: '',
    },
    {
      id: '3',
      postUrl: 'https://www.instagram.com/p/example3/',
      caption: 'Kegiatan Pramuka yang menyenangkan! Siswa belajar survival skills dan kerja sama tim. 🏕️ #Pramuka #Ekstrakurikuler #SMPN1Genteng',
      thumbnail: '',
      likes: '98',
      date: '2025-01-04',
      isEmbed: false,
      embedCode: '',
    },
    {
      id: '4',
      postUrl: 'https://www.instagram.com/p/example4/',
      caption: 'Workshop Kurikulum Merdeka Belajar bersama Dinas Pendidikan Kabupaten Banyuwangi. Terus berinovasi untuk pendidikan berkualitas! 📚 #KurikulumMerdeka #SMPN1Genteng',
      thumbnail: '',
      likes: '176',
      date: '2025-01-03',
      isEmbed: false,
      embedCode: '',
    },
    {
      id: '5',
      postUrl: 'https://www.instagram.com/p/example5/',
      caption: 'Tim Futsal SMPN 1 Genteng Juara 1 tingkat Kabupaten! Luar biasa! ⚽🏆 #Futsal #Olahraga #Juara #SMPN1Genteng',
      thumbnail: '',
      likes: '312',
      date: '2025-01-02',
      isEmbed: false,
      embedCode: '',
    },
    {
      id: '6',
      postUrl: 'https://www.instagram.com/p/example6/',
      caption: 'Festival Seni Budaya yang meriah! Penampilan tari Gandrung Banyuwangi memukau seluruh penonton. 🎭 #SeniBudaya #FestivalSeni #SMPN1Genteng',
      thumbnail: '',
      likes: '189',
      date: '2025-01-01',
      isEmbed: false,
      embedCode: '',
    },
  ],
};

export const initialFooterCredit: FooterCredit = {
  copyrightText: '',
  rightText: 'Dibuat dengan ❤️ untuk pendidikan Indonesia',
  showYear: true,
  schoolName: 'SMP Negeri 1 Genteng',
  developerName: '',
  developerUrl: '',
};

export const initialSEOData: SEOData = {
  metaTitle: 'SMP Negeri 1 Genteng - Website Resmi',
  metaDescription: 'Website resmi SMP Negeri 1 Genteng, Kabupaten Banyuwangi, Jawa Timur. Unggul dalam Prestasi, Santun dalam Budi Pekerti. Informasi pendaftaran, berita kegiatan, agenda sekolah, dan galeri.',
  metaKeywords: 'SMPN 1 Genteng, SMP Negeri 1 Genteng, sekolah Banyuwangi, pendidikan Genteng, sekolah menengah pertama, PPDB Banyuwangi',
  ogImage: '',
  ogType: 'website',
  robots: 'index, follow',
  canonicalUrl: '',
  googleVerification: '',
  bingVerification: '',
  googleAnalyticsId: '',
};

export const initialAnalyticsData: AnalyticsData = {
  totalPageViews: 0,
  totalSessions: 0,
  dailyViews: [],
  pageViews: {},
  referrers: {},
  lastUpdated: new Date().toISOString(),
};

export const initialProfileData: ProfileData = {
  about: '<p>SMP Negeri 1 Genteng merupakan salah satu sekolah menengah pertama unggulan di Kabupaten Banyuwangi, Provinsi Jawa Timur. Berdiri sejak tahun 1965, sekolah kami telah menghasilkan ribuan alumni yang berkontribusi di berbagai bidang kehidupan.</p><p>Dengan fasilitas yang lengkap dan tenaga pendidik yang berkualitas, SMPN 1 Genteng berkomitmen untuk memberikan pendidikan terbaik dan membentuk karakter siswa yang berakhlak mulia, berprestasi, dan siap menghadapi tantangan era global.</p><p>Akreditasi <strong>A</strong> yang kami peroleh merupakan bukti nyata komitmen kami terhadap standar pendidikan yang tinggi.</p>',
  visi: 'Mewujudkan peserta didik yang unggul dalam prestasi, beriman dan bertaqwa, berakhlak mulia, serta berbudaya lingkungan.',
  misi: [
    'Melaksanakan pembelajaran yang aktif, kreatif, efektif, dan menyenangkan (PAKEM).',
    'Menumbuhkan semangat berprestasi dalam bidang akademik dan non-akademik.',
    'Mengembangkan potensi peserta didik secara optimal melalui kegiatan ekstrakurikuler.',
    'Membentuk karakter peserta didik yang beriman, bertaqwa, dan berakhlak mulia.',
    'Mewujudkan lingkungan sekolah yang bersih, sehat, dan nyaman.',
    'Meningkatkan kerjasama dengan orang tua, masyarakat, dan instansi terkait.',
  ],
  sambutanKepsek: '<p>Assalamualaikum Wr. Wb. Puji syukur kita panjatkan kehadirat Allah SWT atas segala rahmat dan karunia-Nya. Selamat datang di website resmi SMP Negeri 1 Genteng, Kabupaten Banyuwangi.</p><p>Sebagai lembaga pendidikan yang berkomitmen tinggi terhadap kualitas, kami senantiasa berupaya memberikan pelayanan pendidikan terbaik bagi seluruh peserta didik. Melalui website ini, kami berharap dapat menjalin komunikasi yang lebih baik dengan seluruh stakeholder pendidikan.</p><p>Wassalamualaikum Wr. Wb.</p>',
  namaKepsek: 'Drs. Bambang Supriyadi, M.Pd.',
  jabatanKepsek: 'Kepala SMP Negeri 1 Genteng',
  fotoKepsek: '',
  facilities: [
    'Ruang Kelas Ber-AC (24 Ruang)',
    'Laboratorium IPA',
    'Laboratorium Komputer',
    'Perpustakaan Digital',
    'Lapangan Olahraga',
    'Aula Serbaguna',
    'Musholla',
    'Ruang OSIS',
    'UKS (Unit Kesehatan Sekolah)',
    'Kantin Sehat',
    'Taman Literasi',
    'Ruang Seni & Musik',
  ],
};

export const initialNews: NewsItem[] = [
  {
    id: '1',
    title: 'Siswa SMPN 1 Genteng Raih Juara 1 Olimpiade Sains Nasional',
    excerpt: 'Membanggakan! Ananda Rizky Pratama, siswa kelas IX-A, berhasil meraih medali emas dalam ajang Olimpiade Sains Nasional (OSN) tingkat Provinsi Jawa Timur bidang Matematika.',
    content: '<p>Siswa SMPN 1 Genteng kembali mengharumkan nama sekolah di kancah kompetisi akademik tingkat provinsi. <strong>Ananda Rizky Pratama</strong>, siswa kelas IX-A, berhasil meraih medali emas dalam ajang Olimpiade Sains Nasional (OSN) tingkat Provinsi Jawa Timur bidang Matematika yang diselenggarakan pada tanggal 10-12 Desember 2024 di Surabaya.</p><p>Rizky berhasil mengalahkan ratusan peserta dari berbagai kabupaten/kota se-Jawa Timur. Pencapaian ini merupakan hasil dari pembinaan intensif yang dilakukan oleh tim guru pembimbing selama 6 bulan terakhir.</p><blockquote>"Saya sangat bersyukur dan bangga atas pencapaian ini. Terima kasih kepada bapak/ibu guru yang telah membimbing saya dengan sabar," ujar Rizky setelah menerima medali.</blockquote><p>Kepala Sekolah, Drs. Bambang Supriyadi, M.Pd., menyampaikan apresiasi yang tinggi. "Prestasi ini membuktikan bahwa siswa-siswi SMPN 1 Genteng mampu bersaing di tingkat provinsi bahkan nasional. Kami akan terus mendukung pengembangan potensi akademik siswa."</p>',
    category: 'Prestasi',
    image: '',
    date: '2024-12-15',
    author: 'Admin'
  },
  {
    id: '2',
    title: 'Pelantikan Pengurus OSIS Periode 2024/2025',
    excerpt: 'Kegiatan pelantikan pengurus OSIS baru periode 2024/2025 telah dilaksanakan dengan khidmat di aula sekolah.',
    content: '<p>Pelantikan pengurus OSIS periode 2024/2025 telah dilaksanakan dengan khidmat di Aula SMPN 1 Genteng pada hari Senin, 10 Desember 2024. Acara ini dihadiri oleh seluruh civitas akademika sekolah.</p><p><strong>Ananda Sari Dewi</strong> terpilih sebagai Ketua OSIS yang baru setelah melalui proses pemilihan yang demokratis. Dalam pidato pelantikannya, Sari menyampaikan visinya untuk menjadikan OSIS sebagai wadah pengembangan kreativitas dan kepemimpinan siswa.</p><h3>Program Kerja</h3><ul><li>Peningkatan kegiatan literasi</li><li>Penyelenggaraan event seni dan olahraga</li><li>Program kepedulian lingkungan sekolah</li></ul>',
    category: 'OSIS',
    image: '',
    date: '2024-12-10',
    author: 'Admin'
  },
  {
    id: '3',
    title: 'Kegiatan Pramuka: Jambore Ranting Kecamatan Genteng',
    excerpt: 'Gugus depan SMPN 1 Genteng berpartisipasi aktif dalam Jambore Ranting Kecamatan Genteng.',
    content: '<p>Gugus depan SMPN 1 Genteng turut berpartisipasi aktif dalam kegiatan <strong>Jambore Ranting Kecamatan Genteng</strong> yang diselenggarakan pada tanggal 3-5 Desember 2024 di Bumi Perkemahan Genteng.</p><p>Kegiatan yang diikuti oleh 20 pangkalan dari berbagai sekolah se-Kecamatan Genteng ini mengusung tema <em>"Pramuka Berkarakter, Siap Mengabdi untuk Bangsa"</em>.</p><h3>Prestasi yang Diraih</h3><ul><li>🥇 Juara 1 Lomba Pionering</li><li>🥈 Juara 2 Lomba Hasta Karya</li></ul>',
    category: 'Pramuka',
    image: '',
    date: '2024-12-05',
    author: 'Admin'
  },
  {
    id: '4',
    title: 'Workshop Penerapan Kurikulum Merdeka Belajar',
    excerpt: 'SMPN 1 Genteng menggelar workshop intensif tentang implementasi Kurikulum Merdeka Belajar.',
    content: '<p>Dalam rangka meningkatkan kualitas pembelajaran, SMPN 1 Genteng menggelar <strong>workshop intensif</strong> tentang implementasi Kurikulum Merdeka Belajar pada tanggal 25-27 November 2024.</p><p>Workshop ini diikuti oleh seluruh tenaga pendidik dan menghadirkan narasumber dari Dinas Pendidikan Kabupaten Banyuwangi serta praktisi pendidikan.</p><h3>Materi Workshop</h3><ol><li>Penyusunan modul ajar</li><li>Asesmen diagnostik</li><li>Strategi pembelajaran berdiferensiasi</li></ol>',
    category: 'Akademik',
    image: '',
    date: '2024-11-28',
    author: 'Admin'
  },
  {
    id: '5',
    title: 'Tim Futsal SMPN 1 Genteng Juara 1 Tingkat Kabupaten',
    excerpt: 'Tim futsal putra SMPN 1 Genteng berhasil menjuarai kompetisi futsal antar SMP se-Kabupaten Banyuwangi.',
    content: '<p>Tim futsal putra SMPN 1 Genteng berhasil menorehkan prestasi gemilang dengan menjuarai kompetisi futsal antar SMP se-Kabupaten Banyuwangi.</p><p>Di babak final, tim SMPN 1 Genteng berhadapan dengan SMPN 2 Banyuwangi dan berhasil menang dengan skor <strong>4-2</strong>.</p><h3>Pencetak Gol</h3><ul><li>Ahmad Fadil (2 gol)</li><li>Deni Saputra</li><li>Reza Mahendra</li></ul><blockquote>"Mereka sudah berlatih keras selama 3 bulan. Hasil ini adalah buah dari kerja keras dan kekompakan tim." — Bapak Agus Setiawan, S.Pd.</blockquote>',
    category: 'Olahraga',
    image: '',
    date: '2024-11-20',
    author: 'Admin'
  },
  {
    id: '6',
    title: 'Festival Seni Budaya Memperingati Hari Pendidikan Nasional',
    excerpt: 'SMPN 1 Genteng menggelar Festival Seni dan Budaya yang menampilkan berbagai pertunjukan seni dari para siswa.',
    content: '<p>SMPN 1 Genteng menggelar <strong>Festival Seni dan Budaya</strong> yang meriah dalam rangka memperingati Hari Pendidikan Nasional.</p><h3>Penampilan yang Ditampilkan</h3><ul><li>Tari tradisional Gandrung Banyuwangi</li><li>Paduan suara</li><li>Drama musikal</li><li>Pembacaan puisi</li><li>Pertunjukan band</li></ul><p>Acara yang berlangsung selama sehari penuh ini berhasil menarik perhatian ratusan penonton termasuk orang tua siswa dan masyarakat sekitar.</p>',
    category: 'Seni',
    image: '',
    date: '2024-11-15',
    author: 'Admin'
  },
];

export const initialAgenda: AgendaItem[] = [
  {
    id: '1',
    title: 'Penilaian Akhir Semester (PAS) Ganjil',
    date: '2025-06-09',
    endDate: '2025-06-20',
    time: '07:30 - 12:00 WIB',
    location: 'Ruang Kelas',
    description: 'Pelaksanaan Penilaian Akhir Semester Ganjil untuk seluruh siswa kelas VII, VIII, dan IX.',
    type: 'Ujian'
  },
  {
    id: '2',
    title: 'Rapat Wali Murid Kelas IX',
    date: '2025-06-21',
    endDate: '',
    time: '09:00 - 12:00 WIB',
    location: 'Aula Sekolah',
    description: 'Pembahasan persiapan ujian akhir, informasi pendaftaran SMA/SMK, dan evaluasi perkembangan belajar siswa.',
    type: 'Rapat'
  },
  {
    id: '3',
    title: 'Penerimaan Rapor Semester Ganjil',
    date: '2025-06-23',
    endDate: '',
    time: '08:00 - 11:00 WIB',
    location: 'Ruang Kelas Masing-masing',
    description: 'Pembagian rapor hasil belajar semester ganjil tahun ajaran 2024/2025.',
    type: 'Kegiatan'
  },
  {
    id: '4',
    title: 'Libur Semester Ganjil',
    date: '2025-06-24',
    endDate: '2025-07-06',
    time: '-',
    location: '-',
    description: 'Masa libur semester ganjil.',
    type: 'Libur'
  },
  {
    id: '5',
    title: 'Latihan Rutin Pramuka',
    date: '2025-07-12',
    endDate: '',
    time: '14:00 - 16:30 WIB',
    location: 'Lapangan Sekolah',
    description: 'Latihan rutin kegiatan kepramukaan untuk seluruh siswa anggota gugus depan.',
    type: 'Ekstrakurikuler'
  },
  {
    id: '6',
    title: 'Pembinaan Olimpiade Sains',
    date: '2025-07-15',
    endDate: '',
    time: '14:00 - 16:00 WIB',
    location: 'Laboratorium IPA',
    description: 'Pembinaan intensif siswa-siswi terpilih untuk persiapan mengikuti OSN tingkat kabupaten.',
    type: 'Kegiatan'
  },
];

export const initialGallery: GalleryItem[] = [
  { id: '1', title: 'Upacara Bendera Hari Senin', image: '', category: 'Akademik', date: '2024-12-02', mediaType: 'image', youtubeUrl: '' },
  { id: '2', title: 'Praktikum di Laboratorium IPA', image: '', category: 'Akademik', date: '2024-11-28', mediaType: 'image', youtubeUrl: '' },
  { id: '3', title: 'Lomba 17 Agustus - Tarik Tambang', image: '', category: 'Event', date: '2024-08-17', mediaType: 'image', youtubeUrl: '' },
  { id: '4', title: 'Study Tour ke Bali', image: '', category: 'Wisata', date: '2024-10-15', mediaType: 'image', youtubeUrl: '' },
  { id: '5', title: 'Pentas Seni Akhir Tahun', image: '', category: 'Seni', date: '2024-12-20', mediaType: 'image', youtubeUrl: '' },
  { id: '6', title: 'Pertandingan Futsal Antar Kelas', image: '', category: 'Olahraga', date: '2024-11-10', mediaType: 'image', youtubeUrl: '' },
  { id: '7', title: 'Kemah Pramuka di Alam Terbuka', image: '', category: 'Event', date: '2024-09-22', mediaType: 'image', youtubeUrl: '' },
  { id: '8', title: 'Wisuda dan Perpisahan Kelas IX', image: '', category: 'Event', date: '2024-06-15', mediaType: 'image', youtubeUrl: '' },
  { id: '9', title: 'Latihan Paduan Suara', image: '', category: 'Seni', date: '2024-11-05', mediaType: 'image', youtubeUrl: '' },
];

export const initialSponsorsData: SponsorsData = {
  showSection: true,
  title: 'Didukung Oleh',
  sponsors: [
    {
      id: '1',
      name: 'Kementerian Pendidikan',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/9/9c/Logo_of_Ministry_of_Education_and_Culture_of_Republic_of_Indonesia.svg',
      url: 'https://kemdikbud.go.id'
    },
    {
      id: '2',
      name: 'Pemerintah Kabupaten Banyuwangi',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/a/ae/Lambang_Kabupaten_Banyuwangi.png',
      url: 'https://banyuwangikab.go.id'
    }
  ]
};

export const initialSmpbButtonSettings: SmpbButtonSettings = {
  isActive: false,
  year: new Date().getFullYear().toString(),
  link: '',
  openInNewTab: true,
};

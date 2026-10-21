import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  HardDrive,
  Database,
  Download,
  Upload,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Info,
  X
} from "lucide-react";
import {
  loadSettings,
  saveSetting,
  exportAllSettings,
  checkDatabaseConnection,
  getDatabaseStorageStats,
  ensureDefaultSettings,
  resetSettingsToDefault,
  type DatabaseStorageStats,
  type DatabaseConnectionStatus
} from "../../../services/settingsRepository";
import { SETTINGS_DB_KEYS } from "../../../constants/settingsKeys";
import { DEFAULT_SETTINGS_BY_KEY } from "../../../constants/defaultSettings";
import { useApp } from "../../../context/AppContext";
import {
  initialNews,
  initialAgenda,
  initialGallery,
  initialSliderItems,
  initialExtracurricular,
  initialInstagramSettings,
  initialSponsorsData
} from "../../../types";
import { getLocalStorageUsage } from "../../../utils/storageQuota";

const BACKUP_DATABASE_KEYS = [
  { key: SETTINGS_DB_KEYS.news, label: 'Berita', icon: '📰' },
  { key: SETTINGS_DB_KEYS.agenda, label: 'Agenda', icon: '📅' },
  { key: SETTINGS_DB_KEYS.gallery, label: 'Galeri', icon: '📷' },
  { key: SETTINGS_DB_KEYS.contact, label: 'Kontak', icon: '📞' },
  { key: SETTINGS_DB_KEYS.slider, label: 'Slider Hero', icon: '🖼️' },
  { key: SETTINGS_DB_KEYS.extracurricular, label: 'Ekstrakurikuler', icon: '🏆' },
  { key: SETTINGS_DB_KEYS.teachers, label: 'Data Guru', icon: '👨‍🏫' },
  { key: SETTINGS_DB_KEYS.galleryCategories, label: 'Kategori Galeri', icon: '🏷️' },
  { key: SETTINGS_DB_KEYS.eskulCategories, label: 'Kategori Eskul', icon: '🏷️' },
  { key: SETTINGS_DB_KEYS.profile, label: 'Profil', icon: '📋' },
  { key: SETTINGS_DB_KEYS.stats, label: 'Statistik', icon: '📊' },
  { key: SETTINGS_DB_KEYS.schoolIdentity, label: 'Identitas Sekolah', icon: '🧭' },
  { key: SETTINGS_DB_KEYS.brand, label: 'Logo Sekolah', icon: '🏫' },
  { key: SETTINGS_DB_KEYS.downloads, label: 'Dokumen Download', icon: '⬇️' },
  { key: SETTINGS_DB_KEYS.footer, label: 'Footer Credit', icon: '📝' },
  { key: SETTINGS_DB_KEYS.seo, label: 'SEO', icon: '🔍' },
  { key: SETTINGS_DB_KEYS.analytics, label: 'Analitik', icon: '📈' },
  { key: SETTINGS_DB_KEYS.instagram, label: 'Instagram', icon: '📸' },
  { key: SETTINGS_DB_KEYS.sponsors, label: 'Sponsor/Mitra', icon: '🤝' },
  { key: SETTINGS_DB_KEYS.smpbButton, label: 'Tombol SMPB', icon: '🎓' },
  { key: SETTINGS_DB_KEYS.auth, label: 'Keamanan Admin', icon: '🔐' },
] as const;

const MEDIA_FOLDER_META: Record<string, { label: string; icon: string }> = {
  gallery: { label: 'Galeri Kegiatan', icon: '📸' },
  teachers: { label: 'Guru & Karyawan', icon: '👨‍🏫' },
  news: { label: 'Berita & Artikel', icon: '📰' },
  slider: { label: 'Banner Beranda', icon: '🖼️' },
  profile: { label: 'Profil Madrasah', icon: '👤' },
  eskul: { label: 'Ekstrakurikuler', icon: '⚽' },
  brand: { label: 'Logo & Branding', icon: '🏷️' },
};

const INITIAL_SETUP_CONTENT_KEYS = [
  SETTINGS_DB_KEYS.news,
  SETTINGS_DB_KEYS.agenda,
  SETTINGS_DB_KEYS.gallery,
  SETTINGS_DB_KEYS.slider,
  SETTINGS_DB_KEYS.extracurricular,
] as const;

const INITIAL_SETUP_DEMO_VALUES: Record<string, unknown> = {
  [SETTINGS_DB_KEYS.news]: initialNews,
  [SETTINGS_DB_KEYS.agenda]: initialAgenda,
  [SETTINGS_DB_KEYS.gallery]: initialGallery,
  [SETTINGS_DB_KEYS.slider]: initialSliderItems,
  [SETTINGS_DB_KEYS.extracurricular]: initialExtracurricular,
  [SETTINGS_DB_KEYS.instagram]: initialInstagramSettings,
  [SETTINGS_DB_KEYS.sponsors]: initialSponsorsData,
};

function getSetupItemCount(key: string, value: unknown): number {
  if (Array.isArray(value)) return value.length;
  if (!value || typeof value !== 'object') return 0;

  if (key === SETTINGS_DB_KEYS.instagram) {
    const posts = (value as { posts?: unknown[] }).posts;
    return Array.isArray(posts) ? posts.length : 0;
  }

  if (key === SETTINGS_DB_KEYS.sponsors) {
    const sponsors = (value as { sponsors?: unknown[] }).sponsors;
    return Array.isArray(sponsors) ? sponsors.length : 0;
  }

  return 0;
}

function isSetupItemMissingOrEmpty(_key: string, value: unknown): boolean {
  if (value === undefined || value === null) return true;
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

export interface DatabaseSettingsTabProps {
  notifySaved?: (title: string, message?: string) => void;
  addToast?: (toast: { type: 'success' | 'error' | 'warning' | 'info'; title: string; message: string; duration?: number }) => void;
}

export default function DatabaseSettingsTab({ notifySaved: propNotifySaved, addToast: propAddToast }: DatabaseSettingsTabProps = {}) {
  const { schoolIdentity } = useApp();
  const notifySaved = useCallback((title: string, message?: string) => {
    if (propNotifySaved) {
      propNotifySaved(title, message);
    }
  }, [propNotifySaved]);

  const addToast = useCallback((toast: { type: 'success' | 'error' | 'warning' | 'info'; title: string; message: string; duration?: number }) => {
    if (propAddToast) {
      propAddToast(toast);
    }
  }, [propAddToast]);

  const [restoreStatus, setRestoreStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [restoreMessage, setRestoreMessage] = useState('');
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [backupInfo, setBackupInfo] = useState<{ date: string; size: string } | null>(null);
  const [showResetAllConfirm, setShowResetAllConfirm] = useState(false);
  const [settingsSnapshot, setSettingsSnapshot] = useState<Record<string, unknown>>({});
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [databaseStats, setDatabaseStats] = useState<DatabaseStorageStats | null>(null);
  const [databaseStatsError, setDatabaseStatsError] = useState('');
  const [isLoadingDatabaseStats, setIsLoadingDatabaseStats] = useState(false);
  const [databaseConnection, setDatabaseConnection] = useState<DatabaseConnectionStatus>({
    isConnected: false,
    source: 'unknown',
    message: 'Memeriksa koneksi database...',
  });
  const [isCheckingConnection, setIsCheckingConnection] = useState(false);
  const [isRunningInitialWebsiteSetup, setIsRunningInitialWebsiteSetup] = useState(false);
  const [isSyncingInitialSetup, setIsSyncingInitialSetup] = useState(false);
  const [isSeedingInitialDemo, setIsSeedingInitialDemo] = useState(false);
  const [isExportingBackup, setIsExportingBackup] = useState(false);
  const [localQuota, setLocalQuota] = useState(() => getLocalStorageUsage());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const refreshSettingsSnapshot = useCallback(async () => {
    setIsLoadingSettings(true);
    try {
      const keys = BACKUP_DATABASE_KEYS.map((item) => item.key);
      const data = await loadSettings(keys as string[]);
      setSettingsSnapshot(data);
    } catch {
      // ignore
    } finally {
      setIsLoadingSettings(false);
    }
  }, []);

  const refreshDatabaseStats = useCallback(async () => {
    setIsLoadingDatabaseStats(true);
    setLocalQuota(getLocalStorageUsage());
    const stats = await getDatabaseStorageStats();
    if (!stats) {
      setDatabaseStatsError('Statistik database belum tersedia. Pastikan tabel settings di Supabase telah aktif.');
    } else {
      setDatabaseStats(stats);
      setDatabaseStatsError('');
    }
    setIsLoadingDatabaseStats(false);
  }, []);

  const refreshDatabaseConnection = useCallback(async () => {
    setIsCheckingConnection(true);
    const status = await checkDatabaseConnection();
    setDatabaseConnection(status);
    setIsCheckingConnection(false);
  }, []);

  useEffect(() => {
    void refreshSettingsSnapshot();
    void refreshDatabaseStats();
    void refreshDatabaseConnection();
  }, [refreshSettingsSnapshot, refreshDatabaseStats, refreshDatabaseConnection]);

  // Calculate storage usage
  const storageData = useMemo(() => {
    let totalSize = 0;
    const items = BACKUP_DATABASE_KEYS.map(({ key, label, icon }) => {
      const raw = settingsSnapshot[key];
      const data = raw !== undefined ? JSON.stringify(raw) : '';
      const size = data ? new Blob([data]).size : 0;
      totalSize += size;
      let count = 0;
      if (raw !== undefined) {
        try {
          const parsed = raw;
          if (Array.isArray(parsed)) count = parsed.length;
          else if (parsed && typeof parsed === 'object' && 'posts' in parsed && Array.isArray((parsed as { posts?: unknown[] }).posts)) {
            count = ((parsed as { posts?: unknown[] }).posts || []).length;
          } else if (parsed && typeof parsed === 'object') {
            count = Object.keys(parsed).length;
          }
        } catch { count = 0; }
      }
      return { key, label, icon, size, count, exists: raw !== undefined };
    });
    return { items, totalSize };
  }, [settingsSnapshot]);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const initialSetupSummary = useMemo(() => {
    if (isLoadingSettings) {
      return {
        pendingItems: [],
        hasSetupWarning: false,
        isFreshInstall: false,
      };
    }
    const labels = new Map(BACKUP_DATABASE_KEYS.map((item) => [item.key, item.label]));
    const items = INITIAL_SETUP_CONTENT_KEYS.map((key) => {
      const value = settingsSnapshot[key];
      return {
        key,
        label: labels.get(key) || key,
        count: getSetupItemCount(key, value),
        missingOrEmpty: isSetupItemMissingOrEmpty(key, value),
      };
    });
    const pendingItems = items.filter((item) => item.missingOrEmpty);

    return {
      pendingItems,
      hasSetupWarning: pendingItems.length > 0,
      isFreshInstall: pendingItems.length === items.length,
    };
  }, [isLoadingSettings, settingsSnapshot]);

  const refreshDatabasePanel = useCallback(async () => {
    await Promise.all([
      refreshSettingsSnapshot(),
      refreshDatabaseStats(),
      refreshDatabaseConnection(),
    ]);
  }, [refreshDatabaseConnection, refreshDatabaseStats, refreshSettingsSnapshot]);

  const handleSyncInitialSetup = async () => {
    setIsSyncingInitialSetup(true);
    setRestoreStatus('idle');
    setRestoreMessage('');

    try {
      await ensureDefaultSettings(DEFAULT_SETTINGS_BY_KEY);
      await refreshDatabasePanel();
      setRestoreStatus('success');
      setRestoreMessage('Sinkronisasi database selesai. Semua key settings wajib sudah dibuat dengan default aman.');
    } catch {
      setRestoreStatus('error');
      setRestoreMessage('Sinkronisasi gagal. Periksa koneksi database dan jalankan schema terbaru.');
    } finally {
      setIsSyncingInitialSetup(false);
    }
  };

  const handleSeedInitialDemo = async () => {
    const confirmed = window.confirm(
      'Isi data dummy awal hanya untuk section konten yang masih kosong. Data yang sudah ada tidak akan ditimpa. Lanjutkan?'
    );
    if (!confirmed) return;

    setIsSeedingInitialDemo(true);
    setRestoreStatus('idle');
    setRestoreMessage('');

    try {
      const currentSettings = await loadSettings([...INITIAL_SETUP_CONTENT_KEYS] as string[]);
      let seededCount = 0;

      for (const key of INITIAL_SETUP_CONTENT_KEYS) {
        if (!isSetupItemMissingOrEmpty(key, currentSettings[key])) continue;
        const saved = await saveSetting(key, INITIAL_SETUP_DEMO_VALUES[key]);
        if (saved) seededCount += 1;
      }

      await refreshDatabasePanel();

      setRestoreStatus('success');
      setRestoreMessage(
        seededCount > 0
          ? `Data dummy awal berhasil diisi untuk ${seededCount} section yang masih kosong.`
          : 'Tidak ada section kosong yang perlu diisi. Semua data utama sudah tersedia.'
      );
    } catch {
      setRestoreStatus('error');
      setRestoreMessage('Pengisian data dummy gagal. Periksa koneksi database lalu coba lagi.');
    } finally {
      setIsSeedingInitialDemo(false);
    }
  };

  const handleInitialWebsiteSetup = async () => {
    const confirmed = window.confirm(
      'Setup Awal Website akan menjalankan sinkronisasi key database lalu mengisi data dummy hanya pada section yang masih kosong. Data yang sudah ada tidak akan ditimpa. Lanjutkan?'
    );
    if (!confirmed) return;

    setIsRunningInitialWebsiteSetup(true);
    setRestoreStatus('idle');
    setRestoreMessage('');

    try {
      await ensureDefaultSettings(DEFAULT_SETTINGS_BY_KEY);

      const currentSettings = await loadSettings([...INITIAL_SETUP_CONTENT_KEYS] as string[]);
      let seededCount = 0;

      for (const key of INITIAL_SETUP_CONTENT_KEYS) {
        if (!isSetupItemMissingOrEmpty(key, currentSettings[key])) continue;
        const saved = await saveSetting(key, INITIAL_SETUP_DEMO_VALUES[key]);
        if (saved) seededCount += 1;
      }

      await refreshDatabasePanel();

      setRestoreStatus('success');
      setRestoreMessage(
        seededCount > 0
          ? `Setup awal website selesai. Key database berhasil disinkronkan dan ${seededCount} section kosong diisi data dummy.`
          : 'Setup awal website selesai. Key database berhasil disinkronkan dan tidak ada section kosong yang perlu diisi data dummy.'
      );
    } catch {
      setRestoreStatus('error');
      setRestoreMessage('Setup awal website gagal. Periksa koneksi database dan coba lagi.');
    } finally {
      setIsRunningInitialWebsiteSetup(false);
    }
  };

  // BACKUP - Export all data
  const handleBackup = async () => {
    setIsExportingBackup(true);
    try {
      const fallbackKeys = BACKUP_DATABASE_KEYS.map((item) => item.key as string);
      const { data: dbData, keys: exportedKeys, source } = await exportAllSettings(fallbackKeys);

      const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
      const backup: Record<string, unknown> = {
        _meta: {
          version: '2.0',
          date: new Date().toISOString(),
          app: 'Portal Sekolah CMS',
          school: schoolIdentity.schoolName || 'Sekolah',
          source,
          totalKeys: exportedKeys.length,
          keys: exportedKeys,
          mediaSummary: databaseStats
            ? {
                mediaSize: databaseStats.mediaSize,
                mediaFiles: databaseStats.mediaFiles,
                storageBucket: 'school-media',
              }
            : undefined,
        },
      };

      exportedKeys.forEach((key) => {
        if (dbData[key] !== undefined) {
          backup[key] = dbData[key];
        }
      });

      const jsonStr = JSON.stringify(backup, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup_sekolah_${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      const sizeFormatted = formatSize(blob.size);
      setBackupInfo({
        date: new Date().toLocaleString('id-ID'),
        size: sizeFormatted,
      });

      notifySaved(
        'Backup Berhasil Diunduh!',
        `File backup_sekolah_${dateStr}.json (${sizeFormatted}) berisi ${exportedKeys.length} data settings berhasil disimpan.`
      );
    } catch (err) {
      console.error('[Backup] Gagal mengunduh backup:', err);
      addToast({
        type: 'error',
        title: 'Backup Gagal',
        message: 'Terjadi kesalahan saat mengekspor data backup.',
      });
    } finally {
      setIsExportingBackup(false);
    }
  };

  // RESTORE - Import data from file
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith('.json')) {
      setRestoreStatus('error');
      setRestoreMessage('File harus berformat .json');
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      setRestoreStatus('error');
      setRestoreMessage('Ukuran file terlalu besar (maks 50MB)');
      return;
    }
    setPendingFile(file);
    setShowRestoreConfirm(true);
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const performRestore = () => {
    if (!pendingFile) return;
    setShowRestoreConfirm(false);

    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const content = ev.target?.result as string;
        const data = JSON.parse(content);

        // Validate backup file
        if (!data._meta) {
          setRestoreStatus('error');
          setRestoreMessage('File backup tidak valid — tidak memiliki metadata.');
          return;
        }

        let restoredCount = 0;
        const keysToRestore = Object.keys(data).filter((k) => k !== '_meta');
        const restoreOperations = keysToRestore.map(async (key) => {
          const success = await saveSetting(key, data[key]);
          if (success) restoredCount++;
        });
        await Promise.all(restoreOperations);
        await refreshSettingsSnapshot();
        await refreshDatabaseStats();
        await refreshDatabaseConnection();

        setRestoreStatus('success');
        setRestoreMessage(`Berhasil! ${restoredCount} data berhasil dipulihkan dari backup tanggal ${new Date(data._meta.date).toLocaleString('id-ID')}. Halaman akan dimuat ulang...`);

        // Reload page after 2.5 seconds to apply changes
        setTimeout(() => { window.location.reload(); }, 2500);
      } catch {
        setRestoreStatus('error');
        setRestoreMessage('Gagal membaca file. Pastikan file berformat JSON yang valid.');
      }
    };
    reader.onerror = () => {
      setRestoreStatus('error');
      setRestoreMessage('Gagal membaca file.');
    };
    reader.readAsText(pendingFile);
    setPendingFile(null);
  };

  // RESET ALL - Clear all data
  const handleResetAll = () => {
    void (async () => {
      const result = await resetSettingsToDefault(DEFAULT_SETTINGS_BY_KEY);
      if (!result.success) {
        setShowResetAllConfirm(false);
        setRestoreStatus('error');
        setRestoreMessage(result.message || 'Gagal reset data ke default.');
        return;
      }
      await refreshSettingsSnapshot();
      await refreshDatabaseStats();
      await refreshDatabaseConnection();
      setShowResetAllConfirm(false);
      setRestoreStatus('success');
      setRestoreMessage(`Reset berhasil: ${result.resetCount} key diatur ulang ke default${result.removedCount > 0 ? ` dan ${result.removedCount} key lama dihapus` : ''}. Halaman akan dimuat ulang...`);
      setTimeout(() => { window.location.reload(); }, 2500);
    })();
  };

  return (
    <div className="animate-fadeIn space-y-4 sm:space-y-6">
      <h2 className="text-lg sm:text-2xl font-extrabold text-gray-900">Database</h2>

      {/* Status Banner */}
      {restoreStatus !== 'idle' && (
        <div className={`rounded-xl p-3 sm:p-4 border flex items-start gap-3 animate-fadeIn ${
          restoreStatus === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
        }`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
            restoreStatus === 'success' ? 'bg-green-100' : 'bg-red-100'
          }`}>
            {restoreStatus === 'success'
              ? <CheckCircle className="h-4 w-4 text-green-600" />
              : <AlertTriangle className="h-4 w-4 text-red-600" />
            }
          </div>
          <div className="flex-1">
            <p className={`text-sm font-semibold ${restoreStatus === 'success' ? 'text-green-800' : 'text-red-800'}`}>
              {restoreStatus === 'success' ? 'Berhasil!' : 'Terjadi Kesalahan'}
            </p>
            <p className={`text-xs mt-0.5 ${restoreStatus === 'success' ? 'text-green-600' : 'text-red-600'}`}>
              {restoreMessage}
            </p>
          </div>
          <button onClick={() => setRestoreStatus('idle')} className="shrink-0 p-1 hover:bg-white/50 rounded">
            <X className="h-4 w-4 text-gray-400" />
          </button>
        </div>
      )}

      {initialSetupSummary.hasSetupWarning && (
        <div className={`rounded-xl sm:rounded-2xl p-4 sm:p-5 border ${
          initialSetupSummary.isFreshInstall
            ? 'bg-amber-50 border-amber-200'
            : 'bg-blue-50 border-blue-200'
        }`}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-gray-900 flex items-center gap-2">
                <AlertTriangle className={`h-4 w-4 sm:h-5 sm:w-5 ${
                  initialSetupSummary.isFreshInstall ? 'text-amber-600' : 'text-blue-600'
                }`} />
                {initialSetupSummary.isFreshInstall ? 'Fresh Install Terdeteksi' : 'Setup Awal Belum Lengkap'}
              </h3>
              <p className="text-xs sm:text-sm text-gray-700 mt-1 leading-relaxed">
                {initialSetupSummary.isFreshInstall
                  ? 'Konten utama website masih kosong. Lakukan sinkronisasi key settings lalu isi data dummy awal jika Anda ingin mendapatkan contoh konten untuk memulai.'
                  : 'Masih ada section konten yang kosong atau belum terbentuk. Sinkronisasi akan membuat key yang hilang, sedangkan data dummy hanya mengisi section kosong.'}
              </p>
              <p className="text-[11px] sm:text-xs text-gray-600 mt-2">
                Section perlu perhatian: {initialSetupSummary.pendingItems.map((item) => item.label).join(', ')}.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 shrink-0">
              <button
                type="button"
                onClick={() => void handleInitialWebsiteSetup()}
                disabled={isRunningInitialWebsiteSetup || isSyncingInitialSetup || isSeedingInitialDemo}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-green-600 text-white text-xs sm:text-sm font-semibold hover:bg-green-700 disabled:opacity-60"
              >
                <CheckCircle className={`h-4 w-4 ${isRunningInitialWebsiteSetup ? 'animate-pulse' : ''}`} />
                {isRunningInitialWebsiteSetup ? 'Menjalankan Setup...' : 'Setup Awal Website'}
              </button>
              <button
                type="button"
                onClick={() => void handleSyncInitialSetup()}
                disabled={isRunningInitialWebsiteSetup || isSyncingInitialSetup || isSeedingInitialDemo}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary-500 text-white text-xs sm:text-sm font-semibold hover:bg-primary-600 disabled:opacity-60"
              >
                <RefreshCw className={`h-4 w-4 ${isSyncingInitialSetup ? 'animate-spin' : ''}`} />
                Sinkronisasi Key
              </button>
              <button
                type="button"
                onClick={() => void handleSeedInitialDemo()}
                disabled={isRunningInitialWebsiteSetup || isSyncingInitialSetup || isSeedingInitialDemo}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 text-xs sm:text-sm font-semibold hover:bg-gray-50 disabled:opacity-60"
              >
                <Upload className={`h-4 w-4 ${isSeedingInitialDemo ? 'animate-pulse' : ''}`} />
                {isSeedingInitialDemo ? 'Mengisi Dummy...' : 'Isi Data Dummy Awal'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Database Connectivity */}
      <div className={`rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border ${
        databaseConnection.isConnected ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'
      }`}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-gray-900 flex items-center gap-2">
              <Database className={`h-4 w-4 sm:h-5 sm:w-5 ${databaseConnection.isConnected ? 'text-green-600' : 'text-amber-600'}`} />
              Konektivitas Database
            </h3>
            <p className={`text-xs sm:text-sm mt-1 ${
              databaseConnection.isConnected ? 'text-green-700' : 'text-amber-700'
            }`}>
              {databaseConnection.message}
            </p>
            <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
              Status: {databaseConnection.isConnected ? 'Terkoneksi ke Supabase Cloud (Active)' : 'Belum terkoneksi'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              void refreshDatabaseConnection();
              void refreshDatabaseStats();
            }}
            disabled={isCheckingConnection || isLoadingDatabaseStats}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2.5 text-[12px] sm:text-xs font-semibold text-white shadow-lg transition-all duration-200 active:scale-95 disabled:opacity-60 disabled:active:scale-100 cursor-pointer touch-manipulation select-none"
            style={{
              background: databaseConnection.isConnected
                ? 'linear-gradient(135deg, #059669, #10b981)'
                : 'linear-gradient(135deg, #d97706, #f59e0b)',
            }}
          >
            <RefreshCw
              className={`h-4 w-4 ${(isCheckingConnection || isLoadingDatabaseStats) ? 'animate-spin' : ''}`}
            />
            {isCheckingConnection ? 'Memeriksa...' : 'Cek Ulang'}
          </button>
        </div>

        {/* Supabase & Cloud Storage Info Badges */}
        <div className="mt-4 pt-3 border-t border-green-200/70 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="bg-white/80 rounded-xl p-2.5 border border-green-100 shadow-xs">
            <span className="text-gray-500 block text-[10px] font-medium">Provider Database</span>
            <span className="font-bold text-gray-800 flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
              Supabase Cloud
            </span>
          </div>
          <div className="bg-white/80 rounded-xl p-2.5 border border-green-100 shadow-xs">
            <span className="text-gray-500 block text-[10px] font-medium">Region Server</span>
            <span className="font-semibold text-gray-800 mt-0.5 block">Singapore (ap-southeast-1)</span>
          </div>
          <div className="bg-white/80 rounded-xl p-2.5 border border-green-100 shadow-xs">
            <span className="text-gray-500 block text-[10px] font-medium">Storage Bucket</span>
            <span className="font-semibold text-gray-800 mt-0.5 block">school-media (Public CDN)</span>
          </div>
          <div className="bg-white/80 rounded-xl p-2.5 border border-green-100 shadow-xs">
            <span className="text-gray-500 block text-[10px] font-medium">Tabel Settings</span>
            <span className="font-semibold text-gray-800 mt-0.5 block">public.settings (JSONB)</span>
          </div>
        </div>
      </div>

      {/* Storage Overview */}
      <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between gap-2 mb-4">
          <h3 className="text-sm sm:text-base font-bold text-gray-900 flex items-center gap-2">
            <HardDrive className="h-4 w-4 sm:h-5 sm:w-5 text-primary-500" />
            Penggunaan Penyimpanan
          </h3>
          <button
            type="button"
            onClick={() => void refreshDatabaseStats()}
            disabled={isLoadingDatabaseStats}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-200 text-[11px] sm:text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-60"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoadingDatabaseStats ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        <div className="bg-gradient-to-br from-primary-50 via-white to-emerald-50 rounded-2xl p-4 sm:p-5 border border-primary-100 mb-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div>
              <p className="text-xs sm:text-sm font-bold text-gray-900 flex items-center gap-1.5">
                <HardDrive className="h-4 w-4 text-primary-600" />
                Penyimpanan Database & Media Cloud
              </p>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Total akumulasi data tabel PostgreSQL dan file gambar di Supabase Storage
              </p>
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-semibold bg-emerald-100 text-emerald-800 self-start sm:self-auto">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              {isLoadingDatabaseStats ? 'Memuat...' : 'Realtime Sync'}
            </span>
          </div>

          {databaseStats ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                <div className="rounded-xl bg-white/90 border border-primary-200/80 p-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-medium text-gray-500">Total Keseluruhan</p>
                    <span className="text-[10px] font-semibold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-md">DB + Storage</span>
                  </div>
                  <p className="text-lg sm:text-xl font-extrabold text-primary-900 mt-1">{databaseStats.databaseSize}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">Tabel Database + File Gambar</p>
                </div>

                <div className="rounded-xl bg-white/90 border border-emerald-200/80 p-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-medium text-gray-500">File Gambar & Media</p>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">Bucket school-media</span>
                  </div>
                  <p className="text-lg sm:text-xl font-extrabold text-emerald-700 mt-1">{databaseStats.mediaSize || '0 B'}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{databaseStats.mediaFiles ?? 0} file foto/gambar terunggah</p>
                </div>

                <div className="rounded-xl bg-white/90 border border-blue-200/80 p-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-medium text-gray-500">Data Tabel Settings</p>
                    <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">PostgreSQL JSONB</span>
                  </div>
                  <p className="text-lg sm:text-xl font-extrabold text-blue-700 mt-1">{databaseStats.settingsSize}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{databaseStats.settingsRows} baris konfigurasi website</p>
                </div>
              </div>

              {/* Rincian Media Per Kategori / Folder */}
              {databaseStats.mediaFolders && databaseStats.mediaFolders.length > 0 && (
                <div className="rounded-xl bg-white/80 border border-gray-200/70 p-3">
                  <p className="text-[11px] font-bold text-gray-700 mb-2 flex items-center justify-between">
                    <span>📁 Rincian File Media Berdasarkan Kategori:</span>
                    <span className="text-[10px] font-normal text-gray-500">{databaseStats.mediaFiles} file di Storage CDN</span>
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {databaseStats.mediaFolders.map((f) => {
                      const meta = MEDIA_FOLDER_META[f.folder] || { label: f.folder, icon: '📁' };
                      return (
                        <div key={f.folder} className="bg-gray-50/80 hover:bg-gray-100/80 rounded-lg p-2 border border-gray-100 transition-colors">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-800 truncate">
                            <span>{meta.icon}</span>
                            <span className="truncate">{meta.label}</span>
                          </div>
                          <div className="flex items-baseline justify-between mt-1 text-[11px]">
                            <span className="text-gray-500">{f.count} file</span>
                            <span className="font-bold text-emerald-600">{f.size}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-[11px] sm:text-xs text-primary-700">
              {databaseStatsError || 'Statistik database belum tersedia.'}
            </p>
          )}
        </div>

        {/* Total usage bar */}
        <div className="bg-gray-50 rounded-xl p-3 sm:p-4 border border-gray-100 mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-2">
            <span className="text-xs sm:text-sm font-semibold text-gray-700">Proporsi Penggunaan Penyimpanan</span>
            <div className="flex items-center gap-3 text-xs">
              <span className="inline-flex items-center gap-1 text-[11px] text-blue-700 font-medium">
                <span className="w-2 h-2 rounded-full bg-blue-500 inline-block"></span> Tabel DB: {databaseStats?.settingsSize || formatSize(storageData.totalSize)}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span> Media Gambar: {databaseStats?.mediaSize || '0 B'}
              </span>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden flex">
            {databaseStats && databaseStats.databaseBytes > 0 ? (
              <>
                <div
                  className="bg-blue-500 h-full transition-all duration-500"
                  style={{ width: `${Math.max(2, (databaseStats.settingsBytes / databaseStats.databaseBytes) * 100)}%` }}
                  title={`Tabel Settings: ${databaseStats.settingsSize}`}
                />
                <div
                  className="bg-emerald-500 h-full transition-all duration-500"
                  style={{ width: `${Math.min(98, (databaseStats.mediaBytes / databaseStats.databaseBytes) * 100)}%` }}
                  title={`Media Cloud: ${databaseStats.mediaSize}`}
                />
              </>
            ) : (
              <div
                className="bg-gradient-to-r from-primary-400 to-primary-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min((storageData.totalSize / (5 * 1024 * 1024)) * 100, 100)}%` }}
              />
            )}
          </div>
          <div className="flex items-center justify-between mt-1.5 text-[10px] text-gray-400">
            <span>Total Digunakan: {databaseStats?.databaseSize || formatSize(storageData.totalSize)}</span>
            <span>Alokasi Supabase Free Tier: 1.0 GB Storage & 500 MB DB</span>
          </div>
        </div>

        {/* LocalStorage Offline Cache Guard */}
        <div className="bg-slate-50/80 rounded-xl p-3 sm:p-4 border border-slate-200 mb-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-gray-800">
                Penyimpanan Cache Offline Browser (LocalStorage Guard)
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                localQuota.status === 'safe'
                  ? 'bg-green-100 text-green-700'
                  : localQuota.status === 'warning'
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-red-100 text-red-700 animate-pulse'
              }`}>
                {localQuota.status === 'safe' ? '✓ Aman' : localQuota.status === 'warning' ? '⚠ Peringatan' : '⛔ Kritis'}
              </span>
            </div>
            <span className="text-xs font-semibold text-gray-600">
              {localQuota.usedFormatted} / {localQuota.totalFormatted} ({localQuota.percentUsed}% terpakai)
            </span>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                localQuota.status === 'safe'
                  ? 'bg-emerald-500'
                  : localQuota.status === 'warning'
                  ? 'bg-amber-500'
                  : 'bg-red-500'
              }`}
              style={{ width: `${Math.min(100, localQuota.percentUsed)}%` }}
            />
          </div>

          <div className="flex items-center justify-between mt-1.5 text-[10px] text-gray-500">
            <span>Sisa Kuota Browser: {localQuota.remainingFormatted} ({localQuota.itemCount} entri kunci tersimpan)</span>
            <span>Kapasitas browser aman untuk loading instan 0ms</span>
          </div>
        </div>

        {/* Individual data items */}
        {isLoadingSettings ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
            {BACKUP_DATABASE_KEYS.map(item => (
              <div key={item.key} className="rounded-xl p-2.5 sm:p-3 border bg-gray-50/70 border-gray-100 animate-pulse">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-base sm:text-lg">{item.icon}</span>
                  <span className="text-xs font-semibold text-gray-500 truncate">{item.label}</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-[10px] text-gray-400">Memuat data...</span>
                  <span className="text-[10px] font-medium text-gray-400">-</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
            {storageData.items.map(item => (
              <div key={item.key} className={`rounded-xl p-2.5 sm:p-3 border transition-all ${item.exists ? 'bg-white border-gray-100 shadow-sm' : 'bg-gray-50/70 border-gray-100 opacity-60'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-base sm:text-lg">{item.icon}</span>
                  <span className="text-xs font-semibold text-gray-700 truncate">{item.label}</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-[10px] text-gray-400">
                    {item.count > 0 ? `${item.count} item` : '0 item'}
                  </span>
                  <span className="text-[10px] font-medium text-primary-500">{formatSize(item.size)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Backup Section */}
      <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 space-y-4">
        <h3 className="text-sm sm:text-base font-bold text-gray-900 flex items-center gap-2">
          <Download className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
          Backup Data Website
        </h3>
        <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
          Download seluruh data website (berita, agenda, galeri, guru, ekstrakurikuler, profil, identitas madrasah, dan pengaturan) sebagai file JSON terstruktur. 
          File backup ini dapat digunakan untuk memulihkan (*restore*) data kapan saja dengan aman.
        </p>

        <div className="bg-green-50 rounded-xl p-3 sm:p-4 border border-green-100">
          <div className="flex items-start gap-3">
            <Info className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
            <div className="text-xs text-green-700 leading-relaxed">
              <p className="font-semibold mb-1">Cakupan Data Backup:</p>
              <p>Berita, Agenda, Galeri Kegiatan, Banner Slider, Guru & Staf, Ekstrakurikuler, Mitra Sponsor, Profil, Statistik, Kontak, Identitas & Branding Sekolah, Dokumen Unduhan, SEO, Analitik, Instagram, SMPB, dan Keamanan Admin.</p>
              <p className="mt-1 text-green-800 font-medium">✨ Penyimpanan Cloud: File gambar kini tersimpan di Supabase Cloud Storage (CDN), sehingga file backup JSON sangat ringkas dan proses download cepat.</p>
            </div>
          </div>
        </div>

        <button
          onClick={handleBackup}
          disabled={isExportingBackup}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-green-500 text-white rounded-xl text-sm font-semibold hover:bg-green-600 disabled:opacity-60 shadow-lg transition-colors cursor-pointer"
        >
          {isExportingBackup ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" /> Menyiapkan Backup...
            </>
          ) : (
            <>
              <Download className="h-4 w-4" /> Download Backup (.json)
            </>
          )}
        </button>

        {backupInfo && (
          <div className="flex items-center gap-2 text-xs text-green-600 animate-fadeIn">
            <CheckCircle className="h-3.5 w-3.5" />
            <span>Backup terakhir: {backupInfo.date} ({backupInfo.size})</span>
          </div>
        )}
      </div>

      {/* Restore Section */}
      <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 space-y-4">
        <h3 className="text-sm sm:text-base font-bold text-gray-900 flex items-center gap-2">
          <Upload className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
          Restore Data
        </h3>
        <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
          Pulihkan data dari file backup JSON yang telah didownload sebelumnya. 
          Data saat ini akan <strong>ditimpa</strong> dengan data dari file backup.
        </p>

        <div className="bg-amber-50 rounded-xl p-3 sm:p-4 border border-amber-100">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-700 leading-relaxed">
              <p className="font-semibold mb-1">⚠️ Perhatian:</p>
              <ul className="space-y-0.5">
                <li>• Data saat ini akan <strong>ditimpa</strong> oleh data dari file backup</li>
                <li>• Pastikan file yang diupload adalah backup yang benar</li>
                <li>• Disarankan backup data saat ini terlebih dahulu sebelum restore</li>
                <li>• Halaman akan dimuat ulang otomatis setelah restore berhasil</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-2 border-dashed border-blue-200 rounded-xl p-6 sm:p-8 text-center hover:border-blue-400 hover:bg-blue-50/50 transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-10 w-10 sm:h-12 sm:w-12 text-blue-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-gray-700">Pilih file backup</p>
          <p className="text-xs text-gray-400 mt-1">Format: .json (maks 50MB)</p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleFileSelect}
          />
        </div>
      </div>

      {/* Reset All Section */}
      <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-red-100 space-y-4">
        <h3 className="text-sm sm:text-base font-bold text-red-600 flex items-center gap-2">
          <RefreshCw className="h-4 w-4 sm:h-5 sm:w-5" />
          Reset Semua Data
        </h3>
        <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
          Kembalikan semua key settings ke data bawaan aplikasi dan hapus key tambahan non-default.
          Pastikan Anda sudah membuat backup terlebih dahulu!
        </p>
        <button onClick={() => setShowResetAllConfirm(true)} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 shadow-lg transition-colors">
          <RefreshCw className="h-4 w-4" /> Reset ke Default
        </button>
      </div>

      {/* Restore Confirmation Modal */}
      {showRestoreConfirm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 animate-fadeIn" onClick={() => { setShowRestoreConfirm(false); setPendingFile(null); }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-5 sm:p-6 animate-scaleIn" onClick={e => e.stopPropagation()}>
            <div className="text-center">
              <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="h-7 w-7 text-blue-600" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">Restore Data?</h3>
              <p className="text-gray-500 text-xs sm:text-sm mb-1">File: <strong>{pendingFile?.name}</strong></p>
              <p className="text-gray-400 text-xs mb-4">({pendingFile ? formatSize(pendingFile.size) : ''})</p>
              <p className="text-amber-600 text-xs mb-4 bg-amber-50 p-2 rounded-lg">
                ⚠️ Data saat ini akan ditimpa. Pastikan Anda sudah membuat backup!
              </p>
              <div className="flex gap-2 sm:gap-3">
                <button onClick={() => { setShowRestoreConfirm(false); setPendingFile(null); }} className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium">Batal</button>
                <button onClick={performRestore} className="flex-1 px-4 py-2.5 bg-blue-500 text-white rounded-xl text-sm font-semibold">Restore</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reset All Confirmation Modal */}
      {showResetAllConfirm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 animate-fadeIn" onClick={() => setShowResetAllConfirm(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-5 sm:p-6 animate-scaleIn" onClick={e => e.stopPropagation()}>
            <div className="text-center">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="h-7 w-7 text-red-600" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">Reset Semua Data?</h3>
              <p className="text-gray-500 text-xs sm:text-sm mb-4">
                Tindakan ini akan menghapus <strong>SEMUA</strong> data (berita, galeri, profil, dll) dan mengembalikannya ke data bawaan. Tindakan ini <strong>tidak bisa dibatalkan</strong>!
              </p>
              <div className="flex gap-2 sm:gap-3">
                <button onClick={() => setShowResetAllConfirm(false)} className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium">Batal</button>
                <button onClick={handleResetAll} className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl text-sm font-semibold">Reset Semua</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* End of DatabaseSettingsTab */}
    </div>
  );
}
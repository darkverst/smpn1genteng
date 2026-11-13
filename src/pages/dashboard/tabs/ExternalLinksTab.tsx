import { useState, useMemo } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  ExternalLink as ExternalLinkIcon,
  Link2,
  Globe,
  Search,
  X,
  Save,
  Sparkles,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { ExternalLink, EXTERNAL_LINK_CATEGORIES } from '../../../types';

interface ExternalLinksTabProps {
  notifySaved?: (message: string) => void;
  addToast?: (toast: { title: string; message: string; type: 'success' | 'error' | 'warning' | 'info' }) => void;
}

const PRESET_LINKS: Omit<ExternalLink, 'id'>[] = [
  {
    title: 'Dinas Pendidikan Kab. Banyuwangi',
    url: 'https://disdik.banyuwangikab.go.id',
    description: 'Portal resmi Dinas Pendidikan Kabupaten Banyuwangi',
    category: 'Pemerintah & Dinas',
    badge: 'Resmi',
    openInNewTab: true,
    isActive: true,
    order: 1,
  },
  {
    title: 'Kementerian Pendidikan Dasar & Menengah RI',
    url: 'https://kemdikbud.go.id',
    description: 'Portal resmi Kemendikdasmen Republik Indonesia',
    category: 'Pemerintah & Dinas',
    badge: 'Pusat',
    openInNewTab: true,
    isActive: true,
    order: 2,
  },
  {
    title: 'Portal PPDB Online Jawa Timur',
    url: 'https://ppdb.jatimprov.go.id',
    description: 'Penerimaan Peserta Didik Baru Online tingkat provinsi',
    category: 'Layanan Sekolah',
    badge: 'PPDB',
    openInNewTab: true,
    isActive: true,
    order: 3,
  },
  {
    title: 'Platform Merdeka Mengajar (PMM)',
    url: 'https://guru.kemdikbud.go.id',
    description: 'Platform edukasi digital resmi pendidik dan tenaga kependidikan',
    category: 'Aplikasi Belajar',
    badge: 'Edukasi',
    openInNewTab: true,
    isActive: true,
    order: 4,
  },
  {
    title: 'Perpustakaan Digital Nasional (Perpusnas)',
    url: 'https://perpusnas.go.id',
    description: 'Layanan referensi buku elektronik dan literatur ilmiah nasional',
    category: 'Aplikasi Belajar',
    badge: 'E-Book',
    openInNewTab: true,
    isActive: true,
    order: 5,
  },
  {
    title: 'Sub-Web Organisasi Siswa Intra Sekolah (OSIS)',
    url: 'https://osis.sekolah.sch.id',
    description: 'Portal kegiatan ekstrakurikuler dan kepengurusan OSIS',
    category: 'Sub Web Sekolah',
    badge: 'Sub Web',
    openInNewTab: true,
    isActive: true,
    order: 6,
  },
];

export default function ExternalLinksTab({ notifySaved, addToast }: ExternalLinksTabProps) {
  const { externalLinks, addExternalLink, updateExternalLink, deleteExternalLink } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Omit<ExternalLink, 'id'>>({
    title: '',
    url: '',
    description: '',
    category: 'Pemerintah & Dinas',
    badge: '',
    openInNewTab: true,
    isActive: true,
    order: externalLinks.length + 1,
  });

  const [errorMsg, setErrorMsg] = useState('');

  // Category counts
  const categories = useMemo(() => {
    const list = Array.from(new Set(['Semua', ...EXTERNAL_LINK_CATEGORIES, ...externalLinks.map(l => l.category).filter(Boolean)]));
    return list;
  }, [externalLinks]);

  // Filtered links
  const filteredLinks = useMemo(() => {
    return externalLinks.filter((item) => {
      const matchSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchCategory = selectedCategory === 'Semua' || item.category === selectedCategory;
      return matchSearch && matchCategory;
    });
  }, [externalLinks, searchQuery, selectedCategory]);

  const openAddModal = (preset?: Omit<ExternalLink, 'id'>) => {
    setEditingId(null);
    setErrorMsg('');
    if (preset) {
      setFormData({
        ...preset,
        order: externalLinks.length + 1,
      });
    } else {
      setFormData({
        title: '',
        url: '',
        description: '',
        category: 'Pemerintah & Dinas',
        badge: '',
        openInNewTab: true,
        isActive: true,
        order: externalLinks.length + 1,
      });
    }
    setModalOpen(true);
  };

  const openEditModal = (item: ExternalLink) => {
    setEditingId(item.id);
    setErrorMsg('');
    setFormData({
      title: item.title,
      url: item.url,
      description: item.description || '',
      category: item.category || 'Lainnya',
      badge: item.badge || '',
      openInNewTab: item.openInNewTab !== false,
      isActive: item.isActive !== false,
      order: item.order || 1,
    });
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setErrorMsg('Nama / Judul tautan wajib diisi.');
      return;
    }
    if (!formData.url.trim()) {
      setErrorMsg('URL tujuan tautan wajib diisi.');
      return;
    }

    // Auto prepend https:// if missing
    let finalUrl = formData.url.trim();
    if (!/^https?:\/\//i.test(finalUrl)) {
      finalUrl = `https://${finalUrl}`;
    }

    const payload = {
      ...formData,
      title: formData.title.trim(),
      url: finalUrl,
      description: formData.description?.trim() || '',
      badge: formData.badge?.trim() || '',
    };

    if (editingId) {
      updateExternalLink(editingId, payload);
      notifySaved?.('Tautan eksternal berhasil diperbarui.');
      addToast?.({
        title: 'Berhasil',
        message: `Tautan "${payload.title}" berhasil diperbarui.`,
        type: 'success',
      });
    } else {
      addExternalLink(payload);
      notifySaved?.('Tautan eksternal baru berhasil ditambahkan.');
      addToast?.({
        title: 'Berhasil',
        message: `Tautan "${payload.title}" berhasil ditambahkan.`,
        type: 'success',
      });
    }

    setModalOpen(false);
  };

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Yakin ingin menghapus tautan "${title}"?`)) {
      deleteExternalLink(id);
      notifySaved?.('Tautan eksternal berhasil dihapus.');
      addToast?.({
        title: 'Dihapus',
        message: `Tautan "${title}" telah dihapus.`,
        type: 'info',
      });
    }
  };

  const handleToggleActive = (item: ExternalLink) => {
    const nextStatus = !item.isActive;
    updateExternalLink(item.id, { isActive: nextStatus });
    notifySaved?.(`Status tautan diubah menjadi ${nextStatus ? 'Aktif' : 'Nonaktif'}.`);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary-50 text-primary-700 mb-2">
            <Globe className="h-3.5 w-3.5" />
            Kelola Link External & Sub Web
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
            Tautan Eksternal & Jejaring Sekolah
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-gray-500 max-w-2xl">
            Tambahkan tautan menuju website Dinas Pendidikan, Kementerian, portal PPDB, CBT/E-Learning, dan sub-website sekolah. Tautan akan otomatis tampil di menu, direktori, dan footer sekolah.
          </p>
        </div>

        <button
          type="button"
          onClick={() => openAddModal()}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm shadow-md transition-all active:scale-95 cursor-pointer shrink-0"
        >
          <Plus className="h-4 w-4" /> Tambah Tautan
        </button>
      </div>

      {/* Quick Template Presets for Instant Setup */}
      <div className="bg-gradient-to-r from-primary-50/60 via-slate-50 to-primary-50/40 p-4 sm:p-5 rounded-2xl border border-primary-100/70">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-4 w-4 text-amber-500" />
          <h4 className="text-xs sm:text-sm font-bold text-gray-900">
            Pintasan Rekomendasi Tautan (1-Klik Tambah)
          </h4>
        </div>
        <p className="text-[11px] sm:text-xs text-gray-500 mb-3">
          Klik tombol di bawah untuk mengisi formulir secara instan dengan contoh tautan resmi pendidikan:
        </p>
        <div className="flex flex-wrap gap-2">
          {PRESET_LINKS.map((preset) => (
            <button
              key={preset.title}
              type="button"
              onClick={() => openAddModal(preset)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-primary-50 border border-gray-200 hover:border-primary-300 text-gray-700 hover:text-primary-700 text-xs font-semibold shadow-2xs transition-colors"
            >
              <Plus className="h-3 w-3 text-primary-500" />
              <span>{preset.title.split(' (')[0]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari tautan, instansi, atau URL..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-primary-600 text-white shadow-xs'
                  : 'bg-white hover:bg-gray-100 text-gray-600 border border-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Links List Cards */}
      {filteredLinks.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 sm:p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Link2 className="h-6 w-6" />
          </div>
          <h3 className="font-bold text-gray-800 text-sm sm:text-base">Belum Ada Tautan Eksternal</h3>
          <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
            {searchQuery
              ? `Tidak ditemukan tautan dengan kata kunci "${searchQuery}".`
              : 'Tambahkan tautan dinas pendidikan atau sub website sekolah agar mudah diakses pengunjung.'}
          </p>
          <button
            type="button"
            onClick={() => openAddModal()}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-primary-50 text-primary-700 font-bold text-xs rounded-xl hover:bg-primary-100 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" /> Tambah Tautan Pertama
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLinks.map((link) => (
            <div
              key={link.id}
              className={`rounded-2xl border p-4 sm:p-5 bg-white transition-all duration-200 flex flex-col justify-between hover:shadow-md ${
                link.isActive ? 'border-gray-200' : 'border-gray-200 opacity-60 bg-gray-50'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary-50 text-primary-700 border border-primary-100/60">
                      {link.category || 'Umum'}
                    </span>
                    {link.badge && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/60">
                        {link.badge}
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleActive(link)}
                    title={link.isActive ? 'Klik untuk menonaktifkan' : 'Klik untuk mengaktifkan'}
                    className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full transition-colors cursor-pointer ${
                      link.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {link.isActive ? <ToggleRight className="h-3.5 w-3.5" /> : <ToggleLeft className="h-3.5 w-3.5" />}
                    <span>{link.isActive ? 'Aktif' : 'Nonaktif'}</span>
                  </button>
                </div>

                <h3 className="font-bold text-gray-900 text-sm sm:text-base leading-snug line-clamp-2 mt-1">
                  {link.title}
                </h3>

                {link.description && (
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                    {link.description}
                  </p>
                )}

                <div className="mt-3 flex items-center gap-1 text-[11px] text-gray-400 font-mono truncate bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                  <Link2 className="h-3 w-3 shrink-0 text-gray-400" />
                  <span className="truncate">{link.url}</span>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-bold text-primary-600 hover:text-primary-700 transition-colors"
                >
                  Uji Tautan <ExternalLinkIcon className="h-3 w-3" />
                </a>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => openEditModal(link)}
                    className="p-1.5 rounded-lg text-gray-500 hover:text-primary-600 hover:bg-gray-100 transition-colors"
                    title="Edit Tautan"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(link.id, link.title)}
                    className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Hapus Tautan"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Add / Edit */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-gray-100 animate-fadeIn my-8">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-extrabold text-gray-900 text-base sm:text-lg flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary-600" />
                {editingId ? 'Edit Tautan Eksternal' : 'Tambah Tautan Eksternal'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 pt-4">
              {errorMsg && (
                <div className="p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-xl border border-red-200">
                  {errorMsg}
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Nama / Judul Tautan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Dinas Pendidikan Kab. Banyuwangi"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                  required
                />
              </div>

              {/* URL */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  URL Tujuan Website <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="https://disdik.banyuwangikab.go.id"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-400"
                  required
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  Jika tidak menyertakan <code>https://</code>, sistem akan otomatis menambahkannya.
                </p>
              </div>

              {/* Category & Badge */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Kategori</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-400"
                  >
                    {EXTERNAL_LINK_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Label / Lencana</label>
                  <input
                    type="text"
                    placeholder="Contoh: Resmi, Sub Web, PPDB"
                    value={formData.badge || ''}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Deskripsi Singkat (Opsional)</label>
                <textarea
                  rows={2}
                  placeholder="Keterangan singkat tentang layanan atau informasi di website ini..."
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                />
              </div>

              {/* Toggles */}
              <div className="space-y-2 pt-1 border-t border-gray-100">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700">
                  <input
                    type="checkbox"
                    checked={formData.openInNewTab !== false}
                    onChange={(e) => setFormData({ ...formData, openInNewTab: e.target.checked })}
                    className="rounded text-primary-600 focus:ring-primary-400 h-4 w-4"
                  />
                  <span>Buka di tab baru (direkomendasikan untuk link eksternal)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700">
                  <input
                    type="checkbox"
                    checked={formData.isActive !== false}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded text-primary-600 focus:ring-primary-400 h-4 w-4"
                  />
                  <span>Tampilkan di website publik (Status Aktif)</span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs sm:text-sm font-semibold transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs sm:text-sm font-bold shadow-md transition-all active:scale-95"
                >
                  <Save className="h-4 w-4" /> Simpan Tautan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

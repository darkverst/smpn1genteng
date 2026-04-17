import { useMemo, useState } from 'react';
import { Download, ExternalLink, FileText, GraduationCap, Search } from 'lucide-react';
import { useApp } from '../context/AppContext';

function getGoogleDriveDownloadLink(url: string): string {
  const trimmed = url.trim();
  const match = trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/) || trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (!match) return trimmed;
  return `https://drive.google.com/uc?export=download&id=${match[1]}`;
}

export default function Downloads() {
  const { brandSettings, downloadDocuments } = useApp();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Semua');

  const activeDocuments = useMemo(
    () => downloadDocuments.documents.filter((item) => item.isActive),
    [downloadDocuments.documents]
  );

  const categories = useMemo(() => {
    const values = new Set(activeDocuments.map((item) => item.category.trim()).filter(Boolean));
    return ['Semua', ...Array.from(values)];
  }, [activeDocuments]);

  const filteredDocuments = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return activeDocuments.filter((item) => {
      const matchesCategory = category === 'Semua' || item.category === category;
      const matchesKeyword =
        !keyword ||
        item.title.toLowerCase().includes(keyword) ||
        item.description.toLowerCase().includes(keyword) ||
        item.fileType.toLowerCase().includes(keyword);
      return matchesCategory && matchesKeyword;
    });
  }, [activeDocuments, category, search]);

  if (!downloadDocuments.showPage) {
    return (
      <section className="bg-slate-50 py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 text-center">
            <h1 className="text-2xl font-extrabold text-gray-900">Halaman Download Belum Aktif</h1>
            <p className="mt-3 text-sm text-gray-500">
              Silakan aktifkan terlebih dahulu melalui dashboard admin.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <div className="page-enter bg-slate-50">
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 py-14 sm:py-20">
        <div className="absolute inset-0 opacity-10">
          <div className="h-full w-full bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.22),_transparent_35%),radial-gradient(circle_at_bottom_left,_rgba(255,255,255,0.18),_transparent_28%)]" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold text-primary-100 backdrop-blur-sm">
              <Download className="h-3.5 w-3.5" />
              Pusat Dokumen Sekolah
            </div>
            <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15 backdrop-blur-sm">
                {brandSettings.showLogo && brandSettings.schoolLogo ? (
                  <img src={brandSettings.schoolLogo} alt="Logo Sekolah" className="h-14 w-14 object-contain" />
                ) : (
                  <GraduationCap className="h-10 w-10 text-white" />
                )}
              </div>
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                  {downloadDocuments.pageTitle}
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-primary-100 sm:text-base">
                  {downloadDocuments.pageDescription}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 sm:py-12 lg:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_220px] sm:items-end">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Cari Dokumen
                </label>
                <div className="flex items-center gap-2 rounded-2xl border border-gray-200 px-3 py-3 focus-within:ring-2 focus-within:ring-primary-300">
                  <Search className="h-4 w-4 text-gray-400" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cari nama dokumen, deskripsi, atau jenis file"
                    className="w-full bg-transparent text-sm text-gray-700 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Kategori
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-2xl border border-gray-200 px-3 py-3 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-primary-300"
                >
                  {categories.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-gray-100">
              <div className="hidden grid-cols-12 gap-3 bg-slate-50 px-4 py-3 text-xs font-semibold text-gray-600 md:grid">
                <div className="col-span-1">No</div>
                <div className="col-span-3">Nama Dokumen</div>
                <div className="col-span-2">Kategori</div>
                <div className="col-span-3">Keterangan</div>
                <div className="col-span-1">Tipe</div>
                <div className="col-span-1">Update</div>
                <div className="col-span-1 text-right">Aksi</div>
              </div>

              {filteredDocuments.length === 0 ? (
                <div className="px-4 py-10 text-center">
                  <FileText className="mx-auto h-10 w-10 text-gray-300" />
                  <p className="mt-3 text-sm font-semibold text-gray-700">Belum ada dokumen yang cocok.</p>
                  <p className="mt-1 text-xs text-gray-400">
                    Ubah kata kunci pencarian atau tambahkan dokumen baru dari dashboard admin.
                  </p>
                </div>
              ) : (
                filteredDocuments.map((item, index) => (
                  <div
                    key={item.id}
                    className="border-t border-gray-100 px-4 py-4 first:border-t-0 md:grid md:grid-cols-12 md:items-center md:gap-3 md:py-3"
                  >
                    <div className="hidden text-sm text-gray-500 md:block">{index + 1}</div>
                    <div className="md:col-span-3">
                      <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                      <p className="mt-1 text-[11px] text-gray-400 md:hidden">
                        {item.category} · {item.fileType || 'Dokumen'}
                      </p>
                    </div>
                    <div className="hidden md:block md:col-span-2">
                      <span className="inline-flex rounded-full bg-primary-50 px-2.5 py-1 text-xs font-semibold text-primary-700">
                        {item.category || 'Umum'}
                      </span>
                    </div>
                    <div className="mt-2 text-sm leading-relaxed text-gray-500 md:col-span-3 md:mt-0">
                      {item.description || '-'}
                    </div>
                    <div className="mt-2 text-xs font-medium text-gray-500 md:col-span-1 md:mt-0">
                      {item.fileType || 'Dokumen'}
                    </div>
                    <div className="mt-2 text-xs text-gray-500 md:col-span-1 md:mt-0">
                      {item.publishedAt || '-'}
                    </div>
                    <div className="mt-3 flex gap-2 md:col-span-1 md:mt-0 md:justify-end">
                      <a
                        href={item.googleDriveLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        Buka
                      </a>
                      <a
                        href={getGoogleDriveDownloadLink(item.googleDriveLink)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-xl bg-primary-500 px-3 py-2 text-xs font-semibold text-white hover:bg-primary-600"
                      >
                        <Download className="h-3.5 w-3.5" />
                        Download
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

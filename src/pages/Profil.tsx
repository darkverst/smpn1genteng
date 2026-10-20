import { Target, Eye, BookOpen, Award, Users, CheckCircle, Star, Heart, Compass, GraduationCap, Phone, BookText, GraduationCap as EduIcon, Globe, Facebook, Instagram, Youtube, X, Trophy, ChevronRight, Sparkles, Calendar, MapPin } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function Profil() {
  const { profileData, teachers, statsData, extracurricular, schoolIdentity } = useApp();
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);

  return (
    <>
    <div className="page-enter">
      <section className="bg-gradient-to-r from-primary-700 via-primary-600 to-primary-500 py-10 sm:py-16 lg:py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-3 py-1 text-primary-100 text-xs sm:text-sm mb-3 border border-white/10">
            <GraduationCap className="h-3.5 w-3.5" /> Profil Sekolah
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-5xl font-extrabold text-white mb-3">Profil {schoolIdentity.schoolName || 'Sekolah'}</h1>
          <p className="text-primary-100 text-sm sm:text-lg max-w-2xl mx-auto">
            Mengenal lebih dekat sekolah kami, visi misi, dan komitmen kami.
          </p>
        </div>
      </section>

      <section className="py-10 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-4 sm:mb-6">
                Tentang <span className="text-primary-500">Madrasah Kami</span>
              </h2>
              <div className="profile-content text-sm sm:text-base" dangerouslySetInnerHTML={{ __html: profileData.about }} />
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {[
                { icon: Users, value: statsData.siswaAktif || '0', label: 'Siswa Aktif', color: 'from-primary-400 to-primary-600' },
                { icon: BookOpen, value: statsData.tenagaPendidik || '0', label: 'Guru & Staff', color: 'from-green-400 to-green-600' },
                { icon: Award, value: statsData.prestasi || '0', label: 'Prestasi', color: 'from-accent-400 to-accent-600' },
                { icon: Star, value: statsData.akreditasi || '-', label: 'Akreditasi', color: 'from-purple-400 to-purple-600' },
              ].map((stat) => (
                <div key={stat.label} className="bg-gray-50 rounded-xl sm:rounded-2xl p-4 sm:p-5 text-center border border-gray-100">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3 shadow-md`}>
                    <stat.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <div className="text-xl sm:text-2xl font-extrabold text-gray-900">{stat.value}</div>
                  <div className="text-[11px] sm:text-xs text-gray-500 mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-10 sm:py-16 lg:py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 mb-3">Sambutan Kepala Sekolah</h2>
            <p className="text-gray-500 text-sm sm:text-base max-w-2xl mx-auto">
              Kata pengantar dari pimpinan {schoolIdentity.schoolName || 'sekolah'}
            </p>
          </div>
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="grid md:grid-cols-5 lg:grid-cols-3">
                {/* Kolom Foto Kepsek */}
                <div className="md:col-span-2 lg:col-span-1 relative">
                  {profileData.fotoKepsek ? (
                    <div className="relative h-full">
                      <img
                        src={profileData.fotoKepsek}
                        alt={profileData.namaKepsek}
                        className="w-full h-56 sm:h-72 md:h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-primary-900/80 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:via-transparent md:to-transparent" />
                      {/* Info Overlay — tampil di mobile bawah foto */}
                      <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 md:hidden">
                        <h3 className="font-bold text-white text-base sm:text-lg">{profileData.namaKepsek}</h3>
                        <p className="text-primary-200 text-xs sm:text-sm mt-0.5">{profileData.jabatanKepsek}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="h-56 sm:h-72 md:h-full bg-gradient-to-br from-primary-400 to-primary-600 flex flex-col items-center justify-center text-white p-6">
                      <div className="w-24 h-24 sm:w-28 sm:h-28 bg-white/20 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
                        <GraduationCap className="h-12 w-12 sm:h-14 sm:w-14 text-white/90" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg text-center">{profileData.namaKepsek}</h3>
                      <p className="text-primary-200 text-xs sm:text-sm mt-1">{profileData.jabatanKepsek}</p>
                    </div>
                  )}
                </div>

                {/* Kolom Sambutan */}
                <div className="md:col-span-3 lg:col-span-2 p-5 sm:p-7 lg:p-10">
                  {/* Info — tampil di tablet/desktop */}
                  <div className="hidden md:flex items-center gap-3 sm:gap-4 mb-5 sm:mb-6 pb-5 sm:pb-6 border-b border-gray-100">
                    {profileData.fotoKepsek ? (
                      <img src={profileData.fotoKepsek} alt={profileData.namaKepsek} className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover shadow-lg ring-2 ring-primary-100" />
                    ) : (
                      <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-lg">
                        {profileData.namaKepsek.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-gray-900 text-sm sm:text-lg">{profileData.namaKepsek}</p>
                      <p className="text-primary-500 text-xs sm:text-base">{profileData.jabatanKepsek}</p>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute -top-3 -left-1 text-primary-200 text-5xl sm:text-7xl font-serif leading-none select-none">"</div>
                    <div className="relative pt-5 sm:pt-7">
                      <div className="profile-content text-sm sm:text-base text-gray-600 leading-relaxed" dangerouslySetInnerHTML={{ __html: profileData.sambutanKepsek }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-10 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 mb-3">Visi & Misi</h2>
            <p className="text-gray-500 text-sm sm:text-base max-w-2xl mx-auto">Panduan dan arah kebijakan pendidikan di {schoolIdentity.schoolName || 'sekolah kami'}</p>
          </div>
          <div className="grid lg:grid-cols-2 gap-5 sm:gap-8">
            <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/10 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6">
                  <Eye className="h-6 w-6 sm:h-7 sm:w-7" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Visi</h3>
                <p className="text-sm sm:text-lg leading-relaxed text-primary-100">"{profileData.visi}"</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 shadow-xl border border-gray-100">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-primary-50 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6">
                <Target className="h-6 w-6 sm:h-7 sm:w-7 text-primary-600" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Misi</h3>
              <ul className="space-y-2 sm:space-y-3">
                {profileData.misi.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 sm:gap-3">
                    <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-primary-500 mt-0.5 shrink-0" />
                    <span className="text-gray-600 text-xs sm:text-sm leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="py-10 sm:py-16 lg:py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 mb-3">Nilai-Nilai Kami</h2>
            <p className="text-gray-500 text-sm sm:text-base max-w-2xl mx-auto">Prinsip dasar pendidikan di sekolah kami</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {[
              { icon: Heart, title: 'Integritas', desc: 'Menjunjung tinggi kejujuran dan etika.', color: 'from-red-400 to-red-600' },
              { icon: Star, title: 'Keunggulan', desc: 'Standar tertinggi dalam akademik dan karakter.', color: 'from-accent-400 to-accent-600' },
              { icon: Users, title: 'Kebersamaan', desc: 'Lingkungan inklusif dan saling menghargai.', color: 'from-primary-400 to-primary-600' },
              { icon: Compass, title: 'Inovasi', desc: 'Inovasi dalam metode pembelajaran.', color: 'from-green-400 to-green-600' },
            ].map((value) => (
              <div key={value.title} className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center border border-gray-100 hover:shadow-lg transition-all duration-300 group">
                <div className={`w-11 h-11 sm:w-14 sm:h-14 bg-gradient-to-br ${value.color} rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform shadow-md`}>
                  <value.icon className="h-5 w-5 sm:h-7 sm:w-7 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 text-xs sm:text-base mb-1 sm:mb-2">{value.title}</h3>
                <p className="text-[11px] sm:text-sm text-gray-500 leading-relaxed">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-10 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 mb-3">Fasilitas Sekolah</h2>
            <p className="text-gray-500 text-sm sm:text-base max-w-2xl mx-auto">Fasilitas lengkap untuk mendukung kegiatan belajar mengajar</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
            {profileData.facilities.map((facility, i) => (
              <div key={i} className="flex items-center gap-2.5 sm:gap-3 bg-gray-50 rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100">
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-primary-500 shrink-0" />
                <span className="text-gray-700 font-medium text-xs sm:text-sm">{facility}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-10 sm:py-16 lg:py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 mb-3">Guru & Tenaga Pendidik</h2>
            <p className="text-gray-500 text-sm sm:text-base max-w-2xl mx-auto">Tenaga pengajar profesional dan berdedikasi tinggi</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {teachers.map(t => (
              <div key={t.id} className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 hover:shadow-lg transition-all">
                <div className="flex flex-col items-center text-center mb-3">
                  {t.photo ? (
                    <img src={t.photo} alt={t.name} className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-primary-100 shadow-md mb-3 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setPreviewPhoto(t.photo)} />
                  ) : (
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-md mb-3">
                      {t.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                    </div>
                  )}
                  <h3 className="font-bold text-gray-900 text-sm sm:text-base">{t.name}</h3>
                  <p className="text-primary-600 text-xs sm:text-sm font-medium">{t.position}</p>
                </div>
                <div className="space-y-1.5 text-xs sm:text-sm text-gray-500 mb-3">
                  {t.subject !== '-' && (
                    <div className="flex items-center justify-center gap-2">
                      <BookText className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                      <span>{t.subject}</span>
                    </div>
                  )}
                </div>
                {(t.socialMedia?.facebook || t.socialMedia?.instagram || t.socialMedia?.youtube || t.socialMedia?.whatsapp) && (
                  <div className="flex items-center justify-center gap-2 pt-3 border-t border-gray-100">
                    {t.socialMedia?.facebook && (
                      <a href={t.socialMedia.facebook} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
                        <Facebook className="h-4 w-4" />
                      </a>
                    )}
                    {t.socialMedia?.instagram && (
                      <a href={t.socialMedia.instagram} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-pink-50 text-pink-600 hover:bg-pink-100 transition-colors">
                        <Instagram className="h-4 w-4" />
                      </a>
                    )}
                    {t.socialMedia?.youtube && (
                      <a href={t.socialMedia.youtube} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition-colors">
                        <Youtube className="h-4 w-4" />
                      </a>
                    )}
                    {t.socialMedia?.whatsapp && (
                      <a href={`https://wa.me/${t.socialMedia.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-green-50 text-green-600 hover:bg-green-100 transition-colors">
                        <Phone className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ekstrakurikuler Section */}
      <section className="py-10 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-12 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-50 text-primary-700 text-xs font-semibold rounded-full mb-2">
                <Trophy className="h-3.5 w-3.5 text-accent-500" />
                <span>Pengembangan Karakter & Minat</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900">
                Ekstrakurikuler Madrasah
              </h2>
              <p className="text-gray-500 text-sm sm:text-base mt-1">
                Wadah pembinaan bakat, keagamaan, olahraga, dan kepemimpinan siswa.
              </p>
            </div>
            <Link
              to="/ekstrakurikuler"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-xs sm:text-sm font-semibold rounded-xl transition-colors shadow-sm self-start sm:self-auto"
            >
              <span>Lihat Semua Eskul</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {extracurricular.filter(e => e.isActive).slice(0, 6).map(item => (
              <div
                key={item.id}
                className="bg-gray-50 hover:bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-lg transition-all duration-300 flex flex-col group"
              >
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2.5 py-0.5 bg-primary-100 text-primary-700 text-[11px] font-semibold rounded-full">
                    {item.category}
                  </span>
                  {item.schedule && (
                    <span className="text-[11px] text-gray-500 flex items-center gap-1 truncate max-w-[150px]">
                      <Calendar className="h-3 w-3 text-gray-400 shrink-0" />
                      {item.schedule}
                    </span>
                  )}
                </div>

                <h3 className="text-base sm:text-lg font-bold text-gray-900 group-hover:text-primary-600 transition-colors mb-2">
                  {item.name}
                </h3>

                <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 mb-3 flex-1">
                  {item.description}
                </p>

                {item.coach && (
                  <p className="text-xs text-gray-500 pt-3 border-t border-gray-200/60">
                    Pembina: <strong className="text-gray-700">{item.coach}</strong>
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>

      {previewPhoto && (
        <div className="fixed inset-0 z-[80] bg-black/70 flex items-center justify-center p-4 animate-fadeIn" onClick={() => setPreviewPhoto(null)}>
          <div className="relative max-w-lg w-full animate-scaleIn" onClick={e => e.stopPropagation()}>
            <button onClick={() => setPreviewPhoto(null)} className="absolute -top-3 -right-3 z-10 bg-white rounded-full p-1.5 shadow-lg hover:bg-gray-100">
              <X className="h-5 w-5 text-gray-700" />
            </button>
            <img src={previewPhoto} alt="Foto Guru" className="w-full rounded-2xl shadow-2xl" />
          </div>
        </div>
      )}
    </>
  );
}
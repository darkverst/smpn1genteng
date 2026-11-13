import { useState } from 'react';
import {
  GraduationCap,
  Target,
  BookOpen,
  Award,
  Users,
  Heart,
  CheckCircle,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Save,
  Check,
  ShieldCheck,
  Quote
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SambutanStyle, ProfileData, SchoolIdentitySettings, StatsData } from '../types';
import { SAMBUTAN_STYLES } from '../utils/schoolIdentity';
import { sanitizeHtml } from '../utils/sanitizeHtml';
import { cn } from '../utils/cn';
import {
  getCardStyle,
  getIconBadgeStyle,
  getIconSvgEffect,
  getSectionBadgeStyle
} from '../utils/themeStyles';

interface SambutanSectionProps {
  styleOverride?: SambutanStyle;
  profileData?: ProfileData;
  statsData?: StatsData;
  schoolIdentity?: SchoolIdentitySettings;
  isAdmin?: boolean;
}

export default function SambutanSection({
  styleOverride,
  profileData: propProfile,
  statsData: propStats,
  schoolIdentity: propIdentity,
  isAdmin: propIsAdmin,
}: SambutanSectionProps) {
  const context = useApp();
  const profile = propProfile || context.profileData;
  const stats = propStats || context.statsData;
  const identity = propIdentity || context.schoolIdentity;
  const isLoggedIn = propIsAdmin !== undefined ? propIsAdmin : context.isLoggedIn;
  const updateSchoolIdentity = context.updateSchoolIdentity;

  const [previewStyle, setPreviewStyle] = useState<SambutanStyle | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const activeStyle: SambutanStyle =
    styleOverride || previewStyle || identity.sambutanStyle || 'modern-card';

  const handleSaveAsDefault = () => {
    if (!updateSchoolIdentity) return;
    const res = updateSchoolIdentity({
      ...identity,
      sambutanStyle: activeStyle,
    });
    if (res.success) {
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2500);
    }
  };

  const highlightItems = [
    { icon: Target, title: 'Visi', desc: profile.visi ? profile.visi.substring(0, 60) + '...' : 'Pendidikan berkarakter unggul' },
    { icon: BookOpen, title: 'Kurikulum', desc: 'Kurikulum Merdeka berbasis kompetensi masa depan.' },
    { icon: Award, title: 'Prestasi', desc: `${stats.prestasi} penghargaan di berbagai tingkatan.` },
    { icon: Users, title: 'Alumni', desc: 'Ribuan alumni berdaya saing di seluruh Indonesia.' },
  ];

  return (
    <section className="relative overflow-hidden py-12 sm:py-16 lg:py-20 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Bilah Pratinjau Cepat Gaya Sambutan (Hanya Muncul Jika Admin Sedang Login) */}
        {isLoggedIn && (
          <div className="mb-8 p-3 sm:p-4 bg-white/95 backdrop-blur-md rounded-2xl border border-primary-200/80 shadow-md animate-fadeIn">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-primary-100 text-primary-700">
                  <Sparkles className="h-4 w-4" />
                </span>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-gray-900 flex items-center gap-2">
                    <span>Mode Admin: Pratinjau Tampilan Sambutan Kepala Sekolah</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary-100 text-primary-800">
                      {SAMBUTAN_STYLES.length} Variasi
                    </span>
                  </h4>
                  <p className="text-[11px] text-gray-500">
                    Klik variasi di bawah untuk melihat live preview seketika. Klik "Simpan Pilihan" untuk menjadikannya tampilan utama website.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end md:self-auto">
                <button
                  type="button"
                  onClick={handleSaveAsDefault}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold shadow-xs transition-all active:scale-95"
                >
                  {isSaved ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-accent-300" />
                      <span>Tersimpan!</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-3.5 w-3.5" />
                      <span>Simpan Pilihan</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-gray-100">
              {SAMBUTAN_STYLES.map(s => {
                const isSelected = activeStyle === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setPreviewStyle(s.id)}
                    className={cn(
                      "px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5",
                      isSelected
                        ? "bg-primary-600 text-white font-bold shadow-xs scale-105 ring-2 ring-primary-400/40"
                        : "bg-slate-100 hover:bg-slate-200 text-gray-700"
                    )}
                  >
                    <span>{s.label.split(' (')[0]}</span>
                    <span className={cn(
                      "text-[9px] px-1.5 py-0.2 rounded-full",
                      isSelected ? "bg-white/20 text-white" : "bg-white text-gray-500"
                    )}>
                      {s.badge}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================
            VARIASI 1: MODERN CARD (Default - Modern Side-by-Side)
           ======================================================== */}
        {activeStyle === 'modern-card' && (
          <div className="animate-fadeIn">
            {/* Header Badge */}
            <div className="text-center mb-8 sm:mb-12">
              <div className={getSectionBadgeStyle(identity.buttonStyle, "inline-flex items-center gap-2 bg-primary-50 px-3.5 py-1.5 text-primary-600 text-xs sm:text-sm font-medium mb-3")}>
                <Heart className={cn("h-4 w-4", getIconSvgEffect(identity.iconStyle))} />
                <span>Sambutan Kepala Sekolah</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 leading-tight">
                Selamat Datang di <span className="text-primary-500">{identity.schoolName || 'Sekolah Kami'}</span>
              </h2>
            </div>

            <div className="grid lg:grid-cols-5 gap-6 sm:gap-8 lg:gap-12 items-start">
              {/* Foto Kepala Sekolah - Kolom Kiri */}
              <div className="lg:col-span-2">
                <div className="relative max-w-xs sm:max-w-sm mx-auto lg:max-w-none">
                  {profile.fotoKepsek ? (
                    <div className="relative">
                      <div className="absolute -inset-2 sm:-inset-3 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl sm:rounded-3xl opacity-20 blur-lg" />
                      <div className="relative bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl sm:rounded-3xl p-2 sm:p-3">
                        <img
                          src={profile.fotoKepsek}
                          alt={profile.namaKepsek}
                          className="w-full aspect-[3/4] object-cover rounded-xl sm:rounded-2xl shadow-lg"
                        />
                      </div>
                      <div className="absolute bottom-4 sm:bottom-5 left-4 sm:left-5 right-4 sm:right-5">
                        <div className="bg-white/95 backdrop-blur-md rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-xl border border-white/50">
                          <p className="font-bold text-gray-900 text-sm sm:text-base leading-tight">{profile.namaKepsek}</p>
                          <p className="text-primary-500 text-xs sm:text-sm mt-0.5">{profile.jabatanKepsek}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="relative bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl sm:rounded-3xl p-2 sm:p-3">
                      <div className="w-full aspect-[3/4] bg-gradient-to-br from-primary-300 to-primary-500 rounded-xl sm:rounded-2xl flex flex-col items-center justify-center text-white">
                        <div className="w-20 h-20 sm:w-28 sm:h-28 bg-white/20 rounded-full flex items-center justify-center mb-3 sm:mb-4 backdrop-blur-sm">
                          <GraduationCap className="h-10 w-10 sm:h-14 sm:w-14 text-white/90" />
                        </div>
                        <p className="font-bold text-base sm:text-lg">{profile.namaKepsek}</p>
                        <p className="text-primary-200 text-xs sm:text-sm mt-1">{profile.jabatanKepsek}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Isi Sambutan - Kolom Kanan */}
              <div className="lg:col-span-3">
                <div className="relative">
                  <div className="absolute -top-4 -left-2 text-primary-200 text-6xl sm:text-8xl font-serif leading-none select-none">"</div>
                  <div className="relative pt-6 sm:pt-8">
                    <div
                      className="profile-content text-sm sm:text-base text-gray-600 leading-relaxed mb-6 sm:mb-8"
                      dangerouslySetInnerHTML={{ __html: sanitizeHtml(profile.sambutanKepsek) }}
                    />
                  </div>
                </div>

                {/* Highlight Cards */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-4 sm:mt-6">
                  {highlightItems.map(item => (
                    <div
                      key={item.title}
                      className={cn(
                        "bg-gradient-to-br from-primary-50 to-primary-100/50 p-3 sm:p-4 border border-primary-100 hover:shadow-md transition-all group ui-card",
                        getCardStyle(identity.cardStyle)
                      )}
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-lg bg-primary-100 text-primary-700 flex items-center justify-center mb-1.5 sm:mb-2 group-hover:scale-110 transition-transform ui-icon-badge",
                        getIconBadgeStyle(identity.iconStyle)
                      )}>
                        <item.icon className={cn("h-4 w-4 sm:h-5 sm:w-5", getIconSvgEffect(identity.iconStyle))} />
                      </div>
                      <h4 className="font-bold text-gray-900 text-xs sm:text-sm">{item.title}</h4>
                      <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            VARIASI 2: EXECUTIVE SPLIT (Mewah & Berwibawa)
           ======================================================== */}
        {activeStyle === 'executive-split' && (
          <div className="animate-fadeIn">
            <div className="bg-gradient-to-br from-white via-slate-50/70 to-primary-50/20 rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 lg:p-12 relative overflow-hidden">
              {/* Background ambient accent */}
              <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-primary-500/5 blur-3xl pointer-events-none" />
              <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-accent-500/5 blur-3xl pointer-events-none" />

              <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                {/* Photo Column */}
                <div className="lg:col-span-5 flex flex-col items-center text-center">
                  <div className="relative group w-full max-w-xs sm:max-w-sm">
                    {/* Decorative gold accent frame */}
                    <div className="absolute -inset-2 bg-gradient-to-r from-accent-400 via-primary-500 to-accent-500 rounded-3xl opacity-30 blur-md group-hover:opacity-40 transition-opacity" />
                    <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-white shadow-xl bg-slate-900 aspect-[3/4]">
                      {profile.fotoKepsek ? (
                        <img
                          src={profile.fotoKepsek}
                          alt={profile.namaKepsek}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-primary-800 to-slate-900 text-white p-6">
                          <GraduationCap className="h-16 w-16 text-accent-300 mb-3" />
                          <p className="font-bold text-lg">{profile.namaKepsek}</p>
                        </div>
                      )}
                      {/* Top Ribbon Badge */}
                      <div className="absolute top-3 left-3 bg-primary-900/90 backdrop-blur-md text-accent-300 border border-accent-400/30 text-[10px] font-bold tracking-wider uppercase px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                        <Award className="h-3 w-3 text-accent-400" />
                        <span>Pimpinan Institusi</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 space-y-1">
                    <h3 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                      {profile.namaKepsek}
                    </h3>
                    <p className="text-sm font-semibold text-primary-600">
                      {profile.jabatanKepsek}
                    </p>
                    <p className="text-xs text-gray-400">
                      {identity.schoolName}
                    </p>
                  </div>
                </div>

                {/* Content Column */}
                <div className="lg:col-span-7 space-y-6">
                  <div>
                    <div className="inline-flex items-center gap-1.5 text-xs font-bold text-accent-600 bg-accent-50 border border-accent-200/60 px-3 py-1 rounded-full uppercase tracking-wider mb-2">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      <span>Amanat & Pesan Pimpinan</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight">
                      Membangun Karakter, Meraih Prestasi Tertinggi
                    </h2>
                  </div>

                  {/* Highlight Quote Box */}
                  <div className="border-l-4 border-primary-500 bg-white/80 backdrop-blur-xs shadow-xs rounded-r-2xl p-4 sm:p-5 italic text-gray-700 text-sm sm:text-base leading-relaxed font-serif">
                    "Pendidikan bukan sekadar transfer ilmu, melainkan penyalaan api integritas, budi pekerti, dan daya cipta untuk masa depan bangsa."
                  </div>

                  {/* Main Sambutan Content */}
                  <div
                    className="profile-content text-xs sm:text-sm text-gray-600 leading-relaxed space-y-3"
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(profile.sambutanKepsek) }}
                  />

                  {/* Horizontal Pillar Badges */}
                  <div className="pt-4 border-t border-gray-100 flex flex-wrap gap-2 sm:gap-3">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary-50 text-primary-700 text-xs font-semibold">
                      <Target className="h-3.5 w-3.5" />
                      <span>Visi Unggul</span>
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-semibold">
                      <BookOpen className="h-3.5 w-3.5" />
                      <span>Kurikulum Merdeka</span>
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-700 text-xs font-semibold">
                      <Award className="h-3.5 w-3.5" />
                      <span>{stats.prestasi}+ Prestasi</span>
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 text-xs font-semibold">
                      <Users className="h-3.5 w-3.5" />
                      <span>Jaringan Alumni Luas</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            VARIASI 3: QUOTE FOCUS (Testimonial Centerpiece)
           ======================================================== */}
        {activeStyle === 'quote-focus' && (
          <div className="animate-fadeIn max-w-4xl mx-auto text-center">
            {/* Ambient circular backdrop glow */}
            <div className="relative mb-6 inline-block">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary-400 to-accent-400 rounded-full blur-2xl opacity-25" />
              <div className="relative">
                {profile.fotoKepsek ? (
                  <img
                    src={profile.fotoKepsek}
                    alt={profile.namaKepsek}
                    className="w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 rounded-full object-cover mx-auto border-4 border-white shadow-2xl ring-4 ring-primary-500/20"
                  />
                ) : (
                  <div className="w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 mx-auto flex items-center justify-center text-white border-4 border-white shadow-2xl">
                    <GraduationCap className="h-14 w-14" />
                  </div>
                )}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white px-3 py-1 rounded-full shadow-md border border-gray-100 flex items-center gap-1 text-[11px] font-bold text-primary-700 whitespace-nowrap">
                  <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                  <span>Kepala Sekolah</span>
                </div>
              </div>
            </div>

            <div className="space-y-1 mb-6">
              <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900">{profile.namaKepsek}</h3>
              <p className="text-xs sm:text-sm font-semibold text-primary-600">{profile.jabatanKepsek}</p>
            </div>

            {/* Giant quote mark */}
            <div className="flex justify-center text-primary-300 mb-2">
              <Quote className="h-10 w-10 sm:h-14 sm:w-14 opacity-40 rotate-180" />
            </div>

            {/* Sambutan Text with expand toggle */}
            <div className="relative bg-white/90 backdrop-blur-md rounded-3xl p-6 sm:p-10 shadow-lg border border-gray-100 mb-8 text-left sm:text-center">
              <div
                className={cn(
                  "profile-content text-sm sm:text-base md:text-lg text-gray-700 leading-relaxed font-serif transition-all duration-300",
                  !isExpanded && "line-clamp-4"
                )}
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(profile.sambutanKepsek) }}
              />

              <div className="mt-4 pt-3 border-t border-gray-100 text-center">
                <button
                  type="button"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary-50 hover:bg-primary-100 text-primary-700 text-xs font-semibold transition-colors"
                >
                  {isExpanded ? (
                    <>
                      <span>Ciutkan Sambutan</span>
                      <ChevronUp className="h-3.5 w-3.5" />
                    </>
                  ) : (
                    <>
                      <span>Baca Sambutan Lengkap</span>
                      <ChevronDown className="h-3.5 w-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Pill Highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {highlightItems.map(item => (
                <div key={item.title} className="bg-white rounded-2xl p-3.5 border border-gray-100 shadow-xs flex flex-col items-center text-center">
                  <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center mb-1.5">
                    <item.icon className="h-4 w-4" />
                  </div>
                  <p className="text-xs font-bold text-gray-900">{item.title}</p>
                  <p className="text-[10px] text-gray-500 line-clamp-1 mt-0.5">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================
            VARIASI 4: FRAMED ACADEMIC (Piagam Formal Tradisional)
           ======================================================== */}
        {activeStyle === 'framed-academic' && (
          <div className="animate-fadeIn">
            {/* Double Academic Certificate Border */}
            <div className="border-2 border-primary-900/20 p-2 sm:p-3 rounded-3xl bg-slate-50/50">
              <div className="bg-gradient-to-b from-amber-50/40 via-white to-amber-50/20 rounded-2xl border border-primary-900/15 p-6 sm:p-10 lg:p-12 relative overflow-hidden shadow-md">
                {/* Academic Corner Brackets */}
                <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-primary-800/60 pointer-events-none" />
                <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-primary-800/60 pointer-events-none" />
                <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-primary-800/60 pointer-events-none" />
                <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-primary-800/60 pointer-events-none" />

                {/* Formal Seal Header */}
                <div className="text-center mb-8 pb-6 border-b border-primary-900/10">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto rounded-full bg-primary-800 text-accent-300 flex items-center justify-center mb-2 shadow-sm ring-4 ring-primary-100">
                    <GraduationCap className="h-6 w-6 sm:h-7 sm:w-7" />
                  </div>
                  <h3 className="text-xs uppercase tracking-widest font-black text-primary-900 mb-1">
                    SURAT SAMBUTAN RESMI
                  </h3>
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-gray-900 font-serif">
                    Kepala {identity.schoolName || 'Sekolah'}
                  </h2>
                </div>

                <div className="grid lg:grid-cols-12 gap-8 items-start">
                  {/* Photo with Formal Arch Frame */}
                  <div className="lg:col-span-4 text-center">
                    <div className="relative mx-auto max-w-[240px] sm:max-w-[280px]">
                      <div className="rounded-t-[80px] rounded-b-2xl overflow-hidden border-4 border-primary-900/10 shadow-lg bg-primary-100 aspect-[3/4]">
                        {profile.fotoKepsek ? (
                          <img
                            src={profile.fotoKepsek}
                            alt={profile.namaKepsek}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-primary-800 text-white p-4">
                            <GraduationCap className="h-12 w-12 text-accent-300 mb-2" />
                            <p className="font-bold text-sm">{profile.namaKepsek}</p>
                          </div>
                        )}
                      </div>
                      <div className="mt-3 p-3 bg-white rounded-xl shadow-xs border border-gray-100">
                        <p className="font-serif font-bold text-gray-900 text-sm sm:text-base">{profile.namaKepsek}</p>
                        <p className="text-xs text-primary-700 font-medium">{profile.jabatanKepsek}</p>
                      </div>
                    </div>
                  </div>

                  {/* Letter Content */}
                  <div className="lg:col-span-8 space-y-4">
                    <div
                      className="profile-content text-sm sm:text-base text-gray-700 leading-relaxed font-serif"
                      dangerouslySetInnerHTML={{ __html: sanitizeHtml(profile.sambutanKepsek) }}
                    />

                    {/* Official Sign-off Stamp */}
                    <div className="pt-6 border-t border-primary-900/10 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500 font-serif">Tertanda,</p>
                        <p className="text-sm font-bold text-gray-900 font-serif mt-1">{profile.namaKepsek}</p>
                        <p className="text-[11px] text-gray-400">{profile.jabatanKepsek}</p>
                      </div>
                      <div className="border border-accent-400/40 bg-accent-50/70 rounded-full px-3 py-1 flex items-center gap-1.5 text-[10px] font-bold text-accent-800">
                        <Award className="h-3.5 w-3.5 text-accent-600" />
                        <span>Resmi & Terverifikasi</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            VARIASI 5: GLASS FLOAT (Glassmorphism & Floating Cards)
           ======================================================== */}
        {activeStyle === 'glass-float' && (
          <div className="animate-fadeIn relative">
            {/* Soft Ambient Aurora Mesh Glow */}
            <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-primary-400/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent-400/15 rounded-full blur-3xl pointer-events-none" />

            <div className="relative bg-white/75 backdrop-blur-xl border border-white/80 rounded-3xl p-6 sm:p-10 lg:p-12 shadow-2xl">
              <div className="grid lg:grid-cols-12 gap-8 items-center">
                {/* Left Photo with Floating Micro-Badges */}
                <div className="lg:col-span-5 relative flex justify-center">
                  <div className="relative max-w-xs sm:max-w-sm w-full">
                    <div className="rounded-3xl overflow-hidden aspect-[3/4] shadow-2xl border-4 border-white/80 bg-slate-900">
                      {profile.fotoKepsek ? (
                        <img
                          src={profile.fotoKepsek}
                          alt={profile.namaKepsek}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-tr from-primary-700 to-primary-900 text-white p-6">
                          <GraduationCap className="h-16 w-16 text-white mb-2" />
                          <p className="font-bold text-lg">{profile.namaKepsek}</p>
                        </div>
                      )}
                    </div>

                    {/* Floating Badge 1 - Top Right */}
                    <div className="absolute -top-3 -right-3 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-2xl shadow-lg border border-white/80 flex items-center gap-1.5 text-xs font-bold text-primary-700 animate-bounce delay-150">
                      <Sparkles className="h-3.5 w-3.5 text-accent-400" />
                      <span>Kepala Sekolah</span>
                    </div>

                    {/* Floating Badge 2 - Bottom Left */}
                    <div className="absolute -bottom-4 -left-3 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-xl border border-white/80">
                      <p className="text-xs sm:text-sm font-extrabold text-gray-900 leading-tight">{profile.namaKepsek}</p>
                      <p className="text-[11px] text-primary-600 font-semibold mt-0.5">{profile.jabatanKepsek}</p>
                    </div>
                  </div>
                </div>

                {/* Right Text Content */}
                <div className="lg:col-span-7 space-y-6">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-100/80 text-primary-800 text-xs font-bold backdrop-blur-xs mb-3">
                      <Heart className="h-3.5 w-3.5 text-primary-600" />
                      <span>Kata Pengantar</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 tracking-tight">
                      Selamat Datang di <span className="text-primary-600">{identity.schoolName || 'Website Sekolah'}</span>
                    </h2>
                  </div>

                  <div
                    className="profile-content text-sm sm:text-base text-gray-700 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(profile.sambutanKepsek) }}
                  />

                  {/* 4 Floating Glass Cards */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    {highlightItems.map(item => (
                      <div
                        key={item.title}
                        className="bg-white/60 backdrop-blur-md border border-white/80 rounded-2xl p-3.5 hover:bg-white/90 transition-all hover:scale-[1.02] shadow-xs"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <item.icon className="h-4 w-4 text-primary-600" />
                          <h4 className="text-xs font-bold text-gray-900">{item.title}</h4>
                        </div>
                        <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            VARIASI 6: OVERLAP BANNER (3D Magazine Showcase)
           ======================================================== */}
        {activeStyle === 'overlap-banner' && (
          <div className="animate-fadeIn pt-8 sm:pt-12">
            {/* Primary Colored Background Ribbon */}
            <div className="bg-gradient-to-r from-primary-900 via-primary-800 to-primary-700 rounded-3xl p-6 sm:p-10 lg:p-12 text-white relative shadow-xl overflow-visible">
              <div className="grid lg:grid-cols-12 gap-8 items-center">
                {/* Principal Photo Pop-out (Overlap effect) */}
                <div className="lg:col-span-4 flex justify-center">
                  <div className="relative -mt-14 sm:-mt-20 lg:-mt-24 lg:-mb-12 max-w-[260px] sm:max-w-[300px] w-full">
                    <div className="rounded-2xl sm:rounded-3xl overflow-hidden aspect-[3/4] shadow-2xl border-4 border-white bg-slate-900 relative">
                      {profile.fotoKepsek ? (
                        <img
                          src={profile.fotoKepsek}
                          alt={profile.namaKepsek}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-primary-800 text-white p-4">
                          <GraduationCap className="h-16 w-16 text-accent-300 mb-2" />
                          <p className="font-bold text-base">{profile.namaKepsek}</p>
                        </div>
                      )}
                    </div>
                    <div className="mt-3 bg-white text-gray-900 rounded-xl p-3 shadow-lg text-center">
                      <p className="font-extrabold text-sm sm:text-base leading-tight">{profile.namaKepsek}</p>
                      <p className="text-xs font-semibold text-primary-600 mt-0.5">{profile.jabatanKepsek}</p>
                    </div>
                  </div>
                </div>

                {/* Overlap Text Box */}
                <div className="lg:col-span-8 space-y-4">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-accent-300 text-xs font-bold border border-white/15">
                    <Quote className="h-3.5 w-3.5" />
                    <span>Sambutan Resmi Pimpinan</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-tight">
                    Unggul dalam Prestasi, Mulia dalam Budi Pekerti
                  </h2>

                  <div className="bg-white rounded-2xl p-5 sm:p-7 text-gray-800 shadow-lg space-y-4 border border-white/50">
                    <div
                      className="profile-content text-xs sm:text-sm md:text-base text-gray-700 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: sanitizeHtml(profile.sambutanKepsek) }}
                    />

                    {/* Quick highlight bar */}
                    <div className="pt-3 border-t border-gray-100 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                      <div className="p-2 rounded-xl bg-gray-50">
                        <span className="text-[10px] text-gray-400 uppercase font-bold">Visi</span>
                        <p className="text-xs font-bold text-gray-900 truncate">{profile.visi || 'Unggul'}</p>
                      </div>
                      <div className="p-2 rounded-xl bg-gray-50">
                        <span className="text-[10px] text-gray-400 uppercase font-bold">Kurikulum</span>
                        <p className="text-xs font-bold text-gray-900 truncate">Merdeka</p>
                      </div>
                      <div className="p-2 rounded-xl bg-gray-50">
                        <span className="text-[10px] text-gray-400 uppercase font-bold">Prestasi</span>
                        <p className="text-xs font-bold text-gray-900 truncate">{stats.prestasi}+ Lomba</p>
                      </div>
                      <div className="p-2 rounded-xl bg-gray-50">
                        <span className="text-[10px] text-gray-400 uppercase font-bold">Alumni</span>
                        <p className="text-xs font-bold text-gray-900 truncate">Tersebar Luas</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

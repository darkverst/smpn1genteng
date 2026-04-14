import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Users, Award, BookOpen, GraduationCap, Calendar, Newspaper, ChevronRight, Star, Target, Heart, ChevronLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { NewsCard, AgendaCard } from '../components/Cards';
import AgendaDetailModal from '../components/AgendaDetailModal';
import InstagramFeed from '../components/InstagramFeed';
import SponsorMarquee from '../components/SponsorMarquee';
import { AgendaItem, GRADIENTS } from '../types';

export default function Home() {
  const { news, agenda, sliderItems, profileData, statsData, instagramSettings } = useApp();
  const latestNews = news.slice(0, 3);
  const upcomingAgenda = agenda.slice(0, 3);
  const shouldShowInstagramSection =
    instagramSettings.showSection &&
    (
      (instagramSettings.embedType === 'widget' && !!instagramSettings.widgetCode.trim()) ||
      instagramSettings.posts.length > 0
    );
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedAgenda, setSelectedAgenda] = useState<AgendaItem | null>(null);

  useEffect(() => {
    if (sliderItems.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % sliderItems.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [sliderItems.length]);

  const goToSlide = (idx: number) => setCurrentSlide(idx);
  const prevSlide = () => setCurrentSlide(prev => (prev - 1 + sliderItems.length) % sliderItems.length);
  const nextSlide = () => setCurrentSlide(prev => (prev + 1) % sliderItems.length);

  const activeSlider = sliderItems.length > 0 ? sliderItems[currentSlide] : null;

  return (
    <div className="page-enter">
      {/* Hero Slider Section */}
      <section className="relative min-h-[480px] sm:min-h-[520px] lg:min-h-[650px] flex items-center overflow-hidden">
        {sliderItems.map((slide, idx) => (
          <div
            key={slide.id}
            className="absolute inset-0 transition-opacity duration-1000"
            style={{ opacity: idx === currentSlide ? 1 : 0 }}
          >
            {slide.image ? (
              <>
                <img src={slide.image} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-primary-950/90 via-primary-900/75 to-primary-800/60" />
              </>
            ) : (
              <div className="absolute inset-0" style={{ background: GRADIENTS[idx % GRADIENTS.length].replace('135deg', '120deg') }} />
            )}
          </div>
        ))}

        {sliderItems.length === 0 && (
          <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-950" />
        )}

        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-28 w-full">
          <div className="max-w-3xl">
            <div className="animate-fadeInUp">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1 sm:px-4 sm:py-1.5 text-primary-200 text-xs sm:text-sm mb-4 sm:mb-6 border border-white/10">
                <GraduationCap className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                SMP Negeri 1 Genteng, Banyuwangi
              </div>
            </div>
            {activeSlider ? (
              <div key={currentSlide}>
                <h1 className="text-2xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold text-white leading-tight mb-4 sm:mb-6 animate-fadeInUp delay-100">
                  {activeSlider.title}
                </h1>
                <p className="text-primary-200 text-sm sm:text-lg lg:text-xl leading-relaxed mb-6 sm:mb-8 max-w-2xl animate-fadeInUp delay-200">
                  {activeSlider.subtitle}
                </p>
                <div className="flex flex-wrap gap-3 animate-fadeInUp delay-300">
                  {activeSlider.buttonText && activeSlider.buttonLink && (
                    <Link
                      to={activeSlider.buttonLink}
                      className="inline-flex items-center gap-2 bg-accent-400 hover:bg-accent-500 text-primary-950 px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl font-semibold text-xs sm:text-sm transition-all shadow-lg"
                    >
                      {activeSlider.buttonText}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  )}
                  <Link
                    to="/kontak"
                    className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl font-semibold text-xs sm:text-sm transition-all border border-white/20 backdrop-blur-sm"
                  >
                    Hubungi Kami
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <h1 className="text-2xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold text-white leading-tight mb-4 sm:mb-6 animate-fadeInUp delay-100">
                  Unggul dalam <span className="text-accent-400">Prestasi</span>,{' '}
                  <br className="hidden sm:block" />
                  Santun dalam <span className="text-primary-300">Budi Pekerti</span>
                </h1>
                <p className="text-primary-200 text-sm sm:text-lg lg:text-xl leading-relaxed mb-6 sm:mb-8 max-w-2xl animate-fadeInUp delay-200">
                  Membentuk generasi penerus bangsa yang cerdas, berkarakter, berakhlak mulia.
                </p>
              </>
            )}
          </div>

          {sliderItems.length > 1 && (
            <div className="flex items-center gap-3 mt-8 sm:mt-10 animate-fadeInUp delay-400">
              <button onClick={prevSlide} className="p-1.5 sm:p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors backdrop-blur-sm border border-white/10">
                <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
              <div className="flex gap-1.5 sm:gap-2">
                {sliderItems.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => goToSlide(idx)}
                    className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
                      idx === currentSlide ? 'w-6 sm:w-8 bg-accent-400' : 'w-1.5 sm:w-2 bg-white/30 hover:bg-white/50'
                    }`}
                  />
                ))}
              </div>
              <button onClick={nextSlide} className="p-1.5 sm:p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors backdrop-blur-sm border border-white/10">
                <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>
          )}
        </div>

        <div className="absolute bottom-[-1px] left-0 right-0 leading-none">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="block w-full">
            <path d="M0 80V40C240 0 480 0 720 20C960 40 1200 60 1440 40V80H0Z" fill="#f8fafc"/>
          </svg>
        </div>
      </section>

      {/* Stats */}
      <section className="py-8 sm:py-12 lg:py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {[
              { icon: Users, label: 'Siswa Aktif', value: statsData.siswaAktif, color: 'from-primary-400 to-primary-600' },
              { icon: BookOpen, label: 'Tenaga Pendidik', value: statsData.tenagaPendidik, color: 'from-green-400 to-green-600' },
              { icon: Award, label: 'Prestasi', value: statsData.prestasi, color: 'from-accent-400 to-accent-600' },
              { icon: Star, label: 'Akreditasi', value: statsData.akreditasi, color: 'from-purple-400 to-purple-600' },
            ].map((stat, i) => (
              <div
                key={stat.label}
                className="bg-white rounded-2xl p-4 sm:p-5 lg:p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 group animate-fadeInUp"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center mb-2 sm:mb-3 group-hover:scale-110 transition-transform shadow-md`}>
                  <stat.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-gray-900">{stat.value}</div>
                <div className="text-xs sm:text-sm text-gray-500 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sambutan Kepala Sekolah */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 animate-fadeInUp">
            <div className="inline-flex items-center gap-2 bg-primary-50 rounded-full px-3 py-1 sm:px-4 sm:py-1.5 text-primary-600 text-xs sm:text-sm font-medium mb-2 sm:mb-3">
              <Heart className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Sambutan Kepala Sekolah
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 leading-tight">
              Selamat Datang di <span className="text-primary-500">SMPN 1 Genteng</span>
            </h2>
          </div>

          <div className="grid lg:grid-cols-5 gap-6 sm:gap-8 lg:gap-12 items-start">
            {/* Foto Kepala Sekolah - Kolom Kiri */}
            <div className="lg:col-span-2 animate-fadeInUp delay-100">
              <div className="relative max-w-xs sm:max-w-sm mx-auto lg:max-w-none">
                {profileData.fotoKepsek ? (
                  <div className="relative">
                    <div className="absolute -inset-2 sm:-inset-3 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl sm:rounded-3xl opacity-20 blur-lg" />
                    <div className="relative bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl sm:rounded-3xl p-2 sm:p-3">
                      <img
                        src={profileData.fotoKepsek}
                        alt={profileData.namaKepsek}
                        className="w-full aspect-[3/4] object-cover rounded-xl sm:rounded-2xl shadow-lg"
                      />
                    </div>
                    {/* Nama & Jabatan Overlay */}
                    <div className="absolute bottom-4 sm:bottom-5 left-4 sm:left-5 right-4 sm:right-5">
                      <div className="bg-white/95 backdrop-blur-md rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-xl border border-white/50">
                        <p className="font-bold text-gray-900 text-sm sm:text-base leading-tight">{profileData.namaKepsek}</p>
                        <p className="text-primary-500 text-xs sm:text-sm mt-0.5">{profileData.jabatanKepsek}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="relative bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl sm:rounded-3xl p-2 sm:p-3">
                    <div className="w-full aspect-[3/4] bg-gradient-to-br from-primary-300 to-primary-500 rounded-xl sm:rounded-2xl flex flex-col items-center justify-center text-white">
                      <div className="w-20 h-20 sm:w-28 sm:h-28 bg-white/20 rounded-full flex items-center justify-center mb-3 sm:mb-4 backdrop-blur-sm">
                        <GraduationCap className="h-10 w-10 sm:h-14 sm:w-14 text-white/90" />
                      </div>
                      <p className="font-bold text-base sm:text-lg">{profileData.namaKepsek}</p>
                      <p className="text-primary-200 text-xs sm:text-sm mt-1">{profileData.jabatanKepsek}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Isi Sambutan - Kolom Kanan */}
            <div className="lg:col-span-3 animate-fadeInUp delay-200">
              <div className="relative">
                <div className="absolute -top-4 -left-2 text-primary-200 text-6xl sm:text-8xl font-serif leading-none select-none">"</div>
                <div className="relative pt-6 sm:pt-8">
                  <div className="profile-content text-sm sm:text-base text-gray-600 leading-relaxed mb-6 sm:mb-8"
                    dangerouslySetInnerHTML={{ __html: profileData.sambutanKepsek }}
                  />
                </div>
              </div>

              {/* Info Cards */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-4 sm:mt-6">
                {[
                  { icon: Target, title: 'Visi', desc: profileData.visi.substring(0, 60) + '...' },
                  { icon: BookOpen, title: 'Kurikulum', desc: 'Kurikulum Merdeka berbasis kompetensi.' },
                  { icon: Award, title: 'Prestasi', desc: `${statsData.prestasi} penghargaan berbagai tingkat.` },
                  { icon: Users, title: 'Alumni', desc: '10.000+ alumni di seluruh Indonesia.' },
                ].map((item) => (
                  <div key={item.title} className="bg-gradient-to-br from-primary-50 to-primary-100/50 rounded-xl p-3 sm:p-4 border border-primary-100 hover:shadow-md transition-all group">
                    <item.icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary-500 mb-1.5 sm:mb-2 group-hover:scale-110 transition-transform" />
                    <h4 className="font-bold text-gray-900 text-xs sm:text-sm">{item.title}</h4>
                    <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Berita Terbaru */}
      <section className="py-12 sm:py-16 lg:py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-6 sm:mb-10">
            <div>
              <div className="inline-flex items-center gap-2 bg-primary-50 rounded-full px-3 py-1 sm:px-4 sm:py-1.5 text-primary-600 text-xs sm:text-sm font-medium mb-2 sm:mb-3">
                <Newspaper className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Berita Terbaru
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900">Berita & Kegiatan</h2>
            </div>
            <Link to="/berita" className="hidden sm:flex items-center gap-1.5 text-primary-500 hover:text-primary-700 font-semibold text-sm transition-colors">
              Lihat Semua <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {latestNews.map((item, i) => (
              <div key={item.id} className="animate-fadeInUp" style={{ animationDelay: `${i * 0.15}s` }}>
                <NewsCard item={item} index={i} />
              </div>
            ))}
          </div>
          <div className="mt-6 text-center sm:hidden">
            <Link to="/berita" className="inline-flex items-center gap-2 text-primary-500 font-semibold text-sm">
              Lihat Semua Berita <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Agenda Mendatang */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-6 sm:mb-10">
            <div>
              <div className="inline-flex items-center gap-2 bg-primary-50 rounded-full px-3 py-1 sm:px-4 sm:py-1.5 text-primary-600 text-xs sm:text-sm font-medium mb-2 sm:mb-3">
                <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Agenda Sekolah
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900">Agenda Mendatang</h2>
            </div>
            <Link to="/agenda" className="hidden sm:flex items-center gap-1.5 text-primary-500 hover:text-primary-700 font-semibold text-sm transition-colors">
              Lihat Semua <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-3 sm:gap-4 lg:gap-5">
            {upcomingAgenda.map((item, i) => (
              <div key={item.id} className="animate-fadeInUp" style={{ animationDelay: `${i * 0.1}s` }}>
                <AgendaCard item={item} onClick={() => setSelectedAgenda(item)} />
              </div>
            ))}
          </div>
          <div className="mt-6 text-center sm:hidden">
            <Link to="/agenda" className="inline-flex items-center gap-2 text-primary-500 font-semibold text-sm">
              Lihat Semua Agenda <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Instagram Feed */}
      {shouldShowInstagramSection && (
        <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-pink-50 via-white to-purple-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-6 sm:mb-10 animate-fadeInUp">
              <div className="inline-flex items-center gap-2 bg-pink-50 rounded-full px-3 py-1 sm:px-4 sm:py-1.5 text-pink-600 text-xs sm:text-sm font-medium mb-2 sm:mb-3 border border-pink-100">
                <span className="text-base">📸</span>
                Temukan Kami di Instagram
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900">
                {instagramSettings.sectionTitle}
              </h2>
              <p className="text-gray-500 text-sm sm:text-base mt-2 max-w-xl mx-auto">
                Ikuti kegiatan terbaru kami melalui Instagram. Jangan lewatkan momen-momen berharga!
              </p>
            </div>
            <InstagramFeed settings={instagramSettings} maxPosts={6} />
          </div>
        </section>
      )}

      {/* Sponsor Marquee */}
      <SponsorMarquee />

      {/* CTA */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-r from-primary-600 via-primary-500 to-primary-400 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23fff' fill-opacity='0.4' fill-rule='evenodd'%3E%3Cpath d='M20 20.5a.5.5 0 1 1 0-1 .5.5 0 0 1 0 1zm0-20a.5.5 0 1 1 0-1 .5.5 0 0 1 0 1zm0 40a.5.5 0 1 1 0-1 .5.5 0 0 1 0 1zM0 20.5a.5.5 0 1 1 0-1 .5.5 0 0 1 0 1zM40 20.5a.5.5 0 1 1 0-1 .5.5 0 0 1 0 1z'/%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white mb-3 sm:mb-4">Bergabung Bersama Kami</h2>
          <p className="text-primary-100 text-sm sm:text-lg mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed">
            Jadilah bagian dari keluarga besar SMPN 1 Genteng. Hubungi kami untuk informasi pendaftaran.
          </p>
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
            <Link to="/kontak" className="inline-flex items-center gap-2 bg-white text-primary-700 px-6 py-3 sm:px-8 sm:py-3.5 rounded-xl font-bold text-sm hover:bg-primary-50 transition-all shadow-xl">
              Hubungi Kami <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/galeri" className="inline-flex items-center gap-2 bg-white/10 text-white px-6 py-3 sm:px-8 sm:py-3.5 rounded-xl font-bold text-sm hover:bg-white/20 transition-all border border-white/20">
              Lihat Galeri
            </Link>
          </div>
        </div>
      </section>

      <AgendaDetailModal item={selectedAgenda} onClose={() => setSelectedAgenda(null)} />
    </div>
  );
}

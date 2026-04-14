import { Link } from 'react-router-dom';
import { GraduationCap, MapPin, Phone, Mail, Clock, ExternalLink } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getGoogleMapsEmbedUrl } from '../types';

export default function Footer() {
  const { contactInfo, footerCredit } = useApp();
  const mapEmbedUrl = getGoogleMapsEmbedUrl(contactInfo);

  const copyrightLine = (() => {
    const year = footerCredit.showYear ? `© ${new Date().getFullYear()} ` : '';
    const school = footerCredit.schoolName || 'SMP Negeri 1 Genteng';
    const custom = footerCredit.copyrightText ? ` — ${footerCredit.copyrightText}` : '';
    return `${year}${school}${custom}`;
  })();

  const rightLine = (() => {
    const base = footerCredit.rightText || '';
    if (footerCredit.developerName) {
      const devLink = footerCredit.developerUrl
        ? `<a href="${footerCredit.developerUrl}" target="_blank" rel="noopener noreferrer" class="text-primary-300 hover:text-white underline underline-offset-2 transition-colors">${footerCredit.developerName}</a>`
        : footerCredit.developerName;
      return base ? `${base} oleh ${devLink}` : `Developed by ${devLink}`;
    }
    return base;
  })();

  return (
    <footer className="bg-primary-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
          {/* School Info */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-primary-400 to-primary-500 rounded-xl flex items-center justify-center">
                <GraduationCap className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold">SMPN 1 Genteng</h3>
                <p className="text-primary-300 text-[10px] sm:text-xs">Kabupaten Banyuwangi</p>
              </div>
            </div>
            <p className="text-primary-200 text-xs sm:text-sm leading-relaxed mb-4">
              Unggul dalam Prestasi, Santun dalam Budi Pekerti. Membentuk generasi cerdas dan berkarakter.
            </p>
            <div className="flex space-x-3">
              {contactInfo.facebook && (
                <a href={contactInfo.facebook} target="_blank" rel="noopener noreferrer" className="w-8 h-8 sm:w-9 sm:h-9 bg-primary-800 hover:bg-primary-700 rounded-lg flex items-center justify-center transition-colors" aria-label="Facebook">
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
              )}
              {contactInfo.instagram && (
                <a href={contactInfo.instagram} target="_blank" rel="noopener noreferrer" className="w-8 h-8 sm:w-9 sm:h-9 bg-primary-800 hover:bg-primary-700 rounded-lg flex items-center justify-center transition-colors" aria-label="Instagram">
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                </a>
              )}
              {contactInfo.youtube && (
                <a href={contactInfo.youtube} target="_blank" rel="noopener noreferrer" className="w-8 h-8 sm:w-9 sm:h-9 bg-primary-800 hover:bg-primary-700 rounded-lg flex items-center justify-center transition-colors" aria-label="YouTube">
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-accent-400 font-semibold text-xs sm:text-sm uppercase tracking-wider mb-3 sm:mb-4">Tautan Cepat</h4>
            <ul className="space-y-2">
              {[
                { to: '/profil', label: 'Profil Sekolah' },
                { to: '/berita', label: 'Berita Kegiatan' },
                { to: '/agenda', label: 'Agenda Sekolah' },
                { to: '/galeri', label: 'Galeri' },
                { to: '/kontak', label: 'Hubungi Kami' },
              ].map(link => (
                <li key={link.to}>
                  <Link to={link.to} className="text-primary-200 hover:text-white text-xs sm:text-sm transition-colors flex items-center gap-1.5 group">
                    <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-accent-400 font-semibold text-xs sm:text-sm uppercase tracking-wider mb-3 sm:mb-4">Kontak</h4>
            <ul className="space-y-2.5">
              <li className="flex items-start gap-2 sm:gap-3 text-xs sm:text-sm text-primary-200">
                <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary-400 mt-0.5 shrink-0" />
                <span>{contactInfo.address}</span>
              </li>
              <li className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-primary-200">
                <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary-400 shrink-0" />
                <span>{contactInfo.phone}</span>
              </li>
              <li className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-primary-200">
                <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary-400 shrink-0" />
                <span>{contactInfo.email}</span>
              </li>
              <li className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-primary-200">
                <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary-400 shrink-0" />
                <span>{contactInfo.hours}</span>
              </li>
            </ul>
          </div>

          {/* Map */}
          <div>
            <h4 className="text-accent-400 font-semibold text-xs sm:text-sm uppercase tracking-wider mb-3 sm:mb-4">Lokasi</h4>
            <div className="rounded-xl overflow-hidden shadow-lg border border-primary-800 h-36 sm:h-44">
              <iframe
                src={mapEmbedUrl}
                className="w-full h-full border-0"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Lokasi SMPN 1 Genteng"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-primary-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex flex-col sm:flex-row justify-between items-center text-[11px] sm:text-sm text-primary-400">
          <p>{copyrightLine}</p>
          {rightLine && (
            <p className="mt-0.5 sm:mt-0" dangerouslySetInnerHTML={{ __html: rightLine }} />
          )}
        </div>
      </div>
    </footer>
  );
}

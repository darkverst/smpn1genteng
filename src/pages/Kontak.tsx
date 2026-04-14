import { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle, MessageSquare } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Kontak() {
  const { contactInfo } = useApp();
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 3000);
  };

  return (
    <div className="page-enter">
      <section className="bg-gradient-to-r from-primary-700 via-primary-600 to-primary-500 py-10 sm:py-16 lg:py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-3 py-1 text-primary-100 text-xs sm:text-sm mb-3 border border-white/10">
            <MessageSquare className="h-3.5 w-3.5" /> Hubungi Kami
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-5xl font-extrabold text-white mb-3">Kontak Kami</h1>
          <p className="text-primary-100 text-sm sm:text-lg max-w-2xl mx-auto">
            Jangan ragu untuk menghubungi kami. Kami siap membantu Anda.
          </p>
        </div>
      </section>

      <section className="py-8 sm:py-12 lg:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-8 sm:mb-16">
            {[
              { icon: MapPin, title: 'Alamat', content: contactInfo.address, color: 'from-primary-400 to-primary-600' },
              { icon: Phone, title: 'Telepon', content: contactInfo.phone, color: 'from-green-400 to-green-600' },
              { icon: Mail, title: 'Email', content: contactInfo.email, color: 'from-accent-400 to-accent-600' },
              { icon: Clock, title: 'Jam Operasional', content: contactInfo.hours, color: 'from-purple-400 to-purple-600' },
            ].map((item) => (
              <div key={item.title} className="bg-gray-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-100 hover:shadow-lg transition-all duration-300 text-center group">
                <div className={`w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-br ${item.color} rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-2 sm:mb-4 group-hover:scale-110 transition-transform shadow-md`}>
                  <item.icon className="h-5 w-5 sm:h-7 sm:w-7 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 text-xs sm:text-base mb-1 sm:mb-2">{item.title}</h3>
                <p className="text-[11px] sm:text-sm text-gray-500 leading-relaxed break-words">{item.content}</p>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-6 sm:gap-8">
            <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-xl border border-gray-100">
              <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 mb-1 sm:mb-2">Kirim Pesan</h2>
              <p className="text-gray-500 text-xs sm:text-sm mb-4 sm:mb-6">Isi formulir di bawah untuk mengirim pesan kepada kami.</p>

              {submitted ? (
                <div className="text-center py-8 sm:py-12 animate-scaleIn">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <CheckCircle className="h-7 w-7 sm:h-8 sm:w-8 text-green-600" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Pesan Terkirim!</h3>
                  <p className="text-gray-500 text-sm">Terima kasih. Kami akan segera merespon.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                  <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                      <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 transition-all" placeholder="Nama Anda" />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 transition-all" placeholder="email@contoh.com" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Subjek</label>
                    <input type="text" required value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 transition-all" placeholder="Subjek pesan" />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Pesan</label>
                    <textarea required rows={4} value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 transition-all resize-none" placeholder="Tulis pesan Anda..." />
                  </div>
                  <button type="submit" className="w-full bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-white py-3 sm:py-3.5 rounded-xl font-semibold text-sm transition-all shadow-lg flex items-center justify-center gap-2">
                    <Send className="h-4 w-4" /> Kirim Pesan
                  </button>
                </form>
              )}
            </div>

            <div className="rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl border border-gray-100 h-[300px] sm:h-[400px] lg:h-auto">
              <iframe
                src={`https://maps.google.com/maps?q=${contactInfo.mapQuery}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                className="w-full h-full border-0"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Lokasi SMPN 1 Genteng"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

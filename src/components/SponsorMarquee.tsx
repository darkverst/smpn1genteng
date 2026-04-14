import { useApp } from '../context/AppContext';

export default function SponsorMarquee() {
  const { sponsorsData } = useApp();

  if (!sponsorsData.showSection || !sponsorsData.sponsors || sponsorsData.sponsors.length === 0) return null;

  return (
    <section className="py-12 bg-white overflow-hidden border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <h3 className="text-xl font-bold text-center text-gray-800">{sponsorsData.title}</h3>
      </div>
      
      <div className="relative w-full overflow-hidden flex items-center">
        {/* Transparent gradient masks for smooth fade on edges */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white to-transparent z-10"></div>
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white to-transparent z-10"></div>

        {/* Marquee Container */}
        <div className="flex w-fit animate-marquee hover:pause-marquee space-x-12 px-6 items-center justify-center">
          {/* Duplicate list to make it infinite and smooth */}
          {[...sponsorsData.sponsors, ...sponsorsData.sponsors, ...sponsorsData.sponsors].map((sponsor, idx) => (
            <a 
              key={`${sponsor.id}-${idx}`}
              href={sponsor.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex-shrink-0 flex items-center justify-center w-40 h-24 p-4 grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100 bg-white border border-transparent hover:border-sky-100 rounded-xl hover:shadow-lg hover:-translate-y-1"
              title={sponsor.name}
            >
              <img 
                src={sponsor.logo} 
                alt={sponsor.name} 
                className="max-h-full max-w-full object-contain"
                loading="lazy"
              />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

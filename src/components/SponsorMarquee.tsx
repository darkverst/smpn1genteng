import { useApp } from '../context/AppContext';

export default function SponsorMarquee() {
  const { sponsorsData } = useApp();
  const sponsors = sponsorsData.sponsors.filter((item) => item.name.trim());

  if (!sponsorsData.showSection || sponsors.length === 0) return null;

  const minimumTrackItems = 6;
  const repetitionCount = Math.max(1, Math.ceil(minimumTrackItems / sponsors.length));
  const trackSponsors = Array.from({ length: repetitionCount }, () => sponsors).flat();

  const SponsorCard = ({ name, logo, url }: { name: string; logo: string; url: string }) => {
    const content = (
      <>
        {logo ? (
          <img
            src={logo}
            alt={name}
            className="max-h-full max-w-full object-contain"
            loading="lazy"
          />
        ) : (
          <span className="text-sm font-semibold text-gray-500">{name}</span>
        )}
      </>
    );

    const className = 'group flex h-24 w-40 flex-shrink-0 items-center justify-center rounded-xl border border-transparent bg-white p-4 opacity-80 transition-all duration-300 hover:-translate-y-1 hover:border-sky-100 hover:opacity-100 hover:shadow-lg';

    if (!url) {
      return (
        <div className={className} title={name}>
          {content}
        </div>
      );
    }

    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        title={name}
      >
        {content}
      </a>
    );
  };

  return (
    <section className="py-12 bg-white overflow-hidden border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <h3 className="text-xl font-bold text-center text-gray-800">{sponsorsData.title}</h3>
      </div>

      <div className="relative flex w-full items-center overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 z-10 w-24 bg-gradient-to-r from-white to-transparent" />
        <div className="absolute right-0 top-0 bottom-0 z-10 w-24 bg-gradient-to-l from-white to-transparent" />

        <div className="flex w-max animate-marquee hover:pause-marquee items-center">
          {[0, 1].map((copyIndex) => (
            <div
              key={copyIndex}
              className="flex shrink-0 items-center gap-12 px-6"
              aria-hidden={copyIndex === 1}
            >
              {trackSponsors.map((sponsor, sponsorIndex) => (
                <SponsorCard
                  key={`${copyIndex}-${sponsor.id}-${sponsorIndex}`}
                  name={sponsor.name}
                  logo={sponsor.logo}
                  url={sponsor.url}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

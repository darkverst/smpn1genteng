import { HeroCurveStyle } from '../types';

interface HeroCurveDividerProps {
  style?: HeroCurveStyle;
  primaryColor?: string;
  accentColor?: string;
  fillColor?: string;
  className?: string;
}

export default function HeroCurveDivider({
  style = 'wave-double',
  primaryColor = '#16a34a',
  accentColor = '#eab308',
  fillColor = '#f8fafc',
  className = '',
}: HeroCurveDividerProps) {
  // 1. Wave Double (Gelombang Ganda Berlapis 3D)
  if (style === 'wave-double') {
    return (
      <div className={`w-full overflow-hidden leading-none ${className}`}>
        <svg
          viewBox="0 0 1440 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="block w-full h-10 sm:h-16 lg:h-20"
          preserveAspectRatio="none"
        >
          {/* Layer 1 (Lapisan Belakang - Semi transparan) */}
          <path
            d="M0 100V45C320 10 640 85 960 40C1200 5 1360 45 1440 50V100H0Z"
            fill={fillColor}
            fillOpacity="0.3"
          />
          {/* Layer 2 (Lapisan Tengah - Medium transparan) */}
          <path
            d="M0 100V60C240 25 540 75 820 45C1100 15 1300 65 1440 58V100H0Z"
            fill={fillColor}
            fillOpacity="0.55"
          />
          {/* Layer 3 (Lapisan Depan - Solid) */}
          <path
            d="M0 100V75C360 40 720 90 1080 60C1240 45 1360 65 1440 70V100H0Z"
            fill={fillColor}
          />
        </svg>
      </div>
    );
  }

  // 2. Wave Smooth (Gelombang Asimetris Mengalir)
  if (style === 'wave-smooth') {
    return (
      <div className={`w-full overflow-hidden leading-none ${className}`}>
        <svg
          viewBox="0 0 1440 90"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="block w-full h-10 sm:h-16 lg:h-20"
          preserveAspectRatio="none"
        >
          {/* Back wave */}
          <path
            d="M0 90V35C420 85 860 10 1440 55V90H0Z"
            fill={fillColor}
            fillOpacity="0.4"
          />
          {/* Front wave */}
          <path
            d="M0 90V50C440 95 900 25 1440 65V90H0Z"
            fill={fillColor}
          />
          {/* Accent stroke */}
          <path
            d="M0 50C440 95 900 25 1440 65"
            stroke={accentColor || '#f59e0b'}
            strokeWidth="2.5"
            strokeOpacity="0.45"
            fill="none"
          />
        </svg>
      </div>
    );
  }

  // 3. Arc Concave (Busur Cekung Elegan)
  if (style === 'arc-concave') {
    return (
      <div className={`w-full overflow-hidden leading-none ${className}`}>
        <svg
          viewBox="0 0 1440 90"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="block w-full h-10 sm:h-16 lg:h-20"
          preserveAspectRatio="none"
        >
          {/* Back soft arc */}
          <path
            d="M0 90V60Q720 5 1440 60V90H0Z"
            fill={fillColor}
            fillOpacity="0.35"
          />
          {/* Front solid arc */}
          <path
            d="M0 90V75Q720 20 1440 75V90H0Z"
            fill={fillColor}
          />
          {/* Subtle crest accent */}
          <path
            d="M0 75Q720 20 1440 75"
            stroke={accentColor || '#f59e0b'}
            strokeWidth="2"
            strokeOpacity="0.35"
            fill="none"
          />
        </svg>
      </div>
    );
  }

  // 4. Wave Peaks (Puncak Kembar / Twin Crests)
  if (style === 'wave-peaks') {
    return (
      <div className={`w-full overflow-hidden leading-none ${className}`}>
        <svg
          viewBox="0 0 1440 90"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="block w-full h-10 sm:h-16 lg:h-20"
          preserveAspectRatio="none"
        >
          {/* Back peaks */}
          <path
            d="M0 90V50C200 15 400 75 600 45C800 15 1000 75 1200 45C1320 25 1390 50 1440 45V90H0Z"
            fill={fillColor}
            fillOpacity="0.35"
          />
          {/* Front peaks */}
          <path
            d="M0 90V65C220 35 440 85 660 55C880 25 1100 85 1300 55C1380 40 1415 60 1440 58V90H0Z"
            fill={fillColor}
          />
        </svg>
      </div>
    );
  }

  // 5. Curve Glow (Kurva Modern dengan Garis Pendar Aksen)
  if (style === 'curve-glow') {
    return (
      <div className={`w-full overflow-hidden leading-none ${className}`}>
        <svg
          viewBox="0 0 1440 90"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="block w-full h-10 sm:h-16 lg:h-20"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="hero-curve-accent-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={primaryColor} stopOpacity="0.8" />
              <stop offset="50%" stopColor={accentColor} stopOpacity="1" />
              <stop offset="100%" stopColor={primaryColor} stopOpacity="0.8" />
            </linearGradient>
          </defs>
          {/* Soft ambient tint */}
          <path
            d="M0 90V40C400 10 800 75 1440 30V90H0Z"
            fill={fillColor}
            fillOpacity="0.3"
          />
          {/* Front solid curve */}
          <path
            d="M0 90V55C420 20 840 85 1440 45V90H0Z"
            fill={fillColor}
          />
          {/* Luminous accent curve line */}
          <path
            d="M0 55C420 20 840 85 1440 45"
            stroke="url(#hero-curve-accent-gradient)"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      </div>
    );
  }

  // 6. Wave Classic (Default bawaan awal)
  return (
    <div className={`w-full overflow-hidden leading-none ${className}`}>
      <svg
        viewBox="0 0 1440 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="block w-full h-10 sm:h-16"
        preserveAspectRatio="none"
      >
        <path
          d="M0 80V40C240 0 480 0 720 20C960 40 1200 60 1440 40V80H0Z"
          fill={fillColor}
        />
      </svg>
    </div>
  );
}

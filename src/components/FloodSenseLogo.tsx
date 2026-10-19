import React from 'react';

interface FloodSenseLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  tagline?: boolean;
}

export const FloodSenseLogo: React.FC<FloodSenseLogoProps> = ({
  className = '',
  size = 40,
  showText = false,
  tagline = false,
}) => {
  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      {/* SVG Shield & Water Droplet Logo matching the uploaded reference image */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 drop-shadow-xs select-none"
      >
        <defs>
          {/* Vibrant blue gradient for water drop */}
          <linearGradient id="dropletGradient" x1="50" y1="18" x2="50" y2="78" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="45%" stopColor="#0ea5e9" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>

          {/* Shield outline stroke gradient */}
          <linearGradient id="shieldStroke" x1="20" y1="16" x2="80" y2="88" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0284c7" />
            <stop offset="50%" stopColor="#0369a1" />
            <stop offset="100%" stopColor="#0ea5e9" />
          </linearGradient>

          {/* Subtle soft inner glow */}
          <linearGradient id="dropletHighlight" x1="50" y1="55" x2="50" y2="74" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Shield Outline matching user logo */}
        <path
          d="M 50 14
             C 62 18, 76 18, 81 22
             C 82 42, 80 62, 50 86
             C 20 62, 18 42, 19 22
             C 24 18, 38 18, 50 14 Z"
          fill="none"
          stroke="url(#shieldStroke)"
          strokeWidth="6.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Water Droplet inside Shield */}
        <path
          d="M 50 20
             C 50 20, 68 47, 68 58
             C 68 68, 60 76, 50 76
             C 40 76, 32 68, 32 58
             C 32 47, 50 20, 50 20 Z"
          fill="url(#dropletGradient)"
        />

        {/* Water Droplet Base Crescent Highlight */}
        <path
          d="M 38 62
             C 40 68, 44 71, 50 71
             C 56 71, 60 68, 62 62
             C 59 66, 55 68, 50 68
             C 45 68, 41 66, 38 62 Z"
          fill="url(#dropletHighlight)"
        />
      </svg>

      {showText && (
        <div className="flex flex-col">
          <span className="font-extrabold text-white tracking-tight leading-none text-lg">
            Floodsense
          </span>
          {tagline ? (
            <span className="text-[10px] text-sky-400 font-medium tracking-wide mt-1">
              Understand Rainfall. Identify Risk. Stay Prepared.
            </span>
          ) : (
            <span className="text-[11px] text-sky-400 font-medium tracking-wide mt-0.5">
              Urban Flood Intelligence
            </span>
          )}
        </div>
      )}
    </div>
  );
};

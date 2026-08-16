'use client';

import Image from 'next/image';

interface AILIBLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
  variant?: 'emblem' | 'full';
}

/**
 * Official AILIB Brand Logo Component
 * Renders the 3-book emblem (Green, Blue, Red books in circular badge)
 */
export function AILIBLogo({
  size = 32,
  className = '',
  showText = false,
}: AILIBLogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Emblem SVG / Image Badge */}
      <div
        style={{ width: size, height: size }}
        className="relative rounded-full overflow-hidden shrink-0 shadow-sm transition-transform duration-200 group-hover:scale-105"
      >
        <svg
          viewBox="0 0 100 100"
          width={size}
          height={size}
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer Ring & White Disc */}
          <circle cx="50" cy="50" r="48" fill="#FFFFFF" stroke="#141613" strokeWidth="4" />
          <circle cx="50" cy="50" r="44" fill="#FFFFFF" stroke="#141613" strokeWidth="1.5" />

          {/* Isometric 3 Books Group */}
          <g transform="translate(0, 0)">
            {/* 1. GREEN BOOK (Left) */}
            {/* Top cover */}
            <polygon points="46,36 34,26 21,37 33,48" fill="#82B33D" stroke="#141613" strokeWidth="1.5" strokeLinejoin="round" />
            {/* Spine & pages side */}
            <polygon points="33,48 21,37 23,48 35,59" fill="#F4E8D1" stroke="#141613" strokeWidth="1.5" strokeLinejoin="round" />
            <polygon points="33,48 35,59 48,47 46,36" fill="#6A972D" stroke="#141613" strokeWidth="1.5" strokeLinejoin="round" />

            {/* 2. BLUE BOOK (Top Right) */}
            {/* Top cover */}
            <polygon points="53,22 66,25 78,41 65,38" fill="#3B8BC4" stroke="#141613" strokeWidth="1.5" strokeLinejoin="round" />
            {/* Spine & pages side */}
            <polygon points="53,22 65,38 67,49 55,33" fill="#2E72A3" stroke="#141613" strokeWidth="1.5" strokeLinejoin="round" />
            <polygon points="65,38 78,41 80,52 67,49" fill="#F4E8D1" stroke="#141613" strokeWidth="1.5" strokeLinejoin="round" />

            {/* 3. RED BOOK (Bottom) */}
            {/* Top cover */}
            <polygon points="50,42 66,45 80,57 64,54" fill="#D94136" stroke="#141613" strokeWidth="1.5" strokeLinejoin="round" />
            {/* Pages on left */}
            <polygon points="38,50 50,42 64,54 52,62" fill="#F4E8D1" stroke="#141613" strokeWidth="1.5" strokeLinejoin="round" />
            {/* Front cover bottom edge */}
            <polygon points="52,62 64,54 80,57 68,65" fill="#BF3329" stroke="#141613" strokeWidth="1.5" strokeLinejoin="round" />
            <polygon points="38,50 40,58 54,70 52,62" fill="#F4E8D1" stroke="#141613" strokeWidth="1.5" strokeLinejoin="round" />
            <polygon points="52,62 54,70 70,73 68,65" fill="#A8281F" stroke="#141613" strokeWidth="1.5" strokeLinejoin="round" />
          </g>
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className="font-serif-heading text-lg font-bold tracking-tight text-[#141613] leading-none">
            AILIB
          </span>
          <span className="text-[9px] uppercase tracking-widest text-[#73796E] font-medium leading-tight">
            SINCE 2026
          </span>
        </div>
      )}
    </div>
  );
}

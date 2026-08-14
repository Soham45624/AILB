'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export function NavigationProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Finish loading whenever URL changes
    setLoading(false);
    setProgress(100);
    const timer = setTimeout(() => setProgress(0), 200);
    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  useEffect(() => {
    // Intercept internal Link clicks to immediately show progress
    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a');
      if (!target) return;

      const href = target.getAttribute('href');
      if (
        href &&
        href.startsWith('/') &&
        !href.startsWith('/#') &&
        !href.startsWith('mailto:') &&
        !href.startsWith('tel:') &&
        target.target !== '_blank'
      ) {
        setLoading(true);
        setProgress(35);
        setTimeout(() => setProgress(75), 100);
      }
    };

    document.addEventListener('click', handleAnchorClick, { capture: true });
    return () => document.removeEventListener('click', handleAnchorClick, { capture: true });
  }, []);

  if (progress === 0 && !loading) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-[2px] bg-transparent pointer-events-none">
      <div
        className="h-full bg-gradient-to-r from-zinc-200 via-white to-zinc-400 shadow-[0_0_8px_rgba(255,255,255,0.8)] transition-all duration-300 ease-out"
        style={{
          width: `${progress}%`,
          opacity: progress === 100 ? 0 : 1,
        }}
      />
    </div>
  );
}

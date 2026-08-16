'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, Sparkles, Bookmark, Plus } from 'lucide-react';

export function MobileBottomNav() {
  const pathname = usePathname();

  // Hide mobile bottom navigation on admin routes
  if (pathname.startsWith('/admin')) {
    return null;
  }

  const navItems = [
    {
      label: 'Home',
      href: '/',
      icon: Home,
      isActive: pathname === '/',
    },
    {
      label: 'Explore',
      href: '/tools',
      icon: Compass,
      isActive: pathname.startsWith('/tools'),
    },
    {
      label: 'Finder',
      href: '/finder',
      icon: Sparkles,
      isActive: pathname === '/finder',
    },
    {
      label: 'Library',
      href: '/dashboard/my-library',
      icon: Bookmark,
      isActive: pathname.startsWith('/dashboard'),
    },
    {
      label: 'Add',
      href: '/submit',
      icon: Plus,
      isActive: pathname === '/submit',
    },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-[#FBF9F5]/95 backdrop-blur-lg border-t border-[#EAE6DC] px-3 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-[0_-4px_20px_rgba(0,0,0,0.03)]"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.isActive;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-2xl transition-all ${
                active
                  ? 'text-[#5A7840] font-bold'
                  : 'text-[#73796E] hover:text-[#141613]'
              }`}
            >
              <div
                className={`p-1.5 rounded-full transition-colors ${
                  active ? 'bg-[#EDF7EE]' : ''
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
              </div>
              <span className="text-[10px] tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

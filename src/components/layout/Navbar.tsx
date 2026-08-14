'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Sparkles,
  Plus,
  Search,
  LogIn,
  LogOut,
  Compass,
  LayoutDashboard,
  ShieldCheck,
  Send,
} from 'lucide-react';
import { getCurrentUserAction, signOutAction } from '@/app/actions/auth';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState<any>(null);

  const fetchUser = () => {
    getCurrentUserAction().then((res) => {
      if (res.success && res.user) {
        setUser(res.user);
      } else {
        setUser(null);
      }
    });
  };

  useEffect(() => {
    fetchUser();
  }, [pathname]);

  const handleSignOut = async () => {
    await signOutAction();
    setUser(null);
    router.push('/');
    router.refresh();
  };

  const navLinks = [
    { name: 'Directory', href: '/tools', icon: Compass },
    { name: 'Categories', href: '/#categories' },
    { name: 'Submit AI Tool', href: '/submit' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/80 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-15 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-8 h-8 rounded-lg bg-zinc-100 text-zinc-950 flex items-center justify-center font-black text-sm tracking-tighter group-hover:bg-white transition-colors">
            AI
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-sm tracking-tight text-zinc-100">
              Discovery
            </span>
          </div>
        </Link>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'text-white bg-zinc-800/90'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          {/* Quick Search */}
          <form action="/tools" method="GET" className="hidden sm:flex items-center relative">
            <input
              type="text"
              name="search"
              placeholder="Search tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-36 lg:w-48 pl-8 pr-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-600 transition-colors"
            />
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 pointer-events-none" />
          </form>

          {/* + Submit Button */}
          <Link
            href="/submit"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs transition-colors shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Submit</span>
          </Link>

          {/* User Profile / Admin Link / Login */}
          {user ? (
            <div className="flex items-center gap-1.5">
              {user.role === 'admin' && (
                <Link
                  href="/admin"
                  className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-xs font-medium flex items-center gap-1"
                  title="Admin Portal"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                </Link>
              )}

              <Link
                href="/dashboard"
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                  pathname.startsWith('/dashboard')
                    ? 'bg-zinc-800 border-zinc-700 text-white'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-850 hover:text-white'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-zinc-400" />
                <span className="max-w-[90px] truncate">{user.username || user.email?.split('@')[0]}</span>
              </Link>

              <button
                onClick={handleSignOut}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-200 text-xs font-medium transition-colors"
            >
              <LogIn className="w-3.5 h-3.5 text-zinc-400" />
              <span>Sign In</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

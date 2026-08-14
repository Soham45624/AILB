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
  Layers,
  Compass,
  User,
  LayoutDashboard,
} from 'lucide-react';
import { ThemeToggle } from '../ui/ThemeToggle';
import { AddToolModal } from '../home/AddToolModal';
import { AuthModal } from '../auth/AuthModal';
import { getCurrentUserAction, signOutAction } from '@/app/actions/auth';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
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
    { name: 'AI Tools', href: '/tools', icon: Compass },
    { name: 'Categories', href: '/#categories', icon: Layers },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/60 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300">
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg text-slate-100 tracking-tight flex items-center gap-1.5">
                AI Discovery
                <span className="text-[10px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  PRO
                </span>
              </span>
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'text-cyan-400 bg-cyan-500/10 border border-cyan-500/20'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4 text-slate-400 group-hover:text-cyan-400" />
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
                placeholder="Search AI tools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-40 lg:w-56 pl-9 pr-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            </form>

            <ThemeToggle />

            {/* Add Tool Button */}
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs sm:text-sm shadow-md shadow-cyan-500/20 hover:shadow-cyan-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden xs:inline">Add AI Tool</span>
            </button>

            {/* User Auth Profile / Login Button */}
            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/dashboard"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                    pathname === '/dashboard'
                      ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300'
                      : 'bg-slate-900 border-slate-800 text-slate-200 hover:border-slate-700 hover:bg-slate-850'
                  }`}
                  title="Go to Dashboard"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="max-w-[110px] truncate">{user.username || user.email?.split('@')[0]}</span>
                </Link>

                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-1 p-2 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-900 hover:bg-rose-950/40 hover:text-rose-400 border border-slate-800 hover:border-rose-500/30 text-slate-400 text-xs font-medium transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden lg:inline">Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs sm:text-sm font-semibold transition-colors"
                >
                  <LogIn className="w-4 h-4 text-cyan-400" />
                  <span>Sign In</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Add Tool Modal */}
      <AddToolModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={fetchUser}
      />
    </>
  );
}

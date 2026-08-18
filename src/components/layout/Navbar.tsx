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
  Bookmark,
  User,
  ShieldCheck,
  LayoutDashboard,
  X,
} from 'lucide-react';
import { getCurrentUserAction, signOutAction } from '@/app/actions/auth';
import { AILIBLogo } from '@/components/ui/AILIBLogo';

// Client-side in-memory cache to persist user sessions across page transitions
let cachedUser: any = null;
let hasFetchedUser = false;
const authListeners = new Set<(state: { user: any; loading: boolean }) => void>();

function setCachedUser(user: any) {
  cachedUser = user;
  hasFetchedUser = true;
  authListeners.forEach((listener) => listener({ user: cachedUser, loading: false }));
}

const fetchUserSession = async () => {
  try {
    const res = await getCurrentUserAction();
    if (res.success && res.user) {
      setCachedUser(res.user);
    } else {
      setCachedUser(null);
    }
  } catch {
    setCachedUser(null);
  }
};

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState<any>(cachedUser);
  const [isLoading, setIsLoading] = useState(!hasFetchedUser);

  useEffect(() => {
    const handleAuthChange = (state: { user: any; loading: boolean }) => {
      setUser(state.user);
      setIsLoading(state.loading);
    };

    authListeners.add(handleAuthChange);

    if (!hasFetchedUser) {
      fetchUserSession();
    } else {
      setUser(cachedUser);
      setIsLoading(false);

      getCurrentUserAction().then((res) => {
        if (res.success && res.user) {
          if (JSON.stringify(res.user) !== JSON.stringify(cachedUser)) {
            setCachedUser(res.user);
          }
        } else if (cachedUser !== null) {
          setCachedUser(null);
        }
      });
    }

    return () => {
      authListeners.delete(handleAuthChange);
    };
  }, [pathname]);

  const handleSignOut = async () => {
    await signOutAction();
    setCachedUser(null);
    router.push('/');
    router.refresh();
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/tools?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#FBF9F5]/90 backdrop-blur-md border-b border-[#EAE6DC] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand Logo + Primary Nav Links */}
        <div className="flex items-center gap-8">
          {/* Brand Logo with Official 3-Books Emblem */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <AILIBLogo size={32} />
            <span className="font-extrabold text-base tracking-tight text-[#141613]">
              AILIB
            </span>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-2">
            <Link
              href="/tools"
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${pathname.startsWith('/tools')
                  ? 'bg-[#ECE8DF] text-[#141613]'
                  : 'text-[#666B60] hover:text-[#141613] hover:bg-[#F2EFE8]'
                }`}
            >
              Explore
            </Link>

            <Link
              href="/finder"
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${pathname === '/finder'
                  ? 'bg-[#ECE8DF] text-[#141613]'
                  : 'text-[#666B60] hover:text-[#141613] hover:bg-[#F2EFE8]'
                }`}
            >
              AI Finder
            </Link>
          </nav>
        </div>

        {/* Right: Search, Library, + Add Tool, Avatar */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Search Toggle / Input (Desktop/Tablet) */}
          {searchOpen ? (
            <form onSubmit={handleSearchSubmit} className="flex items-center relative animate-fade-in">
              <input
                type="text"
                placeholder="Search AI tools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-40 sm:w-64 pl-8 pr-7 py-1.5 rounded-full bg-white border border-[#DDD7CB] text-xs text-[#141613] placeholder:text-[#94998E] focus:outline-none focus:border-[#141613] shadow-sm"
              />
              <Search className="w-3.5 h-3.5 text-[#73796E] absolute left-3 pointer-events-none" />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="absolute right-2.5 text-[#73796E] hover:text-[#141613]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="hidden sm:flex p-2 rounded-full text-[#666B60] hover:text-[#141613] hover:bg-[#ECE8DF] transition-colors"
              title="Search AI Tools"
            >
              <Search className="w-4 h-4" />
            </button>
          )}

          {/* Library Link with Bookmark */}
          <Link
            href="/dashboard/my-library"
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${pathname === '/dashboard/my-library'
                ? 'bg-[#ECE8DF] text-[#141613]'
                : 'text-[#666B60] hover:text-[#141613] hover:bg-[#F2EFE8]'
              }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Library</span>
          </Link>

          {/* + Add Tool Solid Black Button (Round (+) on mobile, Pill (+ Add Tool) on desktop) */}
          <Link
            href="/submit"
            className="btn-interactive flex items-center justify-center w-8 h-8 sm:w-auto sm:h-auto sm:px-4 sm:py-2 rounded-full bg-[#141613] hover:bg-[#2A2E27] text-white font-bold text-xs shadow-sm shrink-0 transition-all"
            title="Submit AI Tool"
          >
            <Plus className="w-4 h-4 sm:w-3.5 sm:h-3.5 stroke-[2.5]" />
            <span className="hidden sm:inline ml-1.5">Add Tool</span>
          </Link>

          {/* User Profile / Admin / Auth */}
          {isLoading ? (
            <div className="w-8 h-8 rounded-full bg-[#ECE8DF] animate-pulse" />
          ) : user ? (
            <div className="flex items-center gap-1.5">
              {user.role === 'admin' && (
                <Link
                  href="/admin"
                  className="p-2 rounded-full bg-white hover:bg-[#ECE8DF] text-[#141613] border border-[#DDD7CB] transition-colors shadow-sm"
                  title="Admin Portal"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#5A7840]" />
                </Link>
              )}

              <Link
                href="/dashboard"
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border transition-colors shadow-sm ${pathname.startsWith('/dashboard')
                    ? 'bg-[#141613] text-white border-[#141613]'
                    : 'bg-[#ECE8DF] text-[#141613] border-[#DDD7CB] hover:bg-[#E2DDD2]'
                  }`}
                title={user.username || user.email}
              >
                {(user.username || user.email || 'U')[0].toUpperCase()}
              </Link>

              <button
                onClick={handleSignOut}
                className="p-1.5 rounded-full text-[#73796E] hover:text-[#141613] hover:bg-[#ECE8DF] transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="w-8 h-8 rounded-full bg-[#ECE8DF] hover:bg-[#E2DDD2] border border-[#DDD7CB] text-[#555] hover:text-[#141613] flex items-center justify-center transition-colors shadow-sm"
              title="Sign In"
            >
              <User className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

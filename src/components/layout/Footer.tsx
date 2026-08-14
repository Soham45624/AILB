import Link from 'next/link';

export function Footer() {
  return (
    <footer className="mt-20 border-t border-zinc-900 bg-zinc-950 text-zinc-400 text-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Col */}
          <div className="col-span-2 md:col-span-1 space-y-2">
            <Link href="/" className="flex items-center gap-2 font-bold text-sm text-zinc-100">
              <div className="w-6 h-6 rounded bg-zinc-100 text-zinc-950 font-black text-xs flex items-center justify-center">
                AI
              </div>
              AI Discovery
            </Link>
            <p className="text-zinc-500 text-xs leading-relaxed">
              Curated AI directory. Discover, evaluate, and share top artificial intelligence tools.
            </p>
          </div>

          {/* Directory Links */}
          <div>
            <h4 className="font-semibold text-zinc-200 text-xs mb-2.5">Directory</h4>
            <ul className="space-y-1.5 text-xs text-zinc-400">
              <li><Link href="/tools" className="hover:text-zinc-200 transition-colors">All Tools</Link></li>
              <li><Link href="/tools?sort=trending" className="hover:text-zinc-200 transition-colors">Trending</Link></li>
              <li><Link href="/tools?pricing=free" className="hover:text-zinc-200 transition-colors">Free Tools</Link></li>
              <li><Link href="/tools?sort=highest_rated" className="hover:text-zinc-200 transition-colors">Top Rated</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold text-zinc-200 text-xs mb-2.5">Categories</h4>
            <ul className="space-y-1.5 text-xs text-zinc-400">
              <li><Link href="/tools?category=writing-content" className="hover:text-zinc-200 transition-colors">Writing & Content</Link></li>
              <li><Link href="/tools?category=image-generation" className="hover:text-zinc-200 transition-colors">Image Generation</Link></li>
              <li><Link href="/tools?category=code-development" className="hover:text-zinc-200 transition-colors">Code & Dev</Link></li>
              <li><Link href="/tools?category=productivity-work" className="hover:text-zinc-200 transition-colors">Productivity</Link></li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h4 className="font-semibold text-zinc-200 text-xs mb-2.5">Contribute</h4>
            <ul className="space-y-1.5 text-xs text-zinc-400">
              <li><Link href="/submit" className="hover:text-zinc-200 transition-colors">Submit an AI Tool</Link></li>
              <li><Link href="/dashboard" className="hover:text-zinc-200 transition-colors">User Dashboard</Link></li>
              <li><Link href="/login" className="hover:text-zinc-200 transition-colors">Sign In</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-zinc-500 text-[11px]">
          <p>© {new Date().getFullYear()} AI Discovery. Built with Next.js & Supabase.</p>
          <div className="flex items-center gap-4">
            <span>Fast • Minimalist • Community Driven</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

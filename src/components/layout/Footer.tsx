import Link from 'next/link';
import { Sparkles, Heart, Layers } from 'lucide-react';

export function Footer() {
  return (
    <footer className="mt-20 border-t border-slate-800/80 bg-slate-950/90 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Col */}
          <div className="space-y-3 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-bold text-base text-slate-100">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4" />
              </div>
              AI Discovery
            </Link>
            <p className="text-slate-400 text-xs leading-relaxed">
              The community-powered AI tool library. Discover, evaluate, and share top artificial intelligence applications.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-slate-200 uppercase tracking-wider mb-3 text-[11px]">Explore</h4>
            <ul className="space-y-2">
              <li><Link href="/tools" className="hover:text-cyan-400 transition-colors">All AI Tools</Link></li>
              <li><Link href="/tools?sort=trending" className="hover:text-cyan-400 transition-colors">Trending Tools</Link></li>
              <li><Link href="/tools?pricing=free" className="hover:text-cyan-400 transition-colors">Free AI Tools</Link></li>
              <li><Link href="/tools?sort=highest_rated" className="hover:text-cyan-400 transition-colors">Top Rated</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-bold text-slate-200 uppercase tracking-wider mb-3 text-[11px]">Categories</h4>
            <ul className="space-y-2">
              <li><Link href="/tools?category=writing-content" className="hover:text-cyan-400 transition-colors">Writing & Content</Link></li>
              <li><Link href="/tools?category=image-generation" className="hover:text-cyan-400 transition-colors">Image Generation</Link></li>
              <li><Link href="/tools?category=code-development" className="hover:text-cyan-400 transition-colors">Code & Development</Link></li>
              <li><Link href="/tools?category=productivity-work" className="hover:text-cyan-400 transition-colors">Productivity</Link></li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h4 className="font-bold text-slate-200 uppercase tracking-wider mb-3 text-[11px]">Community</h4>
            <ul className="space-y-2">
              <li><a href="#submit" className="hover:text-cyan-400 transition-colors">Submit an AI Tool</a></li>
              <li><span className="text-slate-500 cursor-not-allowed">Moderation Guidelines</span></li>
              <li><span className="text-slate-500 cursor-not-allowed">API Documentation</span></li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-[11px]">
            © {new Date().getFullYear()} AI Tool Discovery Platform. Powered by Next.js & Supabase PostgreSQL.
          </p>
          <div className="flex items-center gap-4 text-slate-500">
            <span className="flex items-center gap-1 text-[11px]">
              Built with <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> for AI Builders
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

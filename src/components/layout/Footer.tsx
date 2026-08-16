import Link from 'next/link';
import { Sparkles } from 'lucide-react';

export function Footer() {
  return (
    <footer className="mt-20 border-t border-[#EAE6DC] bg-[#F7F4EC] text-[#666B60] text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Col */}
          <div className="col-span-2 md:col-span-1 space-y-3">
            <Link href="/" className="flex items-center gap-2.5 font-bold text-sm text-[#141613]">
              <div className="w-7 h-7 rounded-full bg-[#5A7840] text-white flex items-center justify-center shadow-sm">
                <Sparkles className="w-3.5 h-3.5 fill-white text-white" />
              </div>
              <span className="font-extrabold text-base tracking-tight text-[#141613]">
                AILIB
              </span>
            </Link>
            <p className="text-[#73796E] text-xs leading-relaxed">
              Curated AI directory. Discover, evaluate, and share top artificial intelligence tools for your workflow.
            </p>
          </div>

          {/* Directory Links */}
          <div>
            <h4 className="font-bold text-[#141613] text-xs uppercase tracking-wider mb-3">Directory</h4>
            <ul className="space-y-2 text-xs text-[#666B60]">
              <li><Link href="/tools" className="hover:text-[#141613] transition-colors">All Tools</Link></li>
              <li><Link href="/tools?sort=trending" className="hover:text-[#141613] transition-colors">Trending</Link></li>
              <li><Link href="/tools?pricing=free" className="hover:text-[#141613] transition-colors">Free Tools</Link></li>
              <li><Link href="/tools?sort=highest_rated" className="hover:text-[#141613] transition-colors">Top Rated</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-bold text-[#141613] text-xs uppercase tracking-wider mb-3">Categories</h4>
            <ul className="space-y-2 text-xs text-[#666B60]">
              <li><Link href="/tools?category=coding" className="hover:text-[#141613] transition-colors">Coding & Dev</Link></li>
              <li><Link href="/tools?category=image-generation" className="hover:text-[#141613] transition-colors">Image Generation</Link></li>
              <li><Link href="/tools?category=video-generation" className="hover:text-[#141613] transition-colors">Video AI</Link></li>
              <li><Link href="/tools?category=writing" className="hover:text-[#141613] transition-colors">Writing & Content</Link></li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h4 className="font-bold text-[#141613] text-xs uppercase tracking-wider mb-3">Contribute</h4>
            <ul className="space-y-2 text-xs text-[#666B60]">
              <li><Link href="/submit" className="hover:text-[#141613] transition-colors">Submit an AI Tool</Link></li>
              <li><Link href="/finder" className="hover:text-[#141613] transition-colors">AI Finder</Link></li>
              <li><Link href="/dashboard/my-library" className="hover:text-[#141613] transition-colors">My Library</Link></li>
              <li><Link href="/login" className="hover:text-[#141613] transition-colors">Sign In</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-[#EAE6DC] flex flex-col sm:flex-row items-center justify-between gap-3 text-[#94998E] text-[11px]">
          <p>© {new Date().getFullYear()} AILIB. Discover the right AI for what you build.</p>
          <div className="flex items-center gap-4 text-[#73796E]">
            <span>Fast • Verified • Community Driven</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

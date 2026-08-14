import Link from 'next/link';
import { getTools, getCategories } from '@/lib/data';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ToolCard } from '@/components/tools/ToolCard';
import { CategoryCard } from '@/components/home/CategoryCard';
import {
  Sparkles,
  Search,
  TrendingUp,
  Star,
  Clock,
  Zap,
  PlusCircle,
  ArrowRight,
  ShieldCheck,
  Users,
  Compass,
} from 'lucide-react';

export const revalidate = 60; // Revalidate live database queries every 60 seconds

export default async function HomePage() {
  // Fetch real data from Supabase
  const [categories, trendingTools, topRatedTools, freeTools, recentTools] = await Promise.all([
    getCategories(),
    getTools({ trendingOnly: true, limit: 3 }),
    getTools({ sortBy: 'highest_rated', limit: 3 }),
    getTools({ pricing: 'free', limit: 3 }),
    getTools({ sortBy: 'newest', limit: 3 }),
  ]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-cyan-500 selection:text-slate-950">
      <Navbar />

      <main>
        {/* HERO SECTION */}
        <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 overflow-hidden border-b border-slate-900">
          {/* Subtle Ambient Background Gradients */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-to-tr from-cyan-500/10 via-blue-600/10 to-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-8">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs font-semibold text-cyan-400 shadow-xl backdrop-blur-md animate-fade-in">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Community-Powered AI Library</span>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            </div>

            {/* Main Headline */}
            <div className="max-w-4xl mx-auto space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-100 leading-[1.15]">
                Discover AI Tools That <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-400 bg-clip-text text-transparent">
                  Actually Help.
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
                Search, filter, explore, and discover AI tools shared by the community.
              </p>
            </div>

            {/* Primary Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                href="/tools"
                className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-cyan-500/20 hover:shadow-cyan-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <Compass className="w-4 h-4" />
                Explore AI Tools
              </Link>
              <Link
                href="/#submit"
                className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-100 font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <PlusCircle className="w-4 h-4 text-cyan-400" />
                + Add AI Tool
              </Link>
            </div>

            {/* Search Input Bar */}
            <div className="max-w-2xl mx-auto pt-4">
              <form action="/tools" method="GET" className="relative group">
                <input
                  type="text"
                  name="search"
                  placeholder="Search AI tools (e.g. 'writing assistant', 'image generator', 'open source')..."
                  className="w-full pl-12 pr-28 py-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/10 shadow-2xl transition-all"
                />
                <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-cyan-400 transition-colors" />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md transition-colors"
                >
                  Search
                </button>
              </form>
            </div>

            {/* Community Stats Bar */}
            <div className="pt-8 max-w-3xl mx-auto grid grid-cols-3 gap-4 border-t border-slate-900/80">
              <div className="flex flex-col items-center">
                <span className="text-xl sm:text-2xl font-extrabold text-slate-100">Live DB</span>
                <span className="text-xs text-slate-400">Verified AI Tools</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-xl sm:text-2xl font-extrabold text-cyan-400">5+</span>
                <span className="text-xs text-slate-400">Categories</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-xl sm:text-2xl font-extrabold text-indigo-400">100%</span>
                <span className="text-xs text-slate-400">Community Driven</span>
              </div>
            </div>
          </div>
        </section>

        {/* POPULAR CATEGORIES */}
        <section id="categories" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-100 tracking-tight flex items-center gap-2">
                Popular Categories
              </h2>
              <p className="text-xs text-slate-400 mt-1">Browse AI tools organized by feature and use case</p>
            </div>
            <Link href="/tools" className="text-xs font-semibold text-cyan-400 hover:underline flex items-center gap-1">
              View All Tools <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </section>

        {/* TRENDING AI TOOLS */}
        <section className="py-16 bg-slate-900/40 border-y border-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between gap-4 mb-8">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-100 tracking-tight">Trending AI Tools</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Most active and popular tools this week</p>
                </div>
              </div>
              <Link href="/tools?sort=trending" className="text-xs font-semibold text-cyan-400 hover:underline flex items-center gap-1">
                Explore Trending <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trendingTools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          </div>
        </section>

        {/* HIGHEST RATED & FREE TOOLS SECTION */}
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {/* Highest Rated */}
          <div>
            <div className="flex items-end justify-between gap-4 mb-8">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Star className="w-5 h-5 fill-amber-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-100 tracking-tight">Highest Rated AI Tools</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Voted top quality by user reviews</p>
                </div>
              </div>
              <Link href="/tools?sort=highest_rated" className="text-xs font-semibold text-cyan-400 hover:underline flex items-center gap-1">
                See All Top Rated <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {topRatedTools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          </div>

          {/* Free Tools */}
          <div>
            <div className="flex items-end justify-between gap-4 mb-8">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-100 tracking-tight">Free AI Tools</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Explore 100% free AI applications</p>
                </div>
              </div>
              <Link href="/tools?pricing=free" className="text-xs font-semibold text-cyan-400 hover:underline flex items-center gap-1">
                View All Free <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {freeTools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          </div>

          {/* Recently Added */}
          <div>
            <div className="flex items-end justify-between gap-4 mb-8">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-100 tracking-tight">Recently Added Tools</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Fresh AI releases submitted by creators</p>
                </div>
              </div>
              <Link href="/tools?sort=newest" className="text-xs font-semibold text-cyan-400 hover:underline flex items-center gap-1">
                View New Releases <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentTools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          </div>
        </section>

        {/* COMMUNITY CONTRIBUTION CTA BANNER */}
        <section id="submit" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl bg-gradient-to-r from-cyan-950/80 via-slate-900 to-indigo-950/80 border border-cyan-500/20 p-8 sm:p-12 overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-2xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5" />
                Creator Directory
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-100">
                Built an AI tool? Share it with thousands of developers & users.
              </h2>

              <p className="text-sm text-slate-400 leading-relaxed">
                Submit your AI project to our platform. Community members review, rate, and share feedback to help you grow your audience.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-4">
                <Link
                  href="/tools"
                  className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2"
                >
                  <PlusCircle className="w-4 h-4" />
                  Submit Tool for Moderation
                </Link>
                <span className="text-xs text-slate-400 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-slate-500" />
                  Free forever for indie makers
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

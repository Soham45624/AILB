import Link from 'next/link';
import { getTools, getCategories } from '@/lib/data';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ToolCard } from '@/components/tools/ToolCard';
import { CategoryCard } from '@/components/home/CategoryCard';
import {
  Search,
  ArrowRight,
  TrendingUp,
  Star,
  Zap,
  Plus,
} from 'lucide-react';

export const revalidate = 60;

export default async function HomePage() {
  const [categories, trendingTools, topRatedTools, freeTools] = await Promise.all([
    getCategories(),
    getTools({ trendingOnly: true, limit: 3 }),
    getTools({ sortBy: 'highest_rated', limit: 3 }),
    getTools({ pricing: 'free', limit: 3 }),
  ]);

  const quickTags = ['writing', 'image generator', 'coding', 'video', 'productivity', 'free'];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-zinc-100 selection:text-zinc-950 flex flex-col justify-between">
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative pt-20 pb-16 md:pt-28 md:pb-24 border-b border-zinc-900 bg-grid-pattern">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-8">
            {/* Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 font-medium animate-fade-in">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Independent Directory of Verified AI Tools</span>
            </div>

            {/* Title */}
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-[1.1]">
                Find AI tools that <br className="hidden sm:inline" />
                actually solve problems.
              </h1>
              <p className="text-sm sm:text-base text-zinc-400 max-w-xl mx-auto leading-relaxed">
                Discover, compare, and evaluate community-tested AI applications without marketing noise.
              </p>
            </div>

            {/* Search Box — input-interactive focus enhancement */}
            <div className="max-w-xl mx-auto">
              <form action="/tools" method="GET" className="relative group/searchbox">
                <input
                  type="text"
                  name="search"
                  placeholder="Search by keyword, use case, or tag..."
                  className="input-interactive w-full pl-11 pr-24 py-3.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-zinc-100 placeholder:text-zinc-500 shadow-lg"
                />
                <Search className="w-4 h-4 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <button
                  type="submit"
                  className="btn-interactive absolute right-2 top-1/2 -translate-y-1/2 px-3.5 py-1.5 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-xs"
                >
                  Search
                </button>
              </form>

              {/* Quick Tags — chip-interactive */}
              <div className="flex flex-wrap items-center justify-center gap-1.5 pt-3 text-xs">
                <span className="text-zinc-500 text-[11px] font-medium mr-1">Popular:</span>
                {quickTags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/tools?search=${encodeURIComponent(tag)}`}
                    className="chip-interactive px-2.5 py-0.5 rounded-md bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800/80 text-[11px]"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CATEGORIES SECTION */}
        <section id="categories" className="py-16 max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-baseline justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-zinc-100 tracking-tight">
                Explore by Category
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">Organized by core capabilities and workflow</p>
            </div>
            <Link
              href="/tools"
              className="btn-interactive text-xs font-semibold text-zinc-400 hover:text-white flex items-center gap-1"
            >
              Browse All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Category compact grid — chip-interactive feel */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {categories.slice(0, 12).map((category) => (
              <Link
                key={category.id}
                href={`/tools?category=${category.slug}`}
                className="chip-interactive p-3.5 rounded-xl bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800/70 hover:border-zinc-700 text-left space-y-1.5 group"
              >
                <div className="font-semibold text-xs text-zinc-200 group-hover:text-white truncate transition-colors">
                  {category.name}
                </div>
                <div className="text-[10px] text-zinc-500 font-mono group-hover:text-zinc-300 transition-colors">
                  Explore →
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* TRENDING SECTION */}
        <section className="py-14 border-t border-zinc-900 bg-zinc-900/20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="flex items-baseline justify-between gap-4 mb-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <h2 className="text-lg font-bold text-zinc-100 tracking-tight">Trending Tools</h2>
              </div>
              <Link
                href="/tools?sort=trending"
                className="btn-interactive text-xs font-semibold text-zinc-400 hover:text-white flex items-center gap-1"
              >
                View Trending <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {/* ToolCards use card-interactive internally */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {trendingTools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          </div>
        </section>

        {/* TOP RATED & FREE TOOLS */}
        <section className="py-14 border-t border-zinc-900 max-w-6xl mx-auto px-4 sm:px-6 space-y-14">
          {/* Highest Rated */}
          <div>
            <div className="flex items-baseline justify-between gap-4 mb-6">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-400" />
                <h2 className="text-lg font-bold text-zinc-100 tracking-tight">Top Community Rated</h2>
              </div>
              <Link
                href="/tools?sort=highest_rated"
                className="btn-interactive text-xs font-semibold text-zinc-400 hover:text-white flex items-center gap-1"
              >
                See All Top Rated <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {topRatedTools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          </div>

          {/* 100% Free Tools */}
          <div>
            <div className="flex items-baseline justify-between gap-4 mb-6">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-sky-400" />
                <h2 className="text-lg font-bold text-zinc-100 tracking-tight">100% Free Forever</h2>
              </div>
              <Link
                href="/tools?pricing=free"
                className="btn-interactive text-xs font-semibold text-zinc-400 hover:text-white flex items-center gap-1"
              >
                View Free Tools <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {freeTools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          </div>
        </section>

        {/* CREATOR CALLOUT */}
        <section className="py-16 border-t border-zinc-900 bg-zinc-900/30">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-4">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-100 tracking-tight">
              Built an AI tool? Put it in front of active users.
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-lg mx-auto leading-relaxed">
              Submit your AI application in under 2 minutes. Free forever for indie creators.
            </p>
            <div className="pt-2">
              <Link
                href="/submit"
                className="btn-interactive inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-xs shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>Submit AI Tool</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

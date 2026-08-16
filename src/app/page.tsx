import Link from 'next/link';
import { getTools, getCategories } from '@/lib/data';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ToolCard } from '@/components/tools/ToolCard';
import {
  Search,
  ArrowRight,
  Code2,
  Sparkles,
  Video,
  PenTool,
  FlaskConical,
  Briefcase,
  Music,
  Plus,
} from 'lucide-react';

export const revalidate = 60;

export default async function HomePage() {
  const [categories, trendingTools, recentTools] = await Promise.all([
    getCategories(),
    getTools({ trendingOnly: true, limit: 6 }),
    getTools({ sortBy: 'newest', limit: 6 }),
  ]);

  // Visual Category configuration matching Figma's popular categories
  const popularCategoryBadges = [
    {
      name: 'Coding',
      slug: 'coding',
      icon: Code2,
      color: 'text-[#1E7E34]',
      bg: 'bg-[#EDF7EE]',
      border: 'border-[#CCE8CD]',
    },
    {
      name: 'Image Generation',
      slug: 'image-generation',
      icon: Sparkles,
      color: 'text-[#6F42C1]',
      bg: 'bg-[#F4EFFD]',
      border: 'border-[#DECFF7]',
    },
    {
      name: 'Video',
      slug: 'video-generation',
      icon: Video,
      color: 'text-[#D73A49]',
      bg: 'bg-[#FDF0F2]',
      border: 'border-[#F8D2D7]',
    },
    {
      name: 'Writing',
      slug: 'writing',
      icon: PenTool,
      color: 'text-[#D96B27]',
      bg: 'bg-[#FDF3EB]',
      border: 'border-[#F8DCC8]',
    },
    {
      name: 'Research',
      slug: 'research',
      icon: FlaskConical,
      color: 'text-[#0366D6]',
      bg: 'bg-[#EEF5FD]',
      border: 'border-[#CDE0F9]',
    },
    {
      name: 'Productivity',
      slug: 'productivity',
      icon: Briefcase,
      color: 'text-[#5C42A6]',
      bg: 'bg-[#F3EFFB]',
      border: 'border-[#DDD2F5]',
    },
    {
      name: 'Audio',
      slug: 'audio',
      icon: Music,
      color: 'text-[#C66100]',
      bg: 'bg-[#FDF2E9]',
      border: 'border-[#F9DECA]',
    },
  ];

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#141613] flex flex-col justify-between selection:bg-[#ECE8DF] selection:text-[#141613]">
      <Navbar />

      <main className="flex-1">
        {/* =========================================================================
            HERO SECTION
           ========================================================================= */}
        <section className="relative pt-20 pb-16 md:pt-28 md:pb-24 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Main Editorial Serif Headline */}
            <div className="space-y-4">
              <h1 className="font-serif-heading text-4xl sm:text-6xl md:text-7xl font-normal tracking-tight text-[#141613] leading-[1.12]">
                Discover the right AI <br />
                for what you build.
              </h1>
              <p className="text-base sm:text-lg text-[#666B60] max-w-xl mx-auto leading-relaxed font-normal">
                Explore AI tools or tell AILIB what you&apos;re trying to accomplish.
              </p>
            </div>

            {/* Floating Search Bar */}
            <div className="max-w-2xl mx-auto">
              <form
                action="/tools"
                method="GET"
                className="relative flex items-center bg-white rounded-full p-2 border border-[#E2DDD2] shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:border-[#D0C9BA] transition-all"
              >
                <Search className="w-5 h-5 text-[#9FA59A] ml-4 shrink-0 pointer-events-none" />
                <input
                  type="text"
                  name="search"
                  placeholder="What are you trying to accomplish?"
                  className="w-full bg-transparent px-3.5 py-2.5 text-sm text-[#141613] placeholder:text-[#94998E] focus:outline-none"
                />
                <button
                  type="submit"
                  className="btn-interactive px-5 py-3 rounded-full bg-[#141613] hover:bg-[#2A2E27] text-white font-bold text-xs flex items-center gap-1.5 shrink-0 shadow-sm"
                >
                  <span>Find Tools</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>

              {/* Try prompt suggestions */}
              <div className="pt-3 text-xs text-[#73796E] font-medium flex items-center justify-center flex-wrap gap-1">
                <span>Try:</span>
                <Link
                  href="/tools?search=YouTube+videos"
                  className="text-[#555C50] hover:text-[#141613] hover:underline"
                >
                  &ldquo;I need an AI that creates YouTube videos...&rdquo;
                </Link>
                <span>or</span>
                <Link
                  href="/tools?search=coding+assistant"
                  className="text-[#555C50] hover:text-[#141613] hover:underline"
                >
                  &ldquo;Find a free coding assistant&rdquo;
                </Link>
              </div>
            </div>

            {/* Popular Categories Row */}
            <div className="pt-6 space-y-3.5">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#9FA59A]">
                Popular Categories
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2.5">
                {popularCategoryBadges.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <Link
                      key={cat.slug}
                      href={`/tools?category=${cat.slug}`}
                      className={`chip-interactive inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-white border border-[#E2DDD2] hover:border-[#D0C9BA] text-xs font-semibold text-[#141613] shadow-sm hover:shadow transition-all`}
                    >
                      <span className={`p-1 rounded-full ${cat.bg} ${cat.color}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </span>
                      <span>{cat.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            TRENDING TOOLS SECTION
           ========================================================================= */}
        <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between gap-4 mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-[#141613] tracking-tight">
              Trending Tools
            </h2>
            <Link
              href="/tools?sort=trending"
              className="text-xs font-semibold text-[#666B60] hover:text-[#141613] flex items-center gap-1 transition-colors"
            >
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trendingTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </section>

        {/* =========================================================================
            RECENTLY ADDED SECTION
           ========================================================================= */}
        <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between gap-4 mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-[#141613] tracking-tight">
              Recently Added
            </h2>
            <Link
              href="/tools?sort=newest"
              className="text-xs font-semibold text-[#666B60] hover:text-[#141613] flex items-center gap-1 transition-colors"
            >
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </section>

        {/* =========================================================================
            CREATOR CALLOUT SECTION
           ========================================================================= */}
        <section className="py-16 border-t border-[#EAE6DC] bg-white mt-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-4">
            <h2 className="font-serif-heading text-2xl sm:text-4xl text-[#141613] font-normal tracking-tight">
              Built an AI tool? Put it in front of active users.
            </h2>
            <p className="text-xs sm:text-sm text-[#666B60] max-w-lg mx-auto leading-relaxed">
              Submit your AI application to AILIB in under 2 minutes. Free forever for indie creators.
            </p>
            <div className="pt-2">
              <Link
                href="/submit"
                className="btn-interactive inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#141613] hover:bg-[#2A2E27] text-white font-bold text-xs shadow-md"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
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

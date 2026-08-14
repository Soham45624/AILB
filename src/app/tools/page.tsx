import { searchAiTools, getCategories, getTags } from '@/lib/data';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ToolGrid } from '@/components/tools/ToolGrid';
import { ToolFilterBar } from '@/components/tools/ToolFilterBar';
import { Sparkles, Database, Search, Cpu } from 'lucide-react';
import { SortOption } from '@/lib/types';

interface ToolsPageProps {
  searchParams: Promise<{
    search?: string;
    category?: string;
    pricing?: string;
    rating?: string;
    platform?: string;
    tags?: string;
    sort?: string;
  }>;
}

export const revalidate = 0; // Dynamic server rendering for realtime search & filters

export default async function ToolsPage({ searchParams }: ToolsPageProps) {
  const params = await searchParams;
  const search = params.search || '';
  const category = params.category || '';
  const pricingRaw = params.pricing || '';
  const pricingArray = pricingRaw ? pricingRaw.split(',').filter(Boolean) : [];
  const rating = params.rating ? Number(params.rating) : 0;
  const platformRaw = params.platform || '';
  const platformArray = platformRaw ? platformRaw.split(',').filter(Boolean) : [];
  const tagsRaw = params.tags || '';
  const tagsArray = tagsRaw ? tagsRaw.split(',').filter(Boolean) : [];
  const sort = (params.sort as SortOption) || (search ? 'relevant' : 'trending');

  const [categories, allTags, searchResult] = await Promise.all([
    getCategories(),
    getTags(),
    searchAiTools({
      searchQuery: search,
      categorySlug: category,
      pricingFilters: pricingArray,
      minRating: rating,
      platformFilters: platformArray,
      tagSlugs: tagsArray,
      sortBy: sort,
      limit: 60,
    }),
  ]);

  const { tools, totalCount } = searchResult;
  const activeCategoryObj = categories.find((c) => c.slug === category);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-cyan-500 selection:text-slate-950">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-8 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-wider">
            <Database className="w-3.5 h-3.5" />
            Supabase Live AI Library
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-100 tracking-tight">
            {search ? (
              <span>
                Search Results for &ldquo;<span className="text-cyan-400">{search}</span>&rdquo;
              </span>
            ) : activeCategoryObj ? (
              `${activeCategoryObj.name} AI Tools`
            ) : (
              'Discover & Filter AI Tools'
            )}
          </h1>

          <p className="text-sm text-slate-400 max-w-2xl">
            {activeCategoryObj?.description ||
              'Search across tool names, categories, tags, features, pricing models, platforms, and verified user ratings.'}
          </p>
        </div>

        {/* Filter Controls & Search */}
        <ToolFilterBar
          categories={categories}
          tags={allTags}
          initialSearch={search}
          initialCategory={category}
          initialPricing={pricingArray}
          initialRating={rating}
          initialPlatforms={platformArray}
          initialTags={tagsArray}
          initialSort={sort}
        />

        {/* Results Counter & Live Indicator */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-900 text-xs font-medium text-slate-400">
          <div className="flex items-center gap-2">
            <span>
              Showing <strong className="text-slate-100 font-bold">{tools.length}</strong>{' '}
              {tools.length === 1 ? 'tool' : 'tools'}
              {totalCount > tools.length && ` of ${totalCount} matching`}
            </span>
            {search && (
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px]">
                Ranked by relevance
              </span>
            )}
          </div>
          <span className="flex items-center gap-1.5 text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live Supabase Search
          </span>
        </div>

        {/* Tools Grid */}
        <ToolGrid tools={tools} />
      </main>

      <Footer />
    </div>
  );
}

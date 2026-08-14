import { searchAiTools, getCategories, getTags } from '@/lib/data';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ToolGrid } from '@/components/tools/ToolGrid';
import { ToolFilterBar } from '@/components/tools/ToolFilterBar';
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

export const revalidate = 0;

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
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-zinc-100 selection:text-zinc-950 flex flex-col justify-between">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 flex-1 w-full">
        {/* Header */}
        <div className="mb-6 space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-100 tracking-tight">
            {search ? (
              <span>
                Search results for &ldquo;{search}&rdquo;
              </span>
            ) : activeCategoryObj ? (
              `${activeCategoryObj.name} Tools`
            ) : (
              'Explore AI Tools'
            )}
          </h1>

          <p className="text-xs sm:text-sm text-zinc-400 max-w-xl">
            {activeCategoryObj?.description ||
              'Filter by capability, pricing, user evaluation, and supported platforms.'}
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

        {/* Results Counter */}
        <div className="flex items-center justify-between pb-3 mb-6 border-b border-zinc-900 text-xs font-medium text-zinc-400">
          <div className="flex items-center gap-2">
            <span>
              Showing <strong className="text-zinc-200">{tools.length}</strong>{' '}
              {tools.length === 1 ? 'tool' : 'tools'}
              {totalCount > tools.length && ` of ${totalCount}`}
            </span>
          </div>
          <span className="text-[11px] text-zinc-500 font-mono">
            Fast Index
          </span>
        </div>

        {/* Tools Grid */}
        <ToolGrid tools={tools} />
      </main>

      <Footer />
    </div>
  );
}

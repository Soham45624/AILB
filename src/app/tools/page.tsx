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
    <div className="min-h-screen bg-[#FBF9F5] text-[#141613] selection:bg-[#ECE8DF] selection:text-[#141613] flex flex-col justify-between">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 pb-24 md:pb-12 flex-1 w-full space-y-6">
        {/* Page Header */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#141613] tracking-tight">
            {search ? (
              <span>Search results for &ldquo;{search}&rdquo;</span>
            ) : activeCategoryObj ? (
              `${activeCategoryObj.name} Tools`
            ) : (
              'Explore AI Tools'
            )}
          </h1>
          <p className="text-xs sm:text-sm text-[#666B60] max-w-xl">
            {activeCategoryObj?.description ||
              'Discover and filter AI software applications across categories, pricing models, and ratings.'}
          </p>
        </div>

        {/* Filter Bar with Sidebar and Injected ToolGrid */}
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
          totalToolsCount={totalCount}
        >
          <ToolGrid tools={tools} />
        </ToolFilterBar>
      </main>

      <Footer />
    </div>
  );
}

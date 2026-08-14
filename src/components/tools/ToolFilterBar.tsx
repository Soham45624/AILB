'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, useTransition } from 'react';
import {
  Search,
  SlidersHorizontal,
  Star,
  X,
  Sparkles,
  ChevronDown,
  RotateCcw,
  Zap,
} from 'lucide-react';
import { Category, Tag, SortOption } from '@/lib/types';
import { FilterDrawer } from './FilterDrawer';
import { ActiveFilterChips } from './ActiveFilterChips';

interface ToolFilterBarProps {
  categories: Category[];
  tags: Tag[];
  initialSearch?: string;
  initialCategory?: string;
  initialPricing?: string[];
  initialRating?: number;
  initialPlatforms?: string[];
  initialTags?: string[];
  initialSort?: SortOption;
}

const QUICK_SUGGESTIONS = [
  'AI video generator',
  'free coding AI',
  'presentation maker',
  'image generator',
];

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'relevant', label: 'Most Relevant' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'highest_rated', label: 'Highest Rated' },
  { value: 'most_reviewed', label: 'Most Reviewed' },
  { value: 'newest', label: 'Recently Added' },
  { value: 'trending', label: 'Trending' },
  { value: 'most_saved', label: 'Most Saved' },
];

export function ToolFilterBar({
  categories,
  tags,
  initialSearch = '',
  initialCategory = '',
  initialPricing = [],
  initialRating = 0,
  initialPlatforms = [],
  initialTags = [],
  initialSort = 'relevant',
}: ToolFilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);
  const [pricing, setPricing] = useState<string[]>(initialPricing);
  const [rating, setRating] = useState<number>(initialRating);
  const [platforms, setPlatforms] = useState<string[]>(initialPlatforms);
  const [selectedTags, setSelectedTags] = useState<string[]>(initialTags);
  const [sort, setSort] = useState<SortOption>(initialSort);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Sync state with URL search params changes
  useEffect(() => {
    setSearch(searchParams.get('search') || '');
    setCategory(searchParams.get('category') || '');
    const pricingParam = searchParams.get('pricing');
    setPricing(pricingParam ? pricingParam.split(',').filter(Boolean) : []);
    const ratingParam = searchParams.get('rating');
    setRating(ratingParam ? Number(ratingParam) : 0);
    const platformParam = searchParams.get('platform');
    setPlatforms(platformParam ? platformParam.split(',').filter(Boolean) : []);
    const tagsParam = searchParams.get('tags');
    setSelectedTags(tagsParam ? tagsParam.split(',').filter(Boolean) : []);
    setSort((searchParams.get('sort') as SortOption) || 'relevant');
  }, [searchParams]);

  // Count active non-default filters for the filter drawer badge
  const activeFiltersCount =
    (pricing.length > 0 ? 1 : 0) +
    (rating > 0 ? 1 : 0) +
    (platforms.length > 0 ? 1 : 0) +
    (selectedTags.length > 0 ? 1 : 0) +
    (category ? 1 : 0);

  const updateFiltersInUrl = (overrides: {
    search?: string | null;
    category?: string | null;
    pricing?: string[] | null;
    rating?: number | null;
    platforms?: string[] | null;
    tags?: string[] | null;
    sort?: SortOption | null;
  }) => {
    const params = new URLSearchParams(searchParams.toString());

    // Search
    if ('search' in overrides) {
      if (overrides.search && overrides.search.trim()) {
        params.set('search', overrides.search.trim());
      } else {
        params.delete('search');
      }
    }

    // Category
    if ('category' in overrides) {
      if (overrides.category && overrides.category !== 'all') {
        params.set('category', overrides.category);
      } else {
        params.delete('category');
      }
    }

    // Pricing
    if ('pricing' in overrides) {
      if (overrides.pricing && overrides.pricing.length > 0) {
        params.set('pricing', overrides.pricing.join(','));
      } else {
        params.delete('pricing');
      }
    }

    // Rating
    if ('rating' in overrides) {
      if (overrides.rating && overrides.rating > 0) {
        params.set('rating', String(overrides.rating));
      } else {
        params.delete('rating');
      }
    }

    // Platforms
    if ('platforms' in overrides) {
      if (overrides.platforms && overrides.platforms.length > 0) {
        params.set('platform', overrides.platforms.join(','));
      } else {
        params.delete('platform');
      }
    }

    // Tags
    if ('tags' in overrides) {
      if (overrides.tags && overrides.tags.length > 0) {
        params.set('tags', overrides.tags.join(','));
      } else {
        params.delete('tags');
      }
    }

    // Sort
    if ('sort' in overrides) {
      if (overrides.sort && overrides.sort !== 'relevant') {
        params.set('sort', overrides.sort);
      } else {
        params.delete('sort');
      }
    }

    startTransition(() => {
      const queryString = params.toString();
      router.push(`/tools${queryString ? `?${queryString}` : ''}`);
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFiltersInUrl({ search });
  };

  const handleSuggestionClick = (query: string) => {
    setSearch(query);
    updateFiltersInUrl({ search: query });
  };

  const handleCategoryClick = (catSlug: string) => {
    const nextCat = category === catSlug ? null : catSlug;
    setCategory(nextCat || '');
    updateFiltersInUrl({ category: nextCat });
  };

  const handleQuickPricingToggle = (priceKey: string) => {
    let nextPricing: string[];
    if (pricing.includes(priceKey)) {
      nextPricing = pricing.filter((p) => p !== priceKey);
    } else {
      nextPricing = [...pricing, priceKey];
    }
    setPricing(nextPricing);
    updateFiltersInUrl({ pricing: nextPricing });
  };

  const handleClearAll = () => {
    setSearch('');
    setCategory('');
    setPricing([]);
    setRating(0);
    setPlatforms([]);
    setSelectedTags([]);
    setSort('relevant');
    startTransition(() => {
      router.push('/tools');
    });
  };

  return (
    <div className="space-y-4 mb-8">
      {/* Top Main Search & Controls Bar */}
      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        {/* Search Input Box */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search AI tools across name, features, tags, use cases (e.g. 'AI video generator')..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-24 py-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20 transition-all shadow-inner"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  updateFiltersInUrl({ search: null });
                }}
                className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="submit"
              className="px-3 py-1 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all shadow-sm"
            >
              Search
            </button>
          </div>
        </form>

        {/* Right Controls: Filter Drawer Button & Sort Selector */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Filter Drawer Trigger Button */}
          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-xs font-bold transition-all ${
              activeFiltersCount > 0
                ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300 shadow-md shadow-cyan-500/10'
                : 'bg-slate-900 border-slate-800 text-slate-200 hover:border-slate-700 hover:bg-slate-850'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>All Filters</span>
            {activeFiltersCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-cyan-500 text-slate-950 text-[10px] font-extrabold flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* Sort Selector Dropdown */}
          <div className="relative flex items-center px-3.5 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300">
            <span className="text-slate-500 mr-2 font-normal hidden sm:inline">Sort:</span>
            <select
              value={sort}
              onChange={(e) => {
                const newSort = e.target.value as SortOption;
                setSort(newSort);
                updateFiltersInUrl({ sort: newSort });
              }}
              className="bg-transparent text-slate-100 font-bold focus:outline-none cursor-pointer pr-5 appearance-none"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-slate-900 text-slate-200">
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Suggested Search Query Pills */}
      <div className="flex items-center gap-1.5 flex-wrap text-xs text-slate-400">
        <span className="flex items-center gap-1 text-[11px] font-medium text-slate-500 mr-1">
          <Sparkles className="w-3 h-3 text-cyan-400" />
          Try:
        </span>
        {QUICK_SUGGESTIONS.map((sug) => (
          <button
            key={sug}
            type="button"
            onClick={() => handleSuggestionClick(sug)}
            className={`px-2.5 py-1 rounded-lg text-xs transition-all border ${
              search.toLowerCase() === sug.toLowerCase()
                ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300 font-semibold'
                : 'bg-slate-900/80 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            &ldquo;{sug}&rdquo;
          </button>
        ))}
      </div>

      {/* Quick Category Carousel Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => {
            setCategory('');
            updateFiltersInUrl({ category: null });
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            !category
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/25'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700'
          }`}
        >
          All Categories
        </button>
        {categories.map((cat) => {
          const isSelected = category === cat.slug;
          return (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat.slug)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/25'
                  : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700'
              }`}
            >
              {cat.name}
              {cat.tool_count !== undefined && cat.tool_count > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isSelected
                      ? 'bg-slate-950/20 text-slate-950'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {cat.tool_count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Quick Pricing Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
        <span className="text-slate-500 font-medium shrink-0 mr-1">Pricing:</span>
        {[
          { key: 'free', label: 'Free' },
          { key: 'freemium', label: 'Freemium' },
          { key: 'free_trial', label: 'Free Trial' },
          { key: 'paid', label: 'Paid' },
        ].map((item) => {
          const isSelected = pricing.includes(item.key);
          return (
            <button
              key={item.key}
              onClick={() => handleQuickPricingToggle(item.key)}
              className={`px-3 py-1 rounded-lg font-semibold whitespace-nowrap transition-all border ${
                isSelected
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 shadow-sm'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Active Filter Chips with Remove and Reset */}
      <ActiveFilterChips
        search={search}
        category={category}
        pricing={pricing}
        rating={rating}
        platforms={platforms}
        tags={selectedTags}
        sort={sort}
        categories={categories}
        allTags={tags}
        onRemoveSearch={() => {
          setSearch('');
          updateFiltersInUrl({ search: null });
        }}
        onRemoveCategory={() => {
          setCategory('');
          updateFiltersInUrl({ category: null });
        }}
        onRemovePricing={(p) => {
          const next = pricing.filter((item) => item !== p);
          setPricing(next);
          updateFiltersInUrl({ pricing: next });
        }}
        onRemoveRating={() => {
          setRating(0);
          updateFiltersInUrl({ rating: 0 });
        }}
        onRemovePlatform={(plat) => {
          const next = platforms.filter((item) => item !== plat);
          setPlatforms(next);
          updateFiltersInUrl({ platforms: next });
        }}
        onRemoveTag={(tSlug) => {
          const next = selectedTags.filter((item) => item !== tSlug);
          setSelectedTags(next);
          updateFiltersInUrl({ tags: next });
        }}
        onClearAll={handleClearAll}
      />

      {/* Filter Drawer Dialog */}
      <FilterDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        categories={categories}
        tags={tags}
        selectedCategory={category}
        selectedPricing={pricing}
        selectedRating={rating}
        selectedPlatforms={platforms}
        selectedTags={selectedTags}
        onApplyFilters={(filters) => {
          setCategory(filters.category);
          setPricing(filters.pricing);
          setRating(filters.rating);
          setPlatforms(filters.platforms);
          setSelectedTags(filters.tags);
          updateFiltersInUrl({
            category: filters.category,
            pricing: filters.pricing,
            rating: filters.rating,
            platforms: filters.platforms,
            tags: filters.tags,
          });
        }}
        onResetFilters={handleClearAll}
      />
    </div>
  );
}

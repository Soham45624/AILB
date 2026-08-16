'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, useTransition } from 'react';
import {
  Search,
  SlidersHorizontal,
  ChevronDown,
  X,
  Check,
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
  totalToolsCount?: number;
  children?: React.ReactNode;
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'relevant', label: 'Most Relevant' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'highest_rated', label: 'Highest Rated' },
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
  totalToolsCount,
  children,
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

  const handleCategoryToggle = (catSlug: string) => {
    const nextCat = category === catSlug ? null : catSlug;
    setCategory(nextCat || '');
    updateFiltersInUrl({ category: nextCat });
  };

  const handlePricingToggle = (priceKey: string) => {
    let nextPricing: string[];
    if (pricing.includes(priceKey)) {
      nextPricing = pricing.filter((p) => p !== priceKey);
    } else {
      nextPricing = [...pricing, priceKey];
    }
    setPricing(nextPricing);
    updateFiltersInUrl({ pricing: nextPricing });
  };

  const handleRatingChange = (newRating: number) => {
    setRating(newRating);
    updateFiltersInUrl({ rating: newRating });
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

  const activeFiltersCount =
    (pricing.length > 0 ? 1 : 0) +
    (rating > 0 ? 1 : 0) +
    (platforms.length > 0 ? 1 : 0) +
    (selectedTags.length > 0 ? 1 : 0) +
    (category ? 1 : 0);

  return (
    <div className="space-y-6">
      {/* =========================================================================
          TOP SEARCH BAR & SORT SELECTOR (Figma Layout)
         ========================================================================= */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Search Input Container */}
        <form
          onSubmit={handleSearchSubmit}
          className="relative flex-1 flex items-center bg-white rounded-full px-4 py-2.5 border border-[#E2DDD2] shadow-sm hover:border-[#D0C9BA] transition-all"
        >
          {isPending ? (
            <div className="w-4 h-4 border-2 border-[#141613] border-t-transparent rounded-full animate-spin mr-3 shrink-0" />
          ) : (
            <Search className="w-4 h-4 text-[#9FA59A] mr-3 shrink-0 pointer-events-none" />
          )}
          <input
            type="text"
            placeholder="Search tools, categories, use cases..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-xs sm:text-sm text-[#141613] placeholder:text-[#94998E] focus:outline-none"
          />
          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                updateFiltersInUrl({ search: null });
              }}
              className="p-1 rounded-full text-[#9FA59A] hover:text-[#141613] transition-colors"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </form>

        {/* Right Controls: Sort selector & Mobile Filter Trigger */}
        <div className="flex items-center gap-2.5 shrink-0 justify-end">
          {/* Mobile Filter Button */}
          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            className={`lg:hidden flex items-center gap-1.5 px-4 py-2.5 rounded-full border text-xs font-bold transition-all shadow-sm ${
              activeFiltersCount > 0
                ? 'bg-[#EDF7EE] border-[#CCE8CD] text-[#1E7E34]'
                : 'bg-white border-[#E2DDD2] text-[#141613]'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-[#1E7E34] text-white text-[10px] flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* Sort Selector Dropdown */}
          <div className="relative flex items-center bg-white rounded-full px-4 py-2.5 border border-[#E2DDD2] text-xs font-medium text-[#141613] shadow-sm hover:border-[#D0C9BA] transition-colors">
            <select
              value={sort}
              onChange={(e) => {
                const newSort = e.target.value as SortOption;
                setSort(newSort);
                updateFiltersInUrl({ sort: newSort });
              }}
              className="bg-transparent text-[#141613] font-semibold focus:outline-none cursor-pointer pr-5 appearance-none"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#73796E] absolute right-3 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* =========================================================================
          MAIN 2-COLUMN LAYOUT: SIDEBAR + RESULTS
         ========================================================================= */}
      <div className="flex items-start gap-8">
        {/* LEFT SIDEBAR (Desktop) */}
        <aside className="hidden lg:block w-60 shrink-0 space-y-7 pt-1">
          {/* Category Filter Section */}
          <div className="space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#73796E]">
              Category
            </h3>
            <div className="space-y-2">
              {categories.map((cat) => {
                const isSelected = category === cat.slug;
                return (
                  <label
                    key={cat.id}
                    onClick={() => handleCategoryToggle(cat.slug)}
                    className="flex items-center gap-3 text-xs font-medium text-[#141613] cursor-pointer group select-none"
                  >
                    <div
                      className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                        isSelected
                          ? 'bg-[#141613] border-[#141613] text-white'
                          : 'bg-white border-[#D0C9BA] group-hover:border-[#141613]'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span className={`group-hover:text-black transition-colors ${isSelected ? 'font-bold' : ''}`}>
                      {cat.name}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Pricing Filter Section */}
          <div className="space-y-3 pt-4 border-t border-[#EAE6DC]">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#73796E]">
              Pricing
            </h3>
            <div className="space-y-2">
              {[
                { key: 'free', label: 'Free' },
                { key: 'freemium', label: 'Freemium' },
                { key: 'paid', label: 'Paid' },
              ].map((p) => {
                const isSelected = pricing.includes(p.key);
                return (
                  <label
                    key={p.key}
                    onClick={() => handlePricingToggle(p.key)}
                    className="flex items-center gap-3 text-xs font-medium text-[#141613] cursor-pointer group select-none"
                  >
                    <div
                      className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                        isSelected
                          ? 'bg-[#141613] border-[#141613] text-white'
                          : 'bg-white border-[#D0C9BA] group-hover:border-[#141613]'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span className={`group-hover:text-black transition-colors ${isSelected ? 'font-bold' : ''}`}>
                      {p.label}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Min Rating Radio Section */}
          <div className="space-y-3 pt-4 border-t border-[#EAE6DC]">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#73796E]">
              Min Rating
            </h3>
            <div className="space-y-2">
              {[
                { value: 0, label: 'All ratings' },
                { value: 4, label: '4+ stars' },
              ].map((r) => {
                const isSelected = rating === r.value;
                return (
                  <label
                    key={r.value}
                    onClick={() => handleRatingChange(r.value)}
                    className="flex items-center gap-3 text-xs font-medium text-[#141613] cursor-pointer group select-none"
                  >
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                        isSelected
                          ? 'border-[#5A7840]'
                          : 'border-[#D0C9BA] group-hover:border-[#141613]'
                      }`}
                    >
                      {isSelected && <span className="w-2 h-2 rounded-full bg-[#5A7840]" />}
                    </div>
                    <span className={`group-hover:text-black transition-colors ${isSelected ? 'font-bold text-[#141613]' : ''}`}>
                      {r.label}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        </aside>

        {/* RIGHT MAIN AREA */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Results Count Header & Active Filter Chips */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#73796E]">
              {totalToolsCount !== undefined ? `${totalToolsCount} tools found` : ''}
            </span>
          </div>

          {/* Active Filter Chips */}
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
            onRemoveTag={(tagSlug) => {
              const next = selectedTags.filter((item) => item !== tagSlug);
              setSelectedTags(next);
              updateFiltersInUrl({ tags: next });
            }}
            onClearAll={handleClearAll}
          />

          {/* Tool Cards Grid injected from page */}
          {children}
        </div>
      </div>

      {/* Mobile Filter Drawer */}
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
        onApplyFilters={(f) => {
          setCategory(f.category);
          setPricing(f.pricing);
          setRating(f.rating);
          setPlatforms(f.platforms);
          setSelectedTags(f.tags);
          updateFiltersInUrl({
            category: f.category || null,
            pricing: f.pricing,
            rating: f.rating,
            platforms: f.platforms,
            tags: f.tags,
          });
          setIsDrawerOpen(false);
        }}
        onResetFilters={handleClearAll}
      />
    </div>
  );
}

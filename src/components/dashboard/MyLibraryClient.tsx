'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import {
  Search,
  Library,
  Compass,
  Sparkles,
  SlidersHorizontal,
  X,
  ChevronDown,
} from 'lucide-react';
import { LibraryTool } from '@/app/actions/library';
import { Category, Tag } from '@/lib/types';
import { LibraryToolCard } from './LibraryToolCard';

interface MyLibraryClientProps {
  initialTools: LibraryTool[];
  categories: Category[];
  allTags: Tag[];
}

type SortOption = 'saved_desc' | 'created_desc' | 'rating_desc' | 'reviews_desc' | 'name_asc';

const SORT_LABELS: Record<SortOption, string> = {
  saved_desc: 'Recently Saved',
  created_desc: 'Recently Added',
  rating_desc: 'Highest Rated',
  reviews_desc: 'Most Reviewed',
  name_asc: 'A–Z',
};

const PRICING_OPTIONS = [
  { value: 'free', label: 'Free' },
  { value: 'freemium', label: 'Freemium' },
  { value: 'paid', label: 'Paid' },
  { value: 'free_trial', label: 'Free Trial' },
];

const RATING_OPTIONS = [
  { value: '4', label: '4+ Stars' },
  { value: '4.5', label: '4.5+ Stars' },
];

export function MyLibraryClient({ initialTools, categories }: MyLibraryClientProps) {
  const [tools, setTools] = useState<LibraryTool[]>(initialTools);
  const [, setRemovingIds] = useState<Set<string>>(new Set());

  // Search + Filters
  const [query, setQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterPricing, setFilterPricing] = useState<string>('');
  const [filterRating, setFilterRating] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('saved_desc');
  const [showFilters, setShowFilters] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  const activeFilterCount =
    (filterCategory ? 1 : 0) + (filterPricing ? 1 : 0) + (filterRating ? 1 : 0);

  const handleRemoved = useCallback(
    async (toolId: string) => {
      setRemovingIds((prev) => new Set(prev).add(toolId));
      await new Promise((r) => setTimeout(r, 220));
      setTools((prev) => prev.filter((t) => t.id !== toolId));
      setRemovingIds((prev) => {
        const next = new Set(prev);
        next.delete(toolId);
        return next;
      });
    },
    []
  );

  const displayedTools = useMemo(() => {
    let result = tools;

    // Text search
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          (t.description || '').toLowerCase().includes(q) ||
          (t.categories || []).some((c) => c.name.toLowerCase().includes(q)) ||
          (t.tags || []).some((tag) => tag.name.toLowerCase().includes(q))
      );
    }

    // Category filter
    if (filterCategory) {
      result = result.filter((t) =>
        (t.categories || []).some((c) => c.id === filterCategory)
      );
    }

    // Pricing filter
    if (filterPricing) {
      result = result.filter((t) => t.pricing === filterPricing);
    }

    // Rating filter
    if (filterRating) {
      const minRating = parseFloat(filterRating);
      result = result.filter((t) => t.avg_rating >= minRating);
    }

    // Sort
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case 'saved_desc':
          return new Date(b.saved_at).getTime() - new Date(a.saved_at).getTime();
        case 'created_desc':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'rating_desc':
          return b.avg_rating - a.avg_rating;
        case 'reviews_desc':
          return b.review_count - a.review_count;
        case 'name_asc':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return result;
  }, [tools, query, filterCategory, filterPricing, filterRating, sortBy]);

  const clearAllFilters = () => {
    setFilterCategory('');
    setFilterPricing('');
    setFilterRating('');
    setQuery('');
  };

  const isEmptyLibrary = tools.length === 0;
  const isEmptyResults = !isEmptyLibrary && displayedTools.length === 0;

  return (
    <div className="space-y-7 max-w-6xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EDF7EE] border border-[#CCE8CD] text-[#1E7E34] text-[11px] font-bold uppercase tracking-wider mb-2">
            <Library className="w-3.5 h-3.5" />
            Personal Collection
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#141613] tracking-tight">
            My Library
          </h1>
          <p className="text-xs sm:text-sm text-[#666B60] mt-1">
            {tools.length > 0 ? (
              <>
                Your saved AI tools, all in one place.{' '}
                <span className="text-[#9FA59A] text-xs">
                  ({tools.length} {tools.length === 1 ? 'tool' : 'tools'} saved)
                </span>
              </>
            ) : (
              'Your saved AI tools, all in one place.'
            )}
          </p>
        </div>
      </div>

      {/* Empty Library State */}
      {isEmptyLibrary && (
        <div className="py-20 flex flex-col items-center text-center space-y-5 bg-white border border-[#EAE6DC] rounded-3xl p-8 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-[#F5F3ED] text-[#73796E] flex items-center justify-center">
            <Library className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#141613]">Your library is empty.</h2>
            <p className="text-xs text-[#666B60] mt-1.5 max-w-sm leading-relaxed">
              Save AI tools you want to explore later and they&apos;ll appear here.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Link
              href="/tools"
              className="btn-interactive inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#141613] hover:bg-[#2A2E27] text-white font-bold text-xs transition-colors shadow-md"
            >
              <Compass className="w-4 h-4" />
              <span>Explore AI Tools</span>
            </Link>
            <Link
              href="/finder"
              className="btn-interactive inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white hover:bg-[#F5F3ED] border border-[#EAE6DC] text-[#141613] font-semibold text-xs transition-colors"
            >
              <Sparkles className="w-4 h-4 text-[#5A7840]" />
              <span>Try AI Finder</span>
            </Link>
          </div>
        </div>
      )}

      {/* Search + Filter + Sort bar */}
      {!isEmptyLibrary && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9FA59A] pointer-events-none" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search your library..."
                className="w-full pl-10 pr-4 py-2.5 rounded-full bg-white border border-[#E2DDD2] text-xs sm:text-sm text-[#141613] placeholder:text-[#94998E] focus:outline-none focus:border-[#141613] transition-colors shadow-sm"
              />
            </div>

            {/* Filter toggle */}
            <button
              onClick={() => setShowFilters((p) => !p)}
              className={`btn-interactive flex items-center gap-1.5 px-4 py-2.5 rounded-full border text-xs font-semibold transition-colors whitespace-nowrap shadow-sm ${
                showFilters || activeFilterCount > 0
                  ? 'bg-[#141613] border-[#141613] text-white'
                  : 'bg-white border-[#E2DDD2] text-[#141613] hover:bg-[#F5F3ED]'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-white text-[#141613] font-bold text-[10px] flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Sort */}
            <div className="relative">
              <button
                onClick={() => setSortOpen((p) => !p)}
                className="btn-interactive flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white border border-[#E2DDD2] text-xs font-semibold text-[#141613] hover:bg-[#F5F3ED] transition-colors whitespace-nowrap shadow-sm"
              >
                <span className="hidden sm:inline">{SORT_LABELS[sortBy]}</span>
                <span className="sm:hidden">Sort</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${sortOpen ? 'rotate-180' : ''}`} />
              </button>

              {sortOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setSortOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-44 rounded-2xl bg-white border border-[#EAE6DC] shadow-xl py-1 z-20 overflow-hidden">
                    {(Object.keys(SORT_LABELS) as SortOption[]).map((key) => (
                      <button
                        key={key}
                        onClick={() => {
                          setSortBy(key);
                          setSortOpen(false);
                        }}
                        className={`w-full px-3.5 py-2 text-left text-xs transition-colors ${
                          sortBy === key
                            ? 'bg-[#F5F3ED] text-[#141613] font-bold'
                            : 'text-[#666B60] hover:text-[#141613] hover:bg-[#FBF9F5]'
                        }`}
                      >
                        {SORT_LABELS[key]}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Filter Panel (Collapsible) */}
          {showFilters && (
            <div className="p-4 rounded-2xl bg-white border border-[#EAE6DC] shadow-sm space-y-4 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Category */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#73796E] mb-1">
                    Category
                  </label>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FBF9F5] border border-[#E2DDD2] text-xs text-[#141613] focus:outline-none focus:border-[#141613]"
                  >
                    <option value="">All Categories</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Pricing */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#73796E] mb-1">
                    Pricing
                  </label>
                  <select
                    value={filterPricing}
                    onChange={(e) => setFilterPricing(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FBF9F5] border border-[#E2DDD2] text-xs text-[#141613] focus:outline-none focus:border-[#141613]"
                  >
                    <option value="">All Pricing</option>
                    {PRICING_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Rating */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#73796E] mb-1">
                    Minimum Rating
                  </label>
                  <select
                    value={filterRating}
                    onChange={(e) => setFilterRating(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FBF9F5] border border-[#E2DDD2] text-xs text-[#141613] focus:outline-none focus:border-[#141613]"
                  >
                    <option value="">Any Rating</option>
                    {RATING_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {activeFilterCount > 0 && (
                <div className="flex justify-end pt-1">
                  <button
                    onClick={clearAllFilters}
                    className="text-xs font-bold text-[#D73A49] hover:underline flex items-center gap-1"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Clear Filters</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Empty Results State */}
      {isEmptyResults && (
        <div className="py-16 text-center bg-white border border-[#EAE6DC] rounded-3xl p-6 shadow-sm space-y-3">
          <p className="text-sm font-bold text-[#141613]">No tools match your active filters.</p>
          <button
            onClick={clearAllFilters}
            className="text-xs text-[#141613] font-bold hover:underline"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Tool Cards Grid */}
      {!isEmptyLibrary && displayedTools.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedTools.map((tool) => (
            <LibraryToolCard
              key={tool.id}
              tool={tool}
              onRemoved={handleRemoved}
            />
          ))}
        </div>
      )}
    </div>
  );
}

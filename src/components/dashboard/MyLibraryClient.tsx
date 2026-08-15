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
  // Tool list — client-side state for optimistic removes
  const [tools, setTools] = useState<LibraryTool[]>(initialTools);
  // Track IDs being removed so we can animate them
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

  // ── Optimistic remove ──────────────────────────────────────────────────────
  const handleRemoved = useCallback(
    async (toolId: string) => {
      // Mark as removing for animation
      setRemovingIds((prev) => new Set(prev).add(toolId));

      // Wait for CSS transition (200ms) then splice
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

  // ── Derived: filtered + sorted ──────────────────────────────────────────
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

  // ── Empty state ─────────────────────────────────────────────────────────
  const isEmptyLibrary = tools.length === 0;
  const isEmptyResults = !isEmptyLibrary && displayedTools.length === 0;

  return (
    <div className="space-y-7 max-w-6xl mx-auto animate-fade-in">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-800 border border-zinc-700/60 text-zinc-400 text-[11px] font-semibold uppercase tracking-wider mb-2">
            <Library className="w-3 h-3" />
            Personal Collection
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-100 tracking-tight">
            My Library
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            {tools.length > 0 ? (
              <>
                Your saved AI tools, all in one place.{' '}
                <span className="text-zinc-500 text-xs">
                  {tools.length} {tools.length === 1 ? 'tool' : 'tools'} saved
                </span>
              </>
            ) : (
              'Your saved AI tools, all in one place.'
            )}
          </p>
        </div>
      </div>

      {/* ── Empty Library State ── */}
      {isEmptyLibrary && (
        <div className="py-20 flex flex-col items-center text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
            <Library className="w-7 h-7 text-zinc-500" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-zinc-100">Your library is empty.</h2>
            <p className="text-sm text-zinc-400 mt-1.5 max-w-sm leading-relaxed">
              Save AI tools you want to explore later and they&apos;ll appear here.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Link
              href="/tools"
              className="btn-interactive inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-sm transition-colors"
            >
              <Compass className="w-4 h-4" />
              Explore AI Tools
            </Link>
            <Link
              href="/finder"
              className="btn-interactive inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-semibold text-sm transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              Try AILIB Finder
            </Link>
          </div>
        </div>
      )}

      {/* ── Search + Filter + Sort bar ── */}
      {!isEmptyLibrary && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search your library..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors"
              />
            </div>

            {/* Filter toggle */}
            <button
              onClick={() => setShowFilters((p) => !p)}
              className={`btn-interactive flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border text-sm font-semibold transition-colors whitespace-nowrap ${
                showFilters || activeFilterCount > 0
                  ? 'bg-zinc-800 border-zinc-600 text-zinc-100'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-zinc-100 text-zinc-950 font-bold">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Sort */}
            <div className="relative">
              <button
                onClick={() => setSortOpen((p) => !p)}
                className="btn-interactive flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm font-semibold text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors whitespace-nowrap"
              >
                <span className="hidden sm:inline">{SORT_LABELS[sortBy]}</span>
                <span className="sm:hidden">Sort</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${sortOpen ? 'rotate-180' : ''}`} />
              </button>

              {sortOpen && (
                <div className="absolute right-0 top-full mt-1 z-30 bg-zinc-900 border border-zinc-700 rounded-xl shadow-xl overflow-hidden w-44">
                  {(Object.entries(SORT_LABELS) as [SortOption, string][]).map(([val, label]) => (
                    <button
                      key={val}
                      onClick={() => {
                        setSortBy(val);
                        setSortOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-xs transition-colors ${
                        sortBy === val
                          ? 'text-zinc-100 bg-zinc-800 font-semibold'
                          : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Filters panel */}
          {showFilters && (
            <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Category */}
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                    Category
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {categories.slice(0, 8).map((c) => (
                      <button
                        key={c.id}
                        onClick={() =>
                          setFilterCategory((prev) => (prev === c.id ? '' : c.id))
                        }
                        className={`chip-interactive px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                          filterCategory === c.id
                            ? 'bg-zinc-200 text-zinc-950 border-zinc-300'
                            : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-zinc-200'
                        }`}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pricing */}
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                    Pricing
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {PRICING_OPTIONS.map((p) => (
                      <button
                        key={p.value}
                        onClick={() =>
                          setFilterPricing((prev) => (prev === p.value ? '' : p.value))
                        }
                        className={`chip-interactive px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                          filterPricing === p.value
                            ? 'bg-zinc-200 text-zinc-950 border-zinc-300'
                            : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-zinc-200'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Rating */}
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                    Rating
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {RATING_OPTIONS.map((r) => (
                      <button
                        key={r.value}
                        onClick={() =>
                          setFilterRating((prev) => (prev === r.value ? '' : r.value))
                        }
                        className={`chip-interactive px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                          filterRating === r.value
                            ? 'bg-zinc-200 text-zinc-950 border-zinc-300'
                            : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-zinc-200'
                        }`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {activeFilterCount > 0 && (
                <div className="pt-2 border-t border-zinc-800/60">
                  <button
                    onClick={clearAllFilters}
                    className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-1"
                  >
                    <X className="w-3 h-3" />
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Active filter chips */}
          {(query || activeFilterCount > 0) && (
            <div className="flex flex-wrap items-center gap-1.5">
              {query && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-300 text-xs border border-zinc-700">
                  &ldquo;{query}&rdquo;
                  <button onClick={() => setQuery('')} className="text-zinc-500 hover:text-zinc-200">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filterCategory && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-300 text-xs border border-zinc-700">
                  {categories.find((c) => c.id === filterCategory)?.name}
                  <button onClick={() => setFilterCategory('')} className="text-zinc-500 hover:text-zinc-200">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filterPricing && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-300 text-xs border border-zinc-700">
                  {PRICING_OPTIONS.find((p) => p.value === filterPricing)?.label}
                  <button onClick={() => setFilterPricing('')} className="text-zinc-500 hover:text-zinc-200">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filterRating && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-300 text-xs border border-zinc-700">
                  {RATING_OPTIONS.find((r) => r.value === filterRating)?.label}
                  <button onClick={() => setFilterRating('')} className="text-zinc-500 hover:text-zinc-200">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              <span className="text-xs text-zinc-600 ml-1">
                {displayedTools.length} result{displayedTools.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
      )}

      {/* ── No results from filters ── */}
      {isEmptyResults && (
        <div className="py-16 flex flex-col items-center text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
            <Search className="w-5 h-5 text-zinc-500" />
          </div>
          <div>
            <h3 className="text-base font-bold text-zinc-200">No matching tools</h3>
            <p className="text-xs text-zinc-400 mt-1">Try a different search or adjust your filters.</p>
          </div>
          <button
            onClick={clearAllFilters}
            className="btn-interactive px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-semibold text-sm transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* ── Tool Grid ── */}
      {!isEmptyLibrary && displayedTools.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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

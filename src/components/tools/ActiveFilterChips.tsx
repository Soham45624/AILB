'use client';

import { X, RotateCcw } from 'lucide-react';
import { Category, Tag } from '@/lib/types';

interface ActiveFilterChipsProps {
  search: string;
  category: string;
  pricing: string[];
  rating: number;
  platforms: string[];
  tags: string[];
  sort: string;
  categories: Category[];
  allTags: Tag[];
  onRemoveSearch: () => void;
  onRemoveCategory: () => void;
  onRemovePricing: (p: string) => void;
  onRemoveRating: () => void;
  onRemovePlatform: (plat: string) => void;
  onRemoveTag: (tagSlug: string) => void;
  onClearAll: () => void;
}

export function ActiveFilterChips({
  search,
  category,
  pricing,
  rating,
  platforms,
  tags,
  sort,
  categories,
  allTags,
  onRemoveSearch,
  onRemoveCategory,
  onRemovePricing,
  onRemoveRating,
  onRemovePlatform,
  onRemoveTag,
  onClearAll,
}: ActiveFilterChipsProps) {
  const activeCategory = categories.find((c) => c.slug === category);
  const tagMap = new Map(allTags.map((t) => [t.slug, t.name]));

  const hasActiveFilters =
    Boolean(search) ||
    Boolean(category) ||
    pricing.length > 0 ||
    rating > 0 ||
    platforms.length > 0 ||
    tags.length > 0;

  if (!hasActiveFilters) {
    return null;
  }

  const formatPricingLabel = (p: string) => {
    switch (p) {
      case 'free':
        return 'Free';
      case 'freemium':
        return 'Freemium';
      case 'free_trial':
        return 'Free Trial';
      case 'paid':
        return 'Paid';
      case 'contact':
        return 'Enterprise';
      default:
        return p;
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 pt-1 pb-2">
      <span className="text-xs font-semibold text-slate-400 mr-1">
        Active Filters:
      </span>

      {/* Search Chip */}
      {search && (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-medium animate-fade-in">
          Query: &ldquo;{search}&rdquo;
          <button
            onClick={onRemoveSearch}
            className="hover:bg-cyan-500/20 rounded p-0.5 transition-colors"
            title="Remove search filter"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      )}

      {/* Category Chip */}
      {category && (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-medium animate-fade-in">
          Category: {activeCategory?.name || category}
          <button
            onClick={onRemoveCategory}
            className="hover:bg-blue-500/20 rounded p-0.5 transition-colors"
            title="Remove category filter"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      )}

      {/* Pricing Chips */}
      {pricing.map((p) => (
        <span
          key={p}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium animate-fade-in"
        >
          Price: {formatPricingLabel(p)}
          <button
            onClick={() => onRemovePricing(p)}
            className="hover:bg-emerald-500/20 rounded p-0.5 transition-colors"
            title={`Remove ${p} pricing`}
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}

      {/* Rating Chip */}
      {rating > 0 && (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium animate-fade-in">
          Rating: {rating}+ ⭐
          <button
            onClick={onRemoveRating}
            className="hover:bg-amber-500/20 rounded p-0.5 transition-colors"
            title="Remove rating filter"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      )}

      {/* Platform Chips */}
      {platforms.map((plat) => (
        <span
          key={plat}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-medium animate-fade-in"
        >
          Platform: {plat}
          <button
            onClick={() => onRemovePlatform(plat)}
            className="hover:bg-purple-500/20 rounded p-0.5 transition-colors"
            title={`Remove ${plat} platform`}
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}

      {/* Tag Chips */}
      {tags.map((tSlug) => (
        <span
          key={tSlug}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-medium animate-fade-in"
        >
          Tag: {tagMap.get(tSlug) || tSlug}
          <button
            onClick={() => onRemoveTag(tSlug)}
            className="hover:bg-indigo-500/20 rounded p-0.5 transition-colors"
            title={`Remove tag ${tSlug}`}
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}

      {/* Clear All Filters Button */}
      <button
        onClick={onClearAll}
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors ml-1"
      >
        <RotateCcw className="w-3 h-3 text-slate-400" />
        Clear All Filters
      </button>
    </div>
  );
}

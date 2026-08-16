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
    <div className="flex flex-wrap items-center gap-2 pt-1 pb-4">
      <span className="text-xs font-semibold text-[#73796E] mr-1">
        Active Filters:
      </span>

      {/* Search Chip */}
      {search && (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#EAE6DC] text-[#141613] text-xs font-medium shadow-sm animate-fade-in">
          Query: &ldquo;{search}&rdquo;
          <button
            onClick={onRemoveSearch}
            className="hover:bg-[#F5F3ED] rounded-full p-0.5 transition-colors"
            title="Remove search filter"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      )}

      {/* Category Chip */}
      {category && (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EDF7EE] border border-[#CCE8CD] text-[#1E7E34] text-xs font-medium shadow-sm animate-fade-in">
          Category: {activeCategory?.name || category}
          <button
            onClick={onRemoveCategory}
            className="hover:bg-[#DDF0DE] rounded-full p-0.5 transition-colors"
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
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF3E6] border border-[#F0E2C8] text-[#6B5020] text-xs font-medium shadow-sm animate-fade-in"
        >
          Pricing: {formatPricingLabel(p)}
          <button
            onClick={() => onRemovePricing(p)}
            className="hover:bg-[#F2E5CE] rounded-full p-0.5 transition-colors"
            title={`Remove ${p} filter`}
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}

      {/* Rating Chip */}
      {rating > 0 && (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FEF6E9] border border-[#F9DEC2] text-[#8C4E05] text-xs font-medium shadow-sm animate-fade-in">
          Rating: {rating}+ Stars
          <button
            onClick={onRemoveRating}
            className="hover:bg-[#FCEAD0] rounded-full p-0.5 transition-colors"
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
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#EAE6DC] text-[#141613] text-xs font-medium shadow-sm animate-fade-in"
        >
          Platform: {plat}
          <button
            onClick={() => onRemovePlatform(plat)}
            className="hover:bg-[#F5F3ED] rounded-full p-0.5 transition-colors"
            title={`Remove ${plat} platform filter`}
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}

      {/* Tag Chips */}
      {tags.map((tagSlug) => (
        <span
          key={tagSlug}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F3EFFB] border border-[#DDD2F5] text-[#5C42A6] text-xs font-medium shadow-sm animate-fade-in"
        >
          #{tagMap.get(tagSlug) || tagSlug}
          <button
            onClick={() => onRemoveTag(tagSlug)}
            className="hover:bg-[#E4D9F5] rounded-full p-0.5 transition-colors"
            title={`Remove ${tagSlug} tag filter`}
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}

      {/* Clear All Action */}
      <button
        onClick={onClearAll}
        className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold text-[#D73A49] hover:bg-[#FDF0F2] border border-transparent hover:border-[#F8D2D7] transition-colors ml-auto"
      >
        <RotateCcw className="w-3 h-3" />
        <span>Clear All</span>
      </button>
    </div>
  );
}

'use client';

import { useState } from 'react';
import {
  X,
  SlidersHorizontal,
  Check,
  Star,
  RotateCcw,
} from 'lucide-react';
import { Category, Tag, PlatformType } from '@/lib/types';

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  tags: Tag[];
  selectedCategory: string;
  selectedPricing: string[];
  selectedRating: number;
  selectedPlatforms: string[];
  selectedTags: string[];
  onApplyFilters: (filters: {
    category: string;
    pricing: string[];
    rating: number;
    platforms: string[];
    tags: string[];
  }) => void;
  onResetFilters: () => void;
}

const ALL_PLATFORMS: { label: PlatformType }[] = [
  { label: 'Web' },
  { label: 'macOS' },
  { label: 'Windows' },
  { label: 'Linux' },
  { label: 'iOS' },
  { label: 'Android' },
  { label: 'API' },
];

const ALL_PRICING: { key: string; label: string; desc: string }[] = [
  { key: 'free', label: 'Free', desc: 'Completely free forever' },
  { key: 'freemium', label: 'Freemium', desc: 'Free plan with optional upgrades' },
  { key: 'free_trial', label: 'Free Trial', desc: 'Free trial period available' },
  { key: 'paid', label: 'Paid', desc: 'Paid subscription or license' },
];

const RATING_OPTIONS = [
  { value: 4.5, label: '4.5+ Stars', sub: 'Top Tier AI Tools' },
  { value: 4.0, label: '4.0+ Stars', sub: 'Highly Rated' },
  { value: 3.0, label: '3.0+ Stars', sub: 'Good Quality' },
  { value: 0, label: 'All Ratings', sub: 'Include New Submissions' },
];

export function FilterDrawer({
  isOpen,
  onClose,
  categories,
  tags,
  selectedCategory,
  selectedPricing,
  selectedRating,
  selectedPlatforms,
  selectedTags,
  onApplyFilters,
  onResetFilters,
}: FilterDrawerProps) {
  const [localCategory, setLocalCategory] = useState(selectedCategory);
  const [localPricing, setLocalPricing] = useState<string[]>(selectedPricing);
  const [localRating, setLocalRating] = useState<number>(selectedRating);
  const [localPlatforms, setLocalPlatforms] = useState<string[]>(selectedPlatforms);
  const [localTags, setLocalTags] = useState<string[]>(selectedTags);

  if (!isOpen) return null;

  const togglePricing = (key: string) => {
    if (localPricing.includes(key)) {
      setLocalPricing(localPricing.filter((p) => p !== key));
    } else {
      setLocalPricing([...localPricing, key]);
    }
  };

  const togglePlatform = (plat: string) => {
    if (localPlatforms.includes(plat)) {
      setLocalPlatforms(localPlatforms.filter((p) => p !== plat));
    } else {
      setLocalPlatforms([...localPlatforms, plat]);
    }
  };

  const toggleTag = (tagSlug: string) => {
    if (localTags.includes(tagSlug)) {
      setLocalTags(localTags.filter((t) => t !== tagSlug));
    } else {
      setLocalTags([...localTags, tagSlug]);
    }
  };

  const handleApply = () => {
    onApplyFilters({
      category: localCategory,
      pricing: localPricing,
      rating: localRating,
      platforms: localPlatforms,
      tags: localTags,
    });
    onClose();
  };

  const handleReset = () => {
    setLocalCategory('');
    setLocalPricing([]);
    setLocalRating(0);
    setLocalPlatforms([]);
    setLocalTags([]);
    onResetFilters();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over Drawer Panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FBF9F5] border-l border-[#EAE6DC] shadow-2xl flex flex-col justify-between overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="p-6 border-b border-[#EAE6DC] flex items-center justify-between bg-white">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-full bg-[#EDF7EE] text-[#1E7E34]">
                <SlidersHorizontal className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-[#141613]">
                  Filter AI Library
                </h2>
                <p className="text-xs text-[#73796E]">
                  Refine tools by category, pricing, and ratings
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full text-[#73796E] hover:text-[#141613] hover:bg-[#F5F3ED] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="p-6 overflow-y-auto space-y-7 flex-1">
            {/* Category Filter */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold uppercase tracking-wider text-[#73796E]">
                  Categories
                </label>
                {localCategory && (
                  <button
                    onClick={() => setLocalCategory('')}
                    className="text-[11px] text-[#1E7E34] hover:underline"
                  >
                    Reset
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {categories.map((cat) => {
                  const isSelected = localCategory === cat.slug;
                  return (
                    <button
                      type="button"
                      key={cat.id}
                      onClick={() => setLocalCategory(isSelected ? '' : cat.slug)}
                      className={`p-2.5 rounded-xl border text-left text-xs font-semibold transition-all ${
                        isSelected
                          ? 'bg-[#141613] border-[#141613] text-white'
                          : 'bg-white border-[#EAE6DC] text-[#141613] hover:border-[#D0C9BA]'
                      }`}
                    >
                      <div className="truncate">{cat.name}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Pricing Filter */}
            <div className="space-y-3 pt-4 border-t border-[#EAE6DC]">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold uppercase tracking-wider text-[#73796E]">
                  Pricing Model
                </label>
                {localPricing.length > 0 && (
                  <button
                    onClick={() => setLocalPricing([])}
                    className="text-[11px] text-[#1E7E34] hover:underline"
                  >
                    Reset
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 gap-2">
                {ALL_PRICING.map((item) => {
                  const isChecked = localPricing.includes(item.key);
                  return (
                    <button
                      type="button"
                      key={item.key}
                      onClick={() => togglePricing(item.key)}
                      className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                        isChecked
                          ? 'bg-white border-[#141613] text-[#141613] shadow-sm'
                          : 'bg-white border-[#EAE6DC] text-[#666B60] hover:border-[#D0C9BA]'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-bold text-[#141613]">
                          {item.label}
                        </div>
                        <div className="text-[11px] text-[#73796E]">
                          {item.desc}
                        </div>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${
                          isChecked
                            ? 'bg-[#141613] border-[#141613] text-white'
                            : 'border-[#D0C9BA] bg-white'
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Minimum Rating Filter */}
            <div className="space-y-3 pt-4 border-t border-[#EAE6DC]">
              <label className="text-xs font-extrabold uppercase tracking-wider text-[#73796E]">
                Minimum Rating
              </label>
              <div className="grid grid-cols-2 gap-2">
                {RATING_OPTIONS.map((opt) => {
                  const isSelected = localRating === opt.value;
                  return (
                    <button
                      type="button"
                      key={opt.value}
                      onClick={() => setLocalRating(opt.value)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'bg-[#FAF3E6] border-[#F0E2C8] text-[#6B5020]'
                          : 'bg-white border-[#EAE6DC] text-[#666B60] hover:border-[#D0C9BA]'
                      }`}
                    >
                      <div className="flex items-center gap-1 text-xs font-bold">
                        {opt.value > 0 && (
                          <Star className="w-3.5 h-3.5 fill-[#F5A623] text-[#F5A623]" />
                        )}
                        <span>{opt.label}</span>
                      </div>
                      <div className="text-[10px] text-[#73796E] truncate mt-0.5">
                        {opt.sub}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Platforms */}
            <div className="space-y-3 pt-4 border-t border-[#EAE6DC]">
              <label className="text-xs font-extrabold uppercase tracking-wider text-[#73796E]">
                Platforms
              </label>
              <div className="flex flex-wrap gap-1.5">
                {ALL_PLATFORMS.map((plat) => {
                  const isSelected = localPlatforms.includes(plat.label);
                  return (
                    <button
                      type="button"
                      key={plat.label}
                      onClick={() => togglePlatform(plat.label)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                        isSelected
                          ? 'bg-[#141613] border-[#141613] text-white'
                          : 'bg-white border-[#EAE6DC] text-[#666B60] hover:border-[#D0C9BA]'
                      }`}
                    >
                      {plat.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer Action Buttons */}
          <div className="p-6 border-t border-[#EAE6DC] bg-white flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-semibold text-[#73796E] hover:text-[#141613] hover:bg-[#F5F3ED] transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>

            <button
              type="button"
              onClick={handleApply}
              className="btn-interactive px-6 py-2.5 rounded-full bg-[#141613] hover:bg-[#2A2E27] text-white font-bold text-xs shadow-md"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

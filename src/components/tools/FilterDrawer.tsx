'use client';

import { useState } from 'react';
import {
  X,
  SlidersHorizontal,
  Check,
  Star,
  Globe,
  Tag as TagIcon,
  RotateCcw,
  Sparkles,
  Layers,
} from 'lucide-react';
import { Category, Tag, PlatformType, PricingType } from '@/lib/types';

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

const ALL_PLATFORMS: { label: PlatformType; icon?: string }[] = [
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
  { key: 'contact', label: 'Enterprise', desc: 'Custom enterprise pricing' },
];

const RATING_OPTIONS = [
  { value: 4.5, label: '4.5+ Stars', sub: 'Top Tier AI Tools' },
  { value: 4.0, label: '4.0+ Stars', sub: 'Highly Rated' },
  { value: 3.0, label: '3.0+ Stars', sub: 'Good Quality' },
  { value: 2.0, label: '2.0+ Stars', sub: 'Community Rated' },
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
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over Drawer Panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col justify-between overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                <SlidersHorizontal className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-100">
                  Filter AI Library
                </h2>
                <p className="text-xs text-slate-400">
                  Combine multi-criteria filters
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="p-6 overflow-y-auto space-y-7 flex-1">
            {/* Pricing Filter */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Pricing Model
                </label>
                {localPricing.length > 0 && (
                  <button
                    onClick={() => setLocalPricing([])}
                    className="text-[11px] text-cyan-400 hover:underline"
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
                          ? 'bg-cyan-500/10 border-cyan-500/40 text-slate-100 shadow-sm'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-bold text-slate-200">
                          {item.label}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {item.desc}
                        </div>
                      </div>
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                          isChecked
                            ? 'bg-cyan-500 border-cyan-500 text-slate-950'
                            : 'border-slate-700 bg-slate-900'
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
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
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
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-1 text-xs font-bold">
                        {opt.value > 0 && (
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        )}
                        <span>{opt.label}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 truncate mt-0.5">
                        {opt.sub}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Supported Platforms Filter */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Platforms & APIs
                </label>
                {localPlatforms.length > 0 && (
                  <button
                    onClick={() => setLocalPlatforms([])}
                    className="text-[11px] text-cyan-400 hover:underline"
                  >
                    Reset
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {ALL_PLATFORMS.map((plat) => {
                  const isChecked = localPlatforms.includes(plat.label);
                  return (
                    <button
                      type="button"
                      key={plat.label}
                      onClick={() => togglePlatform(plat.label)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                        isChecked
                          ? 'bg-purple-500/15 border-purple-500/40 text-purple-300 shadow-sm'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      <span>{plat.label}</span>
                      {isChecked && <Check className="w-3 h-3" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Multi-Select Tags Filter */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Popular Tags & Features
                </label>
                {localTags.length > 0 && (
                  <button
                    onClick={() => setLocalTags([])}
                    className="text-[11px] text-cyan-400 hover:underline"
                  >
                    Reset
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1">
                {tags.map((tag) => {
                  const isChecked = localTags.includes(tag.slug);
                  return (
                    <button
                      type="button"
                      key={tag.id}
                      onClick={() => toggleTag(tag.slug)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5 ${
                        isChecked
                          ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300 shadow-sm'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      <TagIcon className="w-2.5 h-2.5 text-slate-500" />
                      {tag.name}
                      {tag.tool_count !== undefined && (
                        <span className="text-[10px] text-slate-500">
                          ({tag.tool_count})
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Category Filter */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Primary Category
              </label>
              <select
                value={localCategory}
                onChange={(e) => setLocalCategory(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="">All 18 Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>
                    {c.name} {c.tool_count ? `(${c.tool_count})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-slate-800 bg-slate-950/50 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset All
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApply}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 text-xs font-bold shadow-lg shadow-cyan-500/20 transition-all hover:scale-105"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

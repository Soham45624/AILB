'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Star,
  Bookmark,
  ExternalLink,
  ArrowRight,
  Sparkles,
  Tag as TagIcon,
  Globe,
  Laptop,
  Smartphone,
  Cpu,
} from 'lucide-react';
import { Tool } from '@/lib/types';

interface ToolCardProps {
  tool: Tool;
}

export function ToolCard({ tool }: ToolCardProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [imageError, setImageError] = useState(false);

  const getPricingBadge = (pricing: string) => {
    switch (pricing) {
      case 'free':
        return {
          label: 'Free',
          classes: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        };
      case 'freemium':
        return {
          label: 'Freemium',
          classes: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
        };
      case 'free_trial':
        return {
          label: 'Free Trial',
          classes: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
        };
      case 'paid':
        return {
          label: 'Paid',
          classes: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        };
      case 'contact':
        return {
          label: 'Enterprise',
          classes: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        };
      default:
        return {
          label: pricing,
          classes: 'bg-slate-800 text-slate-400 border-slate-700',
        };
    }
  };

  const pricingInfo = getPricingBadge(tool.pricing);
  const mainCategory = tool.categories && tool.categories.length > 0 ? tool.categories[0] : null;

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800/80 hover:border-cyan-500/40 p-5 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/5 hover:-translate-y-1 overflow-hidden">
      {/* Background Accent Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl group-hover:bg-cyan-500/10 transition-colors pointer-events-none" />

      <div>
        {/* Header: Logo, Badges & Save Action */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-xl bg-slate-800 border border-slate-700/60 overflow-hidden flex items-center justify-center shrink-0 shadow-inner">
              {tool.logo_url && !imageError ? (
                <Image
                  src={tool.logo_url}
                  alt={tool.name}
                  width={48}
                  height={48}
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-tr from-slate-800 to-slate-700 flex items-center justify-center text-cyan-400 font-bold text-lg">
                  {tool.name.substring(0, 2).toUpperCase()}
                </div>
              )}
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2 flex-wrap">
                <Link
                  href={`/tools/${tool.slug}`}
                  className="font-bold text-slate-100 text-base group-hover:text-cyan-400 transition-colors line-clamp-1"
                >
                  {tool.name}
                </Link>
                {tool.featured && (
                  <span className="flex items-center gap-1 text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                    <Sparkles className="w-2.5 h-2.5" />
                    Featured
                  </span>
                )}
              </div>

              {mainCategory && (
                <span className="text-xs font-medium text-slate-400 hover:text-slate-300 transition-colors">
                  {mainCategory.name}
                </span>
              )}
            </div>
          </div>

          {/* Bookmark Button */}
          <button
            onClick={() => setIsSaved(!isSaved)}
            className={`p-2 rounded-xl border transition-all flex items-center gap-1.5 ${
              isSaved
                ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
            title={isSaved ? 'Saved to Favorites' : 'Save Tool'}
            aria-label="Save Tool"
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-cyan-400' : ''}`} />
            {tool.saved_count > 0 && (
              <span className="text-[11px] font-semibold">
                {isSaved ? tool.saved_count + 1 : tool.saved_count}
              </span>
            )}
          </button>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
          {tool.description || 'No description available for this AI tool.'}
        </p>

        {/* Platforms & Tags Bar */}
        <div className="flex flex-wrap items-center gap-1.5 mb-4">
          {/* Platforms */}
          {tool.platforms && tool.platforms.length > 0 && (
            <div className="flex items-center gap-1 mr-1">
              {tool.platforms.slice(0, 3).map((plat) => (
                <span
                  key={plat}
                  className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700/60"
                  title={`Supported platform: ${plat}`}
                >
                  {plat}
                </span>
              ))}
              {tool.platforms.length > 3 && (
                <span className="text-[10px] text-slate-500">
                  +{tool.platforms.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Tags */}
          {tool.tags && tool.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {tool.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag.id}
                  className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-950/80 text-slate-400 border border-slate-800/80 flex items-center gap-1"
                >
                  <TagIcon className="w-2.5 h-2.5 text-slate-500" />
                  {tag.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer Info & Actions */}
      <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between gap-2 mt-auto">
        <div className="flex items-center gap-2.5">
          {/* Rating */}
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="text-xs font-bold text-slate-200">
              {tool.avg_rating > 0 ? tool.avg_rating.toFixed(1) : 'New'}
            </span>
            <span className="text-[11px] text-slate-500">
              ({tool.review_count})
            </span>
          </div>

          {/* Pricing Badge */}
          <span
            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${pricingInfo.classes}`}
          >
            {pricingInfo.label}
          </span>
        </div>

        {/* View Overview Button */}
        <Link
          href={`/tools/${tool.slug}`}
          className="flex items-center gap-1 text-xs font-semibold text-cyan-400 group-hover:text-cyan-300 hover:underline transition-all"
        >
          View Overview
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
}

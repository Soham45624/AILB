'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Star,
  ExternalLink,
  Trash2,
  Upload,
  ArrowUpRight,
  Loader2,
} from 'lucide-react';
import { LibraryTool } from '@/app/actions/library';
import { removeFromLibraryAction } from '@/app/actions/library';

interface LibraryToolCardProps {
  tool: LibraryTool;
  onRemoved: (toolId: string) => void;
  onShare: (tool: LibraryTool) => void;
}

const PRICING_BADGE: Record<string, string> = {
  free: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  freemium: 'text-zinc-300 bg-zinc-800/80 border-zinc-700/60',
  free_trial: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
  paid: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  contact: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
};

export function LibraryToolCard({ tool, onRemoved, onShare }: LibraryToolCardProps) {
  const [imageError, setImageError] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [removeError, setRemoveError] = useState<string | null>(null);

  const mainCategory = tool.categories?.[0] ?? null;
  const pricingBadge = PRICING_BADGE[tool.pricing] ?? 'text-zinc-400 bg-zinc-900 border-zinc-800';

  const handleRemove = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Optimistic: immediately notify parent to animate card out
    setRemoving(true);
    setRemoveError(null);

    // Small delay so the CSS transition starts before the DOM node vanishes
    await new Promise((r) => setTimeout(r, 60));
    onRemoved(tool.id); // parent handles animation + splice

    const res = await removeFromLibraryAction(tool.id);
    if (!res.success) {
      // Rollback is handled by the parent restoring the tool to the list
      setRemoveError(res.error || 'Failed to remove');
      setRemoving(false);
    }
  };

  return (
    <div
      className={`
        card-interactive group relative flex flex-col rounded-[20px]
        bg-zinc-900/70 hover:bg-zinc-900 border border-zinc-800/70 hover:border-zinc-600/80
        p-5 hover:shadow-[0_6px_28px_-6px_rgba(0,0,0,0.65)]
        transition-opacity transition-transform
        ${removing ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'}
      `}
      style={{ transitionDuration: '200ms' }}
    >
      {/* Remove error banner */}
      {removeError && (
        <div className="absolute inset-x-3 top-2 z-20 px-3 py-1.5 rounded-lg bg-rose-500/20 border border-rose-500/30 text-rose-300 text-[11px] text-center">
          {removeError} — tool restored
        </div>
      )}

      {/* Top: Logo + Name + Category + Actions */}
      <div className="flex items-start gap-3 mb-3">
        {/* Logo */}
        <div className="w-11 h-11 rounded-xl bg-zinc-800 border border-zinc-700/60 overflow-hidden flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-[1.04]">
          {tool.logo_url && !imageError ? (
            <Image
              src={tool.logo_url}
              alt={tool.name}
              width={44}
              height={44}
              className="object-cover w-full h-full"
              onError={() => setImageError(true)}
            />
          ) : (
            <span className="text-zinc-200 font-bold text-sm">
              {tool.name.substring(0, 2).toUpperCase()}
            </span>
          )}
        </div>

        {/* Name + Category */}
        <div className="flex-1 min-w-0">
          <Link
            href={`/tools/${tool.slug}`}
            className="font-bold text-sm text-zinc-100 hover:text-white truncate block transition-colors"
          >
            {tool.name}
          </Link>
          {mainCategory && (
            <span className="text-[11px] text-zinc-500 truncate block mt-0.5">
              {mainCategory.name}
            </span>
          )}
        </div>

        {/* Quick actions — visible on hover */}
        <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {/* Share to AILIB */}
          <button
            onClick={(e) => {
              e.preventDefault();
              onShare(tool);
            }}
            title="Share to AILIB"
            className="btn-interactive p-1.5 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800"
          >
            <Upload className="w-3.5 h-3.5" />
          </button>

          {/* Remove from library */}
          <button
            onClick={handleRemove}
            disabled={removing}
            title="Remove from Library"
            className="btn-interactive p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10"
          >
            {removing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Trash2 className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed mb-3">
        {tool.description || 'No description provided.'}
      </p>

      {/* Tags */}
      {tool.tags && tool.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {tool.tags.slice(0, 3).map((tag) => (
            <span
              key={tag.id}
              className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-zinc-950 text-zinc-500 border border-zinc-800/80"
            >
              #{tag.name}
            </span>
          ))}
          {tool.tags.length > 3 && (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-zinc-950 text-zinc-600 border border-zinc-800/80">
              +{tool.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Bottom bar: Rating + Pricing */}
      <div className="mt-auto pt-3 border-t border-zinc-800/60 flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          {/* Rating */}
          <div className="flex items-center gap-1 text-zinc-300 font-medium">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{tool.avg_rating > 0 ? tool.avg_rating.toFixed(1) : 'New'}</span>
            {tool.review_count > 0 && (
              <span className="text-zinc-600 text-[11px]">({tool.review_count})</span>
            )}
          </div>

          {/* Pricing */}
          <span
            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${pricingBadge}`}
          >
            {tool.pricing.replace('_', ' ')}
          </span>
        </div>

        {/* CTA: Open tool */}
        <Link
          href={`/tools/${tool.slug}`}
          className="flex items-center gap-0.5 text-zinc-500 group-hover:text-zinc-200 font-semibold transition-colors text-[11px]"
        >
          <span>Open</span>
          <ArrowUpRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Full-card action bar — always visible at very bottom */}
      <div className="mt-3 flex items-center gap-2">
        <Link
          href={`/tools/${tool.slug}`}
          className="btn-interactive flex-1 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 font-semibold text-xs text-center transition-colors"
        >
          Open Tool
        </Link>
        <a
          href={tool.website_url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="btn-interactive flex-1 py-1.5 rounded-xl bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-700/60 text-zinc-400 hover:text-zinc-200 font-semibold text-xs text-center transition-colors flex items-center justify-center gap-1"
        >
          <ExternalLink className="w-3 h-3" />
          Website
        </a>
        <button
          onClick={(e) => {
            e.preventDefault();
            onShare(tool);
          }}
          className="btn-interactive py-1.5 px-3 rounded-xl bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-700/60 text-zinc-400 hover:text-zinc-200 font-semibold text-xs transition-colors flex items-center gap-1"
          title="Share to AILIB"
        >
          <Upload className="w-3 h-3" />
          <span className="hidden sm:inline">Share</span>
        </button>
        <button
          onClick={handleRemove}
          disabled={removing}
          className="btn-interactive p-1.5 rounded-xl bg-zinc-800/60 hover:bg-rose-500/10 hover:border-rose-500/30 border border-zinc-700/60 text-zinc-500 hover:text-rose-400 transition-colors"
          title="Remove from Library"
        >
          {removing ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Trash2 className="w-3.5 h-3.5" />
          )}
        </button>
      </div>
    </div>
  );
}

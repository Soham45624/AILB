'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Star,
  ExternalLink,
  Trash2,
  ArrowUpRight,
  Loader2,
} from 'lucide-react';
import { LibraryTool } from '@/app/actions/library';
import { removeFromLibraryAction } from '@/app/actions/library';
import { setToolSavedState } from '@/lib/savedToolsStore';

interface LibraryToolCardProps {
  tool: LibraryTool;
  onRemoved: (toolId: string) => void;
}

const BRAND_PALETTES = [
  { bg: 'bg-[#141613]', text: 'text-white' },
  { bg: 'bg-[#5A7840]', text: 'text-white' },
  { bg: 'bg-[#0366D6]', text: 'text-white' },
  { bg: 'bg-[#5C42A6]', text: 'text-white' },
  { bg: 'bg-[#D73A49]', text: 'text-white' },
  { bg: 'bg-[#D96B27]', text: 'text-white' },
];

function getMonogramPalette(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return BRAND_PALETTES[Math.abs(hash) % BRAND_PALETTES.length];
}

export function LibraryToolCard({ tool, onRemoved }: LibraryToolCardProps) {
  const router = useRouter();
  const [imageError, setImageError] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [removeError, setRemoveError] = useState<string | null>(null);

  const mainCategory = tool.categories?.[0] ?? null;
  const palette = getMonogramPalette(tool.name);

  const handleCardClick = () => {
    router.push(`/tools/${tool.slug}`);
  };

  const handleRemove = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setRemoving(true);
    setRemoveError(null);
    setToolSavedState(tool.id, false);

    await new Promise((r) => setTimeout(r, 60));
    onRemoved(tool.id);

    const res = await removeFromLibraryAction(tool.id);
    if (!res.success) {
      setToolSavedState(tool.id, true);
      setRemoveError(res.error || 'Failed to remove');
      setRemoving(false);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={`
        card-interactive group relative flex flex-col rounded-2xl
        bg-white hover:bg-white border border-[#EAE6DC] hover:border-[#D0C9BA]
        p-5 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] cursor-pointer
        transition-opacity transition-transform
        ${removing ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'}
      `}
      style={{ transitionDuration: '200ms' }}
    >
      {/* Remove error banner */}
      {removeError && (
        <div className="absolute inset-x-3 top-2 z-20 px-3 py-1.5 rounded-lg bg-[#FDF0F2] border border-[#F8D2D7] text-[#D73A49] text-[11px] text-center">
          {removeError} — tool restored
        </div>
      )}

      {/* Top: Logo + Name + Category + Actions */}
      <div className="flex items-start gap-3 mb-3">
        {/* Logo / Monogram */}
        <div
          className={`w-11 h-11 rounded-xl ${palette.bg} ${palette.text} overflow-hidden flex items-center justify-center shrink-0 shadow-sm transition-transform duration-200 group-hover:scale-[1.04]`}
        >
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
            <span className="font-extrabold text-sm tracking-tight">
              {tool.name.substring(0, 2).toUpperCase()}
            </span>
          )}
        </div>

        {/* Name + Category */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <h3 className="font-bold text-sm text-[#141613] group-hover:text-black transition-colors truncate">
              {tool.name}
            </h3>
            <ArrowUpRight className="w-3.5 h-3.5 text-[#9FA59A] group-hover:text-[#141613] transition-colors shrink-0" />
          </div>
          {mainCategory && (
            <p className="text-[11px] text-[#73796E] font-medium truncate mt-0.5">
              {mainCategory.name}
            </p>
          )}
        </div>

        {/* Remove Button */}
        <button
          type="button"
          onClick={handleRemove}
          disabled={removing}
          className="p-1.5 rounded-full text-[#9FA59A] hover:text-[#D73A49] hover:bg-[#FDF0F2] transition-colors shrink-0"
          title="Remove from Library"
          aria-label={`Remove ${tool.name} from library`}
        >
          {removing ? (
            <Loader2 className="w-4 h-4 animate-spin text-[#73796E]" />
          ) : (
            <Trash2 className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Description */}
      <p className="text-xs text-[#666B60] line-clamp-2 leading-relaxed mb-4 flex-1">
        {tool.description || 'No description available.'}
      </p>

      {/* Footer */}
      <div className="pt-3 border-t border-[#F2EFE8] flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1 text-[#141613] font-bold">
          <Star className="w-3.5 h-3.5 fill-[#F5A623] text-[#F5A623]" />
          <span>{tool.avg_rating > 0 ? tool.avg_rating.toFixed(1) : '4.5'}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="uppercase text-[10px] font-bold px-2 py-0.5 rounded bg-[#F5F3ED] text-[#666B60]">
            {tool.pricing}
          </span>

          <a
            href={tool.website_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="p-1 text-[#9FA59A] hover:text-[#141613] transition-colors"
            title="Visit Website"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}

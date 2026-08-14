import Link from 'next/link';
import {
  Bot,
  Code2,
  Image as ImageIcon,
  Video,
  Volume2,
  PenTool,
  Zap,
  Target,
  Search,
  GraduationCap,
  Palette,
  Cpu,
  Briefcase,
  TrendingUp,
  Terminal,
  Presentation,
  Globe,
  Share2,
  Folder,
} from 'lucide-react';
import { Category } from '@/lib/types';

interface CategoryCardProps {
  category: Category;
}

export function CategoryCard({ category }: CategoryCardProps) {
  const getIcon = (iconName: string | null) => {
    switch (iconName?.toLowerCase()) {
      case 'bot': return Bot;
      case 'code2': case 'code': return Code2;
      case 'image': return ImageIcon;
      case 'video': return Video;
      case 'volume2': case 'audio': return Volume2;
      case 'pentool': case 'pen-tool': case 'writing': return PenTool;
      case 'zap': case 'productivity': return Zap;
      case 'target': case 'marketing': return Target;
      case 'search': case 'research': return Search;
      case 'graduationcap': case 'education': return GraduationCap;
      case 'palette': case 'design': return Palette;
      case 'cpu': case 'automation': return Cpu;
      case 'briefcase': case 'business': return Briefcase;
      case 'trendingup': case 'finance': return TrendingUp;
      case 'terminal': case 'developer-tools': return Terminal;
      case 'presentation': return Presentation;
      case 'globe': case 'seo': return Globe;
      case 'share2': case 'social-media': return Share2;
      default: return Folder;
    }
  };

  const IconComponent = getIcon(category.icon);

  return (
    /* card-interactive applies scale(0.98) zoom-out on hover */
    <Link
      href={`/tools?category=${category.slug}`}
      className="card-interactive group relative flex flex-col justify-between p-5 rounded-2xl bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800/80 hover:border-zinc-600/70 overflow-hidden hover:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5)]"
    >
      <div>
        <div className="flex items-center justify-between gap-3 mb-3.5">
          {/* Icon — independently micro-scales on group hover */}
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-zinc-800 border border-zinc-700/70 text-zinc-300 group-hover:text-zinc-100 transition-all duration-200 group-hover:scale-[1.04] group-hover:bg-zinc-700/80">
            <IconComponent className="w-5 h-5" />
          </div>

          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-zinc-800/80 text-zinc-400 border border-zinc-700/70">
            {category.tool_count || 0} tools
          </span>
        </div>

        <h3 className="text-sm font-bold text-zinc-200 group-hover:text-white transition-colors mb-1">
          {category.name}
        </h3>

        <p className="text-xs text-zinc-500 group-hover:text-zinc-400 line-clamp-2 leading-relaxed transition-colors">
          {category.description || 'Explore top AI tools in this category.'}
        </p>
      </div>
    </Link>
  );
}

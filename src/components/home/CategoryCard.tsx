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
      case 'bot':
        return Bot;
      case 'code2':
      case 'code':
        return Code2;
      case 'image':
        return ImageIcon;
      case 'video':
        return Video;
      case 'volume2':
      case 'audio':
        return Volume2;
      case 'pentool':
      case 'pen-tool':
      case 'writing':
        return PenTool;
      case 'zap':
      case 'productivity':
        return Zap;
      case 'target':
      case 'marketing':
        return Target;
      case 'search':
      case 'research':
        return Search;
      case 'graduationcap':
      case 'education':
        return GraduationCap;
      case 'palette':
      case 'design':
        return Palette;
      case 'cpu':
      case 'automation':
        return Cpu;
      case 'briefcase':
      case 'business':
        return Briefcase;
      case 'trendingup':
      case 'finance':
        return TrendingUp;
      case 'terminal':
      case 'developer-tools':
        return Terminal;
      case 'presentation':
        return Presentation;
      case 'globe':
      case 'seo':
        return Globe;
      case 'share2':
      case 'social-media':
        return Share2;
      default:
        return Folder;
    }
  };

  const IconComponent = getIcon(category.icon);

  return (
    <Link
      href={`/tools?category=${category.slug}`}
      className="group relative flex flex-col justify-between p-5 rounded-2xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 hover:border-cyan-500/40 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/5 hover:-translate-y-1 overflow-hidden"
    >
      <div>
        <div className="flex items-center justify-between gap-3 mb-3.5">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 group-hover:bg-cyan-500 group-hover:text-slate-950 transition-colors shadow-inner">
            <IconComponent className="w-5 h-5" />
          </div>

          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
            {category.tool_count || 0} tools
          </span>
        </div>

        <h3 className="text-sm font-bold text-slate-100 group-hover:text-cyan-400 transition-colors mb-1">
          {category.name}
        </h3>

        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
          {category.description || 'Explore top AI tools in this category.'}
        </p>
      </div>
    </Link>
  );
}

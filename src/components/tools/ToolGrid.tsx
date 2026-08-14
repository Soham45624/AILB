import { Tool } from '@/lib/types';
import { ToolCard } from './ToolCard';
import { SearchX } from 'lucide-react';

interface ToolGridProps {
  tools: Tool[];
  emptyMessage?: string;
}

export function ToolGrid({ tools, emptyMessage = 'No AI tools found matching your criteria.' }: ToolGridProps) {
  if (tools.length === 0) {
    return (
      <div className="py-16 text-center rounded-2xl bg-slate-900/40 border border-slate-800/60 p-8">
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-slate-800/80 text-slate-400 flex items-center justify-center">
          <SearchX className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-200 mb-1">No Tools Found</h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {tools.map((tool) => (
        <ToolCard key={tool.id} tool={tool} />
      ))}
    </div>
  );
}

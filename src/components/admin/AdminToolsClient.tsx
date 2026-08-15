'use client';

import { useState } from 'react';
import {
  updateAdminToolAction,
  deleteAdminToolAction,
  toggleToolFeaturedAction,
  toggleToolTrendingAction,
} from '@/app/actions/admin';
import { Tool, Category, Tag, PlatformType } from '@/lib/types';
import {
  Search,
  Sparkles,
  TrendingUp,
  Edit,
  Trash2,
  ExternalLink,
  Star,
  Eye,
  MousePointerClick,
  Layers,
  X,
  Check,
  Globe,
} from 'lucide-react';
import Link from 'next/link';

interface AdminToolsClientProps {
  initialTools: any[];
  categories: Category[];
  tags: Tag[];
}

const ALL_PLATFORMS: PlatformType[] = ['Web', 'macOS', 'Windows', 'Linux', 'iOS', 'Android', 'API'];

export function AdminToolsClient({
  initialTools,
  categories,
  tags,
}: AdminToolsClientProps) {
  const [tools, setTools] = useState<any[]>(initialTools);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('');
  const [editingTool, setEditingTool] = useState<any | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const filtered = tools.filter((t) => {
    const cleanSearch = search.trim().toLowerCase();
    const numVal = cleanSearch.replace(/^#/, '');
    const matchesSearch =
      !search ||
      t.name.toLowerCase().includes(cleanSearch) ||
      (t.description && t.description.toLowerCase().includes(cleanSearch)) ||
      (t.tool_code && t.tool_code.toString() === numVal);
    const matchesCat =
      !selectedCat ||
      (t.categories && t.categories.some((c: any) => c.slug === selectedCat || c.id === selectedCat));
    return matchesSearch && matchesCat;
  });

  const handleToggleFeatured = async (tool: any) => {
    const newVal = !tool.featured;
    setTools((prev) => prev.map((t) => (t.id === tool.id ? { ...t, featured: newVal } : t)));
    await toggleToolFeaturedAction(tool.id, newVal);
  };

  const handleToggleTrending = async (tool: any) => {
    const newVal = !tool.trending;
    setTools((prev) => prev.map((t) => (t.id === tool.id ? { ...t, trending: newVal } : t)));
    await toggleToolTrendingAction(tool.id, newVal);
  };

  const handleDelete = async (tool: any) => {
    if (!confirm(`Are you sure you want to permanently delete "${tool.name}" from the directory?`)) {
      return;
    }
    setProcessingId(tool.id);
    const res = await deleteAdminToolAction(tool.id);
    if (res.success) {
      setTools((prev) => prev.filter((t) => t.id !== tool.id));
    } else {
      alert(`Delete failed: ${res.error}`);
    }
    setProcessingId(null);
  };

  const handleSaveToolEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTool) return;

    setProcessingId(editingTool.id);
    const res = await updateAdminToolAction(editingTool.id, editingTool);

    if (res.success) {
      setTools((prev) =>
        prev.map((t) => (t.id === editingTool.id ? { ...t, ...editingTool } : t))
      );
      setEditingTool(null);
    } else {
      alert(`Save failed: ${res.error}`);
    }
    setProcessingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tools by ID (#1001), name, description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/60"
          />
        </div>

        <select
          value={selectedCat}
          onChange={(e) => setSelectedCat(e.target.value)}
          className="px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/60"
        >
          <option value="">All Categories ({tools.length})</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Tools Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/80 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-800">
            <tr>
              <th className="py-3.5 px-4">Tool</th>
              <th className="py-3.5 px-4">Category & Pricing</th>
              <th className="py-3.5 px-4">Engagement</th>
              <th className="py-3.5 px-4 text-center">Featured</th>
              <th className="py-3.5 px-4 text-center">Trending</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-500">
                  No tools found matching your filters.
                </td>
              </tr>
            ) : (
              filtered.map((tool) => (
                <tr key={tool.id} className="hover:bg-slate-900/90 transition-colors">
                  {/* Name & URL */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold text-sm shrink-0">
                        {tool.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-slate-100 flex items-center gap-2">
                          <span className="text-[10px] font-mono text-cyan-400 font-extrabold bg-cyan-500/10 border border-cyan-500/20 px-1.5 py-0.5 rounded">
                            #{tool.tool_code || 'N/A'}
                          </span>
                          <span>{tool.name}</span>
                          <Link
                            href={`/tools/${tool.slug}`}
                            target="_blank"
                            className="text-slate-500 hover:text-cyan-400"
                            title="View Public Page"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono truncate max-w-[200px]">
                          {tool.website_url.replace(/^https?:\/\//, '')}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Category & Pricing */}
                  <td className="py-4 px-4">
                    <div className="space-y-1">
                      <div className="font-semibold text-slate-200">
                        {tool.categories?.[0]?.name || 'Uncategorized'}
                      </div>
                      <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.2 rounded bg-slate-800 text-slate-300">
                        {tool.pricing}
                      </span>
                    </div>
                  </td>

                  {/* Engagement (Views, Clicks, Rating) */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3 text-[11px] text-slate-400">
                      <div className="flex items-center gap-1" title="Views">
                        <Eye className="w-3 h-3 text-slate-500" />
                        <span>{tool.view_count || 0}</span>
                      </div>
                      <div className="flex items-center gap-1" title="Website Clicks">
                        <MousePointerClick className="w-3 h-3 text-slate-500" />
                        <span>{tool.click_count || 0}</span>
                      </div>
                      <div className="flex items-center gap-1" title="Rating">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span>{Number(tool.avg_rating || 0).toFixed(1)}</span>
                      </div>
                    </div>
                  </td>

                  {/* Featured Toggle */}
                  <td className="py-4 px-4 text-center">
                    <button
                      type="button"
                      onClick={() => handleToggleFeatured(tool)}
                      className={`p-1.5 rounded-lg border transition-all ${
                        tool.featured
                          ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                          : 'bg-slate-950 border-slate-800 text-slate-600 hover:text-slate-400'
                      }`}
                      title={tool.featured ? 'Featured on homepage' : 'Not featured'}
                    >
                      <Sparkles className="w-4 h-4" />
                    </button>
                  </td>

                  {/* Trending Toggle */}
                  <td className="py-4 px-4 text-center">
                    <button
                      type="button"
                      onClick={() => handleToggleTrending(tool)}
                      className={`p-1.5 rounded-lg border transition-all ${
                        tool.trending
                          ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400'
                          : 'bg-slate-950 border-slate-800 text-slate-600 hover:text-slate-400'
                      }`}
                      title={tool.trending ? 'Trending badge on' : 'Not trending'}
                    >
                      <TrendingUp className="w-4 h-4" />
                    </button>
                  </td>

                  {/* Actions (Edit / Delete) */}
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          setEditingTool({
                            ...tool,
                            categoryId: tool.categories?.[0]?.id || '',
                          })
                        }
                        className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-cyan-400 border border-slate-800 transition-colors"
                        title="Edit tool details"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(tool)}
                        disabled={processingId === tool.id}
                        className="p-1.5 rounded-lg bg-slate-950 hover:bg-rose-950/40 text-slate-500 hover:text-rose-400 border border-slate-800 hover:border-rose-500/30 transition-colors"
                        title="Delete tool"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* EDIT TOOL MODAL */}
      {editingTool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
          <form
            onSubmit={handleSaveToolEdit}
            className="w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4 my-8"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-slate-100">
                Edit Tool: {editingTool.name}
              </h3>
              <button
                type="button"
                onClick={() => setEditingTool(null)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Tool Name
                </label>
                <input
                  type="text"
                  required
                  value={editingTool.name}
                  onChange={(e) => setEditingTool({ ...editingTool, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Pricing
                </label>
                <select
                  value={editingTool.pricing}
                  onChange={(e) => setEditingTool({ ...editingTool, pricing: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100"
                >
                  <option value="free">Free</option>
                  <option value="freemium">Freemium</option>
                  <option value="free_trial">Free Trial</option>
                  <option value="paid">Paid</option>
                  <option value="contact">Contact</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                Website URL
              </label>
              <input
                type="url"
                required
                value={editingTool.website_url}
                onChange={(e) => setEditingTool({ ...editingTool, website_url: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                Primary Category
              </label>
              <select
                value={editingTool.categoryId}
                onChange={(e) => setEditingTool({ ...editingTool, categoryId: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                Description
              </label>
              <textarea
                rows={3}
                value={editingTool.description || ''}
                onChange={(e) => setEditingTool({ ...editingTool, description: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                Logo URL (Optional)
              </label>
              <input
                type="url"
                value={editingTool.logo_url || ''}
                onChange={(e) => setEditingTool({ ...editingTool, logo_url: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setEditingTool(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={processingId !== null}
                className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

import { getAdminMetricsAction } from '@/app/actions/admin';
import Link from 'next/link';
import {
  Layers,
  Send,
  Users,
  MessageSquare,
  Eye,
  MousePointerClick,
  AlertOctagon,
  Sparkles,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
} from 'lucide-react';

export const revalidate = 0;

export default async function AdminDashboardPage() {
  const { metrics } = await getAdminMetricsAction();

  const cards = [
    {
      title: 'Total Catalog Tools',
      value: metrics?.totalTools || 0,
      icon: Layers,
      color: 'from-cyan-500/20 to-blue-500/20 text-cyan-400 border-cyan-500/30',
      href: '/admin/tools',
      sub: 'Approved and live tools',
    },
    {
      title: 'Pending Submissions',
      value: metrics?.pendingSubmissions || 0,
      icon: Send,
      color: 'from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30',
      href: '/admin/submissions',
      sub: `${metrics?.changesRequestedSubmissions || 0} changes requested`,
      highlight: (metrics?.pendingSubmissions || 0) > 0,
    },
    {
      title: 'Total Registered Users',
      value: metrics?.totalUsers || 0,
      icon: Users,
      color: 'from-purple-500/20 to-indigo-500/20 text-purple-400 border-purple-500/30',
      href: '/admin/users',
      sub: 'Community members',
    },
    {
      title: 'Community Reviews',
      value: metrics?.totalReviews || 0,
      icon: MessageSquare,
      color: 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30',
      href: '/admin/reviews',
      sub: 'Ratings & evaluations',
    },
    {
      title: 'Tool Directory Views',
      value: (metrics?.totalViews || 0).toLocaleString(),
      icon: Eye,
      color: 'from-blue-500/20 to-indigo-500/20 text-blue-400 border-blue-500/30',
      href: '/admin/tools',
      sub: 'Total tool impressions',
    },
    {
      title: 'External Website Clicks',
      value: (metrics?.totalClicks || 0).toLocaleString(),
      icon: MousePointerClick,
      color: 'from-pink-500/20 to-rose-500/20 text-pink-400 border-pink-500/30',
      href: '/admin/tools',
      sub: 'Outbound traffic driven',
    },
    {
      title: 'Open Reports Queue',
      value: metrics?.openReports || 0,
      icon: AlertOctagon,
      color: 'from-rose-500/20 to-red-500/20 text-rose-400 border-rose-500/30',
      href: '/admin/reports',
      sub: 'Awaiting moderation',
      highlight: (metrics?.openReports || 0) > 0,
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2 z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Executive Overview
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
            Platform Analytics & Health
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
            Live telemetry, community submission pipelines, directory catalog metrics, and governance queues.
          </p>
        </div>

        {/* Quick Shortcut Buttons */}
        <div className="flex items-center gap-2.5 z-10 flex-wrap">
          <Link
            href="/admin/submissions"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            Review Submissions ({metrics?.pendingSubmissions || 0})
          </Link>
          <Link
            href="/admin/tools"
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors flex items-center gap-1.5 border border-slate-700"
          >
            <Layers className="w-3.5 h-3.5" /> Manage Tools
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div>
        <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-cyan-400" /> Key Performance Indicators
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((c) => {
            const Icon = c.icon;
            return (
              <Link
                key={c.title}
                href={c.href}
                className={`p-5 rounded-2xl bg-slate-900/80 border transition-all hover:scale-[1.02] active:scale-[0.99] group space-y-3 ${
                  c.highlight
                    ? 'border-amber-500/40 shadow-lg shadow-amber-500/5'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    {c.title}
                  </span>
                  <div className={`p-2 rounded-xl bg-gradient-to-tr border ${c.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>

                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-slate-100 group-hover:text-cyan-400 transition-colors">
                    {c.value}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{c.sub}</div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 group-hover:text-slate-200">
                  <span>Manage in portal</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

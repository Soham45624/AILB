'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Send,
  SlidersHorizontal,
  MessageSquare,
  Users,
  AlertOctagon,
  Sparkles,
  ExternalLink,
  Shield,
} from 'lucide-react';
import { UserRole } from '@/lib/types';

interface AdminSidebarProps {
  userRole: UserRole;
  username: string;
}

export function AdminSidebar({ userRole, username }: AdminSidebarProps) {
  const pathname = usePathname();

  const navItems = [
    {
      name: 'Overview',
      href: '/admin',
      icon: LayoutDashboard,
      exact: true,
    },
    {
      name: 'Submissions Queue',
      href: '/admin/submissions',
      icon: Send,
    },
    {
      name: 'Tool Management',
      href: '/admin/tools',
      icon: SlidersHorizontal,
    },
    {
      name: 'Review Moderation',
      href: '/admin/reviews',
      icon: MessageSquare,
    },
    {
      name: 'User Management',
      href: '/admin/users',
      icon: Users,
      adminOnly: true,
    },
    {
      name: 'Reports Queue',
      href: '/admin/reports',
      icon: AlertOctagon,
    },
  ];

  return (
    <aside className="w-full md:w-64 bg-slate-900/95 border-b md:border-b-0 md:border-r border-slate-800/80 p-4 sm:p-6 flex flex-col justify-between shrink-0">
      <div className="space-y-6">
        {/* Brand */}
        <Link href="/admin" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-base text-slate-100 tracking-tight flex items-center gap-1.5">
              Admin Portal
            </span>
            <span className="text-[10px] text-slate-400 block -mt-0.5">
              AI Discovery Platform
            </span>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            if (item.adminOnly && userRole !== 'admin') return null;

            const Icon = item.icon;
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer / System Status */}
      <div className="pt-6 border-t border-slate-800/80 space-y-3 hidden md:block">
        <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-850 space-y-1 text-[11px]">
          <div className="flex items-center justify-between text-slate-400">
            <span>Role:</span>
            <span className="font-bold text-cyan-400 uppercase">{userRole}</span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span>Security:</span>
            <span className="font-bold text-emerald-400">RLS Active</span>
          </div>
        </div>

        <Link
          href="/tools"
          target="_blank"
          className="flex items-center justify-center gap-1.5 text-xs text-slate-400 hover:text-cyan-400 py-1 font-medium transition-colors"
        >
          <span>Explore Public Catalog</span>
          <ExternalLink className="w-3 h-3" />
        </Link>
      </div>
    </aside>
  );
}

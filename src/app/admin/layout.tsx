import { redirect } from 'next/navigation';
import { verifyAdminOrEditor } from '@/app/actions/admin';
import Link from 'next/link';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { ShieldCheck, ArrowLeft, User, Sparkles } from 'lucide-react';

export const revalidate = 0;

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await verifyAdminOrEditor();

  if (!auth) {
    redirect('/login?error=unauthorized_admin&redirect=/admin');
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row selection:bg-cyan-500 selection:text-slate-950">
      {/* Admin Sidebar */}
      <AdminSidebar userRole={auth.role} username={auth.username} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Admin Top Header */}
        <header className="sticky top-0 z-40 h-16 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800/80 px-4 sm:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-100">Control Center</span>
                <span
                  className={`text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full border ${
                    auth.role === 'superadmin'
                      ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                      : auth.role === 'admin'
                      ? 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                      : 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300'
                  }`}
                >
                  {auth.role === 'superadmin' ? '👑 superadmin' : auth.role}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Secure moderation, catalog curation, and user governance
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Public Site</span>
            </Link>

            <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-slate-800">
              <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-bold text-xs flex items-center justify-center">
                {auth.username.substring(0, 2).toUpperCase()}
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-slate-200">{auth.username}</div>
                <div className="text-[10px] text-slate-500">{auth.email}</div>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Admin Page Body */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}

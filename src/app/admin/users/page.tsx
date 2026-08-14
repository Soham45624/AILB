import { getAdminUsersAction, verifyAdminOrEditor } from '@/app/actions/admin';
import { AdminUsersClient } from '@/components/admin/AdminUsersClient';
import { Users, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export const revalidate = 0;

export default async function AdminUsersPage() {
  const auth = await verifyAdminOrEditor('admin');

  if (!auth) {
    return (
      <div className="p-12 text-center rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4 max-w-lg mx-auto">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-100">Administrator Privileges Required</h2>
        <p className="text-xs text-slate-400">
          User management and role governance requires the <strong className="text-rose-400">ADMIN</strong> role. Your current role is <strong className="text-cyan-400">EDITOR</strong>.
        </p>
        <Link
          href="/admin"
          className="inline-block px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-200 hover:bg-slate-700"
        >
          Return to Admin Overview
        </Link>
      </div>
    );
  }

  const { users } = await getAdminUsersAction();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-900">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Users className="w-3.5 h-3.5" /> User Governance
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
            User Management & Roles
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Assign platform roles (USER, EDITOR, ADMIN), audit user activity, and suspend malicious accounts.
          </p>
        </div>
      </div>

      <AdminUsersClient initialUsers={users || []} />
    </div>
  );
}

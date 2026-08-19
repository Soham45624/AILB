'use client';

import { useState } from 'react';
import {
  updateUserRoleAction,
  toggleUserSuspensionAction,
  deleteUserAction,
} from '@/app/actions/admin';
import { UserRole } from '@/lib/types';
import {
  Search,
  Shield,
  ShieldAlert,
  UserX,
  UserCheck,
  Send,
  Calendar,
  User,
  Trash2,
  Lock,
} from 'lucide-react';

interface AdminUsersClientProps {
  initialUsers: any[];
  currentUserRole?: UserRole;
}

export function AdminUsersClient({ initialUsers, currentUserRole = 'admin' }: AdminUsersClientProps) {
  const [users, setUsers] = useState<any[]>(initialUsers);
  const [search, setSearch] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const isSuperAdmin = currentUserRole === 'superadmin';

  const filtered = users.filter((u) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (u.username && u.username.toLowerCase().includes(q)) ||
      (u.display_name && u.display_name.toLowerCase().includes(q))
    );
  });

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    setProcessingId(userId);
    const res = await updateUserRoleAction(userId, newRole);
    if (res.success) {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
    } else {
      alert(`Role change failed: ${res.error}`);
    }
    setProcessingId(null);
  };

  const handleToggleSuspend = async (user: any) => {
    const nextState = !user.is_suspended;
    const actionName = nextState ? 'suspend' : 'reinstate';

    if (!confirm(`Are you sure you want to ${actionName} account @${user.username}?`)) {
      return;
    }

    setProcessingId(user.id);
    const res = await toggleUserSuspensionAction(user.id, nextState);
    if (res.success) {
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, is_suspended: nextState } : u))
      );
    } else {
      alert(`Suspension toggle failed: ${res.error}`);
    }
    setProcessingId(null);
  };

  const handleDeleteUser = async (user: any) => {
    const confirmMessage = `WARNING: Are you sure you want to PERMANENTLY delete user @${user.username} (${user.email || 'no email'})?\n\nThis will remove their profile and login account. This action cannot be undone.`;
    if (!confirm(confirmMessage)) {
      return;
    }

    // Double confirmation for safety
    if (!confirm(`Please confirm once more to delete @${user.username}.`)) {
      return;
    }

    setProcessingId(user.id);
    const res = await deleteUserAction(user.id);
    if (res.success) {
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
    } else {
      alert(`User deletion failed: ${res.error}`);
    }
    setProcessingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search by username or display name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/60"
        />
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/80 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-800">
            <tr>
              <th className="py-3.5 px-4">User</th>
              <th className="py-3.5 px-4">Role</th>
              <th className="py-3.5 px-4">Submissions</th>
              <th className="py-3.5 px-4">Joined Date</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-500">
                  No users found matching query.
                </td>
              </tr>
            ) : (
              filtered.map((u) => {
                const isProcessing = processingId === u.id;

                return (
                  <tr key={u.id} className="hover:bg-slate-900/90 transition-colors">
                    {/* User Profile Info */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-indigo-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold text-sm">
                          {(u.display_name || u.username || 'U').substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-slate-100 flex items-center gap-1.5">
                            <span>{u.display_name || u.username}</span>
                          </div>
                          <div className="text-[11px] text-slate-500">@{u.username}</div>
                        </div>
                      </div>
                    </td>

                    {/* Role Dropdown */}
                    <td className="py-4 px-4">
                      <select
                        value={u.role || 'user'}
                        disabled={isProcessing || !isSuperAdmin}
                        onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                        title={!isSuperAdmin ? 'Only SuperAdmin can change user roles' : undefined}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider border focus:outline-none transition-colors ${
                          !isSuperAdmin ? 'cursor-not-allowed opacity-90' : 'cursor-pointer'
                        } ${
                          u.role === 'superadmin'
                            ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                            : u.role === 'admin'
                            ? 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                            : u.role === 'editor'
                            ? 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300'
                            : 'bg-slate-950 border-slate-800 text-slate-300'
                        }`}
                      >
                        <option value="user">USER</option>
                        <option value="editor">EDITOR</option>
                        <option value="admin">ADMIN</option>
                        <option value="superadmin">SUPERADMIN</option>
                      </select>
                    </td>

                    {/* Submissions count */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <Send className="w-3.5 h-3.5 text-slate-500" />
                        <span>{u.submission_count || 0}</span>
                      </div>
                    </td>

                    {/* Joined Date */}
                    <td className="py-4 px-4 text-slate-400 text-[11px]">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-4">
                      {u.is_suspended ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30 text-[10px] font-bold uppercase">
                          Suspended
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase">
                          Active
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() => handleToggleSuspend(u)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                            u.is_suspended
                              ? 'bg-slate-950 hover:bg-emerald-950/40 text-emerald-400 border-slate-800 hover:border-emerald-500/30'
                              : 'bg-slate-950 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-500/30'
                          }`}
                        >
                          {u.is_suspended ? (
                            <span className="flex items-center gap-1">
                              <UserCheck className="w-3.5 h-3.5" /> Reinstate
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <UserX className="w-3.5 h-3.5" /> Suspend
                            </span>
                          )}
                        </button>

                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() => handleDeleteUser(u)}
                          className="p-1.5 rounded-xl bg-slate-950 hover:bg-rose-950/50 text-rose-500 hover:text-rose-400 border border-slate-800 hover:border-rose-500/30 transition-all flex items-center justify-center"
                          title="Delete User Account"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

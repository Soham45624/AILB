'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  Copy,
  Check,
  ExternalLink,
  Mail,
  Globe,
  X,
  Eye,
} from 'lucide-react';

function formatDeterministicDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return '—';
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
  } catch {
    return '—';
  }
}

interface AdminUsersClientProps {
  initialUsers: any[];
  currentUserRole?: UserRole;
}

export function AdminUsersClient({ initialUsers, currentUserRole = 'admin' }: AdminUsersClientProps) {
  const [users, setUsers] = useState<any[]>(initialUsers);
  const [search, setSearch] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Selected user for detailed inspector modal
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [copiedId, setCopiedId] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (selectedUser) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedUser]);

  const isSuperAdmin = currentUserRole === 'superadmin';

  const filtered = users.filter((u) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (u.username && u.username.toLowerCase().includes(q)) ||
      (u.display_name && u.display_name.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.id && u.id.toLowerCase().includes(q))
    );
  });

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    setProcessingId(userId);
    const res = await updateUserRoleAction(userId, newRole);
    if (res.success) {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
      if (selectedUser?.id === userId) {
        setSelectedUser((prev: any) => (prev ? { ...prev, role: newRole } : null));
      }
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
      if (selectedUser?.id === user.id) {
        setSelectedUser((prev: any) => (prev ? { ...prev, is_suspended: nextState } : null));
      }
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
      if (selectedUser?.id === user.id) {
        setSelectedUser(null);
      }
    } else {
      alert(`User deletion failed: ${res.error}`);
    }
    setProcessingId(null);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const copyEmailToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search by username, display name, or UUID..."
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
                const isTargetSuperAdmin = (u.role || '').toLowerCase() === 'superadmin';
                const canManageTarget = isSuperAdmin || !isTargetSuperAdmin;

                return (
                  <tr key={u.id} className="hover:bg-slate-900/90 transition-colors group">
                    {/* User Profile Info (Clickable to open details) */}
                    <td className="py-4 px-4">
                      <button
                        type="button"
                        onClick={() => setSelectedUser(u)}
                        className="flex items-center gap-3 text-left group/btn focus:outline-none"
                      >
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-indigo-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold text-sm group-hover/btn:border-cyan-400/60 transition-colors">
                          {(u.display_name || u.username || 'U').substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-slate-100 flex items-center gap-1.5 group-hover/btn:text-cyan-400 transition-colors">
                            <span>{u.display_name || u.username}</span>
                            <Eye className="w-3.5 h-3.5 opacity-0 group-hover/btn:opacity-100 text-cyan-400 transition-opacity" />
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">@{u.username}</div>
                        </div>
                      </button>
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
                    <td className="py-4 px-4 text-slate-400 text-[11px]" suppressHydrationWarning>
                      {formatDeterministicDate(u.created_at)}
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
                          onClick={() => setSelectedUser(u)}
                          className="px-2.5 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 text-xs font-semibold transition-all flex items-center gap-1"
                          title="View complete user details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Details</span>
                        </button>

                        <button
                          type="button"
                          disabled={isProcessing || !canManageTarget}
                          onClick={() => handleToggleSuspend(u)}
                          title={!canManageTarget ? 'SuperAdmin accounts can only be suspended by another SuperAdmin' : undefined}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                            !canManageTarget
                              ? 'opacity-40 cursor-not-allowed bg-slate-950 text-slate-500 border-slate-800'
                              : u.is_suspended
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
                          disabled={isProcessing || !canManageTarget}
                          onClick={() => handleDeleteUser(u)}
                          className={`p-1.5 rounded-xl border transition-all flex items-center justify-center ${
                            !canManageTarget
                              ? 'opacity-40 cursor-not-allowed bg-slate-950 text-slate-600 border-slate-800'
                              : 'bg-slate-950 hover:bg-rose-950/50 text-rose-500 hover:text-rose-400 border-slate-800 hover:border-rose-500/30'
                          }`}
                          title={!canManageTarget ? 'SuperAdmin accounts can only be deleted by another SuperAdmin' : 'Delete User Account'}
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

      {/* USER PROFILE DETAILS MODAL (Mounted via createPortal directly onto document.body) */}
      {mounted && selectedUser && createPortal(
        <div
          className="fixed inset-0 z-[999999] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedUser(null);
          }}
        >
          <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl max-w-lg w-full p-5 sm:p-6 text-slate-200 flex flex-col max-h-[82vh] sm:max-h-[85vh] my-auto animate-scale-in">
            {/* Modal Header (Fixed at top) */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-3.5 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-indigo-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-extrabold text-sm shadow-sm">
                  {(selectedUser.display_name || selectedUser.username || 'U').substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-100 flex items-center gap-2">
                    <span>{selectedUser.display_name || selectedUser.username}</span>
                    {selectedUser.is_suspended ? (
                      <span className="px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30 text-[9px] font-bold uppercase">
                        Suspended
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[9px] font-bold uppercase">
                        Active
                      </span>
                    )}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">@{selectedUser.username}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="p-1.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Profile Information Scrollable Body */}
            <div className="space-y-3 sm:space-y-3.5 py-3 sm:py-4 overflow-y-auto pr-1 flex-1 scrollbar-thin">
              {/* User ID UUID */}
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                  <span>User ID (UUID)</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(selectedUser.id)}
                    className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-semibold text-[10px] transition-colors"
                  >
                    {copiedId ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy ID</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="font-mono text-xs text-slate-300 break-all select-all">
                  {selectedUser.id}
                </div>
              </div>

              {/* Account Email */}
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3 h-3 text-cyan-400" /> Account Email
                  </span>
                  {selectedUser.email && (
                    <button
                      type="button"
                      onClick={() => copyEmailToClipboard(selectedUser.email)}
                      className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-semibold text-[10px] transition-colors"
                    >
                      {copiedEmail ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy Email</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
                <div className="font-mono text-xs text-slate-300 break-all select-all">
                  {selectedUser.email || (
                    <span className="text-slate-500 italic font-sans text-xs">No email linked or email private</span>
                  )}
                </div>
              </div>

              {/* Role & Joined Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60 space-y-0.5">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <Shield className="w-3 h-3 text-indigo-400" /> Current Role
                  </div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-200">
                    {selectedUser.role || 'USER'}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60 space-y-0.5">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-cyan-400" /> Joined Date
                  </div>
                  <div className="text-xs font-semibold text-slate-200" suppressHydrationWarning>
                    {formatDeterministicDate(selectedUser.created_at)}
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/60 space-y-1">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Bio / Tagline
                </div>
                <p className="text-xs text-slate-300 italic leading-relaxed">
                  {selectedUser.bio || 'No bio provided.'}
                </p>
              </div>

              {/* Website */}
              {selectedUser.website && (
                <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/60 space-y-1">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <Globe className="w-3 h-3 text-emerald-400" /> Website / Portfolio
                  </div>
                  <a
                    href={selectedUser.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-cyan-400 hover:text-cyan-300 underline flex items-center gap-1 break-all"
                  >
                    <span>{selectedUser.website}</span>
                    <ExternalLink className="w-3 h-3 flex-shrink-0" />
                  </a>
                </div>
              )}

              {/* Activity Counts */}
              <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/60 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                  <Send className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Total Tool Submissions</span>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-200">
                  {selectedUser.submission_count || 0}
                </span>
              </div>
            </div>

            {/* Quick Actions Footer (Fixed at bottom) */}
            <div className="pt-3.5 border-t border-slate-800 flex items-center justify-between gap-2.5 flex-shrink-0">
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                Close
              </button>

              <div className="flex items-center gap-2">
                {(() => {
                  const isTargetSuperAdmin = (selectedUser.role || '').toLowerCase() === 'superadmin';
                  const canManageTarget = isSuperAdmin || !isTargetSuperAdmin;

                  return (
                    <>
                      <button
                        type="button"
                        disabled={!canManageTarget}
                        onClick={() => handleToggleSuspend(selectedUser)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                          !canManageTarget
                            ? 'opacity-40 cursor-not-allowed bg-slate-950 text-slate-600 border-slate-800'
                            : selectedUser.is_suspended
                            ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30 hover:bg-emerald-900/60'
                            : 'bg-rose-950/40 text-rose-400 border-rose-500/30 hover:bg-rose-900/60'
                        }`}
                      >
                        {selectedUser.is_suspended ? 'Reinstate User' : 'Suspend User'}
                      </button>

                      <button
                        type="button"
                        disabled={!canManageTarget}
                        onClick={() => handleDeleteUser(selectedUser)}
                        className={`p-2 rounded-xl border transition-all ${
                          !canManageTarget
                            ? 'opacity-40 cursor-not-allowed bg-slate-950 text-slate-600 border-slate-800'
                            : 'bg-rose-950/40 text-rose-400 border-rose-500/30 hover:bg-rose-900/60'
                        }`}
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

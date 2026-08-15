'use client';

import { useState } from 'react';
import {
  User,
  Library,
  MessageSquare,
  Send,
  Shield,
  ShieldCheck,
  CheckCircle2,
  Plus,
  Compass,
  AlertCircle,
  Save,
  LogOut,
  ArrowRight,
} from 'lucide-react';
import { Profile } from '@/lib/types';
import { updateProfileAction, signOutAction } from '@/app/actions/auth';
import { AddToolModal } from '../home/AddToolModal';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

interface DashboardClientProps {
  user: {
    id: string;
    email: string;
    created_at: string;
  };
  profile: Profile | null;
  submissions: any[];
  savedCount: number;
  reviewsCount: number;
}

export function DashboardClient({
  user,
  profile,
  submissions,
  savedCount,
  reviewsCount,
}: DashboardClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState<'profile' | 'reviews'>('profile');

  const isAdminOrEditor = profile?.role === 'admin' || profile?.role === 'editor';

  // Profile Form state
  const [username, setUsername] = useState(profile?.username || '');
  const [displayName, setDisplayName] = useState(profile?.display_name || profile?.full_name || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [website, setWebsite] = useState(profile?.website || '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '');

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    setSaveError(null);

    const formData = new FormData();
    formData.append('username', username);
    formData.append('displayName', displayName);
    formData.append('bio', bio);
    formData.append('website', website);
    formData.append('avatarUrl', avatarUrl);

    try {
      const res = await updateProfileAction(formData);
      if (!res.success) {
        setSaveError(res.error || 'Failed to update profile.');
        setSaving(false);
        return;
      }
      setSaveSuccess(true);
      setSaving(false);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setSaveError(err.message || 'An unexpected error occurred.');
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOutAction();
    router.push('/');
    router.refresh();
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* Top Banner / User Info Card */}
      <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-zinc-800 border border-zinc-700/80 text-zinc-100 font-bold text-xl flex items-center justify-center">
            {displayName ? displayName.substring(0, 2).toUpperCase() : user.email.substring(0, 2).toUpperCase()}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg font-bold text-zinc-100">
                {displayName || username || 'Community Member'}
              </h1>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 border ${
                  profile?.role === 'admin'
                    ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    : profile?.role === 'editor'
                    ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                    : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                }`}
              >
                <Shield className="w-3 h-3" />
                {profile?.role || 'User'}
              </span>
            </div>

            <p className="text-xs text-zinc-400">
              @{username || 'user'} • {user.email}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {isAdminOrEditor && (
            <Link
              href="/admin"
              className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs shadow-md transition-colors flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Management Dashboard</span>
            </Link>
          )}

          <Link
            href="/submit"
            className="px-3.5 py-2 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Submit AI Tool
          </Link>

          <button
            onClick={handleSignOut}
            className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>
      </div>

      {/* ADMIN CALLOUT BANNER (Visible if user is Admin or Editor) */}
      {isAdminOrEditor && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-zinc-900 to-zinc-900 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-xs text-zinc-100 flex items-center gap-2">
                <span>Administrator Controls Active</span>
                <span className="text-[10px] text-amber-400 uppercase font-mono bg-amber-400/10 px-1.5 py-0.2 rounded border border-amber-400/20">
                  {profile?.role}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                You have elevated privileges to moderate tool submissions, manage directory tools, and resolve reports.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/admin/submissions"
              className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700 transition-colors flex items-center gap-1"
            >
              <Send className="w-3 h-3" /> Submissions
            </Link>

            <Link
              href="/admin"
              className="px-3.5 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs transition-colors flex items-center gap-1"
            >
              <span>Open Admin Panel</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-900 pb-2 overflow-x-auto scrollbar-none">
        {/* In-page tabs */}
        {[
          { id: 'profile', label: 'Dashboard', icon: User },
          { id: 'reviews', label: 'My Reviews', count: reviewsCount, icon: MessageSquare },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id && pathname === '/dashboard';
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-zinc-800 text-white'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    isActive ? 'bg-zinc-100 text-zinc-950 font-bold' : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}

        {/* Route-based nav items */}
        <Link
          href="/dashboard/my-library"
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
            pathname === '/dashboard/my-library'
              ? 'bg-zinc-800 text-white'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
          }`}
        >
          <Library className="w-3.5 h-3.5" />
          <span>My Library</span>
          {savedCount > 0 && (
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                pathname === '/dashboard/my-library'
                  ? 'bg-zinc-100 text-zinc-950 font-bold'
                  : 'bg-zinc-800 text-zinc-400'
              }`}
            >
              {savedCount}
            </span>
          )}
        </Link>

        <Link
          href="/dashboard/submissions"
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
            pathname === '/dashboard/submissions'
              ? 'bg-zinc-800 text-white'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
          }`}
        >
          <Send className="w-3.5 h-3.5" />
          <span>My Submissions</span>
          {submissions.length > 0 && (
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                pathname === '/dashboard/submissions'
                  ? 'bg-zinc-100 text-zinc-950 font-bold'
                  : 'bg-zinc-800 text-zinc-400'
              }`}
            >
              {submissions.length}
            </span>
          )}
        </Link>
      </div>

      {/* TAB CONTENT: Profile Settings */}
      {activeTab === 'profile' && (
        <div className="max-w-2xl p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-6">
          <div>
            <h2 className="text-base font-bold text-zinc-100">Personal Profile</h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Manage your display name, username, bio, and portfolio link.
            </p>
          </div>

          {saveError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{saveError}</span>
            </div>
          )}

          {saveSuccess && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Profile updated successfully!</span>
            </div>
          )}

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Display Name
                </label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-zinc-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Username
                </label>
                <input
                  type="text"
                  required
                  placeholder="johndoe"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-zinc-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                Bio / About You
              </label>
              <textarea
                rows={3}
                placeholder="AI enthusiast, engineer, or prompt designer..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-zinc-600 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Personal Website / Link
                </label>
                <input
                  type="url"
                  placeholder="https://mywebsite.com"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-zinc-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Avatar Image URL
                </label>
                <input
                  type="url"
                  placeholder="https://images.com/my-photo.jpg"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-zinc-600"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-xs shadow-md transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Saved Tools tab removed — now lives at /dashboard/my-library */}

      {/* TAB CONTENT: My Reviews */}
      {activeTab === 'reviews' && pathname === '/dashboard' && (
        <div className="p-8 rounded-2xl bg-zinc-900/40 border border-zinc-800 text-center space-y-3 max-w-xl mx-auto">
          <div className="w-12 h-12 mx-auto rounded-xl bg-zinc-800 text-zinc-400 flex items-center justify-center">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-zinc-100">My Reviews</h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
            You haven&apos;t reviewed any AI tools yet. Share your evaluation on tools you&apos;ve tested.
          </p>
          <div className="pt-2">
            <Link
              href="/tools"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs transition-colors border border-zinc-700"
            >
              <Compass className="w-3.5 h-3.5" /> Explore &amp; Review Tools
            </Link>
          </div>
        </div>
      )}

      {/* Submissions tab removed — now lives at /dashboard/submissions */}

      {/* Add Tool Modal */}
      <AddToolModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
    </div>
  );
}

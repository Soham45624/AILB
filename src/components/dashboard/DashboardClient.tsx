'use client';

import { useState } from 'react';
import {
  User,
  Bookmark,
  MessageSquare,
  Send,
  Sparkles,
  Shield,
  Clock,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Plus,
  Compass,
  AlertCircle,
  Globe,
  Save,
  LogOut,
} from 'lucide-react';
import { Profile } from '@/lib/types';
import { updateProfileAction, signOutAction } from '@/app/actions/auth';
import { AddToolModal } from '../home/AddToolModal';
import { useRouter } from 'next/navigation';
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
  const [activeTab, setActiveTab] = useState<'profile' | 'saved' | 'reviews' | 'submissions'>('profile');

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
    <div className="space-y-8 animate-fade-in">
      {/* Top Banner / User Info Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-tr from-cyan-500/10 via-blue-600/10 to-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-4 z-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
            {displayName ? displayName.substring(0, 2).toUpperCase() : user.email.substring(0, 2).toUpperCase()}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-100">
                {displayName || username || 'Community Member'}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1">
                <Shield className="w-3 h-3" />
                {profile?.role || 'User'}
              </span>
            </div>

            <p className="text-xs text-slate-400">
              @{username || 'user'} • {user.email}
            </p>

            <p className="text-[11px] text-slate-500">
              Member since {new Date(user.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2.5 z-10">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Submit AI Tool
          </button>

          <button
            onClick={handleSignOut}
            className="px-3.5 py-2.5 rounded-xl bg-slate-950 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-500/30 text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-900 pb-2 overflow-x-auto scrollbar-none">
        {[
          { id: 'profile', label: 'Profile Settings', icon: User },
          { id: 'saved', label: 'Saved Tools', count: savedCount, icon: Bookmark },
          { id: 'reviews', label: 'My Reviews', count: reviewsCount, icon: MessageSquare },
          { id: 'submissions', label: 'My Submissions', count: submissions.length, icon: Send },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    isActive ? 'bg-cyan-500 text-slate-950 font-extrabold' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT: Profile Settings */}
      {activeTab === 'profile' && (
        <div className="max-w-2xl p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-100">Personal Profile</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Manage your display name, username, bio, and portfolio link.
            </p>
          </div>

          {saveError && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{saveError}</span>
            </div>
          )}

          {saveSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Profile updated successfully!</span>
            </div>
          )}

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Display Name
                </label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Username
                </label>
                <input
                  type="text"
                  required
                  placeholder="johndoe"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Bio / About You
              </label>
              <textarea
                rows={3}
                placeholder="AI enthusiast, engineer, or prompt designer..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Personal Website / Link
                </label>
                <input
                  type="url"
                  placeholder="https://mywebsite.com"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Avatar Image URL
                </label>
                <input
                  type="url"
                  placeholder="https://images.com/my-photo.jpg"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                {saving ? 'Saving Changes...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB CONTENT: Saved Tools Placeholder */}
      {activeTab === 'saved' && (
        <div className="p-10 rounded-3xl bg-slate-900/40 border border-slate-800 text-center space-y-4 max-w-2xl mx-auto">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
            <Bookmark className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-100">Saved AI Tools</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            Bookmark your favorite AI generators, code assistants, and productivity tools while exploring the library to quickly access them here.
          </p>
          <div className="pt-2">
            <Link
              href="/tools"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 transition-all"
            >
              <Compass className="w-4 h-4" /> Browse AI Tools
            </Link>
          </div>
        </div>
      )}

      {/* TAB CONTENT: My Reviews Placeholder */}
      {activeTab === 'reviews' && (
        <div className="p-10 rounded-3xl bg-slate-900/40 border border-slate-800 text-center space-y-4 max-w-2xl mx-auto">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
            <MessageSquare className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-100">My Community Reviews</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            You haven&apos;t reviewed any AI tools yet. Share your rating and feedback on tools you&apos;ve tested to help other builders make the best choice.
          </p>
          <div className="pt-2">
            <Link
              href="/tools"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-all border border-slate-700"
            >
              <Compass className="w-4 h-4" /> Explore & Rate Tools
            </Link>
          </div>
        </div>
      )}

      {/* TAB CONTENT: My Submissions */}
      {activeTab === 'submissions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-100">Submitted AI Projects</h2>
              <p className="text-xs text-slate-400">Track moderation status of tools you submitted to the platform</p>
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" /> + Submit Tool
            </button>
          </div>

          {submissions.length === 0 ? (
            <div className="p-10 rounded-3xl bg-slate-900/40 border border-slate-800 text-center space-y-4">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <Send className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-200">No Submissions Yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Have you created or discovered an awesome AI tool? Submit it to be featured in the community directory.
              </p>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" /> Submit First Tool
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {submissions.map((sub) => (
                <div
                  key={sub.id}
                  className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-slate-100">{sub.tool_name}</h4>
                      <a
                        href={sub.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1 mt-0.5"
                      >
                        <ExternalLink className="w-3 h-3" />
                        {sub.website_url}
                      </a>
                    </div>

                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                        sub.status === 'approved'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : sub.status === 'rejected'
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}
                    >
                      {sub.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2">
                    {sub.description || 'No description provided.'}
                  </p>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
                    <span>Submitted: {new Date(sub.created_at).toLocaleDateString()}</span>
                    <span>Pricing: {sub.pricing}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Tool Modal */}
      <AddToolModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
    </div>
  );
}

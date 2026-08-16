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
      <div className="p-6 rounded-3xl bg-white border border-[#EAE6DC] flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[#141613] text-white font-extrabold text-lg flex items-center justify-center shadow-sm">
            {displayName ? displayName.substring(0, 2).toUpperCase() : user.email.substring(0, 2).toUpperCase()}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg font-bold text-[#141613]">
                {displayName || username || 'Community Member'}
              </h1>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 border ${
                  profile?.role === 'admin'
                    ? 'bg-[#FDF0F2] text-[#D73A49] border-[#F8D2D7]'
                    : profile?.role === 'editor'
                    ? 'bg-[#F3EFFB] text-[#5C42A6] border-[#DDD2F5]'
                    : 'bg-[#F5F3ED] text-[#666B60] border-[#EAE6DC]'
                }`}
              >
                <Shield className="w-3 h-3" />
                {profile?.role || 'User'}
              </span>
            </div>

            <p className="text-xs text-[#73796E]">
              @{username || 'user'} • {user.email}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {isAdminOrEditor && (
            <Link
              href="/admin"
              className="px-4 py-2 rounded-full bg-[#FAF3E6] border border-[#F0E2C8] text-[#8C4E05] font-bold text-xs shadow-sm transition-colors flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Admin Panel</span>
            </Link>
          )}

          <Link
            href="/submit"
            className="btn-interactive px-4 py-2 rounded-full bg-[#141613] hover:bg-[#2A2E27] text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" /> <span>Submit AI Tool</span>
          </Link>

          <button
            onClick={handleSignOut}
            className="px-3.5 py-2 rounded-full bg-white hover:bg-[#FDF0F2] text-[#73796E] hover:text-[#D73A49] border border-[#EAE6DC] text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" /> <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#EAE6DC] pb-2 overflow-x-auto scrollbar-none">
        {[
          { id: 'profile', label: 'Dashboard Profile', icon: User },
          { id: 'reviews', label: 'My Reviews', count: reviewsCount, icon: MessageSquare },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id && pathname === '/dashboard';
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-[#141613] text-white shadow-sm'
                  : 'text-[#666B60] hover:text-[#141613] hover:bg-[#F5F3ED]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    isActive ? 'bg-white text-[#141613] font-bold' : 'bg-[#EAE6DC] text-[#666B60]'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}

        <Link
          href="/dashboard/my-library"
          className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap text-[#666B60] hover:text-[#141613] hover:bg-[#F5F3ED] transition-colors"
        >
          <Library className="w-3.5 h-3.5" />
          <span>My Library</span>
          {savedCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#EAE6DC] text-[#666B60]">
              {savedCount}
            </span>
          )}
        </Link>

        <Link
          href="/dashboard/submissions"
          className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap text-[#666B60] hover:text-[#141613] hover:bg-[#F5F3ED] transition-colors"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Submissions</span>
          {submissions.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#EAE6DC] text-[#666B60]">
              {submissions.length}
            </span>
          )}
        </Link>
      </div>

      {/* TAB CONTENT: PROFILE */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Metrics Col */}
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-white border border-[#EAE6DC] space-y-4 shadow-sm">
              <h3 className="text-xs font-bold text-[#73796E] uppercase tracking-wider">
                Activity Overview
              </h3>

              <div className="space-y-3">
                <Link
                  href="/dashboard/my-library"
                  className="flex items-center justify-between p-3 rounded-xl bg-[#FBF9F5] border border-[#EAE6DC] hover:border-[#D0C9BA] transition-colors"
                >
                  <div className="flex items-center gap-2.5 text-xs text-[#141613] font-semibold">
                    <Library className="w-4 h-4 text-[#5A7840]" />
                    <span>Saved in Library</span>
                  </div>
                  <span className="text-sm font-bold text-[#141613]">{savedCount}</span>
                </Link>

                <Link
                  href="/dashboard/submissions"
                  className="flex items-center justify-between p-3 rounded-xl bg-[#FBF9F5] border border-[#EAE6DC] hover:border-[#D0C9BA] transition-colors"
                >
                  <div className="flex items-center gap-2.5 text-xs text-[#141613] font-semibold">
                    <Send className="w-4 h-4 text-[#0366D6]" />
                    <span>Tool Submissions</span>
                  </div>
                  <span className="text-sm font-bold text-[#141613]">{submissions.length}</span>
                </Link>

                <div className="flex items-center justify-between p-3 rounded-xl bg-[#FBF9F5] border border-[#EAE6DC]">
                  <div className="flex items-center gap-2.5 text-xs text-[#141613] font-semibold">
                    <MessageSquare className="w-4 h-4 text-[#5C42A6]" />
                    <span>Community Reviews</span>
                  </div>
                  <span className="text-sm font-bold text-[#141613]">{reviewsCount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Edit Profile Form */}
          <div className="lg:col-span-2">
            <form
              onSubmit={handleProfileSubmit}
              className="p-6 rounded-3xl bg-white border border-[#EAE6DC] space-y-5 shadow-sm"
            >
              <div className="border-b border-[#F2EFE8] pb-3">
                <h3 className="text-base font-bold text-[#141613]">Public Profile Details</h3>
                <p className="text-xs text-[#73796E]">Update your profile information visible across AILIB</p>
              </div>

              {saveSuccess && (
                <div className="p-3 rounded-xl bg-[#EDF7EE] border border-[#CCE8CD] text-[#1E7E34] text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Profile updated successfully!</span>
                </div>
              )}

              {saveError && (
                <div className="p-3 rounded-xl bg-[#FDF0F2] border border-[#F8D2D7] text-[#D73A49] text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{saveError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#73796E] mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#E2DDD2] text-xs text-[#141613] focus:outline-none focus:border-[#141613]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#73796E] mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#E2DDD2] text-xs text-[#141613] focus:outline-none focus:border-[#141613]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#73796E] mb-1">
                  Bio / Tagline
                </label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Software engineer, AI explorer, or indie creator..."
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#E2DDD2] text-xs text-[#141613] focus:outline-none focus:border-[#141613] resize-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#73796E] mb-1">
                  Website or Portfolio URL
                </label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#E2DDD2] text-xs text-[#141613] focus:outline-none focus:border-[#141613]"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-interactive px-6 py-2.5 rounded-full bg-[#141613] hover:bg-[#2A2E27] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{saving ? 'Saving...' : 'Save Profile'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB CONTENT: REVIEWS */}
      {activeTab === 'reviews' && (
        <div className="p-8 rounded-3xl bg-white border border-[#EAE6DC] text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-[#F5F3ED] text-[#73796E] flex items-center justify-center mx-auto">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#141613]">My Submitted Reviews</h3>
            <p className="text-xs text-[#666B60] mt-1 max-w-sm mx-auto">
              You have submitted {reviewsCount} community reviews.
            </p>
          </div>
          <Link
            href="/tools"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#141613] hover:bg-[#2A2E27] text-white font-bold text-xs shadow-sm transition-all"
          >
            <Compass className="w-3.5 h-3.5" /> Explore &amp; Review Tools
          </Link>
        </div>
      )}
    </div>
  );
}

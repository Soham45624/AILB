'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, Lock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { updatePasswordAction } from '@/app/actions/auth';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('password', password);

    try {
      const res = await updatePasswordAction(formData);
      if (!res.success) {
        setError(res.error || 'Failed to update password.');
        setLoading(false);
        return;
      }
      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard');
        router.refresh();
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 rounded-3xl bg-white border border-[#EAE6DC] shadow-lg relative overflow-hidden">
      <div className="text-center space-y-2 mb-6">
        <h1 className="font-serif-heading text-2xl font-normal text-[#141613]">New Password</h1>
        <p className="text-xs text-[#666B60]">
          Enter your new password below.
        </p>
      </div>

      {error && (
        <div className="mb-5 p-3.5 rounded-xl bg-[#FDF0F2] border border-[#F8D2D7] text-[#D73A49] text-xs flex items-start gap-2 animate-fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success ? (
        <div className="py-6 text-center space-y-3 animate-fade-in">
          <div className="w-12 h-12 mx-auto rounded-full bg-[#EDF7EE] text-[#1E7E34] flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-[#141613]">Password Updated!</h2>
          <p className="text-xs text-[#666B60]">Redirecting to your dashboard...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#73796E] mb-1.5">
              New Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#9FA59A] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-full bg-white border border-[#E2DDD2] text-xs sm:text-sm text-[#141613] placeholder:text-[#94998E] focus:outline-none focus:border-[#141613]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#73796E] mb-1.5">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#9FA59A] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-full bg-white border border-[#E2DDD2] text-xs sm:text-sm text-[#141613] placeholder:text-[#94998E] focus:outline-none focus:border-[#141613]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-interactive w-full py-3 rounded-full bg-[#141613] hover:bg-[#2A2E27] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 mt-2"
          >
            {loading ? 'Updating password...' : 'Update Password'}
          </button>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#141613] flex flex-col justify-between selection:bg-[#ECE8DF] selection:text-[#141613]">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <Suspense fallback={<div className="text-xs text-[#73796E]">Loading...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

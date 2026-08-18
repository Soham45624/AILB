'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Sparkles, LogIn, Lock, Mail, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { signInAction } from '@/app/actions/auth';
import { createClient } from '@/lib/supabase/client';
import { AILIBLogo } from '@/components/ui/AILIBLogo';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';
  const urlError = searchParams.get('error');
  const urlReason = searchParams.get('reason');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    urlError === 'auth_callback_failed'
      ? 'Authentication callback failed. Please try again.'
      : null
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);

    try {
      const res = await signInAction(formData);
      if (!res.success) {
        setError(res.error || 'Invalid email or password.');
        setLoading(false);
        return;
      }

      router.push(redirect);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during sign-in.');
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);
      setError(null);
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirect)}`,
        },
      });

      if (error) {
        if (error.message.includes('not enabled') || error.message.includes('Unsupported provider')) {
          setError(
            'Google Sign-In is not enabled in your Supabase project. Please sign in with email/password below.'
          );
        } else {
          setError(error.message);
        }
        setGoogleLoading(false);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to initiate Google sign in.');
      setGoogleLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 rounded-3xl bg-white border border-[#EAE6DC] shadow-lg relative overflow-hidden">
      {/* Header */}
      <div className="text-center space-y-2 mb-6">
        <div className="flex justify-center mb-2">
          <AILIBLogo size={48} />
        </div>
        <h1 className="font-serif-heading text-2xl sm:text-3xl font-normal text-[#141613] tracking-tight">
          Welcome Back
        </h1>
        <p className="text-xs text-[#666B60]">
          Sign in to your account to save tools, manage your library, and post reviews.
        </p>
      </div>

      {/* Session Expired Notice */}
      {urlReason === 'session_expired' && !error && (
        <div className="mb-5 p-3.5 rounded-xl bg-[#FFF8E6] border border-[#F3E2B8] text-[#8C6D1F] text-xs flex items-start gap-2.5 animate-fade-in">
          <Clock className="w-4 h-4 shrink-0 mt-0.5" />
          <span className="leading-relaxed">
            Your session expired due to 24 hours of inactivity for account security. Please sign in again.
          </span>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="mb-5 p-3.5 rounded-xl bg-[#FDF0F2] border border-[#F8D2D7] text-[#D73A49] text-xs flex items-start gap-2.5 animate-fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span className="leading-relaxed">{error}</span>
        </div>
      )}

      {/* Google OAuth Button */}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={googleLoading}
        className="w-full py-2.5 px-4 rounded-full bg-white hover:bg-[#F5F3ED] border border-[#E2DDD2] text-[#141613] font-semibold text-xs transition-colors flex items-center justify-center gap-2 mb-4 shadow-sm"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        <span>{googleLoading ? 'Connecting...' : 'Continue with Google'}</span>
      </button>

      <div className="flex items-center gap-3 my-4">
        <div className="flex-1 h-px bg-[#EAE6DC]" />
        <span className="text-[10px] font-bold uppercase text-[#9FA59A]">or email</span>
        <div className="flex-1 h-px bg-[#EAE6DC]" />
      </div>

      {/* Email / Password Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#73796E] mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-[#9FA59A] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-full bg-white border border-[#E2DDD2] text-xs sm:text-sm text-[#141613] placeholder:text-[#94998E] focus:outline-none focus:border-[#141613] transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#73796E] mb-1.5">
            Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-[#9FA59A] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-full bg-white border border-[#E2DDD2] text-xs sm:text-sm text-[#141613] placeholder:text-[#94998E] focus:outline-none focus:border-[#141613] transition-colors"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-interactive w-full py-3 rounded-full bg-[#141613] hover:bg-[#2A2E27] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 mt-2"
        >
          {loading ? (
            'Signing in...'
          ) : (
            <>
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </>
          )}
        </button>
      </form>

      <div className="mt-6 text-center text-xs text-[#73796E]">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="text-[#141613] font-bold hover:underline">
          Create Account
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#141613] selection:bg-[#ECE8DF] selection:text-[#141613] flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 py-12">
        <Suspense fallback={<div className="text-xs text-[#73796E]">Loading sign in...</div>}>
          <LoginForm />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}

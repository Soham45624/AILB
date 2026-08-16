'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Sparkles, Mail, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { resetPasswordAction } from '@/app/actions/auth';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('email', email);

    try {
      const res = await resetPasswordAction(formData);
      if (!res.success) {
        setError(res.error || 'Failed to send reset link.');
        setLoading(false);
        return;
      }
      setSent(true);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#141613] flex flex-col justify-between selection:bg-[#ECE8DF] selection:text-[#141613]">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md p-8 rounded-3xl bg-white border border-[#EAE6DC] shadow-lg relative overflow-hidden">
          <div className="text-center space-y-2 mb-6">
            <h1 className="font-serif-heading text-2xl font-normal text-[#141613]">Reset Password</h1>
            <p className="text-xs text-[#666B60]">
              Enter your account email address and we&apos;ll send you a password reset link.
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-[#FDF0F2] border border-[#F8D2D7] text-[#D73A49] text-xs flex items-start gap-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {sent ? (
            <div className="py-6 text-center space-y-4 animate-fade-in">
              <div className="w-12 h-12 mx-auto rounded-full bg-[#EDF7EE] text-[#1E7E34] flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h2 className="text-base font-bold text-[#141613]">Check your email</h2>
              <p className="text-xs text-[#666B60] leading-relaxed">
                If an account exists for <strong className="text-[#141613]">{email}</strong>, a password reset link has been sent.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs text-[#141613] font-bold hover:underline pt-2"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
              </Link>
            </div>
          ) : (
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
                    className="w-full pl-10 pr-4 py-2.5 rounded-full bg-white border border-[#E2DDD2] text-xs sm:text-sm text-[#141613] placeholder:text-[#94998E] focus:outline-none focus:border-[#141613]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-interactive w-full py-3 rounded-full bg-[#141613] hover:bg-[#2A2E27] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 mt-2"
              >
                {loading ? 'Sending link...' : 'Send Reset Link'}
              </button>

              <div className="pt-4 text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1 text-xs text-[#73796E] hover:text-[#141613] transition-colors"
                >
                  <ArrowLeft className="w-3 h-3" /> Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

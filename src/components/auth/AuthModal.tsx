'use client';

import { useState } from 'react';
import { X, LogIn, UserPlus, AlertCircle, CheckCircle2, Lock, Mail, User, Eye, EyeOff } from 'lucide-react';
import { signInAction, signUpAction } from '@/app/actions/auth';
import { useRouter } from 'next/navigation';
import { AILIBLogo } from '@/components/ui/AILIBLogo';
import { PasswordRequirements } from '@/components/auth/PasswordRequirements';
import { isPasswordValid } from '@/lib/passwordValidation';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialMode?: 'signin' | 'signup';
}

export function AuthModal({
  isOpen,
  onClose,
  onSuccess,
  initialMode = 'signin',
}: AuthModalProps) {
  const router = useRouter();
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);
    if (mode === 'signup') {
      formData.append('username', username);
    }

    try {
      const res = mode === 'signin' ? await signInAction(formData) : await signUpAction(formData);

      if (!res.success) {
        setError(res.error || 'Authentication failed. Please check your credentials.');
        setLoading(false);
        return;
      }

      setSuccessMsg(
        mode === 'signin'
          ? 'Signed in successfully!'
          : 'Account created! Signing you in...'
      );

      router.refresh();

      setTimeout(() => {
        setLoading(false);
        if (onSuccess) onSuccess();
        onClose();
      }, 500);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#141613]/25 backdrop-blur-[6px] animate-fade-in">
      <div className="relative w-full max-w-md rounded-3xl bg-white border border-[#EAE6DC] shadow-2xl p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#F2EFE8]">
          <div className="flex items-center gap-2.5">
            <AILIBLogo size={32} />
            <div>
              <h3 className="text-base font-bold text-[#141613]">
                {mode === 'signin' ? 'Sign In to AILIB' : 'Create Account'}
              </h3>
              <p className="text-xs text-[#73796E]">
                {mode === 'signin'
                  ? 'Access your library & submit AI tools'
                  : 'Join the curated AI directory'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#73796E] hover:text-[#141613] hover:bg-[#F5F3ED] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Feedback Alerts */}
        {error && (
          <div className="mt-4 p-3 rounded-xl bg-[#FDF0F2] border border-[#F8D2D7] text-[#D73A49] text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mt-4 p-3 rounded-xl bg-[#EDF7EE] border border-[#CCE8CD] text-[#1E7E34] text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 mt-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#73796E] mb-1">
                Username
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-[#9FA59A] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="janedoe"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-full bg-white border border-[#E2DDD2] text-xs text-[#141613] placeholder:text-[#94998E] focus:outline-none focus:border-[#141613]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#73796E] mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-3.5 h-3.5 text-[#9FA59A] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-full bg-white border border-[#E2DDD2] text-xs text-[#141613] placeholder:text-[#94998E] focus:outline-none focus:border-[#141613]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#73796E] mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-3.5 h-3.5 text-[#9FA59A] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-9 py-2 rounded-full bg-white border border-[#E2DDD2] text-xs text-[#141613] placeholder:text-[#94998E] focus:outline-none focus:border-[#141613]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9FA59A] hover:text-[#141613] transition-colors p-0.5"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* In Signup mode, show the 5 password conditions checklist */}
            {mode === 'signup' && (
              <div className="mt-2">
                <PasswordRequirements password={password} />
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || (mode === 'signup' && !isPasswordValid(password))}
            className="btn-interactive w-full py-2.5 rounded-full bg-[#141613] hover:bg-[#2A2E27] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 mt-1"
          >
            {loading ? (
              'Authenticating...'
            ) : (
              <span>{mode === 'signin' ? 'Sign In' : 'Create Account'}</span>
            )}
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="mt-4 pt-3 border-t border-[#F2EFE8] text-center text-xs text-[#73796E]">
          {mode === 'signin' ? (
            <>
              Don&apos;t have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setError(null);
                }}
                className="text-[#141613] font-bold hover:underline"
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setError(null);
                }}
                className="text-[#141613] font-bold hover:underline"
              >
                Sign in
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

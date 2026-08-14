'use client';

import { useState, useEffect } from 'react';
import {
  X,
  Send,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  LogIn,
  UserCheck,
} from 'lucide-react';
import { submitToolAction } from '@/app/actions/submissions';
import { getCurrentUserAction } from '@/app/actions/auth';
import { AuthModal } from '../auth/AuthModal';

interface AddToolModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddToolModal({ isOpen, onClose }: AddToolModalProps) {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [pricing, setPricing] = useState('free');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submissionData, setSubmissionData] = useState<any>(null);

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Check auth state whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setCheckingAuth(true);
      setError(null);
      getCurrentUserAction().then((res) => {
        if (res.success && res.user) {
          setCurrentUser(res.user);
        } else {
          setCurrentUser(null);
        }
        setCheckingAuth(false);
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('url', url);
    formData.append('description', description);
    formData.append('pricing', pricing);

    try {
      console.log('Dispatching submitToolAction from AddToolModal...');
      const response = await submitToolAction(formData);

      if (!response.success) {
        console.error('Submission failed with error:', response.error);
        setError(response.error || 'Failed to submit tool. Please try again.');
        setLoading(false);
        return;
      }

      console.log('Submission confirmed created in Supabase:', response.submission);
      setSubmissionData(response.submission);
      setLoading(false);
    } catch (err: any) {
      console.error('Client submission error:', err);
      setError(err.message || 'An unexpected error occurred during submission.');
      setLoading(false);
    }
  };

  const handleReset = () => {
    setName('');
    setUrl('');
    setDescription('');
    setPricing('free');
    setError(null);
    setSubmissionData(null);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
        <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 overflow-hidden">
          {/* Decorative glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-100">Submit an AI Tool</h3>
                <p className="text-xs text-slate-400">
                  Add a new AI project to the Supabase moderation queue
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Auth Status Banner */}
          {!checkingAuth && (
            <div className="mt-4">
              {currentUser ? (
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-emerald-400" />
                    <span>
                      Submitting as <strong className="font-semibold">{currentUser.email}</strong>
                    </span>
                  </div>
                  <span className="text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded-full font-bold uppercase">
                    Authenticated
                  </span>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Please sign in to submit a tool.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAuthModalOpen(true)}
                    className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shrink-0 transition-colors"
                  >
                    Sign In
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Real Error Message Banner */}
          {error && (
            <div className="mt-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <div className="space-y-1">
                <p className="font-bold text-rose-200">Submission Error</p>
                <p className="leading-relaxed">{error}</p>
              </div>
            </div>
          )}

          {/* Success State */}
          {submissionData ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-bold text-slate-100">Tool Submitted to Supabase!</h4>
              <p className="text-sm text-slate-400 max-w-sm mx-auto">
                Your submission for <strong className="text-cyan-400">{submissionData.tool_name}</strong> was recorded in the database (Status: <span className="font-semibold text-amber-400">{submissionData.status}</span>).
              </p>
              <div className="text-xs text-slate-500 bg-slate-950 p-2.5 rounded-xl max-w-xs mx-auto border border-slate-800">
                Submission ID: {submissionData.id}
              </div>
              <button
                onClick={handleReset}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 text-sm font-semibold transition-colors"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Tool Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ChatCanvas AI"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Website URL <span className="text-rose-400">*</span>
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Pricing Model
                </label>
                <select
                  value={pricing}
                  onChange={(e) => setPricing(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                >
                  <option value="free">Free</option>
                  <option value="freemium">Freemium</option>
                  <option value="free_trial">Free Trial</option>
                  <option value="paid">Paid</option>
                  <option value="contact">Contact for Pricing</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Short Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Briefly describe what this AI tool does..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 text-xs font-bold shadow-md shadow-cyan-500/20 transition-all disabled:opacity-50"
                >
                  {loading ? 'Submitting to Supabase...' : 'Submit Tool'}
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Auth Modal if user needs to sign in */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {
          getCurrentUserAction().then((res) => {
            if (res.success && res.user) setCurrentUser(res.user);
          });
        }}
      />
    </>
  );
}

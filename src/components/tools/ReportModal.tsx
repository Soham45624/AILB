'use client';

import { useState } from 'react';
import { Flag, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { submitReportAction } from '@/app/actions/userActions';
import { getCurrentUserAction } from '@/app/actions/auth';
import { AuthModal } from '../auth/AuthModal';

interface ReportButtonProps {
  reportType: 'tool' | 'review' | 'user';
  targetId: string;
  targetName: string;
}

export function ReportButton({ reportType, targetId, targetName }: ReportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [reason, setReason] = useState('Broken link or outdated information');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleOpen = async () => {
    const res = await getCurrentUserAction();
    if (!res.success || !res.user) {
      setIsAuthOpen(true);
      return;
    }
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await submitReportAction(reportType, targetId, reason, details);
      if (!res.success) {
        setError(res.error || 'Failed to submit report.');
        setLoading(false);
        return;
      }
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setIsOpen(false);
        setDetails('');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleOpen}
        className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-rose-400 font-semibold transition-colors"
        title="Report this item to moderators"
      >
        <Flag className="w-3 h-3" />
        <span>Report</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  <Flag className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-100">Report {targetName}</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success ? (
              <div className="py-6 text-center space-y-2 animate-fade-in">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-slate-100">Report Filed</h4>
                <p className="text-xs text-slate-400">Our moderation team will investigate shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Reason for Report
                  </label>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-rose-500"
                  >
                    <option value="Broken link or outdated information">
                      Broken link or outdated information
                    </option>
                    <option value="Misleading capabilities or scam">
                      Misleading capabilities or scam
                    </option>
                    <option value="Inappropriate, offensive, or malicious content">
                      Inappropriate, offensive, or malicious content
                    </option>
                    <option value="Spam or duplicate listing">Spam or duplicate listing</option>
                    <option value="Other concern">Other concern</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Additional Details (Optional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Provide additional context to help our review..."
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-rose-500 resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs shadow-md shadow-rose-500/20 disabled:opacity-50"
                  >
                    {loading ? 'Submitting...' : 'Submit Report'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={() => setIsOpen(true)}
      />
    </>
  );
}

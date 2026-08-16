'use client';

import { useState } from 'react';
import { Flag, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { submitReportAction } from '@/app/actions/userActions';
import { AuthModal } from '../auth/AuthModal';

interface ReportButtonProps {
  reportType: 'tool' | 'review' | 'user';
  targetId: string;
  targetName: string;
}

export function ReportButton({ reportType, targetId, targetName }: ReportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState('Broken link or outdated information');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await submitReportAction(
      reportType,
      targetId,
      reason,
      details.trim() || undefined
    );

    if (!res.success && res.error?.includes('sign in')) {
      setLoading(false);
      setIsOpen(false);
      setIsAuthOpen(true);
      return;
    }

    if (!res.success) {
      setError(res.error || 'Failed to file report.');
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
      setTimeout(() => {
        setIsOpen(false);
      }, 1200);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setError(null);
          setSuccess(false);
          setDetails('');
          setIsOpen(true);
        }}
        className="inline-flex items-center gap-1 text-[11px] text-[#9FA59A] hover:text-[#D73A49] transition-colors"
        title="Report issue or outdated link"
      >
        <Flag className="w-3 h-3" />
        <span>Report</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#141613]/25 backdrop-blur-[6px] animate-fade-in">
          <div className="w-full max-w-md p-6 rounded-3xl bg-[#FBF9F5] border border-[#EAE6DC] shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE6DC]">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-full bg-[#FDF0F2] text-[#D73A49]">
                  <Flag className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-[#141613]">Report {targetName}</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-full text-[#73796E] hover:text-[#141613] hover:bg-[#F5F3ED]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-[#FDF0F2] border border-[#F8D2D7] text-[#D73A49] text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success ? (
              <div className="py-6 text-center space-y-2 animate-fade-in">
                <div className="w-12 h-12 mx-auto rounded-full bg-[#EDF7EE] text-[#1E7E34] flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-[#141613]">Report Filed</h4>
                <p className="text-xs text-[#73796E]">Our moderation team will investigate shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-[#73796E] uppercase tracking-wider mb-1.5">
                    Reason for Report
                  </label>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#E2DDD2] text-xs text-[#141613] focus:outline-none focus:border-[#141613]"
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
                  <label className="block text-[11px] font-bold text-[#73796E] uppercase tracking-wider mb-1.5">
                    Additional Details (Optional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Provide additional context to help our review..."
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    className="w-full p-3 rounded-xl bg-white border border-[#E2DDD2] text-xs text-[#141613] placeholder:text-[#94998E] focus:outline-none focus:border-[#141613] resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#EAE6DC]">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 rounded-full bg-[#F5F3ED] text-[#141613] text-xs font-semibold hover:bg-[#ECE8DF]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-interactive px-5 py-2 rounded-full bg-[#D73A49] hover:bg-[#B72A38] text-white font-bold text-xs shadow-md disabled:opacity-50"
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

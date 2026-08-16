'use client';

import { useState } from 'react';
import { Star, MessageSquare, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { submitReviewAction } from '@/app/actions/userActions';
import { AuthModal } from '../auth/AuthModal';

interface WriteReviewButtonProps {
  toolId: string;
  toolName: string;
}

export function WriteReviewButton({ toolId, toolName }: WriteReviewButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const handleOpen = () => {
    setError(null);
    setSuccess(false);
    setContent('');
    setRating(5);
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || rating < 1) return;

    setLoading(true);
    setError(null);

    const res = await submitReviewAction(toolId, rating, content);

    if (!res.success && res.error?.includes('sign in')) {
      setLoading(false);
      setIsOpen(false);
      setIsAuthOpen(true);
      return;
    }

    if (!res.success) {
      setError(res.error || 'Failed to submit review.');
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
        onClick={handleOpen}
        className="btn-interactive inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#141613] hover:bg-[#2A2E27] text-white font-bold text-xs shadow-sm transition-colors"
      >
        <MessageSquare className="w-3.5 h-3.5" />
        <span>Write a Review</span>
      </button>

      {/* Review Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#141613]/25 backdrop-blur-[6px] animate-fade-in">
          <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl bg-[#FBF9F5] border border-[#EAE6DC] shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE6DC]">
              <div>
                <h3 className="text-base font-bold text-[#141613]">Review {toolName}</h3>
                <p className="text-xs text-[#73796E]">Share your evaluation with the community</p>
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
                <h4 className="text-base font-bold text-[#141613]">Review Published!</h4>
                <p className="text-xs text-[#73796E]">Thank you for evaluating this tool.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Rating Stars */}
                <div>
                  <label className="block text-[11px] font-bold text-[#73796E] uppercase tracking-wider mb-2">
                    Overall Rating
                  </label>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 rounded-lg hover:bg-[#F5F3ED] transition-colors"
                      >
                        <Star
                          className={`w-6 h-6 transition-colors ${
                            (hoverRating || rating) >= star
                              ? 'fill-[#F5A623] text-[#F5A623]'
                              : 'text-[#D0C9BA]'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-[#141613] ml-2">
                      {hoverRating || rating}.0 Stars
                    </span>
                  </div>
                </div>

                {/* Review Text */}
                <div>
                  <label className="block text-[11px] font-bold text-[#73796E] uppercase tracking-wider mb-1.5">
                    Written Review
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe your practical experience, pros, cons, and performance..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
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
                    className="btn-interactive px-5 py-2 rounded-full bg-[#141613] hover:bg-[#2A2E27] text-white font-bold text-xs shadow-md disabled:opacity-50"
                  >
                    {loading ? 'Publishing...' : 'Post Review'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Auth Modal Trigger */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={() => setIsOpen(true)}
      />
    </>
  );
}

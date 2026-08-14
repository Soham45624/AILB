'use client';

export function WriteReviewButton() {
  return (
    <button
      onClick={() =>
        alert(
          'Sign in to submit a review! Auth integration will be enabled in the authentication stage.'
        )
      }
      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
    >
      + Write a Review
    </button>
  );
}

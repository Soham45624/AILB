import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export default function ToolDetailLoading() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-between">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 flex-1 w-full space-y-8 animate-pulse">
        {/* Back Link Skeleton */}
        <div className="h-4 w-28 bg-zinc-900 rounded" />

        {/* Hero Card Skeleton */}
        <div className="p-8 rounded-3xl bg-zinc-900/40 border border-zinc-850 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-zinc-800" />
            <div className="space-y-2 flex-1">
              <div className="h-6 w-48 bg-zinc-800 rounded-lg" />
              <div className="h-4 w-32 bg-zinc-850 rounded" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-4 w-full bg-zinc-850 rounded" />
            <div className="h-4 w-5/6 bg-zinc-850 rounded" />
          </div>
        </div>

        {/* Reviews Section Skeleton */}
        <div className="p-8 rounded-3xl bg-zinc-900/30 border border-zinc-850 space-y-4">
          <div className="h-5 w-44 bg-zinc-800 rounded" />
          <div className="h-20 w-full bg-zinc-900/60 rounded-2xl" />
        </div>
      </main>

      <Footer />
    </div>
  );
}

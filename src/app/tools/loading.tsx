import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export default function ToolsLoading() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-between">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 flex-1 w-full space-y-6 animate-pulse">
        {/* Header Skeleton */}
        <div className="space-y-2">
          <div className="h-8 w-64 bg-zinc-900 rounded-xl" />
          <div className="h-4 w-96 max-w-full bg-zinc-900/60 rounded" />
        </div>

        {/* Filter Bar Skeleton */}
        <div className="h-12 w-full bg-zinc-900/60 rounded-xl border border-zinc-850" />

        {/* Counter Skeleton */}
        <div className="h-4 w-40 bg-zinc-900/50 rounded" />

        {/* Cards Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
            <div
              key={i}
              className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-850 space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-zinc-800" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-4 w-28 bg-zinc-800 rounded" />
                  <div className="h-3 w-16 bg-zinc-800/60 rounded" />
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="h-3 w-full bg-zinc-850 rounded" />
                <div className="h-3 w-4/5 bg-zinc-850 rounded" />
              </div>
              <div className="pt-2 flex justify-between">
                <div className="h-4 w-16 bg-zinc-850 rounded" />
                <div className="h-4 w-12 bg-zinc-850 rounded" />
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}

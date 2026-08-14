import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-between">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 flex-1 w-full space-y-6 animate-pulse">
        {/* Banner Skeleton */}
        <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-850 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-zinc-800" />
            <div className="space-y-2">
              <div className="h-5 w-40 bg-zinc-800 rounded" />
              <div className="h-3 w-28 bg-zinc-850 rounded" />
            </div>
          </div>
          <div className="h-8 w-24 bg-zinc-800 rounded-xl" />
        </div>

        {/* Tabs Skeleton */}
        <div className="h-10 w-80 bg-zinc-900/60 rounded-xl" />

        {/* Content Skeleton */}
        <div className="h-64 w-full bg-zinc-900/30 rounded-2xl border border-zinc-850" />
      </main>

      <Footer />
    </div>
  );
}

import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export default function ToolsLoading() {
  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#141613] flex flex-col justify-between">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10 flex-1 w-full space-y-6 animate-pulse">
        {/* Header Skeleton */}
        <div className="space-y-2">
          <div className="h-8 w-64 bg-[#EAE6DC] rounded-xl" />
          <div className="h-4 w-96 max-w-full bg-[#F0ECE1] rounded" />
        </div>

        {/* Filter & Search Bar Skeleton */}
        <div className="h-12 w-full bg-white rounded-full border border-[#EAE6DC] shadow-sm" />

        {/* 2-Column Skeleton Layout */}
        <div className="flex items-start gap-8 pt-2">
          {/* Sidebar Skeleton */}
          <div className="hidden lg:block w-60 shrink-0 space-y-6">
            <div className="h-4 w-24 bg-[#EAE6DC] rounded" />
            <div className="space-y-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-[#EAE6DC] rounded-md" />
                  <div className="h-3 w-28 bg-[#F0ECE1] rounded" />
                </div>
              ))}
            </div>
          </div>

          {/* Cards Grid Skeleton */}
          <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="p-6 rounded-2xl bg-white border border-[#EAE6DC] space-y-4 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#EAE6DC]" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-32 bg-[#EAE6DC] rounded" />
                    <div className="h-3 w-20 bg-[#F0ECE1] rounded" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-full bg-[#F0ECE1] rounded" />
                  <div className="h-3 w-4/5 bg-[#F0ECE1] rounded" />
                </div>
                <div className="pt-4 border-t border-[#F2EFE8] flex justify-between items-center">
                  <div className="h-4 w-20 bg-[#EAE6DC] rounded-full" />
                  <div className="h-4 w-16 bg-[#EAE6DC] rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

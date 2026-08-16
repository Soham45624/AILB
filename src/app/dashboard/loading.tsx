import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#141613] flex flex-col justify-between">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 flex-1 w-full space-y-6 animate-pulse">
        {/* Banner Skeleton */}
        <div className="p-6 rounded-3xl bg-white border border-[#EAE6DC] flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[#EAE6DC]" />
            <div className="space-y-2">
              <div className="h-5 w-40 bg-[#EAE6DC] rounded" />
              <div className="h-3 w-28 bg-[#F0ECE1] rounded" />
            </div>
          </div>
          <div className="h-9 w-28 bg-[#EAE6DC] rounded-full" />
        </div>

        {/* Tabs Skeleton */}
        <div className="h-10 w-80 bg-white border border-[#EAE6DC] rounded-full" />

        {/* Content Skeleton */}
        <div className="h-64 w-full bg-white rounded-3xl border border-[#EAE6DC] shadow-sm" />
      </main>

      <Footer />
    </div>
  );
}

import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export default function ToolDetailLoading() {
  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#141613] flex flex-col justify-between">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 flex-1 w-full space-y-8 animate-pulse">
        {/* Back Link Skeleton */}
        <div className="h-4 w-28 bg-[#EAE6DC] rounded-full" />

        {/* Hero Card Skeleton */}
        <div className="p-8 rounded-3xl bg-white border border-[#EAE6DC] space-y-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#EAE6DC]" />
            <div className="space-y-2 flex-1">
              <div className="h-6 w-48 bg-[#EAE6DC] rounded-lg" />
              <div className="h-4 w-32 bg-[#F0ECE1] rounded" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-4 w-full bg-[#F0ECE1] rounded" />
            <div className="h-4 w-5/6 bg-[#F0ECE1] rounded" />
          </div>
        </div>

        {/* Reviews Section Skeleton */}
        <div className="p-8 rounded-3xl bg-white border border-[#EAE6DC] space-y-4 shadow-sm">
          <div className="h-5 w-44 bg-[#EAE6DC] rounded" />
          <div className="h-24 w-full bg-[#FBF9F5] border border-[#EAE6DC] rounded-2xl" />
        </div>
      </main>

      <Footer />
    </div>
  );
}

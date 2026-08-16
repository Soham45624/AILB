export default function Loading() {
  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#141613] flex flex-col justify-between">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 w-full space-y-10 animate-pulse">
        {/* Top Header Skeleton */}
        <div className="max-w-2xl mx-auto text-center space-y-4">
          <div className="h-4 w-32 bg-[#EAE6DC] rounded-full mx-auto" />
          <div className="h-14 w-full bg-[#EAE6DC] rounded-3xl" />
          <div className="h-4 w-72 max-w-full bg-[#F0ECE1] rounded mx-auto" />
          <div className="h-12 w-full max-w-xl bg-white border border-[#EAE6DC] rounded-full mx-auto shadow-sm" />
        </div>

        {/* Content Cards Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
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
    </div>
  );
}

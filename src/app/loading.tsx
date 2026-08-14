export default function Loading() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-between">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 w-full space-y-8 animate-pulse">
        {/* Top Header Skeleton */}
        <div className="space-y-3">
          <div className="h-4 w-32 bg-zinc-900 rounded-full" />
          <div className="h-10 w-96 max-w-full bg-zinc-900 rounded-xl" />
          <div className="h-4 w-72 max-w-full bg-zinc-900/60 rounded" />
        </div>

        {/* Content Cards Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
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
      </div>
    </div>
  );
}

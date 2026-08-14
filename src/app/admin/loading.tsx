export default function AdminLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Banner Skeleton */}
      <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-850 h-36" />

      {/* Metric Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div key={i} className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-850 h-28" />
        ))}
      </div>
    </div>
  );
}

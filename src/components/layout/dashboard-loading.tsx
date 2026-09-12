// Shared fallback for every dashboard route's loading.tsx. Next.js
// prefetches loading.tsx as an instant Suspense fallback on navigation
// (unlike ad-hoc <Suspense> boundaries), so clicking a sidebar link swaps to
// this immediately while the target page's data streams in behind it —
// that's what actually fixes sidebar-click lag, not a client-side spinner.
export function DashboardLoading() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-2">
          <div className="h-4 w-24 animate-pulse rounded bg-white/[0.06]" />
          <div className="h-8 w-64 animate-pulse rounded bg-white/[0.08]" />
        </div>
        <div className="h-9 w-32 animate-pulse rounded-md bg-white/[0.06]" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="glass-surface flex flex-col gap-3 rounded-lg p-5">
            <div className="h-3 w-20 animate-pulse rounded bg-white/[0.06]" />
            <div className="h-8 w-28 animate-pulse rounded bg-white/[0.08]" />
            <div className="h-3 w-32 animate-pulse rounded bg-white/[0.05]" />
          </div>
        ))}
      </div>

      <div className="glass-surface rounded-lg p-5">
        <div className="h-5 w-40 animate-pulse rounded bg-white/[0.07]" />
        <div className="mt-4 flex flex-col gap-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-12 w-full animate-pulse rounded-md bg-white/[0.04]" />
          ))}
        </div>
      </div>
    </div>
  );
}

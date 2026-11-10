export default function SiteLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading page"
      className="min-h-[60vh] bg-[#f6f9f7]"
    >
      <div className="animate-pulse">
        <div className="bg-pine-950 px-4 py-14 md:py-20">
          <div className="mx-auto max-w-7xl space-y-4">
            <div className="h-3 w-32 rounded bg-white/15" />
            <div className="h-10 max-w-xl rounded-xl bg-white/15" />
            <div className="h-4 max-w-2xl rounded bg-white/10" />
          </div>
        </div>
        <div className="mx-auto grid max-w-7xl gap-4 px-4 py-10 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="h-40 rounded-2xl border border-slate-200 bg-white shadow-sm" />
          ))}
        </div>
      </div>
      <span className="sr-only">Loading page content…</span>
    </div>
  );
}

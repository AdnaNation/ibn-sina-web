export default function QueueLoading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8" aria-busy="true" aria-label="Loading queue">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-2">
          <div className="h-9 w-52 animate-pulse rounded-lg bg-pine-100" />
          <div className="h-4 w-64 animate-pulse rounded bg-pine-50" />
        </div>
        <div className="h-10 w-44 animate-pulse rounded-lg bg-pine-50" />
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {[0, 1, 2, 3].map((item) => (
          <div
            key={item}
            className="h-10 w-28 animate-pulse rounded-full bg-pine-100"
          />
        ))}
      </div>

      <section className="mt-6 rounded-3xl border border-pine-100 bg-white p-6">
        <div className="h-7 w-56 animate-pulse rounded bg-pine-100" />
        <div className="mt-6 grid gap-6 md:grid-cols-[auto_1fr]">
          <div className="h-36 w-full animate-pulse rounded-2xl bg-pine-900/10 md:w-56" />
          <div className="space-y-3">
            <div className="h-12 w-48 animate-pulse rounded-full bg-pine-100" />
            <div className="h-4 w-64 animate-pulse rounded bg-pine-50" />
          </div>
        </div>
        <div className="mt-8 space-y-4">
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className="h-14 animate-pulse rounded-xl bg-pine-50" />
          ))}
        </div>
      </section>
      <p className="sr-only">Loading selected doctor queue…</p>
    </div>
  );
}

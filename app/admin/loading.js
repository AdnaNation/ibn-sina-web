import AdminNav from "@/components/AdminNav";
import { getSession } from "@/lib/auth";

function Skeleton({ className = "" }) {
  return <div aria-hidden="true" className={`animate-pulse rounded-xl bg-slate-200/80 ${className}`} />;
}

export default async function AdminLoading() {
  const p = await getSession();

  return (
    <>
      {p ? <AdminNav p={p} current="" /> : null}
      <main
        aria-busy="true"
        aria-live="polite"
        className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6"
      >
        <span className="sr-only">Loading admin page…</span>
        <div className="mb-7 space-y-3">
          <Skeleton className="h-3 w-36" />
          <Skeleton className="h-9 w-64 max-w-full" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} className="h-28" />
          ))}
        </div>
        <div className="mt-7 space-y-3 rounded-2xl border border-slate-200 bg-white p-5">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-5/6 max-w-full" />
        </div>
      </main>
    </>
  );
}

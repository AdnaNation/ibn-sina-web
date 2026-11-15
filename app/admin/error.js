"use client";
import Link from "next/link";

export default function AdminError({ error, reset }) {
  return (
    <main className="mx-auto flex min-h-[65vh] max-w-xl flex-col items-center justify-center px-5 py-12 text-center">
      <div className="grid size-14 place-items-center rounded-2xl bg-rose-50 text-rose-700" aria-hidden="true">!</div>
      <h1 className="mt-5 font-serif text-2xl font-semibold text-pine-950">This page could not load</h1>
      <p className="mt-2 text-sm leading-6 text-ink/65">An unexpected error interrupted the staff portal. Try loading the page again. Your sign-in session has not been intentionally cleared.</p>
      {error?.digest && <p className="mt-2 text-xs text-ink/40">Reference: {error.digest}</p>}
      <div className="mt-5 flex flex-wrap justify-center gap-3">
        <button onClick={() => reset()} className="rounded-full bg-pine-900 px-5 py-2.5 text-sm font-bold text-white">Try again</button>
        <Link href="/admin/login" className="rounded-full border border-pine-200 px-5 py-2.5 text-sm font-bold text-pine-800">Return to sign in</Link>
      </div>
    </main>
  );
}

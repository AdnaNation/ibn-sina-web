"use client";
import { TriangleAlert } from "lucide-react";

// Client component: cannot read the language cookie on the server, so show both languages.
export default function SiteError({ reset }) {
  return (
    <div className="mx-auto grid min-h-[50vh] max-w-xl place-items-center px-4 py-20 text-center">
      <div>
        <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-rose-50 text-alert"><TriangleAlert size={30} /></span>
        <h1 className="mt-6 text-2xl font-bold text-pine-950">কিছু একটা সমস্যা হয়েছে · Something went wrong</h1>
        <p className="mt-3 leading-7 text-slate-600">অনুগ্রহ করে আবার চেষ্টা করুন। সমস্যা থাকলে ১০৬১৫ নম্বরে কল করুন।<br />Please try again, or call 10615.</p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <button onClick={() => reset()} className="rounded-full bg-pine-800 px-6 py-3 text-sm font-bold text-white hover:bg-pine-700">আবার চেষ্টা করুন · Try again</button>
          <a href="tel:10615" className="rounded-full border border-pine-200 px-6 py-3 text-sm font-bold text-pine-900 hover:bg-pine-50">১০৬১৫</a>
        </div>
      </div>
    </div>
  );
}

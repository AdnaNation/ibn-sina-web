"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowUpRight, ChevronDown, Compass, BookOpen } from "lucide-react";
import Link from "next/link";

export default function PublicNavDropdown({ group, bn }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const pathname = usePathname();
  const Icon = group.label === (bn ? "সেবা ও শাখা" : "Explore") ? Compass : BookOpen;

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const handlePointer = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    const handleKey = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("pointerdown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className={`group/nav-trigger inline-flex items-center gap-1.5 rounded-full px-3.5 py-2.5 text-[13px] font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-pine-100 ${open ? "bg-pine-50 text-pine-900" : "text-slate-600 hover:bg-pine-50 hover:text-pine-900"}`}
      >
        {group.label}
        <ChevronDown size={14} className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute left-1/2 top-full z-[60] w-[292px] -translate-x-1/2 pt-4">
          <div className="overflow-hidden rounded-[22px] border border-pine-100/90 bg-white shadow-[0_22px_65px_rgba(8,45,34,.18)] ring-1 ring-black/[0.03]">
            <div className="relative overflow-hidden bg-gradient-to-br from-pine-950 via-pine-900 to-pine-800 px-5 py-4 text-white">
              <span className="absolute -right-5 -top-8 size-24 rounded-full border border-white/10" />
              <span className="absolute -right-1 -top-3 size-16 rounded-full border border-white/10" />
              <div className="relative flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-2xl bg-white/10 ring-1 ring-white/15">
                  <Icon size={19} />
                </span>
                <div>
                  <p className="text-sm font-bold tracking-wide">{group.label}</p>
                  <p className="mt-0.5 text-[11px] text-white/65">{bn ? "প্রয়োজনীয় তথ্য এক জায়গায়" : "Find what you need, in one place"}</p>
                </div>
              </div>
            </div>
            <div className="space-y-1 p-2.5">
              {group.links.map(([label, href], index) => (
                <Link
                  key={href}
                  href={href}
                  prefetch={true}
                  onClick={() => setOpen(false)}
                  className="group/item flex items-center justify-between gap-3 rounded-[14px] px-3.5 py-3 text-[13px] font-semibold text-slate-700 transition-all duration-200 hover:bg-pine-50 hover:pl-4 hover:text-pine-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine-200"
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-pine-50 text-[11px] font-bold text-pine-800 transition group-hover/item:bg-white group-hover/item:shadow-sm">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span>{label}</span>
                  </span>
                  <ArrowUpRight size={15} className="shrink-0 text-slate-300 transition group-hover/item:-translate-y-0.5 group-hover/item:translate-x-0.5 group-hover/item:text-pine-700" />
                </Link>
              ))}
            </div>
            <div className="border-t border-slate-100 bg-slate-50/80 px-5 py-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-[.16em] text-slate-400">{bn ? "স্বাস্থ্যসেবা প্রোটোটাইপ" : "Healthcare prototype"}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

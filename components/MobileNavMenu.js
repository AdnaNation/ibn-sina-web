"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Menu, X } from "lucide-react";

export default function MobileNavMenu({ links, trackLabel, bookLabel, bn }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close immediately on click and also when navigation changes by any means.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const closeMenu = () => setOpen(false);

  return (
    <div className="relative lg:hidden">
      <button
        type="button"
        aria-label={open ? (bn ? "নেভিগেশন মেনু বন্ধ করুন" : "Close navigation menu") : (bn ? "নেভিগেশন মেনু খুলুন" : "Open navigation menu")}
        aria-expanded={open}
        aria-controls="mobile-primary-menu"
        onClick={() => setOpen((value) => !value)}
        className="grid size-11 place-items-center rounded-xl border border-pine-100 text-pine-900 transition hover:bg-pine-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-pine-100"
      >
        {open ? <X size={21} /> : <Menu size={21} />}
      </button>

      {open && (
        <div
          id="mobile-primary-menu"
          className="absolute right-0 top-[58px] z-50 w-[min(88vw,340px)] rounded-2xl border border-pine-100 bg-white p-3 shadow-2xl shadow-pine-950/15"
        >
          <nav aria-label={bn ? "মোবাইল নেভিগেশন" : "Mobile navigation"} className="space-y-1">
            {links.map(([label, href]) => (
              <Link
                key={href}
                href={href}
                prefetch={true}
                onClick={closeMenu}
                className="block rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-pine-50 hover:text-pine-800"
              >
                {label}
              </Link>
            ))}
            <Link
              href="/track"
              prefetch={true}
              onClick={closeMenu}
              className="block rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-pine-50 hover:text-pine-800"
            >
              {trackLabel}
            </Link>
          </nav>
          <Link
            href="/appointment"
            prefetch={true}
            onClick={closeMenu}
            className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-pine-800 px-4 py-3 text-sm font-bold text-white transition hover:bg-pine-700"
          >
            {bookLabel}
            <ArrowUpRight size={16} />
          </Link>
        </div>
      )}
    </div>
  );
}

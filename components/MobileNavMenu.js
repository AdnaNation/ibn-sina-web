"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, ChevronDown, Menu, X } from "lucide-react";

export default function MobileNavMenu({ primaryLinks, groups, trackLabel, bookLabel, bn }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close immediately on click and also when navigation changes by any means.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const closeMenu = () => setOpen(false);
  const linkClass = "block rounded-2xl px-4 py-3.5 text-sm font-semibold text-slate-700 transition-all duration-200 hover:translate-x-0.5 hover:bg-pine-50 hover:text-pine-900";

  return (
    <div className="relative xl:hidden">
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
          className="absolute right-0 top-[58px] z-50 max-h-[min(78vh,620px)] w-[min(90vw,360px)] overflow-y-auto rounded-[26px] border border-pine-100/90 bg-white p-3 shadow-[0_24px_70px_rgba(8,45,34,.2)] ring-1 ring-black/[0.03]"
        >
          <nav aria-label={bn ? "মোবাইল নেভিগেশন" : "Mobile navigation"} className="space-y-1.5">
            {primaryLinks.map(([label, href]) => (
              <Link key={href} href={href} prefetch={true} onClick={closeMenu} className={linkClass}>
                {label}
              </Link>
            ))}
            {groups.map((group) => (
              <details key={group.label} className="group/mobile overflow-hidden rounded-2xl border border-transparent transition data-[open=true]:border-pine-100 data-[open=true]:bg-pine-50/50">
                <summary className="flex cursor-pointer list-none items-center justify-between rounded-2xl px-4 py-3.5 text-sm font-bold text-slate-700 transition hover:bg-pine-50 hover:text-pine-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-pine-100 [&::-webkit-details-marker]:hidden">
                  {group.label}
                  <ChevronDown size={16} className="transition group-open/mobile:rotate-180" />
                </summary>
                <div className="ml-4 mb-2 space-y-0.5 border-l-2 border-pine-200 pl-2">
                  {group.links.map(([label, href]) => (
                    <Link key={href} href={href} prefetch={true} onClick={closeMenu} className={linkClass}>
                      {label}
                    </Link>
                  ))}
                </div>
              </details>
            ))}
            <Link href="/track" prefetch={true} onClick={closeMenu} className={linkClass}>
              {trackLabel}
            </Link>
          </nav>
          <Link
            href="/appointment"
            prefetch={true}
            onClick={closeMenu}
            className="mt-3 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-pine-900 to-pine-700 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-pine-900/15 transition hover:-translate-y-0.5 hover:shadow-xl"
          >
            {bookLabel}
            <ArrowUpRight size={16} />
          </Link>
        </div>
      )}
    </div>
  );
}

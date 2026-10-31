import { Phone, ArrowUpRight, Menu, HeartPulse } from "lucide-react";
import { getT } from "@/lib/i18n";
import { setLang } from "@/app/actions";
import Link from "next/link";

export default async function Navbar() {
  const { lang, t, n } = await getT();

  const links = [
    [t.nav[0], "/doctors"],
    [t.nav[1], "/#services"],
    [t.nav[2], "/units"],
    [t.nav[5], "/live"],
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-pine-100/80 bg-white/95 shadow-[0_8px_30px_rgba(9,54,40,.045)] backdrop-blur-xl">
      <div className="text-white bg-pine-950">
        <div className="flex items-center justify-between gap-3 px-4 mx-auto text-xs h-9 max-w-7xl sm:text-sm">
          <a
            href="tel:10615"
            className="inline-flex items-center gap-2 font-semibold tracking-wide hover:text-brass-light"
          >
            <span className="grid rounded-full size-5 place-items-center bg-white/10">
              <Phone size={11} />
            </span>
            {t.hotline}: {n(10615)}
          </a>

          <span className="hidden text-pine-100/80 sm:block">{t.topline}</span>

          {/* Language Switcher */}
          <div className="flex items-center gap-1 rounded-full bg-white/10 p-0.5">
            {[
              ["en", "EN"],
              ["bn", "বাংলা"],
            ].map(([code, label]) => (
              <form key={code} action={setLang}>
                <input type="hidden" name="lang" value={code} />

                <button
                  type="submit"
                  aria-label={`Change language to ${label}`}
                  aria-pressed={lang === code}
                  className={`rounded-full px-2.5 py-1 text-[11px] font-bold transition ${
                    lang === code
                      ? "bg-white text-pine-950"
                      : "text-white/80 hover:bg-white/10"
                  }`}
                >
                  {label}
                </button>
              </form>
            ))}
          </div>
        </div>
      </div>

      <nav
        aria-label="Main navigation"
        className="mx-auto flex h-[76px] max-w-7xl items-center justify-between gap-4 px-4"
      >
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center min-w-0 gap-3 group"
          aria-label={t.brand + " home"}
        >
          <span className="grid text-white transition shadow-lg size-11 shrink-0 place-items-center rounded-2xl bg-pine-900 shadow-pine-900/15 group-hover:-rotate-3">
            <HeartPulse size={25} strokeWidth={2.1} />
          </span>

          <span className="min-w-0">
            <span className="block truncate font-serif text-[19px] font-semibold leading-tight text-pine-950 sm:text-[21px]">
              {t.brand}
            </span>
            <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[.15em] text-pine-600">
              {t.tagline}
            </span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="items-center hidden gap-7 lg:flex">
          {links.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              prefetch
              className="text-[13px] font-semibold text-slate-600 transition hover:text-pine-800"
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Desktop Actions */}
        <div className="items-center hidden gap-3 lg:flex">
          <Link
            href="/track"
            className="text-[13px] font-semibold text-pine-800 hover:text-pine-600"
          >
            {t.track}
          </Link>

          <Link
            href="/appointment"
            className="inline-flex items-center gap-2 rounded-full bg-pine-800 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-pine-900/15 transition hover:-translate-y-0.5 hover:bg-pine-700"
          >
            {t.book}
            <ArrowUpRight size={16} />
          </Link>
        </div>

        {/* Mobile Navigation */}
        <details className="relative group lg:hidden">
          <summary
            aria-label="Open navigation menu"
            className="grid size-11 cursor-pointer list-none place-items-center rounded-xl border border-pine-100 text-pine-900 hover:bg-pine-50 [&::-webkit-details-marker]:hidden"
          >
            <Menu size={21} />
          </summary>

          <div className="absolute right-0 top-[58px] z-50 w-[min(88vw,340px)] rounded-2xl border border-pine-100 bg-white p-3 shadow-2xl shadow-pine-950/15">
            <div className="space-y-1">
              {links.map(([label, href]) => (
                <Link
                  key={href}
                  href={href}
                  className="block px-4 py-3 text-sm font-semibold rounded-xl text-slate-700 hover:bg-pine-50 hover:text-pine-800"
                >
                  {label}
                </Link>
              ))}

              <Link
                href="/track"
                className="block px-4 py-3 text-sm font-semibold rounded-xl text-slate-700 hover:bg-pine-50"
              >
                {t.track}
              </Link>
            </div>

            <Link
              href="/appointment"
              className="flex items-center justify-center gap-2 px-4 py-3 mt-2 text-sm font-bold text-white rounded-xl bg-pine-800"
            >
              {t.book}
              <ArrowUpRight size={16} />
            </Link>
          </div>
        </details>
      </nav>
    </header>
  );
}

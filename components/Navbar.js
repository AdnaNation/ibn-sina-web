import Link from "next/link";
import { Phone, Menu } from "lucide-react";
import { getT } from "@/lib/i18n";
import { setLang } from "@/app/actions";

const hrefs = [
  "/doctors",
  "/services",
  "/units",
  "/packages",
  "/about",
  "/live",
  "/track",
];

export default async function Navbar() {
  const { lang, t, n } = await getT();
  const links = t.nav.map((label, i) => [label, hrefs[i]]);

  return (
    <header className="sticky top-0 z-40 bg-paper/95 backdrop-blur">
      <div className="text-sm bg-pine-950 text-pine-100">
        <div className="flex items-center justify-between gap-4 px-4 mx-auto max-w-7xl h-9">
          <a
            href="tel:10615"
            className="flex items-center gap-2 font-medium hover:text-white"
          >
            <span className="relative flex size-2" aria-hidden>
              <span className="absolute inline-flex rounded-full opacity-75 size-full bg-flag animate-ping motion-reduce:animate-none" />
              <span className="relative rounded-full size-2 bg-flag" />
            </span>
            <Phone size={14} aria-hidden /> {t.hotline} {n(10615)}
          </a>
          <div className="flex items-center gap-4">
            <Link
              href="/notice"
              className="hidden md:inline text-brass-light hover:text-white"
            >
              {t.fraud}
            </Link>
            <form
              action={setLang}
              className="flex gap-1 text-xs"
              aria-label="Language"
            >
              {[
                ["en", "EN"],
                ["bn", "বাংলা"],
              ].map(([code, label]) => (
                <button
                  key={code}
                  name="lang"
                  value={code}
                  aria-pressed={lang === code}
                  className={`px-2.5 py-1 rounded ${lang === code ? "bg-pine-700 text-white" : "hover:bg-pine-800"}`}
                >
                  {label}
                </button>
              ))}
            </form>
          </div>
        </div>
      </div>

      <nav
        className="flex items-center justify-between h-16 px-4 mx-auto max-w-7xl"
        aria-label="Main"
      >
        <Link href="/" className="flex items-center gap-3">
          <span className="grid font-serif text-xl text-white rounded-full place-items-center size-10 bg-flag ring-4 ring-pine-800">
            ই
          </span>
          <span className="font-serif text-xl leading-none text-pine-900">
            {t.brand}
            <span className="block text-[11px] font-sans text-pine-700 mt-1">
              {t.tagline}
            </span>
          </span>
        </Link>

        <ul className="hidden xl:flex items-center gap-6 text-[15px] font-medium">
          {links.map(([label, href]) => (
            <li key={href}>
              <Link href={href} className="text-ink/80 hover:text-pine-700">
                {label}
              </Link>
            </li>
          ))}
        </ul>

        <Link
          href="/appointment"
          className="hidden px-5 py-2 text-sm font-semibold text-white rounded-full xl:inline-flex bg-pine-800 hover:bg-pine-700"
        >
          {t.book}
        </Link>

        <details className="relative xl:hidden">
          <summary
            className="p-2 -mr-2 list-none cursor-pointer"
            aria-label="Menu"
          >
            <Menu />
          </summary>
          <div className="absolute right-0 w-64 p-3 bg-white border shadow-xl top-12 rounded-xl border-pine-100">
            {links.map(([label, href]) => (
              <Link
                key={href}
                href={href}
                className="block px-3 py-2 rounded-lg hover:bg-pine-50"
              >
                {label}
              </Link>
            ))}
            <Link
              href="/appointment"
              className="block py-2 mt-2 font-semibold text-center text-white rounded-full bg-pine-800"
            >
              {t.book}
            </Link>
          </div>
        </details>
      </nav>
      <div className="jamdani" aria-hidden />
    </header>
  );
}

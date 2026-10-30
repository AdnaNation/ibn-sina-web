import Link from "next/link";
import { Phone, Menu } from "lucide-react";

const links = [
  ["Find a doctor", "/doctors"],
  ["Services", "/services"],
  ["Our units", "/units"],
  ["Health packages", "/packages"],
  ["Patient care", "/patient-care"],
  ["About", "/about"],
  ["News", "/news"],
  ["Live queue", "/live"],
  ["Track my turn", "/track"],
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 bg-paper/95 backdrop-blur border-b border-pine-100">
      <div className="bg-pine-950 text-pine-100 text-sm">
        <div className="mx-auto max-w-7xl px-4 h-9 flex items-center justify-between gap-4">
          <a
            href="tel:10615"
            className="flex items-center gap-2 font-medium hover:text-white"
          >
            <Phone size={14} aria-hidden /> Hotline 10615
          </a>
          <div className="flex items-center gap-4">
            <Link
              href="/notice"
              className="hidden sm:inline text-brass-light hover:text-white"
            >
              Job fraud notice: we never charge for jobs
            </Link>
            <span className="flex gap-1 text-xs" aria-label="Language">
              <button className="px-2 py-0.5 rounded bg-pine-800 text-white">
                EN
              </button>
              <button className="px-2 py-0.5 rounded hover:bg-pine-800">
                বাংলা
              </button>
            </span>
          </div>
        </div>
      </div>

      <nav
        className="mx-auto max-w-7xl px-4 h-16 flex items-center justify-between"
        aria-label="Main"
      >
        <Link href="/" className="flex items-center gap-3">
          <span className="grid place-items-center size-9 rounded-full bg-pine-900 text-brass-light font-serif text-lg">
            ই
          </span>
          <span className="font-serif text-xl leading-none text-pine-900">
            Ibn Sina Trust
            <span className="block text-[11px] font-sans text-pine-600 mt-1">
              Serving humanity since 1980
            </span>
          </span>
        </Link>

        <ul className="hidden lg:flex items-center gap-7 text-[15px] font-medium">
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
          className="hidden lg:inline-flex rounded-full bg-pine-900 px-5 py-2 text-sm font-semibold text-white hover:bg-pine-700"
        >
          Book an appointment
        </Link>

        {/* Mobile menu: no JS needed */}
        <details className="lg:hidden relative">
          <summary
            className="list-none cursor-pointer p-2 -mr-2"
            aria-label="Menu"
          >
            <Menu />
          </summary>
          <div className="absolute right-0 top-12 w-64 rounded-xl bg-white shadow-xl border border-pine-100 p-3">
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
              className="mt-2 block text-center rounded-full bg-pine-900 py-2 text-white font-semibold"
            >
              Book an appointment
            </Link>
          </div>
        </details>
      </nav>
    </header>
  );
}

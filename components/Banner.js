import Link from "next/link";
import { Phone } from "lucide-react";
import { getT } from "@/lib/i18n";

function Ambulance() {
  return (
    <svg
      viewBox="0 0 120 58"
      className="ambulance absolute bottom-[14px] left-0 w-24"
      aria-hidden="true"
    >
      <rect x="4" y="10" width="72" height="34" rx="4" fill="#fff" />
      <path d="M76 18h22l14 14v12H76z" fill="#fff" />
      <path d="M84 22h12l8 10H84z" fill="#9FD3C2" />
      <rect x="4" y="40" width="108" height="4" fill="#F42A41" />
      <path d="M36 14h8v8h8v8h-8v8h-8v-8h-8v-8h8z" fill="#F42A41" />
      <rect x="46" y="3" width="14" height="6" rx="2" className="light" />
      <circle cx="24" cy="48" r="7" fill="#10241D" />
      <circle cx="24" cy="48" r="3" fill="#ccc" />
      <circle cx="92" cy="48" r="7" fill="#10241D" />
      <circle cx="92" cy="48" r="3" fill="#ccc" />
    </svg>
  );
}

export default async function Banner() {
  const { t, n } = await getT();
  return (
    <section className="relative overflow-hidden text-white bg-pine-900 lattice">
      <div className="flex flex-wrap items-center justify-between gap-6 px-4 mx-auto max-w-7xl pt-14 pb-28">
        <div>
          <h2 className="font-serif text-3xl md:text-4xl">{t.bannerTitle}</h2>
          <p className="max-w-xl mt-2 text-pine-100">{t.bannerSub}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <a
            href="tel:10615"
            className="inline-flex items-center gap-2 px-6 py-3 font-semibold rounded-full siren bg-flag hover:brightness-110"
          >
            <Phone size={18} aria-hidden /> {t.call} {n(10615)}
          </a>
          <Link
            href="/appointment"
            className="px-6 py-3 font-semibold bg-white rounded-full text-pine-900 hover:bg-pine-50"
          >
            {t.bookOnline}
          </Link>
        </div>
      </div>
      <div
        className="absolute inset-x-0 h-px bottom-3 bg-white/25"
        aria-hidden
      />
      <Ambulance />
    </section>
  );
}

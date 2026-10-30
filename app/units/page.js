import Link from "next/link";
import { MapPin, Phone } from "lucide-react";
import { getUnits } from "@/lib/data";

export const metadata = { title: "Our units | Ibn Sina Trust" };

export default async function UnitsPage() {
  const units = await getUnits();
  const cities = [...new Set(units.map((u) => u.city))];
  return (
    <div className="mx-auto max-w-7xl px-4 py-14">
      <h1 className="font-serif text-4xl md:text-5xl text-pine-900">
        Our units
      </h1>
      {cities.map((city) => (
        <section key={city} className="mt-12">
          <h2 className="font-serif text-2xl text-pine-800 pb-2 border-b-2 border-brass">
            {city}
          </h2>
          <ul className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {units
              .filter((u) => u.city === city)
              .map((u) => (
                <li
                  key={u.slug}
                  className="rounded-2xl bg-white border border-pine-100 p-5"
                >
                  <p className="text-xs text-pine-600">{u.type}</p>
                  <Link
                    href={`/units/${u.slug}`}
                    className="mt-1 block font-semibold hover:text-pine-700"
                  >
                    {u.name.replace("Ibn Sina ", "")}, {u.area}
                  </Link>
                  <div className="mt-4 flex items-center gap-4 text-sm">
                    <a
                      href={`tel:${u.hotline}`}
                      className="inline-flex items-center gap-1.5 hover:text-pine-700"
                    >
                      <Phone size={14} aria-hidden /> {u.hotline}
                    </a>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${u.name} ${u.area} ${u.city}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 hover:text-pine-700"
                    >
                      <MapPin size={14} aria-hidden /> Directions
                    </a>
                  </div>
                </li>
              ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

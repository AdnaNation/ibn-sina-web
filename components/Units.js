import Link from "next/link";

const row = (u) => (
  <li key={u.slug}>
    <Link
      href={`/units/${u.slug}`}
      className="flex items-baseline justify-between gap-4 py-3 hover:text-pine-700"
    >
      <span>
        {u.name.replace("Ibn Sina ", "")},{" "}
        <span className="font-semibold">{u.area}</span>
      </span>
      <span className="text-xs text-pine-600 shrink-0">{u.type}</span>
    </Link>
  </li>
);

import { getT } from "@/lib/i18n";
export default async function Units({ units }) {
  const { t } = await getT();

  const dhaka = units.filter((u) => u.city === "Dhaka");
  const rest = units.filter((u) => u.city !== "Dhaka");
  return (
    <section className="px-4 py-20 mx-auto max-w-7xl">
      <h2 className="font-serif text-4xl md:text-5xl text-pine-900">
        {t.unitsTitle}
      </h2>
      <div className="grid gap-12 mt-10 lg:grid-cols-2">
        <div>
          <h3 className="pb-2 font-serif text-2xl border-b-2 text-pine-800 border-brass">
            {t.dhaka}
          </h3>
          <ul className="divide-y divide-pine-100">{dhaka.map(row)}</ul>
        </div>
        <div>
          <h3 className="pb-2 font-serif text-2xl border-b-2 text-pine-800 border-brass">
            {t.across}
          </h3>
          <ul className="divide-y divide-pine-100">{rest.map(row)}</ul>
          <Link
            href="/units"
            className="inline-block mt-6 font-semibold text-pine-700 hover:text-pine-900"
          >
            {t.allUnits}
          </Link>
        </div>
      </div>
    </section>
  );
}

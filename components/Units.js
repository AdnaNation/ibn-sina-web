import Link from 'next/link';

const row = (u) => (
  <li key={u.slug}>
    <Link href={`/units/${u.slug}`} className="flex items-baseline justify-between gap-4 py-3 hover:text-pine-700">
      <span>{u.name.replace('Ibn Sina ', '')}, <span className="font-semibold">{u.area}</span></span>
      <span className="text-xs text-pine-600 shrink-0">{u.type}</span>
    </Link>
  </li>
);

export default function Units({ units }) {
  const dhaka = units.filter((u) => u.city === 'Dhaka');
  const rest = units.filter((u) => u.city !== 'Dhaka');
  return (
    <section className="mx-auto max-w-7xl px-4 py-20">
      <h2 className="font-serif text-4xl md:text-5xl text-pine-900">Find the unit nearest to you</h2>
      <div className="mt-10 grid gap-12 lg:grid-cols-2">
        <div>
          <h3 className="font-serif text-2xl text-pine-800 pb-2 border-b-2 border-brass">Dhaka</h3>
          <ul className="divide-y divide-pine-100">{dhaka.map(row)}</ul>
        </div>
        <div>
          <h3 className="font-serif text-2xl text-pine-800 pb-2 border-b-2 border-brass">Across Bangladesh</h3>
          <ul className="divide-y divide-pine-100">{rest.map(row)}</ul>
          <Link href="/units" className="mt-6 inline-block font-semibold text-pine-700 hover:text-pine-900">
            See all units on the map
          </Link>
        </div>
      </div>
    </section>
  );
}

import { Search } from 'lucide-react';

const field = 'w-full rounded-lg border border-pine-100 bg-paper px-3 py-3 text-[15px] focus:border-pine-600';

export default function Hero({ units, departments }) {
  const unitNames = [...new Set(units.map((u) => `${u.area}, ${u.city}`))];
  return (
    <section className="relative bg-pine-900 lattice text-white">
      <div className="mx-auto max-w-7xl px-4 pt-16 pb-36 md:pt-24 md:pb-44">
        <p className="rise text-brass-light font-medium">Pioneer in healthcare, since June 1980</p>
        <h1 className="rise-2 mt-4 max-w-3xl font-serif text-5xl md:text-7xl leading-[1.05] tracking-tight">
          Good medicine should not depend on what you can afford.
        </h1>
        <p className="rise-3 mt-6 max-w-xl text-lg text-pine-100">
          Hospitals, diagnostic centers and consultation units in {new Set(units.map((u) => u.city)).size} cities,
          with 25% off on all diagnostic tests.
        </p>
      </div>

      {/* Search panel overlaps the hero edge */}
      <div className="absolute inset-x-0 bottom-0 translate-y-1/2">
        <form action="/doctors" className="mx-auto w-[calc(100%-2rem)] max-w-5xl rounded-2xl bg-white p-4 md:p-5 shadow-2xl shadow-pine-950/20 grid gap-3 md:grid-cols-[1.4fr_1fr_1fr_auto] text-ink">
          <label className="block">
            <span className="text-sm font-semibold text-pine-800">Doctor or specialty</span>
            <input name="q" placeholder="e.g. Cardiology, Dr. Hayee" className={`mt-1 ${field}`} />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-pine-800">Department</span>
            <select name="department" className={`mt-1 ${field}`} defaultValue="">
              <option value="">Any department</option>
              {departments.map((d) => <option key={d.slug} value={d.slug}>{d.name}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-pine-800">Branch</span>
            <select name="branch" className={`mt-1 ${field}`} defaultValue="">
              <option value="">Any branch</option>
              {unitNames.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </label>
          <button className="self-end inline-flex items-center justify-center gap-2 rounded-lg bg-brass px-6 py-3 font-semibold text-pine-950 hover:bg-brass-light">
            <Search size={18} aria-hidden /> Find a doctor
          </button>
        </form>
      </div>
    </section>
  );
}

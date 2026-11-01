import { getT } from "@/lib/i18n";

// Every number is computed from the live directory data, never typed in by hand.
export default async function Stats({ units, departments }) {
  const { t, n } = await getT();
  const centres = units.filter((u) => u.type !== "Education");
  const years = Math.max(1, new Date().getFullYear() - 1980);
  const items = [
    [years + "+", t.statYears],
    [centres.length, t.statUnits],
    [new Set(centres.map((u) => u.city)).size, t.statCities],
    [departments.length, t.statDepts],
  ];
  return (
    <section id="about" className="relative z-10 mx-auto max-w-7xl px-4 py-8">
      <dl className="grid grid-cols-2 gap-y-6 rounded-3xl border border-pine-100 bg-white p-6 shadow-[0_18px_50px_rgba(8,58,42,.07)] md:grid-cols-4 md:p-8">
        {items.map(([value, label], i) => (
          <div key={label} className={`px-2 md:px-6 ${i % 2 ? "border-l border-pine-100" : ""} ${i > 0 ? "md:border-l md:border-pine-100" : ""}`}>
            <dd className="font-serif text-4xl font-semibold text-pine-900 sm:text-5xl">{typeof value === "number" ? n(value) : value.replace(/\d+/, (m) => n(Number(m)))}</dd>
            <dt className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">{label}</dt>
          </div>
        ))}
      </dl>
    </section>
  );
}

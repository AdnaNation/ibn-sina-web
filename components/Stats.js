import { getT } from "@/lib/i18n";

export default async function Stats({ units, doctorCount }) {
  const { t, n } = await getT();
  const items = [n(1980), n(units.length), `${n(doctorCount)}+`, `${n(25)}%`];
  return (
    <section className="pt-40 pb-6 md:pt-36">
      <dl className="grid grid-cols-2 px-4 mx-auto max-w-7xl md:grid-cols-4 gap-y-8">
        {items.map((num, i) => (
          <div
            key={i}
            className={`px-4 ${i ? "md:border-l border-pine-100" : ""}`}
          >
            <dt className="font-serif text-4xl text-pine-800">{num}</dt>
            <dd className="mt-1 text-sm text-ink/70 max-w-[16rem]">
              {t.stats[i]}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

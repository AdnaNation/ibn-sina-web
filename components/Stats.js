export default function Stats({ units, doctorCount }) {
  const items = [
    ['1980', 'year the trust was founded'],
    [units.length, 'hospitals, diagnostic centers and institutes'],
    [`${doctorCount}+`, 'doctors you can book'],
    ['25%', 'off all diagnostic tests'],
  ];
  return (
    <section className="pt-40 md:pt-36 pb-6">
      <dl className="mx-auto max-w-7xl px-4 grid grid-cols-2 md:grid-cols-4 gap-y-8">
        {items.map(([n, label], i) => (
          <div key={label} className={`px-4 ${i ? 'md:border-l border-pine-100' : ''}`}>
            <dt className="font-serif text-4xl text-pine-800">{n}</dt>
            <dd className="mt-1 text-sm text-ink/70 max-w-[16rem]">{label}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

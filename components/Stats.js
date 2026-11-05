import { getT } from "@/lib/i18n";

// Values are generated from the current demo directory, not verified hospital statistics.
export default async function Stats({ units, departments }) {
  const { t, n, lang } = await getT();
  const centres = units.filter((u) => u.type !== "Education");
  const items = [
    [centres.length, lang === "bn" ? "ডেমো ডিরেক্টরিতে প্রদর্শিত অবস্থান" : "Locations in the demo directory"],
    [new Set(centres.map((u) => u.city)).size, lang === "bn" ? "ডেমো ডেটায় অন্তর্ভুক্ত শহর" : "Cities represented in demo data"],
    [departments.length, lang === "bn" ? "নমুনা বিশেষজ্ঞ বিভাগ" : "Sample specialties"],
  ];
  return (
    <section id="about" className="relative z-10 mx-auto max-w-7xl px-4 py-8">
      <dl className="grid grid-cols-1 gap-y-6 rounded-3xl border border-pine-100 bg-white p-6 shadow-[0_18px_50px_rgba(8,58,42,.07)] sm:grid-cols-3 sm:p-8">
        {items.map(([value, label], i) => (
          <div key={label} className={`px-2 sm:px-6 ${i > 0 ? "sm:border-l sm:border-pine-100" : ""}`}>
            <dd className="font-serif text-4xl font-semibold text-pine-900 sm:text-5xl">{n(value)}</dd>
            <dt className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">{label}</dt>
          </div>
        ))}
      </dl>
      <p className="mt-3 px-2 text-center text-[11px] leading-5 text-slate-500">
        {lang === "bn"
          ? "এগুলো কেবল প্রদর্শনীর নমুনা ডেটা; ইবনে সিনা ট্রাস্টের প্রকৃত পরিসংখ্যান নয়।"
          : "These figures are demonstration data only; they are not actual Ibn Sina Trust statistics."}
      </p>
    </section>
  );
}

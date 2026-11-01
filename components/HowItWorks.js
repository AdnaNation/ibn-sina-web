import { Search, CalendarCheck, Radio } from "lucide-react";
import { getT } from "@/lib/i18n";

export default async function HowItWorks() {
  const { t, n } = await getT();
  const steps = [[Search, t.how1T, t.how1D], [CalendarCheck, t.how2T, t.how2D], [Radio, t.how3T, t.how3D]];
  return (
    <section className="bg-white py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-pine-700">{t.howEyebrow}</p>
          <h2 className="mt-3 font-serif text-3xl font-semibold text-pine-950 md:text-4xl">{t.howTitle}</h2>
        </div>
        <ol className="mt-10 grid gap-5 md:grid-cols-3">
          {steps.map(([Icon, title, text], i) => (
            <li key={title} className="relative rounded-3xl border border-pine-100 bg-paper p-7">
              <span className="absolute right-6 top-5 font-serif text-6xl font-semibold text-pine-100" aria-hidden="true">{n(i + 1)}</span>
              <span className="grid size-12 place-items-center rounded-2xl bg-pine-800 text-white"><Icon size={22} /></span>
              <h3 className="mt-5 text-xl font-bold text-pine-950">{title}</h3>
              <p className="mt-2 text-[15px] leading-7 text-slate-600">{text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

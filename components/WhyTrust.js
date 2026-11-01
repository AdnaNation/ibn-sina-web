import { HeartHandshake, MapPinned, CalendarClock, TimerReset } from "lucide-react";
import { getT } from "@/lib/i18n";

export default async function WhyTrust() {
  const { t } = await getT();
  const items = [
    [HeartHandshake, t.why1T, t.why1D],
    [MapPinned, t.why2T, t.why2D],
    [CalendarClock, t.why3T, t.why3D],
    [TimerReset, t.why4T, t.why4D],
  ];
  return (
    <section className="relative overflow-hidden bg-pine-950 py-16 text-white md:py-20">
      <div className="lattice absolute inset-0 opacity-60" aria-hidden="true" />
      <div className="relative mx-auto max-w-7xl px-4">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-brass">{t.whyEyebrow}</p>
          <h2 className="mt-3 font-serif text-3xl font-semibold md:text-4xl">{t.whyTitle}</h2>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map(([Icon, title, text]) => (
            <div key={title} className="rounded-2xl border border-white/10 bg-white/[.06] p-6 backdrop-blur">
              <span className="grid size-11 place-items-center rounded-xl bg-brass text-pine-950"><Icon size={21} /></span>
              <h3 className="mt-4 text-lg font-bold">{title}</h3>
              <p className="mt-2 text-sm leading-7 text-pine-100/80">{text}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="jamdani absolute bottom-0 left-0 right-0" aria-hidden="true" />
    </section>
  );
}

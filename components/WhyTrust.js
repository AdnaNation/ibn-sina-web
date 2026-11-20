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
    <section className="bg-pine-950 py-16 text-white md:py-20">
      <div className="mx-auto max-w-7xl px-4">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-[#d5b18a]">{t.whyEyebrow}</p>
          <h2 className="mt-3 font-serif text-3xl font-medium leading-tight md:text-4xl">{t.whyTitle}</h2>
        </div>
        <ul className="mt-9 grid gap-0 sm:grid-cols-2 lg:grid-cols-4">
          {items.map(([Icon, title, text], i) => (
            <li key={title} className={`py-5 sm:px-5 ${i % 2 ? "sm:border-l sm:border-white/15" : ""} ${i >= 2 ? "lg:border-t lg:border-white/15" : ""} ${i % 2 === 0 ? "lg:pl-0" : ""}`}>
              <Icon size={20} strokeWidth={1.6} className="text-[#d5b18a]"/>
              <h3 className="mt-4 text-base font-medium">{title}</h3>
              <p className="mt-2 text-sm leading-7 text-white/70">{text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
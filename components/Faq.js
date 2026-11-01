import { Plus } from "lucide-react";
import { getT } from "@/lib/i18n";

// Native <details>: works without JavaScript and is keyboard accessible.
export default async function Faq() {
  const { t } = await getT();
  return (
    <section className="mx-auto max-w-3xl px-4 py-16 md:py-20">
      <div className="text-center">
        <p className="text-xs font-bold uppercase tracking-[.2em] text-pine-700">{t.faqEyebrow}</p>
        <h2 className="mt-3 font-serif text-3xl font-semibold text-pine-950 md:text-4xl">{t.faqTitle}</h2>
      </div>
      <div className="mt-8 space-y-3">
        {t.faq.map(([q, a]) => (
          <details key={q} className="group rounded-2xl border border-slate-200 bg-white px-5 py-4 open:border-pine-200 open:shadow-sm">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-bold text-pine-950 [&::-webkit-details-marker]:hidden">
              {q}
              <Plus size={18} className="shrink-0 text-pine-700 transition group-open:rotate-45" />
            </summary>
            <p className="mt-3 text-[15px] leading-7 text-slate-600">{a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

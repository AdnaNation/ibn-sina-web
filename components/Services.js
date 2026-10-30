import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getT } from "@/lib/i18n";
export default async function Services({ services }) {
  const { t } = await getT();
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 grid gap-10 lg:grid-cols-[1fr_1.6fr]">
      <div className="self-start lg:sticky lg:top-32">
        <h2 className="font-serif text-4xl leading-tight md:text-5xl text-pine-900">
          {t.servicesTitle}
        </h2>
        <p className="max-w-sm mt-4 text-ink/70">{t.servicesSub}</p>

        <Link
          href="/packages"
          className="inline-flex items-center gap-2 mt-6 font-semibold text-pine-700 hover:text-pine-900"
        >
          Compare health check-up packages → {t.packages}
        </Link>
      </div>

      <ul className="divide-y divide-pine-100 border-y border-pine-100">
        {services.map((s) => (
          <li key={s.slug}>
            <Link
              href={s.href}
              className="group grid gap-1 py-6 md:grid-cols-[14rem_1fr_auto] md:gap-8 md:items-baseline hover:bg-pine-50/60 px-2 -mx-2 rounded-lg"
            >
              <h3 className="font-serif text-2xl text-pine-800">{s.title}</h3>
              <p className="text-ink/75 max-w-prose">{s.text}</p>
              <ArrowRight
                className="hidden transition-transform md:block text-pine-600 group-hover:translate-x-1"
                aria-hidden
              />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

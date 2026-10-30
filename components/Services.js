import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function Services({ services }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 grid gap-10 lg:grid-cols-[1fr_1.6fr]">
      <div className="lg:sticky lg:top-32 self-start">
        <h2 className="font-serif text-4xl md:text-5xl text-pine-900 leading-tight">What we treat, scan and test</h2>
        <p className="mt-4 text-ink/70 max-w-sm">
          Every unit follows the same quality policy. Choose a service to see which branches offer it.
        </p>
        <Link href="/packages" className="mt-6 inline-flex items-center gap-2 font-semibold text-pine-700 hover:text-pine-900">
          Compare health check-up packages <ArrowRight size={16} aria-hidden />
        </Link>
      </div>

      <ul className="divide-y divide-pine-100 border-y border-pine-100">
        {services.map((s) => (
          <li key={s.slug}>
            <Link href={s.href} className="group grid gap-1 py-6 md:grid-cols-[14rem_1fr_auto] md:gap-8 md:items-baseline hover:bg-pine-50/60 px-2 -mx-2 rounded-lg">
              <h3 className="font-serif text-2xl text-pine-800">{s.title}</h3>
              <p className="text-ink/75 max-w-prose">{s.text}</p>
              <ArrowRight className="hidden md:block text-pine-600 group-hover:translate-x-1 transition-transform" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

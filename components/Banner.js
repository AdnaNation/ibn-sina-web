import Link from 'next/link';
import { Phone } from 'lucide-react';

export default function Banner() {
  return (
    <section className="bg-pine-900 lattice text-white">
      <div className="mx-auto max-w-7xl px-4 py-14 flex flex-wrap items-center justify-between gap-6">
        <div>
          <h2 className="font-serif text-3xl md:text-4xl">Need help choosing a doctor?</h2>
          <p className="mt-2 text-pine-100">Our team answers the hotline every day. Tell us your symptoms and we will point you to the right branch.</p>
        </div>
        <div className="flex gap-3">
          <a href="tel:10615" className="inline-flex items-center gap-2 rounded-full bg-alert px-6 py-3 font-semibold hover:brightness-110">
            <Phone size={18} aria-hidden /> Call 10615
          </a>
          <Link href="/appointment" className="rounded-full bg-white px-6 py-3 font-semibold text-pine-900 hover:bg-pine-50">Book online</Link>
        </div>
      </div>
    </section>
  );
}

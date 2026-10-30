import Link from 'next/link';
import { MapPin, Phone, Mail } from 'lucide-react';

const social = [
  ['Facebook', 'https://www.facebook.com/ibnsinatrustofficial/'],
  ['LinkedIn', 'https://www.linkedin.com/company/ibn-sina-trust/'],
  ['Twitter', 'https://twitter.com/ibnsinatrust/'],
  ['YouTube', 'https://www.youtube.com/@ibnsinatrustofficial'],
];

export default function Footer() {
  return (
    <footer className="bg-pine-950 text-pine-100">
      <div className="mx-auto max-w-7xl px-4 py-14 grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="font-serif text-2xl text-white">The Ibn Sina Trust</p>
          <p className="mt-3 max-w-sm text-sm text-pine-100/80">
            Started in June 1980 with one aim: to serve humanity and bring healthcare to the people of Bangladesh at affordable cost.
          </p>
          <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-1 text-sm">
            {social.map(([n, h]) => <li key={n}><a href={h} className="hover:text-white underline-offset-4 hover:underline">{n}</a></li>)}
          </ul>
        </div>
        <ul className="space-y-3 text-sm">
          <li className="flex gap-2"><MapPin size={16} className="mt-0.5 shrink-0" aria-hidden /> House 48, Road 9/A, Dhanmondi, Dhaka 1209</li>
          <li className="flex gap-2"><Phone size={16} className="mt-0.5 shrink-0" aria-hidden /> <a href="tel:10615" className="hover:text-white">10615</a>, <a href="tel:+8809610010615" className="hover:text-white">+88 09610010615</a></li>
          <li className="flex gap-2"><Mail size={16} className="mt-0.5 shrink-0" aria-hidden /> <Link href="/contact" className="hover:text-white">Send us a message</Link></li>
        </ul>
        <ul className="space-y-2 text-sm">
          {[['Careers', 'https://career.ibnsinatrust.com'], ['Scholarship', 'https://scholarship.ibnsinatrust.com'], ['Zakat', '/zakat'], ['Privacy policy', '/privacy-policy']].map(([n, h]) => (
            <li key={n}><Link href={h} className="hover:text-white">{n}</Link></li>
          ))}
        </ul>
      </div>
      <p className="border-t border-pine-800 py-4 text-center text-xs text-pine-100/60">
        © {new Date().getFullYear()} The Ibn Sina Trust. Design concept for review.
      </p>
    </footer>
  );
}

import Link from "next/link";
import {Phone, ArrowUpRight, Headset} from "lucide-react";
import {getT} from "@/lib/i18n";
export default async function Banner(){
  const {t}=await getT();
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:py-20">
      <div className="rounded-2xl bg-pine-950 px-7 py-9 text-white md:px-10 md:py-11">
        <div className="flex flex-col items-start justify-between gap-7 md:flex-row md:items-center">
          <div className="max-w-xl">
            <Headset size={21} className="text-[#d5b18a]"/>
            <h2 className="mt-4 font-serif text-3xl font-medium leading-tight md:text-4xl">{t.bannerTitle}</h2>
            <p className="mt-3 text-sm leading-7 text-white/70">{t.bannerSub}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a href="tel:10615" className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-medium text-pine-950 hover:bg-[#f1efe8]"><Phone size={16}/>{t.call} 10615</a>
            <Link href="/appointment" className="inline-flex items-center gap-2 rounded-lg border border-white/25 px-5 py-3 text-sm font-medium text-white hover:bg-white/10">{t.bookOnline}<ArrowUpRight size={16}/></Link>
          </div>
        </div>
      </div>
    </section>
  );
}
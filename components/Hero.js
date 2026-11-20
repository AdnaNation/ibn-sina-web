import Link from "next/link";
import { Search, ArrowRight, ShieldCheck, CalendarCheck, Radio, Activity, MapPin, Clock3 } from "lucide-react";
import { getT } from "@/lib/i18n";
import { deptName, placeName } from "@/lib/bnData";

export default async function Hero({ units, departments }) {
  const { t, lang } = await getT();
  const bn = lang === "bn";
  const areas = [...new Set(units.filter((u) => u.type !== "Education").map((u) => `${u.area}, ${u.city}`))];
  const label = (x) => x.split(", ").map((p) => placeName(p, lang)).join(", ");
  const tiles = [
    [CalendarCheck, t.qBook, t.qBookSub, "/appointment", "bg-pine-800 text-white hover:bg-pine-700", "text-pine-100"],
    [Activity, t.qTrack, t.qTrackSub, "/track", "bg-white text-pine-950 hover:border-pine-300", "text-slate-500"],
    [Radio, t.qLive, t.qLiveSub, "/live", "bg-white text-pine-950 hover:border-pine-300", "text-slate-500"],
  ];
  const input = "w-full rounded-[8px] border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-pine-500 focus:bg-white focus:ring-2 focus:ring-pine-100";

  return (
    <section className="premium-hero relative isolate overflow-hidden">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 pb-16 pt-12 md:pb-20 md:pt-16 lg:grid-cols-[1.05fr_.95fr] lg:gap-14">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 text-xs font-medium text-pine-800">
            <ShieldCheck size={15} /> {bn ? "স্বাধীন প্রদর্শনীমূলক প্রোটোটাইপ" : "Independent demonstration prototype"}
          </div>
          <h1 className="mt-4 max-w-2xl font-serif text-[40px] font-medium leading-[1.15] text-pine-950 sm:text-5xl lg:text-[56px]">{t.h1}</h1>
          <p className="mt-5 max-w-xl text-base leading-8 text-slate-600 sm:text-lg">{t.heroSub}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/appointment" className="inline-flex items-center gap-2 rounded-[8px] bg-pine-800 px-6 py-3 text-base font-medium text-white transition hover:bg-pine-700">{t.book}<ArrowRight size={18} /></Link>
            <Link href="/units" className="inline-flex items-center gap-2 rounded-[8px] border border-pine-200 bg-white px-5 py-3 text-base font-medium text-pine-900 transition hover:border-pine-400 hover:bg-pine-50">{bn ? "শাখা ও অবস্থান দেখুন" : "Explore locations"}<MapPin size={18} /></Link>
          </div>
          <ul className="mt-9 grid max-w-xl gap-4 border-t border-pine-200/80 pt-6 sm:grid-cols-3">
            {[[ShieldCheck, bn ? "স্বচ্ছ তথ্য" : "Clear information", bn ? "যাচাইয়ের অবস্থা স্পষ্ট" : "Verification status is clear"], [MapPin, t.branches, t.branchesSub], [Clock3, bn ? "সহজ পরিকল্পনা" : "Plan your visit", bn ? "সময় ও সিরিয়াল বুঝুন" : "Understand sessions and queues"]].map(([Icon, a, b]) => (
              <li key={a} className="flex items-start gap-2.5">
                <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-pine-50 text-pine-800"><Icon size={16} /></span>
                <span><b className="block text-sm text-pine-950">{a}</b><span className="text-xs text-slate-500">{b}</span></span>
              </li>
            ))}
          </ul>
        </div>
        <div className="relative mx-auto w-full max-w-[600px] lg:ml-auto">
          <div className="premium-hero-panel relative rounded-[16px] border border-pine-100 bg-white p-5 sm:p-6">
            <p className="text-xs font-medium text-pine-700">{bn ? "ডেমো দ্রুত প্রবেশ" : "Demo quick access"}</p>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {tiles.map(([Icon, title, sub, href, cls, subCls]) => (
                <Link key={href} href={href} className={`group rounded-[12px] border border-transparent p-4 transition ${cls} ${cls.includes("bg-white") ? "border-slate-200" : ""}`}>
                  <Icon size={22} /><b className="mt-3 block text-[15px] leading-snug">{title}</b><span className={`mt-0.5 block text-xs leading-5 ${subCls}`}>{sub}</span>
                </Link>
              ))}
            </div>
            <form action="/doctors" className="mt-6 grid gap-3 border-t border-slate-100 pt-5 sm:grid-cols-2">
              <p className="text-sm font-bold text-pine-950 sm:col-span-2">{t.find}</p>
              <label className="sm:col-span-2"><span className="sr-only">{t.doctorOrSpec}</span><input name="q" placeholder={t.ph} className={input} /></label>
              <label><span className="mb-1 block text-[11px] font-medium text-slate-500">{t.dept}</span><select name="department" defaultValue="" className={input}><option value="">{t.anyDept}</option>{departments.map((d) => <option key={d.slug} value={d.slug}>{deptName(d.name, lang)}</option>)}</select></label>
              <label><span className="mb-1 block text-[11px] font-medium text-slate-500">{t.branch}</span><select name="branch" defaultValue="" className={input}><option value="">{t.anyBranch}</option>{areas.map((x) => <option key={x} value={x}>{label(x)}</option>)}</select></label>
              <button className="sm:col-span-2 inline-flex items-center justify-center gap-2 rounded-[8px] bg-pine-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-pine-800"><Search size={17} />{t.search}</button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

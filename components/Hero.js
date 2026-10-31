import Link from "next/link";
import { Search, ArrowRight, ShieldCheck, Stethoscope, MapPin, Clock3 } from "lucide-react";
import { getT } from "@/lib/i18n";

export default async function Hero({ units, departments }) {
  const { t } = await getT();
  const unitNames = [...new Set(units.map((u) => `${u.area}, ${u.city}`))];
  return (
    <section className="relative isolate overflow-hidden bg-[#f4f8f5]">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_80%_20%,rgba(35,145,105,.13),transparent_32%),radial-gradient(circle_at_10%_90%,rgba(220,238,229,.75),transparent_35%)]"/>
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 pb-16 pt-12 md:pb-24 md:pt-16 lg:grid-cols-[1.02fr_.98fr] lg:gap-10">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-pine-100 bg-white/80 px-3.5 py-2 text-xs font-bold tracking-wide text-pine-800 shadow-sm"><ShieldCheck size={15}/>{t.eyebrow}</div>
          <h1 className="mt-6 max-w-2xl font-serif text-[42px] font-medium leading-[1.12] tracking-[-.035em] text-pine-950 sm:text-6xl lg:text-[66px]">{t.h1}</h1>
          <p className="mt-6 max-w-xl text-base leading-8 text-slate-600 sm:text-lg">{t.heroSub}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/appointment" className="inline-flex items-center gap-2 rounded-full bg-pine-800 px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-pine-900/15 transition hover:-translate-y-0.5 hover:bg-pine-700">{t.book}<ArrowRight size={17}/></Link>
            <Link href="/doctors" className="inline-flex items-center gap-2 rounded-full border border-pine-200 bg-white px-6 py-3.5 text-sm font-bold text-pine-900 transition hover:border-pine-400 hover:bg-pine-50"><Search size={17}/>{t.find}</Link>
          </div>
          <div className="mt-10 grid max-w-lg grid-cols-3 gap-4 border-t border-pine-200/80 pt-6">
            <div><div className="flex items-center gap-1.5 text-pine-800"><Stethoscope size={16}/><span className="text-xs font-bold">{t.trustCare}</span></div><p className="mt-1 text-[11px] text-slate-500">{t.trustCareSub}</p></div>
            <div><div className="flex items-center gap-1.5 text-pine-800"><MapPin size={16}/><span className="text-xs font-bold">{t.branches}</span></div><p className="mt-1 text-[11px] text-slate-500">{t.branchesSub}</p></div>
            <div><div className="flex items-center gap-1.5 text-pine-800"><Clock3 size={16}/><span className="text-xs font-bold">{t.onlineBooking}</span></div><p className="mt-1 text-[11px] text-slate-500">{t.onlineBookingSub}</p></div>
          </div>
        </div>
        <div className="relative mx-auto w-full max-w-[590px] lg:ml-auto">
          <div className="absolute -inset-5 rounded-[2.5rem] bg-pine-200/40 blur-2xl"/>
          <div className="relative overflow-hidden rounded-[2rem] border-[8px] border-white bg-white shadow-[0_30px_90px_rgba(8,58,42,.18)]">
            <div className="relative h-[340px] overflow-hidden bg-gradient-to-br from-[#dceee5] via-[#c7e1d5] to-[#8fbda8] sm:h-[420px]">
              <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_45%,rgba(4,49,36,.58))]"/>
              <div className="absolute left-7 top-7 rounded-2xl border border-white/70 bg-white/90 p-4 shadow-xl backdrop-blur"><div className="grid size-10 place-items-center rounded-xl bg-pine-50 text-pine-800"><HeartPulseIcon/></div><p className="mt-3 text-xs font-bold text-pine-950">{t.careFirst}</p><p className="mt-1 text-[10px] text-slate-500">{t.careFirstSub}</p></div>
              <div className="absolute bottom-6 left-6 right-6 text-white"><p className="text-xs font-bold uppercase tracking-[.2em] text-white/80">{t.healthcareSince}</p><p className="mt-2 max-w-sm font-serif text-3xl leading-tight sm:text-4xl">{t.heroPhotoTitle}</p></div>
              <div className="absolute -right-6 top-20 h-64 w-44 rounded-full border-[22px] border-white/15"/>
              <div className="absolute bottom-0 right-0 h-56 w-56 rounded-full bg-white/10 blur-2xl"/>
            </div>
            <form action="/doctors" className="grid gap-3 p-4 sm:grid-cols-[1.2fr_1fr_1fr_auto] sm:p-5">
              <label className="min-w-0"><span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500">{t.doctorOrSpec}</span><input name="q" placeholder={t.ph} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-pine-500 focus:bg-white focus:ring-4 focus:ring-pine-100"/></label>
              <label className="min-w-0"><span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500">{t.dept}</span><select name="department" defaultValue="" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none focus:border-pine-500 focus:ring-4 focus:ring-pine-100"><option value="">{t.anyDept}</option>{departments.map(d=><option key={d.slug} value={d.slug}>{d.name}</option>)}</select></label>
              <label className="min-w-0"><span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500">{t.branch}</span><select name="branch" defaultValue="" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none focus:border-pine-500 focus:ring-4 focus:ring-pine-100"><option value="">{t.anyBranch}</option>{unitNames.map((x)=><option key={x} value={x}>{x}</option>)}</select></label>
              <button className="inline-flex items-center justify-center gap-2 self-end rounded-xl bg-pine-800 px-5 py-3 text-sm font-bold text-white transition hover:bg-pine-700"><Search size={17}/><span className="sm:hidden">{t.find}</span><span className="hidden sm:inline">{t.search}</span></button>
            </form>
          </div>
          <div className="absolute -bottom-5 -left-4 hidden rounded-2xl border border-pine-100 bg-white px-4 py-3 shadow-xl sm:flex sm:items-center sm:gap-3"><span className="grid size-10 place-items-center rounded-xl bg-emerald-50 text-emerald-700"><ShieldCheck size={21}/></span><span><b className="block text-xs text-pine-950">{t.patientFirst}</b><small className="text-[10px] text-slate-500">{t.patientFirstSub}</small></span></div>
        </div>
      </div>
    </section>
  );
}
function HeartPulseIcon(){return <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20.8 8.7c0 5.2-8.8 11-8.8 11S3.2 13.9 3.2 8.7A4.7 4.7 0 0 1 12 6.2a4.7 4.7 0 0 1 8.8 2.5Z"/><path d="M4.5 11h4l2-3 2.4 6 1.7-3h4.9"/></svg>}

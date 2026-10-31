import { getT } from "@/lib/i18n";
export default async function Stats() {
  const { t } = await getT();
  const items = [["1980", t.statFounded],["10615",t.statHotline],["EN · বাংলা",t.statLanguages],["Bangladesh",t.statNetwork]];
  return <section id="about" className="relative z-10 mx-auto -mt-1 max-w-7xl px-4 py-9"><div className="grid grid-cols-2 gap-5 rounded-3xl border border-pine-100 bg-white p-6 shadow-[0_18px_50px_rgba(8,58,42,.07)] md:grid-cols-4 md:p-8">{items.map(([value,label],i)=><div key={label} className={`${i%2?"md:border-l md:pl-7":""} ${i>1?"border-t border-pine-100 pt-5 md:border-t-0 md:pt-0":""}`}><p className="font-serif text-2xl font-semibold tracking-tight text-pine-900 sm:text-3xl">{value}</p><p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">{label}</p></div>)}</div></section>;
}

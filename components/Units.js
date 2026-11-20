import Link from "next/link";
import { ArrowUpRight, MapPin, Building2 } from "lucide-react";
import {getT} from "@/lib/i18n";
import {placeName,typeName} from "@/lib/bnData";
export default async function Units({units}) {
  const {t,lang,n}=await getT();
  const groups=[...new Set(units.map(u=>u.city))].slice(0,6);
  return (
    <section className="border-y border-slate-200 bg-[#fbfaf6] py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="text-sm font-medium text-pine-800">{t.networkEyebrow}</p>
            <h2 className="mt-3 font-serif text-4xl font-medium leading-tight text-pine-950 md:text-5xl">{t.unitsTitle}</h2>
            <p className="mt-3 max-w-xl text-sm leading-7 text-slate-600">{t.unitsIntro}</p>
          </div>
          <Link href="/units" className="inline-flex items-center gap-2 rounded-lg border border-pine-900/20 bg-white px-4 py-2.5 text-sm font-medium text-pine-900 hover:bg-pine-50">{t.allUnits}<ArrowUpRight size={16}/></Link>
        </div>
        <div className="mt-9 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map(city => {
            const list=units.filter(u=>u.city===city);
            return <article key={city} className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between">
                <span className="grid size-9 place-items-center rounded-lg bg-[#f1efe8] text-pine-900"><Building2 size={18}/></span>
                <span className="text-xs text-slate-500">{n(list.length)} {t.locations}</span>
              </div>
              <h3 className="mt-4 font-serif text-2xl font-medium text-pine-950">{placeName(city,lang)}</h3>
              <ul className="mt-3 space-y-2">
                {list.slice(0,3).map(u=><li key={u.slug}><Link href={`/units/${u.slug}`} className="flex items-center gap-2 text-sm text-slate-600 hover:text-pine-800"><MapPin size={14} className="shrink-0"/>{placeName(u.area,lang)} · {typeName(u.type,lang)}</Link></li>)}
              </ul>
              {list.length>3&&<Link href="/units" className="mt-3 inline-block text-sm text-pine-800">+{n(list.length-3)} {t.moreLocations}</Link>}
            </article>;
          })}
        </div>
      </div>
    </section>
  );
}
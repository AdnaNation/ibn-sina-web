import { Search } from "lucide-react";
import Ecg from "./Ecg";
import Crosses from "./Crosses";
import { getT } from "@/lib/i18n";

const field =
  "w-full rounded-lg border border-pine-100 bg-paper px-3 py-3 text-[15px] focus:border-pine-600";

export default async function Hero({ units, departments }) {
  const { t, n } = await getT();
  const unitNames = [...new Set(units.map((u) => `${u.area}, ${u.city}`))];
  const cities = new Set(units.map((u) => u.city)).size;

  return (
    <section className="relative text-white bg-pine-900 lattice">
      {/* decoration lives in its own clipped layer so the search panel can overlap the edge */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="beat absolute -right-28 -top-10 size-[22rem] md:size-[32rem] rounded-full bg-flag opacity-60 md:opacity-95 shadow-[0_0_140px_30px_rgba(244,42,65,.35)]" />
        <Ecg className="absolute right-0 top-[38%] hidden md:block w-[62%] text-white" />
        <Crosses />
      </div>

      <div className="relative px-4 pt-16 mx-auto max-w-7xl pb-36 md:pt-24 md:pb-44">
        <p className="font-medium rise text-brass-light">{t.eyebrow}</p>
        <h1 className="rise-2 mt-4 max-w-3xl font-serif text-5xl md:text-7xl leading-[1.08] tracking-tight">
          {t.h1}
        </h1>
        <p className="max-w-xl mt-6 text-lg rise-3 text-pine-100">
          {t.heroSub(n(cities))}
        </p>
      </div>

      <div className="absolute inset-x-0 bottom-0 translate-y-1/2">
        <form
          action="/doctors"
          className="mx-auto w-[calc(100%-2rem)] max-w-5xl rounded-2xl bg-white p-4 md:p-5 shadow-2xl shadow-pine-950/25 grid gap-3 md:grid-cols-[1.4fr_1fr_1fr_auto] text-ink border-t-4 border-flag"
        >
          <label className="block">
            <span className="text-sm font-semibold text-pine-800">
              {t.doctorOrSpec}
            </span>
            <input name="q" placeholder={t.ph} className={`mt-1 ${field}`} />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-pine-800">
              {t.dept}
            </span>
            <select
              name="department"
              className={`mt-1 ${field}`}
              defaultValue=""
            >
              <option value="">{t.anyDept}</option>
              {departments.map((d) => (
                <option key={d.slug} value={d.slug}>
                  {d.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-pine-800">
              {t.branch}
            </span>
            <select name="branch" className={`mt-1 ${field}`} defaultValue="">
              <option value="">{t.anyBranch}</option>
              {unitNames.map((x) => (
                <option key={x} value={x}>
                  {x}
                </option>
              ))}
            </select>
          </label>
          <button className="inline-flex items-center self-end justify-center gap-2 px-6 py-3 font-semibold rounded-lg bg-brass text-pine-950 hover:bg-brass-light">
            <Search size={18} aria-hidden /> {t.find}
          </button>
        </form>
      </div>
    </section>
  );
}

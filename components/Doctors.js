import Link from "next/link";
import { ArrowRight } from "lucide-react";
import DoctorCard from "./DoctorCard";
import { getT } from "@/lib/i18n";

export default async function Doctors({ doctors }) {
  const { t } = await getT();
  return (
    <section className="bg-[#f1efe8] py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="mb-3 text-sm font-medium text-pine-800">{t.doctorSectionEyebrow}</p>
            <h2 className="max-w-xl font-serif text-4xl font-medium leading-tight text-pine-950 md:text-5xl">{t.doctorsTitle}</h2>
            <p className="mt-3 max-w-xl text-sm leading-7 text-slate-600">{t.doctorsIntro}</p>
          </div>
          <Link href="/doctors" className="inline-flex items-center gap-2 rounded-lg border border-pine-900/20 bg-white px-4 py-2.5 text-sm font-medium text-pine-900 hover:border-pine-800 hover:bg-pine-50">
            {t.allDoctors}<ArrowRight size={16}/>
          </Link>
        </div>
        <ul className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{doctors.map(d => <DoctorCard key={d.slug} d={d}/>)}</ul>
      </div>
    </section>
  );
}
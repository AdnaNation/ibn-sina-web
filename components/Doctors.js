import Link from "next/link";
import DoctorCard from "./DoctorCard";
import { getT } from "@/lib/i18n";
export default async function Doctors({ doctors }) {
  const { t } = await getT();
  return (
    <section className="py-20 bg-pine-50">
      <div className="px-4 mx-auto max-w-7xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-serif text-4xl md:text-5xl text-pine-900">
            {t.doctorsTitle}
          </h2>
          <Link
            href="/doctors"
            className="font-semibold text-pine-700 hover:text-pine-900"
          >
            {t.allDoctors}
          </Link>
        </div>

        <ul className="grid gap-4 mt-10 sm:grid-cols-2 lg:grid-cols-4">
          {doctors.map((d) => (
            <DoctorCard key={d.slug} d={d} />
          ))}
        </ul>
      </div>
    </section>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import DoctorCard from "@/components/DoctorCard";
import { getUnit, getDoctorsByArea } from "@/lib/data";

export async function generateMetadata({ params }) {
  const u = await getUnit((await params).slug);
  return {
    title: u ? `${u.name}, ${u.area} | Ibn Sina Trust` : "Unit not found",
  };
}

export default async function UnitPage({ params }) {
  const unit = await getUnit((await params).slug);
  if (!unit) notFound();
  const doctors = await getDoctorsByArea(unit.area);

  return (
    <div className="mx-auto max-w-7xl px-4 py-14">
      <Link href="/units" className="text-sm font-semibold text-pine-700">
        All units
      </Link>
      <h1 className="mt-4 font-serif text-4xl md:text-5xl text-pine-900">
        {unit.name}, {unit.area}
      </h1>
      <p className="mt-2 text-ink/70">
        {unit.type} in {unit.city}. Hotline{" "}
        <a href={`tel:${unit.hotline}`} className="font-semibold text-pine-700">
          {unit.hotline}
        </a>
      </p>
      <div className="mt-6 flex gap-3">
        <Link
          href="/appointment"
          className="rounded-full bg-pine-900 px-6 py-2.5 font-semibold text-white hover:bg-pine-700"
        >
          Book an appointment
        </Link>
        <a
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-pine-700 px-6 py-2.5 font-semibold text-pine-800 hover:bg-pine-50"
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${unit.name} ${unit.area} ${unit.city}`)}`}
        >
          Directions
        </a>
      </div>

      <h2 className="mt-14 font-serif text-3xl text-pine-900">Doctors here</h2>
      {doctors.length ? (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {doctors.map((d) => (
            <DoctorCard key={d.slug} d={d} />
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-ink/70">
          The doctor list for this unit is being added. Call {unit.hotline} for
          today’s schedule.
        </p>
      )}
    </div>
  );
}

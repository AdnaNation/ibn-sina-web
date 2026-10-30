import Link from "next/link";
import { notFound } from "next/navigation";
import { Phone, MapPin, Stethoscope } from "lucide-react";
import { getDoctor } from "@/lib/data";
import { initials } from "@/components/DoctorCard";

export async function generateMetadata({ params }) {
  const d = await getDoctor((await params).slug);
  return {
    title: d
      ? `${d.name}, ${d.department} | Ibn Sina Trust`
      : "Doctor not found",
  };
}

export default async function DoctorPage({ params }) {
  const d = await getDoctor((await params).slug);
  if (!d) notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 py-14">
      <Link href="/doctors" className="text-sm font-semibold text-pine-700">
        All doctors
      </Link>
      <div className="mt-6 grid gap-8 md:grid-cols-[auto_1fr] items-start">
        <span className="grid place-items-center size-32 rounded-full bg-pine-900 text-brass-light font-serif text-5xl">
          {initials(d.name)}
        </span>
        <div>
          <h1 className="font-serif text-4xl md:text-5xl text-pine-900">
            {d.name}
          </h1>
          <ul className="mt-5 space-y-2 text-ink/80">
            <li className="flex gap-2">
              <Stethoscope size={18} className="mt-0.5" aria-hidden />{" "}
              {d.department}
            </li>
            <li className="flex gap-2">
              <MapPin size={18} className="mt-0.5" aria-hidden /> {d.unit}
            </li>
            <li className="flex gap-2">
              <Phone size={18} className="mt-0.5" aria-hidden /> Hotline{" "}
              <a
                href={`tel:${d.phone}`}
                className="font-semibold text-pine-700"
              >
                {d.phone}
              </a>
            </li>
          </ul>
          <Link
            href={`/appointment?doctor=${d.slug}`}
            className="mt-8 inline-block rounded-full bg-pine-900 px-7 py-3 font-semibold text-white hover:bg-pine-700"
          >
            Book an appointment
          </Link>
        </div>
      </div>
    </div>
  );
}

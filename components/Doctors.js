import Link from "next/link";
import { Phone, MapPin } from "lucide-react";
import DoctorCard from "./DoctorCard";

const TITLE =
  /^(dr|prof|professor|asst|assist|assis|assoc|asso|pro|col|md|m)\.?$/i;
const initials = (name) =>
  name
    .replace(/\(.*?\)/g, "")
    .split(/\s+/)
    .filter((w) => w && !TITLE.test(w))
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

export default function Doctors({ doctors }) {
  return (
    <section className="bg-pine-50 py-20">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-serif text-4xl md:text-5xl text-pine-900">
            Doctors on call this week
          </h2>
          <Link
            href="/doctors"
            className="font-semibold text-pine-700 hover:text-pine-900"
          >
            Browse all doctors
          </Link>
        </div>

        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {doctors.map((d) => (
            <DoctorCard key={d.slug} d={d} />
          ))}
        </ul>
      </div>
    </section>
  );
}

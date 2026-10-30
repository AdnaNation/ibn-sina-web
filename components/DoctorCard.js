import Link from "next/link";
import { Phone, MapPin } from "lucide-react";

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

export { initials };

export default function DoctorCard({ d }) {
  return (
    <li className="rounded-2xl bg-white p-5 border border-pine-100 flex flex-col">
      <Link
        href={`/doctors/${d.slug}`}
        className="flex items-center gap-3 group"
      >
        <span className="grid place-items-center size-14 rounded-full bg-pine-900 text-brass-light font-serif text-xl shrink-0">
          {initials(d.name)}
        </span>
        <div>
          <h3 className="font-semibold leading-snug group-hover:text-pine-700">
            {d.name}
          </h3>
          <p className="text-sm text-pine-700">{d.department}</p>
        </div>
      </Link>
      <p className="mt-4 flex gap-2 text-sm text-ink/70">
        <MapPin size={16} className="mt-0.5 shrink-0" aria-hidden />{" "}
        {d.unit.replace("Ibn Sina ", "")}
      </p>
      <div className="mt-auto pt-4 border-t border-pine-100 flex items-center justify-between gap-2">
        <a
          href={`tel:${d.phone}`}
          className="inline-flex items-center gap-1.5 text-sm text-ink/70 hover:text-pine-800"
        >
          <Phone size={14} aria-hidden /> {d.phone}
        </a>
        <Link
          href={`/appointment?doctor=${d.slug}`}
          className="rounded-full bg-pine-900 px-4 py-1.5 text-sm font-semibold text-white hover:bg-pine-700"
        >
          Book
        </Link>
      </div>
    </li>
  );
}

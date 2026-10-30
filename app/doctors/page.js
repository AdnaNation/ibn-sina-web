import Link from "next/link";
import DoctorCard from "@/components/DoctorCard";
import { searchDoctors, getDepartments, getUnits } from "@/lib/data";

export const metadata = { title: "Find a doctor | Ibn Sina Trust" };
const field =
  "w-full rounded-lg border border-pine-100 bg-white px-3 py-2.5 focus:border-pine-600";

export default async function DoctorsPage({ searchParams }) {
  const sp = await searchParams; // Next 15: searchParams is a Promise
  const q = sp.q || "",
    department = sp.department || "",
    branch = sp.branch || "";
  const page = Math.max(1, parseInt(sp.page) || 1);
  const perPage = 12;

  const [{ items, total }, departments, units] = await Promise.all([
    searchDoctors({ q, department, branch, page, perPage }),
    getDepartments(),
    getUnits(),
  ]);
  const branches = [...new Set(units.map((u) => `${u.area}, ${u.city}`))];
  const pages = Math.ceil(total / perPage);
  const link = (p) =>
    `/doctors?${new URLSearchParams({ q, department, branch, page: p })}`;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <h1 className="font-serif text-4xl md:text-5xl text-pine-900">
        Find a doctor
      </h1>

      <form className="mt-8 grid gap-3 md:grid-cols-[1.4fr_1fr_1fr_auto]">
        <input
          name="q"
          defaultValue={q}
          placeholder="Name or specialty"
          aria-label="Name or specialty"
          className={field}
        />
        <select
          name="department"
          defaultValue={department}
          aria-label="Department"
          className={field}
        >
          <option value="">Any department</option>
          {departments.map((d) => (
            <option key={d.slug} value={d.slug}>
              {d.name}
            </option>
          ))}
        </select>
        <select
          name="branch"
          defaultValue={branch}
          aria-label="Branch"
          className={field}
        >
          <option value="">Any branch</option>
          {branches.map((b) => (
            <option key={b}>{b}</option>
          ))}
        </select>
        <button className="rounded-lg bg-pine-900 px-6 py-2.5 font-semibold text-white hover:bg-pine-700">
          Search
        </button>
      </form>

      <p className="mt-6 text-sm text-ink/70" aria-live="polite">
        {total} doctor{total === 1 ? "" : "s"} found
      </p>

      {items.length ? (
        <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((d) => (
            <DoctorCard key={d.slug} d={d} />
          ))}
        </ul>
      ) : (
        <div className="mt-8 rounded-2xl bg-pine-50 p-8">
          <p className="font-semibold">No doctor matches these filters.</p>
          <p className="mt-1 text-ink/70">
            Try a different department or branch, or call{" "}
            <a href="tel:10615" className="font-semibold text-pine-700">
              10615
            </a>{" "}
            and we will find one for you.
          </p>
        </div>
      )}

      {pages > 1 && (
        <nav
          className="mt-10 flex items-center justify-center gap-4"
          aria-label="Pagination"
        >
          {page > 1 && (
            <Link href={link(page - 1)} className="font-semibold text-pine-700">
              Previous
            </Link>
          )}
          <span className="text-sm text-ink/70">
            Page {page} of {pages}
          </span>
          {page < pages && (
            <Link href={link(page + 1)} className="font-semibold text-pine-700">
              Next
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}

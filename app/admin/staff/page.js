import { redirect } from "next/navigation";
import AdminNav from "@/components/AdminNav";
import { getSession } from "@/lib/auth";
import { listStaff } from "@/lib/staff";
import { getUnits, getAllDoctors } from "@/lib/data";
import { addStaff, removeStaff } from "./actions";

export const dynamic = "force-dynamic";
const input =
  "mt-1 w-full rounded-lg border border-pine-100 bg-white px-3 py-2.5";

export default async function StaffPage({ searchParams }) {
  const p = await getSession();
  if (p?.role !== "owner") redirect("/admin/login");
  const sp = await searchParams;
  const [staff, units, doctors] = await Promise.all([
    listStaff(),
    getUnits(),
    getAllDoctors(),
  ]);
  const branches = [...new Set(units.map((u) => `${u.name}, ${u.area}`))];

  return (
    <>
      <AdminNav p={p} current="/admin/staff" />
      <div className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="font-serif text-3xl text-pine-900">Staff accounts</h1>
        <p className="mt-1 text-ink/70">
          Each person only sees the patients of the branch or doctor you choose
          here.
        </p>

        {sp.err && (
          <p role="alert" className="mt-4 text-alert">
            {sp.err}
          </p>
        )}
        {sp.ok && (
          <p role="status" className="mt-4 rounded-xl bg-pine-50 p-4">
            Account <strong>{sp.ok}</strong> created. Give the username and
            password to the staff member.
          </p>
        )}

        <form
          action={addStaff}
          className="mt-6 grid gap-4 rounded-2xl border border-pine-100 bg-white p-5 md:grid-cols-2"
        >
          <label className="text-sm font-semibold text-pine-800">
            Full name
            <input name="name" required className={input} />
          </label>
          <label className="text-sm font-semibold text-pine-800">
            Works for
            <select name="scope" required defaultValue="" className={input}>
              <option value="" disabled>
                Choose a branch or a doctor
              </option>
              <optgroup label="Branch reception (sees every doctor of that branch)">
                {branches.map((b) => (
                  <option key={b} value={`branch:${b}`}>
                    {b.replace("Ibn Sina ", "")}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Doctor’s assistant (sees only that doctor)">
                {doctors.map((d) => (
                  <option key={d.slug} value={`doctor:${d.slug}`}>
                    {d.name}
                  </option>
                ))}
              </optgroup>
            </select>
          </label>
          <label className="text-sm font-semibold text-pine-800">
            Username
            <input
              name="username"
              required
              autoCapitalize="none"
              className={input}
            />
          </label>
          <label className="text-sm font-semibold text-pine-800">
            Password
            <input name="password" required minLength={6} className={input} />
          </label>
          <button className="justify-self-start rounded-full bg-pine-900 px-6 py-2.5 font-semibold text-white hover:bg-pine-700">
            Create account
          </button>
        </form>

        <ul className="mt-8 divide-y divide-pine-100 rounded-2xl border border-pine-100 bg-white">
          {staff.map((s) => (
            <li
              key={s.username}
              className="flex flex-wrap items-center justify-between gap-3 p-4"
            >
              <span>
                <strong>{s.name}</strong>{" "}
                <span className="text-ink/60">({s.username})</span>
                <span className="block text-sm text-ink/70">
                  {s.role === "branch"
                    ? `Branch reception: ${s.unit.replace("Ibn Sina ", "")}`
                    : `Doctor’s assistant: ${s.doctorName}`}
                </span>
              </span>
              <form action={removeStaff}>
                <input type="hidden" name="username" value={s.username} />
                <button className="text-sm font-semibold text-alert">
                  Remove
                </button>
              </form>
            </li>
          ))}
          {!staff.length && (
            <li className="p-4 text-ink/70">No staff accounts yet.</li>
          )}
        </ul>
      </div>
    </>
  );
}

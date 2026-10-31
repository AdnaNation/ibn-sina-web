import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import AdminNav from "@/components/AdminNav";
import AutoRefresh from "@/components/AutoRefresh";
import { getSession } from "@/lib/auth";
import { getStats, loadDemo } from "@/lib/queue";
import { todayDhaka } from "@/lib/time";

export const dynamic = "force-dynamic";

const Tile = ({ n, label }) => (
  <div className="rounded-2xl border border-pine-100 bg-white p-5">
    <p className="font-serif text-4xl text-pine-800">{n}</p>
    <p className="mt-1 text-sm text-ink/70">{label}</p>
  </div>
);

export default async function Overview() {
  const p = await getSession();
  if (!p) redirect("/admin/login");
  if (p.role !== "owner") redirect("/admin/queue");
  const st = await getStats(todayDhaka());

  async function demo() {
    "use server";
    if ((await getSession())?.role !== "owner") return;
    await loadDemo();
    revalidatePath("/admin");
  }

  const max = Math.max(1, ...(st?.branches.map((b) => b.booked) || [1]));
  return (
    <>
      <AdminNav p={p} current="/admin" />
      <div className="mx-auto max-w-5xl px-4 py-8">
        <AutoRefresh every={15000} />
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.2em] text-emerald-700">Hospital administration</p>
            <h1 className="mt-2 font-serif text-3xl text-pine-900">Today at a glance</h1>
          </div>
          <Link href="/admin/schedules" className="rounded-full bg-pine-900 px-5 py-3 text-sm font-semibold text-white hover:bg-pine-700">Manage doctor schedules</Link>
        </div>
        {!st && (
          <p className="mt-4 text-alert">The database is not connected.</p>
        )}

        {st && (
          <>
            <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
              <Tile n={st.booked} label="Patients booked" />
              <Tile n={st.seen} label="Already seen" />
              <Tile n={st.waiting} label="Waiting now" />
              <Tile n={st.skipped} label="Did not come" />
              <Tile
                n={`${st.avgConsult.toFixed(1)} min`}
                label="Average time with doctor"
              />
              <Tile n={st.doctors} label="Doctors with a queue" />
              <Tile n={st.lateStarts} label="Doctors who started late" />
              <Tile
                n={`${Math.round(st.avgLate)} min`}
                label="Average late start"
              />
            </div>

            <section className="mt-8 rounded-2xl border border-pine-100 bg-white p-5">
              <h2 className="font-semibold">By branch</h2>
              {!st.branches.length && (
                <p className="mt-3 text-ink/70">No bookings yet today.</p>
              )}
              <ul className="mt-4 space-y-4">
                {st.branches.map((b) => (
                  <li key={b.unit}>
                    <p className="flex justify-between text-sm">
                      <span>{b.unit.replace("Ibn Sina ", "")}</span>
                      <span>
                        {b.seen} seen of {b.booked}
                      </span>
                    </p>
                    <div className="mt-1 h-3 overflow-hidden rounded-full bg-pine-50">
                      <div
                        className="h-full bg-pine-100"
                        style={{ width: `${(b.booked / max) * 100}%` }}
                      >
                        <div
                          className="h-full bg-pine-700"
                          style={{
                            width: `${b.booked ? (b.seen / b.booked) * 100 : 0}%`,
                          }}
                        />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          </>
        )}

        <section className="mt-8 rounded-2xl bg-pine-900 p-6 text-white">
          <h2 className="font-serif text-2xl">Presentation mode</h2>
          <p className="mt-2 max-w-xl text-pine-100">
            Creates a busy demo clinic with 14 patients and a doctor running 20
            minutes late. Open the patient ticket on a phone, then press “Call
            next patient” in the queue console and watch the phone update.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <form action={demo}>
              <button className="rounded-full bg-brass px-6 py-3 font-semibold text-pine-950 hover:bg-brass-light">
                Load demo clinic
              </button>
            </form>
            <Link
              href="/track/IST-DEMO11"
              className="rounded-full border border-pine-100 px-5 py-3 text-sm font-semibold"
            >
              Patient ticket (serial 11)
            </Link>
            <Link
              href="/admin/queue?doc=demo-doctor"
              className="rounded-full border border-pine-100 px-5 py-3 text-sm font-semibold"
            >
              Staff console
            </Link>
            <Link
              href="/live"
              className="rounded-full border border-pine-100 px-5 py-3 text-sm font-semibold"
            >
              Lobby board
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import AdminNav from "@/components/AdminNav";
import AutoRefresh from "@/components/AutoRefresh";
import { getSession, hasPermission, isBranchAdmin } from "@/lib/auth";
import { getStats, loadDemo } from "@/lib/queue";
import { todayDhaka } from "@/lib/time";
import { getOrganizationStats } from "@/lib/management";

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
  if (p.role !== "owner") {
    if (isBranchAdmin(p) || hasPermission(p, "queue.manage")) redirect("/admin/queue");
    if (hasPermission(p, "schedules.manage")) redirect("/admin/schedules");
    return <>
      <AdminNav p={p} current="/admin" />
      <main className="mx-auto max-w-4xl px-4 py-10">
        <p className="text-xs font-bold uppercase tracking-[.2em] text-emerald-700">Staff workspace</p>
        <h1 className="mt-2 font-serif text-3xl text-pine-900">Welcome, {p.name}</h1>
        <p className="mt-2 text-ink/70">Your account is limited to {p.scope || "your assigned branch"}. The following permissions have been assigned to you.</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">{(p.permissions || []).map((permission) => <div key={permission} className="rounded-xl border border-pine-100 bg-white p-4 text-sm font-semibold text-pine-800">{permission.replaceAll(".", " · ").replaceAll("_", " ")}</div>)}</div>
        {!p.permissions?.length && <p className="mt-6 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">No modules have been assigned. Contact your branch administrator.</p>}
      </main>
    </>;
  }
  const [st, org] = await Promise.all([getStats(todayDhaka()), getOrganizationStats(todayDhaka())]);

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
            <p className="text-xs font-bold uppercase tracking-[.2em] text-emerald-700">Organization-wide control center</p>
            <h1 className="mt-2 font-serif text-3xl text-pine-900">Main Admin Dashboard</h1>
            <p className="mt-1 text-sm text-ink/60">All branches · {todayDhaka()} · Bangladesh time</p>
          </div>
          <div className="flex flex-wrap gap-2"><Link href="/admin/branches" className="rounded-full bg-pine-900 px-5 py-3 text-sm font-semibold text-white hover:bg-pine-700">Manage branches</Link><Link href="/admin/schedules" className="rounded-full border border-pine-200 px-5 py-3 text-sm font-semibold text-pine-900 hover:bg-pine-50">Manage schedules</Link></div>
        </div>
        {org && <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          {[[org.totals.branches,"Branches"],[org.totals.activeBranches,"Active branches"],[org.totals.inactiveBranches,"Inactive branches"],[org.totals.activeBranchAdmins,"Active branch admins"],[org.totals.activeStaff,"Active staff"],[org.totals.doctors,"Doctors"],[org.totals.booked,"Today's bookings"],[org.totals.waiting,"Waiting patients"]].map(([n,l])=><div key={l} className="rounded-2xl border border-pine-100 bg-white p-4"><p className="font-serif text-3xl text-pine-900">{n}</p><p className="mt-1 text-[11px] text-ink/60">{l}</p></div>)}
        </section>}
        {!st && (
          <p className="mt-4 text-alert">The database is not connected.</p>
        )}

        {org && <section className="mt-8 rounded-2xl border border-pine-100 bg-white p-5">
          <div className="flex flex-wrap items-end justify-between gap-2"><div><h2 className="font-serif text-2xl text-pine-900">Branch-wise performance</h2><p className="mt-1 text-xs text-ink/60">Live counts for today, grouped by branch</p></div><Link href="/admin/branches" className="text-sm font-bold text-emerald-800 underline underline-offset-4">Open branch workspace ↗</Link></div>
          <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><thead><tr className="border-b border-pine-100 text-xs text-ink/50"><th className="py-3 pr-3">Branch</th><th className="py-3 pr-3">Status</th><th className="py-3 pr-3">Doctors</th><th className="py-3 pr-3">Admins</th><th className="py-3 pr-3">Staff</th><th className="py-3 pr-3">Booked</th><th className="py-3 pr-3">Waiting</th><th className="py-3">Seen</th></tr></thead><tbody>{org.branches.map(b=><tr key={b.slug} className="border-b border-pine-50 last:border-0"><td className="py-3 pr-3 font-semibold text-pine-950">{b.name}<span className="block text-xs font-normal text-ink/50">{b.area}, {b.city}</span></td><td className="py-3 pr-3"><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${b.active===false?"bg-rose-50 text-rose-700":"bg-emerald-50 text-emerald-800"}`}>{b.active===false?"Inactive":"Active"}</span></td><td className="py-3 pr-3">{b.doctors}</td><td className="py-3 pr-3">{b.activeAdmins}</td><td className="py-3 pr-3">{b.activeStaff}</td><td className="py-3 pr-3">{b.booked}</td><td className="py-3 pr-3">{b.waiting}</td><td className="py-3">{b.seen}</td></tr>)}</tbody></table></div>
        </section>}
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

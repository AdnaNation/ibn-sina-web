import AdminActionForm from "@/components/AdminActionForm";
import { redirect } from "next/navigation";
import AdminNav from "@/components/AdminNav";
import { getAdmin } from "@/lib/adminT";
import { getSession } from "@/lib/auth";
import { getAllBranches, getOrganizationStats } from "@/lib/management";
import { listStaff } from "@/lib/staff";
import { createBranchAction, toggleAccountAction, toggleBranchAction } from "./actions";

export const dynamic = "force-dynamic";
const field = "mt-1 w-full rounded-xl border border-pine-100 bg-white px-3 py-2.5 text-sm outline-none focus:border-pine-500";

export default async function BranchManagement({ searchParams }) {
  const { tr } = await getAdmin();
  const p = await getSession();
  if (!p || p.role !== "owner") redirect("/admin");
  const sp = await searchParams;
  const [branches, staff, stats] = await Promise.all([getAllBranches(), listStaff(), getOrganizationStats()]);
  const admins = staff.filter((s) => ["branch_admin", "branch"].includes(s.role));
  const status = (active) => active === false ? tr("Inactive") : tr("Active");
  return <>
    <AdminNav p={p} current="/admin/branches" />
    <main className="mx-auto max-w-6xl px-4 py-8">
      <p className="text-xs font-bold uppercase tracking-[.2em] text-emerald-700">{tr("Organization control")}</p>
      <h1 className="mt-2 font-serif text-3xl text-pine-900">{tr("Branch management")}</h1>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-ink/70">{tr("Create and maintain hospital branches, assign branch administrators, and monitor branch-level activity from one place.")}</p>
      {sp.err && <p role="alert" className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-800">{sp.err}</p>}
      {sp.ok && <p role="status" className="mt-4 rounded-xl bg-pine-50 p-3 text-sm text-pine-900">Action completed: {sp.ok.replaceAll("-", " ")}.</p>}
      <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[ [branches.length,tr("Total branches")], [branches.filter(b=>b.active!==false).length,tr("Active branches")], [admins.length,tr("Branch administrators")], [staff.filter(s=>!(["branch_admin","branch"].includes(s.role))).length,tr("Other accounts")] ].map(([n,l])=><div key={l} className="rounded-2xl border border-pine-100 bg-white p-4"><p className="font-serif text-3xl text-pine-900">{n}</p><p className="mt-1 text-xs text-ink/60">{l}</p></div>)}
      </section>
      <section className="mt-8 grid gap-6 lg:grid-cols-[.8fr_1.2fr]">
        <AdminActionForm action={createBranchAction} className="h-fit rounded-2xl border border-pine-100 bg-white p-5" successMessage="Branch created." pendingMessage="Creating branch…" resetOnSuccess>
          <h2 className="font-serif text-2xl text-pine-900">{tr("Create a branch")}</h2>
          <p className="mt-1 text-xs text-ink/60">{tr("New branches are immediately available for administrator assignment.")}</p>
          <div className="mt-4 space-y-3">
            <label className="block text-sm font-semibold">{tr("Branch / facility name")}<input name="name" required minLength={3} maxLength={100} placeholder="Ibn Sina Specialized Hospital" className={field}/></label>
            <label className="block text-sm font-semibold">{tr("Area")}<input name="area" required maxLength={80} placeholder="Dhanmondi" className={field}/></label>
            <label className="block text-sm font-semibold">{tr("City")}<input name="city" required maxLength={80} placeholder="Dhaka" className={field}/></label>
            <label className="block text-sm font-semibold">{tr("Facility type")}<select name="type" className={field}><option>{tr("Hospital")}</option><option>{tr("Diagnostic")}</option><option>{tr("Medical College")}</option><option>{tr("Specialized Centre")}</option></select></label>
            <label className="block text-sm font-semibold">{tr("Hotline")}<input name="hotline" maxLength={24} inputMode="tel" placeholder="Verified branch contact only" className={field}/></label>
            <label className="block text-sm font-semibold">{tr("Address (optional)")}<textarea name="address" rows={2} maxLength={240} className={field}/></label>
          </div>
          <button className="mt-5 w-full rounded-full bg-pine-900 px-5 py-3 text-sm font-bold text-white hover:bg-pine-700">{tr("Create branch")}</button>
        </AdminActionForm>
        <section className="rounded-2xl border border-pine-100 bg-white p-5">
          <div className="flex flex-wrap items-end justify-between gap-2"><div><h2 className="font-serif text-2xl text-pine-900">{tr("All branches")}</h2><p className="mt-1 text-xs text-ink/60">Branch statistics for today · {stats?.date || tr("Database unavailable")}</p></div><span className="text-xs text-ink/60">{branches.length} locations</span></div>
          <div className="mt-4 space-y-3">
            {branches.map((b)=>{const unit=`${b.name}, ${b.area}`;const row=stats?.branches.find(x=>x.unit===unit);return <article key={b.slug} className="rounded-xl border border-pine-100 p-4">
              <div className="flex flex-wrap items-start justify-between gap-2"><div><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold text-pine-950">{b.name}</h3><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${b.active===false?"bg-rose-50 text-rose-700":"bg-emerald-50 text-emerald-800"}`}>{status(b.active)}</span></div><p className="mt-1 text-xs text-ink/60">{b.area}, {b.city} · {b.type}</p></div>
              <AdminActionForm action={toggleBranchAction} successMessage="Branch status updated." pendingMessage="Updating branch…"><input type="hidden" name="unit" value={unit}/><input type="hidden" name="active" value={String(b.active===false)}/><button className="rounded-full border border-pine-200 px-3 py-1.5 text-xs font-bold text-pine-800">{b.active===false?tr("Activate"):tr("Deactivate")}</button></AdminActionForm></div>
              <div className="mt-3 grid grid-cols-3 gap-2 rounded-lg bg-pine-50 p-3 text-center sm:grid-cols-6">{[[row?.doctors??0,tr("Doctors")],[row?.activeAdmins??0,tr("Admins")],[row?.activeStaff??0,tr("Staff")],[row?.booked??0,tr("Booked")],[row?.waiting??0,tr("Waiting")],[row?.seen??0,tr("Seen")]].map(([n,l])=><div key={l}><p className="font-serif text-xl text-pine-900">{n}</p><p className="text-[10px] text-ink/60">{l}</p></div>)}</div>
            </article>})}
          </div>
        </section>
      </section>
      <section className="mt-8 rounded-2xl border border-pine-100 bg-white p-5">
        <div className="flex flex-wrap items-end justify-between gap-2"><div><h2 className="font-serif text-2xl text-pine-900">{tr("Branch administrator accounts")}</h2><p className="mt-1 text-xs text-ink/60">{tr("Create accounts under Users & permissions. You can activate or suspend access here.")}</p></div><a href="/admin/staff" className="text-sm font-bold text-emerald-800 underline underline-offset-4">{tr("Create administrator ↗")}</a></div>
        <div className="mt-4 divide-y divide-pine-100">{admins.map(a=><div key={a.username} className="flex flex-wrap items-center justify-between gap-3 py-3"><div><p className="font-semibold text-pine-950">{a.name} <span className="font-normal text-ink/50">@{a.username}</span></p><p className="text-xs text-ink/60">{a.unit} · {status(a.active)}</p></div><AdminActionForm action={toggleAccountAction} successMessage="Account status updated." pendingMessage="Updating account…"><input type="hidden" name="username" value={a.username}/><input type="hidden" name="active" value={String(a.active===false)}/><button className={`rounded-full px-4 py-2 text-xs font-bold ${a.active===false?"bg-emerald-700 text-white":"bg-rose-50 text-rose-700"}`}>{a.active===false?tr("Reactivate account"):tr("Deactivate account")}</button></AdminActionForm></div>)}{!admins.length&&<p className="py-5 text-sm text-ink/60">{tr("No branch administrators created yet.")}</p>}</div>
      </section>
      <p className="mt-5 text-xs leading-5 text-ink/50">{tr("Deactivating a branch prevents its staff accounts from signing in and hides it from public branch listings. Existing patient and appointment records are retained. Reactivating the branch restores branch sign-in access for accounts that are themselves active.")}</p>
    </main>
  </>;
}

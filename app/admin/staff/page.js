import { redirect } from "next/navigation";
import AdminNav from "@/components/AdminNav";
import { getAdmin } from "@/lib/adminT";
import { getSession, isBranchAdmin } from "@/lib/auth";
import { listStaff } from "@/lib/staff";
import { getUnits, getAllDoctors } from "@/lib/data";
import { STAFF_PERMISSIONS } from "@/lib/permissions";
import { addStaff, removeStaff } from "./actions";
import { toggleAccountAction } from "@/app/admin/branches/actions";

export const dynamic = "force-dynamic";
const input = "mt-1 w-full rounded-lg border border-pine-100 bg-white px-3 py-2.5";

export default async function StaffPage({ searchParams }) {
  const { tr } = await getAdmin();
  const p = await getSession();
  if (!p || !(p.role === "owner" || isBranchAdmin(p))) redirect("/admin/login");
  const sp = await searchParams;
  const filter = p.role === "owner" ? {} : { unit: p.unit };
  const [staff, units, doctors] = await Promise.all([listStaff(filter), getUnits(), getAllDoctors()]);
  const branches = [...new Set(units.map((u) => `${u.name}, ${u.area}`))];
  const ownDoctors = doctors.filter((d) => p.role === "owner" || d.unit === p.unit);
  const ownBranches = branches.filter((b) => p.role === "owner" || b === p.unit);
  const permissionGroups = STAFF_PERMISSIONS.reduce((groups, item) => { (groups[item.group] ||= []).push(item); return groups; }, {});

  return <>
    <AdminNav p={p} current="/admin/staff" />
    <main className="mx-auto max-w-5xl px-4 py-8">
      <p className="text-xs font-bold uppercase tracking-[.2em] text-emerald-700">{p.role === "owner" ? tr("Main administration") : tr("Branch administration")}</p>
      <h1 className="mt-2 font-serif text-3xl text-pine-900">{tr("Users & permissions")}</h1>
      <p className="mt-1 text-ink/70">{p.role === "owner" ? tr("Create branch administrators and branch staff. Each account is restricted to its assigned branch.") : tr("Create staff accounts for your branch. You cannot create administrators or assign staff to another branch.")}</p>
      {sp.err && <p role="alert" className="mt-4 rounded-xl bg-rose-50 p-3 text-rose-800">{sp.err}</p>}
      {sp.ok && <p role="status" className="mt-4 rounded-xl bg-pine-50 p-3">{tr("Account")} <strong>{sp.ok}</strong> {tr("created. Share the login credentials securely.")}</p>}

      <form action={addStaff} className="mt-6 grid gap-5 rounded-2xl border border-pine-100 bg-white p-5 md:grid-cols-2">
        <div className="md:col-span-2"><h2 className="font-serif text-2xl text-pine-900">{tr("Create account")}</h2><p className="text-sm text-ink/60">{tr("Passwords are stored as salted hashes, never as plain text.")}</p></div>
        <label className="text-sm font-semibold text-pine-800">{tr("Full name")}<input name="name" required className={input} /></label>
        <label className="text-sm font-semibold text-pine-800">{tr("Username")}<input name="username" required autoCapitalize="none" minLength={3} maxLength={20} className={input} /></label>
        <label className="text-sm font-semibold text-pine-800">{tr("Temporary password")}<input name="password" type="password" required minLength={8} maxLength={128} className={input} /></label>
        {p.role === "owner" && <label className="text-sm font-semibold text-pine-800">{tr("Account type")}<select name="role" defaultValue="branch_admin" className={input}><option value="branch_admin">{tr("Branch administrator")}</option><option value="staff">{tr("Branch staff")}</option><option value="doctor">{tr("Doctor / doctor assistant")}</option></select></label>}
        <label className="text-sm font-semibold text-pine-800">{tr("Assigned branch")}<select name="unit" required defaultValue={p.role === "owner" ? "" : p.unit} disabled={p.role !== "owner"} className={input}><option value="" disabled>{tr("Select branch")}</option>{ownBranches.map((b) => <option key={b} value={b}>{b.replace("Ibn Sina ", "")}</option>)}</select>{p.role !== "owner" && <input type="hidden" name="unit" value={p.unit} />}</label>
        {p.role === "owner" && <label className="text-sm font-semibold text-pine-800">{tr("Doctor assignment (doctor role only)")}<select name="doctorSlug" defaultValue="" className={input}><option value="">{tr("Select doctor if applicable")}</option>{ownDoctors.map((d) => <option key={d.slug} value={d.slug}>{d.name} · {d.unit}</option>)}</select></label>}
        <fieldset className="md:col-span-2 rounded-xl border border-pine-100 p-4"><legend className="px-2 font-semibold text-pine-900">{tr("Staff permissions")}</legend><p className="mb-3 text-xs text-ink/60">{tr("Branch administrators automatically receive full permissions inside their own branch. Select permissions for regular staff.")}</p>
          {Object.entries(permissionGroups).map(([group, items]) => <div key={group} className="mb-4 last:mb-0"><h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-emerald-800">{tr(group)}</h3><div className="grid gap-2 sm:grid-cols-2">{items.map((item) => <label key={item.key} className="flex items-start gap-2 text-sm"><input type="checkbox" name="permissions" value={item.key} defaultChecked={["appointments.view", "queue.manage"].includes(item.key)} className="mt-1 accent-emerald-700"/><span>{tr(item.label)}</span></label>)}</div></div>)}
        </fieldset>
        <button className="justify-self-start rounded-full bg-pine-900 px-6 py-2.5 font-semibold text-white hover:bg-pine-700">{tr("Create account")}</button>
      </form>

      <section className="mt-8"><div className="mb-3 flex items-end justify-between"><h2 className="font-serif text-2xl text-pine-900">{p.role === "owner" ? tr("All branch accounts") : tr("Your branch team")}</h2><span className="text-sm text-ink/60">{staff.length} {tr("accounts")}</span></div>
        <ul className="divide-y divide-pine-100 rounded-2xl border border-pine-100 bg-white">{staff.map((s) => <li key={s.username} className="flex flex-wrap items-center justify-between gap-3 p-4"><div><strong>{s.name}</strong> <span className="text-ink/60">({s.username})</span><span className="block text-sm text-ink/70">{s.role === "branch_admin" || s.role === "branch" ? tr("Branch administrator") : s.role === "doctor" ? `Doctor access · ${s.doctorName}` : tr("Branch staff")} · {s.unit?.replace("Ibn Sina ", "")}</span><span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${s.active === false ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-800"}`}>{s.active === false ? tr("Inactive") : tr("Active")}</span><span className="mt-1 block text-xs text-emerald-800">{s.role === "branch_admin" || s.role === "branch" ? tr("All branch permissions") : (s.permissions || []).join(" · ") || tr("No extra permissions")}</span></div>{(p.role === "owner" || (s.role !== "branch_admin" && s.role !== "branch")) && <form action={toggleAccountAction}><input type="hidden" name="username" value={s.username}/><input type="hidden" name="active" value={String(s.active === false)}/><button className={`rounded-full px-3 py-2 text-xs font-bold ${s.active === false ? "bg-emerald-700 text-white" : "bg-rose-50 text-rose-700"}`}>{s.active === false ? tr("Reactivate") : tr("Deactivate")}</button></form>}</li>)}{!staff.length && <li className="p-4 text-ink/70">{tr("No accounts created yet.")}</li>}</ul>
      </section>
    </main>
  </>;
}

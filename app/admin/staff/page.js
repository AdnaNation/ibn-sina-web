import AdminActionForm from "@/components/AdminActionForm";
import DoctorAssignmentPicker from "@/components/DoctorAssignmentPicker";
import { redirect } from "next/navigation";
import AdminNav from "@/components/AdminNav";
import { getAdmin } from "@/lib/adminT";
import { getSession, isBranchAdmin } from "@/lib/auth";
import { listStaff } from "@/lib/staff";
import { getUnits, getAllDoctors } from "@/lib/data";
import { updateStaffAccess, addStaff } from "./actions";
import { STAFF_ASSIGNABLE_PERMISSIONS } from "@/lib/permissions";
import { toggleAccountAction } from "@/app/admin/branches/actions";

export const dynamic = "force-dynamic";
const input = "mt-1 w-full rounded-lg border border-pine-100 bg-white px-3 py-2.5";

export default async function StaffPage({ searchParams }) {
  const { tr } = await getAdmin();
  const p = await getSession();
  if (!p || !(p.role === "owner" || isBranchAdmin(p))) redirect("/admin/login");
  const sp = await searchParams;
  const filter = p.role === "owner" ? { role: { $in: ["branch_admin", "branch"] } } : { unit: p.unit, role: { $nin: ["branch_admin", "branch", "owner"] } };
  const [staff, units, branchDoctors] = await Promise.all([listStaff(filter), getUnits(), p.role === "owner" ? Promise.resolve([]) : getAllDoctors()]);
  const branches = [...new Set(units.map((u) => `${u.name}, ${u.area}`))];
  
  const ownBranches = branches.filter((b) => p.role === "owner" || b === p.unit);
  const assignedDoctors = branchDoctors.filter((doctor) => doctor.unit === p.unit);
  

  return <>
    <AdminNav p={p} current="/admin/staff" />
    <main className="mx-auto max-w-5xl px-4 py-8">
      <p className="text-xs font-bold uppercase tracking-[.2em] text-emerald-700">{p.role === "owner" ? tr("Main administration") : tr("Branch administration")}</p>
      <h1 className="mt-2 font-serif text-3xl text-pine-900">{tr("Users & permissions")}</h1>
      <p className="mt-1 text-ink/70">{p.role === "owner" ? tr("Create and manage Branch Admin accounts. Branch Admins create their own branch staff.") : tr("Create staff accounts for selected doctors, then grant only the tasks each person needs.")}</p>
      {sp.err && <p role="alert" className="mt-4 rounded-xl bg-rose-50 p-3 text-rose-800">{sp.err}</p>}
      {sp.ok && <p role="status" className="mt-4 rounded-xl bg-pine-50 p-3">{tr("Account")} <strong>{sp.ok}</strong> {tr("created. Share the login credentials securely.")}</p>}

      <AdminActionForm action={addStaff} className="mt-6 grid gap-5 rounded-2xl border border-pine-100 bg-white p-5 md:grid-cols-2" successMessage={tr("Account created.", "অ্যাকাউন্ট তৈরি হয়েছে।")} pendingMessage={tr("Creating account…", "অ্যাকাউন্ট তৈরি হচ্ছে…")} resetOnSuccess>
        <div className="md:col-span-2"><h2 className="font-serif text-2xl text-pine-900">{tr("Create account")}</h2><p className="text-sm text-ink/60">{tr("Passwords are stored as salted hashes, never as plain text.")}</p></div>
        <label className="text-sm font-semibold text-pine-800">{tr("Full name")}<input name="name" required className={input} /></label>
        <label className="text-sm font-semibold text-pine-800">{tr("Username")}<input name="username" required autoCapitalize="none" minLength={3} maxLength={20} className={input} /></label>
        <label className="text-sm font-semibold text-pine-800">{tr("Temporary password")}<input name="password" type="password" required minLength={8} maxLength={128} className={input} /></label>
        {p.role === "owner" && <label className="text-sm font-semibold text-pine-800">{tr("Account type")}<select name="role" defaultValue="branch_admin" className={input}><option value="branch_admin">{tr("Branch administrator")}</option></select></label>}
        <label className="text-sm font-semibold text-pine-800">{tr("Assigned branch")}<select name="unit" required defaultValue={p.role === "owner" ? "" : p.unit} disabled={p.role !== "owner"} className={input}><option value="" disabled>{tr("Select branch")}</option>{ownBranches.map((b) => <option key={b} value={b}>{b.replace("Ibn Sina ", "")}</option>)}</select>{p.role !== "owner" && <input type="hidden" name="unit" value={p.unit} />}</label>
        {p.role !== "owner" && <div className="md:col-span-2"><DoctorAssignmentPicker doctors={assignedDoctors} allDoctorsLabel={tr("Allow this staff member to operate all doctors in this branch")} selectAllLabel={tr("Select all current doctors")} assignedLabel={tr("Choose one or more doctors for this staff member.")} futureHelp={tr("This option also includes doctors added to the branch in the future.")} /></div>}
        {p.role !== "owner" && <div className="md:col-span-2 rounded-xl border border-pine-100 bg-pine-50 p-4"><p className="font-semibold text-pine-900">{tr("Queue-only access")}</p><p className="mt-1 text-sm text-ink/70">{tr("Staff can manage queues for their assigned doctors. Schedule management can be enabled separately under Edit staff access. Other branch administration privileges are not granted.")}</p><input type="hidden" name="permissions" value="queue.manage" /></div>}
        <button className="justify-self-start rounded-full bg-pine-900 px-6 py-2.5 font-semibold text-white hover:bg-pine-700">{tr("Create account")}</button>
      </AdminActionForm>

      <section className="mt-8"><div className="mb-3 flex items-end justify-between"><h2 className="font-serif text-2xl text-pine-900">{p.role === "owner" ? tr("Branch administrator accounts") : tr("Your branch staff")}</h2><span className="text-sm text-ink/60">{staff.length} {tr("accounts")}</span></div>
        <ul className="divide-y divide-pine-100 rounded-2xl border border-pine-100 bg-white">{staff.map((s) => <li key={s.username} className="flex flex-wrap items-center justify-between gap-3 p-4"><div><strong>{s.name}</strong> <span className="text-ink/60">({s.username})</span><span className="block text-sm text-ink/70">{s.role === "branch_admin" || s.role === "branch" ? tr("Branch administrator") : s.role === "doctor" ? `Doctor access · ${s.doctorName}` : tr("Branch staff")} · {s.unit?.replace("Ibn Sina ", "")}</span><span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${s.active === false ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-800"}`}>{s.active === false ? tr("Inactive") : tr("Active")}</span><span className="mt-1 block text-xs text-emerald-800">{s.role === "branch_admin" || s.role === "branch" ? tr("Branch administration") : s.role === "staff" ? `${s.doctorName ? `${s.doctorName} · ` : ""}${STAFF_ASSIGNABLE_PERMISSIONS.filter((permission) => (s.permissions || []).includes(permission.key)).map((permission) => tr(permission.label)).join(" · ") || tr("No tasks enabled")}` : (s.permissions || []).join(" · ") || tr("No extra permissions")}</span></div>{p.role !== "owner" && s.role === "staff" && <details className="w-full max-w-xl rounded-xl border border-pine-100 bg-pine-50/50 p-3">
              <summary className="cursor-pointer text-sm font-bold text-pine-800">{tr("Edit staff access")}</summary>
              <AdminActionForm action={updateStaffAccess} className="mt-3 grid gap-3" successMessage={tr("Staff access updated.", "কর্মীর অ্যাক্সেস আপডেট হয়েছে।")} pendingMessage={tr("Saving staff access…", "কর্মীর অ্যাক্সেস সংরক্ষণ হচ্ছে…")}>
                <input type="hidden" name="username" value={s.username}/>
                <DoctorAssignmentPicker doctors={assignedDoctors} initialSelected={s.doctorSlugs || (s.doctorSlug ? [s.doctorSlug] : [])} initialAllDoctors={s.allDoctors === true} allDoctorsLabel={tr("All doctors in this branch")} selectAllLabel={tr("Select all current doctors")} assignedLabel={tr("Choose one or more doctors for this staff member.")} futureHelp={tr("This option also includes doctors added to the branch in the future.")} />
                <fieldset className="grid gap-2">
                  <legend className="mb-1 text-xs font-bold uppercase tracking-wide text-pine-700">{tr("Allowed tasks")}</legend>
                  {STAFF_ASSIGNABLE_PERMISSIONS.map((permission) => <label key={permission.key} className="flex items-start gap-2 rounded-lg bg-white px-3 py-2 text-xs text-ink/80">
                    <input type="checkbox" name="permissions" value={permission.key} defaultChecked={(s.permissions || []).includes(permission.key)} className="mt-0.5 size-4 shrink-0 accent-emerald-700"/>
                    <span><strong className="block text-pine-900">{tr(permission.label)}</strong><span className="text-ink/55">{tr(permission.group)}</span></span>
                  </label>)}
                </fieldset>
                <p className="text-[11px] leading-5 text-ink/55">{tr("Staff access remains limited to the selected doctors (or all doctors) in this branch. Schedule management applies only to those doctors; doctor administration remains restricted to Branch Admins.")}</p>
                <button className="justify-self-start rounded-full bg-pine-900 px-4 py-2 text-xs font-bold text-white">{tr("Save access")}</button>
              </AdminActionForm>
            </details>}{(p.role === "owner" || (s.role !== "branch_admin" && s.role !== "branch")) && <AdminActionForm action={toggleAccountAction} successMessage={tr("Account status updated.", "অ্যাকাউন্টের অবস্থা আপডেট হয়েছে।")} pendingMessage={tr("Updating account…", "অ্যাকাউন্ট আপডেট হচ্ছে…")}><input type="hidden" name="username" value={s.username}/><input type="hidden" name="active" value={String(s.active === false)}/><button className={`rounded-full px-3 py-2 text-xs font-bold ${s.active === false ? "bg-emerald-700 text-white" : "bg-rose-50 text-rose-700"}`}>{s.active === false ? tr("Reactivate") : tr("Deactivate")}</button></AdminActionForm>}</li>)}{!staff.length && <li className="p-4 text-ink/70">{tr("No accounts created yet.")}</li>}</ul>
      </section>
    </main>
  </>;
}

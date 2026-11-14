import AdminActionForm from "@/components/AdminActionForm";
import Link from "next/link";
import { redirect } from "next/navigation";
import AdminNav from "@/components/AdminNav";
import { getAdmin } from "@/lib/adminT";
import { getSession, hasPermission, isBranchAdmin } from "@/lib/auth";
import { getAllDoctors } from "@/lib/data";
import { getScheduleList, getWeeklyScheduleList } from "@/lib/queue";
import { todayDhaka, fmtDate } from "@/lib/time";
import { publishScheduleAction, disableWeeklyScheduleAction, removeScheduleAction } from "./actions";
import WeeklyScheduleForm from "./WeeklyScheduleForm";

export const dynamic = "force-dynamic";

const field = "mt-1 w-full rounded-xl border border-pine-100 bg-white px-3 py-3 text-sm text-ink outline-none transition focus:border-pine-500 focus:ring-2 focus:ring-pine-100";
const statusStyle = {
  scheduled: "bg-blue-50 text-blue-800",
  in_progress: "bg-emerald-50 text-emerald-800",
  break: "bg-amber-50 text-amber-800",
  finished: "bg-slate-100 text-slate-600",
  cancelled: "bg-rose-50 text-rose-700",
};
const statusText = {
  scheduled: "Published",
  in_progress: "Live",
  break: "On break",
  finished: "Finished",
  cancelled: "Cancelled",
};

export default async function ScheduleManager({ searchParams }) {
  const { tr } = await getAdmin();
  const p = await getSession();
  if (!p || !(p.role === "owner" || isBranchAdmin(p) || hasPermission(p, "schedules.manage"))) redirect(p ? "/admin/queue" : "/admin/login");
  const sp = await searchParams;
  const from = todayDhaka();
  const to = todayDhaka(14);
  const [doctors, schedules, weeklySchedules] = await Promise.all([
    getAllDoctors(),
    getScheduleList(from, to, p),
    getWeeklyScheduleList(p),
  ]);
  const branchDoctors = doctors.filter((d) => p.role === "owner" || d.unit === p.unit);
  const grouped = (schedules || []).reduce((acc, item) => {
    (acc[item.date] ||= []).push(item);
    return acc;
  }, {});

  return (
    <>
      <AdminNav p={p} current="/admin/schedules" />
      <main className="mx-auto max-w-6xl px-4 py-8 md:py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.22em] text-emerald-700">{p.role === "owner" ? tr("Main admin workspace") : tr("Branch admin workspace")}</p>
            <h1 className="mt-2 font-serif text-3xl text-pine-950 md:text-4xl">{p.role === "owner" ? tr("All branch doctor schedules") : tr("Branch doctor schedules")}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-ink/65">{tr("Publish consultation sessions before patients book. Only published dates appear as available on the public appointment page.")}</p>
          </div>
          <Link href="/admin/queue" className="rounded-full border border-pine-200 px-5 py-3 text-sm font-semibold text-pine-800 transition hover:bg-pine-50">{tr("Open live queue")} <span aria-hidden="true">↗</span></Link>
        </div>

        {sp.err && <p role="alert" className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{sp.err}</p>}
        {sp.ok === "weekly-disabled" && <p role="status" className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">Recurring availability disabled. Already published sessions and patient bookings are not changed.</p>}
        {sp.ok === "weekly" && <p role="status" className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">Weekly availability saved. Matching dates will become bookable in the rolling booking window.</p>}
        {sp.ok === "published" && <p role="status" className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{tr("Schedule published. Patients can now select this date when booking.")}</p>}
        {sp.ok === "removed" && <p role="status" className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{tr("Unused schedule removed.")}</p>}

        <section className="mt-8 rounded-3xl border border-emerald-200 bg-emerald-50/60 p-5 shadow-sm md:p-7">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[.18em] text-emerald-800">Recurring availability</p>
            <h2 className="mt-2 font-serif text-2xl text-pine-950">Set a doctor’s weekly schedule</h2>
            <p className="mt-2 text-sm leading-6 text-ink/65">Choose the weekdays and consultation hours. The system will create bookable sessions only on those days within the patient booking window. The schedule repeats until changed or its optional end date.</p>
          </div>
          {!branchDoctors.length ? (
            <p className="mt-5 text-sm text-ink/65">Add doctor records before configuring weekly availability.</p>
          ) : (
            <WeeklyScheduleForm doctors={branchDoctors} minDate={from} />
          )}
          {weeklySchedules?.length ? (
            <div className="mt-6 border-t border-emerald-200 pt-4">
              <h3 className="text-sm font-bold text-pine-900">Active weekly schedules</h3>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {weeklySchedules.map((item) => (
                  <div key={item.doctorSlug} className="rounded-xl border border-emerald-100 bg-white p-3 text-sm">
                    <p className="font-semibold text-pine-950">{item.doctorName}</p>
                    <p className="mt-1 text-xs text-ink/65">{(item.weekdays || []).map((day) => ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][day]).join(", ")} · {item.startTime}–{item.endTime}</p>
                    <p className="mt-1 text-xs text-ink/50">{item.maxPatients} serials/day · {item.endsOn ? `Until ${item.endsOn}` : "Repeats until changed"}</p>
                    <AdminActionForm action={disableWeeklyScheduleAction} className="mt-2" successMessage={tr("Weekly schedule disabled.", "সাপ্তাহিক সময়সূচি বন্ধ করা হয়েছে।")} pendingMessage={tr("Disabling schedule…", "সময়সূচি বন্ধ হচ্ছে…")}><input type="hidden" name="doctorSlug" value={item.doctorSlug}/><button className="text-xs font-semibold text-rose-700 underline underline-offset-4">Disable recurring schedule</button></AdminActionForm>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[.9fr_1.1fr]">
          <div className="h-fit rounded-3xl border border-pine-100 bg-white p-5 shadow-sm md:p-7">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-pine-50 text-xl text-pine-800">＋</span>
              <div>
                <h2 className="font-serif text-2xl text-pine-950">{tr("Publish a session")}</h2>
                <p className="text-xs text-ink/60">{tr("Available for the next 14 days")}</p>
              </div>
            </div>
            {!branchDoctors.length ? (
              <p className="mt-6 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">{tr("No doctors are available in the directory. Add doctor records before publishing schedules.")}</p>
            ) : (
              <AdminActionForm action={publishScheduleAction} className="mt-6 space-y-4" successMessage={tr("Doctor session published.", "ডাক্তারের সেশন প্রকাশিত হয়েছে।")} pendingMessage={tr("Publishing session…", "সেশন প্রকাশ করা হচ্ছে…")} resetOnSuccess>
                <label className="block text-sm font-semibold text-pine-900">{tr("Doctor")}
                  <select name="doctorSlug" required defaultValue="" className={field}>
                    <option value="" disabled>{tr("Select a doctor")}</option>
                    {branchDoctors.map((d) => <option key={d.slug} value={d.slug}>{d.name} · {d.department} · {d.unit}</option>)}
                  </select>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="block text-sm font-semibold text-pine-900">{tr("Consultation date")}
                    <input name="date" type="date" min={from} max={to} defaultValue={from} required className={field} />
                  </label>
                  <label className="block text-sm font-semibold text-pine-900">{tr("Start time")}
                    <input name="startTime" type="time" defaultValue="17:00" required className={field} />
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <label className="block text-sm font-semibold text-pine-900">{tr("Serial capacity")}
                    <input name="maxPatients" type="number" min="1" max="200" defaultValue="40" required className={field} />
                  </label>
                  <label className="block text-sm font-semibold text-pine-900">{tr("Avg. minutes / patient")}
                    <input name="avgMin" type="number" min="3" max="45" defaultValue="8" required className={field} />
                  </label>
                </div>
                <div className="rounded-2xl bg-pine-50 p-4 text-xs leading-5 text-pine-900/80">{tr("Publishing a session makes the date bookable. Serial numbers are assigned atomically, and patients can track their estimated turn online.")}</div>
                <button className="w-full rounded-full bg-pine-900 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-pine-700">{tr("Publish doctor schedule")}</button>
              </AdminActionForm>
            )}
          </div>

          <div className="rounded-3xl border border-pine-100 bg-white p-5 shadow-sm md:p-7">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="font-serif text-2xl text-pine-950">{tr("Published calendar")}</h2>
                <p className="mt-1 text-xs text-ink/60">{from} to {to} · Bangladesh time</p>
              </div>
              <span className="rounded-full bg-pine-50 px-3 py-1.5 text-xs font-bold text-pine-800">{schedules?.length ?? 0} sessions</span>
            </div>

            {schedules === null ? (
              <div className="mt-6 rounded-2xl bg-amber-50 p-5 text-sm text-amber-900">{tr("Database is not connected. Configure MONGODB_URI to manage doctor schedules.")}</div>
            ) : !schedules.length ? (
              <div className="mt-6 rounded-2xl border border-dashed border-pine-200 p-8 text-center">
                <p className="font-semibold text-pine-900">{tr("No sessions published yet")}</p>
                <p className="mt-1 text-sm text-ink/60">{tr("Create the first doctor schedule using the form.")}</p>
              </div>
            ) : (
              <div className="mt-5 space-y-6">
                {Object.entries(grouped).map(([date, rows]) => (
                  <section key={date}>
                    <div className="mb-3 flex items-center gap-3">
                      <h3 className="text-sm font-bold text-pine-900">{fmtDate(date)}</h3>
                      <div className="h-px flex-1 bg-pine-100" />
                      <span className="text-xs text-ink/50">{rows.length} doctor{rows.length === 1 ? "" : "s"}</span>
                    </div>
                    <div className="space-y-3">
                      {rows.map((s) => (
                        <article key={s.key} className="rounded-2xl border border-pine-100 p-4">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="min-w-0">
                              <h4 className="font-semibold text-pine-950">{s.doctorName}</h4>
                              <p className="mt-0.5 text-xs text-ink/60">{s.department} · {s.unit}</p>
                              <p className="mt-2 text-sm font-semibold text-pine-800">{s.startTime} <span className="font-normal text-ink/50">· {s.maxPatients} serials · {s.avgMin} min average</span></p>
                            </div>
                            <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusStyle[s.status] || "bg-slate-100 text-slate-700"}`}>{tr(statusText[s.status] || s.status)}</span>
                          </div>
                          <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-pine-50 p-3 text-center">
                            <div><p className="font-serif text-xl text-pine-900">{s.booked}</p><p className="text-[11px] text-ink/60">{tr("Booked")}</p></div>
                            <div><p className="font-serif text-xl text-pine-900">{s.seatsLeft}</p><p className="text-[11px] text-ink/60">{tr("Serials left")}</p></div>
                            <div><p className="font-serif text-xl text-pine-900">{s.lastSerial || 0}</p><p className="text-[11px] text-ink/60">{tr("Last issued")}</p></div>
                          </div>
                          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                            <Link href={`/admin/queue?date=${date}&doc=${s.doctorSlug}`} className="text-xs font-bold text-emerald-800 underline underline-offset-4">{tr("Open queue console ↗")}</Link>
                            {s.canRemove && <AdminActionForm action={removeScheduleAction} successMessage={tr("Unused schedule removed.", "অব্যবহৃত সময়সূচি সরানো হয়েছে।")} pendingMessage={tr("Removing schedule…", "সময়সূচি সরানো হচ্ছে…")}><input type="hidden" name="key" value={s.key} /><button className="text-xs font-semibold text-rose-700 underline underline-offset-4">{tr("Remove unused schedule")}</button></AdminActionForm>}
                          </div>
                        </article>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            )}
          </div>
        </section>
        <p className="mt-6 text-xs leading-5 text-ink/50">{tr("A schedule with patient activity cannot be removed from this page. Use the queue console to manage an active consultation. Verify each doctor’s real clinic hours and branch before publishing.")}</p>
      </main>
    </>
  );
}

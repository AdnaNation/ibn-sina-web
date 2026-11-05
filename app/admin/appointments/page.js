import { redirect } from "next/navigation";
import Link from "next/link";
import { Download, Search } from "lucide-react";
import AdminNav from "@/components/AdminNav";
import { getSession, hasPermission } from "@/lib/auth";
import { getAdmin } from "@/lib/adminT";
import { searchAppointments, maskPhone } from "@/lib/appointments";
import { todayDhaka } from "@/lib/time";
import { bnDigits } from "@/lib/bnData";
import { cancelAppointmentAction } from "./actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Appointments" };

const STATUS = {
  waiting: ["Waiting", "অপেক্ষমাণ", "bg-blue-50 text-blue-800"],
  serving: ["With doctor", "ডাক্তারের কাছে", "bg-emerald-50 text-emerald-800"],
  done: ["Seen", "দেখা হয়েছে", "bg-slate-100 text-slate-700"],
  skipped: ["Did not come", "আসেননি", "bg-amber-50 text-amber-800"],
  cancelled: ["Cancelled", "বাতিল", "bg-rose-50 text-rose-700"],
};
const input = "w-full rounded-xl border border-pine-100 bg-white px-3 py-2.5 text-sm outline-none focus:border-pine-500 focus:ring-2 focus:ring-pine-100";

export default async function AppointmentsPage({ searchParams }) {
  const p = await getSession();
  if (!p) redirect("/admin/login");
  if (!hasPermission(p, "appointments.view")) redirect("/admin");
  const { bn } = await getAdmin();
  const t = (en, b) => (bn ? b : en);
  const d = (x) => (bn ? bnDigits(x) : String(x));
  const sp = await searchParams;
  const date = /^\d{4}-\d{2}-\d{2}$/.test(sp.date || "") ? sp.date : todayDhaka();
  const q = String(sp.q || "");
  const status = String(sp.status || "");
  const rows = await searchAppointments(p, { date, q, status });
  const canManage = hasPermission(p, "appointments.manage");
  const canPhone = hasPermission(p, "patients.view");
  const canExport = hasPermission(p, "reports.view");
  const back = `/admin/appointments?${new URLSearchParams({ date, q, status })}`;
  const count = (s) => (rows || []).filter((r) => r.status === s).length;

  return (
    <>
      <AdminNav p={p} current="/admin/appointments" />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="font-serif text-3xl font-semibold text-pine-950">{t("Appointments", "অ্যাপয়েন্টমেন্ট")}</h1>
        <p className="mt-1 text-sm text-ink/65">{canPhone ? t("Find any booking by patient name, mobile number, tracking code or doctor.", "রোগীর নাম, মোবাইল নম্বর, ট্র্যাকিং কোড বা ডাক্তার দিয়ে যেকোনো বুকিং খুঁজুন।") : t("Find bookings by tracking code or doctor. Patient identity and notes are restricted.", "ট্র্যাকিং কোড বা ডাক্তার দিয়ে বুকিং খুঁজুন। রোগীর পরিচয় ও নোট দেখার অনুমতি নেই।")}</p>

        {sp.err && <p role="alert" className="mt-5 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-800">{sp.err}</p>}
        {sp.ok === "cancelled" && <p role="status" className="mt-5 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{t("Appointment cancelled.", "অ্যাপয়েন্টমেন্ট বাতিল করা হয়েছে।")}</p>}

        <form className="mt-6 grid gap-3 rounded-2xl border border-pine-100 bg-white p-4 shadow-sm sm:grid-cols-[auto_1fr_auto_auto]">
          <label className="text-xs font-bold text-pine-800">{t("Date", "তারিখ")}<input type="date" name="date" defaultValue={date} className={`${input} mt-1`} /></label>
          <label className="text-xs font-bold text-pine-800">{t("Search", "খুঁজুন")}<input name="q" defaultValue={q} placeholder={canPhone ? t("Name, mobile, code or doctor", "নাম, মোবাইল, কোড বা ডাক্তার") : t("Tracking code or doctor", "ট্র্যাকিং কোড বা ডাক্তার")} className={`${input} mt-1`} /></label>
          <label className="text-xs font-bold text-pine-800">{t("Status", "অবস্থা")}
            <select name="status" defaultValue={status} className={`${input} mt-1`}>
              <option value="">{t("All", "সব")}</option>
              {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{bn ? v[1] : v[0]}</option>)}
            </select>
          </label>
          <button className="inline-flex items-center justify-center gap-2 self-end rounded-xl bg-pine-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-pine-800"><Search size={16} />{t("Show", "দেখুন")}</button>
        </form>

        {rows === null ? (
          <p className="mt-6 rounded-xl bg-rose-50 p-4 text-sm text-rose-800">{t("The database is not connected.", "ডাটাবেস সংযুক্ত নেই।")}</p>
        ) : (
          <>
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-ink/70" aria-live="polite">
                <b className="text-pine-950">{d(rows.length)}</b> {t("appointments", "টি অ্যাপয়েন্টমেন্ট")} · {d(count("waiting"))} {t("waiting", "অপেক্ষমাণ")} · {d(count("done"))} {t("seen", "দেখা হয়েছে")} · {d(count("cancelled"))} {t("cancelled", "বাতিল")}
              </p>
              {canExport && (
                <a href={`/admin/appointments/export?${new URLSearchParams({ date, q, status })}`} className="inline-flex items-center gap-2 rounded-full border border-pine-200 px-4 py-2 text-sm font-bold text-pine-800 hover:bg-pine-50">
                  <Download size={15} />{t("Download CSV", "CSV ডাউনলোড")}
                </a>
              )}
            </div>
            <div className="mt-3 overflow-x-auto rounded-2xl border border-pine-100 bg-white shadow-sm">
              <table className="w-full min-w-[820px] text-left text-sm">
                <thead className="bg-pine-50/60 text-xs text-ink/55">
                  <tr>{[t("Serial", "সিরিয়াল"), t("Patient", "রোগী"), t("Mobile", "মোবাইল"), t("Doctor", "ডাক্তার"), t("Branch", "শাখা"), t("Status", "অবস্থা"), ""].map((h, i) => <th key={i} className="px-4 py-3 font-semibold">{h}</th>)}</tr>
                </thead>
                <tbody>
                  {rows.map((r) => {
                    const [en, b, cls] = STATUS[r.status] || [r.status, r.status, "bg-slate-100 text-slate-700"];
                    return (
                      <tr key={r.ref} className="border-t border-pine-50">
                        <td className="px-4 py-3 font-serif text-xl font-semibold text-pine-900">{d(r.serial)}</td>
                        <td className="px-4 py-3"><b className="text-pine-950">{r.name}</b>{r.walkIn && <span className="ml-2 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">{t("walk-in", "সরাসরি")}</span>}<span className="block text-xs text-ink/50">{r.ref}</span></td>
                        <td className="px-4 py-3 tabular-nums">{canPhone ? d(r.phone || "—") : d(maskPhone(r.phone) || "—")}</td>
                        <td className="px-4 py-3">{r.doctor}<span className="block text-xs text-ink/50">{r.department}</span></td>
                        <td className="px-4 py-3 text-xs text-ink/70">{r.unit.replace("Ibn Sina ", "")}</td>
                        <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${cls}`}>{bn ? b : en}</span></td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/track/${r.ref}`} className="text-xs font-bold text-pine-700 underline underline-offset-4">{t("Ticket", "টিকিট")}</Link>
                            {canManage && r.status === "waiting" && (
                              <form action={cancelAppointmentAction}>
                                <input type="hidden" name="ref" value={r.ref} /><input type="hidden" name="back" value={back} />
                                <button className="rounded-full border border-rose-200 px-3 py-1 text-xs font-bold text-rose-700 hover:bg-rose-50">{t("Cancel", "বাতিল")}</button>
                              </form>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {!rows.length && <tr><td colSpan={7} className="px-4 py-10 text-center text-ink/55">{t("No appointments match.", "কোনো অ্যাপয়েন্টমেন্ট পাওয়া যায়নি।")}</td></tr>}
                </tbody>
              </table>
            </div>
            {!canPhone && <p className="mt-3 text-xs text-ink/50">{t("Mobile numbers are partly hidden because your account does not have the “View patient details” permission.", "আপনার অ্যাকাউন্টে “রোগীর তথ্য দেখা” অনুমতি না থাকায় মোবাইল নম্বর আংশিক লুকানো।")}</p>}
          </>
        )}
      </main>
    </>
  );
}

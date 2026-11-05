import { redirect } from "next/navigation";
import AdminNav from "@/components/AdminNav";
import { getSession, hasPermission } from "@/lib/auth";
import { getAdmin } from "@/lib/adminT";
import { getOperationalReport } from "@/lib/reports";
import { isValidISODate, todayDhaka } from "@/lib/time";

export const dynamic = "force-dynamic";
export const metadata = { title: "Operational reports" };

const input = "rounded-xl border border-pine-100 bg-white px-3 py-2.5 text-sm";

export default async function ReportsPage({ searchParams }) {
  const p = await getSession();
  if (!p) redirect("/admin/login");
  if (!hasPermission(p, "reports.view")) redirect("/admin");
  const { bn } = await getAdmin();
  const tr = (english, bangla) => bn ? bangla : english;
  const sp = await searchParams;
  const today = todayDhaka();
  const fallbackFrom = todayDhaka(-6);
  let from = typeof sp.from === "string" && isValidISODate(sp.from) ? sp.from : fallbackFrom;
  let to = typeof sp.to === "string" && isValidISODate(sp.to) ? sp.to : today;
  const days = (Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86400000;
  const invalidRange = from > to || days > 30;
  if (invalidRange) {
    from = fallbackFrom;
    to = today;
  }
  const report = await getOperationalReport(p, from, to);
  const n = (value) => bn ? String(value).replace(/\d/g, (digit) => "০১২৩৪৫৬৭৮৯"[Number(digit)]) : String(value);
  const summary = report?.totals;
  const maxDaily = Math.max(1, ...(report?.daily || []).map((row) => row.total));
  const maxDoctor = Math.max(1, ...(report?.doctors || []).map((row) => row.total));
  const cards = [
    [summary?.total || 0, tr("Total appointments", "মোট অ্যাপয়েন্টমেন্ট"), "text-pine-950"],
    [summary?.done || 0, tr("Completed", "সম্পন্ন"), "text-emerald-800"],
    [summary?.waiting || 0, tr("Waiting", "অপেক্ষমাণ"), "text-blue-800"],
    [summary?.cancelled || 0, tr("Cancelled", "বাতিল"), "text-rose-700"],
    [summary?.skipped || 0, tr("Skipped", "অনুপস্থিত"), "text-amber-800"],
    [report?.sessions || 0, tr("Published sessions", "প্রকাশিত সেশন"), "text-pine-800"],
  ];
  return <>
    <AdminNav p={p} current="/admin/reports" />
    <main className="mx-auto max-w-6xl px-4 py-8">
      <p className="text-xs font-bold uppercase tracking-[.2em] text-emerald-700">{tr("Clinic operations", "ক্লিনিক পরিচালনা")}</p>
      <h1 className="mt-2 font-serif text-3xl font-semibold text-pine-950">{tr("Operational reports", "কার্যক্রমের প্রতিবেদন")}</h1>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-ink/65">{tr("Review appointment activity by date and doctor. Reports contain aggregate counts only and never display patient names, phone numbers or clinical notes.", "তারিখ ও চিকিৎসক অনুযায়ী অ্যাপয়েন্টমেন্টের কার্যক্রম দেখুন। প্রতিবেদনে শুধু সামগ্রিক সংখ্যা থাকে; রোগীর নাম, ফোন নম্বর বা চিকিৎসা-সংক্রান্ত নোট দেখানো হয় না।")}</p>
      {invalidRange && <p role="alert" className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">{tr("The requested range was invalid. Showing the most recent seven days.", "তারিখের পরিসর সঠিক নয়। সর্বশেষ সাত দিনের তথ্য দেখানো হচ্ছে।")}</p>}
      <form className="mt-6 flex flex-wrap items-end gap-3 rounded-2xl border border-pine-100 bg-white p-4">
        <label className="grid gap-1 text-xs font-bold text-pine-800">{tr("From", "শুরু")}<input className={input} type="date" name="from" defaultValue={from} /></label>
        <label className="grid gap-1 text-xs font-bold text-pine-800">{tr("To", "শেষ")}<input className={input} type="date" name="to" defaultValue={to} /></label>
        <button className="rounded-xl bg-pine-900 px-5 py-2.5 text-sm font-bold text-white">{tr("Apply range", "প্রয়োগ করুন")}</button>
        <span className="text-xs text-ink/50">{tr("Maximum range: 31 days.", "সর্বোচ্চ সময়সীমা: ৩১ দিন।")}</span>
      </form>
      {!report ? (
        <p role="alert" className="mt-6 rounded-2xl bg-amber-50 p-5 text-sm text-amber-900">{tr("Reports are unavailable because the database could not be reached.", "ডাটাবেসে সংযোগ করা যায়নি, তাই প্রতিবেদন দেখানো যাচ্ছে না।")}</p>
      ) : <>
        <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {cards.map(([value, label, tone]) => <article key={label} className="rounded-2xl border border-pine-100 bg-white p-4 shadow-sm"><p className={`font-serif text-3xl font-semibold ${tone}`}>{n(value)}</p><p className="mt-1 text-xs leading-5 text-ink/60">{label}</p></article>)}
        </section>
        <section className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_.85fr]">
          <article className="rounded-2xl border border-pine-100 bg-white p-5">
            <h2 className="font-serif text-2xl text-pine-950">{tr("Daily appointment volume", "দৈনিক অ্যাপয়েন্টমেন্ট")}</h2>
            <p className="mt-1 text-xs text-ink/55">{from} — {to}</p>
            <div className="mt-5 space-y-3">
              {report.daily.map((row) => <div key={row.date} className="grid grid-cols-[5.5rem_1fr_2.5rem] items-center gap-3 text-xs">
                <span className="tabular-nums text-ink/65">{row.date.slice(5)}</span>
                <div className="h-3 overflow-hidden rounded-full bg-pine-50"><div className="h-full rounded-full bg-emerald-700" style={{ width: `${Math.max(2, row.total / maxDaily * 100)}%` }} /></div>
                <b className="text-right tabular-nums text-pine-950">{n(row.total)}</b>
              </div>)}
              {!report.daily.length && <p className="py-8 text-center text-sm text-ink/50">{tr("No appointments in this period.", "এই সময়ে কোনো অ্যাপয়েন্টমেন্ট নেই।")}</p>}
            </div>
          </article>
          <article className="rounded-2xl border border-pine-100 bg-white p-5">
            <h2 className="font-serif text-2xl text-pine-950">{tr("Status breakdown", "অবস্থার বিবরণ")}</h2>
            <div className="mt-5 space-y-4">
              {[
                ["done", tr("Completed", "সম্পন্ন"), "bg-emerald-700"],
                ["serving", tr("With doctor", "ডাক্তারের কাছে"), "bg-blue-700"],
                ["waiting", tr("Waiting", "অপেক্ষমাণ"), "bg-sky-500"],
                ["skipped", tr("Skipped", "অনুপস্থিত"), "bg-amber-500"],
                ["cancelled", tr("Cancelled", "বাতিল"), "bg-rose-600"],
              ].map(([key, label, color]) => <div key={key}>
                <div className="mb-1 flex justify-between text-xs"><span className="text-ink/70">{label}</span><b className="tabular-nums text-pine-950">{n(summary[key] || 0)}</b></div>
                <div className="h-2 overflow-hidden rounded-full bg-pine-50"><div className={`h-full rounded-full ${color}`} style={{ width: `${summary.total ? (summary[key] || 0) / summary.total * 100 : 0}%` }} /></div>
              </div>)}
            </div>
          </article>
        </section>
        <section className="mt-8 rounded-2xl border border-pine-100 bg-white p-5">
          <div className="flex flex-wrap items-end justify-between gap-2"><div><h2 className="font-serif text-2xl text-pine-950">{tr("Doctor activity", "চিকিৎসক অনুযায়ী কার্যক্রম")}</h2><p className="mt-1 text-xs text-ink/55">{tr("Top 25 by appointment volume", "অ্যাপয়েন্টমেন্টের সংখ্যায় শীর্ষ ২৫")}</p></div><span className="text-xs text-ink/50">{n(report.doctors.length)} {tr("doctors", "জন চিকিৎসক")}</span></div>
          <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[600px] text-left text-sm">
            <thead className="text-xs text-ink/55"><tr className="border-b border-pine-100"><th className="py-3 pr-3">{tr("Doctor", "চিকিৎসক")}</th><th className="py-3 px-3">{tr("Branch", "শাখা")}</th><th className="py-3 px-3 text-right">{tr("Total", "মোট")}</th><th className="py-3 px-3 text-right">{tr("Completed", "সম্পন্ন")}</th><th className="py-3 pl-3 text-right">{tr("Waiting", "অপেক্ষমাণ")}</th></tr></thead>
            <tbody>{report.doctors.map((row, index) => <tr key={`${row.doctor}-${row.unit}-${index}`} className="border-b border-pine-50 last:border-0"><td className="py-3 pr-3 font-semibold text-pine-950">{row.doctor}<div className="mt-1 h-1.5 max-w-40 overflow-hidden rounded-full bg-pine-50"><div className="h-full rounded-full bg-emerald-700" style={{ width: `${row.total / maxDoctor * 100}%` }} /></div></td><td className="px-3 py-3 text-xs text-ink/60">{row.unit.replace("Ibn Sina ", "")}</td><td className="px-3 py-3 text-right tabular-nums">{n(row.total)}</td><td className="px-3 py-3 text-right tabular-nums">{n(row.done)}</td><td className="pl-3 py-3 text-right tabular-nums">{n(row.waiting)}</td></tr>)}</tbody>
          </table>{!report.doctors.length && <p className="py-8 text-center text-sm text-ink/50">{tr("No doctor activity in this period.", "এই সময়ে কোনো চিকিৎসক কার্যক্রম নেই।")}</p>}</div>
        </section>
        <p className="mt-4 text-xs leading-5 text-ink/50">{tr("These are operational prototype metrics, not audited financial or clinical outcome reports. Data accuracy depends on the records entered by staff.", "এগুলো কার্যক্রমের প্রোটোটাইপ পরিসংখ্যান; নিরীক্ষিত আর্থিক বা চিকিৎসাগত ফলাফলের প্রতিবেদন নয়। তথ্যের নির্ভুলতা কর্মীদের রেকর্ডের ওপর নির্ভরশীল।")}</p>
      </>}
    </main>
  </>;
}

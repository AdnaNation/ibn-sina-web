import { redirect } from "next/navigation";
import Link from "next/link";
import { Building2, CalendarClock, ClipboardList, Stethoscope, Users, TriangleAlert, CheckCircle2 } from "lucide-react";
import AdminNav from "@/components/AdminNav";
import AutoRefresh from "@/components/AutoRefresh";
import { getSession, hasPermission, isBranchAdmin } from "@/lib/auth";
import { getAdmin } from "@/lib/adminT";
import { getStats } from "@/lib/queue";
import { todayDhaka } from "@/lib/time";
import { getOrganizationStats } from "@/lib/management";
import { bnDigits } from "@/lib/bnData";
import { isDemoEnvironment } from "@/lib/publicFeatures.mjs";

export const dynamic = "force-dynamic";
export const metadata = { title: "Dashboard" };

// Presentation shortcuts use existing MongoDB records only.
const DEMO_ON = isDemoEnvironment();

const Kpi = ({ n, label, tone = "text-pine-900" }) => (
  <div className="rounded-2xl border border-pine-100 bg-white p-4 shadow-sm">
    <p className={`font-serif text-3xl font-semibold ${tone}`}>{n}</p>
    <p className="mt-1 text-xs leading-5 text-ink/60">{label}</p>
  </div>
);

export default async function Overview() {
  const p = await getSession();
  if (!p) redirect("/admin/login");
  const { bn } = await getAdmin();
  const t = (en, b) => (bn ? b : en);
  const d = (x) => (bn ? bnDigits(x) : String(x));

  if (p.role !== "owner") {
    if (isBranchAdmin(p) || hasPermission(p, "queue.manage")) redirect("/admin/queue");
    if (hasPermission(p, "schedules.manage")) redirect("/admin/schedules");
    if (hasPermission(p, "appointments.view")) redirect("/admin/appointments");
    return (
      <>
        <AdminNav p={p} current="/admin" />
        <main className="mx-auto max-w-4xl px-4 py-10">
          <h1 className="font-serif text-3xl font-semibold text-pine-950">{t("Welcome", "স্বাগতম")}, {p.name}</h1>
          <p className="mt-3 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">
            {t("No modules have been assigned to your account. Contact your branch administrator.", "আপনার অ্যাকাউন্টে এখনো কোনো মডিউল দেওয়া হয়নি। শাখা অ্যাডমিনের সঙ্গে যোগাযোগ করুন।")}
          </p>
        </main>
      </>
    );
  }

  const today = todayDhaka();
  const [st, org] = await Promise.all([getStats(today), getOrganizationStats(today)]);

  // Things the Main Admin should act on today.
  const alerts = [];
  if (org) {
    for (const b of org.branches) {
      if (b.active === false) continue;
      if (b.doctors > 0 && b.sessions === 0)
        alerts.push(t(`${b.name}, ${b.area}: no doctor schedule is published for today.`, `${b.name}, ${b.area}: আজকের জন্য কোনো ডাক্তারের সময়সূচি প্রকাশিত হয়নি।`));
      if (b.activeAdmins === 0)
        alerts.push(t(`${b.name}, ${b.area}: no active branch administrator.`, `${b.name}, ${b.area}: কোনো সক্রিয় শাখা অ্যাডমিন নেই।`));
    }
  }

  const quick = [
    [Building2, t("Branches", "শাখা"), "/admin/branches"],
    [CalendarClock, t("Schedules", "সময়সূচি"), "/admin/schedules"],
    [ClipboardList, t("Appointments", "অ্যাপয়েন্টমেন্ট"), "/admin/appointments"],
    [Stethoscope, t("Doctors", "ডাক্তার"), "/admin/doctors"],
    [Users, t("Users & permissions", "ব্যবহারকারী ও অনুমতি"), "/admin/staff"],
  ];

  return (
    <>
      <AdminNav p={p} current="/admin" />
      <div className="mx-auto max-w-6xl px-4 py-8">
        <AutoRefresh every={15000} />
        <p className="text-xs font-bold uppercase tracking-[.2em] text-emerald-700">{t("Organization-wide control centre", "সমগ্র প্রতিষ্ঠানের নিয়ন্ত্রণ কেন্দ্র")}</p>
        <h1 className="mt-2 font-serif text-3xl font-semibold text-pine-950 md:text-4xl">{t("Main Admin Dashboard", "মূল অ্যাডমিন ড্যাশবোর্ড")}</h1>
        <p className="mt-1 text-sm text-ink/60">{t("All branches", "সব শাখা")} · {d(today)} · {t("Bangladesh time", "বাংলাদেশ সময়")}</p>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {quick.map(([Icon, label, href]) => (
            <Link key={href} href={href} className="flex items-center gap-3 rounded-2xl border border-pine-100 bg-white p-4 text-sm font-bold text-pine-900 shadow-sm transition hover:-translate-y-0.5 hover:border-pine-300">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-pine-50 text-pine-800"><Icon size={18} /></span>{label}
            </Link>
          ))}
        </div>

        <section className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5" aria-labelledby="setup-checklist">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.16em] text-emerald-800">{t("Authority preparation", "কর্তৃপক্ষের প্রদর্শনী প্রস্তুতি")}</p>
              <h2 id="setup-checklist" className="mt-1 font-serif text-2xl font-semibold text-pine-950">{t("Admin quick-start checklist", "অ্যাডমিন দ্রুত প্রস্তুতি তালিকা")}</h2>
              <p className="mt-1 text-sm text-ink/65">{t("Complete these steps before inviting someone to explore the prototype.", "প্রোটোটাইপ দেখার আমন্ত্রণ জানানোর আগে ধাপগুলো সম্পন্ন করুন।")}</p>
            </div>
            <Link href="/demo" className="rounded-full border border-emerald-300 bg-white px-4 py-2 text-sm font-bold text-emerald-900">{t("Open demo guide", "ডেমো নির্দেশিকা")} ↗</Link>
          </div>
          <ol className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { label: t("Review branch directory", "শাখার তালিকা যাচাই"), done: Boolean(org?.totals.branches), href: "/admin/branches" },
              { label: t("Review doctor directory", "ডাক্তারের তালিকা যাচাই"), done: Boolean(org?.totals.doctors), href: "/admin/doctors" },
              { label: t("Create role-based demo accounts", "ভূমিকাভিত্তিক ডেমো অ্যাকাউন্ট তৈরি"), done: Boolean(org?.totals.activeStaff), href: "/admin/staff" },
              { label: t("Publish a sample consultation schedule", "নমুনা সময়সূচি প্রকাশ"), done: Boolean(org?.branches?.some((b) => b.sessions > 0)), href: "/admin/schedules" },
              { label: t("Inspect queue and patient tracking", "সিরিয়াল ও রোগী ট্র্যাকিং যাচাই"), done: Boolean(st?.booked), href: "/live" },
              { label: t("Review reports and audit history", "রিপোর্ট ও অডিট ইতিহাস যাচাই"), done: Boolean(org), href: "/admin/reports" },
            ].map((item) => (
              <li key={item.href} className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-white p-3">
                <span aria-label={item.done ? t("Complete", "সম্পন্ন") : t("Needs review", "যাচাই বাকি")} className={item.done ? "grid size-7 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-800" : "grid size-7 shrink-0 place-items-center rounded-full bg-amber-100 text-amber-800"}>{item.done ? "✓" : "!"}</span>
                <Link href={item.href} className="min-w-0 flex-1 text-sm font-semibold text-pine-950 underline-offset-4 hover:underline">{item.label}</Link>
                <span className="text-xs text-ink/50">{item.done ? t("Ready", "প্রস্তুত") : t("Review", "যাচাই")}</span>
              </li>
            ))}
          </ol>
          <p className="mt-3 text-xs leading-5 text-ink/60">{t("These indicators are setup hints based on available records, not a formal readiness certification. Verify all sample information before presenting.", "এই চিহ্নগুলো বিদ্যমান তথ্যের ভিত্তিতে প্রস্তুতির ইঙ্গিত, আনুষ্ঠানিক অনুমোদন নয়। প্রদর্শনের আগে সব নমুনা তথ্য যাচাই করুন।")}</p>
        </section>

        {!st && <p className="mt-5 rounded-xl bg-rose-50 p-4 text-sm font-medium text-rose-800">{t("The database is not connected. Set MONGODB_URI to see live data.", "ডাটাবেস সংযুক্ত নেই। লাইভ তথ্য দেখতে MONGODB_URI সেট করুন।")}</p>}

        {org && (
          <section className="mt-6 rounded-2xl border border-pine-100 bg-white p-5 shadow-sm" aria-label={t("Needs attention", "মনোযোগ প্রয়োজন")}>
            <h2 className="flex items-center gap-2 text-lg font-bold text-pine-950">
              {alerts.length ? <TriangleAlert size={19} className="text-amber-600" /> : <CheckCircle2 size={19} className="text-emerald-600" />}
              {t("Needs attention today", "আজ যেসব বিষয়ে মনোযোগ দরকার")}
            </h2>
            {alerts.length ? (
              <ul className="mt-3 space-y-2 text-sm text-ink/80">{alerts.map((a) => <li key={a} className="rounded-lg bg-amber-50 px-3 py-2">{a}</li>)}</ul>
            ) : (
              <p className="mt-2 text-sm text-ink/60">{t("Nothing urgent. All active branches have schedules and administrators.", "জরুরি কিছু নেই। সব সক্রিয় শাখায় সময়সূচি ও অ্যাডমিন আছে।")}</p>
            )}
          </section>
        )}

        {org && (
          <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8" aria-label={t("Organization totals", "প্রতিষ্ঠানের সারসংক্ষেপ")}>
            <Kpi n={d(org.totals.branches)} label={t("Branches", "শাখা")} />
            <Kpi n={d(org.totals.activeBranches)} label={t("Active branches", "সক্রিয় শাখা")} />
            <Kpi n={d(org.totals.inactiveBranches)} label={t("Inactive branches", "নিষ্ক্রিয় শাখা")} tone={org.totals.inactiveBranches ? "text-amber-700" : undefined} />
            <Kpi n={d(org.totals.activeBranchAdmins)} label={t("Active branch admins", "সক্রিয় শাখা অ্যাডমিন")} />
            <Kpi n={d(org.totals.activeStaff)} label={t("Active staff", "সক্রিয় কর্মী")} />
            <Kpi n={d(org.totals.doctors)} label={t("Doctors", "ডাক্তার")} />
            <Kpi n={d(org.totals.booked)} label={t("Today’s bookings", "আজকের বুকিং")} />
            <Kpi n={d(org.totals.waiting)} label={t("Waiting patients", "অপেক্ষমাণ রোগী")} />
          </section>
        )}

        {org && (
          <section className="mt-6 rounded-2xl border border-pine-100 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div>
                <h2 className="font-serif text-2xl font-semibold text-pine-950">{t("Branch-wise performance", "শাখাভিত্তিক কার্যক্রম")}</h2>
                <p className="mt-1 text-xs text-ink/60">{t("Live counts for today", "আজকের লাইভ হিসাব")}</p>
              </div>
              <Link href="/admin/branches" className="text-sm font-bold text-emerald-800 underline underline-offset-4">{t("Open branch workspace", "শাখা ব্যবস্থাপনা খুলুন")} ↗</Link>
            </div>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr className="border-b border-pine-100 text-xs text-ink/50">
                    {[t("Branch", "শাখা"), t("Status", "অবস্থা"), t("Doctors", "ডাক্তার"), t("Admins", "অ্যাডমিন"), t("Staff", "কর্মী"), t("Booked", "বুকড"), t("Waiting", "অপেক্ষমাণ"), t("Seen", "দেখা হয়েছে")].map((h) => <th key={h} className="py-3 pr-3 font-semibold">{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {org.branches.map((b) => (
                    <tr key={b.slug} className="border-b border-pine-50 last:border-0">
                      <td className="py-3 pr-3 font-semibold text-pine-950">{b.name}<span className="block text-xs font-normal text-ink/50">{b.area}, {b.city}</span></td>
                      <td className="py-3 pr-3"><span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${b.active === false ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-800"}`}>{b.active === false ? t("Inactive", "নিষ্ক্রিয়") : t("Active", "সক্রিয়")}</span></td>
                      {[b.doctors, b.activeAdmins, b.activeStaff, b.booked, b.waiting, b.seen].map((v, i) => <td key={i} className="py-3 pr-3 tabular-nums">{d(v)}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {st && (
          <section className="mt-6" aria-label={t("Today’s clinic activity", "আজকের চেম্বার কার্যক্রম")}>
            <h2 className="font-serif text-2xl font-semibold text-pine-950">{t("Today’s clinic activity", "আজকের চেম্বার কার্যক্রম")}</h2>
            <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
              <Kpi n={d(st.booked)} label={t("Patients booked", "বুকিং হওয়া রোগী")} />
              <Kpi n={d(st.seen)} label={t("Already seen", "দেখা হয়েছে")} />
              <Kpi n={d(st.waiting)} label={t("Waiting now", "এখন অপেক্ষমাণ")} />
              <Kpi n={d(st.skipped)} label={t("Did not come", "আসেননি")} />
              <Kpi n={`${d(st.avgConsult.toFixed(1))} ${t("min", "মিনিট")}`} label={t("Average time with doctor", "ডাক্তারের সঙ্গে গড় সময়")} />
              <Kpi n={d(st.doctors)} label={t("Doctors with a queue", "সিরিয়াল চালু ডাক্তার")} />
              <Kpi n={d(st.lateStarts)} label={t("Doctors who started late", "দেরিতে শুরু করা ডাক্তার")} />
              <Kpi n={`${d(Math.round(st.avgLate))} ${t("min", "মিনিট")}`} label={t("Average late start", "গড় দেরিতে শুরু")} />
            </div>
          </section>
        )}

        {DEMO_ON && (
          <section className="mt-8 rounded-2xl bg-pine-900 p-6 text-white">
            <h2 className="font-serif text-2xl font-semibold">{t("Presentation mode", "প্রেজেন্টেশন মোড")}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-pine-100">
              {t("This presentation uses the existing MongoDB records. No sample clinic, patient, appointment, or staff account is created or reset. Review the current data before sharing the prototype.", "এই প্রদর্শনীতে MongoDB-তে থাকা বর্তমান তথ্য ব্যবহার করা হচ্ছে। নতুন কোনো নমুনা ক্লিনিক, রোগী, অ্যাপয়েন্টমেন্ট বা কর্মী অ্যাকাউন্ট তৈরি বা রিসেট করা হয় না। প্রোটোটাইপ শেয়ার করার আগে বর্তমান তথ্য যাচাই করুন।")}
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Link href="/live" className="rounded-full border border-pine-100 px-5 py-3 text-sm font-semibold">{t("Live queue board", "লাইভ সিরিয়াল বোর্ড")}</Link>
              <Link href="/admin/appointments" className="rounded-full border border-pine-100 px-5 py-3 text-sm font-semibold">{t("Appointments", "অ্যাপয়েন্টমেন্ট")}</Link>
              <Link href="/admin/reports" className="rounded-full border border-pine-100 px-5 py-3 text-sm font-semibold">{t("Operational reports", "কার্যক্রমের রিপোর্ট")}</Link>
              <Link href="/admin/audit" className="rounded-full border border-pine-100 px-5 py-3 text-sm font-semibold">{t("Audit history", "অডিট ইতিহাস")}</Link>
            </div>
          </section>
        )}
      </div>
    </>
  );
}

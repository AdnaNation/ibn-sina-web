import { redirect } from "next/navigation";
import Link from "next/link";
import { Building2, Users, ClipboardList, ShieldCheck } from "lucide-react";
import AdminNav from "@/components/AdminNav";
import { getSession } from "@/lib/auth";
import { getAdmin } from "@/lib/adminT";
import { getOrganizationStats, getAuditLogs } from "@/lib/management";
import { todayDhaka } from "@/lib/time";
import { bnDigits } from "@/lib/bnData";

export const dynamic = "force-dynamic";
export const metadata = { title: "Main Admin Dashboard" };

const Kpi = ({ value, label }) => <div className="rounded-2xl border border-pine-100 bg-white p-4"><p className="font-serif text-3xl font-semibold text-pine-900">{value}</p><p className="mt-1 text-xs text-ink/60">{label}</p></div>;

export default async function Overview() {
  const p = await getSession();
  if (!p) redirect("/admin/login");
  if (p.role !== "owner") {
    if (p.role === "branch_admin" || p.role === "branch") redirect("/admin/schedules");
    if (p.permissions?.includes("queue.manage")) redirect("/admin/queue");
    if (p.permissions?.includes("appointments.view")) redirect("/admin/appointments");
    if (p.permissions?.includes("schedules.manage")) redirect("/admin/schedules");
    return <><AdminNav p={p} current="/admin"/><main className="mx-auto max-w-4xl px-4 py-10"><h1 className="font-serif text-3xl text-pine-950">Welcome, {p.name}</h1><p className="mt-3 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">No modules have been assigned to your account. Contact your branch administrator.</p></main></>;
  }
  const { bn } = await getAdmin();
  const tr = (en, bnText) => bn ? bnText : en;
  const digits = (value) => bn ? bnDigits(value) : String(value);
  const [org, logs] = await Promise.all([getOrganizationStats(todayDhaka()), getAuditLogs({ limit: 12 })]);
  const quick = [
    [Building2, tr("Manage branches", "শাখা ব্যবস্থাপনা"), "/admin/branches"],
    [Users, tr("Branch administrators", "শাখা অ্যাডমিন"), "/admin/staff"],
    [ClipboardList, tr("Audit activity", "কার্যক্রমের লগ"), "/admin/audit"],
  ];
  return <>
    <AdminNav p={p} current="/admin"/>
    <main className="mx-auto max-w-6xl px-4 py-8">
      <p className="text-xs font-bold uppercase tracking-[.18em] text-emerald-700">{tr("Organization oversight", "প্রতিষ্ঠান পর্যবেক্ষণ")}</p>
      <h1 className="mt-2 font-serif text-3xl font-semibold text-pine-950 md:text-4xl">{tr("Main Admin Dashboard", "মূল অ্যাডমিন ড্যাশবোর্ড")}</h1>
      <p className="mt-2 text-sm text-ink/60">{tr("Manage branch access and review what branch administrators and staff are doing. Daily clinic operations belong to each branch team.", "শাখার অ্যাক্সেস পরিচালনা করুন এবং শাখা অ্যাডমিন ও কর্মীদের কার্যক্রম পর্যালোচনা করুন। দৈনন্দিন কার্যক্রম শাখার টিম পরিচালনা করবে।")}</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-3">{quick.map(([Icon,label,href])=><Link key={href} href={href} prefetch className="flex items-center gap-3 rounded-2xl border border-pine-100 bg-white p-4 font-semibold text-pine-900 hover:border-pine-300"><span className="grid size-10 place-items-center rounded-xl bg-pine-50"><Icon size={19}/></span>{label}</Link>)}</div>
      {org && <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4"><Kpi value={digits(org.totals.branches)} label={tr("Total branches","মোট শাখা")}/><Kpi value={digits(org.totals.activeBranches)} label={tr("Active branches","সক্রিয় শাখা")}/><Kpi value={digits(org.totals.activeBranchAdmins)} label={tr("Active branch admins","সক্রিয় শাখা অ্যাডমিন")}/><Kpi value={digits(org.totals.activeStaff)} label={tr("Active staff accounts","সক্রিয় কর্মী অ্যাকাউন্ট")}/></section>}
      {org && <section className="mt-6 rounded-2xl border border-pine-100 bg-white p-5"><h2 className="font-serif text-2xl text-pine-900">{tr("Branch oversight","শাখা পর্যবেক্ষণ")}</h2><div className="mt-4 overflow-x-auto"><table className="w-full min-w-[620px] text-left text-sm"><thead className="border-b border-pine-100 text-xs text-ink/50"><tr>{[tr("Branch","শাখা"),tr("Status","অবস্থা"),tr("Branch admins","শাখা অ্যাডমিন"),tr("Staff","কর্মী"),tr("Doctors","ডাক্তার")].map(x=><th key={x} className="py-3 pr-4">{x}</th>)}</tr></thead><tbody>{org.branches.map(b=><tr key={b.slug} className="border-b border-pine-50 last:border-0"><td className="py-3 pr-4 font-semibold">{b.name}<span className="block text-xs font-normal text-ink/50">{b.area}, {b.city}</span></td><td className="py-3 pr-4">{b.active===false?tr("Inactive","নিষ্ক্রিয়"):tr("Active","সক্রিয়")}</td><td className="py-3 pr-4">{digits(b.activeAdmins)}</td><td className="py-3 pr-4">{digits(b.activeStaff)}</td><td className="py-3 pr-4">{digits(b.doctors)}</td></tr>)}</tbody></table></div></section>}
      <section className="mt-6 rounded-2xl border border-pine-100 bg-white p-5"><div className="flex items-center justify-between gap-3"><div><div className="flex items-center gap-2"><ShieldCheck size={18} className="text-emerald-700"/><h2 className="font-serif text-2xl text-pine-900">{tr("Recent activity","সাম্প্রতিক কার্যক্রম")}</h2></div><p className="mt-1 text-xs text-ink/55">{tr("Latest recorded actions across all branches","সব শাখার সর্বশেষ রেকর্ড করা কার্যক্রম")}</p></div><Link href="/admin/audit" className="text-sm font-bold text-emerald-800 underline">{tr("View all","সব দেখুন")}</Link></div>
        {!logs ? <p className="mt-4 text-sm text-ink/60">{tr("Audit database unavailable.","অডিট ডাটাবেস পাওয়া যাচ্ছে না।")}</p> : !logs.length ? <p className="mt-4 text-sm text-ink/60">{tr("No activity has been recorded yet.","এখনো কোনো কার্যক্রম রেকর্ড হয়নি।")}</p> : <ul className="mt-4 divide-y divide-pine-50">{logs.map((log,i)=><li key={`${log.createdAt}-${i}`} className="flex flex-wrap items-start justify-between gap-3 py-3"><div><p className="text-sm font-semibold text-pine-950">{log.action.replaceAll("_"," ")}</p><p className="mt-1 text-xs text-ink/60">{log.actorName} · {log.actorRole}{log.actorUnit? ` · ${log.actorUnit}`:""}{log.targetId? ` · ${log.targetId}`:""}</p></div><time className="text-xs text-ink/50">{new Date(log.createdAt).toLocaleString("en-GB",{timeZone:"Asia/Dhaka",dateStyle:"medium",timeStyle:"short"})}</time></li>)}</ul>}
      </section>
    </main>
  </>;
}

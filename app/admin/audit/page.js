import { redirect } from "next/navigation";
import AdminNav from "@/components/AdminNav";
import { getAdmin } from "@/lib/adminT";
import { getSession } from "@/lib/auth";
import { getAuditLogs } from "@/lib/management";
export const dynamic = "force-dynamic";
export default async function AuditPage({ searchParams }) {
  const { tr } = await getAdmin();
  const p = await getSession();
  if (!p || p.role !== "owner") redirect("/admin");
  const sp = await searchParams;
  const logs = await getAuditLogs({ limit: 200, action: String(sp.action || "") });
  return <><AdminNav p={p} current="/admin/audit"/><main className="mx-auto max-w-6xl px-4 py-8">
    <p className="text-xs font-bold uppercase tracking-[.2em] text-emerald-700">{tr("Security & accountability")}</p><h1 className="mt-2 font-serif text-3xl text-pine-900">{tr("Audit log")}</h1><p className="mt-2 text-sm text-ink/70">{tr("A chronological record of sign-ins, account changes, schedule changes and live queue operations.")}</p>
    <form className="mt-5 flex flex-wrap gap-2"><input name="action" defaultValue={sp.action||""} placeholder={tr("Filter action (e.g. branch)")} className="min-w-0 flex-1 rounded-xl border border-pine-100 bg-white px-3 py-2 text-sm"/><button className="rounded-full bg-pine-900 px-5 py-2 text-sm font-bold text-white">{tr("Filter")}</button><a href="/admin/audit" className="rounded-full border border-pine-200 px-4 py-2 text-sm font-semibold">{tr("Clear")}</a></form>
    {!logs?<p className="mt-6 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">{tr("Database is not connected. Audit records are stored in MongoDB.")}</p>:<div className="mt-5 overflow-hidden rounded-2xl border border-pine-100 bg-white"><div className="grid grid-cols-[1fr_auto] gap-3 border-b border-pine-100 bg-pine-50 px-4 py-3 text-xs font-bold uppercase tracking-wide text-pine-800 sm:grid-cols-[1.2fr_1fr_1fr_1.5fr]"><span>{tr("Activity")}</span><span className="hidden sm:block">{tr("Actor")}</span><span className="hidden sm:block">{tr("Target")}</span><span>{tr("Time")}</span></div>{logs.map((log,i)=><div key={`${log.createdAt}-${i}`} className="grid grid-cols-[1fr_auto] gap-3 border-b border-pine-50 px-4 py-3 last:border-0 sm:grid-cols-[1.2fr_1fr_1fr_1.5fr]"><div><p className="text-sm font-semibold text-pine-950">{log.action}</p><p className="mt-1 text-xs text-ink/60">{log.details?.unit || log.details?.name || log.details?.status || (log.details?.delayMin !== undefined ? `Delay: ${log.details.delayMin} min` : "")}</p></div><div className="hidden text-sm sm:block">{log.actorName}<p className="text-xs text-ink/50">{log.actorRole}</p></div><div className="hidden text-sm sm:block">{log.targetType}: {log.targetId}</div><time className="text-right text-xs text-ink/60 sm:text-left">{new Date(log.createdAt).toLocaleString("en-GB",{timeZone:"Asia/Dhaka",dateStyle:"medium",timeStyle:"short"})}</time></div>)}{!logs.length&&<p className="p-6 text-sm text-ink/60">{tr("No matching audit events.")}</p>}</div>}
    <p className="mt-4 text-xs text-ink/50">{tr("Showing up to 200 newest events. Audit records are append-only through this interface.")}</p>
  </main></>;
}

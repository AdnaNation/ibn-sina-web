import Link from "next/link";
import { HeartPulse, LogOut, Languages } from "lucide-react";
import { logoutAction } from "@/app/admin/actions";
import { setLang } from "@/app/actions";
import { hasPermission, isBranchAdmin } from "@/lib/auth";
import { getAdmin } from "@/lib/adminT";

export default async function AdminNav({ p, current }) {
  const { tr, lang } = await getAdmin();
  const owner = p.role === "owner";
  const admin = owner || isBranchAdmin(p);
  const links = [
    owner && ["Overview", "/admin"],
    (admin || hasPermission(p, "queue.manage")) && ["Queue", "/admin/queue"],
    (admin || hasPermission(p, "appointments.view")) && ["Appointments", "/admin/appointments"],
    hasPermission(p, "reports.view") && ["Reports", "/admin/reports"],
    (hasPermission(p, "reports.view") || hasPermission(p, "reports.upload")) && ["Medical reports", "/admin/medical-reports"],
    (admin || hasPermission(p, "schedules.manage")) && ["Schedules", "/admin/schedules"],
    (admin || hasPermission(p, "doctors.view")) && ["Doctors", "/admin/doctors"],
    owner && ["Branches", "/admin/branches"],
    admin && ["Users & permissions", "/admin/staff"],
    owner && ["Audit log", "/admin/audit"],
  ].filter(Boolean);
  const roleLabel = owner ? "Main Admin" : isBranchAdmin(p) ? "Branch Admin" : "Staff";

  return (
    <header className="sticky top-0 z-40 border-b border-pine-100 bg-white/95 backdrop-blur">
      <div className="flex w-full items-center justify-between gap-3 px-4 py-2.5 sm:px-6 lg:px-8">
        <Link href={owner ? "/admin" : "/admin/queue"} className="flex min-w-0 items-center gap-2.5">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-pine-900 text-white"><HeartPulse size={19} /></span>
          <span className="min-w-0 leading-tight">
            <span className="block truncate text-sm font-bold text-pine-950">{p.name}</span>
            <span className="block truncate text-[11px] text-ink/60">{tr(roleLabel)}{p.scope ? ` · ${p.scope}` : ""}</span>
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5 rounded-full bg-pine-50 p-0.5" role="group" aria-label="Language">
            <Languages size={14} className="ml-2 text-pine-700" aria-hidden="true" />
            {[["en", "EN"], ["bn", "বাংলা"]].map(([code, label]) => (
              <form key={code} action={setLang}>
                <input type="hidden" name="lang" value={code} />
                <button aria-pressed={lang === code} className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${lang === code ? "bg-pine-900 text-white" : "text-pine-800 hover:bg-white"}`}>{label}</button>
              </form>
            ))}
          </div>
          <form action={logoutAction}>
            <button className="inline-flex items-center gap-1.5 rounded-full border border-pine-100 px-3 py-1.5 text-xs font-semibold text-ink/70 hover:bg-pine-50">
              <LogOut size={14} /> <span className="hidden sm:inline">{tr("Sign out")}</span>
            </button>
          </form>
        </div>
      </div>
      <nav aria-label="Admin" className="border-t border-pine-50">
        <ul className="flex w-full gap-1 overflow-x-auto px-4 py-1.5 text-sm font-semibold [scrollbar-width:none] sm:px-6 lg:px-8">
          {links.map(([label, href]) => (
            <li key={href} className="shrink-0">
              <Link href={href} prefetch={null} aria-current={current === href ? "page" : undefined}
                className={`block rounded-lg px-3.5 py-2 ${current === href ? "bg-pine-900 text-white" : "text-pine-800 hover:bg-pine-50"}`}>
                {tr(label)}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}

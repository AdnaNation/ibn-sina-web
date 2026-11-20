import Link from "next/link";
import { HeartPulse, LogOut, Languages } from "lucide-react";
import { logoutAction } from "@/app/admin/actions";
import { setLang } from "@/app/actions";
import { hasPermission, isBranchAdmin } from "@/lib/auth";
import { getAdmin } from "@/lib/adminT";

export default async function AdminNav({ p, current }) {
  const { tr, lang } = await getAdmin();
  const owner = p.role === "owner";
  const branchAdmin = isBranchAdmin(p);
  const links = [
    owner && ["Overview", "/admin"],
    owner && ["Branches", "/admin/branches"],
    owner && ["Users & permissions", "/admin/staff"],
    owner && ["Audit log", "/admin/audit"],
    branchAdmin && hasPermission(p, "doctors.view") && ["Doctors", "/admin/doctors"],
    branchAdmin && hasPermission(p, "schedules.manage") && ["Schedules", "/admin/schedules"],
    branchAdmin && ["Users & permissions", "/admin/staff"],
    !owner && !branchAdmin && hasPermission(p, "queue.manage") && ["Queue", "/admin/queue"],
    !owner && !branchAdmin && hasPermission(p, "appointments.view") && ["Appointments", "/admin/appointments"],
    !owner && hasPermission(p, "reports.view") && ["Reports", "/admin/reports"],
    !owner && hasPermission(p, "reports.upload") && ["Medical reports", "/admin/medical-reports"],
    !owner && !branchAdmin && hasPermission(p, "schedules.manage") && ["Schedules", "/admin/schedules"],
    !owner && !branchAdmin && hasPermission(p, "doctors.view") && ["Doctors", "/admin/doctors"],
  ].filter(Boolean);
  const roleLabel = owner ? "Main Admin" : branchAdmin ? "Branch Admin" : p.role === "doctor" ? "Doctor" : "Staff";
  const home = owner ? "/admin" : branchAdmin ? "/admin/schedules" : hasPermission(p, "queue.manage") ? "/admin/queue" : hasPermission(p, "appointments.view") ? "/admin/appointments" : hasPermission(p, "schedules.manage") ? "/admin/schedules" : "/admin";

  return (
    <header className="premium-admin-nav sticky top-0 z-40 border-b">
      <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link href={home} prefetch className="flex min-w-0 items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-pine-900 text-white"><HeartPulse size={19} strokeWidth={1.8}/></span>
          <span className="min-w-0 leading-tight">
            <span className="block truncate text-sm font-medium text-[#202421]">{p.name}</span>
            <span className="mt-0.5 block truncate text-xs text-[#68716b]">{tr(roleLabel)}{p.scope ? ` · ${p.scope}` : ""}</span>
          </span>
        </Link>
        <div className="flex shrink-0 items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg border border-black/10 bg-[#f4f3ef] p-1" role="group" aria-label="Language">
            <Languages size={14} className="ml-1 text-[#68716b]" aria-hidden="true"/>
            {["en", "bn"].map(code => {
              const label = code === "en" ? "EN" : "বাংলা";
              return <form key={code} action={setLang}><input type="hidden" name="lang" value={code}/><button aria-pressed={lang === code} className={`rounded-md px-2 py-1 text-xs font-medium ${lang === code ? "bg-white text-[#202421] shadow-sm" : "text-[#68716b] hover:text-[#202421]"}`}>{label}</button></form>;
            })}
          </div>
          <form action={logoutAction}><button className="inline-flex items-center gap-2 rounded-lg border border-black/10 bg-white px-3 py-2 text-xs font-medium text-[#4c5650] hover:bg-[#f4f3ef]"><LogOut size={14}/><span className="hidden sm:inline">{tr("Sign out")}</span></button></form>
        </div>
      </div>
      <nav aria-label="Admin" className="border-t border-black/[.07]">
        <ul className="mx-auto flex w-full max-w-[1600px] gap-1 overflow-x-auto px-4 py-2 text-[13px] sm:px-6 lg:px-8">
          {links.map(([label, href]) => <li key={href} className="shrink-0"><Link href={href} prefetch aria-current={current === href ? "page" : undefined} className={`block rounded-md px-3 py-2 transition-colors ${current === href ? "bg-[#e9e8e1] font-medium text-[#202421]" : "text-[#626c65] hover:bg-[#f4f3ef] hover:text-[#202421]"}`}>{tr(label)}</Link></li>)}
        </ul>
      </nav>
    </header>
  );
}

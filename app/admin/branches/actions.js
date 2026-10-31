"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { createBranch, setBranchActive, writeAudit } from "@/lib/management";
import { setStaffActive, listStaff } from "@/lib/staff";
const val = (fd, key) => String(fd.get(key) || "").trim();
const refresh = () => { ["/admin", "/admin/branches", "/admin/staff", "/units", "/doctors"].forEach((path) => revalidatePath(path)); };
export async function createBranchAction(fd) {
  const p = await getSession(); if (p?.role !== "owner") redirect("/admin/login");
  const error = await createBranch({ name: val(fd,"name"), area: val(fd,"area"), city: val(fd,"city"), type: val(fd,"type"), hotline: val(fd,"hotline"), address: val(fd,"address") }, p);
  refresh(); redirect(error ? `/admin/branches?err=${encodeURIComponent(error)}` : "/admin/branches?ok=branch-created");
}
export async function toggleBranchAction(fd) {
  const p = await getSession(); if (p?.role !== "owner") redirect("/admin/login");
  const unit = val(fd,"unit"), active = val(fd,"active") === "true";
  const error = await setBranchActive(unit, active, p); refresh();
  redirect(error ? `/admin/branches?err=${encodeURIComponent(error)}` : `/admin/branches?ok=${active ? "branch-activated" : "branch-deactivated"}`);
}
export async function toggleAccountAction(fd) {
  const p = await getSession(); if (!p || !(p.role === "owner" || p.role === "branch_admin" || p.role === "branch")) redirect("/admin/login");
  const username = val(fd,"username"), active = val(fd,"active") === "true";
  const target = (await listStaff(p.role === "owner" ? {} : { unit: p.unit })).find((s) => s.username === username);
  if (!target || target.role === "owner" || ((p.role !== "owner") && (["branch_admin","branch"].includes(target.role) || target.unit !== p.unit))) redirect("/admin/branches?err=not-allowed");
  const error = await setStaffActive(username, active, p.role === "owner" ? {} : { unit: p.unit });
  if (!error) await writeAudit({ actor: p, action: active ? "account.activated" : "account.deactivated", targetType: "staff", targetId: username, details: { targetName: target.name, targetRole: target.role, unit: target.unit } });
  refresh(); redirect(error ? `/admin/branches?err=${encodeURIComponent(error)}` : `/admin/branches?ok=${active ? "account-activated" : "account-deactivated"}`);
}

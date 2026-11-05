"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSession, isBranchAdmin } from "@/lib/auth";
import { getDoctor, getUnits } from "@/lib/data";
import { createStaff, listStaff, setStaffActive } from "@/lib/staff";
import { STAFF_PERMISSIONS } from "@/lib/permissions";
import { writeAudit } from "@/lib/management";

const g = (fd, k) => String(fd.get(k) || "").trim();
const validUsername = (u) => /^[a-z0-9._-]{3,20}$/.test(u) && u !== "admin";

export async function addStaff(fd) {
  const p = await getSession();
  if (!p || !(p.role === "owner" || isBranchAdmin(p))) redirect("/admin/login");
  const name = g(fd, "name").slice(0, 80), username = g(fd, "username").toLowerCase(), password = String(fd.get("password") || "");
  let role = g(fd, "role") || "staff";
  let unit = g(fd, "unit");
  let doctorSlug = "", doctorName = "";
  const selected = fd.getAll("permissions").map(String);
  const allowed = new Set(STAFF_PERMISSIONS.map((x) => x.key));
  const permissions = [...new Set(selected)].filter((x) => allowed.has(x));
  let err = "";
  if (name.length < 2) err = "Enter a staff member’s name (2–80 characters).";
  else if (!validUsername(username)) err = "Username: 3 to 20 lowercase letters, numbers, dots, underscores or hyphens.";
  else if (password.length < 8 || password.length > 128) err = "Use a password between 8 and 128 characters.";
  else if (p.role !== "owner" && role !== "staff") err = "Branch admins can create staff accounts only.";
  else if (p.role !== "owner") unit = p.unit;
  else if (!["branch_admin", "staff", "doctor"].includes(role)) err = "Choose a valid account role.";

  if (!err && !unit) err = "Choose a branch.";
  if (!err) {
    const units = await getUnits();
    if (!units.some((u) => `${u.name}, ${u.area}` === unit && u.active !== false)) err = "Choose an active branch.";
  }
  if (!err && role === "doctor") {
    doctorSlug = g(fd, "doctorSlug");
    const d = await getDoctor(doctorSlug);
    if (!d || d.unit !== unit) err = "Choose a doctor from the selected branch.";
    else doctorName = d.name;
  }
  if (!err) {
    const finalPermissions = role === "branch_admin" ? STAFF_PERMISSIONS.map((x) => x.key) : permissions;
    err = await createStaff({ name, username, password, role, unit, doctorSlug, doctorName, permissions: finalPermissions });
    if (!err) await writeAudit({ actor: p, action: "account.created", targetType: "staff", targetId: username, details: { targetName: name, targetRole: role, unit, permissions: finalPermissions } });
  }
  revalidatePath("/admin/staff");
  redirect(err ? `/admin/staff?err=${encodeURIComponent(err)}` : `/admin/staff?ok=${encodeURIComponent(username)}`);
}

export async function removeStaff(fd) {
  const p = await getSession();
  if (!p || !(p.role === "owner" || isBranchAdmin(p))) return;
  const username = g(fd, "username");
  if (username && username === p.u) return;
  const target = (await listStaff(p.role === "owner" ? {} : { unit: p.unit })).find((x) => x.username === username);
  if (!target || target.role === "owner" || (isBranchAdmin(p) && ["branch", "branch_admin"].includes(target.role))) return;
  const error = await setStaffActive(username, false, p.role === "owner" ? {} : { unit: p.unit });
  if (!error) await writeAudit({ actor: p, action: "account.deactivated", targetType: "staff", targetId: username, details: { targetName: target.name, targetRole: target.role, unit: target.unit } });
  revalidatePath("/admin/staff");
}

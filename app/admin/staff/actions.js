"use server";
import { revalidatePath } from "next/cache";
import { getSession, isBranchAdmin } from "@/lib/auth";
import { getUnits, getDoctor } from "@/lib/data";
import { createStaff, listStaff, setStaffActive } from "@/lib/staff";
import { STAFF_ASSIGNABLE_PERMISSIONS } from "@/lib/permissions";
import { writeAudit } from "@/lib/management";

const g = (fd, k) => String(fd.get(k) || "").trim();
const validUsername = (u) => /^[a-z0-9._-]{3,20}$/.test(u) && u !== "admin";

export async function addStaff(fd) {
  const p = await getSession();
  if (!p || !(p.role === "owner" || isBranchAdmin(p))) return { error: "Your session expired. Please sign in again." };
  const name = g(fd, "name").slice(0, 80), username = g(fd, "username").toLowerCase(), password = String(fd.get("password") || "");
  let role = g(fd, "role") || "staff";
  let unit = g(fd, "unit");
  const doctorSlug = g(fd, "doctorSlug");
  let doctor = null;
  const selected = fd.getAll("permissions").map(String);
  const allowed = new Set(STAFF_ASSIGNABLE_PERMISSIONS.map((x) => x.key));
  const permissions = [...new Set(selected)].filter((x) => allowed.has(x));
  let err = "";
  if (name.length < 2) err = "Enter a staff member’s name (2–80 characters).";
  else if (!validUsername(username)) err = "Username: 3 to 20 lowercase letters, numbers, dots, underscores or hyphens.";
  else if (password.length < 8 || password.length > 128) err = "Use a password between 8 and 128 characters.";
  else if (p.role === "owner" && role !== "branch_admin") err = "Main Admin can create Branch Admin accounts only.";
  else if (isBranchAdmin(p) && role !== "staff") err = "Branch Admins can create staff accounts only.";
  else if (isBranchAdmin(p)) unit = p.unit;
  else if (p.role !== "owner") err = "Not allowed to create this account type.";

  if (!err && !unit) err = "Choose a branch.";
  if (!err) {
    const units = await getUnits();
    if (!units.some((u) => `${u.name}, ${u.area}` === unit && u.active !== false)) err = "Choose an active branch.";
  }
  if (!err && role === "staff") {
    doctor = await getDoctor(doctorSlug);
    if (!doctor || doctor.unit !== unit) err = "Choose a valid doctor from your own branch.";
  }
  if (!err) {
    const finalPermissions = role === "branch_admin" ? [] : ["queue.manage"];
    err = await createStaff({ name, username, password, role, unit, doctorSlug: doctor?.slug || "", doctorName: doctor?.name || "", permissions: finalPermissions });
    if (!err) await writeAudit({ actor: p, action: "account.created", targetType: "staff", targetId: username, details: { targetName: name, targetRole: role, unit, doctorSlug: doctor?.slug || "", doctorName: doctor?.name || "", permissions: finalPermissions } });
  }
  if (err) return { error: err };
  revalidatePath("/admin/staff");
  revalidatePath("/admin/branches");
  return { success: true, value: username };
}

export async function removeStaff(fd) {
  const p = await getSession();
  if (!p || !(p.role === "owner" || isBranchAdmin(p))) return { error: "Your session expired. Please sign in again." };
  const username = g(fd, "username");
  if (username && username === p.u) return { error: "You cannot deactivate your own account." };
  const target = (await listStaff(p.role === "owner" ? {} : { unit: p.unit })).find((x) => x.username === username);
  if (!target || target.role === "owner" || (p.role === "owner" && !["branch", "branch_admin"].includes(target.role)) || (isBranchAdmin(p) && ["branch", "branch_admin"].includes(target.role))) return { error: "This account cannot be changed from your access level." };
  const error = await setStaffActive(username, false, p.role === "owner" ? {} : { unit: p.unit });
  if (!error) await writeAudit({ actor: p, action: "account.deactivated", targetType: "staff", targetId: username, details: { targetName: target.name, targetRole: target.role, unit: target.unit } });
  if (error) return { error };
  revalidatePath("/admin/staff");
  revalidatePath("/admin/branches");
  return { success: true };
}

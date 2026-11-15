"use server";
import { revalidatePath } from "next/cache";
import { getSession, isBranchAdmin } from "@/lib/auth";
import { getUnits, getDoctor } from "@/lib/data";
import { createStaff, listStaff, setStaffActive, setStaffAccess } from "@/lib/staff";
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
  const doctorSlugs = [...new Set(fd.getAll("doctorSlugs").map((value) => String(value).trim()).filter(Boolean))];
  const allDoctors = g(fd, "allDoctors") === "yes";
  let doctors = [];
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
    if (!allDoctors && !doctorSlugs.length) err = "Select at least one doctor or choose all doctors in this branch.";
    if (!err && !allDoctors) {
      doctors = await Promise.all(doctorSlugs.map((slug) => getDoctor(slug)));
      if (doctors.some((doctor) => !doctor || doctor.unit !== unit)) err = "Choose doctors from your own branch only.";
    }
  }
  if (!err) {
    const finalPermissions = role === "branch_admin" ? [] : ["queue.manage"];
    const assignedSlugs = allDoctors ? [] : doctors.map((doctor) => doctor.slug);
    err = await createStaff({ name, username, password, role, unit, doctorSlugs: assignedSlugs, allDoctors, doctorSlug: assignedSlugs[0] || "", doctorName: doctors.map((doctor) => doctor.name).join(", "), permissions: finalPermissions });
    if (!err) await writeAudit({ actor: p, action: "account.created", targetType: "staff", targetId: username, details: { targetName: name, targetRole: role, unit, doctorSlugs: assignedSlugs, allDoctors, permissions: finalPermissions } });
  }
  if (err) return { error: err };
  revalidatePath("/admin/staff");
  revalidatePath("/admin/branches");
  return { success: true, value: username };
}

export async function updateStaffAccess(fd) {
  const p = await getSession();
  if (!p || !isBranchAdmin(p)) return { error: "Only a Branch Admin can edit staff access." };
  const username = g(fd, "username");
  const target = (await listStaff({ username, unit: p.unit, role: "staff" }))[0];
  const allDoctors = g(fd, "allDoctors") === "yes";
  const doctorSlugs = [...new Set(fd.getAll("doctorSlugs").map((value) => String(value).trim()).filter(Boolean))];
  const doctors = allDoctors ? [] : await Promise.all(doctorSlugs.map((slug) => getDoctor(slug)));
  if (!target || (!allDoctors && (!doctors.length || doctors.some((doctor) => !doctor || doctor.unit !== p.unit)))) return { error: "Choose one or more doctors from your own branch, or select all doctors." };

  const allowed = new Set(STAFF_ASSIGNABLE_PERMISSIONS.map((permission) => permission.key));
  const permissions = [...new Set(fd.getAll("permissions").map((value) => String(value)).filter((value) => allowed.has(value)))];
  const error = await setStaffAccess(username, {
    unit: p.unit,
    doctorSlugs: doctors.map((doctor) => doctor.slug),
    allDoctors,
    doctorSlug: doctors[0]?.slug || "",
    doctorName: doctors.map((doctor) => doctor.name).join(", "),
    permissions,
  });
  if (error) return { error };
  await writeAudit({
    actor: p,
    action: "staff.access_updated",
    targetType: "staff",
    targetId: username,
    details: {
      unit: p.unit,
      doctorSlugs: doctors.map((doctor) => doctor.slug),
      allDoctors,
      previousDoctorSlugs: target.doctorSlugs || (target.doctorSlug ? [target.doctorSlug] : []),
      previousPermissions: target.permissions || [],
      permissions,
    },
  });
  ["/admin/staff", "/admin/queue", "/admin/appointments", "/admin/reports", "/admin/medical-reports", "/admin/doctors", "/admin/schedules"].forEach((path) => revalidatePath(path));
  return { success: true };
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

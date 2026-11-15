const BRANCH_ADMIN_PERMISSIONS = new Set(["appointments.view","reports.view","reports.upload","billing.view","billing.manage","doctors.view","doctors.manage","schedules.manage"]);
const staffDoctorSlugs = (user) => Array.isArray(user?.doctorSlugs) ? user.doctorSlugs.filter((slug) => typeof slug === "string" && slug) : user?.doctorSlug ? [user.doctorSlug] : [];
export function hasPermission(user, permission) {
  if (!user || typeof permission !== "string" || user.role === "owner") return false;
  if (user.role === "branch_admin" || user.role === "branch") return BRANCH_ADMIN_PERMISSIONS.has(permission);
  if (user.role === "doctor") return Array.isArray(user.permissions) ? user.permissions.includes(permission) && ["queue.manage","appointments.view","patients.view"].includes(permission) : permission === "queue.manage" || permission === "appointments.view";
  if (user.role === "staff") {
    const allowed = new Set(["appointments.view","appointments.manage","patients.view","queue.manage","schedules.manage","doctors.view","reports.view","reports.upload","billing.view","billing.manage"]);
    return allowed.has(permission) && Boolean(user.unit) && (user.allDoctors === true || staffDoctorSlugs(user).length > 0) && Array.isArray(user.permissions) && user.permissions.includes(permission);
  }
  return false;
}
export function isBranchAdmin(user) { return user?.role === "branch_admin" || user?.role === "branch"; }
export function getLoginDestination(user) {
  if (!user) return "/admin/login";
  if (user.role === "owner") return "/admin";
  if (isBranchAdmin(user)) return "/admin/schedules";
  if (hasPermission(user, "queue.manage")) return "/admin/queue";
  if (hasPermission(user, "appointments.view")) return "/admin/appointments";
  if (hasPermission(user, "schedules.manage")) return "/admin/schedules";
  return "/admin";
}
export function canManageBranchStaff(user,target) {
  if (!user || !target || target.role === "owner") return false;
  if (user.role === "owner") return ["branch_admin","branch"].includes(target.role);
  return isBranchAdmin(user) && target.unit === user.unit && !["owner","branch_admin","branch"].includes(target.role);
}
export function scopeOf(user) {
  if (user?.role === "owner") return {};
  if (user?.role === "doctor") return { doctorSlug: user.doctorSlug || "__NO_DOCTOR_SCOPE__" };
  if (user?.role === "staff") {
    if (user.allDoctors === true && user.unit) return { unit: user.unit };
    const slugs = staffDoctorSlugs(user);
    return { doctorSlug: slugs.length > 1 ? { $in: slugs } : slugs[0] || "__NO_DOCTOR_SCOPE__", unit: user.unit || "__NO_BRANCH_SCOPE__" };
  }
  if (["branch","branch_admin"].includes(user?.role)) return { unit: user.unit || "__NO_BRANCH_SCOPE__" };
  return { unit: "__NO_BRANCH_SCOPE__" };
}
export function scopeFilter(user) { return scopeOf(user); }
export function reportScope(user) { return scopeOf(user); }

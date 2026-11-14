const BRANCH_ADMIN_PERMISSIONS = new Set([
  "appointments.view",
  "reports.view",
  "reports.upload",
  "billing.view",
  "billing.manage",
  "doctors.view",
  "doctors.manage",
  "schedules.manage",
]);

export function hasPermission(user, permission) {
  if (!user || typeof permission !== "string") return false;
  if (user.role === "owner") return false;
  if (user.role === "branch_admin" || user.role === "branch") {
    return BRANCH_ADMIN_PERMISSIONS.has(permission);
  }
  if (user.role === "doctor") {
    return Array.isArray(user.permissions)
      ? user.permissions.includes(permission) && ["queue.manage", "appointments.view", "patients.view"].includes(permission)
      : permission === "queue.manage" || permission === "appointments.view";
  }
  if (user.role === "staff") {
    return permission === "queue.manage" && Boolean(user.doctorSlug) &&
      Array.isArray(user.permissions) && user.permissions.includes("queue.manage");
  }
  return false;
}

export function isBranchAdmin(user) {
  return user?.role === "branch_admin" || user?.role === "branch";
}

export function canManageBranchStaff(user, target) {
  if (!user || !target || target.role === "owner") return false;
  if (user.role === "owner") return ["branch_admin", "branch"].includes(target.role);
  return isBranchAdmin(user) && target.unit === user.unit &&
    !["owner", "branch_admin", "branch"].includes(target.role);
}

export function scopeOf(user) {
  if (user?.role === "owner") return {};
  if (user?.role === "doctor" || user?.role === "staff") {
    return { doctorSlug: user.doctorSlug || "__NO_DOCTOR_SCOPE__" };
  }
  if (["branch", "branch_admin"].includes(user?.role)) {
    return { unit: user.unit || "__NO_BRANCH_SCOPE__" };
  }
  return { unit: "__NO_BRANCH_SCOPE__" };
}

export function scopeFilter(user) {
  return scopeOf(user);
}

export function reportScope(user) {
  return scopeOf(user);
}

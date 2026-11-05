export function hasPermission(user, permission) {
  if (!user) return false;
  if (user.role === "owner" || user.role === "branch_admin" || user.role === "branch") return true;
  if (user.role === "doctor") return Array.isArray(user.permissions)
    ? user.permissions.includes(permission)
    : permission === "queue.manage" || permission === "appointments.view";
  return Array.isArray(user.permissions) && user.permissions.includes(permission);
}

export function isBranchAdmin(user) {
  return user?.role === "branch_admin" || user?.role === "branch";
}

export function canManageBranchStaff(user, target) {
  if (!user) return false;
  if (user.role !== "owner" && !isBranchAdmin(user)) return false;
  if (user.role === "owner") return true;
  return isBranchAdmin(user) && target?.unit === user.unit &&
    target?.role !== "owner" && !isBranchAdmin(target);
}

export function scopeOf(user) {
  if (user?.role === "owner") return {};
  if (user?.role === "doctor") {
    return { doctorSlug: user.doctorSlug || "__NO_DOCTOR_SCOPE__" };
  }
  if (["branch", "branch_admin", "staff"].includes(user?.role)) {
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

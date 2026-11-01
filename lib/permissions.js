export const STAFF_PERMISSIONS = [
  { key: "appointments.view", label: "View appointments", group: "Patients & appointments" },
  { key: "appointments.manage", label: "Create and update appointments", group: "Patients & appointments" },
  { key: "patients.view", label: "View patient details", group: "Patients & appointments" },
  { key: "queue.manage", label: "Operate the live patient queue", group: "Clinic operations" },
  { key: "schedules.manage", label: "Publish and manage doctor schedules", group: "Clinic operations" },
  { key: "doctors.view", label: "View branch doctors", group: "Clinic operations" },
  { key: "doctors.manage", label: "Add and edit branch doctors", group: "Clinic operations" },
  { key: "reports.view", label: "View branch reports", group: "Reports & finance" },
  { key: "billing.view", label: "View payments and billing", group: "Reports & finance" },
  { key: "billing.manage", label: "Manage payments and billing", group: "Reports & finance" },
];

export const DEFAULT_BRANCH_ADMIN_PERMISSIONS = STAFF_PERMISSIONS.map((p) => p.key);

export function hasPermission(user, permission) {
  if (!user) return false;
  if (user.role === "owner" || user.role === "branch_admin" || user.role === "branch") return true;
  if (user.role === "doctor") return Array.isArray(user.permissions) && user.permissions.length
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
  return isBranchAdmin(user) && target?.unit === user.unit && target?.role !== "owner" && !isBranchAdmin(target);
}

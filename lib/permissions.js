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

export { hasPermission, isBranchAdmin, canManageBranchStaff } from "./access.mjs";

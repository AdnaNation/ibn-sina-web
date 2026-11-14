import test from "node:test";
import assert from "node:assert/strict";
import {
  canManageBranchStaff,
  hasPermission,
  isBranchAdmin,
  reportScope,
  scopeFilter,
  scopeOf,
} from "../lib/access.mjs";

test("Main Admin has oversight rather than clinic-operation permissions", () => {
  assert.equal(hasPermission({ role: "owner" }, "billing.manage"), false);
  assert.equal(hasPermission({ role: "owner" }, "queue.manage"), false);
  assert.equal(hasPermission({ role: "owner" }, "doctors.manage"), false);
  assert.equal(hasPermission({ role: "owner" }, "schedules.manage"), false);
  assert.equal(hasPermission({ role: "branch_admin" }, "reports.view"), true);
  assert.equal(hasPermission({ role: "branch_admin" }, "doctors.manage"), true);
  assert.equal(hasPermission({ role: "branch_admin" }, "schedules.manage"), true);
  assert.equal(hasPermission({ role: "branch_admin" }, "queue.manage"), false);
  assert.equal(hasPermission({ role: "branch_admin" }, "appointments.manage"), false);
  assert.equal(hasPermission({ role: "branch_admin" }, "patients.view"), false);
  assert.equal(hasPermission({ role: "branch" }, "patients.view"), false);
  assert.equal(hasPermission(null, "queue.manage"), false);
});

test("staff and doctor permissions are least-privilege and explicit", () => {
  assert.equal(hasPermission({ role: "staff", doctorSlug: "dr-a", permissions: ["queue.manage"] }, "queue.manage"), true);
  assert.equal(hasPermission({ role: "staff", doctorSlug: "dr-a", permissions: ["queue.manage", "appointments.view", "patients.view"] }, "appointments.view"), false);
  assert.equal(hasPermission({ role: "staff", doctorSlug: "dr-a", permissions: ["queue.manage", "appointments.view", "patients.view"] }, "patients.view"), false);
  assert.equal(hasPermission({ role: "staff", permissions: ["queue.manage"] }, "queue.manage"), false);
  assert.equal(hasPermission({ role: "staff", permissions: ["doctors.manage", "schedules.manage"] }, "doctors.manage"), false);
  assert.equal(hasPermission({ role: "staff", permissions: ["doctors.manage", "schedules.manage"] }, "schedules.manage"), false);
  assert.equal(hasPermission({ role: "doctor" }, "queue.manage"), true);
  assert.equal(hasPermission({ role: "doctor" }, "patients.view"), false);
  assert.equal(hasPermission({ role: "doctor", permissions: [] }, "queue.manage"), false);
});

test("branch admins can manage only non-admin staff in their own exact branch", () => {
  const admin = { role: "branch_admin", unit: "Feni, Feni" };
  assert.equal(isBranchAdmin(admin), true);
  assert.equal(isBranchAdmin({ role: "branch" }), true);
  assert.equal(canManageBranchStaff({ role: "owner" }, { role: "branch_admin", unit: "Other" }), true);
  assert.equal(canManageBranchStaff({ role: "owner" }, { role: "staff", unit: "Other" }), false);
  assert.equal(canManageBranchStaff(admin, { role: "staff", unit: "Feni, Feni" }), true);
  assert.equal(canManageBranchStaff(admin, { role: "staff", unit: "Dhaka, Dhaka" }), false);
  assert.equal(canManageBranchStaff(admin, { role: "branch_admin", unit: "Feni, Feni" }), false);
  assert.equal(canManageBranchStaff(admin, { role: "owner", unit: "Feni, Feni" }), false);
  assert.equal(canManageBranchStaff({ role: "staff", unit: "Feni, Feni" }, { role: "staff", unit: "Feni, Feni" }), false);
});

test("branch and doctor data scopes fail closed when scope is missing", () => {
  assert.deepEqual(scopeOf({ role: "owner" }), {});
  assert.deepEqual(scopeFilter({ role: "branch_admin", unit: "Feni, Feni" }), { unit: "Feni, Feni" });
  assert.deepEqual(reportScope({ role: "staff", unit: "Feni, Feni", doctorSlug: "dr-a" }), { doctorSlug: "dr-a" });
  assert.deepEqual(scopeOf({ role: "branch_admin" }), { unit: "__NO_BRANCH_SCOPE__" });
  assert.deepEqual(scopeFilter({ role: "staff" }), { doctorSlug: "__NO_DOCTOR_SCOPE__" });
  assert.deepEqual(scopeFilter({ role: "staff", unit: "Feni, Feni", doctorSlug: "dr-a" }), { doctorSlug: "dr-a" });
  assert.deepEqual(reportScope({ role: "doctor" }), { doctorSlug: "__NO_DOCTOR_SCOPE__" });
  assert.deepEqual(scopeOf({ role: "unknown" }), { unit: "__NO_BRANCH_SCOPE__" });
});

# Demonstration acceptance checklist

Use this checklist before a stakeholder walkthrough. All test records must be fictional.

## Public experience
- [ ] Homepage clearly identifies the site as an independent prototype.
- [ ] Bengali and English language switching works.
- [ ] Doctor directory and a doctor profile load.
- [ ] Branch and service pages load.
- [ ] Appointment page shows only published, available dates.
- [ ] Public booking works only against the isolated fictional-data demo database.
- [ ] Tracking page shows the expected ticket without phone number, full name, or private note.
- [ ] Live queue board displays current demo session states.
- [ ] Mobile navigation and primary actions are usable without horizontal overflow.

## Main Admin
- [ ] Main Admin can view organization-level overview.
- [ ] Main Admin can create or deactivate branches.
- [ ] Main Admin can create/manage Branch Admin accounts.
- [ ] Main Admin can inspect the audit trail.
- [ ] Main Admin cannot access branch queue operations.

## Branch Admin
- [ ] Branch Admin sees only the assigned branch.
- [ ] Branch Admin can manage that branch's doctor directory and schedules.
- [ ] Branch Admin can create, deactivate, and update staff access within that branch.
- [ ] Branch Admin cannot create another Branch Admin.
- [ ] Branch Admin cannot operate the live queue.
- [ ] Branch Admin appointment visibility does not expose patient identity without patients.view.

## Staff
- [ ] Queue staff can open only assigned doctor queues.
- [ ] Staff without patients.view cannot see phone numbers or private notes.
- [ ] Appointment staff can see appointment rows only when appointments.view is granted.
- [ ] Staff without appointments.view cannot access appointment management.
- [ ] Schedule management is limited to assigned doctors and the staff permission.
- [ ] Permission changes take effect on the next server request.

## Reports and private files
- [ ] Operational reports show aggregate counts only.
- [ ] Private reports are stored without public file URLs.
- [ ] Invalid report IDs/passcodes are rejected and rate-limited.
- [ ] Report access is recorded.
- [ ] Revoked report access is no longer available.
- [ ] Synthetic files only; no real patient records.

## Handover
- [ ] Production deployment commit and status are verified.
- [ ] All public content and doctor/branch information are clearly marked unverified until approved.
- [ ] Demo database is isolated and contains fictional patient/staff data only.
- [ ] No real credentials, patient records, tracking references, or report passcodes appear in screenshots.
- [ ] Institutional authorization and next-step discovery meeting are requested, not assumed.

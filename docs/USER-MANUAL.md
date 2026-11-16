# User Manual — Independent Hospital Website & Queue Prototype

> **Important:** This is an independent demonstration prototype. It is not the official Ibn Sina Trust website or booking service, and it has not been commissioned, approved, or endorsed by the Trust. Use fictional information only. Do not enter real patient details, upload real medical reports, or rely on this prototype for clinical or emergency care.

This guide explains the current user-facing workflows and the access available to each account type. Some menu items appear only when the signed-in account has the required permission.

## 1. Public website

### Browse doctors and services
1. Open the homepage.
2. Use the **বাংলা / EN** language switch to change the display language.
3. Open **Doctors** to browse the directory and select a profile for details.
4. Open **Locations / Branches** to view the available branch information.
5. Browse **Services** for the published service descriptions.

The doctor and branch directory currently contains starter/demo content. It is not a verified hospital roster or a source of confirmed clinic hours.

### Request an appointment
1. Open **Appointment**.
2. Choose a doctor and a date with a published session.
3. Enter fictional demonstration details in the patient form.
4. Submit the request and keep the returned tracking reference private.

A date without a published session is shown as **Schedule not published** and is not bookable. A successful demo booking creates a record in the MongoDB database configured for the deployment. It does not book an appointment with a real hospital.

### Track an appointment
1. Open **Track**.
2. Enter the tracking reference received after the demo booking.
3. Review the appointment status and queue information shown for that reference.

Treat the tracking reference like a password: anyone who has it may be able to view the associated tracking information. Do not post it publicly or include it in screenshots.

### View the live queue
Open **Live** to see the public queue board. It displays queue/session information intended for public viewing; it is not a clinical assessment or a guaranteed waiting-time estimate. Queue estimates can change as staff update the queue.

## 2. Account types and access

Access is restricted by both role and branch/doctor assignment. A hidden menu item is not the security boundary; the server checks permissions when protected pages and actions are requested.

### Main Admin
Main Admin is the organization-wide oversight account.

Main Admin can:
- View the organization overview and branch-level operational summaries.
- Create, activate, and deactivate branches.
- Create and manage Branch Admin accounts.
- Review the organization audit trail.

Main Admin does **not** perform branch-level doctor, schedule, appointment, or live queue operations. Those tasks belong to the relevant Branch Admin or authorized staff accounts.

### Branch Admin
A Branch Admin is assigned to one branch.

Branch Admin can:
- Manage doctors and schedules within the assigned branch.
- View appointments and branch reports.
- Create staff accounts for the assigned branch.
- Choose the permissions and doctor assignment for each staff account.
- Activate or deactivate staff accounts in that branch.

Branch Admin cannot create another Branch Admin, manage another branch, or operate the live queue in the current permission model.

### Branch Staff
Staff accounts are created by a Branch Admin and receive an explicit set of permissions. The account is restricted to its assigned branch and, where configured, assigned doctor or doctors.

Depending on the permissions granted, staff may:
- View appointments.
- View patient details.
- Operate the live queue.
- Publish or remove doctor schedules.
- View reports.
- Upload or revoke private reports.

A staff member should contact their Branch Admin if a required menu or action is unavailable. Do not share accounts to work around permissions.

## 3. Staff permissions

The following permissions control access to specific workflows:

| Permission | What it allows |
| --- | --- |
| `appointments.view` | View appointment information in the permitted scope |
| `appointments.manage` | Create or update appointments where the workflow permits |
| `patients.view` | View patient identity/contact details |
| `queue.manage` | Use live queue controls |
| `schedules.manage` | Publish or remove schedules in the permitted branch/doctor scope |
| `doctors.view` | View doctor information in the permitted scope |
| `reports.view` | View permitted operational reports |
| `reports.upload` | Upload and revoke private reports within the permitted scope |
| `billing.view` / `billing.manage` | Reserved permission keys; billing workflows are not considered complete |

Privacy behavior:
- Queue operators without `patients.view` can see the patient name needed to call the queue, but phone numbers and private notes are withheld.
- Appointment CSV export requires both `appointments.view` and `reports.view`; patient contact fields are excluded unless `patients.view` is also granted.
- Reports show aggregate operational counts for the authorized branch/doctor scope, not an unrestricted organization-wide patient list.

## 4. Doctor schedules

An authorized Branch Admin or staff member with `schedules.manage` can manage schedules.

1. Open **Admin → Schedules**.
2. Select a doctor available to your account.
3. Choose the consultation date, start time, daily serial capacity, and estimated average consultation duration.
4. Publish the session.
5. Review the published session and use its queue link when the session is active.

Only published sessions are offered for public appointment booking. The schedule view lists the next 14 days. An unused future session can be removed. A session with issued serials or an active consultation cannot be removed from the schedule manager; use the queue console to manage an active session instead.

The schedule is not a substitute for institutional confirmation. Verify doctor availability, branch, clinic hours, capacity, and duration before publishing any real schedule.

## 5. Live queue operations

Queue controls are available only to staff accounts granted `queue.manage` and assigned to the relevant doctor/branch.

1. Open **Admin → Queue**.
2. Select an assigned doctor/session.
3. Use the available controls to call the next patient, mark a patient as skipped/completed, or pause/resume the queue when those controls are available.
4. Confirm the displayed patient and queue state before each action.
5. Use the public **Live** page to show the public-facing queue board.

Queue operations are time-sensitive and may affect what patients see. Do not operate a queue unless you are authorized and have confirmed the correct doctor and session. Queue status and waiting-time estimates are operational information, not medical advice.

## 6. Staff and branch administration

### Main Admin: branches and Branch Admins
- Open **Admin → Branches** to create a branch or activate/deactivate an existing branch.
- Open **Admin → Staff** to create a Branch Admin and assign that account to one branch.
- Open **Admin → Audit** to review recent recorded administrative and operational activity.

Deactivating an account or branch does not delete its records. Access is rechecked against the active account and branch status.

### Branch Admin: staff accounts
- Open **Admin → Staff**.
- Create a staff account for the current branch.
- Assign only the doctor(s) and permissions required for that person's duties.
- Activate or deactivate staff accounts when access needs to change.

A permission change is enforced on subsequent server requests. Do not give staff broader access than their duties require.

## 7. Reports and audit history

### Operational reports
Accounts with `reports.view` can open **Admin → Reports**. Reports summarize appointment volume by date, doctor, and queue status within the account's authorized scope. The reporting range is limited to a maximum of 31 days per query.

### Private medical reports
Where the feature is enabled, an account with `reports.upload` can upload a synthetic demonstration report within its authorized branch/doctor scope. The report access ID and passcode must be treated as confidential. A report can be revoked so its access is removed.

For demonstrations, use only a harmless synthetic PDF and fictional appointment. Never upload a real medical report to this prototype.

### Audit trail
Main Admin can open **Admin → Audit** to review recorded sign-ins, branch/staff account changes, schedule publication/removal, and queue operations. Queue audit entries are designed not to include patient names, phone numbers, or clinical notes.

The audit trail is an application activity log, not a tamper-proof regulatory audit system.

## 8. Sign-in and account safety

- Use the account issued to you; never share credentials.
- Sign out when finished, especially on shared computers.
- Report unexpected access or incorrect branch/doctor assignments to the Main Admin or Branch Admin.
- Do not place passwords, tokens, tracking references, or report passcodes in screenshots or public messages.
- Deactivated accounts or branches lose access; deactivation does not erase historical records.

## 9. Known limitations and safe-use boundaries

- The site and directory are demonstration content and must be reviewed and approved by the institution before any public launch.
- Public booking and self-service cancellation are controlled by deployment environment settings. They should be enabled only when the deployment uses a dedicated database containing fictional demo records.
- Preview and production environments must not share a real patient database. Use a separate staging database for testing.
- Billing permission keys exist, but billing workflows are not a completed feature.
- SMS/WhatsApp delivery, integrations, privacy notices, retention, backups, monitoring, account recovery, and privileged-account MFA require institutional configuration and validation before any real-world use.
- Do not use this prototype for emergencies, diagnosis, treatment decisions, or real patient operations.

## 10. Getting help during a demonstration

If a page or action is missing:
1. Check that you are signed in with the correct account.
2. Confirm the account is assigned to the correct branch and doctor.
3. Ask the Branch Admin to review the account's permissions.
4. For organization-wide branch or Branch Admin access, contact the Main Admin.

For a guided demonstration, use the separate [Demo Runbook](./DEMO-RUNBOOK.md) and [Demo Acceptance Checklist](./DEMO-ACCEPTANCE-CHECKLIST.md).

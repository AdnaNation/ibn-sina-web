# Demonstration runbook

This runbook is for a guided, fictional-data demonstration of the independent prototype. It is not an operating procedure for a real hospital.

## Before sharing the link

- Confirm the production site is the intended demonstration deployment and check its latest deployment status.
- Confirm the configured MongoDB database is isolated from all real hospital and patient systems.
- Confirm every appointment, patient, staff account, report, phone number, and tracking reference in the demo database is fictional.
- Do not use real hospital staff credentials or ask a reviewer to enter real patient information.
- Verify that public booking and cancellation are enabled only for this isolated demo database. If the database is not isolated, disable both features.
- Keep the independent-prototype notice visible. Do not describe the prototype as an official Ibn Sina Trust service or imply endorsement.
- Verify the demo account permissions and share credentials privately with intended reviewers only.
- Do not upload real medical reports. Use a harmless synthetic PDF with fictional content.
- Avoid screenshots that expose personal information, environment values, tokens, or private report credentials.

## Suggested 15-minute walkthrough

### 1. Patient-facing experience

1. Open the homepage and show the Bengali/English language switch.
2. Browse the doctor directory, one doctor profile, services, and branch directory.
3. Explain that the directory is starter content and must be verified by the institution.
4. Open the appointment page. If public booking is enabled on the isolated demo database, create one appointment using fictional details only.
5. Show the tracking reference and patient tracking page. Explain that the reference is a bearer secret and should be kept private.
6. Open the public live queue board and explain the difference between scheduled, live, break, and finished sessions.

### 2. Branch operations

1. Sign in as a Branch Admin.
2. Show branch-scoped doctor management, schedules, staff assignment, appointment visibility, and reports.
3. Explain that Branch Admin does not operate the live queue in the current permission model.
4. Show how staff access is restricted to the assigned branch and doctor(s).

### 3. Queue operations

1. Sign in as a queue-enabled Staff account.
2. Open the assigned doctor's queue.
3. Demonstrate calling the next patient, skipping a patient, and pausing/resuming only if those actions are enabled for that account.
4. Show that staff without patients.view do not see patient phone numbers or private notes.
5. Explain that queue estimates are estimates, not clinical advice or guaranteed appointment times.

### 4. Organization oversight

1. Sign in as Main Admin.
2. Show the organization overview, branch management, Branch Admin accounts, and audit trail.
3. Explain that Main Admin is an oversight role and cannot perform daily queue operations.

### 5. Private report demonstration (optional)

1. Use a synthetic report file and a fictional appointment only.
2. Upload it through an account with reports.upload.
3. Show the generated report ID and passcode delivery step without displaying credentials publicly.
4. Open the patient report page and demonstrate access with the fictional ID and passcode.
5. Revoke the report and confirm access is removed.

## Safe demo environment

The CI browser suite creates temporary test accounts and a fictional appointment in its isolated GitHub Actions MongoDB database. Those credentials and records are test fixtures only; they are not production demo credentials and must never be copied into the live database.

For a separately managed demonstration environment:
- Use a dedicated MongoDB database and unique secrets.
- Use a dedicated deployment environment rather than pointing a production system at a real hospital database.
- Keep ENABLE_PUBLIC_BOOKING and ENABLE_PUBLIC_CANCELLATION disabled unless the dedicated database contains only fictional demo records and the reviewer needs to test those flows.
- Do not run the seed script against a database that contains real or valuable records; it upserts starter directory collections.
- Never run destructive test or reset scripts against production.

## End the demo

- Sign out of every role account.
- Revoke any temporary reviewer accounts and report credentials that are no longer needed.
- Remove any fictional report files and appointments from the isolated demo database using a reviewed cleanup procedure.
- Record reviewer questions and requested integrations separately from features that are actually implemented.
- Do not promise launch dates, compliance, clinical outcomes, or integration capability before discovery and formal approval.

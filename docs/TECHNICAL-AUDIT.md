# Technical audit and readiness assessment

Audit baseline: main commit c8912381c9650c630630b8ddbfe32eeef1f75236 (16 November 2026).

## Executive summary

The repository is a substantial bilingual hospital-experience and clinic-operations prototype. It includes public discovery pages, doctor profiles, appointment booking, bearer-reference queue tracking, a live queue board, branch administration, staff permissions, operational reporting, audit events, and private medical-report delivery.

The codebase has meaningful safeguards and automated unit/MongoDB concurrency tests. It is not an approved hospital information system, a certified clinical product, or ready to process real patient information. The demo must use an isolated database and fictional patient records.

## Areas reviewed

- Authentication and session restoration: lib/auth.js and lib/staff.js.
- Authorization and data scopes: lib/access.mjs and lib/permissions.js.
- Appointment and queue persistence: lib/appointments.js and lib/queue.js.
- Public booking, tracking, availability, and queue APIs.
- Medical-report upload, storage, access, and revocation.
- Staff, branch, doctor, and schedule server actions.
- Existing Node.js tests and the GitHub Actions build workflow.
- Public, admin, and user-manual route structure.

## Existing safeguards found in source

1. Staff sessions are revalidated against the active staff record and branch status on each server request. The signed staff cookie is HttpOnly, SameSite=Lax, and Secure in production.
2. Main Admin, Branch Admin, doctor, and staff capabilities are separated. Staff data scopes fail closed when branch or doctor assignments are missing.
3. Appointment search masks patient identity unless patients.view is granted. CSV export requires the relevant appointment and report permissions, and the phone column is omitted without patient-view permission.
4. Queue serial allocation and appointment insertion run in one MongoDB transaction. Unique indexes protect active duplicate bookings and session serials. Queue operations use per-session serialization and conditional updates.
5. Public availability is rechecked immediately before booking. Booking validates the date, name, and Bangladesh mobile number and rate-limits by request fingerprint and phone.
6. Public tracking returns a limited ticket projection, not the stored phone number, full patient name, or clinical note. Tracking references are bearer secrets and must not be shared publicly.
7. Medical reports are stored in a private GridFS bucket. Upload checks file size and file signatures, passcodes use salted scrypt hashes, download attempts are rate-limited, and access events are recorded.
8. Private ticket and admin pages use no-store response headers. Public endpoints fail closed when the shared rate-limit store is unavailable.
9. The existing test suite covers authorization helpers, queue rules, tracking references, date validation, weekly schedules, CSV formula protection, and MongoDB queue concurrency.

## Gaps and remaining risks

### Browser-level acceptance coverage

The original CI workflow ran unit tests and a production build but did not exercise complete pages and role journeys in a browser. This audit adds a Chromium Playwright suite for public route smoke tests, tracking-data minimization, Main Admin boundaries, Branch Admin boundaries, queue-staff access, appointment identity redaction, and mobile horizontal overflow.

### Institutional content verification

The starter branch, doctor, specialty, and service directory is limited and is not a verified or complete official roster. The institution must approve every public name, affiliation, specialty, schedule, contact number, service description, and emergency instruction before any institutional presentation or launch.

### Identity and privacy controls

A tracking reference is a bearer secret; it is not proof of identity. The private report ID and passcode are also not a formal identity-verification or consent process. Public cancellation and report access must not be treated as sufficient authentication for real patient records. Any real deployment needs institution-approved identity verification, consent, secure credential delivery, retention/deletion rules, encryption and key management, access auditing, backups, incident response, and legal/privacy review.

### Privileged-account protection

The README already identifies privileged-account MFA and first-login password reset as production requirements. They remain prerequisites before onboarding real staff.

### Operational and integration readiness

- Atomic appointment booking requires MongoDB Atlas or another replica-set/sharded deployment; standalone MongoDB does not support the transaction used here.
- Billing permission keys exist, but a complete billing workflow is not implemented.
- SMS/WhatsApp notification delivery, hospital-system integrations, payment collection, and verified emergency-contact routing are not included as complete operational services.
- Rate limiting and queue concurrency still need a load test against a dedicated staging environment.
- Database backups, restore drills, monitoring, alerting, retention, and incident-response procedures must be owned and tested by the institution.

## Role boundaries verified in code

| Role | Intended capability |
|---|---|
| Main Admin | Organization oversight, branch creation/status, Branch Admin account management, audit review. No daily queue operation. |
| Branch Admin | Manage doctors, schedules, staff, branch reports and appointment visibility within one branch. Patient identity remains restricted without patients.view; no live queue operation. |
| Staff | Explicit permission set and assigned doctor(s). Queue operation requires queue.manage; appointment visibility requires appointments.view; identity/contact fields require patients.view. |
| Doctor | Limited assigned-doctor access according to the stored doctor permissions. |

The application enforces these permissions on the server; navigation visibility is not the security boundary.

## Deployment configuration observed on 16 November 2026

- The production alias ibn-sina-webs.vercel.app points to the main commit c8912381c9650c630630b8ddbfe32eeef1f75236 and the deployment is READY.
- The project has SSO protection enabled for deployments except custom domains. The main Vercel domain is public; preview deployments require the configured SSO access.
- Vercel environment variables MONGODB_URI and MONGODB_DB are currently configured for both production and preview targets. A preview deployment is therefore not automatically backed by an isolated database. Before using preview deployments for tests with mutable records, configure a dedicated staging database for preview or remove production database access from preview.
- ENABLE_PUBLIC_BOOKING is true for production and preview; ENABLE_PUBLIC_CANCELLATION is false. Keep public booking enabled only while the connected database contains fictional demo records and is isolated from real systems.

## Verification status

- Existing main commit c8912381c9650c630630b8ddbfe32eeef1f75236: GitHub Actions unit tests and Next.js production build passed.
- Vercel production deployment for that commit: READY, with the production alias ibn-sina-webs.vercel.app.
- Browser-level acceptance checks added by this audit are run in GitHub Actions on the audit pull request; their result must be checked before merge.
- A passing browser suite is a prototype acceptance check, not a penetration test, privacy certification, clinical validation, or institutional approval.

## Go / no-go recommendation

GO for a controlled, fictional-data demonstration and discovery meeting, subject to content/disclaimer review.

NO-GO for real patient data, real appointments, clinical decision-making, hospital staff credentials, or operational use until institutional authorization and the full security, privacy, legal, operational, and integration review is complete.

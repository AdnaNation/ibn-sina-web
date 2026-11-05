# Independent hospital website & queue-system prototype

A bilingual Next.js demonstration concept intended to explore a modern hospital website and patient queue experience. This is an independent, unauthorized prototype and is not the official Ibn Sina Trust website or booking service.

## Stack

- Next.js 15 App Router, React 19, JavaScript
- Tailwind CSS 3 and Lucide icons
- MongoDB native driver
- English / Bengali language switch using a persistent cookie

## Local setup

```bash
npm install
cp .env.example .env.local
# Add your MongoDB URI and unique admin secrets to .env.local
npm run dev
```

Open http://localhost:3000.

To seed the starter directory data into MongoDB:

```bash
npm run seed
```

## Important production setup

1. The data in `data/seed.mjs` is a limited starter directory, not a complete or guaranteed-current hospital roster. The Trust must verify doctor names, specialties, branch affiliations, service descriptions, phone numbers and every other public-facing detail before launch.
2. Doctor appointment availability is based on published `sessions` in MongoDB. A date is deliberately shown as **Schedule not published** until an authorized staff member creates that doctor's session in the admin queue. Do not publish generic/default schedules as real clinic hours.
3. Set `MONGODB_URI`, `MONGODB_DB`, `ADMIN_SECRET` and `ADMIN_PASSWORD` securely in the deployment environment. Never commit `.env.local` or real credentials.
4. Configure and test the staff accounts, branch permissions, queue workflows, SMS/WhatsApp notifications, privacy notices, retention rules, backups and monitoring before accepting real patient data.
5. Run a production build and test the complete booking lifecycle against a staging database before deploying. This environment could not complete dependency installation, so a production build has not been verified here.

## Existing routes retained and improved

- `/` — homepage
- `/doctors` and `/doctors/[slug]` — doctor directory and profile
- `/units` and `/units/[slug]` — locations and branch pages
- `/services/[slug]` — service information
- `/appointment` — doctor/date/patient appointment flow
- `/track` and `/track/[ref]` — appointment tracking
- `/live` — public live queue
- `/admin` — Main Admin overview or staff landing page
- `/admin/schedules` — publish and manage doctor sessions (Main Admin across all branches; authorized branch users within their branch)
- `/admin/queue` — live patient queue console
- `/admin/staff` — Main Admin creates branch admins/staff; Branch Admin creates staff for their own branch

## Appointment safety notes

- Booking requires a published doctor session. The public availability API does not invent a schedule when a session is missing.
- Serial allocation uses MongoDB's conditional atomic increment to avoid assigning the same serial to two concurrent patients. Live queue transitions are serialized per doctor/day with an expiring database lock so two staff members cannot accidentally advance the same patient simultaneously. Schedule edits/removal also check that the session has not changed while the operation is in progress.
- Duplicate waiting/serving appointments are checked by phone number and doctor session. A partial unique MongoDB index is created for active appointments by session and normalized phone number. Before enabling it on an existing production database, clean up any duplicate active records and normalize legacy phone numbers; blank-phone walk-ins are excluded from this index.
- Walk-in entries in the staff queue validate patient-name length and optional Bangladesh mobile format before creating a record. The public website must not be treated as an emergency-care channel. Show only verified emergency guidance and contact details approved by the institution; never invent or carry over an unverified hotline.


## Doctor schedule management

Sign in as the owner and open **Admin → Schedules**. Choose a doctor, consultation date, start time, daily serial capacity, and estimated average consultation duration, then publish the session. Only published sessions are shown as available for online appointment booking. The schedule manager lists the next 14 days and links each session to its live queue console.

An unused future session can be removed. A session with issued serials or an active consultation cannot be removed from the schedule manager; manage it from the queue console instead. This avoids silently deleting or invalidating patient tickets.

The `sessions` collection is the source of published appointment availability. The booking flow still enforces the published session and assigns serials atomically. Before going live, the hospital should verify every doctor, branch, clinic hour, capacity, and estimated consultation duration.

## Multi-branch administration and permissions

The administration area now supports a three-level account hierarchy:

1. **Main Admin (`owner`)** — signs in with username `admin` and `ADMIN_PASSWORD`. Can view the organization-wide overview, publish schedules across branches, and create branch administrators or branch staff.
2. **Branch Admin (`branch_admin`)** — created by the Main Admin and assigned to one exact branch/unit. Can manage schedules and the queue for that branch, and create/remove staff accounts only inside that same branch. A branch admin cannot create another branch admin or access another branch by changing a URL.
3. **Branch Staff (`staff`)** — created by their Branch Admin. The Branch Admin chooses an individual permission set when creating the account. The staff member is restricted to the assigned branch.

Open `/admin/staff` as Main Admin to create a Branch Admin or a staff account. Select the branch and account type. For a Branch Admin, the system grants the full branch-admin role. To create staff, select the individual permissions such as viewing appointments, operating the live queue, or managing schedules. A Branch Admin sees only their own branch and creates staff with that branch preselected and locked.

### Permission keys

- `appointments.view` — view appointment information
- `appointments.manage` — create/update appointments
- `patients.view` — view patient details
- `queue.manage` — use the live queue console and its server actions
- `schedules.manage` — publish/remove schedules within the assigned branch
- `doctors.view` — view branch doctor information
- `reports.view` — view branch reports
- `billing.view` / `billing.manage` — billing access levels

The current project has live UI/server-side enforcement for queue and schedule access. Appointment CSV export requires both `appointments.view` and `reports.view`; patient contact fields remain excluded unless `patients.view` is also granted. Queue operators without `patients.view` can see the patient name needed to call the queue, but phone numbers and private notes are withheld. The appointment, patient, reports and billing permission keys are stored and shown in the staff permission profile as groundwork for those management modules; those modules still need to be built before those permissions grant access to new screens. Do not interpret a saved permission as a completed feature.

Authorization is checked on the server for admin pages and server actions; hiding a link in the navigation is not the security boundary. Existing legacy accounts with role `branch` are read as `branch_admin` for compatibility. Staff permissions are reloaded from the active staff record during server-side session validation, so permission changes take effect on the next request. An explicitly empty permission array grants no doctor permissions; legacy doctor accounts without a stored permission array retain the limited queue/appointment defaults.

For production, add password reset on first login, privileged-account MFA, and test cross-branch access using separate staging accounts before onboarding real staff. Shared MongoDB-backed login rate limits are implemented, but must be exercised under load and monitored.


## Main Admin: branch management, accounts and audit trail

The Main Admin dashboard at `/admin` now shows organization-wide counts and a branch-wise operational table for today's doctors, active branch admins, active staff, bookings, waiting patients and completed consultations. Use `/admin/branches` to create a new branch, activate/deactivate existing branches, and activate/deactivate branch administrator accounts. Branch creation writes to the MongoDB `units` collection using the same `{ slug, name, area, city, type, hotline, address, active }` shape used by the public branch directory. Existing branches without an `active` field are treated as active for backward compatibility.

Account status is stored on the `staff` document as `active`. Deactivation does not delete staff or patient data. Staff sessions are revalidated against the current account and branch status on each server request, so a deactivated account or a deactivated branch loses access without waiting for the signed cookie to expire. Branch admins can activate/deactivate their own branch's staff from `/admin/staff`; only the Main Admin can manage branch-admin accounts.

The Main Admin audit trail is at `/admin/audit`. It records sign-in successes/failures, branch and staff account changes, schedule publication/removal, and live queue operations in the MongoDB `audit_logs` collection. It currently shows the newest 200 events and supports an action-name filter. Queue audit events deliberately avoid patient names, phone numbers and clinical notes. The audit log is an application-level activity trail, not a tamper-proof regulatory audit system; production deployment should restrict database write access and configure backups/retention.

The public navigation now uses native anchor navigation for page links instead of client-side route transitions. This trades a small full-page navigation reload for predictable navigation, including on mobile menus and hash links such as Services.

## What changed in the redesign

- **Bengali first.** The site opens in Bengali by default (English via the EN / বাংলা switch). Departments, branch names, places and numbers show in Bengali. A doctor can have an optional Bengali name (`nameBn`).
- **Trust content.** New homepage sections: emergency notice, quick-access card, live numbers computed from your data (years of service, locations, cities, specialties), a three-step booking guide, "why patients trust us" and an FAQ. Review all wording with the Trust before launch.
- **Mobile action bar** (Locations / Book / Track / Live) for phone users; no unverified hotline is displayed.
- **SEO**: titles, Open Graph, structured data, `robots.txt`, `sitemap.xml`, custom 404 and error pages.
- **Admin portal** has its own layout (no public header/footer), a mobile-friendly navigation bar and a Bengali/English switch on every screen.
- **New admin modules**: `/admin/appointments` (search, cancel, date-scoped CSV export, phone masking unless `patients.view`) and `/admin/doctors` (add, edit, feature on homepage, delete when unused). New permission: `doctors.manage`.
- **Security**: shared MongoDB-backed sign-in rate limiting (5 attempts per username/address fingerprint and 20 per address fingerprint in a 10-minute window), sign-in success/failure in the audit log, and demo mode off in production unless `ENABLE_DEMO=true`.
- **Bug fixes**: branch pages never listed their doctors; missing `.env.example`; a permission check used a key that did not exist.

## Before going live

1. Admin → Doctors → Import starter doctors, then replace the sample list with the real, verified roster.
2. Publish real schedules in Admin → Schedules.
3. Shared MongoDB-backed rate limiting is used for staff sign-in and public tracking, availability, queue-board and cancellation endpoints. Monitor it under load and add privileged-account MFA before production.
4. Add a reviewed privacy notice and publish only contact numbers and service-hour claims verified and approved by the Trust.


## Independent prototype safety baseline

This repository is an independent demonstration concept and is not affiliated with or authorized by Ibn Sina Trust or any other hospital. Public appointment submission is disabled unless ENABLE_PUBLIC_BOOKING=true is explicitly configured after written authorization, privacy review and production readiness checks. Do not set this flag for a public demo. The appointment UI warns against entering real patient details. Public tracking, availability, queue-board and cancellation actions use shared MongoDB-backed rate limits with TTL cleanup. Public endpoints fail closed if the rate-limit store is unavailable. Search indexing is disabled and the sitemap is empty pending authorization and verified content. Never use real patient records in demo data, screenshots or presentations. Tracking references are bearer secrets; implement OTP identity verification before enabling real booking and self-service cancellation. Staff sign-in and public endpoint limits use a shared MongoDB-backed counter with TTL cleanup and fail closed if the store is unavailable. The login limiter counts every submitted attempt in its fixed window, not only incorrect passwords.

A Git push or hosting deployment does not establish clinical, legal, security or production readiness. Before any real-world use, obtain institutional authorization; verify every doctor, branch, service, schedule and contact detail; complete privacy, retention, consent, security, backup, monitoring and incident-response reviews; add privileged-account MFA; and test the full workflow against a staging database.


Staff account creation validates names, normalized usernames, password length, role allowlists, branch assignment and doctor-role assignment both in the server action and in the persistence helper. Permission values are allowlisted before storage; branch-admin accounts receive only the predefined permission set. Inactive branches are excluded from new account assignments.

Queue console updates validate status transitions, delay values, notices, start times and daily capacity in the persistence layer. Finished or cancelled sessions cannot be reopened or edited through the queue settings actions, and updates use a status-conditional database write to detect concurrent changes.

Staff session restoration rejects unsupported or malformed stored roles. Queue-console and schedule-list database queries also fail closed when a non-owner account has no valid branch or doctor scope, rather than falling back to organization-wide records.

## Browser security and prototype identity

- The staff portal and sign-in screen identify themselves as an independent prototype and explicitly warn against using real patient data or actual hospital staff credentials.
- The public live queue page uses demonstration-only metadata and is excluded from search indexing, like the other prototype routes.
- Application-wide response headers include MIME-sniffing protection, a strict-origin referrer policy, frame denial, a restrictive permissions policy for camera/microphone/location, and same-origin opener isolation.
- A Content Security Policy and HSTS are intentionally not asserted here: CSP needs a tested nonce-compatible Next.js setup and HSTS should only be enabled after the production HTTPS/domain configuration is confirmed.

The patient tracking screen polls the rate-limited tracking endpoint every 15 seconds (within its per-client request budget), and both the patient ticket and public live board display a clear stale-data notice if an update fails rather than silently implying that the displayed queue state is current.

The public live board announces changes to the current serial through a polite live region, and the appointment form exposes its pending submission and availability-loading states to assistive technology.

## Additional request and workflow safeguards

- Public patient cancellation now reports success only when MongoDB confirms that the appointment was still waiting and its status was actually changed. Failed, stale or already-updated requests return an error to the patient instead of showing a false success. The tracking reference remains a bearer secret; do not enable real patient cancellation without an approved identity-verification step such as OTP.
- Public booking, appointment search and queue-console date filters use strict calendar-date validation, rejecting impossible dates such as February 31 rather than accepting a date-shaped string.
- Staff account controls prevent an administrator from deactivating their own account through the staff-management screen.
- Audit-log action filters are length-bounded and escaped as literal search text; result limits are clamped to a safe integer range.

Queue session creation now fails cleanly when MongoDB is unavailable and refuses to report an already finished or cancelled session as newly opened. Queue actions and public booking share the same strict calendar-date validator.

Patient tracking pages and the admin portal also receive explicit private no-store cache headers so ticket details and staff screens are not retained by shared browser or intermediary caches.

The shared rate limiter now catches database-connection exceptions and fails closed. Client fingerprints prefer the reverse-proxy-provided `x-real-ip`; if unavailable, the right-most `x-forwarded-for` hop is used rather than trusting the left-most client-supplied value. Correct client identification still depends on the hosting reverse proxy overwriting its forwarded-IP headers.

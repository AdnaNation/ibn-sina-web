# Ibn Sina Trust — bilingual healthcare website

A Next.js App Router website concept for the official Ibn Sina Trust digital experience.

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
- `/admin` — owner overview
- `/admin/schedules` — publish and manage doctor sessions (owner only)
- `/admin/queue` — live patient queue console
- `/admin/staff` — branch and doctor staff accounts (owner only)

## Appointment safety notes

- Booking requires a published doctor session. The public availability API does not invent a schedule when a session is missing.
- Serial allocation uses MongoDB's conditional atomic increment to avoid assigning the same serial to two concurrent patients.
- Duplicate waiting/serving appointments are checked by phone number and doctor session. A partial unique MongoDB index is created for active appointments by session and normalized phone number. Before enabling it on an existing production database, clean up any duplicate active records and normalize legacy phone numbers; blank-phone walk-ins are excluded from this index.
- The public website must not be treated as an emergency-care channel. Emergency guidance and the official hotline should remain visible.


## Doctor schedule management

Sign in as the owner and open **Admin → Schedules**. Choose a doctor, consultation date, start time, daily serial capacity, and estimated average consultation duration, then publish the session. Only published sessions are shown as available for online appointment booking. The schedule manager lists the next 14 days and links each session to its live queue console.

An unused future session can be removed. A session with issued serials or an active consultation cannot be removed from the schedule manager; manage it from the queue console instead. This avoids silently deleting or invalidating patient tickets.

The `sessions` collection is the source of published appointment availability. The booking flow still enforces the published session and assigns serials atomically. Before going live, the hospital should verify every doctor, branch, clinic hour, capacity, and estimated consultation duration.

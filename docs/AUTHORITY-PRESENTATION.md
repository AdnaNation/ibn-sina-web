# Authority presentation outline

## Positioning

Present this as an independently developed prototype for discussion. It is not the official Ibn Sina Trust website, not commissioned by the Trust, and not approved for clinical or operational use.

## Slide 1 — A more connected patient journey

An independent hospital website and clinic-operations prototype.

Subtitle: A concept for clearer information, appointment access, and queue visibility.

Speaker note: Start by asking whether the organization is exploring improvements to its patient-facing digital experience. State clearly that this is an independent demonstration.

## Slide 2 — The opportunity

- Help patients find verified doctors, specialties, services, and branch information.
- Make appointment steps easier to understand.
- Give patients a simple way to follow queue progress.
- Give branch teams a clearer operational workspace.

Speaker note: Frame these as opportunities to validate with the hospital, not claims about existing failures.

## Slide 3 — One patient journey

Discover care → choose a doctor and published date → receive a tracking reference → follow queue progress.

Speaker note: The prototype demonstrates the journey with fictional records. A real booking process would require approved schedules, identity/consent controls, and integration decisions.

## Slide 4 — Patient-facing experience

- Bengali and English interface.
- Doctor directory and profile pages.
- Branch and service information.
- Appointment availability based on published sessions.
- Live queue board and private ticket tracking.

Speaker note: The current starter directory is limited and unverified. It must be replaced or approved by the institution.

## Slide 5 — Clinic workflow

- Branch-scoped doctor and schedule management.
- Published one-off and recurring weekly sessions.
- Atomic serial allocation and duplicate active booking protection.
- Staff queue console with status updates and queue estimates.
- Operational reports and activity history.

Speaker note: Queue estimates are informational only. They are not guaranteed wait times or clinical guidance.

## Slide 6 — Role-based access

- Main Admin: organization oversight, branch management, Branch Admin accounts, and audit review.
- Branch Admin: own-branch doctors, schedules, staff, appointment visibility, and reports.
- Staff: only the permissions and doctor assignments granted to that account.
- Patient contact details are separately permission-gated.

Speaker note: The current Branch Admin role does not operate the live queue; queue actions are assigned to authorized staff.

## Slide 7 — Privacy and security design

- Server-side role and branch checks.
- Masked patient identity when permission is absent.
- Private GridFS report storage and passcode-protected access.
- Rate-limited public endpoints.
- No-store headers for private ticket and staff pages.
- Audit events for important administrative activity.

Speaker note: These are prototype safeguards, not a compliance certification or substitute for a security assessment.

## Slide 8 — What this demonstration can validate

- User experience and navigation.
- Booking and queue workflow concepts.
- Branch/staff permission boundaries.
- Reporting and private-report interaction concepts.
- Requirements and integration questions for a formal discovery phase.

Speaker note: The prototype must use fictional data. It is not connected to the hospital's live patient, billing, or clinical systems.

## Slide 9 — What would be required before a pilot

1. Institutional sponsorship and written authorization.
2. Verified content, branch directory, doctors, and schedules.
3. Privacy, consent, identity verification, and legal review.
4. Security assessment, MFA, key management, backups, monitoring, and incident response.
5. Integration architecture and data ownership decisions.
6. Dedicated staging environment, acceptance criteria, training, and a controlled pilot plan.

Speaker note: Do not propose moving directly from this demo to production.

## Slide 10 — Proposed next step

A short discovery meeting with the relevant digital, IT, operations, and patient-service stakeholders.

Questions to explore:
- Which patient and staff workflows matter most?
- Which existing systems must remain the source of truth?
- What privacy, identity, and audit requirements apply?
- What would a safe, measurable pilot need to prove?

Closing: Thank you. This prototype is offered as a conversation starter, not as an official or approved hospital system.

# Feature Specification: Doctor Job Board

**Feature Branch**: `001-plan-phase-specs`
**Created**: 2026-04-25
**Status**: Draft
**Phase**: 5 of 7

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Clinic Posts a Job Listing (Priority: P1)

A verified clinic admin opens the job board section and creates a new job listing. They fill in the required specialty, job type (full-time, part-time, temporary, or locum), schedule description, compensation range, required experience, and application deadline. The listing is published and becomes visible in the doctor job board.

**Why this priority**: Job listings are the supply side of the marketplace. Without them, doctors have nothing to see or apply to.

**Independent Test**: Can be fully tested by creating a listing as a clinic admin and confirming it appears in the doctor job board filtered by the relevant specialty. No applications needed for this story.

**Acceptance Scenarios**:

1. **Given** a verified clinic admin, **When** they complete and submit a job listing form, **Then** the listing is published and visible in the doctor job board within 1 minute.
2. **Given** a clinic admin who leaves the specialty field empty, **When** they attempt to submit, **Then** the form is blocked and the missing field is highlighted.
3. **Given** a clinic that has reached its monthly posting limit (Basic tier: 3 posts), **When** they attempt to create a fourth listing, **Then** they are blocked with a message explaining the limit and the option to upgrade.
4. **Given** an unverified clinic, **When** they attempt to access the job posting feature, **Then** access is denied and they are directed to complete verification.

---

### User Story 2 — Doctor Discovers and Applies for a Job (Priority: P1)

A verified doctor opens the job board. The board automatically shows listings matching their registered specialty. They browse a listing, read the details, and tap "Apply". Their existing profile (name, photo, specialty, experience, license) is used as their application. Optionally they write a short cover note. The application is submitted and the clinic is notified.

**Why this priority**: Doctor applications are the demand side of the marketplace. This story completes the core board-and-apply loop.

**Independent Test**: Can be fully tested by having a verified doctor apply to an open listing and confirming the application appears in the clinic's applicant list.

**Acceptance Scenarios**:

1. **Given** a verified doctor viewing a job listing, **When** they tap "Apply" and optionally add a cover note, **Then** the application is submitted and appears in the clinic's applicant list.
2. **Given** a doctor who already applied to a listing, **When** they view the same listing again, **Then** they see their current application status instead of the "Apply" button — duplicate applications are not permitted.
3. **Given** an unverified doctor, **When** they attempt to view job listings, **Then** the job board is not accessible and they are directed to complete verification.
4. **Given** a listing whose application deadline has passed, **When** a doctor views it, **Then** the listing is shown as closed and the Apply button is disabled.

---

### User Story 3 — Clinic Reviews and Manages Applicants (Priority: P2)

A clinic admin opens a job listing and views all applications. For each applicant they can see the doctor's profile (photo, name, specialty, experience, license). They move each applicant through statuses: Under Review, Shortlisted, Rejected, or Hired. Each status change is saved immediately.

**Why this priority**: Status management is how clinics run their hiring process on the platform. Without it, the board has no workflow value.

**Independent Test**: Can be tested independently by changing an applicant's status through all states and confirming each saves correctly and the doctor receives the relevant notification.

**Acceptance Scenarios**:

1. **Given** a clinic admin with multiple applicants for a listing, **When** they open the applicant list, **Then** each applicant shows their name, specialty, experience, and current status.
2. **Given** a clinic admin who changes an applicant status to "Shortlisted", **When** the change is saved, **Then** the doctor receives a notification of the status change.
3. **Given** a clinic admin who marks an applicant as "Hired", **When** this is saved, **Then** the listing can be marked as filled by the clinic.

---

### User Story 4 — In-App Messaging Between Clinic and Applicant (Priority: P2)

A clinic admin opens an applicant's application and starts a chat. They send a message. The doctor applicant receives a notification and can reply. The conversation history is visible to both parties within the context of that job application.

**Why this priority**: Messaging enables follow-up questions and interview coordination without leaving the platform, increasing engagement.

**Independent Test**: Can be tested by sending a message from the clinic to an applicant and verifying delivery to the doctor and the reply path back to the clinic.

**Acceptance Scenarios**:

1. **Given** a clinic admin who sends a message to an applicant, **When** the message is sent, **Then** the doctor receives a push notification and can view the message in the app.
2. **Given** a doctor who replies to a clinic message, **When** the reply is sent, **Then** the clinic admin sees the reply in the same conversation thread.
3. **Given** a job application that has been rejected, **When** the clinic attempts to send a new message, **Then** messaging is still permitted (communication may still be needed).

---

### User Story 5 — Doctor Receives Status Change Notifications (Priority: P2)

Whenever a clinic updates the status of a doctor's application, the doctor receives a push notification informing them of the change. The doctor can open the notification and see their updated status in the job application.

**Why this priority**: Notifications close the feedback loop for doctors and remove the need for manual follow-up, improving the candidate experience.

**Independent Test**: Can be tested in isolation by triggering a status change from the clinic side and verifying the doctor's notification arrives within 1 minute.

**Acceptance Scenarios**:

1. **Given** a doctor with a pending application, **When** the clinic changes their status to "Shortlisted", **Then** the doctor receives a notification within 1 minute.
2. **Given** a doctor who opens the notification, **When** they are taken to the app, **Then** the application shows the updated status.

---

### Edge Cases

- What happens when a clinic changes a listing's required specialty after applications have been received?
- What if a doctor's verification is revoked after they applied — do they still appear in the clinic's applicant list?
- What if a listing's deadline passes while the clinic has active unreviewed applicants?
- What happens if the platform's subscription service goes down and a clinic cannot post?
- What if a doctor applies to a listing but their profile is incomplete?

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Verified clinics MUST be able to create a job listing containing: required specialty, job type (full-time, part-time, temporary, or locum), schedule description, compensation range, minimum years of experience, and application deadline.
- **FR-002**: Job listings MUST only be visible and accessible to verified (admin-approved) doctors.
- **FR-003**: The doctor job board MUST filter listings by the logged-in doctor's registered specialty by default; the doctor MUST be able to change the filter manually.
- **FR-004**: A verified doctor MUST be able to apply to a listing in one tap using their existing platform profile as their application; no separate CV upload is required.
- **FR-005**: Doctor MUST be able to add an optional written cover note (free text) when applying.
- **FR-006**: System MUST prevent a doctor from submitting more than one application to the same listing.
- **FR-007**: Clinic admin MUST be able to view all applicants for each listing, showing each doctor's name, photo, specialty, years of experience, and current application status.
- **FR-008**: Clinic admin MUST be able to update each applicant's status to one of: Under Review, Shortlisted, Rejected, or Hired.
- **FR-009**: System MUST notify the doctor whenever their application status changes.
- **FR-010**: Clinic admin MUST be able to initiate an in-app chat with any applicant; both parties MUST be able to send and receive messages within the context of that application.
- **FR-011**: System MUST enforce job listing limits based on the clinic's subscription tier: Basic tier permits 3 active listings per calendar month, Pro tier permits unlimited listings.
- **FR-012**: As an alternative to subscription, admin MUST be able to configure a pay-per-post fee; clinics using pay-per-post are charged per listing published.
- **FR-013**: Only verified doctors MUST appear in a clinic's applicant list; applications from doctors whose verification is later revoked MUST be flagged.
- **FR-014**: All user-facing screens MUST be displayed in Arabic and support right-to-left layout.

### Key Entities

- **JobListing**: The posting record — clinic, required specialty, job type, schedule description, compensation range, experience requirement, application deadline, listing status (active, expired, filled).
- **JobApplication**: A doctor's application to a listing — job listing reference, doctor reference, optional cover note, application status, applied timestamp, last status-update timestamp.
- **JobApplicationStatus**: Enumerated states — Applied, Under Review, Shortlisted, Rejected, Hired.
- **JobMessage**: A single chat message within an application — application reference, sender role (clinic or doctor), message text, sent timestamp.
- **SubscriptionTier**: Clinic subscription record — clinic reference, tier level (Basic or Pro), active listing count for current month, renewal date.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A clinic can publish a job listing and have it appear in the relevant doctor job board within 1 minute.
- **SC-002**: A doctor can complete an application in under 30 seconds from viewing a listing.
- **SC-003**: Application status change notifications reach the doctor within 1 minute of the clinic updating the status.
- **SC-004**: Unverified and suspended doctors are excluded from all applicant lists in 100% of tested scenarios.
- **SC-005**: In-app messages between clinic and applicant are delivered in real time (under 3 seconds).
- **SC-006**: Subscription posting limits are enforced with zero over-quota postings in 100% of test scenarios.

---

## Assumptions

- Supported job types: Full-time, Part-time, Temporary, and Locum. Other types (e.g., freelance, advisory) are out of scope for this phase.
- Subscription tier definitions (Basic: 3 posts/month, Pro: unlimited) and the pay-per-post fee amount are configured by the platform admin, not by clinics.
- Job board search and filter beyond specialty (e.g., by compensation, location, job type) are not required in this phase; doctors filter by specialty only.
- Non-doctor medical roles (nurses, physiotherapists, lab technicians) are out of scope for this phase.
- No integration with external job platforms (LinkedIn, Bayt, etc.) is in scope.
- A listing whose deadline has passed is automatically marked "expired" and hidden from the doctor job board; it remains visible to the clinic admin.
- Doctor profile completeness is not enforced as a prerequisite for applying, but incomplete profiles may be less attractive to clinics.

# Feature Specification: Foundation & Authentication

**Feature Branch**: `001-plan-phase-specs`
**Created**: 2026-04-25
**Status**: Draft
**Phase**: 1 of 7

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Patient Registration & Login (Priority: P1)

A new patient downloads the app and creates an account using their phone number. The system sends a one-time code to verify the number. After verification, the patient provides their name, age, and gender to complete their profile. On subsequent visits, the patient logs in again via phone number and a new one-time code.

**Why this priority**: Patient registration is the foundation of the platform's largest user group. Without it, no consultations, bookings, or browsing is possible. It is the single most critical flow to validate first.

**Independent Test**: Can be fully tested by completing a fresh registration with a valid phone number, entering the one-time code, filling in basic profile details, and confirming the patient home screen is accessible. Delivers a working patient account with no other phase needed.

**Acceptance Scenarios**:

1. **Given** a phone number not previously registered, **When** the patient enters it and submits the one-time code received, **Then** an account is created and the patient is taken to the home screen.
2. **Given** a registered phone number, **When** the patient enters it and submits the one-time code, **Then** the patient is logged in and taken to the home screen.
3. **Given** an expired or incorrect one-time code, **When** the patient submits it, **Then** an error message is shown and the patient can request a new code.
4. **Given** a phone number already registered, **When** the same number attempts registration again, **Then** the system directs the patient to log in instead of creating a duplicate account.

---

### User Story 2 — Doctor Registration & Document Upload (Priority: P2)

A licensed doctor wants to join the platform. They register with an email address and password, then upload their national ID and medical license document. Upon submission, their account is placed in a "pending approval" state. The doctor sees a clear holding screen explaining that their documents are under review and that access to platform features is locked until approval.

**Why this priority**: Doctors are the service providers. Their registration flow introduces the document-upload and approval workflow that underpins platform trust.

**Independent Test**: Can be fully tested by completing the registration form, uploading the required files, submitting, and confirming the "pending approval" screen is shown. Verifying the account cannot access any doctor features validates the lock. No approval needed to test this story.

**Acceptance Scenarios**:

1. **Given** an unregistered email, **When** a doctor completes registration and uploads both required documents, **Then** the account is created with "pending" status and the doctor sees the pending approval screen.
2. **Given** a pending doctor account, **When** the doctor attempts to access any doctor feature (e.g., profile, consultations), **Then** they are redirected to the pending approval screen.
3. **Given** a doctor registration form, **When** required documents are not attached, **Then** the form cannot be submitted and the missing documents are highlighted.
4. **Given** an already-registered email, **When** another registration is attempted with the same email, **Then** an error is shown and a new account is not created.

---

### User Story 3 — Clinic Registration & Document Upload (Priority: P3)

A clinic owner registers the clinic on the platform using an email address and password. They provide the clinic name, address, and commercial registration number, and upload official business documents. The clinic account is set to "pending approval" and the clinic admin sees a holding screen until the admin team verifies the documents.

**Why this priority**: Clinics are the second type of service provider. This story mirrors the doctor registration flow and validates that the pending-approval mechanism works for a different role.

**Independent Test**: Can be fully tested independently of the doctor story by completing clinic registration, uploading documents, and confirming the pending screen and locked state.

**Acceptance Scenarios**:

1. **Given** an unregistered clinic email, **When** the clinic completes registration and uploads required documents, **Then** the account is created with "pending" status and the clinic admin sees the pending approval screen.
2. **Given** a pending clinic account, **When** the clinic admin attempts to access clinic features, **Then** they are redirected to the pending approval screen.
3. **Given** a clinic registration form, **When** required business documents are not attached, **Then** the form cannot be submitted.

---

### User Story 4 — Admin Login & Verification Queue (Priority: P2)

A platform admin logs in with their email and password. They land on the admin verification queue — a list of all pending doctor and clinic accounts showing submitted documents. The admin can open each item, review the documents, and either approve the account or reject it with a written reason.

**Why this priority**: Without admin approval, no doctors or clinics can operate. This story unlocks the entire supply side of the platform.

**Independent Test**: Can be fully tested using a pre-seeded pending doctor and pending clinic. Admin logs in, reviews documents, approves one, rejects the other with a reason. Confirm status changes in each account. No patient interaction needed.

**Acceptance Scenarios**:

1. **Given** a valid admin account, **When** the admin enters correct credentials, **Then** the admin lands on the verification queue dashboard.
2. **Given** a pending doctor in the queue, **When** the admin approves the account, **Then** the doctor's status changes to "approved" and the doctor receives a notification.
3. **Given** a pending clinic in the queue, **When** the admin rejects the account with a reason, **Then** the clinic's status changes to "rejected", the clinic receives the rejection reason, and the clinic can re-submit documents.
4. **Given** the admin rejection form, **When** the admin submits without entering a reason, **Then** the rejection cannot be completed and a reason is required.
5. **Given** invalid admin credentials, **When** the admin attempts to log in, **Then** access is denied and an error message is shown.

---

### User Story 5 — Approved Account Gains Full Access (Priority: P3)

After the admin approves a doctor or clinic, the account holder receives a notification informing them of the approval. When they next open the app, they can access all features appropriate to their role. A previously rejected account holder receives the rejection reason and a way to correct and re-submit their documents.

**Why this priority**: This story closes the verification loop and confirms the end-to-end flow works from registration to active status.

**Independent Test**: Can be tested by approving a pending doctor account (from Story 4) and then logging in as that doctor to confirm full feature access is unlocked.

**Acceptance Scenarios**:

1. **Given** a doctor whose account was just approved, **When** the doctor opens the app, **Then** the pending screen is gone and full doctor features are accessible.
2. **Given** a doctor whose account was rejected, **When** the doctor opens the app, **Then** they see the rejection reason and an option to re-submit corrected documents.
3. **Given** a re-submitted doctor application, **When** the admin reviews it again, **Then** the updated documents are visible and the approve/reject flow works as before.

---

### Edge Cases

- What happens when a one-time code is requested multiple times in quick succession (rate limiting)?
- How does the system behave if a document upload fails mid-submission?
- What happens when an admin session expires while reviewing a document?
- How are duplicate phone numbers handled if the same number is used across different regions?
- What happens if a rejected doctor re-submits the exact same documents without changes?

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow patients to register using a mobile phone number verified by a one-time code sent to that number.
- **FR-002**: System MUST allow patients to log in using their registered phone number and a one-time code.
- **FR-003**: System MUST require patients to provide their full name, age, and gender during initial registration.
- **FR-004**: System MUST allow doctors to register using an email address and password.
- **FR-005**: System MUST require doctors to upload at least one government-issued identity document and a valid medical license document during registration.
- **FR-006**: System MUST allow clinics to register using an email address and password.
- **FR-007**: System MUST require clinics to provide their clinic name, address, and commercial registration number, and upload at least one official business document during registration.
- **FR-008**: System MUST set all new doctor and clinic accounts to "pending" status immediately upon successful registration.
- **FR-009**: System MUST prevent any user with "pending" or "rejected" status from accessing platform features beyond the status screen.
- **FR-010**: System MUST provide a dedicated admin login using email address and password.
- **FR-011**: Admin accounts MUST only be created by direct database entry; no public self-registration for admins is permitted.
- **FR-012**: System MUST provide admins with a verification queue listing all accounts in "pending" status, including the uploaded documents for each.
- **FR-013**: Admin MUST be able to approve a pending doctor or clinic account; approval MUST change the account status to "approved".
- **FR-014**: Admin MUST be able to reject a pending doctor or clinic account; rejection MUST require a written reason and MUST change the account status to "rejected".
- **FR-015**: System MUST notify an approved account holder that their account has been approved and they may now use the platform.
- **FR-016**: System MUST notify a rejected account holder with the rejection reason and provide a mechanism to re-submit updated documents.
- **FR-017**: System MUST issue a secure session credential to any user upon successful login, valid for the user's role.
- **FR-018**: System MUST enforce role-based access so that patient, doctor, clinic, and admin areas are completely isolated from each other.
- **FR-019**: All user-facing screens MUST be displayed in Arabic and support right-to-left layout.

### Key Entities

- **User**: The base account record. Holds role (Patient, Doctor, Clinic, Admin) and account status (active, pending, rejected, suspended).
- **Patient**: Personal details linked to a User — phone number, full name, age, gender.
- **Doctor**: Professional details linked to a User — specialty, national ID number, medical license number, uploaded verification documents, approval status and audit trail.
- **Clinic**: Business details linked to a User — clinic name, address, commercial registration number, uploaded business documents, approval status and audit trail.
- **VerificationDocument**: A single uploaded file — owner reference, document type label, storage reference, upload timestamp.
- **Session**: A record of a user's active login — user reference, role, credential expiry times, and secure refresh mechanism.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A new patient can complete phone registration, verify their number, and reach the home screen in under 3 minutes.
- **SC-002**: A new doctor can complete registration, upload all required documents, and see the pending approval screen in under 5 minutes.
- **SC-003**: An admin can locate a pending account in the verification queue, review documents, and approve or reject the account in under 3 user actions.
- **SC-004**: An approved doctor or clinic account receives their approval notification within 60 seconds of the admin taking the action.
- **SC-005**: Role-based access controls prevent unauthorized role access in 100% of tested scenarios (e.g., a patient account cannot reach doctor or admin screens).
- **SC-006**: All user-facing screens render correctly in Arabic right-to-left layout with no text overflow or layout breakage.

---

## Assumptions

- Admin accounts are created manually by the engineering team; there is no admin self-registration screen.
- One-time code delivery relies on an external phone verification service; code validity period is 5 minutes.
- Document uploads accept PDF, JPG, and PNG formats with a maximum file size of 10 MB per file.
- Session credentials consist of a short-lived access token (15 minutes) and a longer-lived refresh token (7 days) stored securely on the device.
- A doctor or clinic account can have only one active pending review at a time; re-submission replaces the previous submission.
- Approval and rejection notifications are delivered via push notification to the mobile app; email notification is a secondary channel.
- The platform targets Arabic-speaking markets; Arabic right-to-left layout is the sole supported locale for this phase.
- "Suspended" account status (for future admin actions) is modelled in the data structure but not exposed in the UI during this phase.

# Feature Specification: Paid Medical Consultations

**Feature Branch**: `001-plan-phase-specs`
**Created**: 2026-04-25
**Status**: Draft
**Phase**: 3 of 7

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Patient Pays and Starts a Consultation (Priority: P1)

A patient opens a verified doctor's profile and taps "Start Consultation". They write their question, optionally attach images or lab result files, and review the doctor's fee and estimated response time. They complete payment. The consultation is created, and the doctor is notified. The patient sees the consultation in a "waiting for response" state.

**Why this priority**: The payment-gated consultation flow is the core revenue mechanism of the platform. All other stories depend on a successfully paid consultation existing.

**Independent Test**: Can be fully tested by completing payment for a consultation and confirming the consultation appears in the patient's history with "awaiting response" status, while the doctor sees a notification. No response needed for this story's validation.

**Acceptance Scenarios**:

1. **Given** a patient who has not paid, **When** they attempt to submit a consultation question, **Then** they are blocked and directed to the payment screen first.
2. **Given** a patient who completes payment successfully, **When** the payment is confirmed, **Then** the consultation is created, the doctor is notified, and the patient sees the "awaiting response" screen.
3. **Given** a payment that fails, **When** the failure occurs, **Then** no consultation is created and the patient is shown an error with retry options.
4. **Given** a patient attaching more than 5 files or a file exceeding 10 MB, **When** they attempt to attach it, **Then** the attachment is rejected with a clear message before payment.

---

### User Story 2 — Doctor Receives and Responds to Consultation (Priority: P1)

A doctor receives a push notification for a new paid consultation. They open the consultation, read the patient's question and any attachments, and compose a text response. Optionally they attach a prescription document. They submit their response before their self-set deadline. The patient is notified and can read the response.

**Why this priority**: The doctor's response is the service delivery step. Without it, the consultation loop cannot close.

**Independent Test**: Can be tested by having a paid consultation in "awaiting response" state, responding as the doctor, and confirming the patient receives a notification and can read the response.

**Acceptance Scenarios**:

1. **Given** a paid consultation in the doctor's queue, **When** the doctor opens it and submits a response before the deadline, **Then** the consultation moves to "responded" status and the patient is notified.
2. **Given** a doctor who attempts to respond after their deadline has passed, **When** they submit, **Then** the response is rejected, the consultation is already marked "expired", and the patient has been refunded.
3. **Given** a doctor attaching a prescription to their response, **When** the response is submitted, **Then** the prescription appears in the consultation thread accessible to the patient.

---

### User Story 3 — Patient Sends Follow-Up Messages (Priority: P2)

After the doctor's first response, the patient may send up to 2 follow-up messages within 72 hours at no additional charge. After the second follow-up or after 72 hours — whichever comes first — the consultation automatically closes.

**Why this priority**: Follow-ups complete the care loop and add value beyond a one-shot answer. The auto-close rule is a business constraint that must be enforced.

**Independent Test**: Can be tested by sending 2 follow-ups and confirming the third is blocked, and by verifying the consultation closes after 72 hours even if only 1 follow-up was sent.

**Acceptance Scenarios**:

1. **Given** a consultation in "responded" status, **When** the patient sends a follow-up message, **Then** it is delivered to the doctor and the follow-up count increments.
2. **Given** a patient who has already sent 2 follow-ups, **When** they attempt to send a third, **Then** the send button is disabled and an explanatory message is shown.
3. **Given** 72 hours have passed since the doctor's first response, **When** the timer expires, **Then** the consultation is automatically closed regardless of follow-up count.
4. **Given** a patient sending a follow-up after the 72-hour window has closed, **When** they attempt to send, **Then** the message is blocked and the consultation is shown as closed.

---

### User Story 4 — Auto-Refund Fires When Doctor Misses Deadline (Priority: P2)

A doctor fails to respond within their self-set response window (6, 12, or 24 hours). The system automatically issues a full refund to the patient and marks the consultation as "expired". The patient is notified of the refund.

**Why this priority**: The auto-refund protects patients and enforces doctor accountability. Without it, patients are harmed and trust is lost.

**Independent Test**: Can be tested by creating a consultation with a 6-hour window and simulating the deadline passing without a doctor response. Confirm refund and status change.

**Acceptance Scenarios**:

1. **Given** a consultation where the doctor's response deadline has passed, **When** the deadline expires, **Then** the consultation is marked "expired", a full refund is issued to the patient, and the patient is notified.
2. **Given** the auto-refund has been issued, **When** the doctor subsequently tries to respond, **Then** their response is rejected and the consultation remains "expired".

---

### User Story 5 — Patient Rates Doctor After Consultation Closes (Priority: P2)

After a consultation closes (either naturally or by expiry), the patient who received a response is prompted to rate the doctor on a 1–5 star scale with an optional written comment. The submitted rating appears on the doctor's public profile.

**Why this priority**: Ratings are the primary trust signal for new patients. Closing the rating loop is essential to the marketplace's credibility.

**Independent Test**: Can be tested by closing a consultation and confirming the rating prompt appears, submitting a rating, and verifying the doctor's profile shows the updated score.

**Acceptance Scenarios**:

1. **Given** a consultation that has just closed, **When** the patient opens the app, **Then** they are prompted to rate the doctor.
2. **Given** a patient who submits a 4-star rating with a comment, **When** the rating is saved, **Then** the doctor's average rating on their public profile updates within 2 minutes.
3. **Given** an expired consultation (doctor did not respond), **When** the patient views the consultation, **Then** the rating prompt is not shown (no service was delivered).

---

### User Story 6 — Admin Handles a Dispute (Priority: P3)

A patient disputes a consultation outcome. An admin opens the dispute, reviews the full consultation thread including all messages and attachments, and decides to issue a manual refund or close the dispute as resolved. The doctor may be flagged or suspended if the issue is serious.

**Why this priority**: Dispute resolution maintains platform trust and is a legal requirement for a payment-processing service.

**Independent Test**: Can be tested by raising a dispute on a completed consultation, having an admin review it, issue a refund, and verifying the refund is credited and the doctor's flag count increments.

**Acceptance Scenarios**:

1. **Given** a consultation flagged as disputed, **When** an admin opens it, **Then** the full message thread, payment details, and patient complaint are visible.
2. **Given** an admin who approves a manual refund, **When** the refund is issued, **Then** the patient is notified and the consultation status changes to "refunded".

---

### Edge Cases

- What happens if payment is confirmed by the gateway but the system fails to create the consultation record?
- How are attachments handled if the upload partially fails?
- What happens if a doctor responds with a prescription but forgets to include a text message?
- What if two follow-up messages are sent within milliseconds of the 72-hour cutoff?
- What happens to earnings credited to a doctor's account when a dispute refund is issued post-completion?

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST prevent a patient from submitting a consultation question unless payment has been confirmed.
- **FR-002**: Patient MUST be able to write a consultation question as text and attach up to 5 files (images or documents, maximum 10 MB each).
- **FR-003**: Before payment, patient MUST see the doctor's consultation fee, specialty, and estimated response time.
- **FR-004**: System MUST create the consultation record and notify the doctor only after payment is fully confirmed.
- **FR-005**: Doctor MUST be able to set their personal response window to 6, 12, or 24 hours from their profile settings.
- **FR-006**: System MUST automatically issue a full refund to the patient and mark the consultation "expired" if the doctor does not respond within their set window.
- **FR-007**: Doctor MUST be able to respond to a consultation with a text message and optionally attach one prescription document.
- **FR-008**: After the doctor's first response, patient MUST be able to send up to 2 follow-up messages within 72 hours at no additional charge.
- **FR-009**: System MUST automatically close the consultation after 72 hours from the doctor's first response OR after the patient's second follow-up, whichever occurs first.
- **FR-010**: After a consultation closes with a doctor response, patient MUST be prompted to rate the doctor on a 1–5 star scale with an optional written comment.
- **FR-011**: Submitted ratings MUST update the doctor's public profile rating average within 2 minutes.
- **FR-012**: Platform MUST apply a 15% commission on every completed consultation; doctor MUST be credited 85% of the consultation fee upon completion.
- **FR-013**: Doctor MUST be able to request an earnings withdrawal on a weekly or monthly schedule, subject to a minimum withdrawal amount.
- **FR-014**: Admin MUST be able to view all consultations and filter by date range, doctor, status, or dispute flag.
- **FR-015**: Admin MUST be able to open a disputed consultation, review the full thread, and issue a manual refund.
- **FR-016**: Admin MUST be able to flag or suspend a doctor based on repeated timeouts or disputes.
- **FR-017**: All user-facing screens MUST be displayed in Arabic and support right-to-left layout.

### Key Entities

- **Consultation**: The central record — patient, doctor, question text, file attachments, status, payment reference, response deadline, timestamps for creation and closure.
- **ConsultationStatus**: Enumerated states — pending payment, awaiting response, active (doctor responded), follow-up, closed, expired, disputed.
- **ConsultationMessage**: A single message within a consultation — sender role (patient or doctor), message text, file attachments, sent timestamp.
- **Payment**: Financial record — consultation reference, gross fee, platform commission amount, doctor payout amount, gateway status, gateway transaction reference.
- **Rating**: Post-consultation rating — consultation reference, patient, doctor, star score (1–5), optional comment, submission timestamp.
- **Withdrawal**: Doctor earnings withdrawal request — doctor reference, requested amount, status (pending, processed, failed), request and processing timestamps.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A patient cannot submit a consultation without confirmed payment in 100% of tested scenarios.
- **SC-002**: Auto-refund is issued within 5 minutes of the doctor's response deadline expiring.
- **SC-003**: A 15% platform commission is correctly calculated and applied on every completed consultation with zero discrepancies in test data.
- **SC-004**: A patient can complete the full consultation flow — pay, receive a response, send follow-ups, and submit a rating — in under 10 minutes of active use time.
- **SC-005**: Doctor's public rating average updates within 2 minutes of a patient submitting a rating.
- **SC-006**: Consultation auto-close fires correctly at 72 hours or after 2 follow-ups in 100% of tested scenarios.
- **SC-007**: All user-facing screens render correctly in Arabic right-to-left layout with no text overflow or layout breakage.

---

## Assumptions

- Payment is processed through a third-party payment gateway; the platform treats a webhook confirmation from the gateway as definitive payment success.
- If payment is confirmed but the consultation record fails to be created, a compensating refund is issued automatically and the patient is notified.
- Prescription document generation is handled on the server side and delivered as a PDF to the patient within the consultation thread.
- The minimum withdrawal amount is a platform-wide configuration set by an admin; the initial value is 50 SAR (or local currency equivalent).
- Doctor withdrawal processing is a manual step by the admin team in this phase; automated batch processing is a later enhancement.
- Accepted file formats for consultation attachments: JPG, PNG, PDF. Maximum 5 attachments per patient message.
- Consultation history records are retained indefinitely for compliance and audit purposes.
- Expired consultations (doctor timeout) do not trigger the rating prompt — the patient receives only a refund notification.

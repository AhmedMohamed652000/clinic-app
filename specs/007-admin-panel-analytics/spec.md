# Feature Specification: Admin Panel & Analytics Dashboard

**Feature Branch**: `001-plan-phase-specs`
**Created**: 2026-04-25
**Status**: Draft
**Phase**: 7 of 7

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Admin Manages All Users (Priority: P1)

An admin opens the user management section and searches for a specific user by name, phone number, or email. They view the user's full account details including their registration history, activity log, and current status. When needed, the admin can approve a pending verification, suspend an active account, or permanently ban a user. Each action is logged with the admin's identity and a timestamp.

**Why this priority**: User management is the most fundamental admin capability. It directly controls who can use the platform and is relied on by all other oversight functions.

**Independent Test**: Can be fully tested independently by searching for users across all roles, filtering by status, performing an approval, a suspension, and a ban, and verifying each status change persists and is logged.

**Acceptance Scenarios**:

1. **Given** an admin searching for a user by name, **When** the search is submitted, **Then** matching results from all roles (patient, doctor, clinic) appear in a paginated list.
2. **Given** an admin who approves a pending doctor, **When** the approval is saved in under 3 user actions, **Then** the doctor's status changes to "approved" and the doctor is notified.
3. **Given** an admin who suspends an active clinic account, **When** the suspension is applied, **Then** the clinic loses access immediately and the action is recorded in the admin log.
4. **Given** a large user list, **When** the admin applies a role filter (e.g., "Doctors only") and a status filter (e.g., "Pending"), **Then** only matching records are shown in paginated pages.

---

### User Story 2 — Admin Oversees and Resolves Consultations (Priority: P1)

An admin opens the consultations section and filters by status, doctor, or date range. They open a disputed consultation and read the full message thread including all patient and doctor messages, attachments, and timestamps. If a refund is warranted, the admin issues it directly. If the doctor is at fault, they can be flagged or suspended.

**Why this priority**: Financial disputes are time-sensitive and legally sensitive. Fast, auditable resolution protects patients and platform credibility.

**Independent Test**: Can be tested with a pre-existing disputed consultation. Admin opens it, reviews the thread, issues a refund, and flags the doctor. Verify the refund is credited and the doctor flag count increments.

**Acceptance Scenarios**:

1. **Given** a disputed consultation, **When** an admin opens it, **Then** the full message thread, all file attachments, payment details, and the patient's dispute reason are all visible.
2. **Given** an admin who issues a manual refund, **When** the refund is confirmed, **Then** the patient is notified and the consultation status changes to "refunded".
3. **Given** an admin who tries to issue a refund on an already-refunded consultation, **When** they attempt this, **Then** the action is blocked and an explanation is shown.
4. **Given** a doctor with three expired consultations this month, **When** an admin flags them, **Then** the flag is recorded and the admin can optionally suspend the account.

---

### User Story 3 — Admin Views the Financial Dashboard (Priority: P2)

An admin opens the financial dashboard. They see total revenue for today, this week, and this month with the ability to define a custom date range. The dashboard breaks down revenue into consultation commissions, booking service fees, and clinic subscription revenue. It also shows pending doctor payouts and issued refunds. When payouts are due, the admin can trigger or schedule a payout batch.

**Why this priority**: Financial visibility is critical for business health monitoring and regulatory compliance. Payout management directly affects doctor trust.

**Independent Test**: Can be tested with a known set of transactions, verifying that totals on the dashboard match the expected values for each time period and each revenue category.

**Acceptance Scenarios**:

1. **Given** an admin who sets a custom date range, **When** the filter is applied, **Then** the dashboard shows totals only for transactions within that range.
2. **Given** a financial dashboard showing pending payouts, **When** the admin triggers a payout batch, **Then** the batch is created, marked "processing", and the relevant doctors are notified.
3. **Given** an admin who views total revenue for today, **When** the page loads, **Then** the value matches the sum of all completed consultation payments, booking fees, and subscriptions for that calendar day.

---

### User Story 4 — Admin Monitors Platform-Wide Metrics (Priority: P2)

An admin opens the metrics section and reviews the total registered user count broken down by role, the number of new registrations per day, and counts of consultations in each status (active, completed, expired, disputed). They see a ranking of top-performing doctors by rating and consultation volume, and the most active clinics by booking count.

**Why this priority**: Platform metrics inform growth and quality decisions. Without this visibility, the platform team operates blind.

**Independent Test**: Can be tested with a known dataset, verifying that user counts, registration trends, consultation status breakdowns, and top-performer rankings all match the underlying data.

**Acceptance Scenarios**:

1. **Given** an admin on the metrics screen, **When** the page loads, **Then** total user counts by role and new registrations for the past 7 days are displayed.
2. **Given** an admin viewing top doctors, **When** sorted by rating, **Then** doctors are ordered from highest to lowest average rating with their consultation count shown.
3. **Given** a consultation count breakdown, **When** displayed, **Then** the values for completed, expired, and disputed consultations are individually accurate and sum to the correct total.

---

### User Story 5 — Admin Moderates Content and Sent Messages (Priority: P3)

An admin views a list of reviews or ratings that have been flagged by users as fake or abusive. They open each item, read the content, and choose to keep or remove it. They also view reported in-app messages from job board chats or other chats and take appropriate action (remove, warn, or escalate).

**Why this priority**: Content moderation protects platform trust and prevents abuse of the rating and messaging systems.

**Independent Test**: Can be tested by flagging a review from a patient account, then confirming the admin sees it in the moderation queue, can remove it, and the removal is reflected on the relevant doctor profile.

**Acceptance Scenarios**:

1. **Given** a review flagged as abusive, **When** an admin opens the moderation queue, **Then** the review content, the flagging user, and the flagged entity are all visible.
2. **Given** an admin who removes a flagged review, **When** the removal is confirmed, **Then** the review is no longer visible on the doctor's or clinic's public profile.

---

### User Story 6 — Admin Sends Broadcast Notifications (Priority: P3)

An admin composes a push notification message and selects the target audience: all patients, all doctors, or all clinics. They send it. The message is delivered to all devices in the selected segment. The admin can see the delivery count and send timestamp in the notification history.

**Why this priority**: Broadcast notifications are the primary channel for platform announcements, feature launches, and urgent alerts to users.

**Independent Test**: Can be tested by sending a notification to a small test segment and verifying delivery on test devices, then checking the notification history for accurate delivery count.

**Acceptance Scenarios**:

1. **Given** an admin who composes a message and selects "All Doctors", **When** the notification is sent, **Then** all active doctor accounts receive the push notification.
2. **Given** an admin who sends a notification with an empty message body, **When** they attempt to send, **Then** the action is blocked and a validation error is shown.
3. **Given** a sent notification, **When** the admin views notification history, **Then** the entry shows the message text, target audience, send timestamp, and delivery count.

---

### Edge Cases

- What happens if a payout batch is triggered twice in quick succession?
- What if an admin issues a refund but the payment gateway is temporarily unavailable?
- What if a broadcast notification targets 0 users (e.g., no doctors currently registered)?
- What happens when an admin account's session expires mid-action (e.g., while reviewing a consultation)?
- What if two admins approve/reject the same pending verification simultaneously?

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Admin MUST be able to search and filter all registered users by role (patient, doctor, clinic) and by account status (active, pending, rejected, suspended, banned).
- **FR-002**: Admin MUST be able to view a user's full profile, registration details, and activity history.
- **FR-003**: Admin MUST be able to approve or reject pending verification requests; rejection MUST require a written reason.
- **FR-004**: Admin MUST be able to suspend or permanently ban any user account.
- **FR-005**: Admin MUST be able to view all consultations filtered by date range, doctor, patient, status, or dispute flag.
- **FR-006**: Admin MUST be able to open any consultation and view the full message thread, all file attachments, payment record, and any dispute notes.
- **FR-007**: Admin MUST be able to issue a manual refund for any consultation; issuing a refund on an already-refunded consultation MUST be blocked.
- **FR-008**: Admin MUST be able to flag a doctor for quality issues and optionally suspend their account.
- **FR-009**: Admin MUST be able to view a financial dashboard showing: total revenue, consultation commission, booking service fee revenue, clinic subscription revenue, pending doctor payouts, and total refunds issued — for today, this week, this month, and a custom date range.
- **FR-010**: Admin MUST be able to trigger a payout batch to initiate processing of pending doctor earnings.
- **FR-011**: Admin MUST be able to view platform metrics including: total registered users by role, new registrations per day for any selected period, consultation counts by status (active, completed, expired, disputed), top-performing doctors by rating and consultation count, and most active clinics by booking volume.
- **FR-012**: Admin MUST be able to view a moderation queue of user-flagged reviews and ratings, and remove any review from public display.
- **FR-013**: Admin MUST be able to view reported in-app messages from any chat feature and take action on them.
- **FR-014**: Admin MUST be able to compose and send a push notification broadcast to all users in a selected audience segment (all patients, all doctors, or all clinics).
- **FR-015**: All data tables in the admin panel MUST be paginated and support column-based filtering and sorting.
- **FR-016**: All admin actions (approvals, suspensions, refunds, removals) MUST be logged with the acting admin's identity and timestamp.
- **FR-017**: Admin panel MUST display correctly in Arabic; right-to-left layout MUST be fully supported.

### Key Entities

- **AdminAction**: An audit log entry — admin reference, action type, target entity type and ID, action details/notes, timestamp.
- **DisputeCase**: A consultation dispute record — consultation reference, patient who raised it, dispute reason, handling admin reference, resolution summary, case status (open, resolved, escalated).
- **PayoutBatch**: A batch of doctor earnings payouts — batch ID, list of doctor references and amounts included, total batch amount, batch status (created, processing, completed, failed), triggered by admin reference, triggered timestamp.
- **BroadcastNotification**: A record of a sent broadcast — admin reference, target audience type, message text, sent timestamp, number of targeted recipients, delivery count.
- **FinancialSummary**: A computed report view — date range, total revenue, breakdown by revenue type (consultation commission, booking fee, subscription), total refunds issued, total pending payouts. (Computed on demand, not a persisted record.)

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: An admin can locate a pending verification, review the documents, and approve or reject the account in under 3 user actions.
- **SC-002**: Financial dashboard totals for any selected time period match the actual sum of confirmed transactions with zero discrepancy.
- **SC-003**: A manually issued refund is reflected in the patient's account and consultation status within 2 minutes of the admin's action.
- **SC-004**: All data tables load and display correctly in under 3 seconds for datasets of up to 10,000 records.
- **SC-005**: Broadcast push notifications are delivered to all devices in the target audience within 5 minutes of sending.
- **SC-006**: All admin panel screens render correctly in Arabic right-to-left layout with no layout breakage or text truncation.

---

## Assumptions

- The admin panel is a web-based interface accessed from a desktop or laptop browser; it is not a mobile application.
- At least one "super-admin" role exists with full permissions; additional admin roles with restricted access may be added in a future phase but are not in scope here.
- The financial dashboard is read-only; the admin views transaction data but does not initiate payment gateway transactions directly — the payout batch triggers a downstream process.
- Subscription revenue tracking assumes the clinic subscription system from Phase 5 is fully operational; if Phase 5 is not complete, subscription revenue will show as zero.
- Content moderation relies on user-reported flags; no automated AI-based content filtering is in scope for this phase.
- Admin actions are logged for audit purposes; the log is append-only and cannot be edited or deleted by any user, including super-admins.
- The "delivery count" for broadcast notifications is the number of push notification dispatch calls made; actual device delivery is dependent on the push notification service and device availability, and may differ from the dispatch count.

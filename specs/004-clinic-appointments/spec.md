# Feature Specification: Clinic Appointment Booking

**Feature Branch**: `001-plan-phase-specs`
**Created**: 2026-04-25
**Status**: Draft
**Phase**: 4 of 7

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Patient Books a Clinic Appointment End-to-End (Priority: P1)

A patient browses the clinic list or arrives at a clinic from a doctor's profile. They select a clinic, choose a specific doctor, view available time slots, pick one, and see the appointment fee. They complete the required payment (deposit or full amount per clinic configuration). The booking is confirmed and a notification with appointment details is delivered instantly.

**Why this priority**: The end-to-end booking flow is the primary deliverable of this phase. All other stories depend on a confirmed booking existing.

**Independent Test**: Can be fully tested by completing a booking from clinic selection through payment confirmation. Delivers a confirmed appointment in the patient's history and a booking record visible to the clinic admin.

**Acceptance Scenarios**:

1. **Given** a patient selecting a doctor at a clinic, **When** they pick an available slot and complete payment, **Then** the booking is confirmed and a notification with date, time, doctor name, and clinic address is sent.
2. **Given** a slot that is taken by another patient between the patient's selection and their payment, **When** they attempt to confirm, **Then** they are told the slot is no longer available and offered the next open slot.
3. **Given** a clinic that requires full prepayment, **When** the patient selects a slot, **Then** they cannot confirm without paying the full appointment fee.
4. **Given** a clinic that offers free booking, **When** the patient selects a slot, **Then** the booking is confirmed without any payment step.

---

### User Story 2 — Patient Receives Appointment Reminders (Priority: P2)

A patient has a confirmed appointment. The system automatically sends a push notification 24 hours before the appointment time and again 1 hour before. The notifications include the doctor's name, clinic name, and appointment time.

**Why this priority**: Reminders reduce no-shows, which directly protects clinic revenue and patient health outcomes.

**Independent Test**: Can be tested by booking an appointment and verifying that two reminder notifications are delivered at the correct times.

**Acceptance Scenarios**:

1. **Given** a confirmed appointment scheduled for tomorrow, **When** the 24-hour mark arrives, **Then** a reminder notification is delivered to the patient.
2. **Given** a confirmed appointment in 1 hour, **When** the 1-hour mark arrives, **Then** a second reminder notification is delivered.
3. **Given** a cancelled appointment, **When** the reminder time arrives, **Then** no reminder is sent.

---

### User Story 3 — Patient Cancels an Appointment (Priority: P2)

A patient decides to cancel a confirmed appointment. If the cancellation is more than 2 hours before the scheduled time, a full refund is automatically issued. If the cancellation is within 2 hours, the refund follows the clinic's configured policy (typically no refund). The clinic admin sees the booking status update in their calendar.

**Why this priority**: Cancellations are a frequent real-world event. The refund policy must be enforced consistently to protect both patient trust and clinic revenue.

**Independent Test**: Can be tested by cancelling a booking at both time points (well before and within 2 hours) and verifying the correct refund outcome in each case.

**Acceptance Scenarios**:

1. **Given** a patient who cancels 3 hours before the appointment, **When** they confirm the cancellation, **Then** a full refund is issued and the booking status changes to "cancelled".
2. **Given** a patient who cancels 30 minutes before the appointment, **When** they confirm, **Then** no refund is issued (per clinic policy) and the booking is cancelled.
3. **Given** a clinic admin who cancels a patient's booking, **When** the cancellation is done, **Then** the patient always receives a full refund regardless of timing.

---

### User Story 4 — Clinic Admin Manages Schedule and Views Calendar (Priority: P2)

A clinic admin sets up working hours for each doctor — choosing which days the doctor is available, the opening and closing times, and the appointment slot duration. They can block specific dates for holidays. They view all upcoming bookings in a calendar view organized by doctor and date.

**Why this priority**: The schedule drives slot availability. Without correct schedule configuration, no valid booking slots exist.

**Independent Test**: Can be tested by configuring a schedule, blocking a date, and verifying that the patient-facing slot picker reflects the correct openings and no slots appear on blocked dates.

**Acceptance Scenarios**:

1. **Given** a clinic admin who sets a doctor's schedule to Tuesday/Thursday, 10:00–16:00, 30-minute slots, **When** a patient views that doctor's availability, **Then** only Tuesday/Thursday slots in that window appear.
2. **Given** a clinic admin who blocks December 25, **When** a patient tries to book on that date, **Then** no slots are available and a "no availability" message is shown.
3. **Given** a clinic admin viewing the calendar, **When** several bookings exist across multiple doctors, **Then** each booking appears on the correct date and time with doctor and patient name.

---

### User Story 5 — Waiting List Fills an Opened Slot (Priority: P3)

All slots for a specific doctor on a given date are fully booked. A patient joins the waiting list for that slot. Later, another patient cancels. The system automatically identifies the first patient on the waiting list and notifies them that a slot has opened. The waiting list patient has a limited window to confirm the booking.

**Why this priority**: The waiting list maximises clinic revenue by filling cancellations and improves patient access. It also reduces manual clinic admin work.

**Independent Test**: Can be tested by filling a slot, having a second patient join the waiting list, cancelling the original booking, and confirming the waiting list patient receives a notification.

**Acceptance Scenarios**:

1. **Given** all slots full for a doctor on a given day, **When** a patient views availability, **Then** they see a "Join Waiting List" option and no bookable slots.
2. **Given** a patient on the waiting list, **When** a cancellation opens a slot, **Then** the first patient on the list receives a notification within 2 minutes.
3. **Given** a waiting list patient who does not respond within the confirmation window, **When** the window expires, **Then** the next patient on the waiting list is notified.

---

### Edge Cases

- What happens if two patients try to book the exact same slot simultaneously?
- What happens if a doctor leaves the clinic after a booking is confirmed but before the appointment date?
- What happens if the clinic updates the slot duration after bookings are already confirmed for that schedule?
- What happens if a waiting list patient has already booked elsewhere when a slot opens?
- What if the clinic sets a 0-SAR appointment fee with a "deposit required" policy?

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display available appointment slots for a specific doctor at a specific clinic, derived from the clinic's configured schedule.
- **FR-002**: Patient MUST be able to select an available slot, view the appointment fee, and confirm the booking.
- **FR-003**: Clinic MUST be able to configure the payment type for bookings: free booking (no payment), deposit, or full prepayment.
- **FR-004**: System MUST confirm the booking and send a notification to the patient with appointment date, time, doctor name, and clinic address immediately after confirmation.
- **FR-005**: System MUST send a reminder notification to the patient 24 hours before the appointment.
- **FR-006**: System MUST send a second reminder notification to the patient 1 hour before the appointment.
- **FR-007**: Patient MUST be able to cancel a confirmed booking; if cancelled more than 2 hours before the appointment, a full refund MUST be issued automatically.
- **FR-008**: If a patient cancels within 2 hours of the appointment, the refund MUST follow the clinic's configured cancellation policy.
- **FR-009**: When a clinic admin cancels a booking, the patient MUST receive a full refund in all cases.
- **FR-010**: Clinic admin MUST be able to set working days and opening/closing hours per doctor.
- **FR-011**: Clinic admin MUST be able to configure appointment slot duration per doctor: 15, 30, 45, or 60 minutes.
- **FR-012**: Clinic admin MUST be able to block specific calendar dates or date ranges (e.g., public holidays, vacations).
- **FR-013**: Clinic admin MUST be able to view all upcoming and past bookings in a calendar view organised by doctor and date.
- **FR-014**: When all slots for a doctor on a given day are fully booked, patients MUST be able to join a waiting list for that doctor and date.
- **FR-015**: System MUST automatically notify the first patient on the waiting list within 2 minutes of a slot becoming available through a cancellation.
- **FR-016**: After an appointment is completed, patient MUST be prompted to rate the clinic on a 1–5 star scale.
- **FR-017**: All user-facing screens MUST be displayed in Arabic and support right-to-left layout.

### Key Entities

- **Appointment**: Core booking record — patient, clinic, doctor, slot date and time, slot duration, booking status, payment type, amount paid, confirmation timestamp.
- **AppointmentStatus**: Enumerated states — pending confirmation, confirmed, completed, cancelled by patient, cancelled by clinic.
- **ClinicSchedule**: Per-doctor schedule configuration — clinic, doctor, working days, opening/closing times per day, slot duration, list of blocked dates.
- **WaitingListEntry**: A patient's position in a waiting list for a specific doctor/date — patient reference, position number, notified flag, join timestamp.
- **AppointmentReminder**: Scheduled reminder record — appointment reference, reminder type (24h or 1h), sent flag, scheduled send time.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A patient can complete a booking from clinic selection to confirmed notification in under 5 minutes.
- **SC-002**: Appointment reminder notifications are delivered within 5 minutes of their scheduled trigger time.
- **SC-003**: The first waiting list patient receives a slot-opened notification within 2 minutes of a cancellation.
- **SC-004**: The clinic calendar view accurately shows all confirmed bookings with no double-bookings in 100% of test scenarios.
- **SC-005**: The cancellation refund policy is enforced correctly — full refund when eligible, no refund when not — in 100% of tested scenarios.
- **SC-006**: All user-facing screens render correctly in Arabic right-to-left layout with no text overflow or layout breakage.

---

## Assumptions

- Slot duration is uniform per doctor per clinic; a doctor cannot have different slot lengths on different days within the same clinic in this phase.
- The clinic calendar view shows bookings for one week at a time by default, with navigation to other weeks.
- Platform service fee per booking is configured by an admin on a per-clinic or per-tier basis; this configuration is out of scope for this phase but the data structure must support it.
- Appointment ratings feed into the clinic's overall rating average, which is displayed on the clinic profile page (Phase 2 placeholder).
- The waiting list confirmation window (how long a patient has to accept the opened slot) is set to 30 minutes by default; this is a platform-wide configuration.
- A clinic can cancel a booking for any reason; the patient always receives a full refund. No dispute process is required for clinic-initiated cancellations.
- This phase covers in-person clinic appointments only. Remote/telemedicine clinic appointments are out of scope.

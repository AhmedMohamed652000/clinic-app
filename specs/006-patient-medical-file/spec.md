# Feature Specification: Patient Medical File & Smart Features

**Feature Branch**: `001-plan-phase-specs`
**Created**: 2026-04-25
**Status**: Draft
**Phase**: 6 of 7

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Patient Builds Their Medical File (Priority: P1)

A patient opens their health record section and fills in their personal health information: chronic conditions, known allergies (medications and food), current medications with dosage, past surgeries, and blood type. They upload one or more lab result files. The record is saved privately and accessible only to the patient until they choose to share it.

**Why this priority**: The medical file is the foundation of all smart features in this phase. Without populated data, sharing, prescriptions, and referrals lose their value.

**Independent Test**: Can be fully tested by entering data into each section, uploading a lab result, saving, and confirming the data persists and is visible only when logged in as that patient.

**Acceptance Scenarios**:

1. **Given** a patient who fills in their blood type and adds two chronic conditions, **When** they save, **Then** the data is stored and displayed correctly when they return to the health record screen.
2. **Given** a patient who uploads a lab result PDF, **When** the upload completes, **Then** the file appears in their lab results list with the upload date.
3. **Given** a patient who logs in as a different patient or as a doctor, **When** they attempt to access the first patient's file, **Then** access is denied — the file is private.

---

### User Story 2 — Patient Shares Medical File with Doctor During Consultation (Priority: P1)

During an active consultation, a patient can share their medical file with the treating doctor in a single action. The doctor can then see the full file — conditions, allergies, medications, lab results — within the consultation view. The patient can revoke sharing at any time.

**Why this priority**: Sharing the medical context directly with a doctor improves care quality and is a key differentiator for the platform. It must be effortless.

**Independent Test**: Can be tested by sharing a populated medical file during a consultation and confirming the doctor can view it. Separately verify the doctor cannot access the file outside of a shared consultation.

**Acceptance Scenarios**:

1. **Given** an active consultation, **When** the patient taps "Share my medical file", **Then** the doctor can view all sections of the file within the consultation.
2. **Given** a shared medical file, **When** the patient revokes sharing, **Then** the doctor can no longer access the file content.
3. **Given** a patient with an empty medical file, **When** they attempt to share, **Then** the system warns them the file has no data and asks to confirm before sharing.

---

### User Story 3 — Patient Sets Up and Uses Medication Reminders (Priority: P2)

A patient adds a medication to their reminders with a name, dosage, frequency (e.g., once daily), start date, and optional end date. The app sends push notifications at the scheduled times. The patient opens each notification and marks the dose as taken or skipped. The reminder history is visible in the medication detail screen.

**Why this priority**: Medication adherence is a public health priority and a strong patient retention feature. Reminders encourage daily app engagement.

**Independent Test**: Can be tested by adding a medication with a near-future reminder time, confirming the notification fires, and marking the dose as taken. Verify the log records the action.

**Acceptance Scenarios**:

1. **Given** a patient who adds a medication reminder at 08:00 daily, **When** 08:00 arrives, **Then** a push notification is delivered prompting the patient to log their dose.
2. **Given** a patient who taps the reminder notification, **When** they mark the dose as "taken", **Then** the dose log records the action with a timestamp.
3. **Given** a patient whose medication end date has passed, **When** that date is reached, **Then** no further reminders are sent for that medication.

---

### User Story 4 — Doctor Issues an Electronic Prescription (Priority: P2)

A doctor in an active consultation generates a prescription for the patient. They add one or more medications with dosage and instructions. The system produces a signed prescription document containing the doctor's name and license number, the patient's name, all medications and instructions, the date, and a unique QR code. The patient receives the prescription as a downloadable file within the consultation.

**Why this priority**: Electronic prescriptions formalise the doctor's output, reduce medication errors, and create a paper trail. They also make the consultation tangibly valuable beyond a text chat.

**Independent Test**: Can be tested by generating a prescription in a consultation and confirming the patient can download the file. Verify all required fields appear and the QR code is unique per prescription.

**Acceptance Scenarios**:

1. **Given** a doctor in an active consultation, **When** they generate a prescription with two medications and submit, **Then** the patient receives a downloadable prescription file in the consultation thread.
2. **Given** a generated prescription, **When** the patient opens it, **Then** the document contains: doctor name and license, patient name, both medications with dosage and instructions, date, and a unique QR code.
3. **Given** a doctor who attempts to generate a prescription for a closed consultation, **When** they try, **Then** the action is blocked.

---

### User Story 5 — Patient Uses Emergency Consultation Button (Priority: P2)

A patient who needs urgent medical advice taps the emergency button on their home screen. The system immediately searches for the first available online doctor and connects the patient to a new urgent consultation at a premium fee (1.5x to 2x the doctor's standard rate). If no doctor is available within 2 minutes, a fallback message is shown with alternative options (e.g., contact a helpline).

**Why this priority**: The emergency feature addresses high-urgency healthcare needs and commands a premium that improves platform revenue per consultation.

**Independent Test**: Can be tested when at least one doctor is online and available, verifying that tapping the button creates a consultation and notifies the doctor. Also test the fallback when no doctors are online.

**Acceptance Scenarios**:

1. **Given** at least one doctor is online and available, **When** a patient taps the emergency button, **Then** the system assigns the first available doctor and a consultation is created at the premium rate.
2. **Given** no doctors are available, **When** the patient taps the emergency button and waits 2 minutes, **Then** a fallback message with alternative contact options is shown.
3. **Given** an emergency consultation is created, **When** the patient views the consultation, **Then** the premium fee is clearly shown before the patient is charged.

---

### User Story 6 — Doctor Creates an Internal Referral (Priority: P3)

A doctor treating a patient decides the case requires a different specialist on the platform. They create a referral from within the consultation, selecting the target doctor and writing brief case notes. The patient is asked to consent to sharing case notes. With consent, the referred doctor is notified. The referred doctor can accept the case at a discounted fee. Both doctors can view the shared case notes.

**Why this priority**: Referrals create a collaborative care network within the platform, increasing value for both doctors and patients and differentiating the platform from a simple consultation service.

**Independent Test**: Can be tested by creating a referral, gaining patient consent, having the referred doctor accept, and verifying both doctors can see the shared notes. Also test that notes are not visible without patient consent.

**Acceptance Scenarios**:

1. **Given** a referring doctor who selects a target doctor and writes case notes, **When** they submit the referral, **Then** the patient receives a consent prompt.
2. **Given** a patient who approves consent, **When** consent is granted, **Then** the referred doctor receives a notification with the referral details.
3. **Given** a referred doctor who accepts, **When** they view the case, **Then** they can see the referring doctor's case notes.
4. **Given** a patient who denies consent, **When** consent is denied, **Then** the referred doctor receives no notification and no case notes are shared.

---

### Edge Cases

- What happens when no doctors are online at any time of day for the emergency button?
- What happens if a prescription is generated and the patient's name changes on their profile after the fact?
- What if a patient uploads a lab result that is password-protected or corrupted?
- What happens if a medication reminder fires while the patient's device is in battery-saving mode?
- What if both doctors in a referral are from the same account (self-referral)?

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Patient MUST be able to create and maintain a personal medical file containing: chronic conditions, known allergies, current medications with dosage, past surgeries, blood type, and uploaded lab result files.
- **FR-002**: Patient medical file MUST be private by default; no user other than the patient can access it unless the patient explicitly shares it.
- **FR-003**: During an active consultation, patient MUST be able to share their complete medical file with the treating doctor in one action.
- **FR-004**: Patient MUST be able to revoke medical file sharing from an active consultation at any time.
- **FR-005**: Patient MUST be able to add medication reminders with: medication name, dosage, frequency, start date, and optional end date.
- **FR-006**: System MUST deliver a push notification for each medication reminder at the scheduled time.
- **FR-007**: Patient MUST be able to mark each medication dose as "taken" or "skipped" from the notification or from the app.
- **FR-008**: System MUST record a timestamped log entry for each dose action (taken or skipped).
- **FR-009**: Doctor MUST be able to generate an electronic prescription from within an active consultation containing: doctor full name and license number, patient full name, list of medications with dosage and instructions, issue date, and a unique QR code.
- **FR-010**: Generated prescription MUST be delivered to the patient as a downloadable document in the consultation thread.
- **FR-011**: Patient MUST be able to upload lab result files to their medical file; accepted formats are PDF and image files.
- **FR-012**: During a consultation, patient MUST be able to attach lab result files directly from their medical file without re-uploading.
- **FR-013**: Patient home screen MUST include an emergency consultation button that connects the patient to the first available online doctor at a premium rate of 1.5x to 2x the doctor's standard consultation fee.
- **FR-014**: System MUST show the premium fee to the patient before charging them for an emergency consultation.
- **FR-015**: If no doctor is available within 2 minutes of the emergency button being tapped, the system MUST display a fallback message with alternative help options.
- **FR-016**: Doctor MUST be able to create an internal referral to another platform doctor, including written case notes, from within an active consultation.
- **FR-017**: System MUST request explicit patient consent before sharing case notes with the referred doctor.
- **FR-018**: Referred doctor MUST receive a notification and be able to accept the case at a discounted fee only after patient consent is granted.
- **FR-019**: Both referring and referred doctors MUST be able to view shared case notes once the referral is accepted with patient consent.
- **FR-020**: All patient medical file data MUST be protected using strong encryption when stored.
- **FR-021**: All user-facing screens MUST be displayed in Arabic and support right-to-left layout.

### Key Entities

- **MedicalFile**: The patient's health record — patient reference, chronic conditions list, allergies list, medications list, past surgeries list, blood type, lab results list, linked past consultation references.
- **Medication**: A medication entry in the medical file — patient reference, name, dosage, frequency, start date, end date, dose log entries.
- **MedicationDoseLog**: A single logged dose event — medication reference, scheduled time, actual log time, status (taken, skipped, missed).
- **Prescription**: A formal prescription document — consultation reference, doctor reference, patient reference, medications and instructions, issue date, digital signature, document file reference, unique QR code value.
- **LabResult**: An uploaded lab result file — patient reference, file storage reference, upload date, patient-provided description.
- **Referral**: An inter-doctor referral — referring doctor reference, referred doctor reference, patient reference, case notes, patient consent flag, referral status (pending consent, pending acceptance, accepted, rejected, expired), discount fee agreed.
- **EmergencyConsultation**: An urgent consultation triggered by the emergency button — patient reference, assigned doctor reference, assignment timestamp, start timestamp, premium fee charged, status.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A patient can complete building a full medical file (all sections filled, one lab result uploaded) in under 10 minutes.
- **SC-002**: A doctor can generate a prescription within an active consultation in under 2 minutes.
- **SC-003**: Medication reminder notifications are delivered within 2 minutes of the scheduled reminder time.
- **SC-004**: The emergency button connects a patient to an available doctor within 2 minutes, or a fallback message is shown if no doctor is available.
- **SC-005**: Patient medical file data is inaccessible to other users in all tested scenarios where sharing has not been granted.
- **SC-006**: A patient can share their medical file with a doctor in a single tap taking under 5 seconds.
- **SC-007**: All user-facing screens render correctly in Arabic right-to-left layout with no text overflow or layout breakage.

---

## Assumptions

- Lab result files accepted: PDF, JPG, PNG. Maximum file size: 20 MB per file. There is no limit on the number of lab results stored.
- Emergency consultations in this phase are text-only; voice and video calls are out of scope.
- The referral discount percentage (what the referred doctor receives) is configurable by the platform admin, not by individual doctors.
- Medical file encryption uses industry-standard encryption at rest; specific key management is an implementation detail resolved in the planning phase.
- Prescription documents are generated server-side; the patient receives a download link within the consultation thread.
- A doctor cannot refer a patient to themselves (self-referral is blocked by the system).
- The emergency button is available only to patients with a verified and active account; patients with unpaid pending consultations may be blocked from starting a new one (configurable platform policy).
- Medication reminders fire even when the app is closed, relying on the device's push notification system.

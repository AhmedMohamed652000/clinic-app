# Feature Specification: Doctor & Clinic Profiles

**Feature Branch**: `001-plan-phase-specs`
**Created**: 2026-04-25
**Status**: Draft
**Phase**: 2 of 7

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Patient Discovers and Filters Doctors (Priority: P1)

A patient opens the browse screen and sees a list of verified doctors. They apply filters for medical specialty, language, consultation fee range, and availability status. The list updates to show only matching doctors. The patient taps a doctor to open their full profile and review all details before deciding to consult.

**Why this priority**: Patient discovery is the primary entry point to the platform's value. If patients cannot find and evaluate doctors, no consultations happen.

**Independent Test**: Can be fully tested by browsing the doctor list, applying each filter type in isolation and in combination, and verifying that only verified doctors matching the criteria appear. Delivers a browseable directory.

**Acceptance Scenarios**:

1. **Given** a patient on the browse screen, **When** they filter by a specific specialty (e.g., Dermatology), **Then** only verified doctors with that specialty are shown and unverified doctors are absent.
2. **Given** filtered results, **When** the patient applies an additional availability filter (e.g., "Available Now"), **Then** only doctors matching both criteria appear.
3. **Given** a specialty with no available doctors, **When** the filter is applied, **Then** an empty-state message is shown rather than an error.
4. **Given** a search term typed in the search bar, **When** the patient types a doctor name or specialty keyword, **Then** matching results appear within 1 second.

---

### User Story 2 — Patient Views Full Doctor Profile (Priority: P1)

A patient taps a doctor card and opens their full profile. They can read the doctor's name in Arabic and English, see their specialty and sub-specialty, years of experience, spoken languages, consultation fee, availability status, verification badge, bio, and current rating. The patient has enough information to decide whether to start a consultation.

**Why this priority**: The profile is the conversion point — it must display completely and accurately for patients to trust and engage.

**Independent Test**: Can be tested by opening any verified doctor's profile and checking that all defined fields are present and correctly populated. Rating placeholder is shown for new doctors.

**Acceptance Scenarios**:

1. **Given** a verified doctor with a complete profile, **When** a patient opens their profile, **Then** all fields (name, specialty, sub-specialty, experience, languages, fee, availability, badge, bio, rating) are visible.
2. **Given** a doctor with no ratings yet, **When** a patient views the profile, **Then** a "no ratings yet" placeholder is shown rather than an empty score.
3. **Given** an unverified doctor, **When** a patient attempts to reach their profile via direct link, **Then** the profile is not accessible and the patient is redirected.

---

### User Story 3 — Patient Browses and Views Clinic Profiles (Priority: P2)

A patient browses the clinic directory. They can filter by working hours and view a clinic's full profile including name, address, a map link, working schedule, the list of doctors associated with the clinic, and the verification badge.

**Why this priority**: Clinics are the second discovery path. Patients using clinics need schedule and location information to make booking decisions (Phase 4).

**Independent Test**: Can be tested independently by browsing the clinic list, filtering by hours, and opening a clinic profile to verify all fields are shown. No booking needed.

**Acceptance Scenarios**:

1. **Given** a patient filtering clinics by working hours, **When** a filter is applied, **Then** only clinics with a schedule matching that criterion are shown.
2. **Given** a verified clinic with a full profile, **When** a patient opens it, **Then** name, logo, address, map link, working schedule, and linked doctors are all visible.
3. **Given** a clinic with no linked doctors yet, **When** a patient views the profile, **Then** a placeholder is shown for the doctors section.

---

### User Story 4 — Doctor Edits Their Profile (Priority: P2)

A logged-in doctor opens their profile settings and updates any combination of fields: name, photo, specialty, sub-specialty, experience, languages, bio. They save the changes and the updated profile is visible to patients immediately.

**Why this priority**: Doctors need to keep profiles current for patients to find them and for the platform to function correctly.

**Independent Test**: Can be tested by updating each field type and confirming the patient-facing profile reflects the changes within 1 minute.

**Acceptance Scenarios**:

1. **Given** a logged-in doctor, **When** they update their bio and save, **Then** the new bio appears on their public profile within 1 minute.
2. **Given** a doctor uploading a new profile photo, **When** the upload completes and they save, **Then** the new photo is displayed on the public profile.
3. **Given** a doctor leaving a required field blank, **When** they attempt to save, **Then** the save is blocked and the required field is highlighted.

---

### User Story 5 — Doctor Sets Fee and Toggles Availability (Priority: P2)

A doctor sets their consultation fee from their profile settings. They can also toggle their availability status between "Available Now", "Busy", and "Off". These changes immediately affect how the doctor appears in patient searches and on their profile.

**Why this priority**: Fee and availability are real-time signals patients rely on. Incorrect availability wastes patient effort and damages trust.

**Independent Test**: Can be tested by changing fee and availability, then confirming the updated values appear instantly in both the doctor's own view and in the patient-facing browse screen.

**Acceptance Scenarios**:

1. **Given** a doctor who changes their consultation fee, **When** the change is saved, **Then** the new fee is immediately shown on their public profile and in search results.
2. **Given** a doctor who sets status to "Off", **When** a patient browses with "Available Now" filter, **Then** that doctor does not appear in results.
3. **Given** a doctor who sets status to "Available Now", **When** a patient searches without availability filter, **Then** the badge "Available Now" is visible on the doctor's card.

---

### User Story 6 — Clinic Admin Manages Working Hours (Priority: P3)

A clinic admin opens the schedule settings and configures working days and hours. They set opening and closing times per day of the week and mark any days as closed. Changes are saved and reflected immediately in the clinic's public profile.

**Why this priority**: Accurate schedules are required before appointment booking (Phase 4) and are also shown on the clinic profile for patient planning.

**Independent Test**: Can be tested by setting a custom schedule, saving it, and verifying the clinic profile shows the correct hours per day.

**Acceptance Scenarios**:

1. **Given** a clinic admin who sets Tuesday as closed, **When** the schedule is saved, **Then** the clinic profile shows Tuesday as "Closed".
2. **Given** a clinic admin who sets Saturday hours to 09:00–13:00, **When** saved, **Then** the clinic profile and any downstream calendar display the correct Saturday hours.

---

### Edge Cases

- What happens when a doctor profile has no photo set (default avatar)?
- What if a patient applies multiple filters that together yield zero results?
- What happens when a doctor who is linked to a clinic sets their availability to "Off"?
- How is the specialty list managed if a specialty label changes after doctors have been registered under it?
- What if a doctor's account is suspended after they appear in a patient's search results but before the patient opens the profile?

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display only admin-verified doctors in all patient-facing browse and search results.
- **FR-002**: System MUST allow patients to filter the doctor list by specialty, language, fee range, and availability status; filters MUST be combinable.
- **FR-003**: System MUST allow patients to search doctors by name or specialty keyword with results updating within 1 second.
- **FR-004**: Doctor profile page MUST display: full name (Arabic and English), profile photo, specialty, sub-specialty, years of experience, languages spoken, bio, consultation fee, availability status, verification badge, rating average, and review count.
- **FR-005**: Doctor profile MUST show average response time; this field displays a placeholder until Phase 3 generates real data.
- **FR-006**: System MUST allow patients to browse the clinic directory with filters for location and working hours.
- **FR-007**: Clinic profile page MUST display: name (Arabic and English), logo, address, map link, working schedule per day of week, list of linked verified doctors, verification badge, rating average, and review count.
- **FR-008**: Doctor MUST be able to edit all fields on their own profile.
- **FR-009**: Doctor MUST be able to set and update their consultation fee; the new fee MUST be reflected on the public profile within 1 minute.
- **FR-010**: Doctor MUST be able to toggle availability status among: Available Now, Busy, and Off; this change MUST be reflected immediately in search results.
- **FR-011**: Clinic MUST be able to edit all fields on their own profile including logo and address.
- **FR-012**: Clinic MUST be able to set working hours per day of the week, including marking specific days as closed.
- **FR-013**: All user-facing screens MUST be displayed in Arabic and support right-to-left layout.

### Key Entities

- **DoctorProfile**: All public-facing fields for a verified doctor — name (both languages), photo reference, specialty, sub-specialty, years of experience, languages, bio, consultation fee, availability status, average response time, rating average, review count.
- **ClinicProfile**: All public-facing fields for a verified clinic — name (both languages), logo reference, address, map URL, working schedule, linked doctor list, rating average, review count.
- **WorkingSchedule**: Per-day schedule entry — clinic reference, day of week, opening time, closing time, closed flag.
- **Specialty**: A predefined catalogue entry — label in Arabic and English; used for filtering and profile display.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A patient can locate a verified doctor matching a specialty filter within 30 seconds of opening the browse screen.
- **SC-002**: A doctor's full profile page loads completely within 2 seconds.
- **SC-003**: Unverified and suspended doctors are absent from all patient search and browse results in 100% of tested scenarios.
- **SC-004**: Profile updates made by a doctor are visible to patients within 1 minute of saving.
- **SC-005**: Clinic working schedule displayed on the profile accurately reflects the configured hours in 100% of tested scenarios.
- **SC-006**: All user-facing screens render correctly in Arabic right-to-left layout with no text overflow or layout breakage.

---

## Assumptions

- The specialty catalogue is defined by the platform team before launch and includes at minimum: General Practice, Dermatology, Psychiatry, Nutrition, Cardiology, Pediatrics, and Orthopedics.
- Average response time on the doctor profile is computed from Phase 3 consultation data; during Phase 2 it displays as a dash or "Not yet available".
- Rating and review count on both doctor and clinic profiles display as zero or a placeholder until Phase 3 and Phase 4 generate the first ratings.
- A single doctor can be linked to multiple clinics simultaneously; the relationship is many-to-many.
- The map link on a clinic profile is a plain URL entered manually by the clinic admin; no map rendering is required in Phase 2.
- Profile photos and logos are uploaded as images and stored centrally; the display URL is referenced from the profile record.

# Medical Platform Specification
# منصة الربط بين المرضى والأطباء والمستوصفات

## PHASE 1 — Foundation & Authentication

```
/specify

Phase: 1 — Foundation & Authentication

Goal:
Set up the full project structure and implement authentication for all three user roles: Patient, Doctor, and Clinic. This is the foundation everything else builds on.

Users and roles:
- Patient: registers via phone number (OTP). Provides name, age, gender.
- Doctor: registers via email. Provides name, specialty, national ID, license number, license document (file upload). Account starts as "pending" until admin approves.
- Clinic: registers via email. Provides clinic name, address, commercial registration number, official documents (file upload). Account starts as "pending" until admin approves.
- Admin: manually created in database. No public registration for admins.

Features in scope:
1. Patient registration and login (phone OTP via Firebase)
2. Doctor registration (email + password) with document upload — account locked until verified
3. Clinic registration (email + password) with document upload — account locked until verified
4. Admin login (email + password)
5. Admin panel screen: pending verification queue (list of pending doctors and clinics with their uploaded documents). Admin can approve or reject with a reason.
6. Approved accounts receive push notification / email saying they are approved and can now use the platform.
7. Rejected accounts receive the rejection reason and can re-submit corrected documents.
8. JWT-based session management after login. Refresh tokens stored securely.
9. Role-based route guards: Patient routes, Doctor routes, Clinic routes, Admin routes are all isolated.

Out of scope for this phase:
- Consultations, appointments, jobs — those are later phases
- Payment integration
- Chat system

Acceptance criteria:
- A new patient can register and log in successfully
- A new doctor can register, upload documents, and sees a "pending approval" screen
- Admin can log in, see the verification queue, approve a doctor, and the doctor can then access the full app
- All screens are Arabic RTL
- All user data is stored in MongoDB with correct role field
```

---

## PHASE 2 — Doctor & Clinic Profiles

```
/specify

Phase: 2 — Doctor & Clinic Profiles

Goal:
Build complete profile management for Doctors and Clinics. Patients should be able to browse and search verified doctors and clinics.

Doctor profile fields:
- Full name (Arabic + English)
- Profile photo
- Medical specialty (from predefined list, e.g. General, Dermatology, Psychiatry, Nutrition, etc.)
- Sub-specialty (free text)
- Years of experience
- Languages spoken
- Bio (Arabic)
- Consultation fee (set by the doctor)
- Average response time (auto-calculated after phase 3)
- Verification badge (shown if admin-approved)
- Rating and review count (shown after phase 3)
- Availability status: Available Now / Busy / Off

Clinic profile fields:
- Clinic name (Arabic + English)
- Logo / cover photo
- Address + Google Maps link
- Working days and hours (per day schedule)
- List of doctors working at the clinic (linked doctor accounts)
- Verification badge
- Rating and review count (shown after phase 4)

Patient-facing features:
- Browse doctors: filterable by specialty, language, fee range, availability
- Search doctors by name or specialty
- Browse clinics: filterable by location, working hours
- View full doctor profile
- View full clinic profile

Doctor-facing features:
- Edit own profile
- Set consultation fee
- Toggle availability status

Clinic-facing features:
- Edit own profile
- Manage working hours schedule

Out of scope for this phase:
- Consultations and bookings
- Job postings
- Chat

Acceptance criteria:
- Patient can search and find a doctor by specialty
- Doctor profile page shows all fields including verified badge
- Clinic shows correct working hours
- All UI is Arabic RTL
- Unverified doctors do not appear in patient search results
```

---

## PHASE 3 — Paid Medical Consultations

```
/specify

Phase: 3 — Paid Medical Consultations

Goal:
Implement the core consultation flow between patients and doctors. Payment must happen before the doctor sees the question. This is the primary revenue driver of the platform.

Consultation flow (strict order):
1. Patient opens a doctor's profile and taps "Start Consultation"
2. Patient sees the doctor's fee, specialty, and average response time
3. Patient writes their question (text, can attach images or lab result files)
4. Patient is shown the price and must complete payment before sending
5. After payment succeeds, the consultation is created and the doctor is notified
6. Doctor has a maximum of 24 hours to respond (doctor sets their own window: 6h / 12h / 24h)
7. If doctor does not respond within their window, payment is automatically refunded to patient and consultation is marked "expired"
8. Doctor responds with text, can also send a prescription document
9. After doctor responds, patient can send 2 follow-up messages within 72 hours at no extra charge
10. After 72 hours or 2 follow-up messages (whichever comes first), the consultation is closed
11. After consultation closes, patient is prompted to rate the doctor (1–5 stars + optional comment)

Consultation types:
- Text only
- Text + image attachments (e.g. skin photos, lab results — max 5 images, max 10MB each)
- Future phase: voice/video calls (out of scope now)

Payment model:
- Patient pays full consultation fee upfront
- Platform takes 15% commission
- Doctor receives 85% after consultation is completed
- Doctor can withdraw earnings weekly or monthly (minimum withdrawal: 50 SAR or local currency)
- Refund triggers: doctor does not respond in time, or admin-approved dispute

Admin oversight:
- Admin can view all consultations
- Admin can handle refund disputes
- Admin can suspend a doctor who has too many expired/disputed consultations

Acceptance criteria:
- Patient cannot send consultation without paying
- Doctor receives notification and can see consultation only after payment confirmed
- Auto-refund fires correctly if doctor misses the deadline
- Commission is correctly split on consultation completion
- Rating appears on doctor profile after patient submits it
- All screens Arabic RTL
```

---

## PHASE 4 — Clinic Appointment Booking

```
/specify

Phase: 4 — Clinic Appointment Booking

Goal:
Allow patients to book appointments at clinics. Clinics manage their schedule and doctors' availability. This creates a direct revenue channel for clinics.

Booking flow:
1. Patient browses clinics or finds a clinic from a doctor's profile
2. Patient selects a clinic, then selects a specific doctor within the clinic
3. Patient sees the available time slots for that doctor (based on clinic schedule)
4. Patient selects a slot and sees the appointment fee
5. Patient can optionally pay a booking deposit (clinic configures: free booking / deposit / full prepayment)
6. Booking is confirmed. Patient receives notification with appointment details.
7. Platform sends a reminder notification 24 hours before and 1 hour before the appointment
8. After the appointment, patient is prompted to rate the clinic

Clinic schedule management:
- Clinic admin sets working days and hours per doctor
- Clinic can set appointment slot duration (15 / 30 / 45 / 60 minutes)
- Clinic can block specific dates or times (holidays, vacations)
- Clinic sees all upcoming bookings in a calendar view

Cancellation policy:
- Patient can cancel up to 2 hours before appointment for full refund
- Cancellations less than 2 hours before: no refund (clinic configures this)
- Clinic can cancel and patient is always refunded

Platform revenue from bookings:
- Platform takes a flat service fee per booking (configured per clinic tier)
- Or platform takes a % of the booking amount (configurable)

Waiting list feature:
- If all slots are full, patient can join a waiting list
- If a cancellation opens a slot, first patient on waiting list is notified automatically

Acceptance criteria:
- Patient can complete a booking end to end
- Clinic admin can see all bookings in calendar view
- Reminder notifications fire correctly
- Waiting list notifies correctly on cancellation
- All screens Arabic RTL
```

---

## PHASE 5 — Doctor Job Board (Clinic ↔ Doctor Hiring)

```
/specify

Phase: 5 — Doctor Job Board

Goal:
Allow clinics to post job openings and doctors to apply. This creates a B2B marketplace layer on top of the platform and is a monetization opportunity via subscription or per-post fees.

Clinic side:
- Clinic can post a job listing with: specialty required, job type (full-time / part-time / temporary / locum), schedule, compensation range, required experience, application deadline
- Job posts are visible only to verified doctors
- Clinic can view all applicants for each job
- Clinic can mark applicants as: Under Review / Shortlisted / Rejected / Hired
- Clinic can message applicants through in-app chat (Socket.IO)

Doctor side:
- Doctor sees a job board filtered by their specialty
- Doctor can view job details and apply with a tap (uses their existing profile as CV)
- Doctor can optionally add a cover note when applying
- Doctor is notified when their application status changes

Pricing model for job postings:
- Included in the clinic's paid subscription tier (Basic: 3 posts/month, Pro: unlimited)
- OR pay-per-post: fixed fee per listing (admin configures)

Verification gate:
- Only verified doctors (admin-approved) appear in applicant list
- Only verified clinics can post jobs

Out of scope:
- External job listings or integration with LinkedIn
- Non-doctor roles (nurses, technicians) — future phase

Acceptance criteria:
- Clinic can post a job and it appears in the doctor job board
- Doctor can apply and clinic sees the application
- Status change notifications work
- In-app messaging works between clinic and doctor applicant
- All screens Arabic RTL
```

---

## PHASE 6 — Patient Medical File & Advanced Features

```
/specify

Phase: 6 — Patient Medical File & Smart Features

Goal:
Build the unified patient medical record, medication reminders, electronic prescription, and lab result sharing. These features create long-term retention and make the platform genuinely useful as a health companion.

Patient Medical File:
- Patient maintains a personal health record containing:
  - Chronic conditions
  - Known allergies (medications, food)
  - Current medications with dosage
  - Past surgeries
  - Blood type
  - Uploaded lab results (PDF or image)
  - History of past consultations on the platform
- Patient can share their file with any doctor in a single tap when starting a consultation
- File is private by default — doctor only sees it if patient explicitly shares

Medication Reminders:
- Patient can add medications with: name, dosage, frequency, start date, end date
- App sends push notification reminders at the scheduled times
- Patient can mark a dose as taken or skipped

Electronic Prescription:
- Doctor can issue a digital prescription from within a consultation
- Prescription contains: doctor name + license number, patient name, medication list, dosage, instructions, date, digital signature
- Patient receives the prescription as a PDF inside the app
- Prescription has a unique QR code (future: partner pharmacies can scan it)

Lab Result Sharing:
- Patient uploads lab result files (PDF/image) to their medical file
- During a consultation, patient can attach lab results directly from their medical file
- Doctor can view and comment on the results as part of the consultation

Doctor referral system:
- Doctor can create an internal referral to another doctor on the platform
- Referred doctor is notified and can accept the consultation at a discounted fee
- Both doctors can see the shared case notes (with patient consent)

Emergency button:
- Floating emergency button on patient home screen
- Connects patient to the first available online doctor
- Charged at a premium rate (1.5x–2x normal fee)
- Only text consultation (no video in this phase)

Acceptance criteria:
- Patient can build a medical file and share it with a doctor
- Medication reminders fire at correct times
- Doctor can generate a prescription PDF inside a consultation
- Emergency button connects patient to an available doctor within 2 minutes or shows fallback
- All screens Arabic RTL
- Medical file data is encrypted in database
```

---

## PHASE 7 — Admin Panel & Analytics

```
/specify

Phase: 7 — Admin Panel & Analytics Dashboard

Goal:
Build the full admin control panel for the platform team to manage all entities, monitor quality, handle disputes, and view business metrics.

Admin capabilities:

User Management:
- View, search, filter all patients / doctors / clinics
- Approve or reject pending verification with reason
- Suspend or ban any account
- View full account details and activity history

Consultation Oversight:
- View all consultations (filtered by date, doctor, status, dispute flag)
- Open disputed consultations and review full conversation
- Issue manual refund
- Flag doctor for quality issues

Financial Dashboard:
- Total revenue (today / this week / this month / custom range)
- Commission earned from consultations
- Commission earned from bookings
- Subscription revenue from clinics
- Pending doctor payouts
- Issued refunds
- Ability to trigger or schedule doctor payout batches

Platform Metrics:
- Total registered users (by role)
- New registrations per day
- Active consultations
- Consultations completed vs expired vs disputed
- Top-performing doctors (by rating and consultation count)
- Most active clinics

Content Moderation:
- View and remove any review or rating flagged as fake or abusive
- View reported messages in chat

Notification center:
- Admin can send push notifications to all patients / all doctors / all clinics

Acceptance criteria:
- Admin can approve a doctor in under 3 clicks
- Financial dashboard shows correct numbers matching actual transactions
- Admin can issue a refund and it reflects in patient wallet
- All tables are paginated and filterable
- Admin panel is web-based (not mobile) and supports Arabic
```

---

## Summary: Phase Order

| Phase | Focus | Key Deliverable |
|-------|-------|-----------------|
| 1 | Foundation + Auth | All 4 roles can register, login, admin verifies doctors/clinics |
| 2 | Profiles | Patients can browse verified doctors and clinics |
| 3 | Consultations | Paid text consultations with auto-refund + ratings |
| 4 | Appointments | Clinic booking system with schedule management |
| 5 | Job Board | Clinic posts jobs, doctors apply |
| 6 | Medical File | Personal health record, prescriptions, reminders, emergency |
| 7 | Admin Panel | Full control dashboard + analytics |

---

## Suggested Tech Stack for /plan

```
/plan

Tech stack:

--- MOBILE (Flutter) ---
- Flutter (Dart) — single codebase iOS + Android
- State management: Riverpod or BLoC
- HTTP client: Dio with JWT interceptors + refresh token logic
- Navigation: go_router
- RTL: Directionality widget + flutter_localizations (ar)
- Payments: flutter_paytabs_bridge (^2.7.2) — official PayTabs Flutter SDK wrapper for native iOS/Android SDKs
  - Supports: Credit/Debit cards, Apple Pay, Google Pay, APMs
  - Payment flow: FlutterPaytabsBridge.startCardPayment(configuration, callback)
  - Tokenization supported for saved cards
  - Locale: PaymentSdkLocale.AR for Arabic UI on payment screen
- Key packages: firebase_messaging, image_picker, file_picker, cached_network_image, intl, flutter_local_notifications

--- WEB ADMIN DASHBOARD ---
- React.js (Vite) + TypeScript
- Tailwind CSS — utility-first styling, rtl: variant for Arabic RTL
- shadcn/ui — all UI primitives (Button, Table, Dialog, Card, Form, Badge, Tabs, Sheet, etc.)
- Routing: React Router v6
- State: TanStack Query (React Query) for server state + Zustand for UI state
- Charts: Recharts (for analytics dashboard in Phase 7)
- Forms: React Hook Form + Zod validation
- RTL: <html dir="rtl" lang="ar"> + Tailwind rtl: variant
- HTTP: Axios with interceptors

--- BACKEND ---
- Node.js + Express — REST API, all routes at /api/v1/
- MongoDB + Mongoose — collections: users, doctors, clinics, consultations, appointments, jobs, prescriptions, transactions
- Socket.IO — real-time consultation chat + job applicant messaging
- node-cron — auto-refund timer, appointment reminders, payout batches
- Multer — file upload middleware (license docs, lab results, profile photos)
- pdfkit — generate electronic prescription PDFs
- jsonwebtoken — JWT auth for doctors/clinics/admin
- bcryptjs — password hashing
- Firebase Admin SDK — send FCM push notifications from backend

--- AUTH ---
- Firebase Auth: patients login via phone OTP
- JWT (jsonwebtoken): doctors, clinics, admin — access token 15min + refresh token 7d

--- PAYMENTS (PayTabs) ---
- Gateway: PayTabs — supports Egypt (EGY region), Saudi Arabia (SAU), UAE (ARE), and all MENA
- Flutter SDK: flutter_paytabs_bridge — native payment screen, no custom card UI needed
- Node.js package: paytabs_pt2 — for server-side payment creation, refunds, and webhook verification
- Integration pattern:
  1. Backend creates payment page via paytabs.createPaymentPage() and returns payment_url to Flutter
  2. Flutter opens PayTabs hosted payment page inside the app (framed mode or redirect)
  3. PayTabs sends callback webhook to backend /api/v1/payments/callback
  4. Backend verifies signature, updates transaction status in MongoDB, triggers consultation unlock or refund
- Transaction types used: sale (consultations, appointments), refund (auto-refund on doctor timeout)
- Commission split handled server-side after PayTabs confirms payment — platform takes 15%, doctor credited 85%
- Region config: set based on deployed country (EGY for Egypt launch)
- Credentials: profileID + serverKey stored in environment variables only — never in client code

--- STORAGE & SERVICES ---
- File storage: Firebase Storage (doctor docs, lab results, prescription PDFs, profile photos)
- Push notifications: Firebase Cloud Messaging (FCM)
- Email: SendGrid (approval/rejection emails, payout receipts)

--- DEPLOYMENT ---
- Backend: Railway or Render (Node.js)
- Admin dashboard: Vercel (React)
- Flutter mobile: App Store + Google Play
```

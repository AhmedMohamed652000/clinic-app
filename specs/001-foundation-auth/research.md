# Research: Foundation & Authentication

**Phase**: 0 — Research
**Feature**: `001-foundation-auth`
**Date**: 2026-04-25

---

## Decision 1 — Patient OTP via Firebase Auth

**Decision**: Use Firebase Authentication (phone OTP) for patient login.

**Rationale**: Handles phone number verification, rate limiting, and cross-platform delivery out-of-the-box. Firebase Admin SDK on the backend lets us verify the ID token server-side and mint a JWT for the session.

**Alternatives considered**:
- Twilio Verify — more expensive at early scale, requires a separate account and webhook; rejected.
- Custom OTP (Redis + SMS gateway) — too much infrastructure overhead for Phase 1; deferred if Firebase costs become a concern at scale.

---

## Decision 2 — JWT Sessions for Doctor / Clinic / Admin

**Decision**: Access token (15 min) + refresh token (7 days) stored as hashed value in MongoDB `refresh_tokens` collection.

**Rationale**: Stateless access tokens work uniformly across Flutter mobile and React web clients. Short-lived access tokens limit blast radius if leaked. Refresh tokens are rotated on each use (rotation + reuse detection).

**Alternatives considered**:
- Session cookies — harder to use with Flutter HTTP clients; CSRF complexity; rejected.
- Long-lived tokens — violates Security First principle; rejected.

---

## Decision 3 — MongoDB Document Layout (polymorphic roles)

**Decision**: Single `users` collection for base credentials + role + status. Separate collections for `patients`, `doctors`, `clinics` linked by `userId`.

**Rationale**: Avoids fat "god" documents while keeping auth queries fast (users collection is the single source of truth for login). Role-specific fields only exist in their own collection.

**Alternatives considered**:
- Discriminator pattern (one collection, embedded subtype fields) — queried cleanly but mixing sparse fields degrades index efficiency; rejected.
- PostgreSQL — viable but deviates from constitutionally mandated MongoDB; not permitted without constitution amendment.

---

## Decision 4 — Firebase Storage for Verification Documents

**Decision**: Doctor/clinic verification documents (national ID, license, commercial registration) uploaded via Multer on the backend then streamed to Firebase Storage. Backend returns a signed storage reference (not a public URL) stored in `verification_documents`.

**Rationale**: Firebase Storage integrates with existing Firebase services. Documents must not be publicly accessible — signed URL pattern enforced. Admin fetches documents via a backend-proxied signed URL.

**Alternatives considered**:
- AWS S3 — equally viable but adds a second cloud vendor; deferred to a future migration if needed.
- Store files in MongoDB GridFS — poor performance for large binary files; rejected.

---

## Decision 5 — Flutter State Management: BLoC

**Decision**: Use BLoC (flutter_bloc) for all auth screens.

**Rationale**: Auth flows have well-defined discrete states (initial → loading → success → error → pending). BLoC's explicit event → state machine maps directly to this flow and simplifies testing. Constitution permits BLoC or Riverpod; BLoC chosen for structured state machines in auth.

**Alternatives considered**:
- Riverpod — simpler API but less prescriptive for complex multi-step auth flows; deferred to a simpler feature.

---

## Decision 6 — Email Notifications via SendGrid

**Decision**: Approval and rejection notifications sent via SendGrid transactional email. Push notification (FCM) is the primary channel; email is secondary.

**Rationale**: Plan.md specifies SendGrid. Firebase Cloud Messaging handles mobile push; SendGrid handles email for users who may not have the app open.

**Alternatives considered**:
- Nodemailer + SMTP — simpler but unreliable at scale and lacks delivery tracking; rejected.

---

## Decision 7 — Document Upload: Multipart Form + Multer

**Decision**: File uploads use `multipart/form-data`. Backend uses Multer with `memoryStorage` (buffers file in memory, then uploads to Firebase Storage). Max file size: 10 MB per file. Accepted MIME types: `image/jpeg`, `image/png`, `application/pdf`.

**Rationale**: Multer is the standard Express file-upload middleware. Memory storage avoids writing temp files to disk on the server.

**Alternatives considered**:
- Direct client-to-Firebase-Storage upload — bypasses backend validation and virus scan hook; rejected for security.

---

## Resolved Clarifications

All NEEDS CLARIFICATION items from Technical Context are now resolved:

| Item | Resolution |
|---|---|
| OTP provider | Firebase Auth (phone) |
| Refresh token storage | MongoDB `refresh_tokens`, hashed |
| Document storage | Firebase Storage, signed URLs |
| Upload middleware | Multer memoryStorage, 10 MB limit |
| State management (Flutter) | BLoC |
| Email provider | SendGrid |
| Password hashing | bcryptjs (cost factor 12) |

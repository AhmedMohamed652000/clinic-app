# Data Model: Foundation & Authentication

**Phase**: 1 — Design
**Feature**: `001-foundation-auth`
**Date**: 2026-04-25

---

## Entity Overview

```
User (base)
 ├── Patient (1:1)
 ├── Doctor  (1:1)
 └── Clinic  (1:1)

Doctor / Clinic
 └── VerificationDocument (1:N)

User
 └── RefreshToken (1:N)
```

---

## Collection: `users`

The single source of truth for authentication credentials and account status.

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `_id` | ObjectId | PK | |
| `email` | String | unique, sparse | Null for patients (phone-only) |
| `phone` | String | unique, sparse | Null for doctors / clinics / admin |
| `passwordHash` | String | | bcryptjs, cost 12. Null for patients (Firebase OTP) |
| `firebaseUid` | String | unique, sparse | Firebase Auth UID for patients only |
| `role` | enum | required | `patient` \| `doctor` \| `clinic` \| `admin` |
| `status` | enum | required, default `pending` | `active` \| `pending` \| `rejected` \| `suspended` |
| `createdAt` | Date | | |
| `updatedAt` | Date | | |

**Indexes**: `email` (sparse unique), `phone` (sparse unique), `firebaseUid` (sparse unique), `role`, `status`

**State transitions**:
```
[new doctor/clinic] → pending
pending → approved (admin action) → active
pending → rejected (admin action) → rejected
rejected → pending (re-submission)
active  → suspended (admin action)
[new patient] → active (immediately after OTP verification)
[new admin]   → active (seeded directly)
```

---

## Collection: `patients`

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `_id` | ObjectId | PK | |
| `userId` | ObjectId | ref: users, unique | |
| `fullName` | String | required | |
| `age` | Number | required, min 1 | |
| `gender` | enum | required | `male` \| `female` |
| `fcmToken` | String | | Firebase Cloud Messaging token |
| `createdAt` | Date | | |

**Indexes**: `userId` (unique)

---

## Collection: `doctors`

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `_id` | ObjectId | PK | |
| `userId` | ObjectId | ref: users, unique | |
| `fullName` | String | required | |
| `specialty` | String | required | From predefined list (Phase 2 expands) |
| `nationalIdNumber` | String | required | |
| `licenseNumber` | String | required | |
| `verificationDocuments` | ObjectId[] | ref: verification_documents | Min 2: national ID + license |
| `rejectionReason` | String | | Set on rejection |
| `reviewedBy` | ObjectId | ref: users | Admin who reviewed |
| `reviewedAt` | Date | | |
| `fcmToken` | String | | |
| `createdAt` | Date | | |
| `updatedAt` | Date | | |

**Indexes**: `userId` (unique)

---

## Collection: `clinics`

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `_id` | ObjectId | PK | |
| `userId` | ObjectId | ref: users, unique | |
| `clinicName` | String | required | |
| `address` | String | required | |
| `commercialRegNumber` | String | required | |
| `verificationDocuments` | ObjectId[] | ref: verification_documents | Min 1 |
| `rejectionReason` | String | | |
| `reviewedBy` | ObjectId | ref: users | |
| `reviewedAt` | Date | | |
| `fcmToken` | String | | |
| `createdAt` | Date | | |
| `updatedAt` | Date | | |

**Indexes**: `userId` (unique)

---

## Collection: `verification_documents`

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `_id` | ObjectId | PK | |
| `ownerId` | ObjectId | ref: users, required | |
| `ownerType` | enum | required | `doctor` \| `clinic` |
| `documentType` | String | required | e.g. `national_id`, `medical_license`, `commercial_registration`, `other` |
| `storageRef` | String | required | Firebase Storage path (not a public URL) |
| `mimeType` | String | | `image/jpeg` \| `image/png` \| `application/pdf` |
| `fileSizeBytes` | Number | | |
| `uploadedAt` | Date | | |

**Indexes**: `ownerId`, `(ownerId, ownerType)`

**Access pattern**: Admin retrieves signed URL via backend endpoint `/api/v1/admin/verification/:id/documents/:docId` — never stored as a public URL.

---

## Collection: `refresh_tokens`

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `_id` | ObjectId | PK | |
| `userId` | ObjectId | ref: users, required | |
| `tokenHash` | String | required | SHA-256 of the raw refresh token |
| `expiresAt` | Date | required | 7 days from issue |
| `usedAt` | Date | | Populated on rotation; token is invalidated after first reuse |
| `createdAt` | Date | | |

**Indexes**: `tokenHash` (unique), `userId`, `expiresAt` (TTL index — auto-delete expired)

**Rotation policy**: On each `/auth/refresh` call the old token is invalidated (`usedAt` set) and a new token is issued. If a token is reused after `usedAt` is set, all tokens for that user are revoked (reuse detection).

---

## Validation Rules

| Entity | Rule |
|---|---|
| Patient | `age` must be 1–120 |
| Patient | `phone` must pass E.164 format validation |
| Doctor | At least 2 documents required before submission (national ID + license) |
| Clinic | At least 1 document required |
| All uploads | MIME: `image/jpeg`, `image/png`, `application/pdf`; max 10 MB |
| Refresh token | Rejected if `expiresAt` is in the past or `usedAt` is set |
| Rejection | `rejectionReason` is required (min 10 chars) when status → `rejected` |

---

## Seeded Data (admin bootstrap)

Admin accounts are created directly in the database — no registration endpoint. Seed script (`scripts/seed-admin.js`) creates one admin user:

```json
{
  "email": "admin@clinic-platform.com",
  "role": "admin",
  "status": "active",
  "passwordHash": "<bcrypt of env var ADMIN_SEED_PASSWORD>"
}
```

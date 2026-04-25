# API Contract: Authentication — Phase 1

**Base URL**: `/api/v1`
**Auth header**: `Authorization: Bearer <access_token>` (required on all protected endpoints)
**Response envelope**:
- Success: `{ "success": true, "data": <payload> }`
- Error: `{ "success": false, "message": "<string>", "code": "<ERROR_CODE>" }`

---

## Patient Authentication

### POST `/auth/patient/send-otp`

Send a one-time code to a phone number. Creates the patient account if it does not exist.

**Auth**: Public

**Request body**:
```json
{
  "phone": "+201012345678"
}
```

**Responses**:
| Status | Code | Meaning |
|---|---|---|
| 200 | — | OTP sent (Firebase handles delivery) |
| 400 | `INVALID_PHONE` | Phone number fails E.164 format |
| 429 | `OTP_RATE_LIMIT` | Too many requests for this number |

---

### POST `/auth/patient/verify-otp`

Verify the OTP returned by Firebase on the client side. The Flutter app verifies the OTP directly with Firebase, obtains a Firebase ID token, then sends that token here.

**Auth**: Public

**Request body**:
```json
{
  "firebaseIdToken": "<token from Firebase Auth>"
}
```

**Response (new patient — needs profile completion)**:
```json
{
  "success": true,
  "data": {
    "isNewUser": true,
    "accessToken": "<jwt>",
    "refreshToken": "<opaque string>"
  }
}
```

**Response (returning patient)**:
```json
{
  "success": true,
  "data": {
    "isNewUser": false,
    "accessToken": "<jwt>",
    "refreshToken": "<opaque string>",
    "patient": { "fullName": "Ahmed", "gender": "male", "age": 30 }
  }
}
```

**Responses**:
| Status | Code | Meaning |
|---|---|---|
| 200 | — | Verified |
| 401 | `INVALID_FIREBASE_TOKEN` | Token invalid or expired |

---

### POST `/auth/patient/complete-registration`  🔒

Complete profile for a newly registered patient.

**Auth**: Patient JWT (new patients only — rejected once profile is complete)

**Request body**:
```json
{
  "fullName": "Ahmed Mohamed",
  "age": 28,
  "gender": "male"
}
```

**Responses**:
| Status | Code | Meaning |
|---|---|---|
| 200 | — | Profile saved |
| 400 | `VALIDATION_ERROR` | Missing or invalid fields |
| 409 | `ALREADY_REGISTERED` | Profile already exists |

---

## Doctor Authentication

### POST `/auth/doctor/register`

Register a new doctor account.

**Auth**: Public

**Request body**:
```json
{
  "email": "doctor@example.com",
  "password": "Str0ng!Pass",
  "fullName": "Dr. Sara Ahmed",
  "specialty": "general",
  "nationalIdNumber": "12345678901234",
  "licenseNumber": "LIC-2024-00123"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "doctorId": "<objectId>",
    "status": "pending",
    "uploadToken": "<jwt scoped to document upload only>"
  }
}
```

**Responses**:
| Status | Code | Meaning |
|---|---|---|
| 201 | — | Account created, status `pending` |
| 400 | `VALIDATION_ERROR` | Missing or invalid fields |
| 409 | `EMAIL_EXISTS` | Email already registered |

---

### POST `/auth/doctor/upload-documents`  🔒

Upload verification documents. Accepts `multipart/form-data`. Called once or more after registration; re-submission replaces all previous documents.

**Auth**: Doctor JWT (status `pending` or `rejected`)

**Request**: `multipart/form-data`

| Field | Type | Required | Notes |
|---|---|---|---|
| `nationalId` | file | Yes | JPEG / PNG / PDF, max 10 MB |
| `medicalLicense` | file | Yes | JPEG / PNG / PDF, max 10 MB |

**Response**:
```json
{
  "success": true,
  "data": {
    "documentsUploaded": 2,
    "status": "pending"
  }
}
```

**Responses**:
| Status | Code | Meaning |
|---|---|---|
| 200 | — | Documents stored, account remains `pending` |
| 400 | `MISSING_DOCUMENTS` | Required files not attached |
| 400 | `FILE_TOO_LARGE` | File exceeds 10 MB |
| 400 | `INVALID_MIME` | Unsupported file type |
| 403 | `ACCOUNT_NOT_PENDING` | Only pending/rejected accounts may upload |

---

### POST `/auth/doctor/login`

Log in an existing doctor.

**Auth**: Public

**Request body**:
```json
{
  "email": "doctor@example.com",
  "password": "Str0ng!Pass"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "accessToken": "<jwt>",
    "refreshToken": "<opaque string>",
    "doctor": {
      "fullName": "Dr. Sara Ahmed",
      "status": "active"
    }
  }
}
```

**Responses**:
| Status | Code | Meaning |
|---|---|---|
| 200 | — | Logged in |
| 401 | `INVALID_CREDENTIALS` | Wrong email or password |
| 403 | `ACCOUNT_SUSPENDED` | Account suspended by admin |

---

## Clinic Authentication

### POST `/auth/clinic/register`

**Auth**: Public

**Request body**:
```json
{
  "email": "clinic@example.com",
  "password": "Str0ng!Pass",
  "clinicName": "Al-Shifa Clinic",
  "address": "123 Main St, Cairo",
  "commercialRegNumber": "REG-2024-5678"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "clinicId": "<objectId>",
    "status": "pending"
  }
}
```

**Responses**: Same as `POST /auth/doctor/register`

---

### POST `/auth/clinic/upload-documents`  🔒

**Auth**: Clinic JWT (status `pending` or `rejected`)

**Request**: `multipart/form-data`

| Field | Type | Required | Notes |
|---|---|---|---|
| `businessDoc` | file | Yes | Commercial registration document |

**Response**: Same shape as `/auth/doctor/upload-documents`

---

### POST `/auth/clinic/login`

**Auth**: Public

Same shape as `POST /auth/doctor/login`, replacing `doctor` with `clinic` in the response.

---

## Admin Authentication

### POST `/auth/admin/login`

**Auth**: Public

**Request body**:
```json
{
  "email": "admin@clinic-platform.com",
  "password": "AdminPass!"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "accessToken": "<jwt>",
    "refreshToken": "<opaque string>"
  }
}
```

**Responses**:
| Status | Code | Meaning |
|---|---|---|
| 200 | — | Logged in |
| 401 | `INVALID_CREDENTIALS` | Wrong credentials |

---

## Admin — Verification Queue

### GET `/admin/verification-queue`  🔒🛡️

List all pending accounts.

**Auth**: Admin JWT

**Query params**:
| Param | Type | Default | Notes |
|---|---|---|---|
| `type` | string | `all` | `doctor` \| `clinic` \| `all` |
| `page` | number | 1 | |
| `limit` | number | 20 | max 100 |

**Response**:
```json
{
  "success": true,
  "data": {
    "total": 42,
    "page": 1,
    "items": [
      {
        "id": "<objectId>",
        "type": "doctor",
        "fullName": "Dr. Sara Ahmed",
        "email": "doctor@example.com",
        "submittedAt": "2026-04-25T10:00:00Z",
        "documentCount": 2
      }
    ]
  }
}
```

---

### GET `/admin/verification/:id/documents/:docId`  🔒🛡️

Get a short-lived signed URL for a verification document (5-minute expiry).

**Auth**: Admin JWT

**Response**:
```json
{
  "success": true,
  "data": {
    "signedUrl": "https://storage.googleapis.com/...",
    "expiresAt": "2026-04-25T10:05:00Z"
  }
}
```

---

### POST `/admin/verification/:id/approve`  🔒🛡️

Approve a pending doctor or clinic.

**Auth**: Admin JWT

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "<objectId>",
    "status": "active"
  }
}
```

Side effects:
- Sets `users.status` → `active`
- Sets `verified: true` on doctor/clinic record
- Sends FCM push notification to account holder
- Sends SendGrid email to account holder

---

### POST `/admin/verification/:id/reject`  🔒🛡️

Reject a pending doctor or clinic with a mandatory reason.

**Auth**: Admin JWT

**Request body**:
```json
{
  "reason": "الوثائق المرفوعة غير واضحة. يرجى رفع صورة واضحة من رخصة المزاولة."
}
```

**Responses**:
| Status | Code | Meaning |
|---|---|---|
| 200 | — | Rejected, notification sent |
| 400 | `REASON_REQUIRED` | Reason field is empty or < 10 chars |

Side effects:
- Sets `users.status` → `rejected`
- Stores `rejectionReason` on doctor/clinic record
- Sends FCM push + SendGrid email with reason

---

## Token Management

### POST `/auth/refresh`

Exchange a valid refresh token for a new access + refresh token pair (rotation).

**Auth**: Public

**Request body**:
```json
{
  "refreshToken": "<opaque string>"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "accessToken": "<jwt>",
    "refreshToken": "<new opaque string>"
  }
}
```

**Responses**:
| Status | Code | Meaning |
|---|---|---|
| 200 | — | New token pair issued |
| 401 | `INVALID_REFRESH_TOKEN` | Token not found, expired, or already used |
| 401 | `REFRESH_TOKEN_REUSE` | Reuse detected — all user tokens revoked |

---

### POST `/auth/logout`  🔒

Invalidate the current refresh token.

**Auth**: Any valid JWT

**Request body**:
```json
{
  "refreshToken": "<opaque string>"
}
```

**Response**: `{ "success": true, "data": null }`

---

## JWT Payload Shape

```json
{
  "sub": "<userId>",
  "role": "doctor",
  "status": "active",
  "iat": 1745560000,
  "exp": 1745560900
}
```

- `sub`: MongoDB `_id` of the user
- `role`: `patient` | `doctor` | `clinic` | `admin`
- `status`: snapshot at token issue time; middleware re-validates against DB on sensitive actions
- Expiry: 15 minutes (`exp = iat + 900`)

---

## Error Code Reference

| Code | HTTP | Meaning |
|---|---|---|
| `INVALID_PHONE` | 400 | Phone number format invalid |
| `OTP_RATE_LIMIT` | 429 | Too many OTP requests |
| `INVALID_FIREBASE_TOKEN` | 401 | Firebase ID token invalid |
| `VALIDATION_ERROR` | 400 | Request body fails schema validation |
| `EMAIL_EXISTS` | 409 | Email already registered |
| `ALREADY_REGISTERED` | 409 | Profile already complete |
| `INVALID_CREDENTIALS` | 401 | Wrong email/password |
| `ACCOUNT_SUSPENDED` | 403 | Account suspended by admin |
| `ACCOUNT_NOT_PENDING` | 403 | Document upload only for pending/rejected |
| `MISSING_DOCUMENTS` | 400 | Required file fields not attached |
| `FILE_TOO_LARGE` | 400 | File exceeds 10 MB |
| `INVALID_MIME` | 400 | Unsupported file type |
| `REASON_REQUIRED` | 400 | Rejection reason missing |
| `INVALID_REFRESH_TOKEN` | 401 | Refresh token invalid or expired |
| `REFRESH_TOKEN_REUSE` | 401 | Reuse detected, all tokens revoked |
| `UNAUTHORIZED` | 401 | Missing or invalid access token |
| `FORBIDDEN` | 403 | Correct token but wrong role |

# Quickstart: Foundation & Authentication

**Phase 1 — Developer Setup Guide**

---

## Prerequisites

| Tool | Version | Notes |
|---|---|---|
| Node.js | 20 LTS | Backend runtime |
| Flutter | 3.x stable | Mobile app |
| MongoDB | 7.x | Local or Atlas |
| Firebase project | — | Auth + Storage + FCM |
| Git | — | |

---

## 1. Clone & Install

```bash
git clone <repo-url>
cd clinic-app
```

### Backend
```bash
cd apps/backend
npm install
cp .env.example .env
# Fill in .env (see section 3)
```

### Admin Dashboard
```bash
cd apps/admin
npm install
cp .env.example .env
```

### Flutter Mobile
```bash
cd apps/mobile
flutter pub get
# Place google-services.json (Android) in apps/mobile/android/app/
# Place GoogleService-Info.plist (iOS) in apps/mobile/ios/Runner/
```

---

## 2. Firebase Setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Phone Authentication** (Firebase Auth > Sign-in methods)
3. Enable **Firebase Storage** (start in production mode, configure rules — see step 5)
4. Generate a **Service Account key** (Project Settings > Service Accounts > Generate new private key) → save as `apps/backend/firebase-service-account.json`
5. Set Firebase Storage security rules:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /verification-docs/{userId}/{allPaths=**} {
      allow read, write: if false; // backend-only access via Admin SDK
    }
  }
}
```

---

## 3. Environment Variables

### Backend (`apps/backend/.env`)

```env
NODE_ENV=development
PORT=3000
MONGO_URI=mongodb://localhost:27017/clinic_platform_dev
JWT_SECRET=<at-least-64-char-random-string>
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

# Firebase Admin SDK
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
FIREBASE_STORAGE_BUCKET=<project-id>.appspot.com

# SendGrid
SENDGRID_API_KEY=SG.xxxxxxxxxxxx
SENDGRID_FROM_EMAIL=no-reply@clinic-platform.com

# Admin seed
ADMIN_SEED_EMAIL=admin@clinic-platform.com
ADMIN_SEED_PASSWORD=<strong-password>
```

### Admin Dashboard (`apps/admin/.env`)

```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

### Flutter (`apps/mobile/.env` or `--dart-define`)

```
API_BASE_URL=http://10.0.2.2:3000/api/v1   # Android emulator
# API_BASE_URL=http://localhost:3000/api/v1  # iOS simulator
```

---

## 4. Seed the Admin Account

```bash
cd apps/backend
node scripts/seed-admin.js
```

Output: `Admin account created: admin@clinic-platform.com`

---

## 5. Start Development Servers

```bash
# Terminal 1 — Backend
cd apps/backend && npm run dev

# Terminal 2 — Admin dashboard
cd apps/admin && npm run dev

# Terminal 3 — Flutter (with device/emulator connected)
cd apps/mobile && flutter run
```

Backend: `http://localhost:3000`
Admin dashboard: `http://localhost:5173`

---

## 6. Verify the Setup

Run through this smoke-test checklist:

### Patient flow
- [ ] Open Flutter app → enter a phone number → receive OTP
- [ ] Enter OTP → land on profile completion screen
- [ ] Submit name, age, gender → land on patient home screen

### Doctor flow
- [ ] Register with email + password + details
- [ ] Upload national ID and license documents
- [ ] See "pending approval" screen

### Admin flow
- [ ] Open admin dashboard → log in with seeded admin credentials
- [ ] See the verification queue with the pending doctor
- [ ] Approve the doctor → doctor's app shows full access

### Token flow
- [ ] Access token expires after 15 min → `/auth/refresh` returns new pair
- [ ] Reusing a refresh token triggers revocation of all user tokens

---

## 7. Running Tests

```bash
# Backend unit + integration tests
cd apps/backend && npm test

# Admin dashboard
cd apps/admin && npm test

# Flutter
cd apps/mobile && flutter test
```

---

## 8. Common Issues

| Symptom | Fix |
|---|---|
| Firebase OTP not received | Check Firebase Auth phone sign-in is enabled; add test phone numbers in Firebase console for dev |
| `MongoServerError: E11000 duplicate key` | Run `node scripts/seed-admin.js` only once; drop the collection if re-seeding |
| Flutter `DioException: Connection refused` | Ensure backend is running; use `10.0.2.2` (not `localhost`) for Android emulator |
| Admin dashboard CORS error | Set `CORS_ORIGIN=http://localhost:5173` in backend `.env` |
| Document upload `413 Payload Too Large` | Backend `express.json()` limit is separate from Multer; ensure Multer limit is set to 10 MB |

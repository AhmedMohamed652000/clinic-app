# Tasks: Foundation & Authentication (Phase 1)

**Input**: Design documents from `/specs/001-foundation-auth/`
**Plan**: [plan.md](plan.md) | **Spec**: [spec.md](spec.md) | **API**: [contracts/auth-api.md](contracts/auth-api.md) | **Data**: [data-model.md](data-model.md)

**IMPORTANT FOR THE IMPLEMENTING AI**: Every task below is self-contained. The key design documents are:
- `specs/001-foundation-auth/data-model.md` — MongoDB schema for all 6 collections
- `specs/001-foundation-auth/contracts/auth-api.md` — All ~20 REST endpoints with exact request/response shapes
- `specs/001-foundation-auth/quickstart.md` — Environment variables and test scenarios
- `specs/001-foundation-auth/research.md` — Technology decisions and rationale

**Tech stack summary**:
- Backend: Node.js 20 + Express + MongoDB/Mongoose + firebase-admin + jsonwebtoken + bcryptjs + Multer + @sendgrid/mail + firebase-admin (FCM)
- Mobile: Flutter 3 + flutter_bloc + Dio + go_router + firebase_auth + firebase_messaging + file_picker + flutter_secure_storage
- Admin dashboard: React 18 + Vite + TypeScript + Tailwind CSS + shadcn/ui + TanStack Query + Zustand + React Router v6 + Axios

**Monorepo layout**:
```
apps/
├── backend/    — Node.js + Express REST API
├── mobile/     — Flutter iOS + Android
└── admin/      — React + Vite admin dashboard
```

---

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel with other [P] tasks at the same phase level
- **[USn]**: User story this task belongs to (US1–US5)
- Each task description includes exact file paths and key implementation details

---

## Phase 1: Setup — Project Initialization

**Purpose**: Create folder skeletons and initialize package managers. No business logic here.

- [ ] T001 Create top-level monorepo structure: create folders `apps/backend/`, `apps/mobile/`, `apps/admin/`, `specs/` at repo root. Create root `package.json` with `{ "workspaces": ["apps/backend", "apps/admin"] }` and `README.md` with a one-line description.

- [ ] T002 Initialize backend Node.js project: in `apps/backend/` run `npm init -y`. Install dependencies — `express mongoose jsonwebtoken bcryptjs multer @sendgrid/mail firebase-admin cors dotenv express-rate-limit`. Install devDependencies — `nodemon jest supertest`. Add scripts to `apps/backend/package.json`: `"start": "node src/server.js"`, `"dev": "nodemon src/server.js"`, `"test": "jest --runInBand"`. Create `apps/backend/.gitignore` with `node_modules/`, `.env`, `firebase-service-account.json`.

- [ ] T003 [P] Initialize Flutter mobile project: in `apps/mobile/` run `flutter create . --org com.clinicplatform --project-name clinic_mobile`. Add to `apps/mobile/pubspec.yaml` under `dependencies`: `flutter_bloc: ^8.1.0`, `dio: ^5.4.0`, `go_router: ^13.0.0`, `firebase_auth: ^4.17.0`, `firebase_core: ^2.27.0`, `firebase_messaging: ^14.7.0`, `flutter_secure_storage: ^9.0.0`, `file_picker: ^8.0.0`, `image_picker: ^1.0.7`, `intl: ^0.19.0`. Run `flutter pub get`. Add `flutter_localizations` to dependencies.

- [ ] T004 [P] Initialize React admin project: in `apps/admin/` run `npm create vite@latest . -- --template react-ts`. Install `tailwindcss postcss autoprefixer @tanstack/react-query zustand axios react-router-dom`. Run `npx tailwindcss init -p`. Install shadcn/ui via `npx shadcn-ui@latest init` — choose: TypeScript yes, style Default, base color Slate, global CSS `src/index.css`, CSS variables yes, aliases `@/` → `src/`. Install shadcn components used in this phase: `npx shadcn-ui@latest add button input label card table badge dialog form`.

- [ ] T005 Create `apps/backend/.env.example` with all required variables (copy from `specs/001-foundation-auth/quickstart.md` section 3): `NODE_ENV`, `PORT`, `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `REFRESH_TOKEN_EXPIRES_IN`, `FIREBASE_SERVICE_ACCOUNT_PATH`, `FIREBASE_STORAGE_BUCKET`, `SENDGRID_API_KEY`, `SENDGRID_FROM_EMAIL`, `ADMIN_SEED_EMAIL`, `ADMIN_SEED_PASSWORD`, `CORS_ORIGIN`. Also create `apps/admin/.env.example` with `VITE_API_BASE_URL`.

- [ ] T006 [P] Configure Tailwind in admin: update `apps/admin/tailwind.config.js` — set `content: ["./index.html","./src/**/*.{ts,tsx}"]`, add `darkMode: "class"`. Update `apps/admin/src/index.css` to include `@tailwind base; @tailwind components; @tailwind utilities;`. Update `apps/admin/index.html`: set `<html dir="rtl" lang="ar">` — this is NON-NEGOTIABLE per constitution (principle V, RTL/Arabic).

- [ ] T007 [P] Configure Flutter localization: in `apps/mobile/pubspec.yaml` under `flutter:` add `generate: true` and `assets: []`. Create `apps/mobile/l10n.yaml` with `arb-dir: lib/core/l10n`, `template-arb-file: app_ar.arb`, `output-localization-file: app_localizations.dart`. Create directory `apps/mobile/lib/core/l10n/`. Create `apps/mobile/lib/core/l10n/app_ar.arb` with a minimal valid ARB file: `{ "@@locale": "ar", "appName": "منصة الأطباء" }`. Run `flutter gen-l10n` to generate the localization class.

- [ ] T008 Setup admin ESLint + TypeScript: create `apps/admin/tsconfig.json` with `"compilerOptions": { "target": "ES2020", "lib": ["ES2020","DOM"], "jsx": "react-jsx", "strict": true, "baseUrl": ".", "paths": { "@/*": ["./src/*"] } }`. This ensures absolute imports work throughout the admin project.

---

## Phase 2: Foundation — Blocking Prerequisites

**Purpose**: Core infrastructure every user story depends on. Nothing in Phase 3+ can start until this phase is complete.

**⚠️ CRITICAL**: Complete ALL tasks T009–T042 before starting any user story phase.

### Backend Core

- [ ] T009 Create `apps/backend/src/config/env.js`: use `dotenv` to load `.env`. Export a frozen object with all required env vars. Throw an error at startup if any required var is missing: `JWT_SECRET`, `MONGO_URI`, `FIREBASE_SERVICE_ACCOUNT_PATH`, `FIREBASE_STORAGE_BUCKET`. Example: `if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is required')`.

- [ ] T010 Create `apps/backend/src/config/db.js`: export an async `connectDB()` function that calls `mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })`. Log `'MongoDB connected'` on success. Call this from `server.js`.

- [ ] T011 Create `apps/backend/src/config/firebase.js`: import `firebase-admin`. Read the service account JSON from `process.env.FIREBASE_SERVICE_ACCOUNT_PATH` using `fs.readFileSync`. Call `admin.initializeApp({ credential: admin.credential.cert(serviceAccount), storageBucket: process.env.FIREBASE_STORAGE_BUCKET })`. Export `admin` so other services can use `admin.auth()`, `admin.storage()`, and `admin.messaging()`.

- [ ] T012 Create `apps/backend/src/utils/response.js`: export two functions:
  1. `sendSuccess(res, data, statusCode = 200)` → responds with `{ success: true, data }`
  2. `sendError(res, code, message, statusCode = 400)` → responds with `{ success: false, message, code }`
  All API responses across the project MUST use these helpers — never call `res.json()` directly in routes.

- [ ] T013 Create `apps/backend/src/utils/errors.js`: export class `AppError extends Error` with constructor `(message, code, httpStatus = 400)`. Store all three as instance properties. Export a list of error code constants matching the "Error Code Reference" table in `specs/001-foundation-auth/contracts/auth-api.md` (e.g., `export const INVALID_PHONE = 'INVALID_PHONE'`).

- [ ] T014 Create `apps/backend/src/models/user.model.js`: Mongoose schema as defined in `specs/001-foundation-auth/data-model.md` "Collection: users". Fields: `email` (String, unique, sparse, lowercase, trim), `phone` (String, unique, sparse, trim), `passwordHash` (String), `firebaseUid` (String, unique, sparse), `role` (String enum `['patient','doctor','clinic','admin']`, required), `status` (String enum `['active','pending','rejected','suspended']`, required, default `'pending'`), timestamps. Add compound index on `role` and single index on `status`. Export as `mongoose.model('User', userSchema)`.

- [ ] T015 Create `apps/backend/src/models/refresh-token.model.js`: schema per `data-model.md` "Collection: refresh_tokens". Fields: `userId` (ObjectId, ref `User`, required), `tokenHash` (String, required, unique), `expiresAt` (Date, required), `usedAt` (Date, default null). Timestamps. Add TTL index on `expiresAt`: `refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })`. Add index on `userId`. Export as `RefreshToken`.

- [ ] T016 Create `apps/backend/src/models/verification-document.model.js`: schema per `data-model.md` "Collection: verification_documents". Fields: `ownerId` (ObjectId, ref `User`, required), `ownerType` (String enum `['doctor','clinic']`, required), `documentType` (String, required — values: `'national_id'`, `'medical_license'`, `'commercial_registration'`, `'other'`), `storageRef` (String, required — Firebase Storage path, NOT a public URL), `mimeType` (String), `fileSizeBytes` (Number), `uploadedAt` (Date, default Date.now). Indexes on `ownerId` and compound `(ownerId, ownerType)`. Export as `VerificationDocument`.

- [ ] T017 Create `apps/backend/src/services/token.service.js`: implement four functions:
  1. `signAccessToken(userId, role, status)` → `jwt.sign({ sub: userId, role, status }, JWT_SECRET, { expiresIn: '15m' })`
  2. `signRefreshToken()` → generate 64 random bytes with `crypto.randomBytes`, return hex string
  3. `saveRefreshToken(userId, rawToken)` → hash with `crypto.createHash('sha256').update(rawToken).digest('hex')`, save to `refresh_tokens` collection with `expiresAt = now + 7 days`
  4. `rotateRefreshToken(rawToken)` → find by hash, check not expired and not used, set `usedAt = now`, create new token pair and return them; if token is already used → delete ALL tokens for that `userId` (reuse attack) and throw `AppError('Refresh token reused', 'REFRESH_TOKEN_REUSE', 401)`

- [ ] T018 Create `apps/backend/src/middleware/auth.js`: export `authenticate` middleware. Extract Bearer token from `Authorization` header. Verify with `jwt.verify(token, JWT_SECRET)`. Attach decoded payload as `req.user = { userId: decoded.sub, role: decoded.role, status: decoded.status }`. On any error call `sendError(res, 'UNAUTHORIZED', 'Invalid or missing token', 401)`. Also look up the user in the DB to get fresh status (use a lightweight `.select('status role')` query) — this prevents suspended accounts from using cached tokens.

- [ ] T019 Create `apps/backend/src/middleware/role.js`: export `requireRole(...roles)` factory that returns a middleware. Checks `req.user.role` is in the allowed roles array. If not: `sendError(res, 'FORBIDDEN', 'Access denied', 403)`. Usage in routes: `router.get('/queue', authenticate, requireRole('admin'), handler)`.

- [ ] T020 Create `apps/backend/src/middleware/upload.js`: export a Multer instance using `multer.memoryStorage()`. Set `limits: { fileSize: 10 * 1024 * 1024 }` (10 MB). Set `fileFilter` to allow only `image/jpeg`, `image/png`, `application/pdf` — call `cb(new AppError('Unsupported file type', 'INVALID_MIME', 400))` for others. Export `upload.fields([{ name: 'nationalId', maxCount: 1 }, { name: 'medicalLicense', maxCount: 1 }, { name: 'businessDoc', maxCount: 1 }])` as `uploadVerificationDocs`. Export `upload` instance for custom use.

- [ ] T021 Create `apps/backend/src/services/storage.service.js`: import Firebase Admin from `config/firebase.js`. Export two functions:
  1. `uploadDocument(userId, documentType, fileBuffer, mimeType)` → uploads `fileBuffer` to Firebase Storage at path `verification-docs/{userId}/{documentType}-{Date.now()}`. Returns the Firebase Storage file path (string, NOT a signed URL).
  2. `getSignedUrl(storageRef)` → calls `admin.storage().bucket().file(storageRef).getSignedUrl({ action: 'read', expires: Date.now() + 5 * 60 * 1000 })`. Returns the signed URL string (5-minute expiry).

- [ ] T022 [P] Create `apps/backend/src/services/notification.service.js`: export two functions:
  1. `sendPushNotification(fcmToken, title, body)` → calls `admin.messaging().send({ token: fcmToken, notification: { title, body } })`. If fcmToken is null/undefined, skip silently.
  2. `sendEmail(to, subject, htmlContent)` → uses `@sendgrid/mail`. Sets API key from env. Calls `sgMail.send({ to, from: SENDGRID_FROM_EMAIL, subject, html: htmlContent })`. Wrap in try/catch — log error but do NOT throw (email failure must not break the main flow).

- [ ] T023 Create `apps/backend/src/routes/v1/auth/token.routes.js`: Express router with two routes:
  1. `POST /refresh` — no auth required. Body: `{ refreshToken }`. Call `token.service.rotateRefreshToken()`. Return new `{ accessToken, refreshToken }`. See contract in `specs/001-foundation-auth/contracts/auth-api.md` "Token Management".
  2. `POST /logout` — requires `authenticate` middleware. Body: `{ refreshToken }`. Find token by hash, set `usedAt = now`. Return `{ success: true, data: null }`.

- [ ] T024 Create `apps/backend/src/app.js`: create Express app. Apply middleware in this order: `cors({ origin: process.env.CORS_ORIGIN })`, `express.json()`, `express.urlencoded({ extended: true })`. Mount v1 router at `/api/v1` (will be created in T040). Add a catch-all error handler at the bottom: `app.use((err, req, res, next) => sendError(res, err.code || 'SERVER_ERROR', err.message, err.httpStatus || 500))`. Export `app`.

- [ ] T025 Create `apps/backend/src/server.js`: import `app`, `connectDB`, and `env` config. Call `connectDB()` then `app.listen(process.env.PORT || 3000)`. This is the entry point — `npm run dev` starts this file.

- [ ] T026 [P] Create `apps/backend/scripts/seed-admin.js`: standalone script (not loaded by the server). Connects directly to MongoDB. Checks if a user with `role: 'admin'` already exists — if yes, log and exit. Otherwise creates a `User` with `email: process.env.ADMIN_SEED_EMAIL`, `passwordHash: bcrypt.hashSync(process.env.ADMIN_SEED_PASSWORD, 12)`, `role: 'admin'`, `status: 'active'`. Log `"Admin seeded: <email>"`. Run with `node scripts/seed-admin.js` after setting env vars.

### Flutter Core

- [ ] T027 Create `apps/mobile/lib/core/network/token_storage.dart`: class `TokenStorage` using `flutter_secure_storage`. Methods: `saveTokens(String accessToken, String refreshToken)`, `getAccessToken()`, `getRefreshToken()`, `clearTokens()`. Keys: `'access_token'`, `'refresh_token'`. This is used by the Dio interceptor to persist tokens between app sessions.

- [ ] T028 Create `apps/mobile/lib/core/network/api_client.dart`: create a singleton `ApiClient` that wraps `Dio`. Set `baseOptions.baseUrl` from `const String.fromEnvironment('API_BASE_URL', defaultValue: 'http://10.0.2.2:3000/api/v1')`. Add a `QueuedInterceptorsWrapper` that:
  1. On request: reads access token from `TokenStorage`, adds `Authorization: Bearer <token>` header.
  2. On error (401): calls `POST /auth/refresh` with the stored refresh token, saves the new token pair, retries the original request. If refresh also fails, clears tokens and redirects to login (emit event on a stream).
  This is critical — all API calls across the app go through this client.

- [ ] T029 Create `apps/mobile/lib/core/router/app_router.dart`: configure `GoRouter` with these initial routes:
  - `/` → redirect based on auth state (patient home, doctor pending, or login)
  - `/patient/phone` → `PhoneInputScreen`
  - `/patient/otp` → `OtpVerifyScreen`
  - `/patient/profile` → `ProfileCompleteScreen`
  - `/patient/home` → `PatientHomeScreen` (placeholder — guards require patient role)
  - `/doctor/register` → `DoctorRegisterScreen`
  - `/doctor/upload` → `DoctorUploadDocsScreen`
  - `/doctor/pending` → `DoctorPendingScreen`
  - `/clinic/register` → `ClinicRegisterScreen`
  - `/clinic/upload` → `ClinicUploadDocsScreen`
  - `/clinic/pending` → `ClinicPendingScreen`
  - `/auth/rejected` → `RejectedScreen`
  Add a `redirect` callback: if user has a valid access token with `status: 'active'` → route to their role home. If `status: 'pending'` → route to pending screen. If `status: 'rejected'` → route to rejected screen.

- [ ] T030 Create `apps/mobile/lib/main.dart`: wrap `MaterialApp.router` with `MultiBlocProvider` and `Directionality(textDirection: TextDirection.rtl)`. Set `locale: const Locale('ar')`. Import `AppLocalizations.delegate` and `GlobalMaterialLocalizations.delegate`. Pass `appRouter` from `app_router.dart` to `MaterialApp.router`. Theme: use `ThemeData` with `fontFamily` appropriate for Arabic (e.g. `'Cairo'` from Google Fonts — add `google_fonts` to pubspec if needed).

### Admin Dashboard Core

- [ ] T031 Create `apps/admin/src/services/api.ts`: create an Axios instance with `baseURL: import.meta.env.VITE_API_BASE_URL`. Add a request interceptor: reads `accessToken` from Zustand auth store (or localStorage), adds `Authorization: Bearer <token>` header. Add a response interceptor: on 401, call `POST /auth/refresh` with stored `refreshToken`, update auth store, retry original request. On second 401, call `authStore.logout()` and redirect to `/login`.

- [ ] T032 [P] Create `apps/admin/src/stores/auth.store.ts`: Zustand store with state: `{ adminId: string|null, accessToken: string|null, refreshToken: string|null }`. Actions: `setTokens(accessToken, refreshToken, adminId)`, `logout()` (clears state + localStorage). Persist tokens to `localStorage` under key `'clinic_admin_auth'` using Zustand `persist` middleware.

- [ ] T033 [P] Create `apps/admin/src/i18n/ar.json`: JSON object with Arabic string keys used across admin UI. Start with keys needed for Phase 1: `"login"`, `"email"`, `"password"`, `"loginButton"`, `"verificationQueue"`, `"pendingDoctors"`, `"pendingClinics"`, `"approve"`, `"reject"`, `"rejectionReason"`, `"submitRejection"`, `"approved"`, `"rejected"`, `"documentView"`, `"noReason"`. All values in Arabic. Example: `"login": "تسجيل الدخول"`.

- [ ] T034 Create `apps/admin/src/App.tsx`: set up React Router v6 with `<BrowserRouter>`. Routes: `/login` → `AdminLoginPage`, `/` → redirect to `/verification-queue` if authenticated, `/verification-queue` → `VerificationQueuePage` (protected), `/verification/:id` → `VerificationDetailPage` (protected). Create a `ProtectedRoute` wrapper that checks `authStore.accessToken` — if null, redirects to `/login`. Wrap the whole app in `<QueryClientProvider client={queryClient}>`.

- [ ] T035 Create `apps/admin/src/main.tsx`: render `<App />` inside `<React.StrictMode>`. Import `./index.css` for Tailwind. This is the Vite entry point.

**Checkpoint — Foundation complete. All user story phases can now begin.**

---

## Phase 3: User Story 1 — Patient Registration & Login (Priority: P1) 🎯 MVP

**Goal**: A new patient can register via phone OTP (Firebase Auth), complete their profile, and reach the home screen. A returning patient can log in.

**Independent Test**: Follow `specs/001-foundation-auth/quickstart.md` section 6 "Patient flow". Open Flutter app, enter phone number, receive and enter OTP, fill name/age/gender, confirm patient home screen is visible. Test the returning-patient path by logging in again with the same phone. Test expired OTP shows an error and allows re-send.

- [ ] T036 [US1] Create `apps/backend/src/models/patient.model.js`: schema per `data-model.md` "Collection: patients". Fields: `userId` (ObjectId, ref `User`, required, unique), `fullName` (String, required, trim), `age` (Number, required, min 1, max 120), `gender` (String enum `['male','female']`, required), `fcmToken` (String, default null), timestamps. Indexes on `userId`. Export as `Patient`.

- [ ] T037 [US1] Create `apps/backend/src/services/firebase.service.js`: export `verifyFirebaseToken(idToken)` — calls `admin.auth().verifyIdToken(idToken)`. Returns the decoded token object (contains `uid` and `phone_number`). Throws `AppError('Invalid Firebase token', 'INVALID_FIREBASE_TOKEN', 401)` if verification fails.

- [ ] T038 [US1] Create `apps/backend/src/services/patient.service.js`: export three functions:
  1. `handlePatientOtp(phone)` — validate E.164 format (regex `^\+[1-9]\d{7,14}$`), return `{ message: 'OTP handled by Firebase client SDK' }` (the actual OTP sending is done client-side by Firebase; this endpoint just validates the phone format).
  2. `verifyPatientToken(firebaseIdToken)` — call `firebase.service.verifyFirebaseToken()`. Extract `uid` and `phone_number`. Find existing `User` with `firebaseUid: uid`. If found: generate access + refresh tokens and return `{ isNewUser: false, accessToken, refreshToken, patient: {...} }`. If NOT found: create `User` with `role: 'patient', status: 'active', firebaseUid: uid, phone: phone_number`. Return `{ isNewUser: true, accessToken, refreshToken }`. (New users still need profile completion.)
  3. `completePatientProfile(userId, { fullName, age, gender })` — check no `Patient` doc exists for `userId` yet (else throw `ALREADY_REGISTERED`). Create `Patient` doc. Return the created doc.

- [ ] T039 [US1] Create `apps/backend/src/routes/v1/auth/patient.routes.js`: Express router with three routes per `contracts/auth-api.md` "Patient Authentication":
  1. `POST /send-otp` → call `patient.service.handlePatientOtp(req.body.phone)`; return 200
  2. `POST /verify-otp` → call `patient.service.verifyPatientToken(req.body.firebaseIdToken)`; return tokens
  3. `POST /complete-registration` → requires `authenticate` + `requireRole('patient')` middleware; call `patient.service.completePatientProfile(req.user.userId, req.body)`; return 200

- [ ] T040 [US1] Create `apps/backend/src/routes/v1/index.js`: central router that mounts all sub-routers. Mount:
  - `/auth/patient` → `./auth/patient.routes.js`
  - `/auth/token` → `./auth/token.routes.js` (already created in T023)
  Then in `apps/backend/src/app.js`, import this router and mount it at `/api/v1`.

- [ ] T041 [P] [US1] Create `apps/mobile/lib/features/auth/data/auth_remote_datasource.dart`: class `AuthRemoteDatasource` that takes `ApiClient`. Methods for patient: `sendOtp(String phone)` → POST `/auth/patient/send-otp`, `verifyOtp(String firebaseIdToken)` → POST `/auth/patient/verify-otp`, `completeProfile(String fullName, int age, String gender)` → POST `/auth/patient/complete-registration`. Each method returns the `data` field from the response JSON.

- [ ] T042 [P] [US1] Create `apps/mobile/lib/features/auth/data/auth_repository.dart`: abstract class `AuthRepository` and implementation `AuthRepositoryImpl`. Delegates to `AuthRemoteDatasource`. Wraps Dio exceptions in domain-level errors. Returns `Either<Failure, T>` (or use simple exceptions if not using dartz). Methods: `sendOtp(phone)`, `verifyOtp(firebaseIdToken)`, `completeProfile(fullName, age, gender)`.

- [ ] T043 [US1] Create `apps/mobile/lib/features/auth/bloc/auth_event.dart`: define events as `sealed` classes (or abstract with subclasses):
  - `PatientSendOtp(String phone)`
  - `PatientVerifyOtp(String firebaseIdToken)`
  - `PatientCompleteProfile(String fullName, int age, String gender)`

- [ ] T044 [US1] Create `apps/mobile/lib/features/auth/bloc/auth_state.dart`: define states:
  - `AuthInitial`
  - `AuthLoading`
  - `AuthSuccess` — with `role: String`, `status: String`
  - `AuthError` — with `message: String`
  - `PatientNeedsProfile` — token available but profile not yet complete
  These will be extended for doctor/clinic stories in later phases.

- [ ] T045 [US1] Create `apps/mobile/lib/features/auth/bloc/auth_bloc.dart`: `AuthBloc extends Bloc<AuthEvent, AuthState>`. Handle:
  - `PatientSendOtp` → call `authRepository.sendOtp()`, emit `AuthLoading` then result.
  - `PatientVerifyOtp` → call `authRepository.verifyOtp()`, save tokens via `TokenStorage`, emit `AuthSuccess` (isNewUser=false) or `PatientNeedsProfile` (isNewUser=true).
  - `PatientCompleteProfile` → call `authRepository.completeProfile()`, emit `AuthSuccess`.
  On any error emit `AuthError` with the error message.

- [ ] T046 [P] [US1] Create `apps/mobile/lib/features/auth/presentation/patient/phone_input_screen.dart`: RTL screen. Arabic title `"تسجيل الدخول / إنشاء حساب"`. A `TextFormField` for phone number (use `+20` prefix hint). A submit button labeled `"إرسال رمز التحقق"`. On tap: use Firebase Auth client SDK `FirebaseAuth.instance.verifyPhoneNumber()` to trigger OTP. On `codeSent` callback: navigate to OTP screen passing `verificationId`. All displayed strings must come from `AppLocalizations` — do NOT hardcode Arabic text in Dart files (constitution principle V).

- [ ] T047 [P] [US1] Create `apps/mobile/lib/features/auth/presentation/patient/otp_verify_screen.dart`: accepts `verificationId` as route parameter. Six-digit OTP input (use a pin-code input widget or 6 `TextFormField`s). A "تحقق" (Verify) button. On submit: create `PhoneAuthCredential` from verificationId + smsCode, sign in with `FirebaseAuth.instance.signInWithCredential()`, get ID token via `user.getIdToken()`, dispatch `PatientVerifyOtp` event to `AuthBloc`. On `AuthSuccess` → go to `/patient/home`. On `PatientNeedsProfile` → go to `/patient/profile`. On `AuthError` → show SnackBar. Include "إعادة إرسال الرمز" (resend) button.

- [ ] T048 [US1] Create `apps/mobile/lib/features/auth/presentation/patient/profile_complete_screen.dart`: three fields — `fullName` (Arabic label `"الاسم الكامل"`), `age` (numeric, label `"العمر"`), `gender` dropdown (`"ذكر" / "أنثى"`). Submit button `"حفظ وإكمال"`. On submit dispatch `PatientCompleteProfile` event. On `AuthSuccess` go to `/patient/home`.

- [ ] T049 [US1] Create placeholder `apps/mobile/lib/features/auth/presentation/patient/patient_home_screen.dart`: simple Scaffold with AppBar title `"الرئيسية"` and a centered text `"مرحباً بك"`. This will be replaced in Phase 2 of the project.

**Checkpoint — User Story 1 complete**: Patient registration and login are fully functional. Run the quickstart smoke test for the patient flow before proceeding.

---

## Phase 4: User Story 2 — Doctor Registration & Document Upload (Priority: P2)

**Goal**: A doctor can register with email + password, upload national ID and medical license, and see a "pending approval" screen. The account is locked until admin approves.

**Independent Test**: From fresh state, register a new doctor email, fill all fields, upload two files (one JPEG, one PDF), submit. Confirm the Flutter app shows the pending approval screen. Confirm the doctor cannot navigate to any other screen. Confirm a bad submission (missing file) shows a validation error.

- [ ] T050 [US2] Create `apps/backend/src/models/doctor.model.js`: schema per `data-model.md` "Collection: doctors". Fields: `userId` (ObjectId, ref `User`, required, unique), `fullName` (String, required, trim), `specialty` (String, required, trim), `nationalIdNumber` (String, required, trim), `licenseNumber` (String, required, trim), `verificationDocuments` (Array of ObjectId, ref `VerificationDocument`, default []), `rejectionReason` (String, default null), `reviewedBy` (ObjectId, ref `User`, default null), `reviewedAt` (Date, default null), `fcmToken` (String, default null), timestamps. Index on `userId`. Export as `Doctor`.

- [ ] T051 [US2] Create `apps/backend/src/services/doctor.service.js`: export four functions:
  1. `registerDoctor({ email, password, fullName, specialty, nationalIdNumber, licenseNumber })` — check email not in use (throw `EMAIL_EXISTS`). Hash password with `bcrypt.hash(password, 12)`. Create `User` with `role:'doctor', status:'pending'`. Create `Doctor` doc. Generate access token (role='doctor', status='pending') and return `{ doctorId, status:'pending' }`.
  2. `uploadDoctorDocuments(userId, files)` — `files` is `{ nationalId, medicalLicense }` from Multer `req.files`. Both are required (throw `MISSING_DOCUMENTS` if absent). Call `storage.service.uploadDocument()` for each. Delete any existing `VerificationDocument` docs for this owner (re-submission replaces all). Create two new `VerificationDocument` records. Return `{ documentsUploaded: 2, status: 'pending' }`.
  3. `loginDoctor({ email, password })` — find user by email + role 'doctor'. Compare password. Check status not 'suspended'. Return access+refresh tokens and doctor profile.
  4. `getDoctorStatus(userId)` — return current status and rejectionReason from User+Doctor docs.

- [ ] T052 [US2] Create `apps/backend/src/routes/v1/auth/doctor.routes.js`: three routes per `contracts/auth-api.md` "Doctor Authentication":
  1. `POST /register` → `doctor.service.registerDoctor()`, return 201
  2. `POST /upload-documents` → `authenticate` + `requireRole('doctor')` + `uploadVerificationDocs` middleware; call `doctor.service.uploadDoctorDocuments(req.user.userId, req.files)`
  3. `POST /login` → `doctor.service.loginDoctor()`
  Mount this in `apps/backend/src/routes/v1/index.js` at `/auth/doctor`.

- [ ] T053 [US2] Add doctor routes to `apps/backend/src/routes/v1/index.js`: add line `router.use('/auth/doctor', require('./auth/doctor.routes'))` below the existing patient route mount.

- [ ] T054 [P] [US2] Add doctor methods to `apps/mobile/lib/features/auth/data/auth_remote_datasource.dart`: add `registerDoctor(email, password, fullName, specialty, nationalIdNumber, licenseNumber)` → POST `/auth/doctor/register`; `uploadDoctorDocuments(File nationalId, File medicalLicense)` → POST `/auth/doctor/upload-documents` as multipart form data using Dio `FormData.fromMap`; `loginDoctor(email, password)` → POST `/auth/doctor/login`.

- [ ] T055 [P] [US2] Create `apps/mobile/lib/features/auth/presentation/doctor/doctor_register_screen.dart`: RTL form with fields: email, password (obscured), fullName, specialty (dropdown with a few options: `"طب عام"`, `"جلدية"`, `"نفسية"`, `"تغذية"`), nationalIdNumber, licenseNumber. Submit button. Dispatch `DoctorRegister` event (add this event to `auth_event.dart`). On success navigate to `/doctor/upload`.

- [ ] T056 [P] [US2] Create `apps/mobile/lib/features/auth/presentation/doctor/doctor_upload_docs_screen.dart`: two file picker buttons — `"رفع الهوية الوطنية"` (nationalId) and `"رفع رخصة المزاولة"` (medicalLicense). Use `file_picker` package to pick PDF/images. Show file names when picked. Submit button dispatches `DoctorUploadDocuments` event. On success navigate to `/doctor/pending`.

- [ ] T057 [US2] Create `apps/mobile/lib/features/auth/presentation/doctor/doctor_pending_screen.dart`: centered screen with an hourglass icon, Arabic title `"في انتظار المراجعة"`, body text `"تم استلام طلبك وسيتم مراجعته خلال 24-48 ساعة"`. No navigation away — this screen is shown to all pending doctors. Add an `"إعادة الإرسال"` (resubmit) button visible only when status is `'rejected'`.

- [ ] T058 [US2] Extend `apps/mobile/lib/features/auth/bloc/auth_event.dart` and `auth_state.dart` for doctor flows: add events `DoctorRegister({required String email, required String password, ...})`, `DoctorUploadDocuments({required File nationalId, required File medicalLicense})`. Add states `DoctorRegistered` (navigate to upload), `DocumentsUploaded` (navigate to pending). Update `auth_bloc.dart` to handle these events.

**Checkpoint — User Story 2 complete**: Doctor registration and document upload work. The doctor sees the pending screen. Test with a missing file to confirm the validation error.

---

## Phase 5: User Story 4 — Admin Login & Verification Queue (Priority: P2)

**Goal**: Admin can log in to the web dashboard, see a queue of pending doctors and clinics, view their documents, and approve or reject with a reason.

**Independent Test**: Using the seeded admin credentials (`scripts/seed-admin.js`), log in at `http://localhost:5173/login`. Confirm the verification queue page loads and shows the pending doctor from US2. Click the doctor entry, view the document (signed URL). Approve the doctor. Confirm the doctor's status in MongoDB changes to `'active'`. Reject a different entry with a reason. Confirm rejection reason is stored.

- [ ] T059 [US4] Create `apps/backend/src/services/admin.service.js`: export five functions:
  1. `loginAdmin({ email, password })` — find User by email + role 'admin'. Compare bcrypt. Return access+refresh tokens.
  2. `getVerificationQueue({ type, page, limit })` — query Users with `status:'pending'` (filter by `role` if `type` is 'doctor' or 'clinic'). Populate related Doctor or Clinic doc. Return paginated list with fields: `id, type(role), fullName, email, submittedAt(createdAt), documentCount`.
  3. `getDocumentSignedUrl(userId, docId)` — verify `docId` belongs to `userId`. Call `storage.service.getSignedUrl(doc.storageRef)`. Return signed URL.
  4. `approveAccount(accountId, adminUserId)` — set `User.status = 'active'`. Find Doctor or Clinic doc, set `reviewedBy = adminUserId, reviewedAt = now`. Call `notification.service.sendPushNotification()` with FCM token from Doctor/Clinic doc, message `"تم قبول حسابك"`. Call `notification.service.sendEmail()` to the user's email. Return `{ id, status: 'active' }`.
  5. `rejectAccount(accountId, adminUserId, reason)` — validate `reason` length ≥ 10 chars (throw `REASON_REQUIRED`). Set `User.status = 'rejected'`. Set `Doctor/Clinic.rejectionReason = reason, reviewedBy, reviewedAt`. Send push + email with rejection reason. Return `{ id, status: 'rejected' }`.

- [ ] T060 [US4] Create `apps/backend/src/routes/v1/auth/admin.routes.js`: one route — `POST /login` → `admin.service.loginAdmin()`. Mount at `/auth/admin` in `apps/backend/src/routes/v1/index.js`.

- [ ] T061 [US4] Create `apps/backend/src/routes/v1/admin/verification.routes.js`: four routes, all protected with `authenticate + requireRole('admin')`:
  1. `GET /queue` → `admin.service.getVerificationQueue(req.query)`
  2. `GET /:id/documents/:docId` → `admin.service.getDocumentSignedUrl()`
  3. `POST /:id/approve` → `admin.service.approveAccount(req.params.id, req.user.userId)`
  4. `POST /:id/reject` → `admin.service.rejectAccount(req.params.id, req.user.userId, req.body.reason)`
  Mount at `/admin/verification` in `apps/backend/src/routes/v1/index.js`.

- [ ] T062 [US4] Update `apps/backend/src/routes/v1/index.js`: add two more mounts: `router.use('/auth/admin', require('./auth/admin.routes'))` and `router.use('/admin/verification', require('./admin/verification.routes'))`.

- [ ] T063 [P] [US4] Create `apps/admin/src/pages/auth/AdminLoginPage.tsx`: shadcn/ui `Card` centered on screen. `CardHeader` with Arabic title from `ar.json`. `Form` with `email` and `password` fields (shadcn `Input` + `Label`). Submit `Button` labeled with `ar.login`. On submit: call `POST /auth/admin/login` via `api.ts`. On success: call `authStore.setTokens()` and navigate to `/verification-queue`. On error: show `Alert` with error message. All text from `ar.json` — never hardcode Arabic.

- [ ] T064 [P] [US4] Create `apps/admin/src/pages/verification/VerificationQueuePage.tsx`: use TanStack Query `useQuery` to fetch `GET /admin/verification-queue`. Render shadcn/ui `Table` with columns: Name, Type (Doctor/Clinic), Email, Submitted Date, Documents count, Actions. Each row has a `Button` "مراجعة" that navigates to `/verification/:id`. Add filter `Tabs` for All / Doctors / Clinics. Use TanStack Query `keepPreviousData` for pagination.

- [ ] T065 [US4] Create `apps/admin/src/pages/verification/VerificationDetailPage.tsx`: fetch account details from queue data (or a separate GET endpoint). Show account info (name, email, type, submitted date). For each document show a `Button` "عرض الوثيقة" — on click: fetch signed URL from `GET /admin/verification/:id/documents/:docId`, open in a new tab. Two action buttons: `"قبول"` (approve) calls `POST /admin/verification/:id/approve`; `"رفض"` (reject) opens a shadcn `Dialog` with a `Textarea` for rejection reason, confirm button calls `POST /admin/verification/:id/reject`. On success: invalidate the queue query and navigate back to `/verification-queue`.

**Checkpoint — User Story 4 complete**: Admin can log in, view queue, view documents, approve and reject. Run the quickstart admin flow smoke test.

---

## Phase 6: User Story 3 — Clinic Registration & Document Upload (Priority: P3)

**Goal**: A clinic can register with email + password, provide clinic name/address/commercial registration number, upload a business document, and see a pending approval screen.

**Independent Test**: Register a new clinic from Flutter app. Upload one business document. Confirm pending screen. Open admin dashboard, verify the clinic appears in the queue alongside the doctor from US2. Approve the clinic and confirm status changes.

- [ ] T066 [US3] Create `apps/backend/src/models/clinic.model.js`: schema per `data-model.md` "Collection: clinics". Fields: `userId` (ObjectId, ref `User`, required, unique), `clinicName` (String, required, trim), `address` (String, required, trim), `commercialRegNumber` (String, required, trim), `verificationDocuments` (Array of ObjectId ref VerificationDocument, default []), `rejectionReason` (String, default null), `reviewedBy` (ObjectId, ref User, default null), `reviewedAt` (Date), `fcmToken` (String, default null), timestamps. Index on `userId`. Export as `Clinic`.

- [ ] T067 [US3] Create `apps/backend/src/services/clinic.service.js`: export three functions (mirror of `doctor.service.js`):
  1. `registerClinic({ email, password, clinicName, address, commercialRegNumber })` — same pattern as `registerDoctor` but creates `Clinic` doc instead.
  2. `uploadClinicDocuments(userId, files)` — requires `businessDoc` in `files`. Upload one document with type `'commercial_registration'`. Replace any existing docs. Return `{ documentsUploaded: 1, status: 'pending' }`.
  3. `loginClinic({ email, password })` — same pattern as `loginDoctor` but looks up `role: 'clinic'`.

- [ ] T068 [US3] Create `apps/backend/src/routes/v1/auth/clinic.routes.js`: three routes per `contracts/auth-api.md` "Clinic Authentication". Mount at `/auth/clinic` in `apps/backend/src/routes/v1/index.js`. Add `router.use('/auth/clinic', require('./auth/clinic.routes'))` in index.js.

- [ ] T069 [P] [US3] Create `apps/mobile/lib/features/auth/presentation/clinic/clinic_register_screen.dart`: RTL form with fields: email, password, clinicName (`"اسم العيادة"`), address (`"العنوان"`), commercialRegNumber (`"رقم السجل التجاري"`). Submit dispatches `ClinicRegister` event. Navigate to `/clinic/upload` on success.

- [ ] T070 [P] [US3] Create `apps/mobile/lib/features/auth/presentation/clinic/clinic_upload_docs_screen.dart`: one file picker button `"رفع وثيقة التسجيل التجاري"`. Submit dispatches `ClinicUploadDocuments` event. Navigate to `/clinic/pending` on success.

- [ ] T071 [US3] Create `apps/mobile/lib/features/auth/presentation/clinic/clinic_pending_screen.dart`: same UX pattern as `doctor_pending_screen.dart` — centered screen, hourglass icon, Arabic message, resubmit button for rejected accounts.

- [ ] T072 [US3] Extend `apps/mobile/lib/features/auth/bloc/auth_event.dart` with `ClinicRegister` and `ClinicUploadDocuments` events. Extend `auth_state.dart` with `ClinicRegistered` and `ClinicDocumentsUploaded` states. Update `auth_bloc.dart` to handle them.

- [ ] T073 [P] [US3] Add clinic methods to `apps/mobile/lib/features/auth/data/auth_remote_datasource.dart`: `registerClinic(...)`, `uploadClinicDocuments(File businessDoc)`, `loginClinic(email, password)`.

**Checkpoint — User Story 3 complete**: Clinic registration and document upload work. Queue in admin shows both doctors and clinics.

---

## Phase 7: User Story 5 — Approved Account Gains Full Access (Priority: P3)

**Goal**: After admin approval, the doctor or clinic receives a notification and can access platform features. After rejection, they see the reason and can re-submit documents.

**Independent Test**: Use admin dashboard to approve the pending doctor from US2. Within 60 seconds the Flutter app (running as that doctor) should show a push notification "تم قبول حسابك". Re-open the app and confirm the pending screen is gone and the doctor home screen is accessible. Then test rejection: reject a clinic with a reason; the clinic app shows the rejection reason and a re-submit button.

- [ ] T074 [US5] Verify `apps/backend/src/services/admin.service.js` `approveAccount()` sends both FCM notification and SendGrid email (implemented in T059). Add the doctor/clinic home screen placeholder route to the Flutter router. Specifically: when a doctor/clinic logs in and their status is `'active'`, `app_router.dart` redirect should route to `/doctor/home` or `/clinic/home` instead of pending. Create placeholder screens at `apps/mobile/lib/features/auth/presentation/doctor/doctor_home_screen.dart` and `apps/mobile/lib/features/auth/presentation/clinic/clinic_home_screen.dart`.

- [ ] T075 [US5] Create `apps/mobile/lib/features/auth/presentation/shared/rejected_screen.dart`: show rejection reason (passed via route params or from stored token status). Arabic title `"تم رفض طلبك"`. Body text shows the `rejectionReason` from the API. Button `"إعادة إرسال الوثائق"` — navigates back to the appropriate upload screen (`/doctor/upload` or `/clinic/upload`). The re-submit flow reuses the existing upload routes (backend `uploadDoctorDocuments` / `uploadClinicDocuments` already replaces old documents and resets status to `pending`).

- [ ] T076 [US5] Add FCM token registration after login: create `PATCH /api/v1/users/fcm-token` endpoint in a new `apps/backend/src/routes/v1/user.routes.js`. Protected by `authenticate`. Updates `Doctor.fcmToken` or `Clinic.fcmToken` based on `req.user.role`. In Flutter, after any successful login call this endpoint with the token from `FirebaseMessaging.instance.getToken()`. Mount in `apps/backend/src/routes/v1/index.js` at `/users`.

- [ ] T077 [US5] Handle FCM background messages in Flutter: in `apps/mobile/lib/main.dart`, call `FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler)` before `runApp()`. Define `_firebaseMessagingBackgroundHandler` as a top-level function that logs the message. Add `FirebaseMessaging.onMessage.listen(...)` for foreground notifications — show using `flutter_local_notifications` with Arabic title/body.

**Checkpoint — User Story 5 complete**: Full approval/rejection loop verified end-to-end.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Security hardening, RTL audit, and final validation.

- [ ] T078 [P] Add rate limiting to OTP endpoint: in `apps/backend/src/routes/v1/auth/patient.routes.js`, apply `express-rate-limit` to `POST /send-otp` — max 5 requests per 15 minutes per IP. Use `rateLimit({ windowMs: 15 * 60 * 1000, max: 5, message: { success: false, code: 'OTP_RATE_LIMIT', message: 'Too many requests' } })`.

- [ ] T079 [P] Add global error logging in `apps/backend/src/app.js`: in the catch-all error handler (already created in T024), log errors to console with stack trace if `NODE_ENV !== 'production'`. In production log just the error code and message (never expose stack traces to clients).

- [ ] T080 [P] Arabic strings audit — Flutter: search `apps/mobile/lib/` for any hardcoded Arabic string literals NOT inside `.arb` files. Every Arabic string must be referenced via `AppLocalizations.of(context)!.keyName`. Run `grep -r '"[ء-ي]' apps/mobile/lib/` to find violations. Fix any found.

- [ ] T081 [P] Arabic strings audit — Admin: search `apps/admin/src/` for any hardcoded Arabic string literals NOT inside `ar.json`. Every Arabic text rendered to screen must use the `ar.json` key. Run `grep -r '"[ء-ي]' apps/admin/src/` to find violations. Fix any found.

- [ ] T082 Validate Tailwind RTL classes: in `apps/admin/`, search all `.tsx` files for directional CSS classes (`ml-`, `mr-`, `pl-`, `pr-`, `text-left`, `text-right`, `float-left`, `float-right`) used WITHOUT the `rtl:` prefix. Per constitution principle V, all directional classes must use the `rtl:` variant. Example: `ml-4` must be `rtl:mr-4` (or use logical `ms-4` / `me-4` instead). Fix all violations.

- [ ] T083 Run quickstart smoke test: follow `specs/001-foundation-auth/quickstart.md` section 6 completely — patient flow, doctor flow, admin flow, token refresh flow. All four paths must pass with no errors before this phase is complete.

- [ ] T084 [P] Create `apps/backend/README.md` with one-paragraph description of the backend, how to start it, and how to run seed + tests. Create `apps/admin/README.md` and `apps/mobile/README.md` similarly. These are for developer onboarding only — no design docs needed here.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundation)**: Depends on Phase 1 — BLOCKS all user stories
- **Phase 3 (US1 Patient)**: Depends on Phase 2 only — no story dependencies
- **Phase 4 (US2 Doctor)**: Depends on Phase 2 — independent of US1
- **Phase 5 (US4 Admin)**: Depends on Phase 2 AND logically needs US2 data in the queue; complete Phase 4 first
- **Phase 6 (US3 Clinic)**: Depends on Phase 2 — independent; can run alongside Phase 4
- **Phase 7 (US5 Access)**: Depends on Phase 4 AND Phase 5 (needs both approval mechanism and pending accounts)
- **Phase 8 (Polish)**: Depends on all story phases complete

### Within Each Phase

- Backend: models → services → routes → mount in index.js
- Flutter: datasource → repository → bloc events/states → bloc → screens
- Admin: api service → store → pages

### Parallel Opportunities

Within Phase 2 (Foundation):
```
Parallel group A (backend): T009, T010, T011, T012, T013 — all independent config/utils
Parallel group B (models):  T014, T015, T016 — once config is done
Parallel group C (services): T017, T021, T022 — once models done
Parallel group D (cross-platform): T027+T028 (Flutter), T031+T032+T033 (Admin) — parallel with backend work
```

Within Phase 3 (US1):
```
Parallel group: T036, T037, T041, T042 — models + datasource + repository
Then:           T038 (service), T043+T044 (bloc events+states), T046+T047 (screens)
Then:           T039, T040, T045, T048 — routes + bloc + profile screen
```

---

## Parallel Execution Example — Phase 2 Foundation

```
Round 1 — Start these together:
  Task: "Create apps/backend/src/config/env.js" (T009)
  Task: "Create apps/backend/src/config/db.js" (T010)
  Task: "Create apps/backend/src/config/firebase.js" (T011)
  Task: "Create apps/backend/src/utils/response.js" (T012)
  Task: "Create apps/backend/src/utils/errors.js" (T013)

Round 2 — After Round 1:
  Task: "Create user.model.js" (T014)
  Task: "Create refresh-token.model.js" (T015)
  Task: "Create verification-document.model.js" (T016)

Round 3 — After Round 2:
  Task: "Create token.service.js" (T017)
  Task: "Create storage.service.js" (T021)
  Task: "Create notification.service.js" (T022)
  Task: "Create auth middleware" (T018)
  Task: "Create role middleware" (T019)
  Task: "Create upload middleware" (T020)
```

---

## Implementation Strategy

### MVP First (User Story 1 only — ~2 days of work)

1. Complete Phase 1: Setup (T001–T008)
2. Complete Phase 2: Foundation (T009–T035)
3. Complete Phase 3: US1 Patient (T036–T049)
4. **STOP and VALIDATE**: Run quickstart patient flow
5. You have a working patient registration + login — deployable MVP

### Incremental Delivery

1. Setup + Foundation → deployable backend skeleton
2. + US1 (Patient) → patients can register and log in (MVP)
3. + US2 (Doctor) → doctors can register and wait for approval
4. + US4 (Admin) → admins can approve/reject (platform now usable)
5. + US3 (Clinic) → clinics can register and get approved
6. + US5 (Notifications) → full approval loop with notifications
7. + Polish → production-ready

### AI Agent Execution Note

Since this will be implemented by an AI agent with limited context window, each task is designed to be completable with ONLY:
1. The task description itself
2. The referenced design document (`data-model.md`, `contracts/auth-api.md`)
3. The file(s) listed in the task

Do NOT ask the implementing agent to read all docs before starting. Give it one task at a time with its specific file path and inline implementation notes.

---

## Summary

| Phase | Tasks | Story | Parallel Opportunities |
|---|---|---|---|
| Phase 1: Setup | T001–T008 (8) | — | T003, T004, T006, T007, T008 |
| Phase 2: Foundation | T009–T035 (27) | — | Multiple rounds (see above) |
| Phase 3: US1 Patient | T036–T049 (14) | P1 | T041, T042, T046, T047 |
| Phase 4: US2 Doctor | T050–T058 (9) | P2 | T054, T055, T056 |
| Phase 5: US4 Admin | T059–T065 (7) | P2 | T063, T064 |
| Phase 6: US3 Clinic | T066–T073 (8) | P3 | T069, T070, T073 |
| Phase 7: US5 Access | T074–T077 (4) | P3 | T076, T077 |
| Phase 8: Polish | T078–T084 (7) | — | T078, T079, T080, T081, T082, T084 |
| **Total** | **84 tasks** | | |

**Suggested MVP scope**: Complete Phases 1–3 (T001–T049) to deliver working patient authentication.

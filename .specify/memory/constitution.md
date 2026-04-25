<!--
SYNC IMPACT REPORT
Version change: TEMPLATE → 1.0.0
Modified principles: All template placeholder slots replaced; 8 principles defined (3 beyond the 5-slot template default)
Added sections: Tech Stack (non-negotiable), Code Conventions
Removed sections: None (template placeholders SECTION_2/SECTION_3 replaced)
Templates requiring updates:
  ✅ .specify/memory/constitution.md — this file
  ⚠ .specify/templates/plan-template.md — Constitution Check gate is generic ("Gates determined based on constitution file");
     recommend adding Medical Platform–specific gate checklist (Security, Verification Gate, Payment, RTL, Role Separation)
  ✅ .specify/templates/spec-template.md — no constitution-specific changes required
  ✅ .specify/templates/tasks-template.md — no constitution-specific changes required
Follow-up TODOs: None — all required fields populated
-->

# Medical Platform Constitution

## Core Principles

### I. Security First (NON-NEGOTIABLE)

All medical data MUST be encrypted at rest and in transit using industry-standard
encryption (TLS 1.2+ for transit; AES-256 or equivalent for storage). Sensitive
fields (diagnoses, prescriptions, chat messages) MUST NOT be stored or transmitted
in plain text. Every API endpoint MUST enforce authentication and authorization
checks before any data access occurs.

### II. Verification Gate (NON-NEGOTIABLE)

No doctor or clinic account MUST go live without passing a manual document review
performed by an admin. Accounts awaiting review MUST be placed in a `pending`
status that prevents patient-facing visibility and service delivery. Verified
accounts MUST be marked with a `verified: true` flag set only by admin action —
never by the account holder.

### III. Payment Before Service (NON-NEGOTIABLE)

A paid consultation receipt MUST exist before a doctor can view or respond to a
patient's question. The backend MUST validate payment status on every
consultation-access request. No payment bypass or free-tier exception is permitted
without an explicit admin-level override logged in the audit trail.

### IV. Trust Signals

Verified badges MUST be displayed on every screen where a doctor or clinic profile
appears — search results, profile pages, booking flows, and chat headers.
Badge rendering MUST read from the authoritative `verified` field returned by the
API; it MUST NOT be inferred from local state or cached data.

### V. RTL / Arabic (NON-NEGOTIABLE)

Every user-facing screen MUST render correctly in Arabic with right-to-left layout.
Web admin dashboard: `<html dir="rtl" lang="ar">` + Tailwind `rtl:` variant on all
directional classes. Flutter: locale set to `ar`, `Directionality` widget wrapping
all screens. All user-visible strings MUST live in `ar.json` (web) or `.arb`
(Flutter) — no hardcoded Arabic text anywhere in source code.

### VI. Role Separation (NON-NEGOTIABLE)

Patient, Doctor, Clinic, and Admin are distinct roles with fully isolated flows,
data scopes, and UI surfaces. Cross-role data access MUST be blocked at the API
middleware level, not only at the UI level. A user authenticated as one role MUST
NOT call endpoints or read data belonging to another role without explicit
multi-role grant logic reviewed by an admin.

### VII. HIPAA-Aligned Data Handling

Patient records (medical history, diagnoses, prescriptions, chat logs) are private
by default. Sharing MUST require an explicit, logged action by the patient. Records
MUST NOT be included in bulk exports, analytics pipelines, or third-party API
responses without patient consent. Retention and deletion policies MUST be
documented per record type before a feature involving patient data ships.

### VIII. No Feature Creep Per Phase

Each development phase MUST implement only the features explicitly listed in that
phase's specification. Features not in scope MUST be deferred to a future phase
via a formal spec entry — they MUST NOT be added ad-hoc during implementation.
The Constitution Check gate in every plan.md MUST flag any scope addition as a
violation requiring written justification in the Complexity Tracking table.

## Tech Stack

The following stack is non-negotiable for the entire project. Any deviation requires
a constitution amendment (MAJOR version bump) with written justification and project
lead sign-off.

| Layer | Technology |
|---|---|
| Mobile | Flutter (Dart) — iOS + Android |
| Web Admin Dashboard | React.js + Tailwind CSS + shadcn/ui |
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| Real-time | Socket.IO (chat + live updates) |
| Auth — Patients | Firebase Auth (phone OTP) |
| Auth — Doctors / Clinics / Admin | JWT (short-lived access + refresh tokens) |
| Payments | PayTabs (`paytabs_pt2` for Node.js; `flutter_paytabs_bridge` for Flutter) |
| File Storage | Firebase Storage or AWS S3 |
| Push Notifications | Firebase Cloud Messaging (FCM) |

## Code Conventions

The following conventions MUST be followed across all implementations.

**Admin Dashboard (React.js)**
- Use `shadcn/ui` components exclusively — no custom UI primitives.
- Tailwind utility classes only; no custom CSS files except `globals.css` for CSS variables.
- Theme via CSS variables in `globals.css` (`--primary`, `--secondary`, etc.).
- RTL: `<html dir="rtl" lang="ar">` + Tailwind `rtl:` variant on all directional classes.
- All Arabic strings in `ar.json` i18n files — never hardcoded.

**Flutter (Mobile)**
- State management: BLoC or Riverpod (no mixing within a single feature module).
- HTTP: `Dio` package exclusively.
- Navigation: `go_router`.
- All Arabic strings in `.arb` files — never hardcoded.

**Backend (Node.js + Express)**
- All API routes versioned under `/api/v1/...`.
- Every endpoint MUST pass through authentication middleware except explicitly
  designated public auth routes (`/api/v1/auth/*`).
- Error response shape: `{ success: false, message: string, code: string }`.
- Success response shape: `{ success: true, data: any }`.

## Governance

This constitution supersedes all other project practices and documentation. Any
conflict between the constitution and other artifacts (READMEs, PRDs, code comments)
resolves in favor of the constitution.

**Amendment Procedure**:
1. Author a written proposal describing the change and its rationale.
2. Classify the version bump: MAJOR (removes or redefines a principle), MINOR
   (adds a principle or materially expands guidance), PATCH (clarification or
   wording fix only).
3. Obtain approval from the project lead before merging.
4. Update this file, increment the version, set `Last Amended` to today's date.
5. Propagate changes to dependent templates (plan, spec, tasks) as needed and
   record them in the Sync Impact Report comment at the top of this file.

**Compliance Reviews**: Every `plan.md` MUST include a Constitution Check section
completed before Phase 0 research begins and re-verified after Phase 1 design.
Any violation MUST be recorded in the Complexity Tracking table with written
justification. No plan advances to implementation without a passing Constitution
Check.

**Version**: 1.0.0 | **Ratified**: 2026-04-25 | **Last Amended**: 2026-04-25

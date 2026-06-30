# Yntra Sparks — MVP Requirements

**Status:** Draft v1 — Day 1
**Owner:** [Intern A / Intern B]
**Last updated:** 2026-06-30

## 1. Product Summary

Yntra Sparks is a B2B platform that gives schools access to STEM learning kits.
For the MVP, the product serves **schools only** — no student or parent-facing
surface exists yet.

## 2. Roles & Permissions

### 2.1 Super Admin (Founder)

- [ ] Login
- [ ] Add / edit / deactivate schools
- [ ] Add / edit / delete kits
- [ ] Upload kit description + thumbnail
- [ ] Add YouTube video links to a kit (multiple, ordered)
- [ ] Manage categories (create / edit / delete)
- [ ] Manage School Admins (create, deactivate)
- [ ] Activate / deactivate schools
- [ ] (Future) Upload PDFs/manuals
- [ ] (Future) View analytics

### 2.2 School Admin / Principal

- [ ] Login
- [ ] View kits purchased by their own school only
- [ ] Add teacher
- [ ] Delete (deactivate) teacher
- [ ] Reset a teacher's password (admin-mediated, see §4.1)
- [ ] View list of teachers in their school
- [ ] **Cannot** edit kit content
- [ ] **Cannot** view or affect any other school's data

### 2.3 Teacher

- [ ] Login
- [ ] View kits purchased by their school (see §4.2 for assignment decision)
- [ ] Open a kit → read description, watch embedded YouTube videos
- [ ] **Cannot** modify any data
- [ ] (Future) Download PDFs/manuals

## 3. Out of Scope for MVP

Explicitly excluded — do not build, do not leave half-built stubs for:

- Student accounts / student login
- Parent accounts / parent login
- Quizzes or assessments
- Certificates
- Marketplace / payments
- Self-service "forgot password" email flow (admin-mediated only, see §4.1)
- File upload for PDFs/manuals (videos via YouTube link only)
- Analytics dashboards

## 4. Decisions Required Before Schema Lock

These are flagged from the original spec as ambiguous. Each needs a yes/no
recorded in `decisions.md` before Day 2 ER diagram work starts.

### 4.1 Password reset flow
Is "reset teacher password" purely admin-triggered (Principal sets/resets a
teacher's password directly, no email), or does it need a self-service
forgot-password email flow?
**Recommendation:** admin-mediated only for MVP. Removes SMTP/token-expiry
infrastructure entirely from MVP surface.

### 4.2 Teacher kit assignment (TeacherKit table)
Does every teacher in a school see *all* kits the school purchased, or does
the Principal assign specific kits to specific teachers?
**Recommendation:** all teachers see all school kits for MVP. Skip TeacherKit
enforcement logic; keep the table unused/optional so it's a no-op until a
real business need appears — avoids an entity migration later.

### 4.3 Category as entity vs string
Since Super Admin "manages categories," category must be a first-class
entity with its own CRUD, not a free-text column on Kit.
**Recommendation:** yes, `Category` entity now — cheap today, expensive as a
migration later.

### 4.4 School/User status as enum vs boolean
Should `School.status` and `User.active` be booleans or enums?
**Recommendation:** enum. At minimum `ACTIVE`, `INACTIVE`, and reserve room
for `PENDING_APPROVAL` later without a schema change.

### 4.5 Refresh token storage
Where does the refresh token live on the frontend — localStorage or httpOnly
cookie?
**Recommendation:** httpOnly secure cookie for refresh token; access token
held in memory (Pinia store, not localStorage) to reduce XSS exposure.

## 5. Core User Flows (summary — full diagrams in user-flows.md)

- **Super Admin:** login → dashboard → manage schools / manage kits / manage categories
- **Principal:** login → dashboard → view school's kits / manage teachers
- **Teacher:** login → dashboard → view school's kits → open kit → watch video

## 6. Non-Functional Requirements

- Role-based authorization enforced at the API layer, not just hidden in UI
- A Principal or Teacher attempting to access another school's resource must
  receive a 403, not a silent empty response
- All list endpoints must be paginated from day one (school list, kit list,
  teacher list) — cheap now, painful to retrofit
- Consistent API response envelope across all endpoints (see api-contract.md)
- Global exception handler — no raw stack traces ever returned to client

## 7. Open Questions Log

| # | Question | Status | Resolution |
|---|----------|--------|------------|
| 1 | Password reset flow | Open | — |
| 2 | TeacherKit enforcement | Open | — |
| 3 | Category as entity | Open | — |
| 4 | Status as enum | Open | — |
| 5 | Refresh token storage | Open | — |
# Frontend API Dependencies

**Status:** Living document — generated from a full audit of `frontend/src/api/*.js` against `docs/api-contract.md`, 2026-07-21.
**Purpose:** Every network call the frontend makes or is built to make, in one place, cross-referenced against what `api-contract.md` actually documents. This is **not** a backend implementation guide and does not assume anything is implemented — see the "Backend status" column on every entry.

The frontend runs entirely on mocks today (`VITE_USE_MOCK=true` by default — see `README.md` and `.env.example`). Nothing here requires backend work as part of this document; it exists so whoever picks up backend work next has a single accurate checklist instead of reverse-engineering it from `src/api/`.

## How to read each entry

- **Mock available** — does `frontend/src/api/mock/*` implement this today? (Almost always yes — that's what lets the whole app run with zero backend.)
- **Backend status** — `Documented` (in `api-contract.md`, real backend presumed to target it), `Undocumented` (frontend calls it, `api-contract.md` says nothing — confirm with backend before flipping `VITE_USE_MOCK=false`), or `Defined but unused` (a service method exists but nothing in the UI calls it).

---

## Auth

### `POST /auth/login`
- **Payload:** `{ email, password }`
- **Response:** `{ accessToken, user: { id, name, email, role, schoolId, mustChangePassword } }`
- **Auth:** none (public)
- **Roles:** any
- **Frontend service:** `authService.login` (`src/api/authService.js`)
- **Consumers:** `src/views/LoginView.vue`
- **Mock available:** yes (`src/api/mock/mockAuthService.js`, 4 demo users)
- **Backend status:** Documented (`api-contract.md` line 81)
- **Notes:** —

### `POST /auth/refresh`
- **Payload:** none (relies on the httpOnly refresh cookie — `withCredentials: true`, see `src/api/http.js`)
- **Response:** new access token (string)
- **Auth:** cookie only
- **Roles:** any
- **Frontend service:** `authService.refresh`
- **Consumers:** `stores/auth.js` (`bootstrap()`, and the 401 response interceptor in `http.js`)
- **Mock available:** yes
- **Backend status:** Documented (line 106)

### `GET /users/me`
- **Payload:** none
- **Response:** `{ id, name, email, role, schoolId, mustChangePassword }`
- **Auth:** Bearer token
- **Roles:** any authenticated user
- **Frontend service:** `authService.me`
- **Consumers:** `stores/auth.js` `bootstrap()` — called right after every refresh to hydrate `user`
- **Mock available:** yes
- **Backend status:** **Undocumented.** Not in `api-contract.md`'s Auth section. Every authenticated page depends on this working — confirm it exists (or that `/auth/refresh` should instead return the full user, and this call gets removed) before disabling mock mode.

### `POST /auth/logout`
- **Payload:** none
- **Response:** void
- **Auth:** Bearer token
- **Roles:** any
- **Frontend service:** `authService.logout`
- **Consumers:** logout buttons in `AdminLayout.vue`, `PrincipalLayout.vue`, `TeacherLayout.vue`, `ChangePasswordView.vue`
- **Mock available:** yes
- **Backend status:** Documented (line 114)

### `POST /auth/change-password`
- **Payload:** `{ currentPassword, newPassword }`
- **Response:** assumed `{ ...user }` or void — real shape unconfirmed
- **Auth:** Bearer token
- **Roles:** any authenticated user (this is the forced-password-change flow, not admin-mediated reset — that's the separate `reset-password` endpoints below)
- **Frontend service:** `authService.changePassword`
- **Consumers:** `src/views/ChangePasswordView.vue`, `stores/auth.js`
- **Mock available:** yes (`mockAuthService.changePassword` — validates current password against the mock user record)
- **Backend status:** **Undocumented — endpoint may not exist at all.** Added this session to implement the `mustChangePassword` flow described in `api-contract.md`'s login response but never given a corresponding change-password endpoint. Confirm the real path/verb/payload with backend, or that this should instead be a `PATCH /users/me/password` or similar.

---

## Schools (Super Admin)

### `GET /schools`
- **Query:** `page, size, sort`
- **Response:** `Page<School>`
- **Auth/Roles:** SUPER_ADMIN
- **Frontend service:** `schoolService.list`
- **Consumers:** `src/views/superadmin/SchoolsView.vue`
- **Mock:** yes · **Backend status:** Documented (line 122)

### `GET /schools/{id}`
- **Response:** `School`
- **Auth/Roles:** SUPER_ADMIN
- **Frontend service:** `schoolService.getById`
- **Consumers:** defined, not currently called from any view
- **Mock:** yes · **Backend status:** Undocumented (minor — trivial GET, low risk) / **Defined but unused** in the UI today

### `POST /schools`
- **Payload:** `{ name, email, address }`
- **Response:** created `School`
- **Auth/Roles:** SUPER_ADMIN
- **Frontend service:** `schoolService.create` · **Consumers:** `SchoolsView.vue`
- **Mock:** yes · **Backend status:** Documented (line 126)

### `PUT /schools/{id}`
- **Payload:** `{ name, email, address }` → updated `School`
- **Auth/Roles:** SUPER_ADMIN · **Frontend service:** `schoolService.update` · **Consumers:** `SchoolsView.vue`
- **Mock:** yes · **Backend status:** Documented (line 134)

### `PATCH /schools/{id}/status`
- **Payload:** `{ status: 'ACTIVE' | 'INACTIVE' | 'PENDING_APPROVAL' }`
- **Auth/Roles:** SUPER_ADMIN · **Frontend service:** `schoolService.setStatus` · **Consumers:** `SchoolsView.vue`
- **Mock:** yes · **Backend status:** Documented (line 139)

---

## Principals — "Manage School Admins" (Super Admin)

**Entire group is undocumented.** `requirements.md` §2.1 lists "Manage School Admins (create, deactivate)" as in-scope, but `api-contract.md` has no Principals section at all — only Schools, Categories, Kits, and Teachers. All five endpoints below need a contract section before backend work starts.

### `GET /schools/{schoolId}/principals`
- **Query:** `page, size` → `Page<Principal>`
- **Auth/Roles:** SUPER_ADMIN · **Frontend service:** `principalService.list` · **Consumers:** `src/views/superadmin/PrincipalsView.vue`
- **Mock:** yes · **Backend status:** Undocumented

### `POST /schools/{schoolId}/principals`
- **Payload:** `{ name, email }` → `{ tempPassword }` (shown once, never retrievable again — same pattern as teacher creation)
- **Auth/Roles:** SUPER_ADMIN · **Frontend service:** `principalService.create` · **Consumers:** `PrincipalsView.vue`
- **Mock:** yes · **Backend status:** Undocumented

### `DELETE /schools/{schoolId}/principals/{id}`
- **Auth/Roles:** SUPER_ADMIN · **Frontend service:** `principalService.deactivate` · **Consumers:** `PrincipalsView.vue`
- **Mock:** yes · **Backend status:** Undocumented

### `PATCH /schools/{schoolId}/principals/{id}/activate`
- **Auth/Roles:** SUPER_ADMIN · **Frontend service:** `principalService.activate` · **Consumers:** `PrincipalsView.vue`
- **Mock:** yes · **Backend status:** Undocumented

### `PATCH /schools/{schoolId}/principals/{id}/reset-password`
- **Response:** `{ tempPassword }`
- **Auth/Roles:** SUPER_ADMIN · **Frontend service:** `principalService.resetPassword` · **Consumers:** `PrincipalsView.vue`
- **Mock:** yes · **Backend status:** Undocumented

---

## Teachers (Principal)

### `GET /schools/{schoolId}/teachers`
- **Query:** `page, size` → `Page<Teacher>`
- **Auth/Roles:** PRINCIPAL (own school only) · **Frontend service:** `teacherService.list` · **Consumers:** `src/views/principal/TeachersView.vue`
- **Mock:** yes · **Backend status:** Documented (line 231)

### `POST /schools/{schoolId}/teachers`
- **Payload:** `{ name, email }` → `{ tempPassword }`
- **Auth/Roles:** PRINCIPAL · **Frontend service:** `teacherService.create` · **Consumers:** `TeachersView.vue`
- **Mock:** yes · **Backend status:** Documented (line 236)

### `DELETE /schools/{schoolId}/teachers/{teacherId}`
- **Auth/Roles:** PRINCIPAL · **Frontend service:** `teacherService.deactivate` · **Consumers:** `TeachersView.vue`
- **Mock:** yes · **Backend status:** Documented (line 246)

### `PATCH /schools/{schoolId}/teachers/{teacherId}/activate`
- **Auth/Roles:** PRINCIPAL · **Frontend service:** `teacherService.activate` · **Consumers:** `TeachersView.vue`
- **Mock:** yes · **Backend status:** **Undocumented.** Contract only covers deactivate + reset-password for teachers, not re-activate — same gap exists for Principals above. Likely just a missing doc section rather than a real design gap (activate/deactivate is symmetric everywhere else).

### `PATCH /schools/{schoolId}/teachers/{teacherId}/reset-password`
- **Response:** `{ tempPassword }`
- **Auth/Roles:** PRINCIPAL · **Frontend service:** `teacherService.resetPassword` · **Consumers:** `TeachersView.vue`
- **Mock:** yes · **Backend status:** Documented (line 251)

---

## Categories

### `GET /categories`
- **Response:** `Category[]` (not paginated — small list)
- **Auth:** contract doesn't specify read-auth explicitly; write operations are SUPER_ADMIN-only
- **Frontend service:** `categoryService.list`
- **Consumers:** `src/views/superadmin/CategoriesView.vue` **and, as of this session, `src/views/public/CategoriesView.vue`** (the unauthenticated public catalog page)
- **Mock:** yes · **Backend status:** Documented (line 151) for the admin use case, but **⚠️ confirm this endpoint is safe to call unauthenticated.** It was written assuming an admin-authenticated caller; the public Categories page now calls it directly with no Bearer token. If the real backend requires auth on `GET /categories`, the public page will 401 the moment `VITE_USE_MOCK=false`. Either confirm this endpoint allows anonymous reads, or add a separate public categories endpoint (mirroring the `GET /public/kits` pattern below) before going live.

### `POST /categories` / `PUT /categories/{id}` / `DELETE /categories/{id}`
- **Payload:** `{ name }` (create/update) → `Category`; delete returns 409 if a Kit still references it
- **Auth/Roles:** SUPER_ADMIN
- **Frontend service:** `categoryService.create/update/remove` · **Consumers:** `superadmin/CategoriesView.vue`
- **Mock:** yes · **Backend status:** Documented (lines 155, 160, 164)

---

## Kits

### `GET /kits`
- **Query:** `page, size, sort` → `Page<Kit>` (all kits, any status Super Admin needs to see)
- **Auth/Roles:** SUPER_ADMIN · **Frontend service:** `kitService.list` · **Consumers:** `superadmin/KitsView.vue`
- **Mock:** yes · **Backend status:** Documented (line 175)

### `GET /kits/school`
- **Query:** `page, size` → `Page<Kit>`, scoped server-side to the caller's `schoolId` from the JWT
- **Auth/Roles:** PRINCIPAL, TEACHER · **Frontend service:** `kitService.listForMySchool` · **Consumers:** `principal/KitsView.vue`, `teacher/KitsView.vue`
- **Mock:** yes (mock reads `schoolId` from the auth store directly since there's no real JWT — see `src/api/kitService.js`) · **Backend status:** Documented (line 180)

### `GET /kits/{id}`
- **Response:** full kit detail with ordered videos
- **Auth/Roles:** any authenticated user; PRINCIPAL/TEACHER get 403 if the kit isn't in their school's `SchoolKit` list
- **Frontend service:** `kitService.getById` · **Consumers:** all three role-specific `KitDetailView.vue`, `superadmin/KitFormView.vue` (edit mode)
- **Mock:** yes · **Backend status:** Documented (line 186)

### `GET /kits/{id}/schools`
- **Response:** `School[]` currently assigned this kit
- **Auth/Roles:** SUPER_ADMIN · **Frontend service:** `kitService.listSchoolsForKit` · **Consumers:** `superadmin/KitsView.vue` ("Manage Access" modal)
- **Mock:** yes · **Backend status:** Undocumented

### `POST /kits`
- **Payload (frontend actually sends):** `{ title, description, thumbnailUrl, manualPdfUrl, grade, price, categoryId, videos: [{title, youtubeVideoId, sequence}] }`
- **Payload (documented in `api-contract.md` line 191):** `{ title, description, thumbnailUrl, categoryId, videos }` — **missing `grade`, `price`, `manualPdfUrl`.**
- **Auth/Roles:** SUPER_ADMIN · **Frontend service:** `kitService.create` · **Consumers:** `superadmin/KitFormView.vue`
- **Mock:** yes · **Backend status:** Partially documented. `grade` is real MVP scope (`requirements.md` §4.3a / ADR-009) and simply missing from this specific payload example — low-risk, just update the doc. `price` and `manualPdfUrl` are the out-of-scope-but-built features (see `requirements.md` §3a, ADR-010) — do not add these to the backend contract without a product decision first.

### `PUT /kits/{id}`
- Same payload shape as POST · **Frontend service:** `kitService.update` · **Consumers:** `KitFormView.vue`
- **Mock:** yes · **Backend status:** Documented shape (line 207), same field gaps as POST above

### `POST /kits/manuals`
- **Payload:** `multipart/form-data`, field `file`
- **Response:** assumed `{ key, url }` or similar — real shape unconfirmed
- **Auth/Roles:** SUPER_ADMIN · **Frontend service:** `kitService.uploadManual` · **Consumers:** `superadmin/KitFormView.vue`
- **Mock:** yes · **Backend status:** Undocumented — tied to the out-of-scope manuals feature (`VITE_FEATURE_KIT_MANUALS`, ADR-010). Needs a storage decision (S3? local disk?) before a real backend can implement it.

### `GET /kits/manuals/{key}/download-url`
- **Response:** assumed `{ url }` (likely a signed/expiring download URL)
- **Auth/Roles:** SUPER_ADMIN, PRINCIPAL, TEACHER (not public — manuals are teacher-facing, per `requirements.md` §2.3)
- **Frontend service:** `kitService.getManualDownloadUrl` · **Consumers:** `src/components/KitDetailContent.vue` (shared by Principal + Teacher kit detail views)
- **Mock:** yes · **Backend status:** Undocumented — same feature as above

### `DELETE /kits/{id}`
- Soft delete (archive) per `api-contract.md`'s own note (line 215) — never a hard delete if any `SchoolKit` references it
- **Auth/Roles:** SUPER_ADMIN · **Frontend service:** `kitService.archive` · **Consumers:** `superadmin/KitsView.vue`
- **Mock:** yes · **Backend status:** Documented (line 212), archive-vs-hard-delete explicitly flagged as needing confirmation

### `POST /schools/{schoolId}/kits/{kitId}` / `DELETE /schools/{schoolId}/kits/{kitId}`
- Assign / revoke a kit's availability to a school (`SchoolKit` row)
- **Auth/Roles:** SUPER_ADMIN · **Frontend service:** `kitService.assignToSchool` / `revokeFromSchool` · **Consumers:** `superadmin/KitsView.vue`
- **Mock:** yes · **Backend status:** Documented (lines 219, 223)

---

## Public Catalog (unauthenticated)

**Entire group is undocumented** — `api-contract.md` has no "Public" section. This is the whole marketing/catalog site's data source.

### `GET /public/kits`
- **Query:** `grade, page, size` → `Page<Kit>` with `manualPdfUrl` stripped (manuals are never exposed publicly, per `requirements.md` §2.3)
- **Auth:** none · **Frontend service:** `publicService.listKits` · **Consumers:** `public/HomeView.vue`, `public/GradesView.vue`, `public/ProgramsView.vue`
- **Mock:** yes (`mockPublicService`, filters `kitsData` to `status === 'ACTIVE'`) · **Backend status:** Undocumented

### `GET /public/kits/{id}`
- Same stripped shape as above, single kit
- **Auth:** none · **Frontend service:** `publicService.getKit` · **Consumers:** `public/KitDetailView.vue`
- **Mock:** yes · **Backend status:** Undocumented

### `POST /contact`
- **Payload:** `{ name, email, subject, message }`
- **Response:** `{ message }`
- **Auth:** none
- **Frontend service:** `publicService.submitContact`
- **Consumers:** **none.** Defined but unused — `src/views/public/ContactView.vue` posts directly to Web3Forms instead (see ADR-011 in `decisions.md`). Kept in the codebase as the intended integration point for whenever the backend implements `/contact` for real.
- **Mock:** yes · **Backend status:** Undocumented, **defined but unused**

---

## Contact Messages (Super Admin)

### `GET /contact` / `DELETE /contact/{id}`
- **Query (list):** `page, size` → `Page<ContactMessage>`
- **Auth/Roles:** SUPER_ADMIN
- **Frontend service:** `contactService.list` / `contactService.delete` — wrapped by `src/services/messagesService.js`, which merges this source with the frontend-only Web3Forms message store (see ADR-011)
- **Consumers:** `src/views/superadmin/MessagesView.vue`
- **Mock:** yes (`mockContactService`, seeded with 3 demo messages) · **Backend status:** Undocumented. In practice this will stay empty even once implemented, unless a Web3Forms webhook or the unused `POST /contact` endpoint above starts feeding it — see ADR-011 for the full picture.

---

## External services (not Yntra Sparks backend endpoints)

These aren't part of `api-contract.md` at all — they're third-party integrations called directly from the browser. Listed here for completeness since they're real network dependencies of the frontend.

### Web3Forms — `POST https://api.web3forms.com/submit`
- **Payload:** `{ access_key, name, email, subject, message }`
- **Auth:** `access_key` from `VITE_WEB3FORMS_ACCESS_KEY` (see `.env.example`) — a routing token, not a traditional secret, but still env-driven, never hardcoded
- **Consumers:** `src/views/public/ContactView.vue`
- **Notes:** See ADR-011. Successful submissions are separately persisted to `localStorage` via `src/services/web3formsMessageStore.js` so they surface in Super Admin Messages.

### Buttondown — `POST https://buttondown.com/api/emails/embed-subscribe/{username}`
- **Payload:** `application/x-www-form-urlencoded`, `{ email, embed: '1' }`
- **Auth:** none — `{username}` from `VITE_BUTTONDOWN_USERNAME` is the newsletter's public identifier, not a secret; no API key is used or should ever be used client-side
- **Consumers:** `src/components/public/NewsletterForm.vue` via `src/services/newsletterService.js`
- **Notes:** See ADR-011 and `.env.example` for the manual account-setup steps required before this works. Response is opaque (`fetch(..., { mode: 'no-cors' })`) by design — see the comment at the top of `newsletterService.js` for why.

---

## Frontend-only mock stores (no backend endpoint exists at all)

Added across the two July 2026 frontend passes. None of these are network
calls — they're localStorage overlays that stand in for a future backend
feature. Listed here so a future backend implementer can see exactly what
UI depends on them, without hunting through `src/services/`. See ADR-012 in
`decisions.md` for why each one is shaped the way it is.

| Store | Scope | Stands in for |
|---|---|---|
| `profileStore.js` | per user id | `PATCH /me` (display name/phone/avatar overlay) |
| `recentlyViewedStore.js` | per user id | account-level "recently viewed" sync |
| `savedKitsStore.js` | per user id | `GET/POST/DELETE /me/saved-kits` |
| `messageStatusStore.js` | **per message id** (shared, not per-user — see ADR-012) | a `status` column + `PATCH /contact/{id}/status` on the real `ContactMessage` entity |
| `teacherInvitationStore.js` | per school id | a real invitation-token email endpoint + public "accept invitation" page |
| `notificationStore.js` | per user id | a real notifications table + polling/SSE/WebSocket |
| `web3formsMessageStore.js` | global | see ADR-011 |

---

## Summary — endpoint groups needing a contract before `VITE_USE_MOCK=false` anywhere real

1. `GET /users/me` — every authenticated page depends on this
2. `POST /auth/change-password` — forced password change flow
3. All 5 Principal management endpoints (`/schools/{id}/principals*`)
4. `PATCH /schools/{schoolId}/teachers/{id}/activate` (and the equivalent for principals)
5. `GET /categories` unauthenticated-read confirmation (or a separate public endpoint)
6. `GET /kits/{id}/schools`
7. `POST /kits` / `PUT /kits/{id}` — add `grade` (real gap, easy fix), decide on `price` / `manualPdfUrl` (product decision, see ADR-010)
8. `POST /kits/manuals`, `GET /kits/manuals/{key}/download-url` — needs a storage decision, gated by `VITE_FEATURE_KIT_MANUALS`
9. `GET /public/kits`, `GET /public/kits/{id}` — the entire public site's data source
10. `POST /contact`, `GET /contact`, `DELETE /contact/{id}` — see ADR-011 for why this is lower priority than it looks

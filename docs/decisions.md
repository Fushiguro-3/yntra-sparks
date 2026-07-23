# Decisions Log (ADR-style)

Each entry records a decision, the context, the alternatives considered, and
why we picked what we picked. Append-only — never delete an entry, mark it
superseded if reversed later.

---

## ADR-001: Password resets are admin-mediated only (no self-service email flow)

**Date:** 2026-06-30
**Status:** Proposed

**Context:** Principal can "reset teacher passwords" per the original spec.
Unclear if a self-service forgot-password flow is also needed.

**Decision:** MVP supports only admin-triggered resets. A Principal resets a
teacher's password directly from the teacher-management screen; the new
password (or a temp password requiring change on next login) is shown to the
Principal to communicate manually.

**Why:** Removes SMTP integration, email templates, token generation/expiry,
and an entire attack surface (token interception, email spoofing) from MVP.
Schools are a small, known user base — out-of-band communication is fine.

**Revisit when:** User base grows past what Principals can manage manually,
or schools request self-service.

---

## ADR-002: No TeacherKit assignment enforcement in MVP

**Date:** 2026-06-30
**Status:** Proposed

**Context:** Spec lists "assign kits to teachers" as optional/conditional.

**Decision:** All teachers in a school see all kits purchased by that school.
The `TeacherKit` table is not used for access control in MVP — kit visibility
is determined solely by `SchoolKit`.

**Why:** Simpler authorization logic (single join: User → School → SchoolKit
→ Kit), fewer endpoints, faster to ship. Restriction can be added later by
introducing an authorization check without altering the schema, since the
table can exist unused from day one.

**Revisit when:** A school or the product team explicitly requests
per-teacher kit restriction.

---

## ADR-003: Category is a first-class entity

**Date:** 2026-06-30
**Status:** Proposed

**Decision:** `Category` gets its own table with id/name, and `Kit.category_id`
is a foreign key, not a free-text string.

**Why:** Spec explicitly requires Super Admin to "manage categories," which
implies CRUD on categories independent of kits. A string column can't support
that without a later migration.

---

## ADR-004: Status fields use enums, not booleans

**Date:** 2026-06-30
**Status:** Proposed

**Decision:** `School.status` and `User.active` become enums
(`ACTIVE`, `INACTIVE`, reserve space for future states like
`PENDING_APPROVAL`) rather than booleans.

**Why:** Booleans only encode two states. Enums cost nothing extra now and
avoid a schema migration plus a boolean-to-enum data conversion later.

---

## ADR-005: Refresh token in httpOnly cookie; access token in memory

**Date:** 2026-06-30
**Status:** Proposed

**Decision:** Refresh token is set as an httpOnly, secure, SameSite cookie by
the backend. Access token is held in a Pinia store in memory only — never
written to localStorage or a non-httpOnly cookie.

**Why:** Reduces XSS token-theft surface. A school platform handling teacher
and school-admin accounts warrants this even though there's no student PII
in MVP yet.

**Trade-off:** Requires CORS + cookie config (`credentials: true` on both
Axios and Spring Security CORS config) since frontend (5173) and backend
(8080) run on different ports in dev.

---

## ADR-006: Monorepo for frontend + backend

**Date:** 2026-06-30
**Status:** Proposed

**Decision:** Single repo containing `backend/`, `frontend/`, and `docs/`.

**Why:** Two-person team; keeping API contract changes and frontend
consumption in the same PR avoids cross-repo coordination overhead. Can split
into separate repos later if the team grows.

---

## ADR-007: Module ownership split — Auth+Security vs Schools/Kits/Users CRUD

**Date:** 2026-06-30
**Status:** Proposed

**Decision:** One intern owns Auth + Security end-to-end (JWT issuance,
refresh flow, Spring Security config, frontend route guards, token storage).
The other owns Schools + Kits + Users CRUD end-to-end (both backend and
frontend for those modules).

**Why:** Full-stack ownership per module produces fewer integration
surprises than splitting strictly by frontend/backend. Auth is the highest
security-risk module and should go to whichever intern is stronger in Spring
Security.

---

## ADR-008: Enums stored as varchar via JPA, not native Postgres ENUM types

**Date:** 2026-06-30
**Status:** Proposed

**Context:** Database is PostgreSQL (confirmed by mentor). Schema has several
enum-like fields: `School.status`, `User.status`, `User.role`. Postgres
supports native `ENUM` types, and Hibernate/JPA can map to either native
enums or plain `varchar` columns validated at the application layer.

**Decision:** Use `varchar` columns with `@Enumerated(EnumType.STRING)` in
JPA entities, not native Postgres `ENUM` types.

**Why:** Native Postgres enums require an `ALTER TYPE ... ADD VALUE`
migration any time a new value is added (e.g. adding `PENDING_APPROVAL`
later), and some `ALTER TYPE` operations have transaction restrictions in
Postgres that complicate Flyway migrations. `varchar` + application-level
enum validation is more flexible to evolve during MVP iteration, at the
minor cost of losing database-level type enforcement (mitigated by a CHECK
constraint if stricter enforcement is wanted later).

**Revisit when:** Schema stabilizes post-MVP and stricter DB-level type
safety becomes worth the migration friction.

---

## ADR-009: Grade is a simple Kit field for MVP

**Date:** 2026-07-10
**Status:** Accepted

**Context:** Public navigation and kit cards need grade-based browsing, and
Super Admin needs to enter the target grade while creating/editing a kit.
The current product does not need managed grade records, grade bands,
multi-grade assignment, or curriculum metadata.

**Decision:** Store grade as a plain text column on `Kit` (`kit.grade`), not
as a separate `Grade` table or many-to-many relationship. The public kit list
may filter by exact grade label, and the admin kit form edits the label
directly.

**Why:** This keeps the MVP data model small while still supporting the
visible product requirement. A separate entity would add CRUD, migrations,
joins, and admin UI without a current business rule that needs it.

**Revisit when:** Kits need multiple grades, canonical grade ordering,
regional curriculum mappings, or admin-managed grade metadata.

---

## ADR-010: Keep kit pricing and kit manuals, gated behind feature flags

**Date:** 2026-07-21
**Status:** Accepted

**Context:** A frontend audit found two features built into the Vue app that
are outside documented MVP scope: kit pricing (a `price` field surfaced
throughout the kit UI and public catalog) and kit manual upload/download
(explicitly listed as out of scope in `requirements.md` §3). Neither has
backend support — no `Kit.price` column in `er-diagram.md`, no manuals
endpoints in `api-contract.md`.

**Decision:** Keep both features exactly as built rather than removing or
stubbing them. Gate each behind an env-driven feature flag
(`VITE_FEATURE_KIT_PRICING`, `VITE_FEATURE_KIT_MANUALS`), both defaulting to
`true` so nothing changes today.

**Why:** The functionality already works end-to-end against the mock API
layer and is presumably useful product direction — removing working UI is
wasted effort if the product team wants it back next sprint. Flags mean a
production deploy can hide either feature independently, per environment,
the moment backend parity becomes a hard requirement, without a follow-up
frontend change.

**Revisit when:** The backend team either implements matching endpoints (flip
flags on everywhere, delete the flags) or product confirms these should
never ship (delete the feature and the flag together).

---

## ADR-011: Contact form and newsletter stay client-only, bridged by frontend-local persistence

**Date:** 2026-07-21
**Status:** Accepted

**Context:** The backend's `/contact` endpoint is not implemented, and there
is no newsletter endpoint at all (see `docs/frontend-api-dependencies.md`).
Per this project phase's constraints, the backend is not being touched.
Super Admin still needs to see Contact submissions somewhere, and the
newsletter form needs to actually work end-to-end.

**Decision:**
- Contact form (`ContactView.vue`) keeps posting directly to Web3Forms (an
  email-relay service) rather than to the backend. Every submission
  Web3Forms confirms is additionally written to `localStorage`
  (`src/services/web3formsMessageStore.js`), tagged `source: 'web3forms'`.
  Super Admin's Messages page (`messagesService.js`) merges this with
  whatever the backend `/contact` endpoint returns (mock or real), so both
  sources render in one list, clearly labeled.
- Newsletter signup (`NewsletterForm.vue`) posts to Buttondown's public
  embed-subscribe endpoint via `fetch(..., { mode: 'no-cors' })` — no
  backend involved, no API key in the browser (Buttondown's embed endpoint
  is designed for exactly this: unauthenticated, public, form-post-shaped).
  Double opt-in confirmation email is Buttondown's default behavior.

**Why:** Both integrations needed to work today without backend changes.
Storing Web3Forms submissions locally is an explicit stopgap, not a
database — it does not survive a cleared browser or sync across devices/
admins. The moment the backend implements `/contact` for real, delete
`web3formsMessageStore.js` and simplify `messagesService.js` back to a
plain `contactService` call; `MessagesView.vue` does not need to change.

**Trade-off:** Web3Forms submissions are only visible in Super Admin
Messages from the browser that submitted them (or any browser after that
localStorage entry is written) — there is no cross-device visibility until
a real backend endpoint exists. This is disclosed explicitly, not silently.

**Revisit when:** The backend implements `/contact` (and ideally a
Web3Forms webhook that writes directly to it, removing the local-storage
bridge entirely).

---

## ADR-012: Net-new portal features (saved kits, message status, invitations, notifications, avatars) stay mock-only, one shared `mockStorage.js`

**Date:** 2026-07-23
**Status:** Accepted

**Context:** The July 2026 portal-hardening pass (see
`docs/frontend-portal-hardening-2026-07.md`) added five features with no
backend support at all: saved/favourite kits, message read/unread/archive
status, teacher invitations, a notification centre, and avatar upload. Per
this phase's constraints the backend is not being touched, and the existing
mock service layer must be extended, never replaced.

**Decision:**
- All five features are implemented as localStorage-backed stores under
  `src/services/*Store.js`, sharing one new helper,
  `src/utils/mockStorage.js` (`readJSON`/`writeJSON` — centralized JSON
  parsing and corrupt-data/quota-error handling). `profileStore.js` and
  `recentlyViewedStore.js` (from the prior pass) were refactored onto the
  same helper for consistency.
- **Per-user scoping is the default** (storage key suffixed `_${userId}`) —
  saved kits, notifications, recently-viewed. **Message status is the one
  deliberate exception**, keyed by message id only: the Contact Messages
  inbox is one shared organizational resource that any Super Admin should
  see the same state for, not personal data.
- **Avatar images** are canvas-compressed client-side to a ≤128px square
  JPEG before being stored in the same synchronous localStorage overlay as
  the rest of `profileStore.js`, rather than introduced into IndexedDB. At
  this payload size (5–15KB) IndexedDB's async API would only add
  complexity (every reader of `profileStore` would need to become async)
  for no real benefit.
- **Teacher invitations** simulate the "someone else accepts" half of the
  flow with an explicitly labeled "Simulate acceptance (mock)" action
  (calls the real `teacherService.create()` under the hood) rather than
  pretending an email was actually sent — there is no second party to click
  a real link in a frontend-only mock, and the UI never claims otherwise.
- **Notifications** are generated only at a small, deterministic list of
  concrete code paths (see the full list in
  `frontend-portal-hardening-2026-07.md`), each de-duplicated via an
  explicit `dedupeKey`, instead of a speculative generic event bus that
  would risk firing on every minor action or duplicating on re-renders.

**Why:** Every one of these features needed to work end-to-end, today,
without backend changes, while staying honest about what's actually
simulated (mock invitation acceptance, mock notification triggers) rather
than fabricating results a real backend would need to contradict later. One
shared storage helper keeps five independently-added stores from each
re-inventing the same try/catch/parse boilerplate.

**Trade-off:** None of this data syncs across devices or browsers — saved
kits, notification history, and invitation state are all local to the
browser that created them, same limitation already accepted for
`recentlyViewedStore.js` and `web3formsMessageStore.js` in earlier passes.
This is disclosed in-doc, not silently.

**Revisit when:** A real backend adds endpoints for any of these — see
"Remaining backend dependencies" in
`docs/frontend-portal-hardening-2026-07.md` for the shape each one should
take, and delete the corresponding mock store when it does.

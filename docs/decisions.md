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

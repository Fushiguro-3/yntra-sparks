# API Contract — Yntra Sparks MVP

**Status:** Draft v1 — Day 3
**Base URL (dev):** `http://localhost:8080/api`

This is the contract both frontend and backend build against. Backend
should not change a response shape without updating this doc first and
flagging it in the PR — the frontend dev should never discover a shape
change by reading a 500 error in the network tab.

## Conventions

### Standard response envelope

All endpoints return this shape, success or failure:

```json
{
  "success": true,
  "data": { },
  "message": "Optional human-readable message",
  "errors": null
}
```

On failure:

```json
{
  "success": false,
  "data": null,
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Email is already in use" }
  ]
}
```

### Auth header

All endpoints except `POST /auth/login` and `POST /auth/refresh` require:

```
Authorization: Bearer <access_token>
```

### Pagination (list endpoints)

Query params: `?page=0&size=20&sort=createdAt,desc`

Response `data` shape for paginated lists:

```json
{
  "content": [ ],
  "page": 0,
  "size": 20,
  "totalElements": 134,
  "totalPages": 7
}
```

### HTTP status codes used

- `200` success (GET, PUT)
- `201` created (POST)
- `204` no content (DELETE / deactivate where nothing is returned)
- `400` validation error
- `401` missing/invalid/expired access token
- `403` authenticated but not authorized for this resource (wrong role, or
  wrong school)
- `404` resource not found
- `409` conflict (e.g. duplicate email)
- `500` unexpected server error (never leaks stack trace — see
  `requirements.md` §6)

---

## Auth Module

### `POST /auth/login`
**Auth required:** No
**Request:**
```json
{ "email": "string", "password": "string" }
```
**Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "string",
    "user": {
      "id": 1,
      "name": "string",
      "email": "string",
      "role": "SUPER_ADMIN | PRINCIPAL | TEACHER",
      "schoolId": 5
    }
  }
}
```
Refresh token is set as an httpOnly cookie in the response, per ADR-005 —
never returned in the JSON body.

### `POST /auth/refresh`
**Auth required:** No (uses httpOnly refresh cookie)
**Request:** none — refresh token read from cookie
**Response (200):**
```json
{ "success": true, "data": { "accessToken": "string" } }
```

### `POST /auth/logout`
**Auth required:** Yes
**Response (204):** clears the refresh cookie server-side

---

## School Module (Super Admin only)

### `GET /schools`
**Auth:** SUPER_ADMIN
**Response (200):** paginated list of schools

### `POST /schools`
**Auth:** SUPER_ADMIN
**Request:**
```json
{ "name": "string", "email": "string", "address": "string" }
```
**Response (201):** created school object. `status` defaults to `PENDING_APPROVAL`.

### `PUT /schools/{id}`
**Auth:** SUPER_ADMIN
**Request:** same shape as POST
**Response (200):** updated school object

### `PATCH /schools/{id}/status`
**Auth:** SUPER_ADMIN
**Request:**
```json
{ "status": "ACTIVE | INACTIVE | PENDING_APPROVAL" }
```
**Response (200):** updated school object

---

## Category Module (Super Admin only)

### `GET /categories`
**Auth:** Any authenticated user (needed for kit filtering across all roles)
**Response (200):** flat list, not paginated (expected to be small)

### `POST /categories`
**Auth:** SUPER_ADMIN
**Request:** `{ "name": "string" }`
**Response (201):** created category

### `PUT /categories/{id}`
**Auth:** SUPER_ADMIN
**Response (200):** updated category

### `DELETE /categories/{id}`
**Auth:** SUPER_ADMIN
**Response (204)**
**Note:** open question — what happens to Kits referencing a deleted
category? Recommend blocking delete (409) if any Kit references it,
rather than cascading. Flag in standup before implementing.

---

## Kit Module

### `GET /kits` (Super Admin — all kits)
**Auth:** SUPER_ADMIN
**Query params:** `?categoryId=&search=`
**Response (200):** paginated list

### `GET /kits/school` (Principal / Teacher — only their school's kits)
**Auth:** PRINCIPAL, TEACHER
**Response (200):** paginated list, filtered server-side by the
authenticated user's `school_id` via `SchoolKit` — never trust a client-sent
school ID for this filter

### `GET /kits/{id}`
**Auth:** Any authenticated user, but PRINCIPAL/TEACHER get 403 if the kit
is not in their school's `SchoolKit` list
**Response (200):** full kit detail including ordered video list

### `POST /kits`
**Auth:** SUPER_ADMIN
**Request:**
```json
{
  "title": "string",
  "description": "string",
  "thumbnailUrl": "string",
  "categoryId": 1,
  "videos": [
    { "title": "string", "youtubeVideoId": "string", "sequence": 1 }
  ]
}
```
**Response (201):** created kit with videos

### `PUT /kits/{id}`
**Auth:** SUPER_ADMIN
**Request:** same shape as POST
**Response (200):** updated kit

### `DELETE /kits/{id}`
**Auth:** SUPER_ADMIN
**Response (204)**
**Note:** per `er-diagram.md` open question #2 — recommend this archives
(`status = ARCHIVED`) rather than hard-deletes if any `SchoolKit` row
references it. Confirm before implementing.

### `POST /schools/{schoolId}/kits/{kitId}` (assign a kit to a school)
**Auth:** SUPER_ADMIN
**Response (201):** creates the `SchoolKit` row (i.e. "school purchased this kit")

### `DELETE /schools/{schoolId}/kits/{kitId}`
**Auth:** SUPER_ADMIN
**Response (204):** revokes a school's access to a kit

---

## User Module (Teachers, managed by Principal)

### `GET /schools/{schoolId}/teachers`
**Auth:** PRINCIPAL (own school only — 403 if `schoolId` != their own),
SUPER_ADMIN (any school)
**Response (200):** paginated list of teachers for that school

### `POST /schools/{schoolId}/teachers`
**Auth:** PRINCIPAL (own school only)
**Request:**
```json
{ "name": "string", "email": "string" }
```
**Response (201):** created teacher, with a system-generated temp password
returned **once** in this response only (never retrievable again, never
logged) — Principal communicates it manually per ADR-001

### `DELETE /schools/{schoolId}/teachers/{teacherId}`
**Auth:** PRINCIPAL (own school only)
**Response (204):** sets teacher `status = INACTIVE` (soft delete, pending
confirmation per `er-diagram.md` open question #1)

### `PATCH /schools/{schoolId}/teachers/{teacherId}/reset-password`
**Auth:** PRINCIPAL (own school only)
**Response (200):**
```json
{ "success": true, "data": { "tempPassword": "string" } }
```
Same one-time-display rule as creation.

---

## Open Questions From This Contract

| # | Question | Status |
|---|----------|--------|
| 1 | Does a teacher get forced to change temp password on first login? (ties to user-flows.md Q1) | Open |
| 2 | Category delete: block if referenced, or cascade? | Open — recommend block (409) |
| 3 | Kit delete: archive vs hard delete, given SchoolKit dependency | Open — recommend archive |
| 4 | Should `GET /kits/{id}` for Super Admin show schools that purchased it? | Deferred — analytics, post-MVP |
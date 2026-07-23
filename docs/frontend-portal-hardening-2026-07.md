# Frontend Portal Hardening & Feature Completion — July 2026

**Status:** Complete — frontend-only, no backend changes, mock service layer
kept and extended (never replaced). Builds on
`docs/frontend-ui-pass-2026-07.md` (routes/profile/dashboards added in the
prior pass); this pass turns the three authenticated portals from "a
collection of CRUD pages" into complete, self-consistent products.

## Bugs found and fixed during this pass

Two genuine product bugs surfaced while writing Playwright coverage for the
new features — both are fixed in source, not worked around in tests:

1. **Dropdown click-through on desktop (Super Admin / Principal / Teacher).**
   `PortalShell.vue`'s desktop topbar `<header>` uses `backdrop-blur`, which
   (like `transform`/`opacity<1`/`filter`) creates a new CSS stacking
   context. Both `UserMenu.vue`'s account dropdown and
   `NotificationBell.vue`'s dropdown are `position: absolute` with
   `z-30`, but that z-index was only ever compared *inside* the header's own
   stacking context — against the page's main-content sibling `<div>`
   (undecorated, `z-index: auto`), plain DOM order wins, and the later
   sibling painted on top. The dropdown menus were visually on top most of
   the time (the browser doesn't always make the bug obvious to the eye) but
   were **genuinely unclickable** wherever they happened to geometrically
   overlap the page's own header row (e.g. a page title + "Add" button row).
   Real desktop users could have hit this on any portal page whenever the
   dropdown extended far enough to overlap page content below the topbar.
   **Fix:** `header` now also has `relative z-20`, so the whole header — and
   everything painted inside it — wins the stacking comparison against its
   sibling regardless of DOM order. (`src/layouts/PortalShell.vue`)
2. **Recently-viewed kit could silently fail to record.**
   `KitDetailContent.vue` emitted `'loaded'` (which triggers the Teacher
   "recently viewed" recording) only *after* also awaiting the optional
   manual-PDF-download-URL fetch. The kit's own heading renders as soon as
   the kit itself loads — before that second await resolves — so a user (or
   a fast automated check) reading the page and navigating away in that
   window would never have the view recorded. **Fix:** emit right after the
   kit loads, before the manual-URL fetch. (`src/components/KitDetailContent.vue`)

Both were caught by the Playwright suite (see "Testing" below), not by
manual QA — exactly why e2e coverage was written for every new flow in this
pass rather than just unit-testing the stores in isolation.

## Fixing the account menu (was: "profile dropdown actions not working")

Root cause: `UserMenu.vue` was only rendered in `PortalShell.vue`'s
**desktop** topbar. Mobile had no way to reach Change Password or
Notifications at all — the mobile drawer footer had its own separate,
duplicated "View Profile" + "Log out" block instead.

- `UserMenu` (Dashboard / My Profile / Change Password / Notifications /
  Log out) now renders in **both** the mobile and desktop topbars — it
  already had mobile-responsive internals (a `md:hidden` name/role recap)
  that were simply unreachable before.
- The desktop sidebar footer's View Profile + Logout block, and the mobile
  drawer's duplicate footer block, are both **removed**. The mobile drawer
  is pure navigation now (Dashboard + role links + Notifications/Saved
  Kits/Invitations where applicable) — Profile/Password/Notifications/Logout
  live in exactly one place, reachable at every screen size. No mobile
  usability case needed a second, duplicated logout action once the account
  menu itself became reachable on mobile.
- `handleLogout` (`PortalShell.vue`) gained an `isLoggingOut` guard (ignores
  a re-entrant call while one is in flight — e.g. a fast double-click) and
  uses `router.replace('/login')`, not `push`, so a logged-out session can't
  hit Back and land on the still-rendered protected page underneath.
  `auth.logout()` clears local session state even if the (mocked) network
  call fails, so logout always succeeds from the user's point of view.
- The menu closes on Escape, outside click, and route change, and restores
  focus to the trigger button afterward, on both the account menu and the
  notification bell.
- A new `src/composables/useProfileOverlay.js` (module-level reactive
  singleton, same shape as the existing `useToast`/`useConfirm`) wraps
  `profileStore.js` so `ProfileView` writes and `UserMenu`/`PortalShell`
  reads share the *same* reactive state — a saved display name or avatar
  shows up in the header instantly, no event bus or page reload needed.

## Profile workflow

- `ProfileView.vue` now reads/writes exclusively through
  `useProfileOverlay()` (not `profileStore` directly), and shows a "Last
  updated" timestamp stamped on every save.
- Unsaved-change protection: the form is snapshotted on edit-start; leaving
  mid-edit with unsaved changes (`onBeforeRouteLeave`) opens the shared
  `useConfirm()` dialog instead of silently discarding input.
- Protected fields (Role, Account status, Assigned school, School code,
  User ID, Permission scope) are rendered read-only for all three roles —
  they come from `auth.user`/school lookups, never from the editable
  overlay, so there is no code path that could make them editable.
- Fields that don't exist on the user model at all (last login, account
  creation date) are **omitted**, not fabricated — same "no invented data"
  rule the dashboards and school code already followed in the prior pass.

## Avatar upload

`src/components/portal/AvatarUploader.vue`: validates type
(`image/jpeg|png|webp`) and raw size (≤5MB) client-side, decodes the file
into an `Image()` to confirm it's actually a real image, then
canvas-resizes/center-crops to a ≤128px square JPEG (~q0.75) before storing
it. Persisted via `useProfileOverlay().update()` → `profileStore.js`'s
existing localStorage overlay (the `avatarUrl` field already existed there).

**Decision — localStorage over IndexedDB:** compressing first keeps a
typical avatar around 5–15KB base64, small enough that localStorage's
per-origin quota is a non-issue and every existing `profileStore` reader
stays synchronous. IndexedDB was considered and rejected for this size of
data — it would force `profileStore`'s API to become async across every
call site (header display, `UserMenu`, `ProfileView`) for no real benefit at
this payload size. Revisit if avatars ever need to be full-resolution or
shared cross-device (which would need a real upload endpoint regardless,
see "Remaining backend dependencies" below).

## Change Password

Audited and found already solid (duplicate-submit guard, strength meter,
validation, forced-flow redirect-loop guard, "Not you? Log out"). Hardened
further: form fields are cleared immediately on success (defense in depth).

**Documented mock behavior:** `mockAuthService.changePassword` mutates the
in-memory demo user's password (the old password stops working for the rest
of that browser session) but does **not** invalidate the current access
token — the active session stays logged in after a successful change,
matching normal product UX (you don't get logged out for changing your own
password while already authenticated).

## Saved / favourite kits (Teacher, Principal)

- `src/services/savedKitsStore.js` — per-user localStorage (same shape as
  the existing `recentlyViewedStore.js`), denormalizes id/title/thumbnail/
  grade/category so the Saved Kits list doesn't need a second fetch.
- `src/composables/useSavedKits.js` — module-level reactive singleton so
  every `SaveKitButton` instance and the Saved Kits page/dashboard counts
  stay in sync without prop-drilling or a full Pinia store.
- `src/components/portal/SaveKitButton.vue` — one consistent control
  (`aria-pressed`, label text communicates state, not color alone), used on
  Teacher/Principal kit cards and the shared `KitDetailContent.vue`.
- `src/views/portal/SavedKitsView.vue` (routes `teacher-saved-kits`,
  `principal-saved-kits`) — a kit that's since been removed from the
  school's catalog is flagged **"No longer available"**, not silently
  dropped, and stays individually removable.

## Message read / unread / archive (Super Admin)

- `src/services/messageStatusStore.js` stores `unread | read | archived`
  keyed by **message id, not user id** — deliberate exception to the
  otherwise-universal per-user scoping, because the Contact Messages inbox
  is one shared organizational resource (any Super Admin user should see
  the same read/archived state), not personal data. A message with no
  stored status defaults to `unread` (the migration story for
  already-seeded demo messages).
- `MessagesView.vue`: Inbox (unread+read, default) / Unread / Read /
  Archived tabs (deep-linkable via `?tab=`), Mark read/unread and
  Archive/Restore actions use toasts only — **no confirmation dialog**,
  since none of those are destructive. **Delete** is the one action that
  still requires confirmation, and remains the only way data is permanently
  removed — archiving is reversible (Restore), deleting is not.

## Teacher invitations (Principal)

`src/services/teacherInvitationStore.js` layers a
`pending → accepted | expired | revoked` lifecycle on top of — never
instead of — the existing `teacherService.create()` one-time-temp-password
flow. `expired` is computed live from `expiresAt` on read, never written by
a timer. `TeachersView.vue` gained a Teachers / Invitations tab switcher
with Invite, Resend, Revoke (confirmed — this one *is* a meaningful
irreversible-ish state change), and Copy invitation link.

**Mock limitation, disclosed rather than faked:** there is no real second
person to click a real invitation link in a frontend-only mock. Rather than
pretend an email was sent, the invitations table has an explicitly labeled
**"Simulate acceptance (mock)"** action, which calls the real
`teacherService.create()` under the hood and marks the invitation accepted —
so the whole lifecycle is exercisable and tested end-to-end without lying
about what actually happened.

## Notification centre

- `src/services/notificationStore.js` (per-user localStorage, capped at 50)
  + `src/composables/useNotifications.js` (module-level reactive
  singleton, same pattern as `useSavedKits`).
- `src/components/portal/NotificationBell.vue` in both topbars: unread
  badge, dropdown of the 8 most recent, "Mark all read", full
  `NotificationsView.vue` (routes `admin-notifications` /
  `principal-notifications` / `teacher-notifications`) with All/Unread
  filters and per-item Dismiss.
- Clicking a notification navigates via a small **whitelisted route-name
  set** (`ALLOWED_ROUTES` in `NotificationBell.vue`), never a raw stored
  URL — defense-in-depth in case `localStorage` is ever hand-edited, a
  tampered entry can never navigate anywhere but a known in-app route.
- **Generation is deliberately scoped to a small, deterministic set of
  concrete code paths** — not a speculative event bus that fires on every
  minor action: message archived/restored, school/principal created,
  teacher created/deactivated, invitation accepted, password changed, and a
  saved kit becoming unavailable. Each call site passes a `dedupeKey` so the
  same event can't double-post. Anything not wired (e.g. "new kit assigned"
  pushed to an already-open Teacher session) is a documented limitation, not
  a fake notification.

## Advanced public search

`src/views/public/SearchView.vue` (route `public-search`, linked from
`Navbar.vue`'s search icon/drawer item): client-side keyword + Grade +
Category filters + sort over `publicService.listKits({ size: 200 })` (same
"fetch a larger batch, filter client-side" approach `ProgramsView.vue`
already used). Fully query-param driven (`?q=&grade=&category=&sort=`) —
shareable and refresh-safe. An unrecognized `sort` value degrades safely to
`relevance` rather than erroring.

**Program was scoped out as a third filter** — there is no distinct
`program` data field on a kit; the Programs page is itself just kits
grouped by category, so a separate Program filter would either duplicate
Category or require inventing a field that doesn't exist in the data model.

`kitNavContext.js` gained a `search` source (capped at 300 chars,
reconstructs only the four whitelisted query keys from the stored value) so
Search → Kit → Back restores the exact search a visitor came from, same
whitelisted-route-only pattern the `grade`/`program`/`category` sources
already used.

## Dashboard completion

Every number added is derived from an existing service call — nothing
hardcoded:

- **Super Admin:** Principals count (summed per-school), unread messages
  count, a pending-approval-schools alert banner if any exist.
- **Principal:** pending invitations count, saved kits count.
- **Teacher:** saved kits count.

## Navigation, route guards, and mock persistence

- Each role's sidebar/drawer nav list is now Dashboard + role pages +
  Notifications + (Saved Kits for Teacher/Principal, Invitations tab is
  inside Teachers for Principal) — no Logout/Profile duplication anywhere.
  Route guards were not changed in this pass (already correct — see
  `router/index.js` `meta.roles` checks and the existing 403 view); this
  pass only re-verified them while wiring the new routes in.
- `src/utils/mockStorage.js` — new shared `readJSON`/`writeJSON` helper
  (parsing, corrupt-data, and quota/unavailable-storage handling in one
  place). Every new store in this pass uses it from the start;
  `profileStore.js` and `recentlyViewedStore.js` were refactored onto it
  too (mechanical, no behavior change) so all mock persistence in the app
  now goes through one code path.
- Fixed `AppButton.vue`'s `variant` prop validator, which didn't include
  `'quiet'` even though several views already used it (cosmetic console
  warning, found during the audit, fixed while touching these files).

## Error handling & feedback

No raw `alert()`/`window.confirm()` remained anywhere in the portals before
this pass (confirmed by direct audit) and none were introduced — every new
destructive-ish action (Revoke invitation, Delete message) uses the shared
`useConfirm()` dialog; every other action uses `useToast()`.

## Accessibility

All new interactive elements (`SaveKitButton`, `NotificationBell`,
`AvatarUploader`, invitation modal, search filters) are keyboard-reachable
with visible focus rings, use `aria-pressed`/`aria-expanded`/`role="menu"`/
`role="menuitem"` correctly, and the two dropdown patterns (account menu,
notification bell) both close on Escape/outside-click/route-change and
restore focus to their trigger — consistent with the existing `Modal.vue`
pattern from the prior pass.

## Testing

- **Unit:** new specs for every new store/util
  (`savedKitsStore`, `messageStatusStore`, `teacherInvitationStore`,
  `notificationStore`, extended `kitNavContext`, extended `profileStore`).
- **Component:** new specs for every new component/view
  (`NotificationBell`, `SaveKitButton`, `AvatarUploader`, `MessagesView`,
  `TeachersView`, `SavedKitsView`, `NotificationsView`), updated
  `PortalShell`/`UserMenu` specs for the mobile-rendering change.
- **E2e (Playwright):** six new full-flow specs —
  `super-admin-flow.spec.js`, `principal-invite-flow.spec.js`,
  `teacher-save-kit-flow.spec.js`, `notification-centre.spec.js`,
  `public-search.spec.js`, `mobile-profile-menu.spec.js` — each logging in,
  exercising the new feature end-to-end, and logging out via the top-right
  menu. Extended `responsive-smoke.spec.js` with authenticated portal pages
  at 375px. Updated `auth.spec.js`'s logout step for the new
  menu-based logout location.
- **Results:** `npm test` → **266/266 passing** (37 files). `npx playwright
  test` → **59/59 passing**. `npm run build` → succeeds.

## Role permissions matrix (frontend-enforced)

| Action | Super Admin | Principal | Teacher |
|---|---|---|---|
| Own profile (view/edit permitted fields, avatar, password) | ✅ | ✅ | ✅ |
| Another user's profile | ❌ (no route accepts a user id — always `auth.user`) | ❌ | ❌ |
| Schools / Principals / Categories / Kits CRUD | ✅ | ❌ (403 view, see `auth.spec.js`) | ❌ |
| Contact Messages (read/unread/archive/delete) | ✅ | ❌ | ❌ |
| Own school's Kits (read-only) | n/a (sees all) | ✅ own school only | ✅ own school only |
| Another school's Kits/Teachers | n/a | ❌ (server/mock scopes by `schoolId`) | ❌ |
| Teachers CRUD + invitations, own school | ❌ | ✅ | n/a |
| Saved/favourite kits | n/a (no personal kit browsing) | ✅ | ✅ |
| Notifications | ✅ (own) | ✅ (own) | ✅ (own) |
| Kit create/edit/delete forms | ✅ | ❌ (no such route exists in Principal's nav or router) | ❌ |

Enforcement is via `router/index.js`'s `meta.roles` guard (redirects to a
403 view, never a blank page — see `auth.spec.js`) plus each mock service
scoping its own data by the authenticated user's `schoolId`/role. No portal
view fetches another school's or another user's data by trusting a route
param — profile/teachers/kits are always scoped from the auth store.

## Features documented, not implemented this pass

Explicitly out of scope for this pass (per the plan) — recorded here so
they aren't silently forgotten, not built as partial stubs:

- **Activity/audit log** — a Super-Admin-visible feed of "who changed
  what, when" across schools/kits/principals. Would need either a backend
  audit table or, as a mock-only stand-in, a shared (not per-user)
  localStorage log written at the same code-path granularity as the
  notification centre above. Not built because it's a distinct feature
  surface (searchable/filterable history, not just recent unread items)
  deserving its own pass rather than piggybacking on notifications.
- **Kit comparison** (side-by-side compare of 2–3 kits before a Principal
  decides what to request) — would reuse the `SaveKitButton`/saved-kits
  selection pattern for "add to compare," plus a new comparison view. Not
  built because no requirement calls for it yet (`requirements.md` has no
  §3a entry for it) and it would need a decision on which kit fields are
  actually comparable (grade/price/category are trivial; anything richer
  needs product input).
- **PWA / offline access** — installable app + cached kit
  descriptions/manuals for low-connectivity classrooms. Not built because
  it's an infrastructure decision (service worker, cache invalidation
  strategy, manual-PDF storage limits) that should be made deliberately, not
  as a side effect of a portal-features pass — and it interacts with the
  kit-manuals feature flag (`VITE_FEATURE_KIT_MANUALS`, ADR-010), which is
  itself already a documented out-of-scope-but-built feature.

## Remaining backend dependencies

Everything in this pass is a localStorage-backed mock-only feature; none of
it requires backend work to keep working today. If/when a real backend
takes over each of these, here's the shape it would need — added to
`docs/frontend-api-dependencies.md` in more detail:

- **Saved kits** — device-local only today; a real "favourites" feature
  synced across devices would need a `GET/POST/DELETE /me/saved-kits`-shape
  endpoint.
- **Message read/unread/archived status** — currently a client-local
  overlay keyed by message id; a real implementation should add a `status`
  column to the backend's `ContactMessage` entity plus a
  `PATCH /contact/{id}/status` endpoint, replacing `messageStatusStore.js`
  entirely (the per-message-id-not-per-user keying already matches what a
  real shared-inbox status column would look like).
- **Teacher invitations** — `teacherInvitationStore.js` is a full mock
  lifecycle with no real email sent; a production version needs an actual
  invitation-token email endpoint and a public "accept invitation" page,
  replacing the mock's "Simulate acceptance" button with a real link click.
- **Notifications** — entirely mock-generated client-side today; a
  multi-admin-visible or cross-device version would need a real
  notifications table and either polling or a push channel (SSE/WebSocket).
- **Avatar upload** — stored as a small base64 JPEG in the same
  localStorage overlay as the rest of `profileStore.js`; a real
  implementation needs a file-upload endpoint (or direct-to-S3 signed URL)
  and a `avatarUrl` field on the real user model.

None of the above blocks `VITE_USE_MOCK=false` for the features that
existed before this pass — see `docs/frontend-api-dependencies.md`'s
existing "Summary" section for that list.

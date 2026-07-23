# Frontend UI/UX Polish Pass — July 2026

**Status:** Complete — frontend-only, no backend changes.

This documents the second UI/UX pass across the public marketing site and
the three authenticated portals (Super Admin, Principal, Teacher). See
`docs/frontend-api-dependencies.md` for what's still backend-dependent.

## New routes

| Route name | Path | Notes |
|---|---|---|
| `admin-dashboard` | `/admin` | Now a real dashboard (was a redirect to `admin-schools`) |
| `principal-dashboard` | `/principal` | Now a real dashboard (was a redirect to `principal-kits`) |
| `teacher-dashboard` | `/teacher` | Now a real dashboard (was a redirect to `teacher-kits`) |
| `admin-profile` | `/admin/profile` | Shared `ProfileView.vue`, role-gated by the parent route |
| `principal-profile` | `/principal/profile` | Shared `ProfileView.vue` |
| `teacher-profile` | `/teacher/profile` | Shared `ProfileView.vue` |

All three profile routes render the same `src/views/portal/ProfileView.vue`,
which reads `auth.user` (never a route param), so there is no way to reach
another user's profile via URL manipulation — the profile shown is always
the currently authenticated session's own.

## Contextual kit navigation

Kit detail pages previously always said "Back to Programs" regardless of
where the visitor came from. `src/utils/kitNavContext.js` now provides:

- `buildKitContext(from, value, label)` — call when linking *to* a kit
  (Home, Grades, Programs, Categories) to attach a small, whitelisted query
  (`?from=grade&value=Grade+5`) to the link.
- `resolveBackTarget(route.query)` — call on the kit detail page to compute
  a safe `{ label, to }`. `from` is checked against a fixed whitelist
  (`home | grade | program | category | categories`); the actual route
  navigated to is always one of a small set of named routes baked into the
  module — the query string only ever supplies a *display value* (a grade
  name or category id), never a path or external URL. Anything
  unrecognized, missing, or oversized falls back to `{ label: 'Back to
  Kits', to: { name: 'public-programs' } }`.

Public `KitDetailView.vue` uses this. Principal/Teacher's shared
`KitDetailContent.vue` did not need it — those portals only have one Kits
list per role, so a fixed "Back to Kits" was already correct there.

## Category browsing

`CategoriesView.vue` mirrors `GradesView.vue`'s existing `?grade=` pattern:
no `?category=` shows a grid of clickable category cards (real
`RouterLink`s, image, blurb, kit count); `?category=<id>` shows that
category's kits, filtered **client-side** by `categoryId` after a single
`publicService.listKits({ size: 100 })` call. Categories have no `slug`
field in the current data model (`{id, name, createdAt}` only) and the
backend wasn't touched, so the id-based query param is the pragmatic
shareable/refresh-safe URL — a real slug would need a backend/data-model
change (see "Remaining backend dependencies" below). An unknown id shows a
"Category not found" state with a Back to Categories action, never a blank
page.

## Watch Demo / video behavior

- Home's hero "Watch Demo" (which pointed at Contact) is removed and
  replaced with a real "View Programs" secondary CTA — there was no actual
  demo video to show there.
- Public `KitDetailView.vue` and the shared `KitDetailContent.vue`
  (Principal/Teacher) now show a thumbnail + "▶ Watch Demo" trigger that
  opens `src/components/VideoModal.vue` on click, rather than always
  embedding a YouTube iframe. The modal lazy-mounts the iframe only while
  open, uses `youtube-nocookie.com` (privacy-enhanced), never autoplays
  with sound, and is built on the existing `Modal.vue` (Escape-to-close,
  focus trap, backdrop click). When a kit has no video, no Watch Demo
  control renders at all — never a placeholder link, never a redirect to
  Contact.

## Carousel behavior

`src/components/public/KitCarousel.vue` wraps the existing
`overflow-x-auto snap-x` row pattern with accessible prev/next arrows
(`aria-label="Previous kits"` / `"Next kits"`), keyboard arrow-key support
on the focusable track, and automatic disable/hide at the scroll ends.
Mouse, touch swipe, and trackpad scroll all work through the same native
scroll container — no JS reimplements them. No autoplay, no infinite loop.
Used by Home's Featured STEM Kits row; reuse this component for any future
kit slider instead of hand-rolling scroll-snap again.

## Portal improvements

- **UserMenu** (`src/components/portal/UserMenu.vue`) replaces the plain
  email text in `PortalShell.vue`'s desktop topbar: avatar initials, name,
  role, and a dropdown (Dashboard / View Profile / Change Password /
  Logout). Closes on Escape, outside click, and route change; restores
  focus to the trigger. Logout is now reachable from the top-right on every
  portal page, not just the sidebar footer (which still keeps its own
  Logout + a new View Profile link for parity).
- **Dashboards** per role (`views/superadmin/DashboardView.vue`,
  `views/principal/DashboardView.vue`, `views/teacher/DashboardView.vue`) —
  summary cards, recent activity, and quick actions computed from existing
  services only (no invented metrics).
- **Toasts** (`useToast.js` + `ToastContainer.vue`, mounted once in
  `App.vue`) and a **styled confirm dialog** (`useConfirm.js` +
  `ConfirmDialog.vue`, built on `Modal.vue`) replace every remaining raw
  `window.confirm()` in Schools/Principals/Categories/Kits/Messages
  (Super Admin) and Teachers (Principal).
- **Client-side search** added to Schools, Kits, Messages, Principals, and
  Teachers using a new `useClientTable` composable
  (`src/composables/useClientTable.js`) — same "fetch a larger batch,
  filter/paginate in the component" approach `ProgramsView.vue` already
  used, reused via `utils/paginate.js` rather than adding server params.
- **Teacher "recently viewed"** — `src/services/recentlyViewedStore.js`
  (localStorage, capped at 8, per user id) records a view when a Teacher
  opens a kit detail page and shows a rail on the Kits list and Dashboard.

## New mock-only persistence (frontend-only, not backend fields)

- `src/services/profileStore.js` — an overlay of frontend-only editable
  profile fields (display name override, phone, avatar URL) keyed by user
  id. Never touches `role`/`schoolId`/`email`, which stay backend-owned.
  Once a real profile-update endpoint exists, this should be replaced by an
  actual API call — see `docs/frontend-api-dependencies.md`.
- `src/services/recentlyViewedStore.js` — as above.

## Environment variables

None added. No new third-party dependency was added either — GSAP
(`utils/motion.js`) and the existing `data-aos`/hover-glow CSS system
already covered every animation requirement in this pass.

## Accessibility notes

- All new interactive elements (carousel arrows, video modal, confirm
  dialog, user menu, toasts) are keyboard-reachable, have visible
  focus-visible rings, and respect `prefers-reduced-motion` via the
  existing shared transition tokens in `style.css`.
- Toasts use `aria-live="polite"`; the confirm dialog and video modal reuse
  `Modal.vue`'s existing `role="dialog"`/focus-trap/Escape handling.
- `RouterLink`'s built-in `aria-current="page"` continues to work
  unchanged on nav/sidebar links, including the new Dashboard nav item.

## Remaining backend dependencies

- **Server-side category→kit filtering** — currently done client-side
  after fetching up to 100 kits; fine at current data volume, would need a
  real `categoryId` query param on `/public/kits` at scale.
- **Category slugs** — categories have no `slug` field; category URLs use
  `?category=<id>` instead. A real slug would need a backend/data-model
  change.
- **Real profile-update endpoint** — `profileStore.js` is a localStorage
  stand-in; there is no `PATCH /me` or similar in `api-contract.md` yet.
- **"Last login" / account-activity data** — not present on the mock or
  real user model, so the Profile page omits it rather than fabricating a
  value.
- **Recently-viewed / favorites sync** — currently device-local
  (localStorage) only; a real account-level version would need a backend
  endpoint.

## Recommended next features

See the completion report delivered alongside this pass for a prioritized
list (saved/favourite kits, notification centre, message read/unread
workflow, teacher invitation flow, activity/audit logs, profile image
upload, advanced search, PWA/offline access, etc.), each with role
benefited, problem solved, effort, and backend dependency called out.

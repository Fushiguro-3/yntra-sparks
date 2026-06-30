# User Flows — Yntra Sparks MVP

**Status:** Draft v1 — Day 2

Three roles, three flows. Each shows the actual click-path from login to
core action, including the blocked/error states that the requirements doc
(§6 Non-Functional Requirements) requires — a user must see an explicit
403/blocked state, never a silent empty screen, when trying to access
something outside their scope.

## 1. Super Admin Flow

```mermaid
flowchart TD
    A[Login screen] --> B{Valid credentials?}
    B -- No --> A
    B -- Yes --> C[Super Admin Dashboard]
    C --> D[Manage Schools]
    C --> E[Manage Kits]
    C --> F[Manage Categories]
    C --> G[Manage School Admins]

    D --> D1[View school list]
    D1 --> D2[Add new school]
    D1 --> D3[Activate / Deactivate school]
    D1 --> D4[Edit school details]

    E --> E1[View kit list]
    E1 --> E2[Add new kit]
    E2 --> E2a[Set title, description, thumbnail, category]
    E2a --> E2b[Add YouTube video links, ordered]
    E1 --> E3[Edit existing kit]
    E1 --> E4[Delete / Archive kit]

    F --> F1[View categories]
    F1 --> F2[Add / Edit / Delete category]

    G --> G1[View school admin list]
    G1 --> G2[Add new Principal for a school]
    G1 --> G3[Deactivate Principal]
```

## 2. Principal (School Admin) Flow

```mermaid
flowchart TD
    A[Login screen] --> B{Valid credentials?}
    B -- No --> A
    B -- Yes --> C[Principal Dashboard]
    C --> D[View school's purchased kits]
    C --> E[Manage Teachers]

    D --> D1[Open kit]
    D1 --> D2[Read description]
    D1 --> D3[Watch embedded videos]
    D --> D4{Tries another school's kit via URL?}
    D4 -- Yes --> D5[403 Forbidden — explicit blocked screen]

    E --> E1[View teacher list]
    E1 --> E2[Add teacher]
    E2 --> E2a[Set name, email, temp password]
    E1 --> E3[Delete / Deactivate teacher]
    E1 --> E4[Reset teacher password]
    E4 --> E4a[Admin sets new password, communicates manually — ADR-001]

    C --> F{Tries to edit a kit?}
    F -- Yes --> F1[403 Forbidden — Principal cannot edit kit content]
```

## 3. Teacher Flow

```mermaid
flowchart TD
    A[Login screen] --> B{Valid credentials?}
    B -- No --> A
    B -- Yes --> C[Teacher Dashboard]
    C --> D[View school's purchased kits]
    D --> E[Open a kit]
    E --> F[Read description]
    E --> G[Watch embedded YouTube videos]
    C --> H{Tries to access admin/principal screens?}
    H -- Yes --> H1[403 Forbidden — explicit blocked screen]
    C --> I{Tries another school's kit via URL?}
    I -- Yes --> I1[403 Forbidden — explicit blocked screen]
```

## Cross-Cutting Notes

- **Every blocked-state arrow above is a hard requirement, not a nice-to-have.**
  Per `requirements.md` §6: a Principal or Teacher hitting another school's
  resource gets a real 403 response, enforced at the API layer — the
  frontend route guard is a UX convenience, not the actual security
  boundary. Both layers must independently enforce this.

- **Login flow is shared across all three roles** (same screen, same
  endpoint) — role is determined server-side from the JWT claims after
  login, then the frontend redirects to the correct dashboard based on
  `role`. There is no separate login URL per role.

- **Password reset (Teacher side) is never self-service** — per ADR-001,
  only a Principal can trigger a reset for a teacher in their school. This
  is reflected in the Principal flow (E4) and intentionally absent from the
  Teacher flow.

## Open Questions From These Flows

| # | Question | Status |
|---|----------|--------|
| 1 | On first login with a temp password, is a forced password-change step required? | Open — recommend yes, standard practice for admin-set passwords |
| 2 | Does Super Admin dashboard need a landing/overview page, or direct to Manage Schools? | Open — low priority, UX polish |
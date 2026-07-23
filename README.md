# Yntra Sparks

B2B platform giving schools access to STEM learning kits, plus a public
marketing/catalog site. MVP scope for the app: Super Admin, School Admin
(Principal), and Teacher roles — no student/parent login, no marketplace,
no quizzes (see `docs/requirements.md` §3 for full out-of-scope list).

## Tech Stack

**Frontend:** Vue.js 3, Tailwind CSS, Vue Router, Pinia, Axios, GSAP
**Backend:** Java, Spring Boot, Spring Security, JWT (access + refresh token)
**Database:** PostgreSQL
**Migrations:** Flyway
**Deployment:** Vercel (frontend)

## Repo Structure

```
yntra-sparks/
├── docs/          # requirements, decisions log, ER diagram, API contract, user flows, onboarding
├── backend/       # Spring Boot app (layered: controller/service/repository/entity/dto)
├── frontend/      # Vue 3 app (Vite)
│   └── src/views/
│       ├── public/      # marketing site (home, about, programs, categories, grades, contact)
│       ├── superadmin/  # Super Admin console
│       ├── principal/   # School Admin console
│       └── teacher/     # Teacher console
└── .github/       # PR template
```

## Getting Started

### Backend
```bash
cd backend
./mvnw spring-boot:run
```
Runs on `http://localhost:8080`

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Runs on `http://localhost:5173`

By default the frontend uses mocked data (`VITE_USE_MOCK` defaults to `true`).
Set `VITE_USE_MOCK=false` in your `.env` (or Vercel env vars) to hit the real
backend at `http://localhost:8080` — see `frontend/.env.example` for every
variable the frontend reads (Web3Forms, Buttondown, feature flags, etc.) and
`docs/frontend-api-dependencies.md` for what the backend needs to implement
before that flip is safe.

### Frontend tests
```bash
cd frontend
npm test          # Vitest unit/component tests (mock mode, no backend needed)
npm run test:e2e  # Playwright smoke tests against the dev server (mock mode)
```

## Docs

Start here before touching code — new to the project? Read
[`docs/onboarding.md`](docs/onboarding.md) first:
- [`docs/onboarding.md`](docs/onboarding.md) — full setup guide, prerequisites, first run
- [`docs/requirements.md`](docs/requirements.md) — roles, permissions, scope, and out-of-scope/future-enhancement features already in the frontend (§3a)
- [`docs/decisions.md`](docs/decisions.md) — ADR log of architectural decisions
- [`docs/er-diagram.md`](docs/er-diagram.md) — database schema
- [`docs/api-contract.md`](docs/api-contract.md) — endpoint contracts the backend targets
- [`docs/frontend-api-dependencies.md`](docs/frontend-api-dependencies.md) — every endpoint the frontend actually calls, cross-referenced against `api-contract.md`, including gaps
- [`docs/user-flows.md`](docs/user-flows.md) — role-based flow diagrams
- [`docs/frontend-ui-pass-2026-07.md`](docs/frontend-ui-pass-2026-07.md) — July 2026 UI/UX polish pass: new routes, contextual kit navigation, category browsing, portal profile/dashboard additions
- [`docs/frontend-portal-hardening-2026-07.md`](docs/frontend-portal-hardening-2026-07.md) — July 2026 portal hardening pass: account menu/logout fix, saved kits, message status, teacher invitations, notification centre, advanced search, role permissions matrix

## Git Workflow

- `main` is protected — no direct pushes, PRs only, 1 approval required
- Branch naming: `feature/<desc>`, `fix/<desc>`, `docs/<desc>`
- Commit convention: Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`, `chore:`)
- Every PR uses the template in `.github/pull_request_template.md`

```bash
git checkout main
git pull origin main
git checkout -b feature/your-feature-name
# ...work, commit...
git push origin feature/your-feature-name
# open PR on GitHub, tag the other dev as reviewer
```

## Team

| Name | Module Ownership |
|------|-------------------|
| [Vandana] | Auth + Security (backend JWT, Spring Security, frontend route guards/token storage) |
| [Thaneesha] | Schools + Kits + Users CRUD (backend + frontend) |
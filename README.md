# Yntra Sparks

B2B platform giving schools access to STEM learning kits. MVP scope: Super
Admin, School Admin (Principal), and Teacher roles — no student/parent login,
no marketplace, no quizzes (see `docs/requirements.md` §3 for full out-of-scope list).

## Tech Stack

**Frontend:** Vue.js 3, Tailwind CSS, Vue Router, Pinia, Axios
**Backend:** Java, Spring Boot, Spring Security, JWT (access + refresh token)
**Database:** PostgreSQL
**Migrations:** Flyway

## Repo Structure

```
yntra-sparks/
├── docs/          # requirements, decisions log, ER diagram, API contract, user flows
├── backend/       # Spring Boot app (layered: controller/service/repository/entity/dto)
├── frontend/      # Vue 3 app (Vite)
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

## Docs

Start here before touching code:
- [`docs/requirements.md`](docs/requirements.md) — roles, permissions, scope
- [`docs/decisions.md`](docs/decisions.md) — ADR log of architectural decisions
- `docs/er-diagram.md` — database schema (coming Day 2)
- `docs/api-contract.md` — endpoint contracts (coming Day 2-3)
- `docs/user-flows.md` — role-based flow diagrams

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
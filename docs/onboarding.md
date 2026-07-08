# Onboarding Guide — Yntra Sparks

**For:** New team members setting up the project for the first time
**Last updated:** July 2026

Read this top to bottom before touching any code. Should take about 30 minutes
to get fully running.

---

## 1. Prerequisites

Install these before anything else. Order matters.

### Git
Download from https://git-scm.com/download/win
Verify: `git --version`

### Java 17
Download JDK 17 from https://adoptium.net (Temurin 17 LTS)
Verify: `java -version` — must show version 17, not 21 or 24

> If you already have a different Java version installed, make sure
> JAVA_HOME points to JDK 17. Spring Boot 4.x compiles for Java 17 target.

### Node.js
Download LTS version from https://nodejs.org
Verify: `node --version` and `npm --version`

### PostgreSQL 16
Download from https://www.postgresql.org/download/windows
During install:
- Set a password for the `postgres` user — write it down, you'll need it
- Keep default port 5432
- Skip Stack Builder at the end

Verify the service is running:
```powershell
Get-Service -Name postgresql*
```
Status should show `Running`.

### VS Code
Download from https://code.visualstudio.com
Install the **Extension Pack for Java** (Microsoft) from the Extensions panel.
This gives you Java IntelliSense, Maven support, and debugger.

---

## 2. Clone the Repo

First, accept the GitHub collaborator invite — check your email or
GitHub notifications. You won't be able to push without accepting it.

```powershell
git clone https://github.com/Fushiguro-3/yntra-sparks.git
cd yntra-sparks
```

Tell git who you are (one time only):
```powershell
git config --global user.name "Your Name"
git config --global user.email "your-github-email@gmail.com"
```

---

## 3. Backend Setup

### 3.1 Create the database

Open **SQL Shell (psql)** from your Start menu. Press Enter through the
Server/Port/Username prompts, then enter your postgres password when asked.

```sql
CREATE DATABASE yntra_sparks;
\q
```

### 3.2 Create your local config file

Create this file at exactly this path — it is gitignored so it never gets
committed:

```
backend/src/main/resources/application-local.yml
```

Contents:
```yaml
spring:
  datasource:
    password: YOUR_ACTUAL_POSTGRES_PASSWORD_HERE

app:
  jwt:
    secret: local-dev-secret-key-change-in-production-minimum-32-chars
```

Replace `YOUR_ACTUAL_POSTGRES_PASSWORD_HERE` with the password you set
during PostgreSQL install.

### 3.3 Run the backend

```powershell
cd D:\yntra-sparks\backend
./mvnw spring-boot:run "-Dspring-boot.run.profiles=local"
```

First run takes 1-2 minutes — Maven downloads dependencies and Flyway
runs both database migrations automatically, creating all tables.

### 3.4 Verify the backend is running

Open your browser and go to:
```
http://localhost:8080/api/health
```

You should see:
```json
{"data":"Yntra Sparks API is running","success":true}
```

If you see this, the backend is fully working.

### 3.5 Insert a test Super Admin

Open SQL Shell (psql), connect to `yntra_sparks`:
```
Database [postgres]: yntra_sparks
```

Then run:
```sql
INSERT INTO app_user (name, email, password, role, status, must_change_password, created_at, updated_at)
VALUES ('Super Admin', 'admin@yntrasparks.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'SUPER_ADMIN', 'ACTIVE', false, now(), now());
```

This creates a Super Admin with password `password` for local testing.

---

## 4. Frontend Setup

### 4.1 Initialize the Vue project

```powershell
cd D:\yntra-sparks\frontend
npm create vite@latest . -- --template vue
```

When asked to overwrite existing files, confirm yes.

### 4.2 Install dependencies

```powershell
npm install
npm install vue-router@4 pinia axios
npm install -D tailwindcss @tailwindcss/vite
```

### 4.3 Configure Tailwind

Replace the contents of `vite.config.js` with:
```js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
  ],
})
```

Replace the contents of `src/style.css` with:
```css
@import "tailwindcss";
```

### 4.4 Create environment file

Create `frontend/.env.development` (already gitignored):
```
VITE_API_BASE_URL=http://localhost:8080/api
```

### 4.5 Run the frontend

```powershell
npm run dev
```

Opens on `http://localhost:5173`

---

## 5. Git Workflow

Every piece of work follows this exact loop — no exceptions:

```powershell
# START — always from updated main
git checkout main
git pull origin main
git checkout -b feature/your-feature-name

# WORK — commit as you go, not just at the end
git add .
git status          # always check before committing
git commit -m "feat: describe what you did"

# PUSH
git push origin feature/your-feature-name

# PR — go to GitHub, click the banner or Pull requests → New pull request
# Set base: main, compare: your branch
# Tag the other dev as reviewer
# Wait for approval, then merge

# CLEANUP — after merging
git checkout main
git pull origin main
git branch -D feature/your-feature-name
git push origin --delete feature/your-feature-name
```

### Branch naming
- `feature/` — new features
- `fix/` — bug fixes
- `docs/` — documentation only
- `chore/` — cleanup, config, tooling

### Commit message convention
```
feat: add login page
fix: correct token expiry handling
docs: update onboarding guide
chore: remove unused dependency
refactor: extract auth helper function
```

### Rules
- Never push directly to `main`
- Always `git pull origin main` before creating a new branch
- Always run `git status` before `git add .` and before `git commit`
- Delete branches after merging — both locally and on GitHub

---

## 6. Project Structure

```
yntra-sparks/
├── docs/               # requirements, decisions, ER diagram, API contract
├── backend/            # Spring Boot REST API (port 8080)
│   └── src/main/java/com/yntrasparks/backend/
│       ├── controller/ # HTTP endpoints
│       ├── service/    # business logic
│       ├── repository/ # database access (Spring Data JPA)
│       ├── entity/     # JPA entities (School, User, Kit, Video, etc.)
│       ├── dto/        # request and response shapes
│       ├── security/   # JWT filter, UserDetailsService
│       ├── config/     # SecurityConfig, CORS
│       └── exception/  # GlobalExceptionHandler, custom exceptions
└── frontend/           # Vue 3 app (port 5173)
    └── src/
        ├── api/        # axios instance and API calls
        ├── components/ # reusable UI components
        ├── views/      # route-level pages
        ├── router/     # Vue Router with role-based guards
        ├── stores/     # Pinia stores (auth, etc.)
        └── layouts/    # role-specific shell layouts
```

---

## 7. Key Docs to Read

Before writing any code, read these in order:

1. `docs/requirements.md` — what the product does, roles, out-of-scope list
2. `docs/decisions.md` — why key decisions were made (ADR log)
3. `docs/er-diagram.md` — database schema
4. `docs/api-contract.md` — every endpoint with request/response shapes

---

## 8. Team

| Name | Role | Module |
|------|------|--------|
| Vandana | Backend | Auth, Schools, Kits, Categories, Teachers |
| [Co-intern name] | Frontend | All Vue 3 UI |

Backend questions → Vandana
Frontend questions → [Co-intern name]
# CampusConnect – Shared Project Memory

> This file covers the **shared frontend and shared backend** of CampusConnect.
> It is the first file any AI assistant or new collaborator should read.
>
> For Arham's personal backend workspace, see `Arham/memory.md`.
> For full team onboarding, see `COLLABORATORS.md`.

------------------------------------------------------------------------

# Project Information

**Project Name:** Unified University Portal (CampusConnect)

**Current Version:** v0.1 (Shared Project)

**Frontend:** React.js (Vite) — `frontend/`

**Shared Backend:** Spring Boot 3.3.2 / Java 17 — `backend/`

**Database:** None yet (Phase 2)

**Build Tool:** Maven (backend) · npm (frontend)

------------------------------------------------------------------------

# Repository Structure

```
CampusConnect/
├── frontend/                  ← Shared React (Vite) app
├── backend/                   ← Shared Spring Boot backend
├── Arham/                     ← Arham's personal workspace
│   ├── backend/               ← Arham's individual Spring Boot project
│   └── memory.md              ← Arham's personal session memory
├── COLLABORATORS.md           ← Team onboarding guide
└── memory.md                  ← This file (shared project memory)
```

------------------------------------------------------------------------

# Current Development Phase

**Phase:** Phase 1 – UI Shell + Auth Stubs ✅ COMPLETED

**Next Phase:** Phase 2 – Database Integration + JWT Authentication

------------------------------------------------------------------------

# Completed Work

## Frontend (`frontend/`)

- ✅ Vite + React scaffold
- ✅ `react-router-dom` installed
- ✅ `src/index.css` — Global design system
  - Inter font (Google Fonts)
  - Teal accent `#1A9882`, lavender auth panel `#E8EAFA`
  - Full CSS variable set: colors, radii, shadows, transitions
  - Auth layout, dashboard layout, stat cards, sidebar, table styles
- ✅ `src/main.jsx` — Entry point with `BrowserRouter`
- ✅ `src/App.jsx` — Routes: `/` → Login · `/signup` → Signup · `/dashboard` → Dashboard
- ✅ `src/pages/LoginPage.jsx`
  - Left: form (white) · Right: lavender illustration panel
  - Fields: Username/Email, Password, Remember Me
  - Social buttons (Google, Facebook — cosmetic)
  - Link to Signup
  - **Phase 1:** any credentials accepted → redirects to `/dashboard`
- ✅ `src/pages/SignupPage.jsx`
  - Left: illustration · Right: form (mirrored layout)
  - Fields: Full Name, Username, Email, Password, Confirm Password
  - **Phase 1:** any input accepted → redirects to `/dashboard`
- ✅ `src/pages/DashboardPage.jsx`
  - Sidebar + main content area
  - Stat cards: **Enrolled Courses · Routine · Attendance Metrics**
  - Continue Learning table (with progress bars + status badges)
  - Recommended For You card grid
  - **All data is static placeholder — ready for API wiring**
- ✅ `src/components/Sidebar.jsx`
  - Nav items: **Home · Courses · Bookmarks · Advising · Messaging Board**
  - Logout button → redirects to `/`
  - **Phase 1:** nav item clicks are no-ops (routes TBD per collaborator)
- ✅ `src/components/StatCard.jsx`
  - Reusable card: icon · value · label · optional link
- ✅ `src/assets/auth_illustration.png` — AI-generated academic illustration

## Shared Backend (`backend/`)

- ✅ `pom.xml` — Spring Boot 3.3.2, Spring Web, Security, Lombok, DevTools
  - Phase 2 dependencies (JPA, H2, MySQL, JWT) commented and ready to uncomment
- ✅ `CampusConnectApplication.java` — Entry point, port 8080
- ✅ `controller/AuthController.java`
  - `POST /api/auth/login` → stub `{ success: true }`
  - `POST /api/auth/register` → stub `{ success: true }`
  - `POST /api/auth/logout` → stub `{ success: true }`
- ✅ `dto/AuthRequest.java` — username, password, fullName, email fields
- ✅ `dto/AuthResponse.java` — success, message fields (Phase 2 token fields commented)
- ✅ `config/SecurityConfig.java` — permits all requests (Phase 1 stub)
- ✅ `config/CorsConfig.java` — allows `localhost:5173` and `localhost:3000`
- ✅ `resources/application.properties` — JPA/datasource auto-config disabled (Phase 1)
- ✅ `backend/README.md` — Setup, API docs, Phase 2 checklist

## Documentation

- ✅ `COLLABORATORS.md` — Full team onboarding guide
- ✅ `Arham/memory.md` — Arham's personal workspace memory (reverted, untouched)

------------------------------------------------------------------------

# How to Run

### Frontend
```bash
cd frontend
npm install       # first time only
npm run dev       # → http://localhost:5173
```

### Backend
```bash
cd backend
mvn spring-boot:run   # → http://localhost:8080
```

------------------------------------------------------------------------

# Design System (key decisions)

| Token                | Value       | Usage                        |
|----------------------|-------------|------------------------------|
| `--color-teal`       | `#1A9882`   | Primary accent, buttons      |
| `--color-lavender`   | `#E8EAFA`   | Auth panel background        |
| `--color-bg`         | `#F4F6F8`   | Dashboard page background    |
| `--color-text`       | `#111827`   | Primary text                 |
| `--color-border`     | `#E5E7EB`   | Card and input borders       |
| Font                 | Inter       | All text, loaded via Google  |

**Login layout:** form LEFT · illustration RIGHT

**Signup layout:** illustration LEFT · form RIGHT (mirrored)

**Dashboard sidebar items:** Home · Courses · Bookmarks · Advising · Messaging Board

**Dashboard stat cards:** Enrolled Courses · Routine · Attendance Metrics

------------------------------------------------------------------------

# Phase 2 TODO List

## Shared Backend

- [ ] Uncomment JPA + H2 + MySQL + JWT in `backend/pom.xml`
- [ ] Remove datasource exclusions from `application.properties`
- [ ] Create `User` entity in `backend/.../model/User.java`
- [ ] Create `Role` entity in `backend/.../model/Role.java`
- [ ] Create `UserRepository` in `backend/.../repository/`
- [ ] Implement `JwtService` (generate + validate tokens)
- [ ] Implement `JwtAuthFilter` (intercept Bearer tokens)
- [ ] Implement `UserDetailsServiceImpl`
- [ ] Update `AuthController.login` — BCrypt verify + return JWT
- [ ] Update `AuthController.register` — hash password + save user + return JWT
- [ ] Update `SecurityConfig` — JWT filter chain + RBAC rules
- [ ] Add H2 dev profile + MySQL prod profile

## Frontend

- [ ] Create `ProtectedRoute` component (reads JWT from localStorage)
- [ ] Wrap `/dashboard` route with `ProtectedRoute` in `App.jsx`
- [ ] On login/signup success, store JWT in `localStorage`
- [ ] Read username from JWT and show in dashboard greeting
- [ ] Replace static stat card values with real API calls:
  - `GET /api/courses/enrolled` → Enrolled Courses
  - `GET /api/schedule/weekly` → Routine
  - `GET /api/attendance/summary` → Attendance Metrics
- [ ] Replace static Continue Learning table with `GET /api/courses/in-progress`
- [ ] Replace static Recommended cards with `GET /api/courses/recommended`
- [ ] Wire Sidebar logout to call `POST /api/auth/logout` before redirecting

## Collaborator Feature Routes (TBD)

- [ ] `/courses` — Courses page (add to `App.jsx` + Sidebar `onClick`)
- [ ] `/bookmarks` — Bookmarks page
- [ ] `/advising` — Advising page
- [ ] `/messaging` — Messaging Board page

------------------------------------------------------------------------

# Known Issues

None.

------------------------------------------------------------------------

# Blockers

None.

------------------------------------------------------------------------

# Session Notes

## Session 1 (2026-07-23)

- Scaffolded Vite + React frontend (`frontend/`)
- Built Login, Signup, Dashboard pages from reference images
- Created Sidebar with 5 nav items, StatCard component
- Created shared Spring Boot backend (`backend/`) with auth stub endpoints
- Created `COLLABORATORS.md` for team onboarding
- Vite dev server confirmed running on `http://localhost:5173`

------------------------------------------------------------------------

# Change Log

## v0.1

- Phase 1 complete: Login, Signup, Dashboard UI shell built.
- Shared Spring Boot backend with auth stubs.
- COLLABORATORS.md created.

------------------------------------------------------------------------

# Instructions for AI

Before any task on the shared project:

1. Read this file first to understand current state.
2. The shared backend is `backend/` (repo root) — NOT `Arham/backend/`.
3. The shared frontend is `frontend/` (repo root).
4. Do NOT modify `Arham/memory.md` — that is Arham's personal file.
5. Update **this file** after completing any shared frontend or backend work.
6. For team conventions, refer to `COLLABORATORS.md`.
7. For product requirements, refer to `Arham/prd.md`.
8. For system architecture, refer to `Arham/architecture.md`.
9. All Phase 2 TODOs in source files are marked with `// TODO (Phase 2)` comments.

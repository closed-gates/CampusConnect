# CampusConnect – Collaborator Guide

> Read this file before touching any code.
> It tells you exactly what has been built, what still needs to be done,
> and where to add your feature.

---

## Project Overview

**CampusConnect** is a unified university portal that gives students, faculty, and staff
a single place for courses, schedules, advising, messaging, attendance, and more.

**Stack:** React (Vite) frontend · Spring Boot 3.3.2 backend · MySQL (Phase 2+)

---

## Repository Structure

```
CampusConnect/
├── frontend/                  ← React (Vite) – shared UI
│   ├── src/
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx       ← Login page
│   │   │   ├── SignupPage.jsx      ← Signup page
│   │   │   └── DashboardPage.jsx   ← Dashboard shell (add your feature here)
│   │   ├── components/
│   │   │   ├── Sidebar.jsx         ← Navigation sidebar
│   │   │   └── StatCard.jsx        ← Reusable stat card
│   │   ├── App.jsx                 ← Route definitions
│   │   ├── main.jsx                ← React entry point
│   │   └── index.css               ← Global design system (DO NOT OVERRIDE)
│   └── package.json
│
├── backend/                   ← Spring Boot – shared auth backend (Phase 1 stub)
│   ├── src/main/java/com/campusconnect/backend/
│   │   ├── CampusConnectApplication.java
│   │   ├── controller/AuthController.java   ← Login / Register / Logout stubs
│   │   ├── dto/AuthRequest.java
│   │   ├── dto/AuthResponse.java
│   │   └── config/
│   │       ├── SecurityConfig.java
│   │       └── CorsConfig.java
│   ├── src/main/resources/application.properties
│   ├── pom.xml
│   └── README.md
│
├── Arham/                     ← Arham's personal workspace
│   ├── backend/               ← Arham's individual Spring Boot project
│   ├── memory.md              ← Arham's session memory (AI reads this)
│   ├── prd.md
│   ├── architecture.md
│   ├── design.md
│   ├── phases.md
│   └── rules.md
│
└── COLLABORATORS.md           ← This file
```

---

## Running the App

### Frontend

```bash
cd frontend
npm install        # first time only
npm run dev        # starts at http://localhost:5173
```

### Backend (Shared Auth)

```bash
cd backend
mvn spring-boot:run   # starts at http://localhost:8080
```

> The frontend already expects the backend at `http://localhost:8080`.
> No environment variable setup needed for Phase 1.

---

## Current Status (Phase 1 – Complete)

| Feature                | Status        | Location                        |
|------------------------|---------------|---------------------------------|
| Login Page             | ✅ Done        | `frontend/src/pages/LoginPage.jsx` |
| Signup Page            | ✅ Done        | `frontend/src/pages/SignupPage.jsx` |
| Dashboard Shell        | ✅ Done        | `frontend/src/pages/DashboardPage.jsx` |
| Sidebar Navigation     | ✅ Done        | `frontend/src/components/Sidebar.jsx` |
| Auth Stub Endpoints    | ✅ Done        | `backend/controller/AuthController.java` |
| Database Integration   | ⏳ Phase 2     | `backend/` (see Phase 2 section) |
| JWT Authentication     | ⏳ Phase 2     | `backend/config/SecurityConfig.java` |
| Real User Data         | ⏳ Phase 2     | Dashboard page TODOs |
| Courses Feature        | ⏳ TBD         | Add page + API |
| Advising Feature       | ⏳ TBD         | Add page + API |
| Messaging Board        | ⏳ TBD         | Add page + API |
| Bookmarks Feature      | ⏳ TBD         | Add page + API |

---

## How to Add Your Feature (Step-by-Step)

### 1. Create your page

```
frontend/src/pages/YourFeaturePage.jsx
```

Use the existing pages as reference. Follow the CSS classes in `index.css`.

### 2. Add your route in App.jsx

```jsx
// frontend/src/App.jsx
import YourFeaturePage from './pages/YourFeaturePage'

// Inside <Routes>:
<Route path="/your-feature" element={<YourFeaturePage />} />
```

### 3. Wire up your sidebar nav item

In `Sidebar.jsx`, the nav item for your feature already exists.
Add a `navigate('/your-feature')` call inside its `onClick` handler:

```jsx
// In Sidebar.jsx → NAV_ITEMS onClick:
onClick={() => navigate('/courses')}   // example
```

### 4. Connect to the backend

The shared backend lives at `http://localhost:8080`.
For your API call:

```js
const res = await fetch('http://localhost:8080/api/your-feature', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`,  // Phase 2
    'Content-Type': 'application/json',
  },
})
```

### 5. Add your backend controller

Create your controller in a **new package** inside the shared backend:

```
backend/src/main/java/com/campusconnect/backend/controller/YourController.java
```

Use `AuthController.java` as a template.

---

## Design Rules (READ BEFORE WRITING CSS)

All design tokens live in `frontend/src/index.css` under `:root {}`.

| Token                  | Value       | Usage                  |
|------------------------|-------------|------------------------|
| `--color-teal`         | `#1A9882`   | Primary accent         |
| `--color-teal-light`   | `#E6F5F2`   | Hover backgrounds      |
| `--color-lavender`     | `#E8EAFA`   | Auth panel background  |
| `--color-bg`           | `#F4F6F8`   | Page background        |
| `--color-text`         | `#111827`   | Primary text           |
| `--color-text-sub`     | `#6B7280`   | Secondary text         |
| `--color-border`       | `#E5E7EB`   | Card/input borders     |
| `--radius-md`          | `12px`      | Card border radius     |
| `--shadow-md`          | (see file)  | Card hover shadow      |

**Rules:**
- Use CSS variables, not hardcoded hex values.
- Use `section-card` class for content panels.
- Use `btn btn-primary` for primary buttons.
- Do NOT add new Google Font imports — Inter is already loaded.
- Keep your CSS in your own component or a separate `.css` file. Do not modify `index.css` unless adding global tokens.

---

## Sidebar Nav Items

The sidebar has these nav items. Each is a placeholder for a future route:

| Nav Item        | Target Route       | Status       |
|-----------------|--------------------|--------------|
| Home            | `/dashboard`       | ✅ Active     |
| Courses         | `/courses`         | ⏳ TBD        |
| Bookmarks       | `/bookmarks`       | ⏳ TBD        |
| Advising        | `/advising`        | ⏳ TBD        |
| Messaging Board | `/messaging`       | ⏳ TBD        |

---

## Phase 2 – What Still Needs to Be Done

> These are shared tasks. Coordinate before starting.

### Backend
- [ ] Add JPA + H2 (dev) + MySQL (prod) to `backend/pom.xml`
- [ ] Create `User` and `Role` entities in `backend/.../model/`
- [ ] Create `UserRepository` in `backend/.../repository/`
- [ ] Implement `JwtService` + `JwtAuthFilter`
- [ ] Update `AuthController.login` — BCrypt verify + return JWT
- [ ] Update `AuthController.register` — save user + return JWT
- [ ] Update `SecurityConfig` — add JWT filter + RBAC rules
- [ ] Remove datasource exclusions from `application.properties`

### Frontend
- [ ] Create `ProtectedRoute` component that checks for JWT
- [ ] Wrap `/dashboard` and all feature routes with `ProtectedRoute`
- [ ] Store JWT in `localStorage` after login/signup
- [ ] Add Axios/fetch interceptor to attach `Authorization` header
- [ ] Pull real username from JWT for the dashboard greeting
- [ ] Replace all static placeholder data with real API calls

---

## Git Workflow

- Create a branch for your feature: `git checkout -b feature/your-name-feature`
- Commit often with clear messages
- Do NOT commit directly to `main`
- Open a Pull Request and ask for review before merging

---

## Contact / Questions

- Refer to `Arham/prd.md` for the full product requirements.
- Refer to `Arham/architecture.md` for the system architecture.
- Refer to `Arham/design.md` for design guidelines.
- Refer to `Arham/memory.md` for session history (AI assistant context).

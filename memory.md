# CampusConnect – Shared Project Memory

> This file covers the **shared frontend and shared backend** of CampusConnect.
> It is the first file any AI assistant or new collaborator should read.
> For full team onboarding, see `COLLABORATORS.md`.


------------------------------------------------------------------------

# Project Information

**Project Name:** Unified University Portal (CampusConnect)

**Current Version:** v0.1 (Shared Project)

**Frontend:** React.js (Vite) — `frontend/`

**Shared Backend:** Spring Boot 3.3.2 / Java 17 — `backend/`

**Database:** Neon PostgreSQL (cloud) — active on `prod` profile

**Build Tool:** Maven (backend) · npm (frontend)

------------------------------------------------------------------------

# Repository Structure

```
CampusConnect/
├── frontend/                  ← Shared React (Vite) app
├── backend/                   ← Shared Spring Boot backend
├── COLLABORATORS.md           ← Team onboarding guide
└── memory.md                  ← This file (shared project memory)
```

------------------------------------------------------------------------

# Current Development Phase

**Phase:** Phase 3 – Database Integration (Club Activities + Attendance) ✅ IN PROGRESS

**Active Profile:** `prod` (Neon PostgreSQL cloud DB)

**Next Phase:** Full JWT Authentication + RBAC

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

## Session 2 (2026-08-02)

### Club Recruitment Form Improvement (Arham)

- Replaced the simple 3-field application modal in `ClubActivitiesView` with a rich 7-step multi-step form overlay
- **Flow:** Welcome → Personal Info → Interests → Skills → Availability → Final Question → Confirmation
- **New frontend model constants** (`clubModel.js`): `RECRUITMENT_FORM_STEPS`, `TEAM_OPTIONS`, `SKILL_OPTIONS`, `TIME_COMMITMENT_OPTIONS`, `PARTICIPATION_OPTIONS`, `DEPARTMENT_OPTIONS`, `YEAR_SEMESTER_OPTIONS`, `EMPTY_RECRUITMENT_FORM`
- **Controller** (`clubController.js`): multi-step state, `nextStep`, `prevStep`, per-step validation, `updateApplyField`, `toggleApplyArrayField`
- **View** (`ClubActivitiesView.jsx`): fullscreen overlay with teal gradient header, animated progress bar with step dots, branded checkboxes/radio buttons, fade-in step transitions, confirmation card with bounce animation
- **CSS** (`ClubActivitiesPage.css` in views/): 200+ lines of new styles for the multi-step form; all existing notice/recruitment styles preserved exactly

### Faculty Attendance Tracking — New Feature (Arham)

**Backend (new files only):**
- `model/AttendanceRecord.java` — domain model (courseId, studentId, date, status: PRESENT/ABSENT/LATE)
- `service/AttendanceService.java` — in-memory store with seeded data; `getAttendance`, `markAttendance`, `getCourseSummary`, `getCourseHistory`
- `controller/AttendanceController.java` — REST endpoints: `GET /api/attendance`, `POST /api/attendance`, `GET /api/attendance/summary`, `GET /api/attendance/history`

**Frontend (new files only):**
- `models/attendanceModel.js` — `FACULTY_COURSES`, `COURSE_STUDENTS`, `SEED_ATTENDANCE_HISTORY`, `STATUS_CONFIG`, `calculateSummary`, `groupByDate`
- `controllers/attendanceController.js` — `useAttendanceController()` hook: course selection, date picker, roster, mark individual/all students, submit, history, summary stats
- `views/pages/AttendanceView.jsx` — Course selector cards (color-coded), 3 tabs: Mark Attendance (table with P/A/L buttons, quick-mark-all, progress bar), History (grouped by date with stats), Summary (circular chart + stat cards + per-student table)
- `views/pages/AttendancePage.css` — dedicated styles: course cards with accent colors, attendance table, status button states, circular progress SVG, rate bars

**Minimal wiring changes:**
- `App.jsx`: added `/attendance` route + `AttendanceView` import
- `Sidebar.jsx` (views/): added Attendance nav item with clipboard icon, route `/attendance`

**No other features changed.** Dashboard, Courses, Routine, Messaging, Advising — all untouched.

------------------------------------------------------------------------

## Session 3 (2026-08-19)

### Exam Schedule Dashboard Widget + Routine Builder Integration

**Goal:** Replace static "Continue Learning" table on dashboard with a live exam countdown panel; also wire the Routine Builder to use DB-sourced exam dates.

**Backend (new files only):**
- `model/ExamSchedule.java` — `@Entity` mapped to `exam_schedules`; fields: courseCode (unique), courseName, midtermDate, finalDate
- `repository/ExamScheduleRepository.java` — `findByCourseCode`, `findByCourseCodeIn`
- `dto/ExamScheduleDTO.java` — response DTO with pre-computed `midtermDaysLeft` / `finalDaysLeft`
- `service/ExamScheduleService.java` — `@PostConstruct` seeds one row per course code by parsing `CourseSection.examDay` (finalDate) and computing midtermDate = finalDate − 56 days; `getExamScheduleForStudent()` joins enrollment + exam_schedules; `getAllExamSchedules()` for Routine Builder
- `controller/ExamScheduleController.java` — REST: `GET /api/exam-schedule?studentId=`, `/all`, `/{code}`

**Frontend (new files only):**
- `models/examScheduleModel.js` — constants, `getUrgency()`, `formatExamDate()`, `formatDaysLeft()`
- `controllers/examScheduleController.js` — `useExamScheduleController()` hook: reads studentId from localStorage, fetches `/api/exam-schedule?studentId=`
- `views/components/ExamScheduleWidget.jsx` — dashboard panel; per-course cards with Midterm + Final rows and colour-coded countdown badges (green/amber/red/passed); shimmer loading skeletons
- `views/components/ExamScheduleWidget.css` — dedicated styles, urgency pulse animation, shimmer keyframes

**Minimal wiring changes:**
- `views/pages/DashboardView.jsx`: removed Continue Learning block, added `<ExamScheduleWidget />`
- `controllers/dashboardController.js`: removed unused `continueLearning` return value
- `services/courseService.js`: added `getExamSchedules()` → `GET /api/exam-schedule/all`
- `controllers/routineController.js`: parallel-fetches sections + exam schedules, merges DB dates into each section via `normaliseSection(s, scheduleMap)`
- `views/pages/RoutineView.jsx`: `CourseInfoBlock` now shows separate Midterm and Final Exam rows from DB

**Database State (Neon PostgreSQL):**
- `exam_schedules` table auto-created by Hibernate `ddl-auto=update`
- Seeded on first startup via `@PostConstruct` (idempotent)
  - One row per unique course code (CSE110, CSE220, CSE321, CSE370, CSE421, CSE470, CSE481, MAT201, PHY101)
  - finalDate parsed from `CourseSection.examDay` string
  - midtermDate = finalDate − 56 days

**No other features changed.** Attendance, Club, Courses, Advising, Auth — all untouched.

------------------------------------------------------------------------


## v0.1
- Phase 1 complete: Login, Signup, Dashboard UI shell built.
- Shared Spring Boot backend with auth stubs.
- COLLABORATORS.md created.

## v0.3 (2026-08-14)

**Phase 3 – Neon PostgreSQL Database Integration (Club Activities + Attendance)**

### Backend Changes
- **pom.xml:** Added `maven-compiler-plugin` with `annotationProcessorPaths` for Lombok. Bumped `lombok.version` to `1.18.46` for Java 26 compatibility.
- **application.properties:** Switched `spring.profiles.active` from `dev` (H2) → `prod` (Neon PostgreSQL).
- **JPA Entity conversions (4 files):**
  - `model/AttendanceRecord.java` → `@Entity` mapped to `attendance_records`
  - `model/ClubNotice.java` → `@Entity` mapped to `club_notices`
  - `model/Recruitment.java` → `@Entity` mapped to `recruitments`
  - `model/Application.java` → `@Entity` mapped to `club_applications`
- **New JPA Repositories (4 files):**
  - `repository/AttendanceRecordRepository.java`
  - `repository/ClubNoticeRepository.java`
  - `repository/RecruitmentRepository.java`
  - `repository/ApplicationRepository.java`
- **Service refactors:**
  - `service/AttendanceService.java` — Uses `AttendanceRecordRepository`; `@PostConstruct` seeds 28 records across 3 courses
  - `service/ClubService.java` — Uses 3 club repositories; `@PostConstruct` seeds 5 notices + 5 recruitments

### Frontend Changes
- `controllers/clubController.js` — `useEffect` loads notices + recruitments from `GET /api/clubs/notices` and `GET /api/clubs/recruitment` on mount. All mutations use real API calls.
- `controllers/attendanceController.js` — `useEffect` loads records + history + summary from real backend on course/date change. Submits each mark via `POST /api/attendance`.

### Database State (Neon PostgreSQL)
- Tables auto-created by Hibernate `ddl-auto=update`
- Seed data inserted via `@PostConstruct` (count() == 0 guard)
  - `club_notices`: 5 records (3 pinned)
  - `recruitments`: 5 active records
  - `attendance_records`: 28 records across CSE470, CSE341, CSE221

All other features (Dashboard, Courses, Routine, Advising, Auth) unchanged.

------------------------------------------------------------------------

## Session 4 (2026-08-21)

### Stripe Payment, Receipt Generator & Offline Partner Bank Locator

**Goal:** Provide an official university course registration fee invoice dynamically computed from student database enrollments, online payment processing via Stripe, and offline payment with PDF download & live partner bank discovery map.

**Security & Secrets Management:**
- Extracted hardcoded Neon PostgreSQL database credentials from `application-prod.properties` into `backend/.env`.
- Added `STRIPE_SECRET_KEY` and `VITE_STRIPE_PUBLISHABLE_KEY` environment variables.
- Created `backend/.env.example` and `frontend/.env.example` templates for team collaboration.
- Updated `.gitignore` to prevent any `.env` secrets from being committed to Git.

**Backend (new files only):**
- `model/PaymentRecord.java` — JPA Entity mapped to `payment_records` table in Neon PostgreSQL
- `repository/PaymentRecordRepository.java` — Repository with student-isolated and admin-global queries
- `dto/PaymentConfirmRequest.java` — Payload DTO for saving confirmed payments
- `dto/PaymentReceiptItemDTO.java` — receipt course row DTO (courseId, title, credits, regDate, amount)
- `dto/PaymentReceiptDTO.java` — full invoice breakdown with summary, bank info, and `noEnrollment` flag
- `dto/BankInfoDTO.java` — university partner bank account details
- `dto/PaymentIntentRequest.java` & `dto/PaymentIntentResponse.java` — Stripe intent payloads
- `service/PaymentReceiptService.java` — computes fee breakdown from `SectionRegistrationRepository` and `StudentProfileRepository`, formats Bangladeshi Taka text, handles zero enrollment state
- `service/PaymentService.java` — Stripe Java SDK (`PaymentIntent.create`) integration, DB receipt persistence, seeding, and role-isolated history lookup
- `controller/PaymentReceiptController.java` — REST: `GET /api/payments/receipt/{studentId}`
- `controller/PaymentController.java` — REST: `POST /api/payments/create-intent`, `POST /api/payments/confirm`, `GET /api/payments/history`, `GET /api/payments/receipt-record/{id}`
- `pom.xml`: Added `com.stripe:stripe-java:24.0.0`

**Frontend (new files only):**
- `models/paymentModel.js` — `ACCEPTING_BANKS`, `DHAKA_STUDENT_AREAS`, `VERIFIED_DHAKA_PARTNER_BRANCHES`, `geocodeBankWithNominatim()`, Haversine formula, currency helpers
- `controllers/usePaymentController.js` — `usePaymentController()` custom hook: fetch receipt, database receipt persistence, role-isolated history, PDF generation (`jsPDF` + `jspdf-autotable`), real OSM Overpass + Nominatim bank geocoding
- `views/pages/PaymentView.jsx` — Two-tab interface (Current Term Fee Clearance & Payment History with PDF re-download), no-enrollment empty state, inline Stripe checkout, and Leaflet interactive partner bank map modal with neighborhood switcher & live GPS
- `views/pages/PaymentView.css` — Scoped styling matching `index.css` tokens

**Minimal wiring changes:**
- `App.jsx`: added `/payments` route + `PaymentView` import
- `Sidebar.jsx` (both `views/components/` and `components/`): added Payments nav item with payment card icon, route `/payments`

**Workflow Documentation:**
- Created `workflows/stripe_payment_workflow.md`

**No other features changed.** Dashboard, Courses, Advising, Routine, Messaging, Attendance, Assignments, Auth — all untouched.

------------------------------------------------------------------------

# Instructions for AI

Before any task on the shared project:

1. Read this file first to understand current state.
2. The shared backend is `backend/` (repo root).
3. The shared frontend is `frontend/` (repo root).
4. Update **this file** after completing any shared frontend or backend work.
5. For team conventions, refer to `COLLABORATORS.md`.
6. All Phase 3 TODOs in source files are marked with `// TODO (Phase 3)` comments.


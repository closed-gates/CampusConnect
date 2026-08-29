# Test Course Catalogue & Advising Workflow

## Overview
This feature implements the isolated database layer for the test course catalogue, relational section scheduling with faculty assignments, faculty authentication accounts for website login, and the "Confirm Advising" workflow on student profiles.

---

## Strict Isolation Guarantee
- **Existing Catalogue Preserved:** The original `course_catalog` and `course_section` tables remain completely untouched.
- **Dedicated Test Relational Tables:** All test catalogue entities are stored in `test_courses`, `test_faculties`, and `test_sections`.
- **Relational Integrity:** Foreign keys link `test_sections.course_id ➔ test_courses.id` and `test_sections.faculty_id ➔ test_faculties.id`. `test_faculties.user_id` links directly to `app_users.user_id`.
- **Conflict-Free Schedule:** All faculty section assignments are mathematically and programmatically verified to ensure zero time clashes.

---

## Sequential Communication Paths

### 1. Test Course Catalogue & Section Retrieval
```
TestCourses UI (View)
    │
    ▼ (invokes hook)
useTestCoursesController (Frontend Controller: testCourseController.js)
    │
    ▼ (HTTP GET /api/test-courses + GET /api/test-courses/sections + GET /api/test-courses/faculty)
TestCourseService (Frontend Service: testCourseService.js / apiClient.js)
    │
    ▼ (routes to backend endpoint)
TestCourseController.java (Backend REST Controller)
    │
    ▼ (delegates query & filtering)
TestCourseService.java (Backend Service)
    │
    ▼ (executes JPA query)
TestCourseRepository / TestSectionRepository / TestFacultyRepository
    │
    ▼ (SQL query)
Neon PostgreSQL / H2 Database (`test_courses`, `test_sections`, `test_faculties`)
```

### 2. Faculty Authentication & Login Workflow
```
LoginView (Frontend View: LoginView.jsx)
    │
    ▼ (submits credentials, e.g. FAC101 / Faculty@123)
useLoginController (Frontend Controller: authController.js)
    │
    ▼ (HTTP POST /api/auth/login)
AuthController.java (Backend REST Controller)
    │
    ▼ (validates BCrypt hash)
AuthService.java (Backend Service)
    │
    ▼ (queries user)
AppUserRepository (Backend Repository)
    │
    ▼ (SQL query on app_users)
Neon PostgreSQL / H2 Database (`app_users`)
    │
    ▼ (returns JWT token with role "FACULTY")
Frontend LocalStorage (sets token, userRole="FACULTY", userId="FAC101")
```

### 3. Student Advising Confirmation Workflow
```
AdvisingView - AdvisorPanel / Student Profile Card (Frontend View: AdvisingView.jsx)
    │
    ▼ (user clicks "Confirm Advising" button)
useAdvisorController.handleConfirmAdvising() (Frontend Controller: advisingController.js)
    │
    ▼ (HTTP POST /api/advisors/confirm/{studentId})
AdvisorController.confirmAdvising() (Backend REST Controller: AdvisorController.java)
    │
    ▼ (sets advisingConfirmed=true and advisingConfirmedAt=timestamp)
AdvisorService.confirmAdvising() (Backend Service: AdvisorService.java)
    │
    ▼ (persists updated student profile & advised courses)
StudentProfileRepository / AdvisedCourseRepository (Backend Repositories)
    │
    ▼ (SQL UPDATE student_profiles SET advising_confirmed=true, advising_confirmed_at=...)
Neon PostgreSQL / H2 Database (`student_profiles`, `advised_courses`)
    │
    ▼ (returns refreshed profile JSON with advisingConfirmed: true)
AdvisingView displays "✅ Advising Confirmed" banner with timestamp & success toast
```

---

## Files Involved

### Backend (Spring Boot 3.3.2 MVC)
- **Model**:
  - `backend/src/main/java/com/campusconnect/backend/model/TestFaculty.java` – JPA entity for test faculty members.
  - `backend/src/main/java/com/campusconnect/backend/model/TestCourse.java` – JPA entity for test courses.
  - `backend/src/main/java/com/campusconnect/backend/model/TestSection.java` – JPA entity for test sections (FK to Course & Faculty).
  - `backend/src/main/java/com/campusconnect/backend/model/StudentProfile.java` – Added `advisingConfirmed` and `advisingConfirmedAt` fields.
- **Repository**:
  - `backend/src/main/java/com/campusconnect/backend/repository/TestFacultyRepository.java`
  - `backend/src/main/java/com/campusconnect/backend/repository/TestCourseRepository.java`
  - `backend/src/main/java/com/campusconnect/backend/repository/TestSectionRepository.java`
- **Service**:
  - `backend/src/main/java/com/campusconnect/backend/service/TestCourseService.java` – Test catalogue queries & schedule conflict detection.
  - `backend/src/main/java/com/campusconnect/backend/service/TestCourseDataSeeder.java` – Automated startup seeder for 12 faculty accounts, 22 courses, and 74 conflict-free sections.
  - `backend/src/main/java/com/campusconnect/backend/service/AdvisorService.java` – Added `confirmAdvising` business logic.
- **Controller**:
  - `backend/src/main/java/com/campusconnect/backend/controller/TestCourseController.java` – REST API for test courses, sections, and faculty.
  - `backend/src/main/java/com/campusconnect/backend/controller/AdvisorController.java` – Added `POST /api/advisors/confirm/{studentId}` endpoint.

### Frontend (React + Vite MVC)
- **Model**:
  - `frontend/src/models/testCourseModel.js` – Test course constants, validation, and schemas.
  - `frontend/src/models/advisingModel.js` – Added advising status constants (`ADVISING_STATUS_CONFIRMED`, `ADVISING_STATUS_PENDING`).
- **Service**:
  - `frontend/src/services/testCourseService.js` – HTTP API wrapper for test courses, sections, and faculty.
- **Controller**:
  - `frontend/src/controllers/testCourseController.js` – React hook for test catalogue state and filters.
  - `frontend/src/controllers/advisingController.js` – Added `handleConfirmAdvising` and `confirming` state.
- **View**:
  - `frontend/src/views/pages/AdvisingView.jsx` – Integrated "Confirm Advising" button and confirmation banner into the student profile card.
  - `frontend/src/index.css` – Added responsive styling for `.adv-confirm-btn` and `.adv-confirmed-banner`.

---

## Seeded Faculty Login Credentials

All 12 faculty accounts are registered in `app_users` with role `FACULTY` and password `Faculty@123`.

| User ID | Full Name | Institutional Email | Department | Password | Role |
|---|---|---|---|---|---|
| `FAC101` | Dr. Sadia Rahman | `sadia.rahman@campus.edu` | Computer Science and Engineering | `Faculty@123` | `FACULTY` |
| `FAC102` | Dr. Tanvir Ahmed | `tanvir.ahmed@campus.edu` | Computer Science and Engineering | `Faculty@123` | `FACULTY` |
| `FAC103` | Dr. Nusrat Jahan | `nusrat.jahan@campus.edu` | Computer Science and Engineering | `Faculty@123` | `FACULTY` |
| `FAC104` | Dr. Farhan Kabir | `farhan.kabir@campus.edu` | Electrical and Electronic Engineering | `Faculty@123` | `FACULTY` |
| `FAC105` | Dr. Ayesha Siddiqua | `ayesha.siddiqua@campus.edu` | Electrical and Electronic Engineering | `Faculty@123` | `FACULTY` |
| `FAC106` | Dr. Rafiqul Islam | `rafiqul.islam@campus.edu` | Mathematics and Natural Sciences | `Faculty@123` | `FACULTY` |
| `FAC107` | Dr. Mehedi Hasan | `mehedi.hasan@campus.edu` | Mathematics and Natural Sciences | `Faculty@123` | `FACULTY` |
| `FAC108` | Dr. Sabrina Mostafa | `sabrina.mostafa@campus.edu` | BRAC Business School | `Faculty@123` | `FACULTY` |
| `FAC109` | Dr. Tariq Mahmood | `tariq.mahmood@campus.edu` | BRAC Business School | `Faculty@123` | `FACULTY` |
| `FAC110` | Dr. Samira Khan | `samira.khan@campus.edu` | Economics and Social Sciences | `Faculty@123` | `FACULTY` |
| `FAC111` | Dr. Asif Chowdhury | `asif.chowdhury@campus.edu` | English and Humanities | `Faculty@123` | `FACULTY` |
| `FAC112` | Dr. Farzana Yasmin | `farzana.yasmin@campus.edu` | Pharmacy | `Faculty@123` | `FACULTY` |

# Test Courses & Test Sections Advising Integration Workflow

## 1. Overview
This feature integrates `test_courses` and `test_sections` into the CampusConnect Advising module. Both Academic Advisors and Students can view, search, and register/assign course sections originating from the test catalog (`test_courses`, `test_sections`, and `test_faculties` tables in PostgreSQL).

---

## 2. Architecture & Communication Path (Strict MVC)

```
[View] AdvisingView.jsx / RegistrationView.jsx
      │  ▲
      │  │  State & Actions (filter, search, assign, drop)
      ▼  │
[Controller] advisingController.js / registrationController.js
      │  ▲
      │  │  REST API Calls (/api/test-courses/sections, /api/advisors/assign, /api/registration/sections)
      ▼  │
[Service] TestCourseService.java / AdvisorService.java / RegistrationService.java
      │  ▲
      │  │  JPA Queries & Seat Updates
      ▼  │
[Repository / Model] TestCourseRepository, TestSectionRepository, TestFacultyRepository
      │  ▲
      ▼  │
[Database] Neon PostgreSQL (test_courses, test_sections, test_faculties, advised_courses)
```

---

## 3. Files Involved

### Backend (Spring Boot 3.3.2 / Java 17)
- `model/TestCourse.java`: Entity for `test_courses` table.
- `model/TestSection.java`: Entity for `test_sections` table.
- `model/TestFaculty.java`: Entity for `test_faculties` table.
- `repository/TestCourseRepository.java`: JPA repository for querying test courses.
- `repository/TestSectionRepository.java`: JPA repository for querying test sections with course and faculty associations.
- `repository/TestFacultyRepository.java`: JPA repository for test faculty members.
- `service/TestCourseService.java`: Business logic and time conflict detection.
- `service/AdvisorService.java`: Course assignment service updated to support booking seats in `TestSection` and saving to `AdvisedCourse`.
- `service/RegistrationService.java`: Student self-registration service updated to expose `test_sections` alongside existing sections and allow registration/drop.
- `controller/TestCourseController.java`: REST controller exposing `/api/test-courses/sections`.

### Frontend (React + Vite)
- `services/testCourseService.js`: API client calling `/api/test-courses/sections`.
- `controllers/advisingController.js`: Updated `useAdvisorController` to load test sections, map to advising course structure, support filter toggle (`All` / `Test Courses` / `Standard Catalog`).
- `views/pages/AdvisingView.jsx`: View rendering test course badges and catalog filtering buttons in the Advisor panel.
- `views/pages/RegistrationView.jsx`: View rendering test section badge in student registration cards.

---

## 4. Sequential Flow

### A. Advisor Assigning a Test Course Section
1. **Advisor View**: Advisor clicks the "🧪 Test Courses & Sections" filter or searches for a test course (e.g., `CSE110`, `CSE220`).
2. **Advising Controller**: `useAdvisorController` provides mapped test sections with real-time seat availability. Advisor clicks "Assign".
3. **API Call**: Controller posts to `/api/advisors/assign` with `courseId` (e.g. `CSE110-01`), `courseCode`, `courseTitle`, `section`, `time`, `room`, `faculty`.
4. **Backend Service**: `AdvisorService.assignCourse` detects `TestSection`, verifies seat availability, increments `bookedSeats` in `test_sections`, and creates an `AdvisedCourse` record.
5. **Database**: Updates `test_sections` and inserts into `advised_courses`.
6. **Response**: Returns updated advisee profile with new course and recalculated credit meter and weekly routine schedule.

### B. Student Self-Registration of a Test Course Section
1. **Student View**: Student opens `/advising`, displays `<RegistrationSection />`.
2. **Registration Controller**: Calls `/api/registration/sections`, receiving combined catalog including test sections tagged with `isTestCourse: true`.
3. **API Call**: On click "+ Register", `RegistrationController` posts to `/api/registration/register`.
4. **Backend Service**: `RegistrationService.registerSection` books a seat in `TestSection` and creates an `AdvisedCourse` record.
5. **Database**: Updates `test_sections` and `advised_courses`.
6. **Live Update**: WebSocket broadcasts updated seats to connected clients.

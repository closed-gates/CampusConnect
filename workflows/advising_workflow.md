# Academic Advising Workflow

## Overview
The Academic Advising module provides a dual-role interface for students and advisors:
- **Advisor Mode (`role === 'advisor'`)**: Advisors select advisees, inspect their academic standing, CGPA, completed credits, credit/course caps, and assign/remove courses directly from the live BRACU course sections catalog.
- **Student Mode (`role === 'student'`)**: Students view course registration and their advising window.

---

## Sequential Communication Path

```
Advisor UI (AdvisingView.jsx)
    │
    ▼ (invokes hook)
Advisor Controller (advisingController.js: useAdvisorController)
    │
    ▼ (HTTP GET /api/courses/sections + GET /api/advisors/students)
API Gateway / Service Layer (courseService.js / Spring Boot REST Controllers)
    │
    ▼ (routes to backend service)
AdvisorService.java / CourseController.java
    │
    ▼ (validates rules: limits, prerequisites, schedule clashes, duplicate courses)
Spring Data Repositories (AdvisedCourseRepository, StudentProfileRepository, CourseSectionRepository)
    │
    ▼ (SQL Query / Mutation)
Neon PostgreSQL Database (`advised_courses`, `student_profiles`, `course_section`)
```

---

## Files Involved

### Frontend (MVC Architecture)
- **Model**:
  - `frontend/src/models/advisingModel.js` – Defines CGPA thresholds, course/credit limits, and role constants.
  - `frontend/src/models/routineModel.js` – Defines schedule constants and time slot patterns.
- **Controller**:
  - `frontend/src/controllers/advisingController.js` – Exports `useAdvisorController()` (fetches students, live seat updates, and course sections; handles search filtering, course assignment, and deletion) and `useStudentAdvisingController()`.
- **View**:
  - `frontend/src/views/pages/AdvisingView.jsx` – Renders the Advisor Panel (student selector, student profile card, credit meter, assigned courses list, course catalog search and assignment list) and Student Panel.
- **API Service**:
  - `frontend/src/services/courseService.js` – API client fetching sections, course catalog, and exam schedules via relative `/api/courses` routes.

### Backend (Spring Boot 3.3.2 MVC)
- **Model**:
  - `backend/.../model/Advisor.java` – Advisor JPA entity.
  - `backend/.../model/AdvisedCourse.java` – Advised course section entity with persisted student assignment records.
  - `backend/.../model/StudentProfile.java` – Student academic profile entity with CGPA and credit limits.
  - `backend/.../model/CourseSection.java` – BRACU course section entity.
- **Repository**:
  - `backend/.../repository/AdvisorRepository.java`
  - `backend/.../repository/AdvisedCourseRepository.java`
  - `backend/.../repository/StudentProfileRepository.java`
  - `backend/.../repository/CourseSectionRepository.java`
- **Service**:
  - `backend/.../service/AdvisorService.java` – Validates max course count, credit limits, duplicate assignments, and schedule clashes across BRACU schedule slots.
- **Controller**:
  - `backend/.../controller/AdvisorController.java` – Exposes endpoints for matching, profiles, assigning, and removing advised courses.
  - `backend/.../controller/CourseController.java` – Exposes `/api/courses/sections` and `/api/courses/catalog`.

---

## Key Features & Invariants
1. **Dynamic Real Catalog**: Fetches real BRACU course sections from the database rather than static mock arrays.
2. **Instant Search & Sort**: Filters courses in real time by code, title, section, and faculty, sorted alphabetically by course code and numerically by section number.
3. **Automated Conflict Prevention**: Validates schedule clashes and duplicate course code assignments.
4. **Credit Meter**: Visualizes advising credit cap based on the student's CGPA tier.

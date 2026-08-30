# Course Bypass & CGPA Tracking Feature Workflow

## Overview
This feature provides Admin accounts with the authority to bypass courses for students (granting direct course credits and letter grades/waivers without enrolling in a section) and maintains persistent real-time database tracking of total completed credits and cumulative CGPA.

---

## Sequential Communication Flow (MVC)

```
View (BypassCourseView.jsx)
   │
   ├── User selects student & course, specifies grade & bypass reason
   │
   ▼
Controller (bypassCourseController.js: handleBypassSubmit)
   │
   ├── Validates payload and dispatches async request
   │
   ▼
REST API (POST /api/admin/bypass-course)
   │
   ▼
Backend Controller (BypassCourseController.java: bypassCourse)
   │
   ▼
Backend Service (BypassCourseService.java: bypassCourse)
   │
   ├── 1. Persists StudentCompletedCourse entry in `student_completed_courses` table
   │      - Fields: studentId, courseCode, courseTitle, credits, grade, gradePoint,
   │                isBypassed = true, bypassedBy, bypassedAt, reason, semester
   │
   ├── 2. Calculates Cumulative CGPA:
   │      CGPA = Sum(credits_i * gradePoint_i) / Sum(credits_i with gradePoint)
   │      Total Completed Credits = Sum(credits_i)
   │      Academic Probation Status = CGPA < 2.0
   │
   ├── 3. Updates and saves StudentProfile in `student_profiles` table
   │      - Updates: cgpa, completedCredits, onProbation, completedCourses
   │
   ▼
Database (Neon PostgreSQL)
   ├── `student_completed_courses` (New completed/bypass log table)
   └── `student_profiles` (Updated CGPA, completed credits, and prerequisite strings)
```

---

## Reverting / Deleting a Bypass

```
View (BypassCourseView.jsx: "Revert" button)
   │
   ▼
Controller (bypassCourseController.js: handleDeleteBypass)
   │
   ▼
REST API (DELETE /api/admin/bypass-course/{studentId}/{recordId})
   │
   ▼
Backend Service (BypassCourseService.java: deleteBypassRecord)
   │
   ├── Deletes record from `student_completed_courses` table
   ├── Recalculates CGPA & completed credits from remaining completed courses
   └── Saves updated StudentProfile in `student_profiles`
```

---

## Files Involved

### Frontend (MVC)
- `frontend/src/models/bypassCourseModel.js` – Models, grade point maps, standing helpers.
- `frontend/src/controllers/bypassCourseController.js` – Custom React hook managing state and actions.
- `frontend/src/services/bypassCourseService.js` – REST API service client.
- `frontend/src/views/pages/BypassCourseView.jsx` – Interactive Admin bypass UI and completed courses table.
- `frontend/src/views/components/Sidebar.jsx` – Added "Bypass Course" nav item for ADMIN.
- `frontend/src/App.jsx` – Added `/bypass-course` protected route.

### Backend (Spring Boot 3.3.2)
- `backend/.../model/StudentCompletedCourse.java` – JPA Entity for completed/bypassed courses.
- `backend/.../repository/StudentCompletedCourseRepository.java` – Spring Data JPA repository.
- `backend/.../service/BypassCourseService.java` – Business logic for bypass grants & CGPA recalculation.
- `backend/.../controller/BypassCourseController.java` – REST API endpoints under `/api/admin/bypass-course`.

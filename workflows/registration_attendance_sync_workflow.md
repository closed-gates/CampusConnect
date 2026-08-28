# Registration → Attendance Sync Workflow

## Feature Overview

When a student **adds a course** in the Advising/Registration feature, that course is **automatically synced** to the Attendance feature. The student can then see per-course attendance tracked for their registered courses.

## Data Flow Diagram

```
Student (Advising UI)
        │
        │  POST /api/registration/register
        │  { studentId, sectionId }
        ▼
RegistrationController  ──▶  RegistrationService
                                      │
                                      │  Writes to: section_registrations table
                                      │  { studentId, sectionId (FK → course_section), term }
                                      ▼
                              section_registrations (DB)
                                      │
                    ┌─────────────────┴────────────────────┐
                    │                                       │
                    ▼                                       ▼
        Faculty Attendance View                  Student Attendance View
        (GET /api/attendance/enrolled-students)   (GET /api/attendance/student-courses)
                    │                                       │
                    ▼                                       ▼
        AttendanceService.getEnrolledStudents()   AttendanceService.getStudentCourses()
        ─ Merges: attendance_records (existing)   ─ Reads: section_registrations (registered)
                + section_registrations (new)     ─ Joins: attendance_records (per course stats)
                    │                                       │
                    ▼                                       ▼
        Faculty sees newly-registered student     Student sees registered courses +
        in attendance marking list immediately    attendance % for each course
```

## Sequential Communication Path

### Student registers for a course (Advising Feature)

1. **View** → `AdvisingView.jsx` / `RegistrationView` triggers `handleRegister(sectionId)`
2. **Controller** → `registrationController.js` (`useRegistrationController`) calls `apiClient.post('/api/registration/register', { studentId, sectionId })`
3. **Backend Controller** → `RegistrationController.registerSection()` receives request
4. **Backend Service** → `RegistrationService.register()`:
   - Validates prerequisites, credit limits, advising window
   - Atomically books seat via `tryBookSeat()` (prevents overbooking)
   - Saves `SectionRegistration` entity to `section_registrations` table
5. **Database** → `section_registrations` row written with `{ studentId, section (FK), term, registeredAt }`

### Student views their attendance (Attendance Feature)

1. **View** → `AttendanceView.jsx` detects student role → renders `<StudentAttendancePanel />`
2. **Panel** → `StudentAttendancePanel.jsx` calls `useStudentAttendanceController()`
3. **Controller** → `studentAttendanceController.js` calls:
   - `GET /api/attendance/student-courses?studentId=X&term=Fall2026`
4. **Backend Controller** → `AttendanceController.getStudentCourses()`
5. **Backend Service** → `AttendanceService.getStudentCourses()`:
   - Fetches `SectionRegistration` list for student (from `section_registrations`)
   - Fetches `AttendanceRecord` list for student (from `attendance_records`)
   - Groups attendance records by courseId
   - For each registered course: computes `totalSessions`, `presentCount`, `lateCount`, `absentCount`, `attendanceRate`
   - De-duplicates by course code (avoids showing same course twice for multiple sections)
6. **Response** → Returns array of `{ courseId, courseName, section, faculty, totalSessions, presentCount, lateCount, absentCount, attendanceRate }`
7. **View** → `StudentAttendancePanel` renders:
   - Overall attendance ring (weighted across all courses)
   - Per-course cards with progress bar and stat pills
   - Click-to-expand detail panel per course

### Faculty marks attendance (existing flow, now synced)

1. **Faculty View** → `AttendanceView.jsx` (faculty role) selects a course
2. **Controller** → `useAttendanceController()` calls `GET /api/attendance/enrolled-students?courseId=X`
3. **Backend Service** → `AttendanceService.getEnrolledStudents()`:
   - **Source 1:** Students with existing `attendance_records` for this course
   - **Source 2 (NEW):** Students registered via `section_registrations` (courseId = section.code)
   - Result is deduplicated and merged
4. **Faculty** sees all students (including newly registered ones) and can mark Present/Absent/Late
5. Faculty submits → `POST /api/attendance` per student → rows written to `attendance_records`
6. **Next time** student opens Attendance → their `attendanceRate` updates automatically

## Files Involved

### Backend

| File | Change |
|---|---|
| `service/AttendanceService.java` | `getEnrolledStudents()` now also reads `section_registrations`; new `getStudentCourses()` method |
| `controller/AttendanceController.java` | New `GET /api/attendance/student-courses` endpoint |
| `repository/SectionRegistrationRepository.java` | Used (existing) — no changes needed |

### Frontend

| File | Role | Description |
|---|---|---|
| `models/studentAttendanceModel.js` | **Model** | Constants, helpers, empty state for student attendance |
| `controllers/studentAttendanceController.js` | **Controller** | Custom hook — fetches registered courses + attendance stats |
| `views/components/StudentAttendancePanel.jsx` | **View** | Student UI: ring chart, course cards, detail panel |
| `views/pages/AttendanceView.jsx` | **View** | Updated to show StudentAttendancePanel for student role |
| `views/pages/AttendancePage.css` | **Styles** | New classes for student attendance panel |

## Key Design Decisions

1. **No separate sync step needed** — the backend's `getStudentCourses()` reads directly from `section_registrations` at query time. When a student registers, the data is in the DB; the next request to `/api/attendance/student-courses` includes it automatically.

2. **Zero-session courses shown** — registered courses with no attendance marked yet show `0 sessions, 0%`. This is correct and expected — it tells the student "you're enrolled but no class has been held yet."

3. **De-duplication by course code** — if a student registers for multiple sections of the same course (unusual but possible), only one entry appears in the attendance view.

4. **Faculty enrolled-students merge** — faculty now sees ALL registered students (not just ones with existing records), enabling them to mark attendance from day one.

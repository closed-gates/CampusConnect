# Attendance Live Data Workflow

## Feature Summary

This workflow documents the transition of the **Faculty Attendance Tracking** feature from static
hardcoded data to a fully live, database-backed implementation. It also covers the **Student
Dashboard** enhancement that now shows the **lowest** per-course attendance rate instead of the
overall average.

---

## User Stories

1. **As a faculty member**, I want the attendance page to show my actual assigned courses and their
   real enrolled students (pulled from the database), not hardcoded demo data.

2. **As a student**, I want the dashboard attendance card to immediately show my lowest-performing
   course attendance rate so I know where I need improvement — and clicking it shows me the full
   breakdown across all courses.

---

## Communication Flow

### Flow A — Faculty Attendance Page Load

```
1. [View] AttendanceView renders, calls useAttendanceController()
2. [Controller] useEffect (mount): fetch GET /api/attendance/faculty-courses?markedBy=Dr. Mahbubur Rahman
3. [Backend Controller] AttendanceController.getFacultyCourses() receives request
4. [Backend Service] AttendanceService.getFacultyCourses(markedBy)
5. [Repository] AttendanceRecordRepository.findByMarkedBy(markedBy)
6. [DB] Neon PostgreSQL → returns all attendance_records where marked_by = 'Dr. Mahbubur Rahman'
7. [Service] Deduplicate by courseId → build list of { courseId, courseName, studentCount }
8. [Controller] Responds with { success, count, data: [...] }
9. [Controller] setCourses(enriched) — adds getCourseColor() from model
10. [Controller] setSelectedCourse(courses[0].id) — auto-selects first course
11. [View] Renders course selector cards from live data
```

### Flow B — Student Roster Load (on course selection)

```
1. [View] Faculty clicks a course card → selectCourse(courseId)
2. [Controller] useEffect (selectedCourse change): fetch GET /api/attendance/enrolled-students?courseId=CSE470
3. [Backend Controller] AttendanceController.getEnrolledStudents()
4. [Backend Service] AttendanceService.getEnrolledStudents(courseId)
5. [Repository] AttendanceRecordRepository.findByCourseIdOrderByDateDesc(courseId)
6. [DB] Returns all records for CSE470
7. [Service] Deduplicate by studentId → list of { studentId, studentName }
8. [Controller] Responds with student list
9. [Controller] setCourseStudents() — normalized to { id, name } for the view
10. [View] Renders attendance marking table with real student names
```

### Flow C — Mark and Submit Attendance

```
1. [View] Faculty marks each student PRESENT/ABSENT/LATE and clicks Save
2. [Controller] submitAttendance(): POST /api/attendance (once per student)
3. [Backend Controller] AttendanceController.markAttendance()
4. [Backend Service] AttendanceService.markAttendance() — upsert logic (create or update)
5. [Repository] findByCourseIdAndStudentIdAndDate → update if exists, else insert
6. [DB] Neon PostgreSQL → attendance_records table updated
7. [Controller] Re-fetches date records, history, summary
8. [View] UI refreshes with persisted data
```

### Flow D — Student Dashboard Lowest Attendance

```
1. [View] DashboardView renders, calls useDashboardController()
2. [Controller] dashboardService.getStudentAttendanceSummary('STU001')
3. API: GET /api/attendance/student/STU001
4. [Backend Controller] AttendanceController.getStudentAttendance()
5. [Backend Service] AttendanceService.getStudentAttendanceReport(studentId)
   → fallback: uses '21201001' if STU001 has no records
6. [DB] Returns all attendance_records for the student
7. [Service] Groups by courseId → computes per-course { attendanceRate, presentCount, ... }
8. Returns { attendanceRate (overall), courseBreakdown: [...], history: [...] }
9. [Controller] useMemo: finds course with minimum attendanceRate in courseBreakdown
10. [View] Stat card shows lowestRate% with label "Lowest Attendance · {courseId}"
11. [View] Clicking "View report" opens StudentAttendanceModal with full breakdown
```

---

## Seed Data

`AttendanceService.seedData()` inserts records on first startup (if table is empty):
- **CSE470** (Software Engineering): 5 students × 3 dates
- **CSE341** (Microprocessors): 4 students × 2 dates
- **CSE221** (Data Structures): 6 students × 1 date

All marked by `"Dr. Mahbubur Rahman"` — the faculty courses endpoint queries by this value.

---

## Files Involved

| Layer | File | Change |
|---|---|---|
| Backend Repository | `AttendanceRecordRepository.java` | Added `findByMarkedBy()` |
| Backend Service | `AttendanceService.java` | Added `getFacultyCourses()`, `getEnrolledStudents()` |
| Backend Controller | `AttendanceController.java` | Added `GET /faculty-courses`, `GET /enrolled-students` |
| Frontend Model | `attendanceModel.js` | Removed static arrays; kept pure helpers + `COURSE_COLORS` |
| Frontend Controller | `attendanceController.js` | Fetch courses+students from API; removed static imports |
| Frontend View | `AttendanceView.jsx` | Added `loadingCourses`/`loadingStudents` states |
| Frontend Controller | `dashboardController.js` | Computes `lowestRate` from `courseBreakdown` |
| Frontend View | `StudentAttendanceModal.jsx` | No change — already reads API data correctly |

# Dashboard Live Database & Routine / Attendance Workflow

## Feature: Dashboard Stat Cards & Interactive Routine/Attendance Modals
**Module Owner:** Ibsan Hossain Ansari (Collaborator 5 – Dashboard, Billing & Pre-Registration)

---

## Overview

Connects all three Dashboard Stat Cards to real data stored in the Neon PostgreSQL database:
1. **Enrolled Courses**: Fetches registered/advised course sections for the current student (`/api/registration/my` and `/api/advisors/student/{id}`). Clicking **"View details →"** opens an interactive **Enrolled Courses Modal** showing full course attributes (title, code, section, faculty, credits, time, room, exam schedule).
2. **Classes This Week (Routine)**: Parses the scheduled days and time slots from the student's registered course sections to calculate weekly class sessions. Clicking **"View schedule →"** opens a **Weekly Class Routine Timetable Modal** with day-by-day lecture slots and course chips.
3. **Attendance Metrics**: Fetches student attendance analytics and session history from `attendance_records` table (`/api/attendance/student/{id}`). Clicking **"View report →"** opens a **Personal Attendance Report Modal** with overall attendance percentage, course-by-course progress bars, and chronological session logs with Present/Late/Absent status badges.

---

## Sequential MVC Communication Path

### 1. Enrolled Courses & Routine Data
```
DashboardView (View)
  → useDashboardController (Controller)
    → dashboardService.getStudentRegisteredCourses(studentId) (Service)
      → GET /api/registration/my?studentId=STU001 (HTTP)
        → RegistrationController.getMyRegistrations() (Backend Controller)
          → RegistrationService.getStudentRegistrations() (Service)
            → SectionRegistrationRepository (Repository)
              → section_registrations & course_section (Neon PostgreSQL Tables)
```

### 2. Student Attendance Report & Session History
```
DashboardView (View)
  → useDashboardController (Controller)
    → dashboardService.getStudentAttendanceSummary(studentId) (Service)
      → GET /api/attendance/student/STU001 (HTTP)
        → AttendanceController.getStudentAttendance() (Backend Controller)
          → AttendanceService.getStudentAttendanceReport() (Service)
            → AttendanceRecordRepository.findByStudentIdOrderByDateDesc() (Repository)
              → attendance_records (Neon PostgreSQL Table)
```

---

## Files Involved

### Backend
| File | Role |
|------|------|
| `repository/AttendanceRecordRepository.java` | Added `findByStudentIdOrderByDateDesc` query method |
| `service/AttendanceService.java` | Added `getStudentAttendanceReport(studentId)` method |
| `controller/AttendanceController.java` | Added `GET /api/attendance/student/{studentId}` endpoint |

### Frontend
| File | Role |
|------|------|
| `services/dashboardService.js` | API service wrapper for registered courses and attendance |
| `models/dashboardModel.js` | Helper functions for weekly class count & timetable grid building |
| `controllers/dashboardController.js` | Reactive controller hook managing live metrics & modal states |
| `views/components/EnrolledCoursesModal.jsx` | Modal view component for enrolled course details |
| `views/components/StudentRoutineModal.jsx` | Modal view component for weekly schedule timetable matrix |
| `views/components/StudentAttendanceModal.jsx` | Modal view component for attendance rate, course cards & log |
| `views/pages/DashboardView.jsx` | Main dashboard view rendering stat cards and mounting modals |
| `index.css` | Styles for modals, timetable matrix, and attendance banners/cards |

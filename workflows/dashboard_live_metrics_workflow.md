# Dashboard Live Metrics & Schedule Fix Workflow

## Feature: Dashboard – Authenticated User Data & Live DB Metrics
**Module Owner:** Ibsan Hossain Ansari (Collaborator 5 – Dashboard, Billing & Pre-Registration)

---

## Overview

This document covers two fixes applied to the Student Dashboard:

### 1. Broken Schedule Parser Fix
The `ACT202-03` course section had a complex BRACU schedule string containing semicolons *inside* parentheses (room descriptions like `MON 3:30PM: 09G-31T; WED 3:30PM: 07A-07C`). The old parser split on every `;`, creating 4 broken fragments. None matched the expected day regex, so they fell through to a legacy branch that produced a massive corrupted slot string, causing a broken layout.

**Fix**: Replaced semicolon-splitting with a greedy regex `/([A-Za-z]+)\s*\(([\s\S]*?)\)/g` that captures full `DAY(...)` blocks regardless of inner semicolons.

### 2. Live Database Metric Wiring
All dashboard stat cards now pull 100% live data for the **currently authenticated** student rather than hardcoded `'STU001'`.

---

## Student ID Resolution Chain

All dashboard controllers now use:
```
getStoredUser()?.userId  →  localStorage.getItem('studentId')  →  'STU001' (demo fallback)
```

`cc_userId` (stored by `storeAuth()` in `authModel.js`) is always preferred. The legacy `studentId` key and `STU001` are only used for unauthenticated / demo sessions.

---

## Sequential MVC Communication Path

### A. Enrolled Courses & Routine

```
DashboardView (View)
  ↓ useDashboardController() — reads cc_userId via getStoredUser()
    ↓ dashboardService.getStudentRegisteredCourses(studentId)
      ↓ GET /api/registration/my?studentId={id}   [primary]
        ↓ RegistrationController.getMyRegistrations()
          ↓ RegistrationService.getStudentRegistrations()
            ↓ SectionRegistrationRepository + AdvisedCourseRepository
              ↓ section_registrations & course_section (Neon PostgreSQL)
      OR
      ↓ GET /api/advisors/student/{id}             [fallback]
        ↓ AdvisorController.getStudentProfile()
          ↓ AdvisorService.getStudentProfile()
            ↓ StudentProfileRepository + AdvisedCourseRepository
              ↓ student_profiles & advised_courses (Neon PostgreSQL)
```

### B. Attendance Metrics

```
DashboardView (View)
  ↓ useDashboardController()
    ↓ dashboardService.getStudentAttendanceSummary(studentId)
      ↓ GET /api/attendance/student/{id}
        ↓ AttendanceController.getStudentAttendance()
          ↓ AttendanceService.getStudentAttendanceReport()
            ↓ AttendanceRecordRepository.findByStudentIdOrderByDateDesc()
              ↓ attendance_records (Neon PostgreSQL)
```

### C. Exam Schedule Widget

```
ExamScheduleWidget (View)
  ↓ useExamScheduleController() — reads cc_userId via getStoredUser()
    ↓ GET /api/exams/student/{studentId}
      ↓ ExamScheduleController / ExamScheduleService
        ↓ ExamRepository
          ↓ exams (Neon PostgreSQL)
```

### D. User Greeting

```
DashboardView (View)
  ↓ useDashboardController()
    ↓ getStoredUser()?.fullName   (cc_fullName in localStorage, set at login)
      ↓ Displayed as: "Welcome back, {fullName}!"
```

---

## Files Modified

### Frontend

| File | Change |
|------|--------|
| `controllers/dashboardController.js` | Removed hardcoded `studentId = 'STU001'` param; now resolves from `getStoredUser()`. Exposes `fullName` for the greeting. |
| `views/pages/DashboardView.jsx` | Destructures `fullName` from controller; renders `"Welcome back, {fullName}!"` dynamically. |
| `controllers/examScheduleController.js` | Now reads `getStoredUser()?.userId` first (cc_userId) before falling back to legacy key. |
| `models/dashboardModel.js` | Replaced semicolon-splitting with `/([A-Za-z]+)\s*\(([\s\S]*?)\)/g` regex for schedule parsing. Added `sortTimeSlots()`. |
| `views/components/StudentRoutineModal.jsx` | Imports and applies `sortTimeSlots`. Modal size upgraded to `modal-xl`. |
| `models/viewRoutineModel.js` | Updated `buildRoutineMatrix` Format A parser with same day-block regex and per-day room extraction. |
| `index.css` | Added `.modal-xl` rule and `min-width: 135px` on `.routine-slot-cell`. |

### Backend (No changes in this pass)
All required backend endpoints were already implemented:
- `GET /api/registration/my?studentId={id}` — `RegistrationController`
- `GET /api/advisors/student/{id}` — `AdvisorController`
- `GET /api/attendance/student/{id}` — `AttendanceController`
- `GET /api/exams/student/{id}` — `ExamScheduleController`

---

## Key Invariant: Feature Isolation
No code belonging to other features (Advising, Attendance, Registration, GPA, Payments) was modified. The dashboard reads their shared API endpoints but maintains its own dedicated service (`dashboardService.js`) and controller (`dashboardController.js`).

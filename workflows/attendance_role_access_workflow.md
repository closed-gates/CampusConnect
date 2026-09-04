# Attendance Role-Based Access Workflow

## User stories

- Students see attendance only for courses advised/registered in their selected semester.
- Faculty mark attendance only for sections assigned to them.
- Administrators browse every section and inspect rosters, history, and summaries without marking attendance.
- Only students see the dashboard attendance metric; it shows the lowest measured course and turns red below 70%.

## Communication flow

1. `AttendanceView` reads role state from `useAttendanceController`. Students render `StudentAttendancePanel`; faculty/admin render the section browser, while marking controls are returned only for faculty.
2. Student requests include the preferred semester and authenticated student ID. `AttendanceController` delegates identity checks to `AttendanceAccessService`, then `AttendanceService` merges `section_registrations` and semester-matched `advised_courses` with persisted `attendance_records`.
3. Faculty requests `GET /api/attendance/faculty-courses`. `AttendanceAccessService` resolves assigned test sections and previously assigned attendance courses from the authenticated faculty account. Every roster/history/summary request rechecks that assignment. POST marking additionally rejects administrators.
4. Admin requests the same section-list endpoint. The service returns all `course_section` rows. Selecting a card loads its roster and read-only history/summary details.
5. Dashboard controller requests semester-scoped `student-courses` only for students. It finds the lowest course with recorded sessions. The attendance stat is excluded for faculty/admin and receives red styling when the lowest rate is under 70%.

## Files

- Backend access service: `backend/src/main/java/com/campusconnect/backend/service/AttendanceAccessService.java`
- Backend attendance service: `backend/src/main/java/com/campusconnect/backend/service/AttendanceService.java`
- Backend controller: `backend/src/main/java/com/campusconnect/backend/controller/AttendanceController.java`
- Frontend attendance controllers: `frontend/src/controllers/attendanceController.js`, `frontend/src/controllers/studentAttendanceController.js`
- Frontend attendance model/view: `frontend/src/models/studentAttendanceModel.js`, `frontend/src/views/pages/AttendanceView.jsx`, `frontend/src/views/components/StudentAttendancePanel.jsx`
- Dashboard integration: `frontend/src/controllers/dashboardController.js`, `frontend/src/services/dashboardService.js`, `frontend/src/views/pages/DashboardView.jsx`

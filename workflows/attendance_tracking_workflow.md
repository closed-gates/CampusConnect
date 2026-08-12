# Faculty Attendance Tracking Workflow

This document describes the workflow for the Faculty Attendance Tracking feature in CampusConnect.

## 1. User Story / Requirement
- **Faculty Users:** Can select from a list of assigned courses, pick a date, load the class student roster, and mark each student as Present, Absent, or Late (or quick-mark all at once).
- **History View:** Faculty can view past attendance sheets, sorted and grouped by date.
- **Summary View:** Faculty can view attendance rates, total counts (Present/Absent/Late), and individual student attendance metrics (e.g. rate, count) represented with progress bars.

---

## 2. Sequential Data & Logic Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as Faculty
    participant View as View (AttendanceView)
    participant Ctrl as Controller (attendanceController)
    participant Model as Model (attendanceModel)
    participant API as Backend (AttendanceController / AttendanceService)

    %% Course Selection & Tab Loading
    Note over User, View: --- Select Course & Load Roster ---
    User->>View: Select Course card (e.g., CSE470)
    View->>Ctrl: Call selectCourse(courseId)
    Ctrl->>Ctrl: Update selectedCourse state, set activeTab = 'mark'
    Ctrl->>View: Render student roster and load stats

    %% Mark Attendance Flow
    Note over User, View: --- Mark Attendance Flow ---
    User->>View: Select Date (default today)
    View->>Ctrl: Call setSelectedDate(date)
    Ctrl->>Ctrl: Check if records exist for date. Prepopulate state.
    User->>View: Mark student status (P / A / L)
    View->>Ctrl: Call markStudent(studentId, status)
    Ctrl->>Ctrl: Update currentMarks state
    User->>View: Click "Save Attendance"
    View->>Ctrl: Call submitAttendance()
    Ctrl->>Ctrl: Validate all students marked
    Ctrl->>API: POST /api/attendance (records payload)
    API->>Ctrl: Return attendance response (success)
    Ctrl->>Ctrl: Update allRecords list, trigger toast, set hasSubmitted = true
    Ctrl->>View: Show success state and checkmarks

    %% Viewing Summary / History Flow
    Note over User, View: --- Viewing History & Summary Tabs ---
    User->>View: Click "History" or "Summary" Tab
    View->>Ctrl: Call setActiveTab(tab)
    Ctrl->>Ctrl: Compute derived data via useMemo (courseSummary / historyByDate)
    Ctrl->>View: Render summary charts / date-grouped history logs
```

### Detailed Steps:
1. **Model Initialization:**
   - The list of classes taught by the faculty member is loaded from `FACULTY_COURSES` in `attendanceModel.js`.
   - The student roster mapping is retrieved from `COURSE_STUDENTS` by course ID.
2. **State Management:**
   - The custom hook `useAttendanceController()` initializes the default state (first course selected, date defaults to today via `getToday()`).
   - An effect runs whenever the `selectedCourse` or `selectedDate` changes, checking if database records already exist in `allRecords` for that specific date to pre-populate `currentMarks` and setting `hasSubmitted` flag.
3. **Marking Attendance:**
   - The user selects status buttons for each row in the student table, which triggers `markStudent()` in the controller, updating `currentMarks[studentId]`.
   - The user can click "Mark All Present/Absent" which triggers `markAll(status)` in the controller to batch-update the status keys.
4. **Saving:**
   - On click of "Save Attendance", `submitAttendance` runs validation. If all students are marked, it executes an HTTP POST to `/api/attendance` sending the array of statuses.
   - The backend `AttendanceController.java` receives the payload, hands it to `AttendanceService.java` to persist, and returns success.
   - The frontend controller updates local cache state, marks `hasSubmitted = true` and shows a confirmation toast.
5. **History & Summary Calculation:**
   - When switching tabs, `useMemo` hooks run pure functions in `attendanceModel.js` (e.g., `calculateSummary(courseRecords)`, `groupByDate(courseRecords)`) on the current array of records to compute rates and structures dynamically.

---

## 3. Files Involved

### Frontend (React MVC)
- **Model:** [attendanceModel.js](file:///e:/CampusConnect/CampusConnect/frontend/src/models/attendanceModel.js) — Defines course configurations, student lists, mock history, and statistical calculators (`calculateSummary`, `groupByDate`).
- **Controller:** [attendanceController.js](file:///e:/CampusConnect/CampusConnect/frontend/src/controllers/attendanceController.js) — Exports `useAttendanceController()` managing date pickers, rosters, marking operations, and derived stats.
- **Views:**
  - [AttendanceView.jsx](file:///e:/CampusConnect/CampusConnect/frontend/src/views/pages/AttendanceView.jsx) — Displays course selection cards, tabs, mark sheets, history list, and summaries.
  - [AttendancePage.css](file:///e:/CampusConnect/CampusConnect/frontend/src/views/pages/AttendancePage.css) — Custom styles for attendance grid, rate bars, calendar inputs, and status states.

### Backend (Spring Boot MVC)
- **Model / Entity:**
  - `backend/.../model/AttendanceRecord.java` — Class representing an attendance entry for a student, course, date, and status.
- **Service:** `backend/.../service/AttendanceService.java` — Manages database records / storage logic.
- **Controller:** [AttendanceController.java](file:///e:/CampusConnect/CampusConnect/backend/src/main/java/com/campusconnect/backend/controller/AttendanceController.java) — Exposes REST endpoints to query and write records.

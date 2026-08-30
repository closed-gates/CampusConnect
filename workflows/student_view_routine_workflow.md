# Student View Routine Feature Workflow

## 1. Feature Overview
The **View Routine** feature provides a dedicated, printable official university schedule document for students. It displays their currently advised and registered courses formatted in the exact tabular structure used by BRAC University:
1. **Class Schedule**: An 8-column matrix (`TIME/DAY`, `SUNDAY`, `MONDAY`, `TUESDAY`, `WEDNESDAY`, `THURSDAY`, `FRIDAY`, `SATURDAY`) where each cell indicates `Course code-Section` and `Faculty-Room`.
2. **Exam Schedule**: A 4-column table detailing Midterm (`MID`) and Final (`FINAL`) exam dates, times, and course codes.
3. **Official Document Styling & PDF Printing**: Features official university header layout with one-click print/save-as-PDF capabilities.
4. **Access Control**: Visible only to the Student profile on the sidebar immediately below the Advising icon.

---

## 2. Architecture: Strict MVC Implementation

```mermaid
sequenceDiagram
    autonumber
    actor Student
    participant Sidebar as Sidebar.jsx
    participant View as ViewRoutineView.jsx
    participant Controller as viewRoutineController.js
    participant Model as viewRoutineModel.js
    participant API as Advisor & Registration REST Endpoints
    participant DB as Neon PostgreSQL (advised_courses & section_registrations)

    Student->>Sidebar: Clicks "View Routine" (below Advising)
    Sidebar->>View: Renders /view-routine
    View->>Controller: useViewRoutineController()
    Controller->>API: GET /api/registration/my & GET /api/advisors/student/{id}
    API->>DB: Query assigned & registered sections
    DB-->>API: Active course section records
    API-->>Controller: Return student profile & advised courses list
    Controller->>Model: buildRoutineMatrix(courses) & generateExamSchedule(courses)
    Model-->>Controller: 2D Day/Time Matrix & Exam Schedules
    Controller-->>View: Returns { studentProfile, matrix, examSchedule, timeSlots, days, handlePrint }
    View-->>Student: Renders official BRACU class & exam schedule document
    Student->>View: Clicks "Print / Save as PDF"
    View-->>Student: Opens native window print preview
```

---

## 3. Files Involved

| Layer | File Path | Purpose |
| :--- | :--- | :--- |
| **Model** | `frontend/src/models/viewRoutineModel.js` | Pure JS definitions of days, standard time slots, routine matrix builder, schedule normalization, and exam schedule generator. |
| **Controller** | `frontend/src/controllers/viewRoutineController.js` | Custom React hook handling authentication context, REST data loading, matrix computation, and print handlers. |
| **View** | `frontend/src/views/pages/ViewRoutineView.jsx` | Functional React component strictly rendering the official document template and printable tables. |
| **Navigation** | `frontend/src/views/components/Sidebar.jsx` | Dynamically inserts "View Routine" right below "Advising" exclusively for student users. |
| **Router** | `frontend/src/App.jsx` | Registers the `/view-routine` protected route. |

---

## 4. Verification & Testing
- **Frontend Build**: Verified with Vite production build (`npm run build`).
- **Student Profile**: Confirmed `View Routine` icon appears directly below `Advising` for students and is hidden for Admin/Faculty.
- **Data Rendering**: Confirmed live course registrations correctly map to Day/Time cells and display Mid/Final exam schedules.

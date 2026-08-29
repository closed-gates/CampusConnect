# Workflow Documentation: Advisor Role Assignment & Admin Registration Controls

## Overview
This document specifies the end-to-end communication flow, database layer persistence, and user experience for:
1. **Admin Faculty Advisor Assignment**
2. **Restricted Faculty Advising & Student Routine Visualization**
3. **Confirmed Advising Persistence**
4. **Admin Course Section Creation & Seat-Limit Bypass Enrolment**

---

## Sequential Communication Paths

### 1. Assigning Advisor Role to Faculty (Admin)
```
View (AssignAdvisorView.jsx)
   │
   ▼
Controller (adminAdvisorController.js: handleToggleAdvisor)
   │
   ▼
Service (adminAdvisingService.js: toggleAdvisor)
   │
   ▼
REST API (POST /api/admin/advisors/toggle/{userId})
   │
   ▼
Backend Controller (AdminAdvisingController.java: toggleAdvisor)
   │
   ▼
Backend Service (AdminAdvisingService.java: toggleAdvisor)
   │
   ▼
Database (app_users: is_advisor = true/false, test_faculties: is_advisor = true/false)
```

---

### 2. Faculty Access & Advising Panel
```
View (AdvisingView.jsx: role === 'FACULTY')
   │
   ▼
Controller (advisingController.js / adminAdvisingService.js: getAdvisorStatus)
   │
   ├── isAdvisor === false ➔ Render <UnauthorizedAdvisorPanel />
   │
   └── isAdvisor === true  ➔ Render <AdvisorPanel />
                                │
                                ├── Select Advisee (loadStudent)
                                ├── View Advisee Weekly Routine (studentRoutine matrix)
                                ├── Assign/Drop Courses (handleAssign / handleRemove)
                                └── Confirm Advising Session (handleConfirmAdvising)
```

---

### 3. Confirming & Removing Advising Session
```
View (AdvisingView.jsx ➔ AdvisorPanel: "Remove Course" or "Confirm Advising")
   │
   ├── Remove: Optimistic UI state update ➔ DELETE /api/advisors/assign/{studentId}/{courseId}
   │           ├── Deletes from advised_courses DB & removes from entity collection
   │           ├── Releases corresponding section_registrations entry & decrements booked seats
   │           └── Returns updated student profile with refreshed courses list
   │
   └── Confirm: POST /api/advisors/confirm/{studentId}
               └── Sets advising_confirmed = true and advising_confirmed_at timestamp in student_profiles DB
```

---

### 4. Admin Section Creation & Capacity Bypass
```
View (AdvisingView.jsx ➔ AdminAdvisingPanel)
   │
   ├── Tab: "Create Course Section"
   │      └── POST /api/admin/sections/create
   │             ├── Persists CourseSection in course_section DB
   │             ├── Synchronizes CourseCatalog totalSections & totalSeats
   │             └── Optionally synchronizes TestSection for isolated test courses
   │
   └── Tab: "Force Enrolment (Bypass Seat Limit)"
          └── POST /api/admin/registration/force-register
                 ├── Increments course_section.booked beyond totalSeats
                 ├── Creates SectionRegistration in section_registrations DB
                 ├── Creates AdvisedCourse entry in advised_courses DB (assignedBy = "Admin (Force Enrolled)")
                 ├── Computes seatsRemaining = totalSeats - booked (-1, -2, ...)
                 ├── Provisions student into course channel via channelService.onEnrollment
                 ├── Broadcasts /topic/seats/{sectionId} via WebSocket
                 └── Refreshes advisee profile and routine in UI with 0 page reloads
```

---

### 5. Dynamic Advisee Querying & Course Channels
```
Advisor/Admin View (AdvisingView.jsx ➔ Select Advisee Dropdown)
   │
   ▼
GET /api/advisors/students
   │
   ▼
AdvisorService.java: getAllStudentsAsResponse()
   ├── Queries studentRepo.findAllByPriority() (Neon PostgreSQL student_profiles)
   ├── Discovers registered AppUsers with role = STUDENT
   └── Returns all real database students ordered by priority credits

Student Messaging View (MessagingView.jsx ➔ Course Channels)
   │
   ▼
messagingController.js
   ├── Fetches /api/registration/my and /api/advisors/student/{studentId}
   ├── Calls channelService.onEnrollment({ userId: studentId, course })
   └── Dynamically renders course discussion channels for all enrolled courses
```

---

## Files Involved

### Frontend
- `frontend/src/views/pages/AssignAdvisorView.jsx` (New Admin view)
- `frontend/src/views/pages/AdvisingView.jsx` (Updated with 4 role-based branches)
- `frontend/src/views/components/Sidebar.jsx` (Updated with dynamic Admin "Assign Advisor" item)
- `frontend/src/components/Sidebar.jsx` (Legacy component parity)
- `frontend/src/controllers/adminAdvisorController.js` (New controller for advisor toggling)
- `frontend/src/controllers/adminAdvisingController.js` (New controller for section creation & bypass)
- `frontend/src/controllers/advisingController.js` (Updated with routine parsing and auth checks)
- `frontend/src/services/adminAdvisingService.js` (New REST client)
- `frontend/src/models/authModel.js` (Updated with `isAdvisor` helpers)
- `frontend/src/App.jsx` (Added `/assign-advisor` protected route)
- `frontend/src/index.css` (Added styling for tables, toggles, badges, and banners)

### Backend
- `backend/src/main/java/com/campusconnect/backend/controller/AdminAdvisingController.java` (New REST API)
- `backend/src/main/java/com/campusconnect/backend/service/AdminAdvisingService.java` (New Admin business logic)
- `backend/src/main/java/com/campusconnect/backend/controller/AdvisorController.java` (Added advisor status endpoint)
- `backend/src/main/java/com/campusconnect/backend/service/AdvisorService.java` (Added advisor status check)
- `backend/src/main/java/com/campusconnect/backend/model/AppUser.java` (Added `isAdvisor` field)
- `backend/src/main/java/com/campusconnect/backend/model/TestFaculty.java` (Added `isAdvisor` field)
- `backend/src/main/java/com/campusconnect/backend/model/StudentProfile.java` (Mapped `advisingConfirmed` to Boolean wrapper)
- `backend/src/main/java/com/campusconnect/backend/dto/AuthResponse.java` (Added `isAdvisor` payload)
- `backend/src/main/java/com/campusconnect/backend/service/AuthService.java` (Populated `isAdvisor` in login/register)
- `backend/src/main/resources/data.sql` (Added schema alterations for `is_advisor` and `advising_confirmed`)

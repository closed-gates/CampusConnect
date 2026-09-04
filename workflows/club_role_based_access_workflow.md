# Club Role-Based Access Workflow

## User story

Administrators assign students as panel members of specific clubs. Students and administrators can view club notices and recruitment forms; faculty cannot access Club Activities. A panel member can create, edit, or delete content and view applications only for assigned clubs. Administrators can perform every management operation and exclusively control pinning.

## Communication flow

1. `ClubActivitiesView` is hidden from faculty in the sidebar and guarded by `NonFacultyRoute`.
2. `useClubController` loads `/api/clubs/access`, notices, and recruitment records through the authenticated API client.
3. The controller loads active club options from the database-backed `clubs` table. An administrator selects a club and submits a student ID. `ClubController` verifies `ROLE_ADMIN`, then `ClubService` validates both the student and club before saving `ClubPanelAssignment`.
4. For notice/recruitment mutations and application-list requests, `ClubController` accepts administrators or checks the authenticated student against `ClubPanelAssignmentRepository` for the requested club.
5. `ClubService` validates and persists allowed changes through the notice, recruitment, application, and assignment repositories.
6. Pin/unpin endpoints require `ROLE_ADMIN` regardless of club assignment.
7. Faculty and out-of-scope panel members receive HTTP 403 before any database mutation.

## Files

- `backend/src/main/java/com/campusconnect/backend/model/ClubPanelAssignment.java`
- `backend/src/main/java/com/campusconnect/backend/model/Club.java`
- `backend/src/main/java/com/campusconnect/backend/model/Recruitment.java`
- `backend/src/main/java/com/campusconnect/backend/repository/ClubPanelAssignmentRepository.java`
- `backend/src/main/java/com/campusconnect/backend/repository/ClubRepository.java`
- `backend/src/main/java/com/campusconnect/backend/repository/ApplicationRepository.java`
- `backend/src/main/java/com/campusconnect/backend/service/ClubService.java`
- `backend/src/main/java/com/campusconnect/backend/controller/ClubController.java`
- `frontend/src/controllers/clubController.js`
- `frontend/src/views/pages/ClubActivitiesView.jsx`
- `frontend/src/views/pages/ClubActivitiesPage.css`
- `frontend/src/views/components/Sidebar.jsx`
- `frontend/src/App.jsx`

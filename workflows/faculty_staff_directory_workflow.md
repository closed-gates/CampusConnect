# Faculty/Staff Directory Workflow

## User Story
A signed-in CampusConnect user can browse a database-backed BRACU CSE faculty and staff directory, search people, filter by directory category or thesis supervision status, open verified contact/profile links, and inspect thesis eligibility details.

## Communication Flow

1. `FacultyDirectoryView` mounts and calls `useFacultyDirectoryController()`.
2. The controller calls `facultyDirectoryService.js`, which sends an authenticated `GET /api/faculty-directory` request.
3. `FacultyDirectoryController` delegates the request to `FacultyDirectoryService`.
4. The backend service reads current records through `FacultyDirectoryRepository` from the configured H2 or PostgreSQL database.
5. On the first backend startup with an empty directory table, the service imports the verified 287-record `faculty-directory.tsv` dataset into the database.
6. The API returns DTOs to the frontend controller. The frontend model adds presentation-only initials/colors and provides category grouping helpers.
7. Search, category, and thesis-status changes filter the fetched database records without introducing view-owned state or business logic.
8. Selecting “View thesis details” expands the stored acceptance status and eligible level. “Not listed” means no matching entry was published on the thesis-supervisor page.

## Files

- Model: `frontend/src/models/facultyDirectoryModel.js`
- Controller: `frontend/src/controllers/facultyDirectoryController.js`
- API service: `frontend/src/services/facultyDirectoryService.js`
- View: `frontend/src/views/pages/FacultyDirectoryView.jsx`
- Styles: `frontend/src/views/pages/FacultyDirectoryView.css`
- Backend entity: `backend/src/main/java/com/campusconnect/backend/model/FacultyDirectoryEntry.java`
- Backend DTO: `backend/src/main/java/com/campusconnect/backend/dto/FacultyDirectoryEntryDTO.java`
- Backend repository: `backend/src/main/java/com/campusconnect/backend/repository/FacultyDirectoryRepository.java`
- Backend service: `backend/src/main/java/com/campusconnect/backend/service/FacultyDirectoryService.java`
- Backend controller: `backend/src/main/java/com/campusconnect/backend/controller/FacultyDirectoryController.java`
- Database seed source: `backend/src/main/resources/faculty-directory.tsv`
- Minimal route wiring: `frontend/src/App.jsx`
- Minimal navigation wiring: `frontend/src/views/components/Sidebar.jsx`

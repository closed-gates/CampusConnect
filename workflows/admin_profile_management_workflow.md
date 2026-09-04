# Admin Profile Management Workflow

## User story

An authenticated administrator can search for another CampusConnect user by exact user ID, update that user's account and academic details, and upload the user's profile picture. Profile mutation controls and APIs are unavailable to students and faculty.

## Communication flow

1. The admin opens **Settings → Manage Profiles**. The view is registered only when the authenticated profile role is `ADMIN`.
2. `AdminProfileManagementView` sends search, form, save, and upload actions to `useAdminProfileManagementController`.
3. The controller normalizes data with `adminProfileManagementModel` and calls `/api/admin/profile-management/{userId}` through the authenticated API client.
4. `SecurityConfig` rejects non-admin profile mutations before controller dispatch, and `AdminProfileManagementController` independently verifies the JWT authority is exactly `ROLE_ADMIN`; unauthorized callers receive HTTP 403.
5. `AdminProfileManagementService` validates the requested fields and uses the feature-specific repositories to read or update `app_users`, `student_profiles`, and `user_profile_pictures`.
6. The updated DTO or image response returns through the controller to the frontend controller, which refreshes the admin form and status message.
7. Under the production profile, Hibernate uses non-destructive `update` mode and SQL seed initialization remains disabled, so Neon data is retained across backend restarts.

## Files

- `frontend/src/models/adminProfileManagementModel.js`
- `frontend/src/controllers/adminProfileManagementController.js`
- `frontend/src/views/pages/AdminProfileManagementView.jsx`
- `frontend/src/views/pages/AdminProfileManagementView.css`
- `frontend/src/views/pages/AccountSettingsView.jsx` (minimal tab registration)
- `backend/src/main/java/com/campusconnect/backend/dto/AdminManagedProfileDTO.java`
- `backend/src/main/java/com/campusconnect/backend/dto/AdminProfileUpdateRequest.java`
- `backend/src/main/java/com/campusconnect/backend/repository/AdminProfileRepository.java`
- `backend/src/main/java/com/campusconnect/backend/repository/AdminStudentProfileRepository.java`
- `backend/src/main/java/com/campusconnect/backend/repository/AdminProfilePictureRepository.java`
- `backend/src/main/java/com/campusconnect/backend/service/AdminProfileManagementService.java`
- `backend/src/main/java/com/campusconnect/backend/controller/AdminProfileManagementController.java`
- `backend/src/main/java/com/campusconnect/backend/config/SecurityConfig.java` (RBAC route registration)
- `backend/src/main/resources/application.properties` (optional local secret import)
- `backend/src/main/resources/application-prod.properties` (persistent Neon safeguards)

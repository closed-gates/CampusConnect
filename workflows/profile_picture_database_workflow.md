# Profile Picture Database Workflow

## User story

An authenticated CampusConnect user can upload a profile picture and see the same picture after reloading or signing in again on another browser.

## Communication flow

1. The Settings view sends the selected image to `handleAvatarChange`.
2. The account settings controller validates the type and 2 MB size limit, then sends authenticated multipart data to `PUT /api/account/profile-picture`.
3. `UserProfilePictureController` obtains the user ID from the validated JWT principal and delegates to `UserProfilePictureService`.
4. The service validates the file and user, then persists its bytes and content type through `UserProfilePictureRepository`.
5. On Settings load, the controller requests `GET /api/account/profile-picture`, creates a browser object URL from the returned bytes, and the view renders it.

## Files

- `frontend/src/controllers/accountSettingsController.js`
- `frontend/src/views/pages/AccountSettingsView.jsx`
- `backend/src/main/java/com/campusconnect/backend/model/UserProfilePicture.java`
- `backend/src/main/java/com/campusconnect/backend/repository/UserProfilePictureRepository.java`
- `backend/src/main/java/com/campusconnect/backend/service/UserProfilePictureService.java`
- `backend/src/main/java/com/campusconnect/backend/controller/UserProfilePictureController.java`

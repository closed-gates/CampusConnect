# In-App Notification Preferences Workflow

## User story

Each authenticated user can independently enable or mute assignment, grade, advising, exam, and announcement notifications inside CampusConnect.

## Communication flow

1. Settings renders one in-app toggle per notification category.
2. Changing a toggle calls the settings controller, which sends the category to the authenticated preferences API.
3. The backend service saves the user's choices in `in_app_notification_preferences`.
4. Every notification producer calls the central `NotificationService` dispatcher.
5. The dispatcher checks the recipient's saved category preference before inserting into `notifications` or sending a WebSocket event.
6. Allowed notifications appear in the existing notification bell and toast; muted notifications are skipped.

## Files

- `frontend/src/models/accountSettingsModel.js`
- `frontend/src/controllers/accountSettingsController.js`
- `frontend/src/views/pages/AccountSettingsView.jsx`
- `backend/src/main/java/com/campusconnect/backend/model/InAppNotificationPreference.java`
- `backend/src/main/java/com/campusconnect/backend/repository/InAppNotificationPreferenceRepository.java`
- `backend/src/main/java/com/campusconnect/backend/service/InAppNotificationPreferenceService.java`
- `backend/src/main/java/com/campusconnect/backend/controller/InAppNotificationPreferenceController.java`
- `backend/src/main/java/com/campusconnect/backend/service/NotificationService.java`

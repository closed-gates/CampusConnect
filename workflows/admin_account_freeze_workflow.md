# Admin Account Freeze Workflow

## User story
As an administrator, I can search student and faculty accounts, freeze access without deleting data, and later unfreeze those accounts. A frozen user receives a clear popup when attempting to sign in.

## Communication flow

1. The admin opens Settings and selects the admin-only **Account Access** tab. `AccountFreezePanel` calls `useAccountFreezeController`, which uses `accountFreezeService` to request `GET /api/admin/account-freezes`.
2. `AccountFreezeController` delegates to `AccountFreezeService`. The service verifies the authenticated database user has the `ADMIN` role, selects only `STUDENT` and `FACULTY` users, and returns safe DTOs without password data.
3. Search text is filtered locally through `matchesAccountSearch`, matching name, user ID, email, or role. The category selector applies `matchesAccountCategory` for All accounts, Students, or Faculty.
4. The admin confirms Freeze or Unfreeze. The controller sends `PUT /api/admin/account-freezes/{userId}` with the desired frozen state. The backend verifies admin access and target role, updates `app_users.active`, and returns the updated row.
5. On login, `AuthService` rejects an inactive account with the `ACCOUNT_FROZEN` response marker. `useLoginController` converts that response into `FrozenAccountDialog`; no token is issued.
6. Unfreezing restores `app_users.active`, allowing the account to authenticate again with its existing credentials and data.

## Files

- Backend DTO: `backend/src/main/java/com/campusconnect/backend/dto/AccountFreezeDTO.java`
- Backend controller: `backend/src/main/java/com/campusconnect/backend/controller/AccountFreezeController.java`
- Backend service: `backend/src/main/java/com/campusconnect/backend/service/AccountFreezeService.java`
- Authentication integration: `backend/src/main/java/com/campusconnect/backend/service/AuthService.java`
- Frontend model: `frontend/src/models/accountFreezeModel.js`
- Frontend service: `frontend/src/services/accountFreezeService.js`
- Frontend controller: `frontend/src/controllers/accountFreezeController.js`
- Frontend view: `frontend/src/views/pages/AccountFreezeView.jsx`
- Login popup: `frontend/src/views/components/FrozenAccountDialog.jsx`
- Minimal wiring: `frontend/src/views/pages/AccountSettingsView.jsx`, `frontend/src/views/pages/LoginView.jsx`

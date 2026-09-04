# Account Preferences & Settings – Feature Workflow

## User Story
As a logged-in user (Student, Faculty, or Admin), I want to view my full profile,
update my name/email, change my password, and configure UI preferences
(theme and notification pop-up muting), so that my account reflects accurate personal
information and I can customise my experience.

---

## Communication Flow

### 1. Page Load — Profile Fetch
```
AccountSettingsView (mounts)
  → useAccountSettingsController (useEffect)
    → GET /api/account/profile + Authorization: Bearer JWT
      → AccountSettingsController.getProfile()
        → reads userId from the authenticated JWT principal
        → AccountSettingsService.getProfile()
          → AppUserRepository.findByUserId()          [app_users table]
          → StudentProfileRepository.findById()       [student_profiles table] (STUDENT only)
          → assembles AccountProfileDTO
        ← AccountProfileDTO JSON
      ← 200 OK
    ← setProfile(data) → re-renders ProfileHero + ProfileTab
```

### 2. Edit Profile (Name / Email)
```
User clicks "Edit" button
  → handleEnterEditMode() → setEditMode(true) → form inputs appear

User edits fields → handleEditChange(field, value) → setEditForm(...)

User clicks "Save Changes"
  → handleSaveProfile()
    → PUT /api/account/profile + Authorization: Bearer JWT  { fullName, email }
      → AccountSettingsController.updateProfile()
        → reads userId from the authenticated JWT principal
        → AccountSettingsService.updateProfile()
          → AppUserRepository.findByUserId()
          → validate email uniqueness via findByEmail()
          → AppUserRepository.save(user)
          → StudentProfileRepository.save(profile) [keeps student name/email in sync]
          → re-calls getProfile() → returns updated AccountProfileDTO
        ← AccountProfileDTO JSON
      ← 200 OK
    ← setProfile(updated), storeAuth(...) [updates localStorage for Sidebar]
    → success toast shown, edit mode exits
```

### 3. Change Password
```
User fills Current / New / Confirm password fields
  → handlePasswordChange(field, value) → setPasswordForm(...)
  → (new password field) → scorePassword() → setPasswordStrength(...)

User clicks "Update Password"
  → handleChangePassword()
    → PUT /api/account/password + Authorization: Bearer JWT  { currentPassword, newPassword }
      → AccountSettingsController.changePassword()
        → reads userId from the authenticated JWT principal
        → AccountSettingsService.changePassword()
          → AppUserRepository.findByUserId()
          → PasswordEncoder.matches(current, hash)   [BCrypt verify]
          → PasswordEncoder.encode(newPassword)
          → AppUserRepository.save(user)
        ← 204 No Content
      ← success
    ← form cleared, success toast shown
```

### 4. Preferences
```
User toggles dark mode / notification muting
  → handlePreferenceChange(key, value)
    → setPreferences(next)
    → savePreferences(next) → localStorage['cc_preferences']
    → document.documentElement.setAttribute('data-theme', ...) [CSS theming]
    → dispatches campusconnect:preferences-changed
      → notificationController updates its mute ref
      → incoming notifications remain in the bell/unread list
      → floating toast is shown only when notificationsMuted is false
```

### 5. Extended Settings
Profile photo, appearance, accessibility, email categories, academic defaults, and calendar defaults are persisted in `cc_preferences`. The global preferences controller applies appearance and accessibility attributes on every route. Data export produces a branded local PDF containing account and academic profile fields only; preference values are excluded and server data is not modified. Account access suspension is managed only by administrators through the separate account-freeze workflow.

The preferred semester is applied non-destructively when semester-aware pages mount:
- Courses initializes its existing semester filter from the preferred term's season (for example, `Spring 2027` → `Spring`). The user can still change or clear that page filter normally.
- Default Course View initializes the Course Catalog's existing grid/list toggle whenever the page mounts. The user can still switch views for the current visit; the saved default remains unchanged until it is updated in Settings.
- Attendance converts the display term to the backend format (for example, `Spring 2027` → `Spring2027`) and requests registered courses for that term.
- Advising and student self-registration pass the preferred term through their list, assign, confirm, register, and drop operations. Advisor-assigned courses are stored with a term so records from different semesters do not mix.
- View Routine requests registrations and advised courses for the preferred term and displays that term in its heading, official session label, and empty state.
- Payment requests the fee receipt for the preferred term, checks paid status against that same term, and carries it through payment, bypass, and receipt generation.
- Upcoming Exams Widget controls whether the existing exam schedule component is mounted on the dashboard. Enabling it preserves the existing live API-backed widget; disabling it only hides that dashboard component and does not modify exam records or routine displays.
- Week Starts On accepts Saturday, Sunday, or Monday and rotates the View Routine class-schedule columns accordingly. It changes presentation order only; course cells, time slots, and exam schedules retain their existing data.
- Default Reminder is persisted to the authenticated user's `app_users.reminder_hours` through `PUT /api/account/preferences/reminder`. The five-minute deadline worker scans the maximum 48-hour window, then applies each student's selected 1, 6, 12, 24, or 48-hour lead time before dispatching an assignment reminder. Existing submission checks, enrollment targeting, deduplication, WebSocket delivery, mute behavior, and unread history remain unchanged.
- Transcript history and unrelated business rules remain unchanged; changing the preference selects a term but never rewrites records belonging to another term.

---

## Files Involved

### Backend
| Layer      | File |
|------------|------|
| DTO        | `backend/.../dto/AccountProfileDTO.java` |
| DTO        | `backend/.../dto/UpdateProfileRequest.java` |
| DTO        | `backend/.../dto/ChangePasswordRequest.java` |
| Service    | `backend/.../service/AccountSettingsService.java` |
| Controller | `backend/.../controller/AccountSettingsController.java` |
| Repository | `backend/.../repository/AppUserRepository.java` (existing — no changes) |
| Repository | `backend/.../repository/StudentProfileRepository.java` (existing — no changes) |

### Frontend
| Layer      | File |
|------------|------|
| Model      | `frontend/src/models/accountSettingsModel.js` |
| Controller | `frontend/src/controllers/accountSettingsController.js` |
| View       | `frontend/src/views/pages/AccountSettingsView.jsx` |
| CSS        | `frontend/src/views/pages/AccountSettingsView.css` |

### Minimal Wiring (existing files, minimal changes)
| File       | Change |
|------------|--------|
| `frontend/src/App.jsx` | +1 import, +1 `<Route path="/settings">` |
| `frontend/src/views/components/Sidebar.jsx` | +1 Settings button above Logout, +1 SettingsIcon SVG |

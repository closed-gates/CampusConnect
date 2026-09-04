# Workflow: Database-Driven User Directory for Direct Messaging

## User Story / Business Requirement
When a user opens the Messaging Board and clicks "+ New DM", the system must display the real registered users directly from the university's database (`app_users` table in Neon PostgreSQL) instead of hardcoded/mock static users. The list must allow filtering by name, user ID, and role (Faculty, Student, Admin), exclude the currently logged-in user, and seamlessly initiate a real-time/direct message conversation.

---

## Architecture Flow (Strict MVC)

```
[View] DMConversationList.jsx / DirectMessagingView.jsx
  │ (User clicks '+ New DM')
  ▼
[Controller] messagingController.js (useMessagingController hook)
  │ (Issues apiClient.get('/api/users?excludeUserId=...'))
  ▼
[Model/API] UserController.java (GET /api/users)
  │ (Delegates to UserService)
  ▼
[Service] UserService.java (getAllUsers)
  │ (Queries AppUserRepository, maps to safe UserDto, sorts by role & name)
  ▼
[Database] Neon PostgreSQL (`app_users` table)
```

---

## Sequential Communication Path

| Step | Layer | Component / File | Description |
|------|-------|------------------|-------------|
| 1 | **View** | `DirectMessagingView.jsx` | Mounts the messaging interface and invokes `useMessagingController(resolvedUser)`. |
| 2 | **Controller** | `messagingController.js` | `useEffect` triggers on mount / user change, calling `apiClient.get('/api/users?excludeUserId=...')`. |
| 3 | **Client Service** | `apiClient.js` | Attaches Bearer JWT token in Authorization header and calls proxy to Spring Boot backend. |
| 4 | **Security** | `SecurityConfig.java` / `JwtAuthFilter.java` | Authenticates request; `/api/users/**` permitted. |
| 5 | **Backend Controller** | `UserController.java` | Handles `GET /api/users`, extracts `excludeUserId`, invokes `UserService.getAllUsers(...)`. |
| 6 | **Backend Service** | `UserService.java` | Calls `AppUserRepository.findAll()`, filters out caller's `userId`, maps entity to `UserDto` (omits password hash), sorts Faculty first, then Students, then Admins. |
| 7 | **Database** | Neon PostgreSQL (`app_users`) | Executes query returning all registered faculty, students, and admins. |
| 8 | **DTO** | `UserDto.java` | Serializes safe user records (`userId`, `fullName`, `email`, `role`, `isAdvisor`) to JSON. |
| 9 | **Controller** | `messagingController.js` | Receives JSON array, normalizes user objects (`id`, `displayName`, `role`, etc.), and sets `availableUsers` state. |
| 10 | **View** | `DMConversationList.jsx` | User clicks `+ New DM`, opening searchable modal containing all database users with avatars and role badges. |
| 11 | **User Action** | `DMConversationList.jsx` | User clicks a recipient → triggers `onStartNewDM(selectedUser)` → initializes/selects conversation window. |

---

## Files Involved

### Backend
1. `backend/src/main/java/com/campusconnect/backend/dto/UserDto.java` (NEW) – Safe user projection DTO (no password hash).
2. `backend/src/main/java/com/campusconnect/backend/service/UserService.java` (NEW) – User service querying `AppUserRepository` and ordering by role/name.
3. `backend/src/main/java/com/campusconnect/backend/controller/UserController.java` (NEW) – REST controller exposing `GET /api/users`.
4. `backend/src/main/java/com/campusconnect/backend/config/SecurityConfig.java` (MODIFIED) – Explicit permit for `/api/users/**`.

### Frontend
1. `frontend/src/controllers/messagingController.js` (MODIFIED) – Fetches `/api/users` from database, manages dynamic `availableUsers` and `loadingUsers` state.
2. `frontend/src/views/components/DirectMessaging/DMConversationList.jsx` (MODIFIED) – Displays database user count, search filter, and Admin/Faculty/Student role badges.
3. `frontend/src/views/components/DirectMessaging/UserAvatar.jsx` (MODIFIED) – Supports Admin avatar styling alongside Faculty and Student.
4. `frontend/src/views/components/DirectMessaging/DirectMessaging.css` (MODIFIED) – Adds `.role-badge.admin` styling.

# Course Channel Access Management Workflow

## Overview
Allows Administrators to view, add, and remove students and faculty access from university course channels on the messaging board. Access changes are persisted in Neon PostgreSQL via Spring Boot JPA and synchronized in real time across active browser sessions using WebSocket STOMP and BroadcastChannel.

---

## Strict Guardrails Followed
- **Admin Exclusivity**: The **"⚙️ Manage Access"** controls and `ChannelAccessModal` are restricted exclusively to administrators (`currentUser.role === 'ADMIN'`).
- **Student & Faculty Isolation**: Non-admin users cannot see the manage access controls or access channels from which their membership has been revoked.
- **Strict MVC Separation**:
  - **Model**: `CourseChannelMember.java` (backend entity) / `channelAccessModel.js` (frontend pure functions).
  - **Controller**: `ChannelAccessController.java` (backend REST) / `channelAccessController.js` (frontend hook).
  - **View**: `ChannelAccessModal.jsx` & `CourseChatPanel.jsx`.
  - **Service**: `ChannelAccessService.java`.
  - **Database**: `course_channel_members` table.

---

## Sequential Communication Path

```mermaid
sequenceDiagram
    autonumber
    participant Admin as Administrator (Browser View)
    participant Modal as ChannelAccessModal (View)
    participant Ctrl as useChannelAccessController (Controller Hook)
    participant REST as ChannelAccessController (Backend REST)
    participant Svc as ChannelAccessService (Backend Service)
    participant DB as PostgreSQL (course_channel_members)
    participant STOMP as WebSocket STOMP / BroadcastChannel
    participant Student as Student / Faculty Session (Client)

    Note over Admin,Modal: Admin opens Course Channel & clicks "⚙️ Manage Access"
    Admin->>Ctrl: openModal()
    Ctrl->>REST: GET /api/channels/{channelId}/members
    REST->>Svc: getChannelMembers(channelId)
    Svc->>DB: SELECT * FROM course_channel_members WHERE channel_id=? AND status='ACTIVE'
    DB-->>Svc: Active Member Records
    Svc-->>REST-->>Ctrl-->>Modal: Render Current Members & Available Directory Users

    alt Grant Access (Add Member)
        Admin->>Modal: Click "+ Grant Access" for student or faculty
        Modal->>Ctrl: handleAddMember(candidate)
        Ctrl->>REST: POST /api/channels/{channelId}/members { userId, courseCode }
        REST->>Svc: addMember(channelId, courseCode, userId, addedBy)
        Svc->>DB: INSERT / UPDATE course_channel_members SET status='ACTIVE'
        Svc->>STOMP: Broadcast { event: "CHANNEL_ACCESS_CHANGED", action: "ADD", channelId, userId }
        Ctrl->>STOMP: BroadcastChannel.postMessage(ADD)
        STOMP-->>Student: messagingController receives ADD -> Adds channel to channelConvs in real time
        Ctrl-->>Modal: Update members list + show success feedback
    else Revoke Access (Remove Member)
        Admin->>Modal: Click "✕ Remove" for a member
        Modal->>Ctrl: handleRemoveMember(userId)
        Ctrl->>REST: DELETE /api/channels/{channelId}/members/{userId}
        REST->>Svc: removeMember(channelId, userId, removedBy)
        Svc->>DB: UPDATE course_channel_members SET status='REVOKED'
        Svc->>STOMP: Broadcast { event: "CHANNEL_ACCESS_CHANGED", action: "REMOVE", channelId, userId }
        Ctrl->>STOMP: BroadcastChannel.postMessage(REMOVE)
        STOMP-->>Student: messagingController receives REMOVE -> Drops channel from channelConvs in real time
        Ctrl-->>Modal: Update members list + show success feedback
    end
```

---

## Files Involved

### Backend (Spring Boot 3.3.2)
- **Model**: `backend/src/main/java/com/campusconnect/backend/model/CourseChannelMember.java`
- **Repository**: `backend/src/main/java/com/campusconnect/backend/repository/CourseChannelMemberRepository.java`
- **Service**: `backend/src/main/java/com/campusconnect/backend/service/ChannelAccessService.java`
- **Controller**: `backend/src/main/java/com/campusconnect/backend/controller/ChannelAccessController.java`
- **Configuration**: `backend/src/main/java/com/campusconnect/backend/config/SecurityConfig.java`

### Frontend (React + Vite)
- **Model**: `frontend/src/models/channelAccessModel.js`
- **Controller**:
  - `frontend/src/controllers/channelAccessController.js`
  - `frontend/src/controllers/messagingController.js`
- **View**:
  - `frontend/src/views/components/CourseChat/ChannelAccessModal.jsx`
  - `frontend/src/views/components/CourseChat/CourseChatPanel.jsx`
- **Service**: `frontend/src/services/channelService.js`

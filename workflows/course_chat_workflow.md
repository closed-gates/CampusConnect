# Course Chat Workflow — Real-Time Chat via WebSockets

## Feature Summary

One STOMP/WebSocket room per course sub-channel, scoped to `course-{courseId}.{subChannelId}`.
Users enrolled in a course can send and receive messages in real time. Messages are persisted
to the database (best-effort) and broadcast to all active subscribers of the same room.

---

## Communication Flow

```
View (CourseChatPanel)
  └─▶ Controller (useChatController)
        ├─▶ Model (courseChatModel — WS URL, topic builders)
        ├─▶ Service (channelService — local fallback + sub-channel list)
        └─▶ WebSocket / STOMP (SockJS → Spring Backend)
              └─▶ ChatController (@MessageMapping)
                    └─▶ ChatService (persist + broadcast)
                          ├─▶ ChatMessageRepository (JPA → DB)
                          └─▶ SimpMessagingTemplate → /topic/course.{id}.{sub}
                                └─▶ All subscribed CourseChatPanel clients
```

### Step-by-step

| # | Actor | Action |
|---|---|---|
| 1 | User | Navigates to `/messaging`, selects a course channel |
| 2 | `DirectMessagingView` | Renders `<CourseChatPanel channel={...} />` |
| 3 | `CourseChatPanel` | Calls `useChatController(channel, activeSubId, currentUser)` |
| 4 | `useChatController` | Reads WS URL from `courseChatModel`, creates STOMP client via SockJS |
| 5 | STOMP client | Connects to `http://localhost:8080/ws` |
| 6 | STOMP client | Subscribes to `/topic/course.{courseId}.{subChannelId}` |
| 7 | STOMP client | Publishes to `/app/chat.history` to load persisted messages |
| 8 | `ChatController` | Receives `/app/chat.history`, calls `ChatService.getHistory()` |
| 9 | `ChatService` | Queries `ChatMessageRepository`, returns last 50 messages |
| 10 | `SimpMessagingTemplate` | Sends history list to `/topic/course.{id}.{sub}.history` |
| 11 | `CourseChatPanel` | Displays history; user types and presses Enter |
| 12 | `useChatController` | Publishes to `/app/chat.sendMessage` via STOMP |
| 13 | `ChatController` | Receives payload, calls `ChatService.persist()` |
| 14 | `ChatService` | Saves `ChatMessage` entity to DB; stamps `id` + `createdAt` |
| 15 | `SimpMessagingTemplate` | Broadcasts enriched DTO to `/topic/course.{id}.{sub}` |
| 16 | All subscribed clients | `useChatController` receives frame, appends to `messages[]` |
| 17 | `CourseChatPanel` | Re-renders message list with new message |

### Fallback (Backend Unavailable)

If the WebSocket connection cannot be established within 4 seconds:
- `useChatController` sets `localFallbackRef = true`
- Send path writes directly to `channelService.sendSubChannelMessage()`
- UI shows "Offline" badge; all local messages still work

---

## Files Involved

### Backend (New Files)

| File | Role | Path |
|---|---|---|
| `ChatMessage.java` | Model (JPA entity) | `backend/.../model/ChatMessage.java` |
| `ChatMessageDto.java` | DTO (STOMP payload) | `backend/.../dto/ChatMessageDto.java` |
| `ChatMessageRepository.java` | Repository (JPA) | `backend/.../repository/ChatMessageRepository.java` |
| `ChatService.java` | Service (persist + history) | `backend/.../service/ChatService.java` |
| `ChatController.java` | Controller (STOMP handler) | `backend/.../controller/ChatController.java` |

### Backend (Unchanged — already configured)

| File | Why it is relevant |
|---|---|
| `WebSocketConfig.java` | Already configures `/ws`, `/topic`, `/app` |
| `CorsConfig.java` | Already allows `/ws/**` from `localhost:5173` |
| `pom.xml` | Already includes `spring-boot-starter-websocket` |

### Frontend (New Files)

| File | Role | Path |
|---|---|---|
| `courseChatModel.js` | Model (WS constants, builders) | `frontend/src/models/courseChatModel.js` |
| `useChatController.js` | Controller (STOMP hook) | `frontend/src/controllers/useChatController.js` |
| `CourseChatPanel.jsx` | View (chat panel with WS) | `frontend/src/views/components/CourseChat/CourseChatPanel.jsx` |

### Frontend (Modified — 2 lines only)

| File | Change |
|---|---|
| `DirectMessagingView.jsx` | `import CourseChannelView` → `import CourseChatPanel`; `<CourseChannelView>` → `<CourseChatPanel>` |

### Frontend (Unchanged)

| File | Why unchanged |
|---|---|
| `CourseChannelView.jsx` | Original local-mock UI — preserved untouched |
| `channelService.js` | Still used for sub-channel list, member list, and fallback messaging |
| `messagingController.js` | Still manages DM conversations and channel conv list |
| All other pages | Zero changes |

---

## STOMP Destinations Summary

| Direction | Destination | Purpose |
|---|---|---|
| Client → Server | `/app/chat.sendMessage` | Send a new message |
| Client → Server | `/app/chat.history` | Request last 50 messages |
| Server → Client | `/topic/course.{courseId}.{subId}` | Real-time message broadcast |
| Server → Client | `/topic/course.{courseId}.{subId}.history` | History delivery (one-shot) |

---

## Database Schema

Table: `chat_messages`

| Column | Type | Notes |
|---|---|---|
| `id` | BIGINT (PK, auto) | |
| `course_id` | VARCHAR(64) | e.g. `cse_470` |
| `sub_channel_id` | VARCHAR(64) | e.g. `general` |
| `author_id` | VARCHAR(128) | e.g. `usr_eusha_001` |
| `author_name` | VARCHAR(128) | Display name |
| `author_role` | VARCHAR(32) | `STUDENT` or `FACULTY` |
| `content` | VARCHAR(2000) | Message body |
| `created_at` | DATETIME | UTC, set by `@PrePersist` |

Indexes: `(course_id, sub_channel_id)` and `(created_at)` for efficient history queries.

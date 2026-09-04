# Presence Indicators Workflow — Online/Offline Status

## Feature Summary

Ephemeral presence tracking via STOMP heartbeats with a 60-second TTL.
Users who connect broadcast ONLINE; users who disconnect (gracefully or via tab close)
broadcast OFFLINE. All active clients receive presence deltas and update their
UI in real time — dots on avatars, member list partitioned by Online/Offline.

---

## Communication Flow

```
View (CourseChatPanel / DMConversationList)
  └─▶ Controller (usePresenceController)
        ├─▶ Model (presenceModel — destinations, intervals)
        └─▶ WebSocket / STOMP (SockJS → Spring Backend)
              └─▶ PresenceController (@MessageMapping)
                    ├─▶ PresenceStore (in-memory ConcurrentHashMap + TTL sweep)
                    │     └─▶ @Scheduled sweep (every 20s)
                    └─▶ SimpMessagingTemplate → /topic/presence
                          └─▶ All subscribed usePresenceController instances
```

### Step-by-step

| # | Actor | Action |
|---|---|---|
| 1 | User | Opens `/messaging` page |
| 2 | `DirectMessagingView` | Calls `usePresenceController(currentUser)` once |
| 3 | `usePresenceController` | Creates STOMP client, connects to `/ws` |
| 4 | STOMP client | Subscribes to `/topic/presence` |
| 5 | STOMP client | Publishes to `/app/presence.connect` with `{userId, displayName}` |
| 6 | `PresenceController` | Receives connect, calls `PresenceStore.markOnline()` |
| 7 | `PresenceStore` | Adds user to ConcurrentHashMap, broadcasts `ONLINE` to `/topic/presence` |
| 8 | All subscribers | Receive delta, update `onlineUsers` Map |
| 9 | `DMConversationList` | Reads `onlineUsers.has(recipientId)` → renders green/gray dot |
| 10 | `CourseChatPanel` | Partitions member list into Online / Offline sections with PresenceDot |
| 11 | Heartbeat (every 25s) | `usePresenceController` publishes `/app/presence.heartbeat` |
| 12 | `PresenceController` | Calls `PresenceStore.refreshHeartbeat()` — silent, no broadcast |
| 13 | TTL sweep (every 20s) | `@Scheduled` evicts entries > 60s old, broadcasts OFFLINE for each |
| 14 | User closes tab | `beforeunload` → publishes `/app/presence.disconnect` |
| 15 | `PresenceController` | `SessionDisconnectEvent` fires → `PresenceStore.markOffline()` |
| 16 | `PresenceStore` | Removes entry, broadcasts `OFFLINE` to `/topic/presence` |
| 17 | All subscribers | Remove userId from `onlineUsers` Map → dots turn gray |

---

## Files Involved

### Backend (New Files)

| File | Role | Path |
|---|---|---|
| `PresenceDto.java` | DTO (broadcast payload) | `backend/.../dto/PresenceDto.java` |
| `PresenceStore.java` | Service (in-memory registry + TTL sweep) | `backend/.../service/PresenceStore.java` |
| `PresenceController.java` | Controller (STOMP + SessionDisconnect) | `backend/.../controller/PresenceController.java` |

### Backend (Modified — 2 lines)

| File | Change |
|---|---|
| `BackendApplication.java` | Added `@EnableScheduling` + import |

### Frontend (New Files)

| File | Role | Path |
|---|---|---|
| `presenceModel.js` | Model (STOMP destinations, intervals, colors) | `frontend/src/models/presenceModel.js` |
| `usePresenceController.js` | Controller (STOMP hook, heartbeat, onlineUsers Map) | `frontend/src/controllers/usePresenceController.js` |
| `PresenceDot.jsx` | View (colored dot with pulse glow) | `frontend/src/views/components/Presence/PresenceDot.jsx` |

### Frontend (Modified)

| File | Change |
|---|---|
| `CourseChatPanel.jsx` | Added `usePresenceController`, member list with Online/Offline partition |
| `DMConversationList.jsx` | Added `onlineUsers` prop, live presence color fallback |
| `DirectMessagingView.jsx` | Called `usePresenceController` once, passed `onlineUsers` to DMConversationList |
| `CourseChannelView.css` | Appended `@keyframes presencePulse` |

### Unchanged

All other pages, Sidebar, auth logic, course/assignment/attendance features — zero changes.

---

## STOMP Destinations Summary

| Direction | Destination | Purpose |
|---|---|---|
| Client → Server | `/app/presence.connect` | Mark user ONLINE, store in session attrs |
| Client → Server | `/app/presence.heartbeat` | Silent TTL refresh (every 25s) |
| Client → Server | `/app/presence.disconnect` | Mark user OFFLINE (explicit) |
| Server → Client | `/topic/presence` | Broadcast `{userId, displayName, status, lastActiveAt}` deltas |

---

## Presence Timing (2-Minute Inactivity Rule)

| Parameter | Value | Reason |
|---|---|---|
| Heartbeat interval | 20 seconds | Kept active while user interacts with the app |
| Client Inactivity Timeout | 2 minutes (120s) | Detects mouse/key/scroll idle time; pauses heartbeats & sends disconnect |
| Backend TTL | 120 seconds (2m) | Heartbeat entries expire after 2 minutes of no heartbeat (e.g. closed tab) |
| Backend TTL sweep | Every 15 seconds | Evicts expired users and broadcasts OFFLINE |
| Reconnect delay | 8 seconds | STOMP auto-reconnect on network hiccup |
| Resuming activity | Instant | Touching mouse/keyboard immediately marks user ONLINE again |

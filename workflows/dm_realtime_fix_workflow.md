# Direct Messaging Real-Time Fix – Workflow

## Feature
Real-Time Direct Messaging via STOMP WebSocket (Production Fix)

## Problem Solved
DMs previously used localStorage + BroadcastChannel exclusively, making them invisible to users on different devices/browsers. This workflow documents the replacement transport using a backend-persisted STOMP WebSocket system.

## Communication Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│ User A (Sender)                                                      │
│                                                                      │
│  messagingController.handleSendMessage()                             │
│    └─► dmService.sendDirectMessage()                                 │
│          └─► STOMP publish to: /app/dm.send                          │
└─────────────────────────────────────────────────────────────────────┘
                │  (WebSocket frame over wss://)
                ▼
┌─────────────────────────────────────────────────────────────────────┐
│ Spring Boot Backend                                                  │
│                                                                      │
│  DirectMessageController.sendDirectMessage()                         │
│    └─► DirectMessageService.persist()  →  direct_messages table (DB)│
│    └─► SimpMessagingTemplate.convertAndSend("/topic/dm.{roomId}")    │
└─────────────────────────────────────────────────────────────────────┘
                │  (STOMP broadcast over wss://)
                ▼
┌─────────────────────────────────────────────────────────────────────┐
│ User B (Recipient)                           User A (Sender)         │
│                                                                      │
│  dmService._roomSubs[roomId]                 dmService._roomSubs[id] │
│  receives /topic/dm.{roomId}                 receives same broadcast │
│    └─► _emit('MESSAGE_RECEIVED')               └─► _emit(...)        │
│    └─► messagingController updates UI          └─► deduped by msg id │
└─────────────────────────────────────────────────────────────────────┘
```

## History Load Flow (on room join)

```
Client opens conversation
  └─► messagingController.handleSelectConversation(convId)
        └─► dmService.subscribeToRoom(roomId)
              ├─► STOMP subscribe: /topic/dm.{roomId}         (live msgs)
              ├─► STOMP subscribe: /topic/dm.{roomId}.history  (one-shot)
              └─► STOMP publish: /app/dm.history {roomId}

Backend DirectMessageController.fetchHistory()
  └─► DirectMessageService.getHistory(roomId)  →  DB query last 100 msgs
  └─► broadcast to /topic/dm.{roomId}.history

Client receives history
  └─► dmService emits 'HISTORY_LOADED' {roomId, history}
  └─► messagingController merges into messagesMap (de-duped, time-sorted)
  └─► UI displays historical messages
```

## Files Involved

### New Backend Files
| File | Role |
|------|------|
| `backend/.../model/DirectMessage.java` | JPA entity → `direct_messages` table |
| `backend/.../repository/DirectMessageRepository.java` | Spring Data JPA repo |
| `backend/.../dto/DirectMessageDto.java` | Shared DTO (inbound + outbound) |
| `backend/.../service/DirectMessageService.java` | Persist + history retrieval |
| `backend/.../controller/DirectMessageController.java` | STOMP handler for /app/dm.send and /app/dm.history |

### Modified Backend Files
| File | Change |
|------|--------|
| `backend/.../config/WebSocketConfig.java` | Added `/queue` to broker, updated comment |

### Modified Frontend Files
| File | Change |
|------|--------|
| `frontend/src/services/dmService.js` | Full rewrite: STOMP-based transport |
| `frontend/src/controllers/messagingController.js` | HISTORY_LOADED handler, room subscribe/unsubscribe |
| `frontend/src/controllers/useChatController.js` | Cold-start timeout 4s → 30s |

## STOMP Destinations

| Direction | Destination | Purpose |
|-----------|-------------|---------|
| Client → Server | `/app/dm.send` | Send a new DM |
| Client → Server | `/app/dm.history` | Request room history |
| Server → Client | `/topic/dm.{roomId}` | Broadcast new message to both participants |
| Server → Client | `/topic/dm.{roomId}.history` | Deliver last 100 messages on join |

## Database

New table auto-created by Hibernate on first deployment:

```sql
CREATE TABLE direct_messages (
  id              BIGSERIAL PRIMARY KEY,
  room_id         VARCHAR(256) NOT NULL,
  sender_id       VARCHAR(128) NOT NULL,
  sender_name     VARCHAR(128) NOT NULL,
  sender_role     VARCHAR(32),
  recipient_id    VARCHAR(128) NOT NULL,
  recipient_name  VARCHAR(128),
  recipient_role  VARCHAR(32),
  content         VARCHAR(4000),
  attachments_json VARCHAR(8000),
  created_at      TIMESTAMP NOT NULL,
  INDEX idx_dm_room_created (room_id, created_at)
);
```

## Course Chat Fix
- File: `frontend/src/controllers/useChatController.js`
- Change: Cold-start fallback timeout `4000ms → 30000ms`
- Rationale: Render free-tier takes 30–60s to cold-start; the old 4s timeout triggered
  local fallback before WebSocket could connect, causing messages to go to local memory only.

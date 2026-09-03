# Real-Time Messaging Workflow

## Overview
This workflow describes the end-to-end real-time direct messaging pipeline in CampusConnect. Messages sent by any user (Faculty, Student, Admin) are immediately delivered across open browser tabs, windows, and sessions without requiring page refreshes.

---

## Sequential Communication Path

```
View (DMChatWindow / DMInputArea)
  │
  ▼
Controller (messagingController.js :: handleSendMessage)
  │
  ▼
Service (dmService.js :: sendDirectMessage)
  ├─▶ 1. Persistence Layer: recordDirectMessage(senderUser, recipientUser, message)
  │      └─▶ localStorage ('cc_dm_room_{roomId}' & 'cc_dm_conversations_{userId}')
  │
  ├─▶ 2. Local Window Dispatch: this._emit('MESSAGE_RECEIVED')
  │
  └─▶ 3. Real-Time Cross-Tab Dispatch: BroadcastChannel ('campusconnect_dm_realtime')
         │
         ▼
Recipient / Other Tabs (dmService.broadcastChannel.onmessage)
  │
  ▼
Controller (messagingController.js :: dmService.subscribe)
  ├─▶ Updates messagesMap[conversationId] with new message
  ├─▶ Updates conversations list (lastMessage preview + unreadCount)
  └─▶ If conversation is currently active, triggers instant re-render in DMChatWindow
```

---

## Files Involved

| Component | File Path | Role |
|---|---|---|
| **View** | `frontend/src/views/components/DirectMessaging/DMChatWindow.jsx` | Renders message bubbles, timestamps, avatars, attachments |
| **View** | `frontend/src/views/components/DirectMessaging/DMInputArea.jsx` | Text input, file uploads, typing triggers |
| **View** | `frontend/src/views/components/DirectMessaging/DMConversationList.jsx` | Sidebar listing with real-time lastMessage preview & badges |
| **Controller** | `frontend/src/controllers/messagingController.js` | State manager: handles messagesMap, active conversation resolution, and real-time event subscriptions |
| **Service** | `frontend/src/services/dmService.js` | DirectMessagingService with BroadcastChannel for instant inter-tab event broadcasting |
| **Model** | `frontend/src/models/dmPersistenceModel.js` | Bidirectional room & user conversation persistence in localStorage |
| **Model** | `frontend/src/models/messagingModel.js` | User schemas, session identity resolution via `getCurrentUser()` |

---

## Key Real-Time Mechanisms

1. **Instant Cross-Tab Event Delivery (`BroadcastChannel`)**:
   - Outgoing messages publish to `campusconnect_dm_realtime`.
   - All other open tabs receive the event within < 1ms, updating their in-memory `messagesMap` and conversations list.
2. **Strict Participant Isolation Check**:
   - Every receiver verifies whether `user.id === message.senderId || user.id === message.recipientId`.
   - Messages between other users (e.g. sent by another student in another account) are discarded immediately, preventing cross-user pollution.
3. **Room Determinism & Message Sanitization**:
   - 1-on-1 direct message room IDs are strictly derived as `getDeterministicRoomId(user.id, activeRecipient.id)`.
   - `loadRoomMessages` and `DMChatWindow` filter messages to ensure only senders who are genuine participants of `dm_{userA}_{userB}` appear in the chat feed.
4. **Author Resolution Integrity**:
   - Author metadata (`senderId`, `senderName`, `senderRole`, `recipientId`, `recipientName`, `recipientRole`) is stamped at send-time and preserved.
   - Incoming messages from students never fall back to the faculty's display name or role badge.
5. **Fallback Window Storage Events (`window.onstorage`)**:
   - Changes to `cc_dm_room_*` and `cc_dm_conversations_*` are picked up automatically by storage listeners.
6. **First-Time DM Provisioning Across Roles**:
   - When User A messages User B for the first time, `recordDirectMessage` saves reciprocal conversation entries for both users.
   - In the recipient's list, `recipient` is stamped with the sender's identity and normalized role (`STUDENT`, `FACULTY`, `ADMIN`).
   - If the recipient's tab is already open, the real-time event automatically registers the conversation into the recipient's sidebar without page refresh.
7. **3-Tier Role Categorization (`DMConversationList.jsx`)**:
   - Sidebar conversations and filter tabs support **Faculty Members** (`FACULTY`), **Students** (`STUDENT`), and **Administrators** (`ADMIN`).
   - Each conversation is automatically routed to its respective section based on the contact's role.

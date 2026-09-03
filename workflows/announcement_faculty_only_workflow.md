# Workflow: Faculty-Only Posting in Announcement Sub-Channels

## User Story / Business Requirement

In the Advising Channel (and any course channel) of the Messaging Board, the `#announcements` sub-channel is reserved for official announcements from faculty/instructors. Students must be able to **read** announcements but **not post** to them. Faculty must be able to both read and **post** to announcement channels.

---

## Sequential Communication Flow

### When a Student opens #announcements

| Step | Layer | Action |
|------|-------|--------|
| 1 | **View** (`CourseChatPanel.jsx`) | Renders the sub-channel. Calls `getStoredRole()` — `isFaculty = false`. |
| 2 | **View** | `activeSub.readOnly === true` AND `isFaculty === false` ? renders locked notice. Input box hidden. |
| 3 | **View** | Topbar badge shows: `?? Instructor Only` |
| 4 | **Controller** (`handleSend`) | Guard `if (activeSub?.readOnly && !isFaculty) return` blocks any accidental send. |

### When a Faculty member opens #announcements

| Step | Layer | Action |
|------|-------|--------|
| 1 | **View** (`CourseChatPanel.jsx`) | Renders the sub-channel. Calls `getStoredRole()` — `isFaculty = true`. |
| 2 | **View** | `isFaculty === true` ? locked notice skipped; full input box is rendered. |
| 3 | **View** | Topbar badge shows: `?? Announcements (You can post)` |
| 4 | **View ? Controller** | Faculty sends a message ? `handleSend()` called. |
| 5 | **Controller** (`handleSend`) | Guard evaluates to false (faculty) — `sendMessage(content, attachments)` proceeds. |
| 6 | **Controller** (`useChatController.js`) | Message sent over WebSocket to backend. |
| 7 | **Backend** (`ChatController.java`) | Broadcasts message to all subscribers. |
| 8 | **View** | All clients receive broadcast and display the new announcement. |

---

## Role Resolution

```js
import { getStoredRole } from '../../../models/authModel.js'
const isFaculty = (getStoredRole() || CURRENT_USER.role) === 'FACULTY'
```

- **Primary source:** `cc_role` in `localStorage` (set by `storeAuth()` on login).
- **Fallback:** `CURRENT_USER.role` from `messagingModel.js`.

---

## Files Involved

| File | Layer | Change |
|------|-------|--------|
| `frontend/src/views/components/CourseChat/CourseChatPanel.jsx` | View | `isFaculty` check added; guard updated; role-aware topbar badge; faculty sees input in readOnly channels |
| `frontend/src/models/authModel.js` | Model | `getStoredRole()` consumed (no changes to file) |
| `frontend/src/services/channelService.js` | Service | `announcements` sub-channel `readOnly: true` unchanged — now means "faculty-post-only" |

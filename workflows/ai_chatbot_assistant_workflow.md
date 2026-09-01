# AI Chatbot Assistant — Feature Workflow

## Overview
A floating AI chatbot widget (bottom-right corner, all authenticated roles) backed by Claude (Anthropic) via a secure Spring Boot backend endpoint. Scoped strictly to 12 academic topics with verbatim fallback for anything outside.

---

## Sequential Communication Path

```
User types message in ChatbotWidget.jsx
         │
         ▼  (useChatbotController.handleSend)
chatbotController.js
         │  builds history array, calls service
         ▼
chatbotService.js → POST /api/ai/chat  (JWT in Authorization header)
         │
         ▼  (Spring Security validates JWT)
AiChatController.java
         │  extracts userId + role from SecurityContext
         ▼
AiChatService.java
         ├─ TopicClassifier.classify(message)
         │     → OUT_OF_SCOPE? → return FALLBACK immediately (Claude NOT called)
         │     → matched topic? → continue
         ├─ buildContextBlock(userId, role, topic)
         │     → queries real DB via repositories:
         │       • StudentProfileRepository (credit limits, advising status)
         │       • AdvisedCourseRepository (advised courses, advisor name)
         │       • AdvisorRepository (emails, availability)
         │       • AssignmentRepository (assignments + deadlines)
         │       • AttendanceRecordRepository (per-course attendance %)
         │       • PaymentRecordRepository (payment history)
         │       • CourseSectionRepository (seat availability)
         │       • AppUserRepository (faculty full name lookup)
         ├─ buildSystemPrompt(contextBlock)
         │     → hard-restricts Claude to 12 topics
         │     → injects real user data as context
         └─ callClaude(systemPrompt, history, message)
               → POST https://api.anthropic.com/v1/messages
               → API key server-side only (never sent to browser)
               → returns reply text
         │
         ▼
AiChatController returns { reply, topic, fallback }
         │
         ▼
chatbotController.js → updates messages state
         │
         ▼
ChatbotWidget.jsx re-renders with assistant reply
```

---

## Files Involved

### New Backend Files
| File | Role |
|---|---|
| `controller/AiChatController.java` | REST Controller — `POST /api/ai/chat` |
| `service/AiChatService.java` | Core service: context fetch + system prompt + Claude API call |
| `service/TopicClassifier.java` | Keyword/regex pre-classifier for 12 topics |
| `dto/AiChatRequest.java` | DTO: message + conversation history |

### Modified Backend Files
| File | Change |
|---|---|
| `backend/.env` | Added `ANTHROPIC_API_KEY=sk-ant-replace-me` |
| `application-prod.properties` | Added `anthropic.api.key=${ANTHROPIC_API_KEY}` |

### New Frontend Files
| File | MVC Role |
|---|---|
| `models/chatbotModel.js` | Model — message shapes, constants, fallback, quick prompts |
| `services/chatbotService.js` | Service — POST /api/ai/chat HTTP call |
| `controllers/chatbotController.js` | Controller — state, send handler, history builder |
| `views/components/ChatbotWidget.jsx` | View — floating bubble + chat panel |
| `views/components/ChatbotWidget.css` | View — scoped styles |

### Modified Frontend Files
| File | Change |
|---|---|
| `views/components/ProtectedRoute.jsx` | +3 lines: import + render `<ChatbotWidget />` alongside `<Outlet />` |

---

## API Key Setup

**File:** `backend/.env` — Line 17:
```
ANTHROPIC_API_KEY=sk-ant-replace-me
```
Replace `sk-ant-replace-me` with your real key from https://console.anthropic.com/

---

## Scope Enforcement (Two Layers)

| Layer | Where | Mechanism |
|---|---|---|
| 1 | `TopicClassifier.java` | 12 regex patterns; OUT_OF_SCOPE → immediate FALLBACK, Claude not called |
| 2 | System prompt | Claude instructed with MANDATORY fallback rule for anything outside 12 topics |

### Fallback Trigger Test Cases (all must return fallback)
- "What's the weather today?" ❌ → fallback
- "Can you write my essay for me?" ❌ → fallback
- "What's the university's ranking?" ❌ → fallback
- "Tell me a joke." ❌ → fallback
- "What's the capital of France?" ❌ → fallback
- "Can you help me with my personal relationship problems?" ❌ → fallback
- "What time does the cafeteria close?" ❌ → fallback
- "Who is the university president?" ❌ → fallback

---

## Data Source Coverage

| Topic | Data Source | Coverage |
|---|---|---|
| Course materials | `Assignment.attachmentName` + guidance text | ⚠️ Partial |
| Payment methods | `PaymentRecordRepository` | ✅ Full |
| Advising schedule | `AdvisorRepository`, `StudentProfile.advisingConfirmed` | ✅ Full |
| Credit limits | `StudentProfile.getCourseLimit/getCreditLimit` | ✅ Full |
| Advised courses | `AdvisedCourseRepository` | ✅ Full |
| Assignments | `AssignmentRepository` | ✅ Full |
| Assignment due dates | `Assignment.deadline` | ✅ Full |
| Advisor/faculty email | `Advisor.email` + `AdvisedCourseRepository` | ✅ Full |
| Admin queries | Static procedural guidance | ⚠️ Partial |
| Password change | Static step-by-step instructions | ⚠️ Partial |
| Attendance | `AttendanceRecordRepository` (per-course % calc) | ✅ Full |
| Course seat availability | `CourseSectionRepository` | ✅ Full |

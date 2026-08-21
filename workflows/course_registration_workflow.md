# Course Registration with Real-Time Seat Availability – Workflow

**Feature branch:** `feature/course-registration`
**Status:** Implemented (Phase 2)
**Term:** Fall2026

---

## Overview

Students browse and self-register in specific `CourseSection` records during their advising window. Seat counts update live for all connected users via WebSocket (STOMP/SockJS) without page refresh. All seat changes are atomic and race-condition-safe at the database level.

---

## Sequential Communication Path

```
RegistrationView.jsx
       │  renders & dispatches to
       ▼
useRegistrationController()          ← ./controllers/registrationController.js
       │  calls on mount
       ├──► GET /api/registration/sections      → RegistrationController
       ├──► GET /api/registration/my            → RegistrationController
       ├──► GET /api/registration/window/STU001 → RegistrationController
       │  opens WebSocket
       └──► WS /ws  (SockJS)
                 │  STOMP subscribe
                 └──► /topic/seats/{sectionId}  ← SimpMessagingTemplate (server push)

Student clicks "Register"
       │
       ▼
useRegistrationController.handleRegister(sectionId)
       │  optimistic UI update (decrement seat count locally)
       │
       ▼
POST /api/registration/register  { studentId, sectionId }
       │
       ▼
RegistrationController.register()
       │
       ▼
RegistrationService.registerSection()   ← @Transactional(SERIALIZABLE)
       │
       ├── 1. Load StudentProfile from StudentProfileRepository
       ├── 2. Check advising window (completedCredits → tier)
       ├── 3. Check duplicate via SectionRegistrationRepository
       ├── 4. Check prerequisites (StudentProfile.completedCourses CSV)
       ├── 5. Check credit limit (countByStudentIdAndTerm × 3 + 3 ≤ creditLimit)
       ├── 6. tryBookSeat(sectionId)   ← ATOMIC UPDATE (the race-condition guard)
       │       UPDATE course_section
       │       SET booked = booked + 1
       │       WHERE id = :id AND booked < total_seats
       │       → rowsAffected == 0 → 409 CONFLICT (section full)
       ├── 7. Save SectionRegistration record
       └── 8. broadcastSeatUpdate()
                 │  reads DB authoritative count
                 └──► SimpMessagingTemplate.convertAndSend(
                           "/topic/seats/{sectionId}",
                           { sectionId, seatsRemaining, booked, totalSeats }
                       )
                           │  WebSocket push to all subscribers
                           ▼
               useRegistrationController (all open browser tabs)
                           │  updates sections state
                           ▼
               RegistrationView — seat meter re-renders with live count

Student clicks "Drop"
       │
       ▼
DELETE /api/registration/drop/{studentId}/{sectionId}
       │
       ▼
RegistrationService.dropSection()   ← @Transactional(SERIALIZABLE)
       ├── 1. Find SectionRegistration record
       ├── 2. Delete the record
       ├── 3. tryReleaseSeat(sectionId)   ← ATOMIC UPDATE
       │       UPDATE course_section SET booked = booked - 1 WHERE id = :id AND booked > 0
       └── 4. broadcastSeatUpdate() → WebSocket push
```

---

## Advising Priority Logic

Students are ranked by `completedCredits` descending:

| Tier | Credits | Window    |
|------|---------|-----------|
| 1    | ≥ 60    | Open now  |
| 2    | 30–59   | Open now  |
| 3    | < 30    | Not yet open (Day 3) |

Seeded students and their tiers:

| Student | Credits | Tier | Window  |
|---------|---------|------|---------|
| STU002 – Arham Hossain     | 90 | 1 | Open   |
| STU003 – Nafiz Rahman      | 54 | 2 | Open   |
| STU001 – Eusha Kayenat     | 48 | 2 | Open   |
| STU004 – Sadia Islam       | 18 | 3 | Closed |

---

## Files Involved

### Backend

| File | Role | Action |
|------|------|--------|
| `model/SectionRegistration.java` | Model | NEW |
| `model/StudentProfile.java` | Model | MODIFIED → JPA entity |
| `model/AdvisedCourse.java` | Model | MODIFIED → JPA entity |
| `model/Advisor.java` | Model | MODIFIED → JPA entity |
| `model/CourseSection.java` | Model | MODIFIED → added `prerequisiteCodes` |
| `repository/SectionRegistrationRepository.java` | Repository | NEW |
| `repository/StudentProfileRepository.java` | Repository | NEW |
| `repository/AdvisedCourseRepository.java` | Repository | NEW |
| `repository/AdvisorRepository.java` | Repository | NEW |
| `service/RegistrationService.java` | Service | NEW |
| `service/AdvisorService.java` | Service | MODIFIED → uses JPA repos |
| `controller/RegistrationController.java` | Controller | NEW |
| `controller/AdvisorController.java` | Controller | MODIFIED → uses response maps |
| `config/WebSocketConfig.java` | Config | NEW |
| `config/SecurityConfig.java` | Config | MODIFIED → permit /ws/** |
| `config/CorsConfig.java` | Config | MODIFIED → Upgrade header + /ws/** |
| `pom.xml` | Config | MODIFIED → websocket dependency |
| `resources/data.sql` | Seed | MODIFIED → advisors, students, prereqs |

### Frontend

| File | Role | Action |
|------|------|--------|
| `models/registrationModel.js` | Model | NEW |
| `controllers/registrationController.js` | Controller | NEW |
| `views/pages/RegistrationView.jsx` | View | NEW |
| `views/pages/RegistrationPage.css` | View | NEW |
| `views/components/Sidebar.jsx` | View | MODIFIED → +1 nav item |
| `App.jsx` | Wiring | MODIFIED → +1 route |

---

## Concurrency Guarantee

> **No student can over-enrol a section beyond its `totalSeats` capacity, even under concurrent simultaneous registrations.**

The guard is a single atomic JPQL UPDATE:

```sql
UPDATE course_section
SET booked = booked + 1
WHERE id = :id AND booked < total_seats
```

- PostgreSQL evaluates the `WHERE` clause with an implicit row-level lock
- Under `SERIALIZABLE` isolation, serialisation failures trigger an exception that Spring's `@Transactional` rolls back automatically
- `rowsAffected == 0` → the section was full at commit time → `409 CONFLICT` returned
- The DB-level unique constraint `(student_id, section_id, term)` on `section_registrations` provides a final structural guard against duplicate registrations

---

## WebSocket Topics

| Topic | Payload | Description |
|-------|---------|-------------|
| `/topic/seats/{sectionId}` | `{ sectionId, seatsRemaining, booked, totalSeats }` | Broadcast after every register/drop commit |

---

## Advising DB Migration (Phase 3 upgrade)

The `AdvisorService` was also migrated from in-memory stores to Neon PostgreSQL in this feature:

- `Advisor` → `advisors` table with `advisor_specialties` + `advisor_available_days` join tables
- `StudentProfile` → `student_profiles` table
- `AdvisedCourse` → `advised_courses` table
- All data seeded via `data.sql` (idempotent `WHERE NOT EXISTS` inserts)
- REST API shape is **unchanged** — `AdvisorController` and all frontend files for advising required zero changes

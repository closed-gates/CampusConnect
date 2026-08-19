# Exam Schedule Feature – Workflow

## Business Requirement

Students need to see their upcoming midterm and final exam dates directly on the dashboard, replacing the static "Continue Learning" table. The exam dates must be persisted in the database and dynamically linked to each student's enrolled courses. The Routine Builder page must also show live DB-sourced exam dates instead of hardcoded values.

---

## MVC Communication Flow

### Dashboard – Exam Schedule Widget

```
DashboardView.jsx
  └─▶ renders <ExamScheduleWidget />
        └─▶ useExamScheduleController()                  [Controller]
              ├─ reads studentId from localStorage
              ├─ fetch GET /api/exam-schedule?studentId=  [HTTP]
              │
              └─▶ ExamScheduleController.java             [Backend Controller]
                    └─▶ ExamScheduleService.getExamScheduleForStudent()  [Service]
                          ├─ EnrollmentRepository.findByStudentId()       [Repository]
                          │     └─▶ enrollment table (Neon PostgreSQL)    [Database]
                          ├─ ExamScheduleRepository.findByCourseCodeIn()  [Repository]
                          │     └─▶ exam_schedules table (Neon PostgreSQL)[Database]
                          └─ computes daysLeft, returns List<ExamScheduleDTO>
              │
              └─▶ ExamScheduleWidget renders cards with countdown badges
```

### Routine Builder – Live Exam Dates

```
RoutineView.jsx (CourseInfoBlock)
  └─▶ useRoutineController()                             [Controller]
        ├─ fetch GET /api/courses/sections               [via courseService.js]
        ├─ fetch GET /api/exam-schedule/all              [via courseService.js]
        ├─ builds scheduleMap: { courseCode → ExamScheduleDTO }
        ├─ normaliseSection() merges scheduleMap into each section:
        │     section.examDay    ← formatExamDate(schedule.finalDate)
        │     section.midtermDay ← formatExamDate(schedule.midtermDate)
        └─▶ CourseInfoBlock renders Midterm + Final Exam rows from DB dates
```

### Seed Flow (Backend Startup)

```
Spring Boot startup
  └─▶ ExamScheduleService @PostConstruct seedExamSchedules()
        ├─ check: examRepo.count() == 0 → skip if already seeded
        ├─ CourseSectionRepository.findAll()              [Repository]
        │     └─▶ course_section table                    [Database]
        ├─ group by courseCode, parse CourseSection.examDay string
        ├─ finalDate  = parsed datetime from examDay
        ├─ midtermDate = finalDate - 56 days
        └─ ExamScheduleRepository.saveAll()               [Repository]
              └─▶ exam_schedules table (Neon PostgreSQL)  [Database]
```

---

## Files Involved

### Backend (New Files)
| File | Role |
|------|------|
| `model/ExamSchedule.java` | JPA entity → `exam_schedules` table |
| `repository/ExamScheduleRepository.java` | Data access (findByCourseCode, findByCourseCodeIn) |
| `dto/ExamScheduleDTO.java` | API response shape with pre-computed daysLeft |
| `service/ExamScheduleService.java` | Seed logic + business queries |
| `controller/ExamScheduleController.java` | REST: GET /api/exam-schedule, /all, /{code} |

### Frontend (New Files)
| File | Role |
|------|------|
| `models/examScheduleModel.js` | Constants, pure helpers (getUrgency, formatExamDate, formatDaysLeft) |
| `controllers/examScheduleController.js` | `useExamScheduleController()` hook |
| `views/components/ExamScheduleWidget.jsx` | Dashboard panel (cards + countdown badges) |
| `views/components/ExamScheduleWidget.css` | Dedicated styles, shimmer skeletons, urgency animations |

### Minimal Edits to Shared Files
| File | Change |
|------|--------|
| `views/pages/DashboardView.jsx` | Replaced Continue Learning block with `<ExamScheduleWidget />` |
| `controllers/dashboardController.js` | Removed unused `continueLearning` return value |
| `services/courseService.js` | Added `getExamSchedules()` method + EXAM_API_BASE |
| `controllers/routineController.js` | Parallel-fetches exam schedules, merges into sections |
| `views/pages/RoutineView.jsx` | CourseInfoBlock shows Midterm + Final Exam rows from DB |

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/exam-schedule?studentId=` | Enrolled courses' exam schedule with daysLeft |
| GET | `/api/exam-schedule/all` | All exam schedules (Routine Builder) |
| GET | `/api/exam-schedule/{code}` | Single course by code |

---

## Database

New table auto-created by Hibernate `ddl-auto=update`:

```sql
exam_schedules (
  id           BIGINT PRIMARY KEY AUTO_INCREMENT,
  course_code  VARCHAR(20) UNIQUE NOT NULL,  -- e.g. "CSE110"
  course_name  VARCHAR(255) NOT NULL,         -- e.g. "Programming Language I"
  midterm_date TIMESTAMP NOT NULL,            -- finalDate - 56 days
  final_date   TIMESTAMP NOT NULL             -- parsed from CourseSection.examDay
)
```

Seeded on first startup via `@PostConstruct` (idempotent – count() == 0 guard).

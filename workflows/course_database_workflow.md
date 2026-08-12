# Course Database Workflow

## Feature: BRACU Course Catalog & Routine Builder – Database Integration
**Module Owner:** Ibsan Hossain Ansari (Collaborator 5 – Dashboard & Pre-Registration)
**Related Module:** Afnan Mohammad Hafiz (Collaborator 2 – Course Registration)

---

## Overview

Replaces hardcoded course data in `coursesModel.js` and `routineModel.js`
with live data from the Neon PostgreSQL database.

Real BRACU University courses (CSE, EEE, BBA, Math, English) seed the database
on first run via `data.sql`.

---

## Communication Path

### Course Catalog (Courses Page)
```
CoursesPage (View)
  → useCoursesController (Controller)
    → courseService.getCatalog() (Service)
      → GET /api/courses/catalog (HTTP)
        → CourseController.getCatalog() (Backend Controller)
          → CourseCatalogRepository.findAll() (Repository)
            → course_catalog (Neon PostgreSQL Table)
```

### Routine Builder (Pre-Registration)
```
RoutinePage (View)
  → useRoutineController (Controller)
    → courseService.getSections() (Service)
      → GET /api/courses/sections (HTTP)
        → CourseController.getSections() (Backend Controller)
          → CourseSectionRepository.findAll() (Repository)
            → course_section (Neon PostgreSQL Table)
```

### Enrollment
```
CoursesPage Enroll button (View)
  → useCoursesController.handleEnroll() (Controller)
    → courseService.enroll(studentId, courseId) (Service) [DB persist]
    → localStorage cache update [offline cache]
    → channelService.onEnrollment() [chat channel provision]
      → POST /api/courses/enroll (HTTP)
        → CourseController.enroll() (Backend Controller)
          → EnrollmentRepository.save() (Repository)
            → enrollment (Neon PostgreSQL Table)
```

### Enrollment Sync (on page load)
```
CoursesPage mount (View)
  → useCoursesController useEffect (Controller)
    → courseService.getEnrolledIds(studentId) (Service)
      → GET /api/courses/enrolled?studentId= (HTTP)
        → CourseController.getEnrolledIds() (Backend Controller)
          → EnrollmentRepository.findByStudentId() (Repository)
            → enrollment (Neon PostgreSQL Table)
    → merges DB IDs into localStorage cache
```

---

## Files Involved

### Backend (New)
| File | Role |
|------|------|
| `model/CourseCatalog.java` | JPA entity → `course_catalog` table |
| `model/CourseSection.java` | JPA entity → `course_section` table |
| `model/Enrollment.java` | JPA entity → `enrollment` table |
| `repository/CourseCatalogRepository.java` | Spring Data JPA repo |
| `repository/CourseSectionRepository.java` | Spring Data JPA repo |
| `repository/EnrollmentRepository.java` | Spring Data JPA repo |
| `controller/CourseController.java` | REST API (4 endpoints) |
| `resources/data.sql` | BRACU seed data (45 catalog courses + 70 sections) |

### Backend (Modified)
| File | Change |
|------|--------|
| `pom.xml` | Replaced MySQL driver with PostgreSQL driver |
| `application-prod.properties` | Neon JDBC URL, PostgreSQL dialect, data.sql init |
| `application-dev.properties` | Added data.sql init (H2 compatible) |

### Frontend (New)
| File | Role |
|------|------|
| `services/courseService.js` | API fetch wrapper (4 functions) |

### Frontend (Modified)
| File | Change |
|------|--------|
| `controllers/coursesController.js` | Replaced static COURSES with async API fetch + loading/error state |
| `controllers/routineController.js` | Replaced static STATIC_COURSES with async API fetch + loading/error state |
| `models/coursesModel.js` | Removed COURSES array; kept FACULTIES, YEARS, SEMESTERS |

---

## Database Tables (Neon PostgreSQL)

### `course_catalog`
Stores 45 real BRACU undergraduate courses across CSE, EEE, BBA, Math, English departments.

### `course_section`
Stores 70+ course sections with BRACU's actual scheduling pattern (SUN-TUE, MON-WED, TUE-THU), BRACU room codes (UB40, TARC, SB buildings), and exam schedules.

### `enrollment`
Tracks student–course enrollments with a unique constraint (studentId + courseId).

---

## API Endpoints

| Method | URL | Description |
|--------|-----|-------------|
| GET | `/api/courses/catalog` | All catalog courses |
| GET | `/api/courses/sections?q=` | Sections (optional search) |
| POST | `/api/courses/enroll` | Enroll student (body: {studentId, courseId}) |
| GET | `/api/courses/enrolled?studentId=` | Enrolled course IDs for student |

---

## Running with Neon Database

```powershell
# In backend directory
$env:SPRING_PROFILES_ACTIVE="prod"
$env:SPRING_DATASOURCE_URL="jdbc:postgresql://ep-plain-sky-azj97mzc.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
$env:SPRING_DATASOURCE_USERNAME="neondb_owner"
$env:SPRING_DATASOURCE_PASSWORD="npg_jfVRUzxpoP67"
mvn spring-boot:run
```

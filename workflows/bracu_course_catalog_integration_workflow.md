# BRACU Course Catalog & Sections Full Integration Workflow

## Feature: Complete Official BRAC University Course Catalogue & Section System
**Module:** Course Catalog, Routine Builder, and Pre-Registration  
**Data Sources:** Desktop BRACU Course Catalog datasets (`BRACU_Unique_Courses_564.csv`, `BRACU_All_2298_Sections.csv`, `BRACU_Comprehensive_Course_Catalog.json`, `BRACU_Course_Catalog_By_Department.md`)  
**Scope:** 564 Unique Courses, 2,298 Sections, 11 Schools, 41 Departments, 717 Unique Faculties/Instructors  

---

## Overview

Upgraded the CampusConnect course catalog and routine builder system from a small handcrafted seed dataset to the complete, official BRAC University course directory and section offerings.

Key capabilities introduced:
1. **Comprehensive Course Catalog (564 Courses):** Includes official course codes, titles, credits (supporting fractional credits e.g. 1.5, 4.5), academic degrees, prerequisites, GenEd classifications, total section counts, total capacity/booked seats, and final exam schedules.
2. **All 2,298 Active Course Sections:** Includes official faculty initials/abbreviations, room numbers (e.g. `09A-06C`, `11H-46L`), standard multi-day class schedules (e.g. `SATURDAY(8:00 AM-9:20 AM-07A-05C) ; THURSDAY(8:00 AM-9:20 AM-07A-05C)`), total capacities, booked counts, midterm exam dates, and final exam dates.
3. **11 Schools & 41 Academic Departments:** Fully mapped model system in `coursesModel.js` supporting filtering by university school or academic department.
4. **Enhanced Backend REST APIs:** Filtering by department, school, GenEd status, and multi-field keyword search across course code, title, department, and school.

---

## Sequential Communication Paths

### 1. Course Catalog Browsing & Search
```
CoursesView (View)
  └── useCoursesController (Controller Hook)
        └── courseService.getCatalog() (Frontend Service)
              └── GET /api/courses/catalog?q={query}&dept={dept}&school={school}&genEd={bool} (HTTP)
                    └── CourseController.getCatalog(...) (Spring Web Controller)
                          └── CourseCatalogRepository.searchByKeyword() / findBy...() (Spring Data JPA)
                                └── Neon PostgreSQL: `course_catalog` table (564 rows)
```

### 2. Routine Builder & Section Scheduling
```
RoutineView (View)
  └── useRoutineController (Controller Hook)
        └── courseService.getSections() (Frontend Service)
              └── GET /api/courses/sections?q={query} (HTTP)
                    └── CourseController.getSections(...) (Spring Web Controller)
                          └── CourseSectionRepository.findAllOrderByCodeAndSection() (Spring Data JPA)
                                └── Neon PostgreSQL: `course_section` table (2,298 rows)
```

### 3. School and Department Discovery
```
Frontend UI (Dropdowns / Filter Tabs)
  └── GET /api/courses/schools
  └── GET /api/courses/departments
        └── CourseController.getSchools() / getDepartments() (Spring Web Controller)
              └── CourseCatalogRepository.findDistinctSchools() / findDistinctDepartments() (Spring Data JPA)
                    └── Neon PostgreSQL: `course_catalog` table
```

---

## Files Involved

### Backend
| File | Layer | Description |
|---|---|---|
| `model/CourseCatalog.java` | Model (JPA Entity) | Updated entity schema v2: added `department`, `school`, `isGenEd`, `prerequisites`, `totalSections`, `totalSeats`, `totalBooked`, `finalExamSchedule`, `academicDegree`; credits changed to `Double`. |
| `model/CourseSection.java` | Model (JPA Entity) | Updated entity schema v2: added `credits` (Double), `midtermExam` (String), lengthened `time` and `prerequisiteCodes` to TEXT columns. |
| `repository/CourseCatalogRepository.java` | Repository | Spring Data JPA queries: `findByDepartmentIgnoreCase`, `findBySchoolIgnoreCase`, `findByIsGenEd`, `searchByKeyword`, `findDistinctDepartments`, `findDistinctSchools`. |
| `repository/CourseSectionRepository.java` | Repository | Spring Data JPA queries for fetching and searching sections sorted by course code and section number. |
| `controller/CourseController.java` | Controller | Endpoints: `GET /api/courses/catalog`, `GET /api/courses/departments`, `GET /api/courses/schools`, `GET /api/courses/sections`. |
| `resources/data.sql` | Seed Script | Auto-generated SQL containing TRUNCATE statements and all 564 catalog courses + 2,298 course sections. |

### Frontend
| File | Layer | Description |
|---|---|---|
| `models/coursesModel.js` | Model | Defines all 11 BRACU `SCHOOLS` (with colors, icons, short labels, values), 41 `DEPARTMENTS`, and backward-compatible `FACULTIES` alias. |
| `models/routineModel.js` | Model | Defines standard `TIME_SLOTS`, `DAYS`, `DAY_ABBREVIATIONS`, `ROUTINE_GRID_DAYS`, and `EMPTY_SECTION` template. Exports fallback `STATIC_COURSES = []`. |
| `controllers/coursesController.js` | Controller Hook | Normalises DB catalog data, performs client-side filtering by school value, department, semester, year, and multi-field keyword search. |
| `controllers/routineController.js` | Controller Hook | Parses BRACU's multi-day class schedules `DAY(TIME-ROOM) ; DAY(TIME-ROOM)`, maps time slots, detects schedule conflicts, computes credit totals. |
| `views/pages/CoursesView.jsx` | View | Renders search bar, school filter pills with short labels, course cards showing credits, department, sections count, GenEd badge, prerequisite summary, seat bars, and details modal. |

---

## Database Schemas (Neon PostgreSQL)

### `course_catalog` Table
```sql
CREATE TABLE course_catalog (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(20) NOT NULL,
    name VARCHAR(255) NOT NULL,
    faculty_id VARCHAR(20),
    credits DOUBLE PRECISION NOT NULL,
    academic_year INT,
    semester VARCHAR(20),
    instructor VARCHAR(255),
    enrolled INT,
    capacity INT,
    rating DOUBLE PRECISION,
    tags VARCHAR(200),
    description TEXT,
    department VARCHAR(150),
    school VARCHAR(200),
    is_gen_ed BOOLEAN,
    prerequisites TEXT,
    total_sections INT,
    total_seats INT,
    total_booked INT,
    final_exam_schedule VARCHAR(100),
    academic_degree VARCHAR(30)
);
```

### `course_section` Table
```sql
CREATE TABLE course_section (
    id VARCHAR(30) PRIMARY KEY,
    code VARCHAR(20) NOT NULL,
    section VARCHAR(5) NOT NULL,
    title VARCHAR(255) NOT NULL,
    faculty VARCHAR(255) NOT NULL,
    time TEXT NOT NULL,
    room VARCHAR(30) NOT NULL,
    exam_day VARCHAR(255),
    total_seats INT NOT NULL,
    booked INT NOT NULL,
    prerequisite_codes TEXT,
    credits DOUBLE PRECISION,
    midterm_exam VARCHAR(100)
);
```

---

## Verification & Testing

1. **Backend Build:** `mvn compile` compiled successfully with 0 errors.
2. **Frontend Build:** `npm run build` bundled client assets successfully with 0 errors via Vite.
3. **Data Integrity:** Generated `data.sql` with 564 unique courses and 2,298 course sections verified against desktop source files.

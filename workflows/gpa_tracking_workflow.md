# GPA Tracking & Calculator – Feature Workflow

## User Story / Business Requirement

A student needs to:
1. **View** their complete academic transcript (all completed courses, per-semester GPA, running CGPA).
2. **Simulate** what their CGPA would be if their current semester's predicted grades come true.
3. **Simulate** how retaking a completed course with a better grade would affect their CGPA.

All calculations are simulations only — no data is written to any real academic record.

This feature is **student-only**. Faculty and Admin do not have access.

---

## Confirmed Policies

| Policy | Value |
|---|---|
| Grading scale | 4.0 scale (A+/A=4.0, A-=3.7, B+=3.3, B=3.0, B-=2.7, C+=2.3, C=2.0, D=1.0, F=0.0) |
| Non-GPA courses | WAIVED / null gradePoint / grade "P" → excluded from GPA computation |
| Zero-credit courses | Excluded by formula (0 × gradePoint = 0 quality points, 0 graded credits) |
| Retake policy | **Grade Replacement** — hypothetical new grade fully replaces the old one |
| Server-side restriction | `@PreAuthorize("hasRole('STUDENT')")` — JwtAuthFilter sets ROLE_STUDENT |
| Student ID source | JWT `sub` claim (never from request param — prevents spoofing) |

---

## Sequential Communication Flow

### Transcript Tab

```
[GpaView] User opens /gpa-calculator
    ↓ calls useGpaController()
[gpaController] useEffect → gpaService.getTranscript()
    ↓ HTTP GET /api/student/gpa/transcript (Bearer JWT)
[GpaController] @PreAuthorize("hasRole('STUDENT')") validates JWT role
    ↓ auth.getName() extracts studentId from JWT subject
[GpaService.getTranscript(studentId)]
    ↓ StudentCompletedCourseRepository.findByStudentId()
    ↓ StudentProfileRepository.findById()
    ↓ Groups courses by semester, computes per-semester GPA + running CGPA
    ↓ Returns structured response map
[GpaController] ResponseEntity.ok(result)
    ↓ HTTP 200 JSON
[gpaController] setTranscript(data)
[GpaView] Renders semester blocks, grade chips, summary cards
```

### Predict Future CGPA Tab

```
[GpaView] User selects tab "Predict" → handleTabChange('predict')
[gpaController] Calls gpaService.getCurrentCourses() (on first open)
    ↓ HTTP GET /api/student/gpa/current-courses
[GpaController] @PreAuthorize("hasRole('STUDENT')")
[GpaService.getCurrentCourses()] → StudentProfileRepository → advisedCourses
    ↓ Returns advised course list for pre-population
[GpaView] Pre-fills predict rows with current courses
[GpaView] User selects predicted grades per course
[GpaView] User clicks "Calculate Predicted CGPA"
    ↓ handlePredict()
[gpaController] gpaService.predictCgpa(payload)
    ↓ HTTP POST /api/student/gpa/predict { courses: [...] }
[GpaController] @PreAuthorize("hasRole('STUDENT')")
[GpaService.predictCgpa()] → completedCourseRepo.findByStudentId()
    ↓ Computes existingQP + existingCredits from DB
    ↓ Adds predicted course quality points (pure math, NO DB write)
    ↓ Returns { predictedSemGpa, predictedCgpa, breakdown, simulated: true }
[GpaView] Renders results clearly labeled "⚠️ ESTIMATED — NOT OFFICIAL"
```

### Simulate Retake Tab

```
[GpaView] User selects course from dropdown + new hypothetical grade
[GpaView] User clicks "Simulate"
    ↓ handleSimulateRetake()
[gpaController] gpaService.simulateRetake({ courseCode, newGrade })
    ↓ HTTP POST /api/student/gpa/simulate-retake
[GpaController] @PreAuthorize("hasRole('STUDENT')")
[GpaService.simulateRetake()] → completedCourseRepo.findByStudentId()
    ↓ Finds target course record
    ↓ Calculates beforeCgpa from existing records
    ↓ Applies grade replacement: removes old QP, adds new QP (NO DB write)
    ↓ Returns { beforeCgpa, afterCgpa, cgpaChange, improved, simulated: true, retakePolicy: "GRADE_REPLACEMENT" }
[GpaView] Renders before/after comparison card with delta badge
[GpaView] Shows "⚠️ SIMULATED — NOT OFFICIAL" + "Policy: Grade Replacement" badges
```

---

## CGPA Formula

```
CGPA = Σ(gradePoint × creditHours) / Σ(creditHours)

Where:
  - Only gradePoint-bearing courses (A+/A/A-/B+/B/B-/C+/C/D/F) count
  - WAIVED, P (Pass), and null-gradePoint courses are excluded
  - Zero-credit courses are excluded naturally (contribute 0 quality points)
```

---

## Files Involved

### Backend (New Files)
| File | Role |
|---|---|
| `backend/.../dto/GpaPredictRequest.java` | DTO — predict request body |
| `backend/.../dto/GpaRetakeRequest.java` | DTO — retake simulation request body |
| `backend/.../service/GpaService.java` | Service — all GPA business logic |
| `backend/.../controller/GpaController.java` | Controller — REST endpoints + role restriction |
| `backend/src/test/.../GpaServiceTest.java` | Unit tests — GPA math edge cases |

### Frontend (New Files)
| File | Role |
|---|---|
| `frontend/src/models/gpaModel.js` | Model — grading scale, pure GPA math, initial state shapes |
| `frontend/src/services/gpaService.js` | Service — API calls via apiClient |
| `frontend/src/controllers/gpaController.js` | Controller — custom hook, all state + handlers |
| `frontend/src/views/pages/GpaView.jsx` | View — three-tab page component |
| `frontend/src/views/pages/GpaView.css` | Styles — scoped CSS using design system tokens |

### Modified Files (minimal changes only)
| File | Change |
|---|---|
| `frontend/src/views/components/Sidebar.jsx` | Added student-only "Calculate GPA" nav item + `GpaIcon` SVG |
| `frontend/src/App.jsx` | Added `GpaView` import + `/gpa-calculator` route |

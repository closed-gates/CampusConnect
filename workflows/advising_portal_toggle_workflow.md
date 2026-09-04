# Advising Portal Toggle Feature Workflow

## Overview
This feature allows the **Admin** to globally open or close the student advising portal from the Admin Advising sidebar. When closed, students cannot self-register for any courses; only admin force-enrolment continues to work.

## Sequential Communication Path

```
Admin (View)
  └─> PortalControlPanel (View Component)
        └─> useAdminAdvisingController (Controller Hook)
              └─> adminAdvisingService.js (Service)
                    └─> POST /api/admin/advising-portal/toggle (Backend API)
                          └─> AdminAdvisingController.java (Controller)
                                └─> AdminAdvisingService.java (Service)
                                      └─> AdvisingPortalStatusRepository.java (Repository)
                                            └─> advising_portal_status (PostgreSQL Table)
```

For students reading portal status:
```
StudentPanel (View)
  └─> adminAdvisingService.getPortalStatus() (Service)
        └─> GET /api/admin/advising-portal/status (Backend API)
              └─> AdminAdvisingController.java
                    └─> AdminAdvisingService.getAdvisingPortalStatus()
                          └─> AdvisingPortalStatusRepository
```

For registration enforcement:
```
Student (registers a section)
  └─> RegistrationService.registerSection() (Backend)
        └─> portalStatusRepo.findById(1L) ← BLOCKED if isOpen = false
```

## Files Involved

### Backend (New Files)
| File | Role |
|------|------|
| `backend/src/main/java/com/campusconnect/backend/model/AdvisingPortalStatus.java` | Model – singleton JPA entity (id=1) |
| `backend/src/main/java/com/campusconnect/backend/repository/AdvisingPortalStatusRepository.java` | Repository – JpaRepository<AdvisingPortalStatus, Long> |

### Backend (Modified Files)
| File | Change |
|------|--------|
| `AdminAdvisingService.java` | Added `portalStatusRepo`, `getAdvisingPortalStatus()`, `setAdvisingPortalStatus()`, auto-seeds row in `@PostConstruct` |
| `AdminAdvisingController.java` | Added `GET /api/admin/advising-portal/status` and `POST /api/admin/advising-portal/toggle` |
| `RegistrationService.java` | Added portal-closed guard block before advising window check in `registerSection()` |

### Frontend (Modified Files)
| File | Change |
|------|--------|
| `services/adminAdvisingService.js` | Added `getPortalStatus()` and `setPortalStatus()` methods |
| `controllers/adminAdvisingController.js` | Added portal toggle state and `handleTogglePortal()` handler |
| `views/pages/AdvisingView.jsx` | Added **Portal Control** tab in `AdminAdvisingPanel`, `PortalControlPanel` sub-component, and student-facing closed banner in `StudentPanel` |

## Feature Details

### Admin Experience (`AdvisingView.jsx` → `AdminAdvisingPanel`)
1. A new **"🟢 Portal Control"** tab appears as the **first and default** tab in the Admin Advising panel
2. A live status indicator (green/red dot) on the tab button shows current state
3. `PortalControlPanel` displays:
   - A large status banner with gradient coloring (green = open, red = closed)
   - Last updated by & timestamp
   - Custom message textarea for a student notice
   - **🟢 Open Portal** / **🔴 Close Portal** action buttons
   - Informational "How this works" section

### Student Experience (`StudentPanel`)
- On load, `StudentPanel` calls `adminAdvisingService.getPortalStatus()`
- If portal is **closed**, a red alert banner is shown with the admin's custom message
- Registration attempts via `RegistrationService` are blocked server-side with HTTP 200 `success: false`

### Data Persistence
- `AdvisingPortalStatus` table has a **single row** (id = 1)
- Auto-seeded to `isOpen = true` on first backend startup via `@PostConstruct`
- Changes persist across server restarts

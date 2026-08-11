# Club Recruitment Workflow

This document describes the workflow for the Club Activities and Recruitment feature in CampusConnect.

## 1. User Story / Requirement
- **Admin Users:** Can view, post new notices, and post new recruitment listings for clubs.
- **Student Users:** Can view club notices, view active recruitment listings, and apply to recruitment listings through a rich 7-step multi-step form.
- **Form Steps:** Welcome ➔ Personal Info ➔ Interests ➔ Skills ➔ Availability ➔ Final Question ➔ Confirmation.

---

## 2. Sequential Data & Logic Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as Student/Admin
    participant View as View (ClubActivitiesView)
    participant Ctrl as Controller (clubController)
    participant Model as Model (clubModel)
    participant API as Backend (ClubController / ClubService)

    %% Admin: Post Notice / Recruitment Flow
    Note over User, View: --- Admin: Post Notice / Recruitment Flow ---
    User->>View: Enter details (Notice or Recruitment Form)
    View->>Ctrl: Submit form (handlePostNotice / handlePostRecruitment)
    Ctrl->>API: POST /api/clubs/notices OR /api/clubs/recruitment
    API->>Ctrl: Return posted entity (success status)
    Ctrl->>Ctrl: Update notices/recruitments state & trigger toast
    Ctrl->>View: Re-render updated dashboard lists

    %% Student: Multi-step Application Flow
    Note over User, View: --- Student: Multi-step Application Flow ---
    User->>View: Click "Apply Now" on a recruitment card
    View->>Ctrl: Call openApplyModal(recruitment)
    Ctrl->>Ctrl: Reset applyForm to EMPTY_RECRUITMENT_FORM, set step = 0
    Ctrl->>View: Render modal overlay with step content
    loop For Each Step (0 to 5)
        User->>View: Input step fields (Personal/Interests/Skills/Availability)
        View->>Ctrl: Call updateApplyField / toggleApplyArrayField
        User->>View: Click "Next"
        View->>Ctrl: Call nextStep()
        Ctrl->>Ctrl: Run validateStep(step)
        alt hasErrors
            Ctrl->>View: Show step validation errors
        else isValid
            Ctrl->>View: Advance to next step (step = step + 1)
        end
    end
    User->>View: Click "Submit Application" (Step 5)
    View->>Ctrl: Call handleApply()
    Ctrl->>Ctrl: Run final validateStep()
    Ctrl->>API: POST /api/clubs/apply (application payload)
    API->>Ctrl: Return application response (success)
    Ctrl->>Ctrl: Advance step = 6 (Confirmation), trigger toast
    Ctrl->>View: Render confirmation view with bounce animation
    User->>View: Click "Close"
    View->>Ctrl: Call closeApplyModal()
    Ctrl->>View: Close overlay and return to main lists
```

### Detailed Steps:
1. **Model Initialization:**
   - Constants, step mappings, form dropdown selections, and default values are defined in `clubModel.js` (e.g. `RECRUITMENT_FORM_STEPS`, `EMPTY_RECRUITMENT_FORM`, `TEAM_OPTIONS`).
2. **Tab Navigation:**
   - `ClubActivitiesView.jsx` renders tabs for "Notices" and "Recruitments" based on `activeTab` from `useClubController()`.
3. **Posting notices/recruitments (Admin):**
   - In the admin form panel, input changes update `noticeForm` or `recruitForm` in the controller.
   - On submitting, `handlePostNotice` or `handlePostRecruitment` is fired, making an HTTP POST request to the backend. The backend `ClubController.java` maps the request, hands it to `ClubService.java`, and returns the newly saved object.
   - The frontend controller updates local state arrays (`notices` / `recruitments`) and triggers a toast notification.
4. **Applying to Recruitment (Student):**
   - Click "Apply Now" launches `openApplyModal(rec)`.
   - The controller sets `applyTarget` and resets step indices and errors.
   - The user proceeds through the overlay. Each page validates inputs via `validateStep()`.
   - On the final step, the controller sends `applyForm` via `handleApply()`.
   - The backend `/api/clubs/apply` receives the payload, registers the application, and returns success.
   - The controller moves to step 6 (Confirmation) showing success details.

---

## 3. Files Involved

### Frontend (React MVC)
- **Model:** [clubModel.js](file:///e:/CampusConnect/CampusConnect/frontend/src/models/clubModel.js) — Defines seed data, step configurations, and dropdown options.
- **Controller:** [clubController.js](file:///e:/CampusConnect/CampusConnect/frontend/src/controllers/clubController.js) — Exports `useClubController()` hook managing admin forms and student application wizard state.
- **Views:**
  - [ClubActivitiesView.jsx](file:///e:/CampusConnect/CampusConnect/frontend/src/views/pages/ClubActivitiesView.jsx) — Displays notices, recruitments, admin panels, and the multi-step application overlay.
  - [ClubActivitiesPage.css](file:///e:/CampusConnect/CampusConnect/frontend/src/views/pages/ClubActivitiesPage.css) — Custom styles for tabs, form controls, progress bars, and animations.

### Backend (Spring Boot MVC)
- **Model & Entities:**
  - `backend/.../model/ClubNotice.java` — Entity representing a notice.
  - `backend/.../model/Recruitment.java` — Entity representing a recruitment slot.
  - `backend/.../model/Application.java` — Entity representing a student application.
- **Service:** `backend/.../service/ClubService.java` — Manages in-memory database store (Phase 2) / repository interactions.
- **Controller:** [ClubController.java](file:///e:/CampusConnect/CampusConnect/backend/src/main/java/com/campusconnect/backend/controller/ClubController.java) — Exposes API endpoints for retrieving notices/recruitments and posting data.

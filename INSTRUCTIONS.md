# CampusConnect – Mandatory Developer Instructions

> [!IMPORTANT]
> **CRITICAL REQUIREMENT:** Every AI assistant or developer working on CampusConnect **MUST** read, understand, and strictly follow these instructions before starting any task.

---

## 1. Architecture: Strict MVC (Model-View-Controller)

This project strictly adheres to the MVC architecture on both the **Frontend** and the **Backend**. Under no circumstances should logic layers be combined.

### ── Frontend (React + Vite) ──
The frontend is split into three distinct directories under `frontend/src/`:
1. **Model (`frontend/src/models/`)**:
   - Contains pure JavaScript modules.
   - Defines initial state structures, constants, data schemas, helper functions, and static/seeded mock data.
   - **Rule:** No React UI code (no JSX), no state management hooks (e.g., `useState`, `useEffect`), and no styling.
2. **Controller (`frontend/src/controllers/`)**:
   - Implemented as custom React hooks (e.g., `useFeatureController`).
   - Manages state, handles API fetch requests, defines event handlers, and performs validations.
   - **Rule:** Returns state variables and action handlers to be consumed by the view. No visual JSX elements or CSS styling should exist here.
3. **View (`frontend/src/views/`)**:
   - Contains page wrappers (`views/pages/`) and components (`views/components/`).
   - Renders the visual layout using semantic HTML, JSX, and CSS files.
   - **Rule:** Views are entirely driven by the controller hooks. They must **not** contain independent state management, API fetches, or business logic. They simply consume the returned values/methods from their corresponding controller hook.

### ── Backend (Spring Boot) ──
The backend is structured into packages under `backend/src/main/java/com/campusconnect/backend/`:
1. **Model & DTO (`backend/.../model/` and `backend/.../dto/`)**:
   - Entities mapping database tables (Model) and Data Transfer Objects for JSON payloads (DTO).
2. **Repository (`backend/.../repository/`)**:
   - Interfaces extending `JpaRepository` for direct database communication.
3. **Service (`backend/.../service/`)**:
   - Contains business logic, calculations, and orchestration.
4. **Controller (`backend/.../controller/`)**:
   - RestControllers providing HTTP endpoints. Maps incoming requests and delegates payload validation and execution to the Service layer.

---

## 2. Technology Stack Constraints

- **Backend Framework:** Spring Boot 3.3.2 (Java 17).
- **Frontend Framework:** React (Vite).
- **Styling:** Vanilla CSS. Do **not** use TailwindCSS or utility-first frameworks. Write custom classes using the established design system tokens in `frontend/src/index.css`.
- **Database:** JPA / Hibernate with H2 (development in-memory) and MySQL (production).

---

## 3. Strict Feature Isolation Rule

To prevent regressions, maintain codebase stability, and support parallel development:

> [!WARNING]
> While working on a new feature, you must **NEVER** modify or delete any existing feature's code.

### Guidelines:
- Implement the new feature in entirely **new files** (new model, controller, view, service, and repository).
- All changes must be fully self-contained within your feature's package or files.
- The **ONLY** exception is minimal registration code (e.g., adding a route in `App.jsx`, or registering a navbar item in `Sidebar.jsx`). These integrations must be kept to the absolute minimum necessary lines and must not alter the behaviour of existing routes or links.

---

## 4. Feature Workflows Requirement

Every feature must have an accompanying workflow document detailing how the MVC components communicate with each other.

- **Storage Location:** All workflows must be saved in the `workflows/` directory in the repository root.
- **Organization:** Each feature's workflow must be saved in a **separate markdown file** named `workflows/feature_name_workflow.md`.
- **Content Requirements:**
  - Brief user story or business requirement.
  - Sequential communication flow (Step 1, Step 2, Step 3) tracing user actions from the **View** ➔ **Controller** ➔ **Model / Backend API** ➔ **Backend Service** ➔ **Database** and back.
  - List of all files implementing this specific workflow.

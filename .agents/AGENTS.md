# CampusConnect Project Custom Rules

You are working on the **CampusConnect** (Unified University Portal) project. Before starting any task, you must read and adhere to the project rules defined below and in [INSTRUCTIONS.md](file:///e:/CampusConnect/CampusConnect/INSTRUCTIONS.md).

## Core Rules

1. **Architecture: Strict MVC**
   - The whole project MUST follow the MVC (Model-View-Controller) architecture.
   - **Frontend (React + Vite):**
     - Models live in `frontend/src/models/` (pure JS, define schemas, static/seed data, initial state shapes; no JSX, hooks, or styles).
     - Controllers live in `frontend/src/controllers/` (custom React hooks managing state, handlers, fetch logic; no JSX).
     - Views live in `frontend/src/views/` (functional components in `views/pages/` or `views/components/` driven by controller hooks; no independent state or logic).
   - **Backend (Spring Boot):**
     - Structured under `backend/.../`: `model`/`dto`, `repository`, `service`, and `controller`.

2. **Backend Tech Stack**
   - Use Spring Boot 3.3.2 (Java 17) for the backend.

3. **Strict Feature Isolation**
   - While working on a new feature, **NEVER** touch or modify any existing feature's code.
   - All new features must be implemented in their own new model, controller, view, service, and repository files.
   - Integration in shared files (e.g. `App.jsx`, `Sidebar.jsx`) must be kept to the absolute minimum necessary lines and must not alter existing functionality.

4. **Workflow Documentation**
   - You must document the workflow for every new feature you build.
   - Save the feature workflow in its own markdown file inside the `workflows/` directory in the repository root (e.g., `workflows/feature_name_workflow.md`).
   - The workflow file must outline the sequential communication path (View ➔ Controller ➔ Model/API ➔ Service ➔ Database) and list all files involved.

Refer to [INSTRUCTIONS.md](file:///e:/CampusConnect/CampusConnect/INSTRUCTIONS.md) for more details.

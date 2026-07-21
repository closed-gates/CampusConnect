# Rules and Development Guidelines

## 1. Purpose

This document defines the development rules and coding standards for the
**Unified University Portal** project. These rules ensure that every
team member follows a consistent workflow, writes maintainable code, and
collaborates efficiently throughout the development process.

## 2. General Development Rules

-   All code must be committed to the project's Git repository.
-   Every feature should be developed in its own branch before being
    merged into the main branch.
-   Commit messages should be short, meaningful, and descriptive.
-   Developers should pull the latest changes before starting new work.
-   Code should be reviewed before merging into the main branch.
-   Do not push incomplete or broken code to the main branch.
-   Keep the codebase clean, organized, and easy to understand.

## 3. Git Branching Rules

``` text
main
│
├── frontend
├── backend
├── feature/rbac
├── feature/faculty-directory
├── feature/attendance
├── feature/club-module
└── feature/notification-settings
```

### Branch Guidelines

**main** - Contains stable production-ready code only.

**frontend** - Used for frontend development.

**backend** - Used for backend development.

**feature/** - Each new feature should have its own branch. - Merge only
after testing and review.

## 4. Coding Standards

### General

-   Write clean and readable code.
-   Use meaningful variable and function names.
-   Avoid unnecessary code duplication.
-   Follow consistent formatting and indentation.
-   Remove unused variables and imports.
-   Add comments only when necessary to explain complex logic.

### React (Frontend)

-   Use functional components.
-   Use React Hooks.
-   Organize components into reusable modules.
-   Keep components small and focused on a single responsibility.
-   Separate UI from business logic whenever possible.

### Spring Boot (Backend)

-   Follow REST API best practices.
-   Keep controllers lightweight.
-   Place business logic inside service classes.
-   Use repository classes only for database operations.
-   Validate all incoming requests.
-   Return meaningful HTTP status codes.
-   Use centralized exception handling.

### SQL

-   Use proper table relationships.
-   Normalize data where appropriate.
-   Avoid duplicate data.
-   Use foreign keys where necessary.
-   Write optimized queries.
-   Never expose database credentials.

## 5. Folder Structure

### Frontend

``` text
frontend/
└── src/
    ├── components/
    ├── pages/
    ├── layouts/
    ├── hooks/
    ├── services/
    ├── context/
    ├── assets/
    ├── styles/
    └── App.jsx
```

### Backend

``` text
backend/
├── controller/
├── service/
├── repository/
├── model/
├── dto/
├── config/
├── security/
├── exception/
└── Application.java
```

## 6. Naming Conventions

### Variables

Use meaningful camelCase names.

Examples: - studentName - facultyEmail - attendanceRecord -
notificationSettings

### Classes

Use PascalCase.

Examples: - StudentController - AttendanceService - FacultyRepository -
NotificationSettings

### API Endpoints

Use lowercase with plural nouns.

Examples: - `/api/students` - `/api/faculties` - `/api/attendance` -
`/api/notices` - `/api/clubs`

## 7. API Development Rules

-   Use RESTful API principles.
-   Return JSON responses.
-   Validate every request before processing.
-   Use appropriate HTTP methods.

  Method   Purpose
  -------- -----------------------
  GET      Retrieve data
  POST     Create data
  PUT      Update data
  PATCH    Partially update data
  DELETE   Remove data

## 8. Security Rules

-   Require authentication for protected resources.
-   Enforce Role-Based Access Control (RBAC).
-   Hash passwords securely.
-   Never expose sensitive information in API responses.
-   Validate and sanitize user input.
-   Use HTTPS in production.

## 9. Database Rules

-   Every table must have a primary key.
-   Use foreign keys to maintain relationships.
-   Prevent duplicate records where appropriate.
-   Keep naming conventions consistent.
-   Avoid redundant data.

## 10. UI/UX Rules

-   Follow a minimalist design.
-   Predominantly white background.
-   Use blue only for highlights, buttons, links, and borders.
-   Maintain consistent typography and spacing.
-   Ensure responsive layouts.

## 11. Testing Rules

Before merging any feature:

-   Test all new functionality.
-   Ensure existing features still work.
-   Test different user roles.
-   Handle invalid input gracefully.
-   Verify responsiveness.

## 12. Documentation Rules

-   Update the PRD when requirements change.
-   Update architecture documentation when the design changes.
-   Document new APIs.
-   Keep the README up to date.

## 13. Team Collaboration Rules

-   Communicate major development changes.
-   Do not modify another member's assigned feature without discussion.
-   Review pull requests before approval.
-   Resolve merge conflicts carefully.

## 14. Future Development Guidelines

-   Reuse existing components whenever possible.
-   Avoid duplicate functionality.
-   Follow the established project structure.
-   Ensure new features respect the RBAC system.
-   Update documentation after implementation.

## 15. Rule Summary

-   Write clean, maintainable code.
-   Keep the project modular.
-   Follow coding standards.
-   Maintain security and data integrity.
-   Test before merging.
-   Document important changes.
-   Collaborate respectfully.

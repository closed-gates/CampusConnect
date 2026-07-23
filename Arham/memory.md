# Project Memory

> This file acts as the project's working memory. Update it after every
> major development session. AI assistants should read this file first
> before reading the other documentation files.

------------------------------------------------------------------------

# Project Information

**Project Name:** Unified University Portal (CampusConnect)

**Current Version:** v0.2

**Frontend:** React.js

**Backend:** Spring Boot 3.3.2 / Java 17

**Database:** H2 (dev) / MySQL (prod)

**Build Tool:** Maven

------------------------------------------------------------------------

# Documentation Status

  Document          Status
  ----------------- --------------
  prd.md            ✅ Completed
  architecture.md   ✅ Completed
  rules.md          ✅ Completed
  phases.md         ✅ Completed
  design.md         ✅ Completed
  memory.md         🟡 Active

------------------------------------------------------------------------

# Current Development Phase

**Phase:** Phase 1 – Project Setup ✅ COMPLETED

**Current Focus:** Phase 1 done. Ready to begin Phase 2 (Authentication & RBAC).

**Next Phase:** Phase 2 – Authentication & Role-Based Access Control (RBAC).

------------------------------------------------------------------------

# Completed Features

## Documentation

- ✅ Product Requirements Document
- ✅ Architecture Document
- ✅ Rules Document
- ✅ Design Guidelines
- ✅ Development Phases

## Backend – Phase 1 (Project Setup)

- ✅ `pom.xml` — Maven project with all dependencies (Spring Web, Data JPA,
  Security, MySQL, H2, Lombok, Validation, JWT)
- ✅ `BackendApplication.java` — Spring Boot entry point
- ✅ `application.properties` — Profile selector (dev / prod)
- ✅ `application-dev.properties` — H2 in-memory DB, H2 console enabled
- ✅ `application-prod.properties` — MySQL placeholder, env vars
- ✅ Full package skeleton created with `package-info.java` in each:
  - `controller/`, `service/`, `repository/`, `model/`,
  - `dto/`, `config/`, `security/`, `exception/`
- ✅ `HealthController.java` — `GET /api/health` public endpoint
- ✅ `CorsConfig.java` — CORS for React dev server (ports 3000 & 5173)
- ✅ `SecurityConfig.java` — Phase 1 stub (permit all; TODO Phase 2 RBAC)
- ✅ `GlobalExceptionHandler.java` — Centralized `@RestControllerAdvice`
- ✅ `ResourceNotFoundException.java` — 404 exception
- ✅ `UnauthorizedException.java` — 401 exception
- ✅ `ForbiddenException.java` — 403 exception
- ✅ `BackendApplicationTests.java` — Context load test
- ✅ `backend/README.md` — Setup and usage documentation

## Frontend

- ⏳ Not Started

## Database

- ✅ H2 in-memory configured (dev)
- ⏳ MySQL schema (Phase 2+)

------------------------------------------------------------------------

# Assigned Backend Features

  Feature                              Status
  ------------------------------------ ----------------
  Role-Based Access Control (RBAC)     ⏳ Phase 2
  Faculty & Staff Directory            ⏳ Phase 3
  Club Recruitment & Notices           ⏳ Phase 4
  Notification & Account Preferences   ⏳ Phase 5
  Faculty Attendance Tracking          ⏳ Phase 6

------------------------------------------------------------------------

# Current Working File

**Current File:** None (Phase 1 complete)

**Current Task:** Begin Phase 2 – Authentication & RBAC

------------------------------------------------------------------------

# Next Immediate Tasks (Phase 2)

- Design User and Role database tables (JPA entities)
- Implement JWT token generation and validation (JwtService)
- Create JwtAuthFilter (intercepts requests, validates Bearer token)
- Implement UserDetailsServiceImpl (loads user from DB)
- Create login endpoint: `POST /api/auth/login`
- Create register endpoint: `POST /api/auth/register`
- Replace SecurityConfig stub with full filter chain
- Test all four roles: STUDENT, FACULTY, STAFF, ADMINISTRATOR
- Restrict endpoints by role using `@PreAuthorize`

------------------------------------------------------------------------

# Important Decisions

## UI

- Minimalist design
- White-first color palette (#FFFFFF, #F8F9FA)
- Blue accent color (#2563EB)
- Rounded corners on all components
- Card-based layout

## Technology Stack

- Frontend: React.js
- Backend: Spring Boot 3.3.2 / Java 17
- Database: H2 (dev) / MySQL (prod)
- Architecture: Three-tier (React → Spring Boot → SQL)
- Auth: JWT (Phase 2)

## Security Strategy

- JWT-based stateless authentication
- RBAC via Spring Security `@PreAuthorize`
- Password hashing with BCrypt
- CORS configured for localhost:3000 (dev)

## Package Structure

Follows `rules.md` Section 5:
- `controller/` → REST handlers
- `service/` → Business logic
- `repository/` → JPA data access
- `model/` → JPA entities
- `dto/` → Request/Response objects
- `config/` → Spring config beans
- `security/` → JWT, filters, UserDetails
- `exception/` → Custom exceptions + handler

------------------------------------------------------------------------

# Project Folder Status

## Arham/ (backend only)

- ✅ `backend/pom.xml`
- ✅ `backend/README.md`
- ✅ `backend/src/main/java/com/campusconnect/backend/BackendApplication.java`
- ✅ `backend/src/main/resources/application.properties`
- ✅ `backend/src/main/resources/application-dev.properties`
- ✅ `backend/src/main/resources/application-prod.properties`
- ✅ All 8 packages with `package-info.java`
- ✅ `controller/HealthController.java`
- ✅ `config/CorsConfig.java`
- ✅ `config/SecurityConfig.java` (Phase 1 stub)
- ✅ `exception/GlobalExceptionHandler.java`
- ✅ `exception/ResourceNotFoundException.java`
- ✅ `exception/UnauthorizedException.java`
- ✅ `exception/ForbiddenException.java`
- ✅ `test/.../BackendApplicationTests.java`

## Frontend

- ⏳ Not Started

------------------------------------------------------------------------

# Pending Tasks

## High Priority (Phase 2)

- JWT implementation
- User & Role entities
- Login / Register endpoints
- Spring Security filter chain with RBAC

## Medium Priority (Phase 3–6)

- Faculty Directory
- Club Recruitment
- Notification Settings
- Attendance Module

## Low Priority

- Optimization
- API documentation (Swagger)
- Code cleanup

------------------------------------------------------------------------

# Known Issues

None.

------------------------------------------------------------------------

# Blockers

None.

------------------------------------------------------------------------

# Session Notes

## Session 1

Completed: PRD, Architecture, Rules, Design, Development Phases, Memory document.

## Session 2

Completed Phase 1 – Project Setup:
- Full Spring Boot Maven project created in `Arham/backend/`
- H2 in-memory DB configured for zero-setup local development
- MySQL prod profile placeholder created
- Package skeleton established matching rules.md
- Health-check endpoint operational at `GET /api/health`
- CORS configured for React frontend dev server
- Global exception handler + custom exceptions added
- Phase 1 Spring Security stub added (all requests permitted temporarily)
- Backend README written with full setup instructions

------------------------------------------------------------------------

# Change Log

## v0.1

- Initial documentation completed.

## v0.2

- Phase 1 complete: Spring Boot project initialized inside `Arham/backend/`.
- H2 dev database connected.
- Package structure created.
- Health endpoint, CORS, exception handler established.

------------------------------------------------------------------------

# Instructions for AI

Before performing any task:

1.  Read this file first.
2.  Use it to determine the current project state.
3.  Continue from the current task instead of re-reading every document.
4.  Update this file whenever:
    -   a feature starts or finishes,
    -   a document changes,
    -   a decision changes,
    -   a blocker appears,
    -   the current task changes,
    -   the project enters a new phase.
5.  Keep this file concise and up to date.

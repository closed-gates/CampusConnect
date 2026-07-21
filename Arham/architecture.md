# System Architecture

## 1. Overview

The Unified University Portal follows a **three-tier architecture**,
separating the system into the Presentation Layer (Frontend),
Application Layer (Backend), and Data Layer (Database). This
architecture ensures scalability, maintainability, and security while
allowing independent development of each layer.

The frontend communicates with the backend through RESTful APIs, while
the backend handles business logic and interacts with the SQL database
to store and retrieve data.

``` text
                +----------------------+
                |      React Frontend  |
                |   (Presentation)     |
                +----------+-----------+
                           |
                    REST API (HTTPS)
                           |
                +----------v-----------+
                | Spring Boot Backend  |
                | (Business Logic/API) |
                +----------+-----------+
                           |
                     SQL Queries
                           |
                +----------v-----------+
                |     SQL Database     |
                |     (Data Layer)     |
                +----------------------+
```

## 2. Architecture Layers

### 2.1 Presentation Layer (Frontend)

**Technology:** React.js

**Responsibilities** - User authentication interface - Dashboard
display - Faculty directory search - Attendance interface - Club
recruitment pages - Notification settings - Displaying notices and
announcements - Consuming backend APIs - Responsive design for desktop,
tablet, and mobile devices

The frontend does not communicate directly with the database. Every
request is sent to the backend through secure REST APIs.

### 2.2 Application Layer (Backend)

**Technology:** Spring Boot

**Responsibilities** - Authentication and authorization - Role-Based
Access Control (RBAC) - Business logic - REST API development - Data
validation - Notification management - Attendance management - Faculty
directory management - Club recruitment management - Error handling -
Database communication

The backend processes client requests, validates permissions, executes
business rules, and returns appropriate responses to the frontend.

### 2.3 Data Layer

**Technology:** SQL Database

**Stored Information** - User accounts - Student records - Faculty
records - Staff records - Attendance records - Club notices - Academic
notices - Advising information - Notification preferences - User roles
and permissions

The backend is the only layer allowed to access the database directly.

## 3. High-Level Workflow

### User Login

1.  User opens the portal.
2.  User enters login credentials.
3.  React sends a login request to Spring Boot.
4.  Spring Boot authenticates the user.
5.  Backend retrieves user information from the SQL database.
6.  User role is identified.
7.  Backend returns authentication status and permissions.
8.  Frontend displays the appropriate dashboard.

### Example Request Flow

``` text
Student
    │
    ▼
React Frontend
    │
HTTP Request
    │
    ▼
Spring Boot API
    │
Business Logic
    │
SQL Query
    │
    ▼
SQL Database
    │
Data Returned
    │
    ▼
Spring Boot
    │
JSON Response
    │
    ▼
React Frontend
    │
    ▼
Student
```

## 4. Authentication and Authorization

The system uses **Role-Based Access Control (RBAC)**.

### Roles

-   Student
-   Faculty
-   Staff
-   Administrator
-   Prospective Student

Example permissions:

**Student** - View grades - Course advising - Payments - Study
materials - Club notices

**Faculty** - Upload lectures - Record attendance - Publish notices -
Manage advising

**Administrator** - Manage users - Assign permissions - Maintain system
settings - Monitor platform activities

## 5. Major Modules

### Authentication Module

-   Login
-   Logout
-   User verification
-   Password management

### User Management Module

-   Student profiles
-   Faculty profiles
-   Staff profiles
-   User permissions

### Faculty Directory Module

-   Faculty information
-   Search
-   Filtering
-   Advising schedules
-   Contact details

### Attendance Module

-   Attendance recording
-   Attendance updates
-   Attendance history
-   Faculty-only access

### Club Management Module

-   Club recruitment
-   Club notices
-   Event announcements

### Notification Module

-   Notification preferences
-   Account settings
-   User notifications

## 6. Database Design Overview

Core entities include:

-   Users
-   Roles
-   Students
-   Faculty
-   Staff
-   Courses
-   Attendance
-   Notices
-   Clubs
-   Club Recruitment
-   Notification Preferences

Relationships: - One user belongs to one role. - One faculty member
teaches multiple courses. - One course has many students. - One faculty
member records attendance for multiple courses. - Students may join
multiple clubs. - Clubs may publish multiple notices.

## 7. Security Architecture

-   Secure authentication
-   Role-based authorization
-   Password encryption
-   HTTPS communication
-   Input validation
-   Protection against unauthorized API access
-   Secure database queries to reduce SQL injection risks
-   Session or token-based authentication

## 8. Scalability

Future enhancements may include:

-   Mobile application
-   Real-time chat
-   AI-powered academic assistant
-   Assignment submission
-   Online examinations
-   Push notifications
-   Calendar synchronization
-   Video conferencing

## 9. Technology Stack Summary

  ------------------------------------------------------------------------
  Layer               Technology                    Purpose
  ------------------- ----------------------------- ----------------------
  Frontend            React.js                      User Interface

  Backend             Spring Boot                   Business Logic and
                                                    REST APIs

  Database            SQL                           Persistent Data
                                                    Storage

  Communication       REST API (HTTP/HTTPS)         Frontend--Backend
                                                    Communication

  Architecture        Three-Tier Architecture       Separation of Concerns
  Pattern                                           
  ------------------------------------------------------------------------

## 10. Architecture Benefits

-   Clear separation between frontend, backend, and database.
-   Improved maintainability through modular components.
-   Better scalability for future feature additions.
-   Enhanced security using RBAC and secure API communication.
-   Easier testing and debugging due to independent layers.
-   Support for multiple user roles with centralized permission
    management.
-   Efficient data management using a relational SQL database.

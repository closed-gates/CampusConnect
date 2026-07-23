# Product Requirements Document (PRD)

## 1. Product Overview

We are developing a unified university portal designed to simplify
students' academic lives by bringing multiple university services into
one platform. The website will combine the functionality of the official
university portal, educational support platforms, and communication
tools into a single, centralized system. Instead of switching between
several websites and applications, users will be able to access
everything they need from one place.

## 2. Problem Statement

As university students, we regularly use multiple platforms to complete
our academic activities.

For academic and administrative tasks such as course advising, tuition
payment, viewing grades, checking the dashboard, and accessing official
notices, we use the university's official portal (**Connect**).

For educational resources, faculty members upload lecture recordings and
study materials across different platforms, including **YouTube**,
**Google Drive**, and the university's educational website (**BUX**).

For communication, different courses and instructors use different
platforms such as **Slack, Discord, Google Classroom, WhatsApp, and
Messenger**.

Constantly switching between these platforms is time-consuming,
confusing, and inefficient. It also consumes unnecessary device storage
because students often need to install multiple applications. There is
currently no single platform that integrates all essential university
services.

## 3. Goals

Our goal is to create a single platform that combines academic services,
educational resources, and communication tools into one organized
ecosystem.

The platform aims to:

-   Reduce the need to switch between multiple websites and
    applications.
-   Make academic and administrative tasks faster and more convenient.
-   Improve communication between students, faculty members, and
    university staff.
-   Organize all university-related information in one location.
-   Save students' valuable time while reducing unnecessary storage
    usage on their devices.

## 4. Target Users

The platform is designed for:

-   Students
-   Faculty Members
-   University Staff
-   Administrators
-   Prospective Students (Admission Applicants)

## 5. User Roles and Benefits

### Students

Students can complete their academic and administrative activities from
a single platform, including:

-   Course advising
-   Tuition payment
-   Viewing dashboard and grades
-   Accessing notices and announcements
-   Watching recorded lectures
-   Downloading study materials
-   Communicating with classmates and faculty members

This eliminates the need to use multiple websites and applications.

### Faculty Members

Faculty members can:

-   Publish notices and announcements
-   Upload lecture recordings
-   Share course materials
-   Manage attendance records
-   Communicate with students
-   Access advising-related information

### University Staff

University staff can manage administrative operations, publish
university notices, and assist students through the centralized
platform.

### Administrators

Administrators have complete control over system management, including
user management, permissions, announcements, platform maintenance, and
security.

### Prospective Students

Admission applicants can explore university information, admission
requirements, notices, and other important resources before applying.

## 6. Features

The complete platform will contain more than **25 features**. My
individual contribution focuses on the following five features:

### 🔥 Role-Based Access Control (RBAC)

Implement a permission-based access system that defines what each user
role (Student, Faculty, Staff, and Administrator) can view and perform
throughout the platform.

### 🔥 Faculty and Staff Directory

Develop a searchable directory that allows users to find faculty and
staff members using filters. The directory will display contact
information, departments, advising schedules, and other relevant details
integrated from the Connect portal.

### Club Recruitment and Notices

Provide a dedicated section where university clubs can publish
recruitment announcements, event updates, and notices for students.

### Notification and Account Preferences

Allow users to customize notification settings, communication
preferences, and account-related options according to their needs.

### Faculty Attendance Tracking

Develop an attendance management system exclusively for faculty members
to record and manage student attendance, synchronized with the Connect
system.

## 7. Functional Requirements

The system shall:

-   Support secure user authentication and login.
-   Provide role-based access according to user type.
-   Allow students to access academic services such as advising, grades,
    payments, notices, and dashboards.
-   Allow faculty members to upload lecture videos, study materials, and
    announcements.
-   Enable attendance management for faculty members.
-   Provide a searchable faculty and staff directory with filtering
    options.
-   Allow clubs to publish recruitment notices and announcements.
-   Allow users to customize notification and account preferences.
-   Support communication between students, faculty members, and
    university staff.
-   Display information based on the user's assigned role and
    permissions.
-   Maintain user data securely and accurately.

## 8. Non-Functional Requirements

### Performance

-   Pages should load quickly under normal usage.
-   The platform should support a large number of concurrent users
    without significant performance degradation.

### Security

-   User authentication must be secure.
-   Role-based authorization must prevent unauthorized access.
-   Sensitive information should be encrypted during transmission and
    storage where applicable.

### Reliability

-   The platform should remain available with minimal downtime.
-   User data should be stored accurately without loss.

### Usability

-   The interface should be simple, intuitive, and easy to navigate.
-   Users should be able to perform common tasks with minimal learning.

### Scalability

-   The system should be designed to support future features and
    increasing numbers of users.

### Compatibility

-   The platform should function correctly across modern web browsers
    and be responsive on desktop, tablet, and mobile devices.

### Maintainability

-   The codebase should be modular and well-documented to simplify
    future maintenance and feature development.

## 9. User Interface Requirements

The user interface should follow a clean, modern, and minimalist design
philosophy.

Design guidelines include:

-   A predominantly white color scheme for a clean and professional
    appearance.
-   Minimal use of blue, primarily for borders, highlights, and
    interactive elements.
-   Consistent spacing, typography, and visual hierarchy.
-   Responsive layouts that adapt seamlessly to different screen sizes.
-   Simple navigation that allows users to access information quickly
    with minimal effort.

## 10. Technology Stack

### Frontend

-   **React.js** will be used to build the user interface.
-   It will provide a fast, responsive, and interactive user experience
    through reusable components and efficient state management.

### Backend

-   **Spring Boot** will be used for backend development.
-   It will handle business logic, RESTful APIs, authentication,
    authorization, and communication between the frontend and the
    database.

### Database

-   **SQL** will be used as the database management system.
-   It will securely store and manage user information, academic
    records, notices, attendance, and other application data while
    ensuring data integrity and efficient querying.

# Integrated Academic Management & Communication Platform

> **Course:** CSE470 - Software Engineering  
> **University:** BRAC University

---

# Group Information

**Group Name:** *Group 09*

## Group Members

| Member Name | Student ID | Primary Modules / Responsibilities |
|-------------|------------|------------------------------------|
| **Jawadul Arham** | **23201518** | 
| **Afnan Mohammad Hafiz** | **23241004** | 
| **Nafiz Shahriar Sami** | **23201336** | 
| **Eusha Kayenat** | **23201393** | 
| **Ibsan Hossain Ansari** | **23201532** | 

---

# Project Description

## Overview

The **Integrated Academic Management & Communication Platform** is a comprehensive web-based university portal designed to unify the core academic and administrative services used by students, faculty, and administrators. Instead of relying on multiple disconnected systems, the platform combines functionalities inspired by **BRAC Connect**, **buX**, and modern real-time communication platforms into a single seamless experience.

The system centralizes course registration, assignment management, academic resources, grade tracking, messaging, billing, scheduling, and notifications through one unified dashboard. By integrating these services into a single platform, the project aims to improve usability, reduce administrative overhead, and enhance communication across the university community.

---

# Key Features & Work Breakdown

## 1. User Profiles, Directory & Access Control
**Module Owner:** **Jawadul Arham**

### Features
- Role-Based Access Control (RBAC)
  - Student
  - Faculty
  - Administrator
- Faculty & Staff Directory
  - Search by department
  - Contact information
  - Advising details
- Club Recruitment & Announcements Portal
- Faculty Attendance Management
- User Settings & Notification Preferences

---

## 2. Course Registration & Academic Performance
**Module Owner:** **Afnan Mohammad Hafiz**

### Features
- Real-time Course Registration
- Live Seat Availability
- Course Catalog Search & Filtering
- Grade Tracking
- Semester-wise GPA Calculation
- Transcript View
- Faculty Advisor Workflow

---

## 3. Learning Content & Assignments (buX Module)
**Module Owner:** **Nafiz Shahriar Sami**

### Features
- Assignment Submission Portal
- Deadline Enforcement
- Video Lecture Streaming
- Watch Progress Tracking
- Course Materials Repository
- Lecture Notes & Slides
- Academic Calendar
- Upcoming Assignment Timeline

---

## 4. Real-Time Communication & Messaging
**Module Owner:** **Eusha Kayenat**

### Features
- Course-based Chat Channels
- WebSocket Real-Time Messaging
- Direct Messaging
- Online / Offline Presence Indicators
- Real-Time Notifications
  - Announcements
  - Assignment Deadlines
  - Grade Releases
  - Seat Availability Alerts
- Email Notification Support

---

## 5. Dashboard, Billing & Pre-Registration
**Module Owner:** **Ibsan Hossain Ansari**

### Features
- Personalized Dashboard
- Upcoming Classes
- Assignment Overview
- Message Summary
- Billing Status
- Pre-Registration System
- Automatic Routine Generation
- GPS Payment Branch Finder
- Stripe Payment Integration
- Exam Countdown Timer

---

# Stretch Goals / Future Features

## AI Study Support Assistant

An integrated AI-powered academic assistant capable of:

- Answering university-related FAQs
- Explaining registration procedures
- Summarizing lecture materials
- Providing assignment reminders
- Assisting with academic policies
- Acting as an intelligent chatbot within the communication module

---

# Technical Challenges Addressed

### Real-Time Data Synchronization
- Integrating Connect, buX, and real-time messaging into a unified architecture
- Maintaining low-latency communication across services

### Scalability
- Handling high traffic during peak registration periods
- Efficient database access under concurrent usage

### Authentication & Security
- Single Sign-On (SSO) integration
- Secure Role-Based Access Control (RBAC)

### Low-Connectivity Support
- Graceful degradation for users on slower internet connections
- Optimized data loading and lightweight communication

---

# Technologies Used

| Category | Technology |
|----------|------------|
| Frontend | HTML, CSS, JavaScript |
| Backend | PHP |
| Database | MySQL |
| Real-Time Communication | WebSockets |
| Authentication | Session-based Authentication & RBAC |
| Payment | Stripe API |
| Maps & GPS | Google Maps API |
| Version Control | Git & GitHub |

---

# System Modules

- User Authentication
- User Profiles
- Faculty Directory
- Course Registration
- GPA & Transcript
- Assignment Management
- Learning Materials
- Video Lectures
- Academic Calendar
- Real-Time Messaging
- Notifications
- Dashboard
- Billing
- GPS Branch Locator
- Pre-Registration
- Exam Countdown

---

# Project Objectives

- Unify multiple university systems into one platform.
- Improve communication between students and faculty.
- Simplify course registration and advising.
- Provide centralized access to learning resources.
- Enhance the overall academic experience through real-time collaboration.
- Design a scalable architecture capable of supporting future university services.

---

# Future Improvements

- Mobile application support
- Push notifications
- AI-powered recommendation system
- Video conferencing integration
- Attendance using QR/NFC
- Advanced analytics dashboard
- Cloud deployment
- Multi-language support

---

# License

This project was developed solely for academic purposes as part of the **CSE470 - Software Engineering** course at **BRAC University**.

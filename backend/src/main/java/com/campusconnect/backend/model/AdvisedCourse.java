package com.campusconnect.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * AdvisedCourse – JPA Entity for advisor-assigned course sections.
 *
 * MVC Role: Model
 * Maps to the {@code advised_courses} table in Neon PostgreSQL.
 *
 * Phase 3: Converted from plain POJO to @Entity so advisor assignments
 * persist across server restarts.
 *
 * Relationship: Many AdvisedCourse → One StudentProfile.
 *
 * Used by: AdvisedCourseRepository, AdvisorService
 */
@Entity
@Table(name = "advised_courses")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdvisedCourse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** The section ID assigned, e.g. "CSE110-01" */
    @Column(name = "section_id", nullable = false, length = 30)
    private String sectionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private StudentProfile studentProfile;

    /** e.g. "CSE110" */
    @Column(name = "course_code", nullable = false, length = 20)
    private String courseCode;

    /** e.g. "Programming Language I" */
    @Column(name = "course_title", nullable = false)
    private String courseTitle;

    /** Section number string, e.g. "01", "S52- Online" */
    @Column(nullable = false, length = 30)
    private String section;

    /** Credits for this section (typically 3) */
    @Column(nullable = false)
    private int credits;

    /** Schedule string, e.g. "SUNDAY(8:00 AM-9:20 AM-09A-05C) ; TUESDAY(8:00 AM-9:20 AM-09A-05C)" */
    @Column(nullable = false, columnDefinition = "TEXT")
    private String time;

    /** Room, e.g. "NAC-09A-05C", "UB0000" */
    @Column(nullable = false, length = 60)
    private String room;

    /** Instructor name */
    @Column(nullable = false)
    private String faculty;

    /** ISO datetime of assignment */
    @Column(name = "assigned_at", nullable = false)
    private String assignedAt;

    /** Name of the advisor who made this assignment */
    @Column(name = "assigned_by", nullable = false)
    private String assignedBy;
}

package com.campusconnect.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * CourseCatalog – JPA Entity for BRAC University course catalog.
 *
 * MVC Role: Model
 * Maps to the `course_catalog` table in Neon PostgreSQL.
 * Represents a unique course offering (not a section), e.g. CSE110.
 *
 * Schema v2: Fields updated to match real BRACU schedule data (Summer 2026).
 * Old fields (academic_year, semester, instructor, enrolled, capacity, rating,
 * tags, description) are retained as nullable for backward compatibility but
 * are no longer populated from seed data.
 *
 * Used by: CourseCatalogRepository, CourseController
 */
@Entity
@Table(name = "course_catalog")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseCatalog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Course code, e.g. "CSE110", "EEE101", "ACT201" */
    @Column(nullable = false, length = 20)
    private String code;

    /** Full course name, e.g. "PROGRAMMING LANGUAGE I" */
    @Column(nullable = false)
    private String name;

    /**
     * Faculty/dept short ID (legacy field – kept nullable for backward compat).
     * New code should use `department` and `school` instead.
     */
    @Column(name = "faculty_id", length = 20)
    private String facultyId;

    /** Credit hours – e.g. 3, 1.5, 4.5 */
    @Column(nullable = false)
    private Double credits;

    // ── Legacy fields (nullable) ──────────────────────────────────────────────

    /** Academic year level: 1, 2, 3, or 4 (legacy, defaults to 1) */
    @Column(name = "academic_year")
    private Integer year;

    /** Semester offered: "Fall", "Spring", or "Summer" (legacy) */
    @Column(length = 20)
    private String semester;

    /** Primary instructor name (legacy, defaults to "TBA") */
    private String instructor;

    /** Current number of enrolled students (legacy) */
    private Integer enrolled;

    /** Maximum seat capacity (legacy – use totalSeats instead) */
    private Integer capacity;

    /** Average student rating 0.0–5.0 (legacy, defaults to 4.0) */
    private Double rating;

    /** Comma-separated tags (legacy) */
    @Column(length = 200)
    private String tags;

    /** Full course description (legacy) */
    @Column(columnDefinition = "TEXT")
    private String description;

    // ── New fields from real BRACU data ──────────────────────────────────────

    /** Department/subject area, e.g. "Computer Science and Engineering", "Pharmacy" */
    @Column(length = 150)
    private String department;

    /** School/faculty grouping, e.g. "BSRM School of Engineering", "BRAC Business School" */
    @Column(length = 200)
    private String school;

    /** True if this is a General Education course open to all majors */
    @Column(name = "is_gen_ed")
    private Boolean isGenEd;

    /**
     * Prerequisite course codes as a string, e.g. "(CSE110) OR (CSE220)".
     * Empty string or null means no prerequisites.
     */
    @Column(columnDefinition = "TEXT")
    private String prerequisites;

    /** Number of sections offered this semester */
    @Column(name = "total_sections")
    private Integer totalSections;

    /** Total seat capacity across all sections */
    @Column(name = "total_seats")
    private Integer totalSeats;

    /** Total seats booked across all sections */
    @Column(name = "total_booked")
    private Integer totalBooked;

    /** Midterm exam schedule string, e.g. "Jul 26, 2026 11:00 AM - 1:00 PM" */
    @Column(name = "mid_exam_schedule", length = 150)
    private String midExamSchedule;

    /** Final exam schedule string, e.g. "Sep 13, 2026 11:00 AM - 1:00 PM" */
    @Column(name = "final_exam_schedule", length = 150)
    private String finalExamSchedule;

    /** Academic degree level, e.g. "UNDERGRADUATE" */
    @Column(name = "academic_degree", length = 50)
    private String academicDegree;
}

package com.campusconnect.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * CourseSection – JPA Entity for BRACU course sections (Routine Builder).
 *
 * MVC Role: Model
 * Maps to the `course_section` table in Neon PostgreSQL.
 * Represents a specific section of a course, e.g. CSE110-16.
 *
 * Schema v2: Added `credits` (FLOAT) and `midterm_exam` (VARCHAR) fields
 * from real BRACU schedule data (Summer 2026).
 *
 * Used by: CourseSectionRepository, CourseController
 */
@Entity
@Table(name = "course_section")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseSection {

    /** e.g. "CSE110-16" */
    @Id
    @Column(length = 60)
    private String id;

    /** e.g. "CSE110" */
    @Column(nullable = false, length = 30)
    private String code;

    /** Section number, e.g. "01", "16", "S52- Online" */
    @Column(nullable = false, length = 30)
    private String section;

    /** e.g. "PROGRAMMING LANGUAGE I" */
    @Column(nullable = false)
    private String title;

    /**
     * Instructor/faculty abbreviation or name, e.g. "ANT", "RKBR", "TBA".
     * BRACU uses abbreviated faculty initials in section data.
     */
    @Column(nullable = false)
    private String faculty;

    /**
     * Full schedule string from BRACU, e.g.
     * "SUNDAY(8:00 AM-9:20 AM-09A-05C) ; TUESDAY(8:00 AM-9:20 AM-09A-05C)"
     */
    @Column(nullable = false, columnDefinition = "TEXT")
    private String time;

    /** Room/building code, e.g. "09A-04C", "11H-46L", "UB0000" */
    @Column(nullable = false, length = 60)
    private String room;

    /** Final exam schedule string, e.g. "Sep 13, 2026 8:30 AM - 10:30 AM" */
    @Column(name = "exam_day")
    private String examDay;

    /** Maximum seat capacity */
    @Column(name = "total_seats", nullable = false)
    private Integer totalSeats;

    /** Number of booked seats */
    @Column(nullable = false)
    private Integer booked;

    /**
     * Prerequisite course codes, e.g. "(CSE110)" or "(CSE110 AND CSE220)".
     * Null/empty means no prerequisites.
     */
    @Column(name = "prerequisite_codes", columnDefinition = "TEXT")
    private String prerequisiteCodes;

    /** Credit hours for this course, e.g. 3.0, 1.5, 4.5 */
    @Column
    private Double credits;

    /** Midterm exam schedule, e.g. "Jul 26, 2026 8:30 AM - 10:30 AM" */
    @Column(name = "midterm_exam", length = 100)
    private String midtermExam;
}

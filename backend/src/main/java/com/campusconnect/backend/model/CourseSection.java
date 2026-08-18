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
 * Represents a specific section of a course, e.g. CSE110-01.
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

    /** e.g. "CSE110-01" */
    @Id
    @Column(length = 30)
    private String id;

    /** e.g. "CSE110" */
    @Column(nullable = false, length = 20)
    private String code;

    /** Section number, e.g. "01", "02" */
    @Column(nullable = false, length = 5)
    private String section;

    /** e.g. "Programming Language I" */
    @Column(nullable = false)
    private String title;

    /** Instructor name, e.g. "Dr. Ahmed" */
    @Column(nullable = false)
    private String faculty;

    /** e.g. "SUN-TUE 08:00 AM-09:20 AM" */
    @Column(nullable = false)
    private String time;

    /** Room, e.g. "NAC-09A-05C" */
    @Column(nullable = false, length = 30)
    private String room;

    /** Exam schedule string, e.g. "Dec 10, 2026 9:00 AM-11:00 AM" */
    @Column(name = "exam_day")
    private String examDay;

    /** Maximum seat capacity */
    @Column(name = "total_seats", nullable = false)
    private Integer totalSeats;

    /** Number of booked seats */
    @Column(nullable = false)
    private Integer booked;

    /**
     * Comma-separated prerequisite course codes that must be completed before
     * a student can register for this section.
     * e.g. "CSE110" or "CSE110,CSE111"
     * Null/empty means no prerequisites.
     */
    @Column(name = "prerequisite_codes", length = 200)
    private String prerequisiteCodes;
}

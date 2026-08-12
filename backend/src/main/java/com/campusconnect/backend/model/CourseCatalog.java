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

    /** Course code, e.g. "CSE110", "EEE101", "BUS101" */
    @Column(nullable = false, length = 20)
    private String code;

    /** Full name, e.g. "Programming Language I" */
    @Column(nullable = false)
    private String name;

    /**
     * Faculty/dept short ID: "cse", "eee", "bba", "math", "eng".
     * Maps to FACULTIES list in the frontend model.
     */
    @Column(name = "faculty_id", nullable = false, length = 20)
    private String facultyId;

    /** Credit hours – typically 3 for BRACU courses */
    @Column(nullable = false)
    private Integer credits;

    /** Academic year level: 1, 2, 3, or 4 */
    @Column(nullable = false)
    private Integer year;

    /** Semester offered: "Fall", "Spring", or "Summer" */
    @Column(nullable = false, length = 20)
    private String semester;

    /** Primary instructor name */
    @Column(nullable = false)
    private String instructor;

    /** Current number of enrolled students */
    @Column(nullable = false)
    private Integer enrolled;

    /** Maximum seat capacity */
    @Column(nullable = false)
    private Integer capacity;

    /** Average student rating (0.0 – 5.0) */
    @Column(nullable = false)
    private Double rating;

    /** Comma-separated tags, e.g. "Core,Lab,Practical" */
    @Column(length = 200)
    private String tags;

    /** Full course description */
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
}

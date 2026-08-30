package com.campusconnect.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * TestCourse – JPA Entity for courses in the test dataset.
 *
 * MVC Role: Model
 * Table: `test_courses` (isolated test table, separate from existing course_catalog)
 *
 * Relational Link:
 *   - One TestCourse has many `TestSection` entries.
 */
@Entity
@Table(name = "test_courses")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TestCourse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Course code (e.g. "CSE110T", "MAT120T") */
    @Column(nullable = false, unique = true, length = 30)
    private String code;

    /** Full title of the course (e.g. "Programming Language I (Test)") */
    @Column(nullable = false, length = 150)
    private String name;

    /** Academic credit hours (e.g. 3.0, 1.5, 4.0) */
    @Column(nullable = false)
    private Double credits;

    /** Department offering the course (e.g. "Computer Science and Engineering") */
    @Column(nullable = false, length = 150)
    private String department;

    /** School/Faculty group (e.g. "School of Engineering and Physical Sciences") */
    @Column(length = 150)
    private String school;

    /** Brief description of syllabus / course scope */
    @Column(columnDefinition = "TEXT")
    private String description;

    /** Prerequisites string (e.g. "None", "CSE110T", "MAT110T") */
    @Column(columnDefinition = "TEXT")
    private String prerequisites;

    /** Academic degree level (e.g. "UNDERGRADUATE") */
    @Column(name = "academic_degree", length = 50)
    private String academicDegree;
}

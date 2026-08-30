package com.campusconnect.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * StudentCompletedCourse – JPA Entity tracking completed, transferred, or bypassed courses.
 *
 * MVC Role: Model
 * Table: `student_completed_courses`
 *
 * Used to calculate and persist real-time CGPA and completed credits for each student.
 */
@Entity
@Table(name = "student_completed_courses")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentCompletedCourse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "student_id", nullable = false, length = 50)
    private String studentId;

    @Column(name = "course_code", nullable = false, length = 30)
    private String courseCode;

    @Column(name = "course_title", nullable = false, length = 200)
    private String courseTitle;

    @Column(nullable = false)
    private int credits;

    /** Letter grade: e.g. "A+", "A", "A-", "B+", "B", "B-", "C+", "C", "D", "WAIVED" */
    @Column(length = 20)
    private String grade;

    /** Grade point (e.g. 4.0, 3.7, 3.3, 3.0, 2.7, 2.3, 2.0, 1.0); null if WAIVED */
    @Column(name = "grade_point")
    private Double gradePoint;

    /** Semester term: e.g. "Summer 2026" or "Transferred / Bypassed" */
    @Column(length = 50)
    private String semester;

    /** True if bypassed / waived by Admin */
    @Column(name = "is_bypassed", nullable = false)
    @Builder.Default
    private boolean isBypassed = true;

    /** Admin name or identifier who authorized the bypass */
    @Column(name = "bypassed_by", length = 100)
    private String bypassedBy;

    /** ISO timestamp when course was bypassed / completed */
    @Column(name = "bypassed_at", length = 50)
    private String bypassedAt;

    /** Reason: "Credit Transfer", "Dean Approval", "Prerequisite Exemption", etc. */
    @Column(length = 255)
    private String reason;
}

package com.campusconnect.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * Enrollment – JPA Entity tracking student course enrollments.
 *
 * MVC Role: Model
 * Maps to the `enrollment` table in Neon PostgreSQL.
 * Persists which students are enrolled in which catalog courses.
 *
 * Used by: EnrollmentRepository, CourseController
 */
@Entity
@Table(
    name = "enrollment",
    uniqueConstraints = @UniqueConstraint(columnNames = {"student_id", "course_id"})
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Enrollment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Student identifier, e.g. "usr_eusha_001" or student ID number */
    @Column(name = "student_id", nullable = false, length = 50)
    private String studentId;

    /** FK to course_catalog.id */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private CourseCatalog course;

    /** When the enrollment was created */
    @Column(name = "enrolled_at", nullable = false)
    private LocalDateTime enrolledAt;

    @PrePersist
    protected void onCreate() {
        this.enrolledAt = LocalDateTime.now();
    }
}

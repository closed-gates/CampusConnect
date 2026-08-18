package com.campusconnect.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * SectionRegistration – JPA Entity for student self-registration in course sections.
 *
 * MVC Role: Model
 * Maps to the {@code section_registrations} table in Neon PostgreSQL.
 *
 * This is distinct from the existing {@link Enrollment} entity:
 *   - Enrollment  → student enrolled in a CourseCatalog entry (course catalog page)
 *   - SectionRegistration → student self-registers in a specific CourseSection
 *     with a specific seat during their advising window.
 *
 * The DB-level unique constraint on (student_id, section_id, term) prevents
 * duplicate registrations even under concurrent requests.
 *
 * Used by: SectionRegistrationRepository, RegistrationService
 */
@Entity
@Table(
    name = "section_registrations",
    uniqueConstraints = @UniqueConstraint(
        name = "uq_student_section_term",
        columnNames = {"student_id", "section_id", "term"}
    )
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SectionRegistration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Student identifier — matches StudentProfile.studentId (e.g. "STU001").
     * Not a FK to keep registration independent of profile changes.
     */
    @Column(name = "student_id", nullable = false, length = 50)
    private String studentId;

    /**
     * The section the student registered in, e.g. "CSE110-01".
     * FK to course_section.id.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "section_id", nullable = false)
    private CourseSection section;

    /**
     * Academic term, e.g. "Fall2026".
     * Prevents duplicate registration checks from leaking across terms.
     */
    @Column(nullable = false, length = 20)
    private String term;

    /** Timestamp of when the registration was confirmed */
    @Column(name = "registered_at", nullable = false)
    private LocalDateTime registeredAt;

    @PrePersist
    protected void onCreate() {
        if (this.registeredAt == null) {
            this.registeredAt = LocalDateTime.now();
        }
    }
}

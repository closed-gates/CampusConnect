package com.campusconnect.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

/**
 * StudentProfile – JPA Entity persisted in Neon PostgreSQL.
 *
 * MVC Role: Model
 * Maps to the {@code student_profiles} table.
 *
 * Phase 3: Converted from plain POJO to @Entity so student data and
 * their advised course assignments survive restarts.
 *
 * Credit / course limits (derived from CGPA — must mirror frontend advisingModel.js):
 *   CGPA >= 3.5  (High standing):    5 courses, 15 credits
 *   CGPA >= 2.0  (Good standing):    4 courses, 12 credits
 *   CGPA <  2.0  (Probationary):     3 courses,  9 credits
 *
 * Used by: StudentProfileRepository, AdvisorService, RegistrationService
 */
@Entity
@Table(name = "student_profiles")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentProfile {

    // ── CGPA threshold constants ───────────────────────────────────
    public static final double CGPA_HIGH_THRESHOLD  = 3.5;
    public static final double CGPA_MIN_THRESHOLD   = 2.0;
    public static final int    HIGH_MAX_COURSES     = 5;
    public static final int    STANDARD_MAX_COURSES = 4;
    public static final int    PROBATION_MAX_COURSES= 3;
    public static final int    CREDITS_PER_COURSE   = 3;

    @Id
    @Column(name = "student_id", length = 50)
    private String studentId;

    @Column(name = "student_name", nullable = false)
    private String studentName;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String department;

    @Column(nullable = false)
    private int year;

    @Column(nullable = false)
    private double cgpa;

    /** Total credits the student has already completed (used for advising priority) */
    @Column(name = "completed_credits", nullable = false)
    private int completedCredits;

    /** CGPA < 2.0 → probationary (restricted enrolment) */
    @Column(name = "on_probation", nullable = false)
    private boolean onProbation;

    /**
     * Comma-separated list of course codes the student has already passed.
     * Used for prerequisite checking during self-registration.
     * e.g. "CSE110,CSE111,MAT110,ENG101"
     */
    @Column(name = "completed_courses", columnDefinition = "TEXT")
    @Builder.Default
    private String completedCourses = "";

    /** Courses assigned by advisor this semester — persisted in advised_courses table */
    @OneToMany(mappedBy = "studentProfile", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @Builder.Default
    private List<AdvisedCourse> advisedCourses = new ArrayList<>();

    /** True if advising has been confirmed and saved for this semester */
    @Column(name = "advising_confirmed")
    @Builder.Default
    private Boolean advisingConfirmed = false;

    /** ISO timestamp when advising was confirmed */
    @Column(name = "advising_confirmed_at")
    private String advisingConfirmedAt;

    public boolean isAdvisingConfirmed() {
        return Boolean.TRUE.equals(advisingConfirmed);
    }

    // ── Derived helpers (same logic as original POJO) ─────────────

    public int getCurrentCredits() {
        return advisedCourses.stream().mapToInt(AdvisedCourse::getCredits).sum();
    }

    public int getCourseLimit() {
        if (onProbation || cgpa < CGPA_MIN_THRESHOLD) return PROBATION_MAX_COURSES;
        if (cgpa >= CGPA_HIGH_THRESHOLD)              return HIGH_MAX_COURSES;
        return STANDARD_MAX_COURSES;
    }

    public int getCreditLimit()      { return getCourseLimit() * CREDITS_PER_COURSE; }
    public int getRemainingCredits() { return getCreditLimit() - getCurrentCredits(); }
    public int getRemainingCourses() { return getCourseLimit() - advisedCourses.size(); }
}

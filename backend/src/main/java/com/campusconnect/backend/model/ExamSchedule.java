package com.campusconnect.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * ExamSchedule – JPA Entity for course exam dates.
 *
 * MVC Role: Model
 * Maps to the {@code exam_schedules} table in Neon PostgreSQL.
 *
 * Stores one row per unique course code with both the midterm
 * and final exam datetime. Seeded on first startup by
 * ExamScheduleService using dates derived from CourseSection.examDay.
 *
 * Used by: ExamScheduleRepository, ExamScheduleService, ExamScheduleController
 */
@Entity
@Table(name = "exam_schedules")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExamSchedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Unique course code, e.g. "CSE110", "MAT201". */
    @Column(name = "course_code", nullable = false, unique = true, length = 20)
    private String courseCode;

    /** Full course title, e.g. "Programming Language I". */
    @Column(name = "course_name", nullable = false)
    private String courseName;

    /**
     * Midterm exam date/time.
     * Seeded as finalDate minus 56 days (≈ 8 weeks before finals).
     */
    @Column(name = "midterm_date", nullable = false)
    private LocalDateTime midtermDate;

    /**
     * Final exam date/time.
     * Parsed from CourseSection.examDay, e.g. "Dec 10, 2026 9:00 AM–11:00 AM".
     */
    @Column(name = "final_date", nullable = false)
    private LocalDateTime finalDate;
}

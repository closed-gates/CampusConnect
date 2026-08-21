package com.campusconnect.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * ExamScheduleDTO – Data Transfer Object returned by ExamScheduleController.
 *
 * MVC Role: DTO
 *
 * Carries exam date information for one course, enriched with
 * computed daysLeft values so the frontend does not need to
 * calculate them client-side.
 *
 * Example JSON response:
 * {
 *   "courseCode":       "CSE110",
 *   "courseName":       "Programming Language I",
 *   "midtermDate":      "2026-10-14T09:00:00",
 *   "finalDate":        "2026-12-10T09:00:00",
 *   "midtermDaysLeft":  56,
 *   "finalDaysLeft":    113
 * }
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExamScheduleDTO {

    /** Course code, e.g. "CSE110" */
    private String courseCode;

    /** Full course name, e.g. "Programming Language I" */
    private String courseName;

    /** Midterm exam datetime */
    private LocalDateTime midtermDate;

    /** Final exam datetime */
    private LocalDateTime finalDate;

    /**
     * Days remaining until midterm from today.
     * Negative value means the exam has already passed.
     */
    private long midtermDaysLeft;

    /**
     * Days remaining until final exam from today.
     * Negative value means the exam has already passed.
     */
    private long finalDaysLeft;
}

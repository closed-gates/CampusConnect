package com.campusconnect.backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * GpaRetakeRequest – DTO for the Course Retake / Grade Improvement Simulator endpoint.
 *
 * MVC Role: DTO
 *
 * Received by: POST /api/student/gpa/simulate-retake
 *
 * Carries the course to "retake" and the hypothetical new grade.
 * Grade replacement policy: the new grade fully replaces the old one in the simulation.
 * No data is persisted.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class GpaRetakeRequest {

    /**
     * The course code of the previously completed course to simulate retaking.
     * e.g. "CSE110"
     */
    private String courseCode;

    /**
     * The hypothetical new letter grade the student wants to simulate.
     * Must be one of: A+, A, A-, B+, B, B-, C+, C, D, F
     */
    private String newGrade;
}

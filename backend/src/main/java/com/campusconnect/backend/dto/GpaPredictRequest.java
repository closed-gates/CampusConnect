package com.campusconnect.backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.List;

/**
 * GpaPredictRequest – DTO for the Predictive CGPA Calculator endpoint.
 *
 * MVC Role: DTO
 *
 * Received by: POST /api/student/gpa/predict
 *
 * Carries a list of course entries with the student's predicted grades.
 * This is a simulation-only request; no data is persisted.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class GpaPredictRequest {

    /** List of current-semester courses with predicted grades. */
    private List<CourseGradePair> courses;

    /**
     * A single course entry in the prediction request.
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CourseGradePair {

        /** Course code, e.g. "CSE110" */
        private String courseCode;

        /** Full course name, e.g. "Programming Language I" */
        private String courseName;

        /** Credit hours for this course (may be fractional for some programs, e.g. 1.5) */
        private double credits;

        /**
         * The student's predicted letter grade for this course.
         * Must be one of: A+, A, A-, B+, B, B-, C+, C, D, F
         * Null or blank → course is skipped in calculation.
         */
        private String predictedGrade;
    }
}

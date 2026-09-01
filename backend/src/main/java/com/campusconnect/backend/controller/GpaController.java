package com.campusconnect.backend.controller;

import com.campusconnect.backend.dto.GpaPredictRequest;
import com.campusconnect.backend.dto.GpaRetakeRequest;
import com.campusconnect.backend.service.GpaService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * GpaController – REST API for student Grade Tracking and GPA Calculation.
 *
 * MVC Role: Controller
 *
 * Base Path: /api/student/gpa
 *
 * ALL endpoints are restricted to ROLE_STUDENT via @PreAuthorize.
 * The student's ID is extracted from the JWT (Authentication principal)
 * rather than accepted as a request parameter, preventing spoofing.
 *
 * Endpoints:
 *   GET  /api/student/gpa/transcript        → Full semester-by-semester transcript
 *   GET  /api/student/gpa/current-courses   → In-progress courses for prediction
 *   POST /api/student/gpa/predict           → Predictive CGPA calculator (simulation)
 *   POST /api/student/gpa/simulate-retake   → Retake / grade-improvement simulator (simulation)
 */
@RestController
@RequestMapping("/api/student/gpa")
@CrossOrigin(origins = "*")
public class GpaController {

    private final GpaService gpaService;

    public GpaController(GpaService gpaService) {
        this.gpaService = gpaService;
    }

    /**
     * GET /api/student/gpa/transcript
     *
     * Returns the authenticated student's full grade transcript:
     *   - All completed/bypassed courses grouped by semester
     *   - Per-semester GPA
     *   - Running cumulative CGPA after each semester
     *   - Overall academic standing
     */
    @GetMapping("/transcript")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> getTranscript(Authentication auth) {
        String studentId = auth.getName();   // JWT subject = userId
        Map<String, Object> result = gpaService.getTranscript(studentId);
        if (Boolean.TRUE.equals(result.get("success"))) {
            return ResponseEntity.ok(result);
        }
        return ResponseEntity.status(404).body(result);
    }

    /**
     * GET /api/student/gpa/current-courses
     *
     * Returns the student's current in-progress (advised) courses
     * to pre-populate the predictive CGPA calculator.
     */
    @GetMapping("/current-courses")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> getCurrentCourses(Authentication auth) {
        String studentId = auth.getName();
        Map<String, Object> result = gpaService.getCurrentCourses(studentId);
        if (Boolean.TRUE.equals(result.get("success"))) {
            return ResponseEntity.ok(result);
        }
        return ResponseEntity.status(404).body(result);
    }

    /**
     * POST /api/student/gpa/predict
     *
     * Predictive CGPA Calculator.
     * Accepts a list of current-semester courses with predicted grades.
     * Returns predicted semester GPA and predicted overall CGPA.
     *
     * SIMULATION ONLY — no grades are written to the database.
     */
    @PostMapping("/predict")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> predictCgpa(
            Authentication auth,
            @RequestBody GpaPredictRequest req) {

        String studentId = auth.getName();
        Map<String, Object> result = gpaService.predictCgpa(studentId, req);
        if (Boolean.TRUE.equals(result.get("success"))) {
            return ResponseEntity.ok(result);
        }
        return ResponseEntity.badRequest().body(result);
    }

    /**
     * POST /api/student/gpa/simulate-retake
     *
     * Course Retake / Grade Improvement Simulator.
     * Accepts a course code and hypothetical new grade.
     * Returns before/after CGPA comparison using grade-replacement policy.
     *
     * SIMULATION ONLY — no grades are written to the database.
     */
    @PostMapping("/simulate-retake")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> simulateRetake(
            Authentication auth,
            @RequestBody GpaRetakeRequest req) {

        String studentId = auth.getName();
        Map<String, Object> result = gpaService.simulateRetake(studentId, req);
        if (Boolean.TRUE.equals(result.get("success"))) {
            return ResponseEntity.ok(result);
        }
        return ResponseEntity.badRequest().body(result);
    }
}

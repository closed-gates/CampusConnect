package com.campusconnect.backend.controller;

import com.campusconnect.backend.dto.AdvisorMatchResponse;
import com.campusconnect.backend.service.AdvisorService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * AdvisorController – Thin REST handler for advisor and advising endpoints.
 *
 * MVC Role: Controller
 *
 * Base URL: /api/advisors
 *
 * All business logic is delegated to {@link AdvisorService}.
 *
 * Endpoints:
 *   GET    /api/advisors/match                              → ranked advisor list
 *   GET    /api/advisors/students                           → all student profiles
 *   GET    /api/advisors/student/{studentId}                → single student profile
 *   POST   /api/advisors/assign                             → assign course to student
 *   DELETE /api/advisors/assign/{studentId}/{courseId}      → remove course from student
 *   GET    /api/advisors/seat-updates                       → sectionId → booking count
 */
@RestController
@RequestMapping("/api/advisors")
@CrossOrigin(origins = "*")
public class AdvisorController {

    private final AdvisorService advisorService;

    public AdvisorController(AdvisorService advisorService) {
        this.advisorService = advisorService;
    }

    // ── GET /api/advisors/match ────────────────────────────────────
    @GetMapping("/match")
    public ResponseEntity<AdvisorMatchResponse> matchAdvisors(
            @RequestParam(required = false) String department,
            @RequestParam(required = false) Integer year) {
        return ResponseEntity.ok(advisorService.matchAdvisors(department, year));
    }

    // ── GET /api/advisors/students ─────────────────────────────────
    /**
     * Returns all students ordered by completedCredits descending (priority order).
     * Returns the profile-response map shape so the frontend can read advisedCourses.
     */
    @GetMapping("/students")
    public ResponseEntity<List<Map<String, Object>>> getAllStudents() {
        return ResponseEntity.ok(advisorService.getAllStudentsAsResponse());
    }

    // ── GET /api/advisors/student/{studentId} ──────────────────────
    @GetMapping("/student/{studentId}")
    public ResponseEntity<?> getStudentProfile(@PathVariable String studentId) {
        Optional<Map<String, Object>> profile = advisorService.getStudentProfileAsResponse(studentId);
        return profile.<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // ── POST /api/advisors/assign ──────────────────────────────────
    /**
     * Request body (JSON):
     * {
     *   "studentId":   "STU001",
     *   "courseId":    "CSE110-01",
     *   "courseCode":  "CSE110",
     *   "courseTitle": "Programming Language I",
     *   "section":     "01",
     *   "time":        "SUN-TUE 08:00 AM–09:20 AM",
     *   "room":        "NAC-09A-05C",
     *   "faculty":     "Dr. Ahmed",
     *   "advisorName": "Dr. Sarah Ahmed"
     * }
     */
    @PostMapping("/assign")
    public ResponseEntity<Map<String, Object>> assignCourse(@RequestBody Map<String, String> body) {
        Map<String, Object> result = advisorService.assignCourse(
                body.get("studentId"),
                body.get("courseId"),
                body.get("courseCode"),
                body.get("courseTitle"),
                body.get("section"),
                body.get("time"),
                body.get("room"),
                body.get("faculty"),
                body.get("advisorName")
        );
        boolean success = Boolean.TRUE.equals(result.get("success"));
        return success ? ResponseEntity.ok(result) : ResponseEntity.badRequest().body(result);
    }

    // ── DELETE /api/advisors/assign/{studentId}/{courseId} ─────────
    @DeleteMapping("/assign/{studentId}/{courseId}")
    public ResponseEntity<Map<String, Object>> removeCourse(
            @PathVariable String studentId,
            @PathVariable String courseId) {
        Map<String, Object> result = advisorService.removeCourse(studentId, courseId);
        boolean success = Boolean.TRUE.equals(result.get("success"));
        return success ? ResponseEntity.ok(result) : ResponseEntity.badRequest().body(result);
    }

    // ── POST /api/advisors/confirm/{studentId} ────────────────────
    /** Confirms and saves advising session for the student to the database. */
    @PostMapping("/confirm/{studentId}")
    public ResponseEntity<Map<String, Object>> confirmAdvising(
            @PathVariable String studentId,
            @RequestBody(required = false) Map<String, String> body) {
        String advisorName = (body != null && body.containsKey("advisorName")) ? body.get("advisorName") : "Advisor";
        Map<String, Object> result = advisorService.confirmAdvising(studentId, advisorName);
        boolean success = Boolean.TRUE.equals(result.get("success"));
        return success ? ResponseEntity.ok(result) : ResponseEntity.badRequest().body(result);
    }

    // ── GET /api/advisors/status/{userId} ──────────────────────────
    /** Returns user role & advisor authorization status. */
    @GetMapping("/status/{userId}")
    public ResponseEntity<Map<String, Object>> getAdvisorStatus(@PathVariable String userId) {
        return ResponseEntity.ok(advisorService.getAdvisorStatus(userId));
    }

    // ── GET /api/advisors/seat-updates ─────────────────────────────
    /** Returns sectionId → total booking count for live seat display in advisor panel. */
    @GetMapping("/seat-updates")
    public ResponseEntity<Map<String, Integer>> getSeatUpdates() {
        return ResponseEntity.ok(advisorService.getSeatUpdates());
    }
}

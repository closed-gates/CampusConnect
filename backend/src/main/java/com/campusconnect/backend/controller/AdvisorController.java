package com.campusconnect.backend.controller;

import com.campusconnect.backend.dto.AdvisorMatchResponse;
import com.campusconnect.backend.model.StudentProfile;
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
 */
@RestController
@RequestMapping("/api/advisors")
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
    @GetMapping("/students")
    public ResponseEntity<List<StudentProfile>> getAllStudents() {
        return ResponseEntity.ok(advisorService.getAllStudents());
    }

    // ── GET /api/advisors/student/{studentId} ──────────────────────
    @GetMapping("/student/{studentId}")
    public ResponseEntity<?> getStudentProfile(@PathVariable String studentId) {
        Optional<StudentProfile> profile = advisorService.getStudentProfile(studentId);
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

    // ── GET /api/advisors/seat-updates ────────────────────────
    /** Returns courseId → additional bookings count for live seat display. */
    @GetMapping("/seat-updates")
    public ResponseEntity<Map<String, Integer>> getSeatUpdates() {
        return ResponseEntity.ok(advisorService.getSeatUpdates());
    }
}

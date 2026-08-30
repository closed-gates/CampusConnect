package com.campusconnect.backend.controller;

import com.campusconnect.backend.service.AdvisorService;
import com.campusconnect.backend.service.BypassCourseService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * BypassCourseController – REST API for Course Bypass and CGPA tracking.
 *
 * MVC Role: Controller
 *
 * Base Path: /api/admin/bypass-course
 * Requires ADMIN authority.
 */
@RestController
@RequestMapping("/api/admin/bypass-course")
@CrossOrigin(origins = "*")
public class BypassCourseController {

    private final BypassCourseService bypassService;
    private final AdvisorService      advisorService;

    public BypassCourseController(BypassCourseService bypassService, AdvisorService advisorService) {
        this.bypassService  = bypassService;
        this.advisorService = advisorService;
    }

    /**
     * POST /api/admin/bypass-course
     * Bypass a course for a student, granting credits and updating CGPA.
     */
    @PostMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<?> bypassCourse(@RequestBody Map<String, Object> req) {
        Map<String, Object> res = bypassService.bypassCourse(req);
        if (Boolean.TRUE.equals(res.get("success"))) {
            return ResponseEntity.ok(res);
        }
        return ResponseEntity.badRequest().body(res);
    }

    /**
     * GET /api/admin/bypass-course/students
     * Returns all students from database with current CGPA, completed credits, and advising status.
     */
    @GetMapping("/students")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getStudents() {
        return ResponseEntity.ok(advisorService.getAllStudentsAsResponse());
    }

    /**
     * GET /api/admin/bypass-course/student/{studentId}
     * Returns a student's full history of completed and bypassed courses.
     */
    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<?> getStudentHistory(@PathVariable String studentId) {
        Map<String, Object> history = bypassService.getStudentHistory(studentId);
        if (Boolean.TRUE.equals(history.get("success"))) {
            return ResponseEntity.ok(history);
        }
        return ResponseEntity.badRequest().body(history);
    }

    /**
     * DELETE /api/admin/bypass-course/{studentId}/{recordId}
     * Reverts a course bypass record and recalculates CGPA & credits.
     */
    @DeleteMapping("/{studentId}/{recordId}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<?> deleteBypassRecord(@PathVariable String studentId, @PathVariable Long recordId) {
        return ResponseEntity.ok(bypassService.deleteBypassRecord(studentId, recordId));
    }
}

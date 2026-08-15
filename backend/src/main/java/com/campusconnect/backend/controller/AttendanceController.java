package com.campusconnect.backend.controller;

import com.campusconnect.backend.model.AttendanceRecord;
import com.campusconnect.backend.service.AttendanceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * AttendanceController – Thin REST handler for attendance-related endpoints.
 *
 * MVC Role: Controller
 *
 * Base URL: /api/attendance
 *
 * All business logic and data management is in {@link AttendanceService}.
 * This controller is responsible only for:
 *   1. Accepting HTTP requests and extracting parameters
 *   2. Delegating to AttendanceService
 *   3. Returning HTTP responses
 *
 * Endpoints:
 *   GET  /api/attendance?courseId=X&date=Y  → get attendance for a course/date
 *   POST /api/attendance                    → mark/update attendance
 *   GET  /api/attendance/summary?courseId=X  → attendance summary stats
 *   GET  /api/attendance/history?courseId=X  → full attendance history
 *
 * TODO (Phase 3 – Auth & RBAC):
 *   - Validate JWT from Authorization header
 *   - Restrict endpoints to FACULTY role only
 */
@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

    private final AttendanceService attendanceService;

    public AttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    // ── GET /api/attendance ───────────────────────────────────────
    /**
     * Returns attendance records for a specific course and date.
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAttendance(
            @RequestParam String courseId,
            @RequestParam String date) {
        List<AttendanceRecord> data = attendanceService.getAttendance(courseId, date);
        return ResponseEntity.ok(Map.of(
            "success", true,
            "count",   data.size(),
            "data",    data
        ));
    }

    // ── POST /api/attendance ──────────────────────────────────────
    /**
     * Mark or update attendance for a student.
     * Faculty only (Phase 3: validate FACULTY role from JWT).
     */
    @PostMapping
    public ResponseEntity<Map<String, Object>> markAttendance(@RequestBody Map<String, String> body) {
        AttendanceRecord record = attendanceService.markAttendance(
            body.get("courseId"),
            body.get("courseName"),
            body.get("studentId"),
            body.get("studentName"),
            body.get("date"),
            body.get("status"),
            body.get("markedBy")
        );
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Attendance marked successfully.",
            "data",    record
        ));
    }

    // ── GET /api/attendance/summary ───────────────────────────────
    /**
     * Returns attendance summary statistics for a course.
     */
    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getCourseSummary(
            @RequestParam String courseId) {
        Map<String, Object> summary = attendanceService.getCourseSummary(courseId);
        return ResponseEntity.ok(Map.of(
            "success", true,
            "data",    summary
        ));
    }

    // ── GET /api/attendance/history ───────────────────────────────
    /**
     * Returns full attendance history for a course, sorted by date descending.
     */
    @GetMapping("/history")
    public ResponseEntity<Map<String, Object>> getCourseHistory(
            @RequestParam String courseId) {
        List<AttendanceRecord> data = attendanceService.getCourseHistory(courseId);
        return ResponseEntity.ok(Map.of(
            "success", true,
            "count",   data.size(),
            "data",    data
        ));
    }
}

package com.campusconnect.backend.controller;

import com.campusconnect.backend.model.AttendanceRecord;
import com.campusconnect.backend.service.AttendanceService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
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
 * All business logic is in AttendanceService.
 *
 * Endpoints:
 *   GET  /api/attendance?courseId=X&date=Y     → get attendance for a course/date
 *   POST /api/attendance                        → mark/update attendance
 *   GET  /api/attendance/summary?courseId=X    → attendance summary stats
 *   GET  /api/attendance/history?courseId=X    → full attendance history
 *   GET  /api/attendance/student/{studentId}   → student attendance report
 *   GET  /api/attendance/faculty-courses       → faculty course list
 *   GET  /api/attendance/enrolled-students     → students enrolled in a course
 *   GET  /api/attendance/student-courses       → student's registered courses + attendance stats
 */
@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

    private final AttendanceService attendanceService;
    private final com.campusconnect.backend.service.AttendanceAccessService accessService;

    public AttendanceController(AttendanceService attendanceService, com.campusconnect.backend.service.AttendanceAccessService accessService) {
        this.attendanceService = attendanceService;
        this.accessService = accessService;
    }

    // ── GET /api/attendance ───────────────────────────────────────
    /**
     * Returns attendance records for a specific course and date.
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAttendance(
            @RequestParam String courseId,
            @RequestParam String date, Authentication authentication) {
        accessService.requireReadSection(authentication.getName(), courseId);
        List<AttendanceRecord> data = attendanceService.getAttendance(accessService.attendanceCourseId(courseId), date);
        return ResponseEntity.ok(Map.of(
            "success", true,
            "count",   data.size(),
            "data",    data
        ));
    }

    // ── POST /api/attendance ──────────────────────────────────────
    /**
     * Mark or update attendance for a student.
     */
    @PostMapping
    public ResponseEntity<Map<String, Object>> markAttendance(@RequestBody Map<String, String> body, Authentication authentication) {
        accessService.requireMarkSection(authentication.getName(), body.get("courseId"));
        var marker = accessService.requireUser(authentication.getName());
        AttendanceRecord record = attendanceService.markAttendance(
            accessService.attendanceCourseId(body.get("courseId")),
            body.get("courseName"),
            body.get("studentId"),
            body.get("studentName"),
            body.get("date"),
            body.get("status"),
            marker.getFullName()
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
            @RequestParam String courseId, Authentication authentication) {
        accessService.requireReadSection(authentication.getName(), courseId);
        Map<String, Object> summary = attendanceService.getCourseSummary(accessService.attendanceCourseId(courseId));
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
            @RequestParam String courseId, Authentication authentication) {
        accessService.requireReadSection(authentication.getName(), courseId);
        List<AttendanceRecord> data = attendanceService.getCourseHistory(accessService.attendanceCourseId(courseId));
        return ResponseEntity.ok(Map.of(
            "success", true,
            "count",   data.size(),
            "data",    data
        ));
    }

    // ── GET /api/attendance/student/{studentId} ───────────────────
    /**
     * Returns student-specific attendance report across all classes.
     */
    @GetMapping("/student/{studentId}")
    public ResponseEntity<Map<String, Object>> getStudentAttendance(
            @PathVariable String studentId, Authentication authentication) {
        accessService.requireStudentSelf(authentication.getName(), studentId);
        Map<String, Object> data = attendanceService.getStudentAttendanceReport(studentId);
        return ResponseEntity.ok(Map.of(
            "success", true,
            "data",    data
        ));
    }

    // ── GET /api/attendance/faculty-courses ────────────────────────
    /**
     * Returns the distinct list of courses a faculty member has taken attendance for.
     * Each entry: { courseId, courseName, studentCount }
     *
     * @param markedBy Faculty name stored during attendance marking
     */
    @GetMapping("/faculty-courses")
    public ResponseEntity<Map<String, Object>> getFacultyCourses(Authentication authentication) {
        var courses = accessService.visibleSections(authentication.getName());
        return ResponseEntity.ok(Map.of(
            "success", true,
            "count",   courses.size(),
            "data",    courses
        ));
    }

    // ── GET /api/attendance/enrolled-students ──────────────────────
    /**
     * Returns the distinct list of students for a course.
     * Merges attendance records AND section_registrations so that
     * newly registered students appear immediately for faculty.
     *
     * @param courseId Course code, e.g. "CSE110"
     */
    @GetMapping("/enrolled-students")
    public ResponseEntity<Map<String, Object>> getEnrolledStudents(
            @RequestParam String courseId, Authentication authentication) {
        accessService.requireReadSection(authentication.getName(), courseId);
        var students = attendanceService.getEnrolledStudents(courseId);
        return ResponseEntity.ok(Map.of(
            "success", true,
            "count",   students.size(),
            "data",    students
        ));
    }

    // ── GET /api/attendance/student-courses ────────────────────────
    /**
     * Returns a student's registered courses with per-course attendance stats.
     * Synced from the Registration/Advising system — adding a course there
     * immediately makes it appear here.
     *
     * Query params:
     *   studentId  – required
     *   term       – optional (omit to get all terms)
     */
    @GetMapping("/student-courses")
    public ResponseEntity<Map<String, Object>> getStudentCourses(
            @RequestParam String studentId,
            @RequestParam(required = false) String term, Authentication authentication) {
        accessService.requireStudentSelf(authentication.getName(), studentId);
        var courses = attendanceService.getStudentCourses(studentId, term);
        return ResponseEntity.ok(Map.of(
            "success", true,
            "count",   courses.size(),
            "data",    courses
        ));
    }
}

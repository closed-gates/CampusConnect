package com.campusconnect.backend.service;

import com.campusconnect.backend.model.AttendanceRecord;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

/**
 * AttendanceService – Business logic for faculty attendance tracking.
 *
 * MVC Role: Service (sits between Controller and Model)
 *
 * Phase 2: In-memory data store with seeded data (no database).
 *
 * TODO (Phase 3 – Database persistence):
 *   - Replace in-memory list with JPA repository: AttendanceRecordRepository
 *   - Add @Transactional where needed
 *   - Add RBAC validation (only FACULTY can mark attendance)
 */
@Service
public class AttendanceService {

    // ── In-memory data store ──────────────────────────────────────
    private final List<AttendanceRecord> records = new ArrayList<>();
    private final AtomicLong idSeq = new AtomicLong(100);

    // ── Seed data ─────────────────────────────────────────────────
    public AttendanceService() {
        // Seed some past attendance records for demo
        String today = LocalDate.now().toString();
        String yesterday = LocalDate.now().minusDays(1).toString();
        String twoDaysAgo = LocalDate.now().minusDays(2).toString();

        // CSE470 — yesterday
        seedRecord("CSE470", "Software Engineering", "21201001", "Arham Khan", yesterday, "PRESENT");
        seedRecord("CSE470", "Software Engineering", "21201002", "Sarah Ahmed", yesterday, "PRESENT");
        seedRecord("CSE470", "Software Engineering", "21201003", "David Kim", yesterday, "ABSENT");
        seedRecord("CSE470", "Software Engineering", "21201004", "Emily Chen", yesterday, "PRESENT");
        seedRecord("CSE470", "Software Engineering", "21201005", "Michael Ross", yesterday, "LATE");

        // CSE470 — two days ago
        seedRecord("CSE470", "Software Engineering", "21201001", "Arham Khan", twoDaysAgo, "PRESENT");
        seedRecord("CSE470", "Software Engineering", "21201002", "Sarah Ahmed", twoDaysAgo, "LATE");
        seedRecord("CSE470", "Software Engineering", "21201003", "David Kim", twoDaysAgo, "PRESENT");
        seedRecord("CSE470", "Software Engineering", "21201004", "Emily Chen", twoDaysAgo, "PRESENT");
        seedRecord("CSE470", "Software Engineering", "21201005", "Michael Ross", twoDaysAgo, "PRESENT");

        // CSE341 — yesterday
        seedRecord("CSE341", "Microprocessors", "21201001", "Arham Khan", yesterday, "PRESENT");
        seedRecord("CSE341", "Microprocessors", "21201006", "Jessica Park", yesterday, "PRESENT");
        seedRecord("CSE341", "Microprocessors", "21201007", "James Wilson", yesterday, "ABSENT");
        seedRecord("CSE341", "Microprocessors", "21201008", "Lily Zhang", yesterday, "PRESENT");
    }

    private void seedRecord(String courseId, String courseName, String studentId,
                            String studentName, String date, String status) {
        records.add(new AttendanceRecord(
            idSeq.getAndIncrement(), courseId, courseName,
            studentId, studentName, date, status,
            "Dr. Mahbubur Rahman", LocalDateTime.now().toString()
        ));
    }

    // ── Get attendance for a course on a given date ───────────────

    /**
     * Returns all attendance records for a specific course and date.
     *
     * @param courseId Course identifier
     * @param date     ISO date string
     * @return List of matching AttendanceRecords
     */
    public List<AttendanceRecord> getAttendance(String courseId, String date) {
        return records.stream()
            .filter(r -> r.getCourseId().equals(courseId) && r.getDate().equals(date))
            .collect(Collectors.toList());
    }

    // ── Get all attendance history for a course ───────────────────

    /**
     * Returns all attendance records for a given course, sorted by date descending.
     *
     * @param courseId Course identifier
     * @return List of AttendanceRecords
     */
    public List<AttendanceRecord> getCourseHistory(String courseId) {
        return records.stream()
            .filter(r -> r.getCourseId().equals(courseId))
            .sorted((a, b) -> b.getDate().compareTo(a.getDate()))
            .collect(Collectors.toList());
    }

    // ── Mark or update attendance ─────────────────────────────────

    /**
     * Marks attendance for a student. Updates if record already exists for that
     * course + student + date combination.
     *
     * @param courseId    Course identifier
     * @param courseName Course display name
     * @param studentId  Student identifier
     * @param studentName Student display name
     * @param date       ISO date string
     * @param status     PRESENT, ABSENT, or LATE
     * @param markedBy   Faculty who marked
     * @return The created or updated AttendanceRecord
     */
    public AttendanceRecord markAttendance(String courseId, String courseName,
                                           String studentId, String studentName,
                                           String date, String status, String markedBy) {
        // Check if record already exists → update
        Optional<AttendanceRecord> existing = records.stream()
            .filter(r -> r.getCourseId().equals(courseId)
                      && r.getStudentId().equals(studentId)
                      && r.getDate().equals(date))
            .findFirst();

        if (existing.isPresent()) {
            AttendanceRecord rec = existing.get();
            rec.setStatus(status != null ? status : "PRESENT");
            rec.setMarkedBy(markedBy != null ? markedBy : "Faculty");
            rec.setMarkedAt(LocalDateTime.now().toString());
            return rec;
        }

        // Create new record
        AttendanceRecord rec = new AttendanceRecord(
            idSeq.getAndIncrement(),
            courseId    != null ? courseId    : "",
            courseName != null ? courseName : "",
            studentId  != null ? studentId  : "",
            studentName != null ? studentName : "",
            date       != null ? date       : LocalDate.now().toString(),
            status     != null ? status     : "PRESENT",
            markedBy   != null ? markedBy   : "Faculty",
            LocalDateTime.now().toString()
        );
        records.add(rec);
        return rec;
    }

    // ── Attendance summary for a course ───────────────────────────

    /**
     * Computes attendance summary stats for a course.
     *
     * @param courseId Course identifier
     * @return Map with summary statistics
     */
    public Map<String, Object> getCourseSummary(String courseId) {
        List<AttendanceRecord> courseRecords = records.stream()
            .filter(r -> r.getCourseId().equals(courseId))
            .collect(Collectors.toList());

        long totalRecords = courseRecords.size();
        long presentCount = courseRecords.stream().filter(r -> "PRESENT".equals(r.getStatus())).count();
        long absentCount  = courseRecords.stream().filter(r -> "ABSENT".equals(r.getStatus())).count();
        long lateCount    = courseRecords.stream().filter(r -> "LATE".equals(r.getStatus())).count();

        long totalDates = courseRecords.stream().map(AttendanceRecord::getDate).distinct().count();

        double attendanceRate = totalRecords > 0
            ? (double)(presentCount + lateCount) / totalRecords * 100
            : 0;

        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("courseId", courseId);
        summary.put("totalRecords", totalRecords);
        summary.put("totalSessions", totalDates);
        summary.put("presentCount", presentCount);
        summary.put("absentCount", absentCount);
        summary.put("lateCount", lateCount);
        summary.put("attendanceRate", Math.round(attendanceRate * 10.0) / 10.0);

        return summary;
    }
}

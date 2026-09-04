package com.campusconnect.backend.service;

import com.campusconnect.backend.model.AttendanceRecord;
import com.campusconnect.backend.model.SectionRegistration;
import com.campusconnect.backend.repository.AttendanceRecordRepository;
import com.campusconnect.backend.repository.SectionRegistrationRepository;
import com.campusconnect.backend.repository.AdvisedCourseRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * AttendanceService – Business logic for faculty attendance tracking.
 *
 * MVC Role: Service (sits between Controller and Repository)
 *
 * Phase 3: Persisted via JPA to the Neon PostgreSQL "attendance_records" table.
 * Seed data is inserted once on first startup using @PostConstruct with a count() guard.
 */
@Service
public class AttendanceService {

    private final AttendanceRecordRepository      repo;
    private final SectionRegistrationRepository   regRepo;
    private final AdvisedCourseRepository          advisedCourseRepo;

    public AttendanceService(AttendanceRecordRepository repo,
                             SectionRegistrationRepository regRepo,
                             AdvisedCourseRepository advisedCourseRepo) {
        this.repo    = repo;
        this.regRepo = regRepo;
        this.advisedCourseRepo = advisedCourseRepo;
    }

    // ── Seed data on first startup ────────────────────────────────
    /**
     * Inserts seed attendance records if the table is empty.
     * Uses a count() == 0 guard so it only runs once per fresh database.
     */
    @PostConstruct
    @Transactional
    public void seedData() {
        if (repo.count() > 0) return;  // Already seeded — skip

        String yesterday   = LocalDate.now().minusDays(1).toString();
        String twoDaysAgo  = LocalDate.now().minusDays(2).toString();
        String fourDaysAgo = LocalDate.now().minusDays(4).toString();
        String marked      = LocalDateTime.now().toString();
        String faculty     = "Dr. Mahbubur Rahman";

        // CSE470 — Software Engineering — yesterday
        save("CSE470", "Software Engineering", "21201001", "Arham Khan",   yesterday,   "PRESENT", faculty, marked);
        save("CSE470", "Software Engineering", "21201002", "Sarah Ahmed",  yesterday,   "PRESENT", faculty, marked);
        save("CSE470", "Software Engineering", "21201003", "David Kim",    yesterday,   "ABSENT",  faculty, marked);
        save("CSE470", "Software Engineering", "21201004", "Emily Chen",   yesterday,   "PRESENT", faculty, marked);
        save("CSE470", "Software Engineering", "21201005", "Michael Ross", yesterday,   "LATE",    faculty, marked);

        // CSE470 — two days ago
        save("CSE470", "Software Engineering", "21201001", "Arham Khan",   twoDaysAgo,  "PRESENT", faculty, marked);
        save("CSE470", "Software Engineering", "21201002", "Sarah Ahmed",  twoDaysAgo,  "LATE",    faculty, marked);
        save("CSE470", "Software Engineering", "21201003", "David Kim",    twoDaysAgo,  "PRESENT", faculty, marked);
        save("CSE470", "Software Engineering", "21201004", "Emily Chen",   twoDaysAgo,  "PRESENT", faculty, marked);
        save("CSE470", "Software Engineering", "21201005", "Michael Ross", twoDaysAgo,  "PRESENT", faculty, marked);

        // CSE470 — four days ago
        save("CSE470", "Software Engineering", "21201001", "Arham Khan",   fourDaysAgo, "PRESENT", faculty, marked);
        save("CSE470", "Software Engineering", "21201002", "Sarah Ahmed",  fourDaysAgo, "PRESENT", faculty, marked);
        save("CSE470", "Software Engineering", "21201003", "David Kim",    fourDaysAgo, "PRESENT", faculty, marked);
        save("CSE470", "Software Engineering", "21201004", "Emily Chen",   fourDaysAgo, "ABSENT",  faculty, marked);
        save("CSE470", "Software Engineering", "21201005", "Michael Ross", fourDaysAgo, "PRESENT", faculty, marked);

        // CSE341 — Microprocessors — yesterday
        save("CSE341", "Microprocessors", "21201001", "Arham Khan",   yesterday, "PRESENT", faculty, marked);
        save("CSE341", "Microprocessors", "21201006", "Jessica Park", yesterday, "PRESENT", faculty, marked);
        save("CSE341", "Microprocessors", "21201007", "James Wilson", yesterday, "ABSENT",  faculty, marked);
        save("CSE341", "Microprocessors", "21201008", "Lily Zhang",   yesterday, "PRESENT", faculty, marked);

        // CSE341 — three days ago
        save("CSE341", "Microprocessors", "21201001", "Arham Khan",   LocalDate.now().minusDays(3).toString(), "LATE",    faculty, marked);
        save("CSE341", "Microprocessors", "21201006", "Jessica Park", LocalDate.now().minusDays(3).toString(), "PRESENT", faculty, marked);
        save("CSE341", "Microprocessors", "21201007", "James Wilson", LocalDate.now().minusDays(3).toString(), "PRESENT", faculty, marked);
        save("CSE341", "Microprocessors", "21201008", "Lily Zhang",   LocalDate.now().minusDays(3).toString(), "PRESENT", faculty, marked);

        // CSE221 — Data Structures — two days ago
        save("CSE221", "Data Structures", "21201001", "Arham Khan",   twoDaysAgo, "PRESENT", faculty, marked);
        save("CSE221", "Data Structures", "21201002", "Sarah Ahmed",  twoDaysAgo, "PRESENT", faculty, marked);
        save("CSE221", "Data Structures", "21201006", "Jessica Park", twoDaysAgo, "ABSENT",  faculty, marked);
        save("CSE221", "Data Structures", "21201009", "Omar Faruk",   twoDaysAgo, "PRESENT", faculty, marked);
        save("CSE221", "Data Structures", "21201010", "Nadia Rahman", twoDaysAgo, "LATE",    faculty, marked);
        save("CSE221", "Data Structures", "21201011", "Chris Lee",    twoDaysAgo, "PRESENT", faculty, marked);
    }

    /** Helper to build and persist a single record */
    private void save(String courseId, String courseName, String studentId, String studentName,
                      String date, String status, String markedBy, String markedAt) {
        AttendanceRecord rec = new AttendanceRecord();
        rec.setCourseId(courseId);
        rec.setCourseName(courseName);
        rec.setStudentId(studentId);
        rec.setStudentName(studentName);
        rec.setDate(date);
        rec.setStatus(status);
        rec.setMarkedBy(markedBy);
        rec.setMarkedAt(markedAt);
        repo.save(rec);
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
        return repo.findByCourseIdAndDate(courseId, date);
    }

    // ── Get all attendance history for a course ───────────────────

    /**
     * Returns all attendance records for a given course, sorted by date descending.
     *
     * @param courseId Course identifier
     * @return List of AttendanceRecords
     */
    public List<AttendanceRecord> getCourseHistory(String courseId) {
        return repo.findByCourseIdOrderByDateDesc(courseId);
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
    @Transactional
    public AttendanceRecord markAttendance(String courseId, String courseName,
                                           String studentId, String studentName,
                                           String date, String status, String markedBy) {
        // Check if record already exists → update
        AttendanceRecord existing = repo.findByCourseIdAndStudentIdAndDate(courseId, studentId, date);

        if (existing != null) {
            existing.setStatus(status != null ? status : "PRESENT");
            existing.setMarkedBy(markedBy != null ? markedBy : "Faculty");
            existing.setMarkedAt(LocalDateTime.now().toString());
            return repo.save(existing);
        }

        // Create new record
        AttendanceRecord rec = new AttendanceRecord();
        rec.setCourseId(courseId    != null ? courseId    : "");
        rec.setCourseName(courseName != null ? courseName : "");
        rec.setStudentId(studentId  != null ? studentId  : "");
        rec.setStudentName(studentName != null ? studentName : "");
        rec.setDate(date            != null ? date       : LocalDate.now().toString());
        rec.setStatus(status        != null ? status     : "PRESENT");
        rec.setMarkedBy(markedBy    != null ? markedBy   : "Faculty");
        rec.setMarkedAt(LocalDateTime.now().toString());
        return repo.save(rec);
    }

    // ── Attendance summary for a course ───────────────────────────

    /**
     * Computes attendance summary stats for a course.
     *
     * @param courseId Course identifier
     * @return Map with summary statistics
     */
    public Map<String, Object> getCourseSummary(String courseId) {
        List<AttendanceRecord> courseRecords = repo.findByCourseIdOrderByDateDesc(courseId);

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

    // ── Student Attendance Report & History ───────────────────────

    /**
     * Computes comprehensive student-specific attendance report across all classes.
     *
     * @param studentId The student ID
     * @return Map with overall stats, course breakdown, and detailed session history
     */
    public Map<String, Object> getStudentAttendanceReport(String studentId) {
        List<AttendanceRecord> records = repo.findByStudentIdOrderByDateDesc(studentId);
        // Fallback for STU001 or primary student alias
        if (records.isEmpty() && ("STU001".equalsIgnoreCase(studentId) || "usr_eusha_001".equalsIgnoreCase(studentId))) {
            records = repo.findByStudentIdOrderByDateDesc("21201001");
        }

        long totalSessions = records.size();
        long presentCount  = records.stream().filter(r -> "PRESENT".equalsIgnoreCase(r.getStatus())).count();
        long lateCount     = records.stream().filter(r -> "LATE".equalsIgnoreCase(r.getStatus())).count();
        long absentCount   = records.stream().filter(r -> "ABSENT".equalsIgnoreCase(r.getStatus())).count();

        double attendanceRate = totalSessions > 0
                ? (double) (presentCount + lateCount) / totalSessions * 100.0
                : 87.5;

        // Group by course for individual course metrics
        Map<String, List<AttendanceRecord>> byCourse = records.stream()
                .collect(Collectors.groupingBy(AttendanceRecord::getCourseId, LinkedHashMap::new, Collectors.toList()));

        List<Map<String, Object>> courseBreakdown = new ArrayList<>();
        for (Map.Entry<String, List<AttendanceRecord>> entry : byCourse.entrySet()) {
            String courseId = entry.getKey();
            List<AttendanceRecord> cList = entry.getValue();
            long cTotal   = cList.size();
            long cPresent = cList.stream().filter(r -> "PRESENT".equalsIgnoreCase(r.getStatus())).count();
            long cLate    = cList.stream().filter(r -> "LATE".equalsIgnoreCase(r.getStatus())).count();
            long cAbsent  = cList.stream().filter(r -> "ABSENT".equalsIgnoreCase(r.getStatus())).count();
            double cRate  = cTotal > 0 ? (double) (cPresent + cLate) / cTotal * 100.0 : 0.0;
            String courseName = cList.isEmpty() ? courseId : cList.get(0).getCourseName();

            Map<String, Object> cMap = new LinkedHashMap<>();
            cMap.put("courseId",       courseId);
            cMap.put("courseName",     courseName);
            cMap.put("totalSessions",  cTotal);
            cMap.put("presentCount",   cPresent);
            cMap.put("lateCount",      cLate);
            cMap.put("absentCount",    cAbsent);
            cMap.put("attendanceRate", Math.round(cRate * 10.0) / 10.0);
            courseBreakdown.add(cMap);
        }

        Map<String, Object> report = new LinkedHashMap<>();
        report.put("studentId",       studentId);
        report.put("totalSessions",   totalSessions);
        report.put("presentCount",    presentCount);
        report.put("lateCount",       lateCount);
        report.put("absentCount",     absentCount);
        report.put("attendanceRate",  Math.round(attendanceRate * 10.0) / 10.0);
        report.put("courseBreakdown", courseBreakdown);
        report.put("history",         records);
        return report;
    }

    // ── Faculty Course List ────────────────────────────────────


    /**
     * Returns the distinct list of courses that a faculty member has taken attendance for.
     * Each entry contains courseId, courseName, and studentCount.
     *
     * @param markedBy Faculty name identifier (stored in markedBy field)
     * @return List of course summary maps
     */
    public List<Map<String, Object>> getFacultyCourses(String markedBy) {
        List<AttendanceRecord> allRecords = repo.findByMarkedBy(markedBy);

        // Collect distinct courseId → courseName
        Map<String, String> courseNames = new LinkedHashMap<>();
        for (AttendanceRecord r : allRecords) {
            courseNames.putIfAbsent(r.getCourseId(), r.getCourseName());
        }

        List<Map<String, Object>> result = new ArrayList<>();
        for (Map.Entry<String, String> entry : courseNames.entrySet()) {
            String courseId = entry.getKey();
            // Count distinct students for this course
            long studentCount = allRecords.stream()
                    .filter(r -> courseId.equals(r.getCourseId()))
                    .map(AttendanceRecord::getStudentId)
                    .distinct()
                    .count();

            Map<String, Object> courseMap = new LinkedHashMap<>();
            courseMap.put("courseId",      courseId);
            courseMap.put("courseName",    entry.getValue());
            courseMap.put("studentCount",  studentCount);
            result.add(courseMap);
        }
        return result;
    }

    // ── Enrolled Students per Course ──────────────────────────

    /**
     * Returns the distinct list of students for a given course.
     * Merges two sources:
     *   1. Students who already have attendance records (attendance_records table)
     *   2. Students registered for the section via the registration system
     *      (section_registrations table — courseId = section.code, e.g. "CSE110")
     *
     * This ensures that when a student registers via the Advising feature, they
     * immediately appear in the faculty's attendance marking list.
     *
     * @param courseId Course code, e.g. "CSE110"
     * @return Deduplicated list of { studentId, studentName }
     */
    public List<Map<String, String>> getEnrolledStudents(String courseId) {
        // Source 1: students with existing attendance records
        List<AttendanceRecord> records = repo.findByCourseIdOrderByDateDesc(courseId);
        Map<String, String> studentMap = new LinkedHashMap<>();
        for (AttendanceRecord r : records) {
            studentMap.putIfAbsent(r.getStudentId(), r.getStudentName());
        }

        // Source 2: students registered via the Registration/Advising feature
        // section.code == courseId (e.g. "CSE110"), all terms
        List<SectionRegistration> registrations = regRepo.findAll().stream()
                .filter(sr -> sr.getSection() != null &&
                              (courseId.equalsIgnoreCase(sr.getSection().getCode()) ||
                               courseId.equalsIgnoreCase(sr.getSection().getId())))
                .collect(Collectors.toList());

        for (SectionRegistration sr : registrations) {
            // Use studentId as both key and fallback name if unknown
            studentMap.putIfAbsent(sr.getStudentId(), sr.getStudentId());
        }

        advisedCourseRepo.findAll().stream()
                .filter(ac -> courseId.equalsIgnoreCase(ac.getCourseCode()) || courseId.equalsIgnoreCase(ac.getSectionId()))
                .forEach(ac -> studentMap.putIfAbsent(ac.getStudentProfile().getStudentId(), ac.getStudentProfile().getStudentName()));

        List<Map<String, String>> result = new ArrayList<>();
        for (Map.Entry<String, String> entry : studentMap.entrySet()) {
            Map<String, String> s = new LinkedHashMap<>();
            s.put("studentId",   entry.getKey());
            s.put("studentName", entry.getValue());
            result.add(s);
        }
        return result;
    }

    // ── Student course list (from registration) + attendance stats ─

    /**
     * Returns a student's registered courses merged with their attendance stats.
     * Used by the student attendance view to show per-course attendance.
     *
     * For each registered course:
     *   - courseId, courseName, section info (from section_registrations)
     *   - totalSessions, presentCount, absentCount, lateCount, attendanceRate
     *     (from attendance_records for that student + course)
     *
     * @param studentId Student identifier
     * @param term      Academic term, e.g. "Fall2026" (optional; all terms if null)
     * @return List of course attendance maps
     */
    public List<Map<String, Object>> getStudentCourses(String studentId, String term) {
        // Fetch all registrations for this student
        List<SectionRegistration> registrations;
        if (term != null && !term.isBlank()) {
            registrations = regRepo.findByStudentIdAndTerm(studentId, term);
        } else {
            registrations = regRepo.findAll().stream()
                    .filter(sr -> studentId.equals(sr.getStudentId()))
                    .collect(Collectors.toList());
        }

        // Fetch all attendance records for this student once
        List<AttendanceRecord> allRecords = repo.findByStudentIdOrderByDateDesc(studentId);

        // Fallback: STU001 maps to actual seeded student id 21201001
        if (allRecords.isEmpty() &&
                ("STU001".equalsIgnoreCase(studentId) || "usr_eusha_001".equalsIgnoreCase(studentId))) {
            allRecords = repo.findByStudentIdOrderByDateDesc("21201001");
        }

        // Group attendance records by courseId
        Map<String, List<AttendanceRecord>> byCourse = allRecords.stream()
                .collect(Collectors.groupingBy(AttendanceRecord::getCourseId));

        List<Map<String, Object>> result = new ArrayList<>();

        // De-duplicate by course code so we don't show the same course twice
        Set<String> seenCodes = new LinkedHashSet<>();
        for (SectionRegistration sr : registrations) {
            if (sr.getSection() == null) continue;
            String code = sr.getSection().getCode();
            if (!seenCodes.add(code)) continue;

            String title = sr.getSection().getTitle();

            List<AttendanceRecord> courseRecs = byCourse.getOrDefault(code, Collections.emptyList());
            long total   = courseRecs.size();
            long present = courseRecs.stream().filter(r -> "PRESENT".equalsIgnoreCase(r.getStatus())).count();
            long late    = courseRecs.stream().filter(r -> "LATE".equalsIgnoreCase(r.getStatus())).count();
            long absent  = courseRecs.stream().filter(r -> "ABSENT".equalsIgnoreCase(r.getStatus())).count();
            double rate  = total > 0 ? (double)(present + late) / total * 100.0 : 0.0;

            Map<String, Object> courseMap = new LinkedHashMap<>();
            courseMap.put("courseId",       code);
            courseMap.put("courseName",     title);
            courseMap.put("section",        sr.getSection().getSection());
            courseMap.put("faculty",        sr.getSection().getFaculty());
            courseMap.put("totalSessions",  total);
            courseMap.put("presentCount",   present);
            courseMap.put("lateCount",      late);
            courseMap.put("absentCount",    absent);
            courseMap.put("attendanceRate", Math.round(rate * 10.0) / 10.0);
            result.add(courseMap);
        }

        // Advisor-assigned courses are authoritative even before a student
        // completes self-registration for the section.
        var advisedCourses = term != null && !term.isBlank()
                ? advisedCourseRepo.findForTerm(studentId, term)
                : advisedCourseRepo.findByStudentProfile_StudentId(studentId);
        for (var advised : advisedCourses) {
            String code = advised.getCourseCode();
            if (!seenCodes.add(code)) continue;
            List<AttendanceRecord> courseRecs = byCourse.getOrDefault(code, Collections.emptyList());
            long total = courseRecs.size();
            long present = courseRecs.stream().filter(r -> "PRESENT".equalsIgnoreCase(r.getStatus())).count();
            long late = courseRecs.stream().filter(r -> "LATE".equalsIgnoreCase(r.getStatus())).count();
            long absent = courseRecs.stream().filter(r -> "ABSENT".equalsIgnoreCase(r.getStatus())).count();
            double rate = total > 0 ? (double) (present + late) / total * 100.0 : 0.0;
            Map<String, Object> courseMap = new LinkedHashMap<>();
            courseMap.put("courseId", code); courseMap.put("courseName", advised.getCourseTitle());
            courseMap.put("section", advised.getSection()); courseMap.put("faculty", advised.getFaculty());
            courseMap.put("totalSessions", total); courseMap.put("presentCount", present);
            courseMap.put("lateCount", late); courseMap.put("absentCount", absent);
            courseMap.put("attendanceRate", Math.round(rate * 10.0) / 10.0);
            result.add(courseMap);
        }
        return result;
    }
}

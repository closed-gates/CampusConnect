package com.campusconnect.backend.service;

import com.campusconnect.backend.dto.AdvisorMatchResponse;
import com.campusconnect.backend.model.AdvisedCourse;
import com.campusconnect.backend.model.Advisor;
import com.campusconnect.backend.model.StudentProfile;
import com.campusconnect.backend.repository.AdvisedCourseRepository;
import com.campusconnect.backend.repository.AdvisorRepository;
import com.campusconnect.backend.repository.CourseSectionRepository;
import com.campusconnect.backend.repository.StudentProfileRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * AdvisorService – Business logic for advisor matching and course assignment.
 *
 * MVC Role: Service (sits between Controller and Repository)
 *
 * Phase 3: Fully database-backed via Neon PostgreSQL.
 * All in-memory stores replaced with JPA repositories.
 * Seed data moved to data.sql (idempotent INSERT WHERE NOT EXISTS blocks).
 *
 * Rules enforced by assignCourse():
 *   – Max 5 courses (3 if on probation)
 *   – Credit limit per CGPA tier
 *   – No schedule clashes (same day + same time slot)
 *   – No duplicate course code already assigned
 *
 * REST API shape is unchanged — AdvisorController requires no modification.
 */
@Service
public class AdvisorService {

    private final AdvisorRepository         advisorRepo;
    private final StudentProfileRepository  studentRepo;
    private final AdvisedCourseRepository   advisedCourseRepo;
    private final CourseSectionRepository   sectionRepo;

    public AdvisorService(AdvisorRepository advisorRepo,
                          StudentProfileRepository studentRepo,
                          AdvisedCourseRepository advisedCourseRepo,
                          CourseSectionRepository sectionRepo) {
        this.advisorRepo       = advisorRepo;
        this.studentRepo       = studentRepo;
        this.advisedCourseRepo = advisedCourseRepo;
        this.sectionRepo       = sectionRepo;
    }

    // ── Advisor matching ──────────────────────────────────────────

    /**
     * Returns a ranked list of advisors filtered by department and/or year.
     * Scoring: +50 if department matches, +5 per available day.
     */
    public AdvisorMatchResponse matchAdvisors(String department, Integer year) {
        List<Advisor> all = (department != null && !department.isBlank())
                ? advisorRepo.findByDepartmentIgnoreCase(department)
                : advisorRepo.findAll();

        List<Advisor> scored = all.stream()
            .map(a -> {
                int score = 0;
                if (department != null && !department.isBlank()
                        && a.getDepartment().equalsIgnoreCase(department)) score += 50;
                score += a.getAvailableDays().size() * 5;
                a.setMatchScore(score);
                return a;
            })
            .sorted(Comparator.comparingInt(Advisor::getMatchScore).reversed())
            .collect(Collectors.toList());

        String matchedOn = (department != null && !department.isBlank())
                ? "department: " + department
                : "all advisors";
        return new AdvisorMatchResponse(true, scored.size(), matchedOn, scored);
    }

    // ── Student profile ───────────────────────────────────────────

    /** Returns all student profiles ordered by completed credits (priority order). */
    public List<StudentProfile> getAllStudents() {
        return studentRepo.findAllByPriority();
    }

    /** Returns all students as response maps (for AdvisorController). */
    public List<Map<String, Object>> getAllStudentsAsResponse() {
        return studentRepo.findAllByPriority().stream()
                .map(this::buildProfileResponse)
                .collect(Collectors.toList());
    }

    /** Returns a single student profile by ID, with their advised courses loaded. */
    public Optional<StudentProfile> getStudentProfile(String studentId) {
        return studentRepo.findById(studentId);
    }

    /** Returns a single student as response map (for AdvisorController). */
    public Optional<Map<String, Object>> getStudentProfileAsResponse(String studentId) {
        return studentRepo.findById(studentId).map(this::buildProfileResponse);
    }

    // ── Course assignment ─────────────────────────────────────────

    /**
     * Assigns a course section to a student after validating all business rules.
     *
     * @return Map with "success" (bool), "message" (string), optionally "profile" and "seatUpdates"
     */
    @Transactional
    public Map<String, Object> assignCourse(String studentId, String courseId,
                                             String courseCode, String courseTitle,
                                             String section,   String time,
                                             String room,      String faculty,
                                             String advisorName) {
        Map<String, Object> result = new LinkedHashMap<>();

        StudentProfile profile = studentRepo.findById(studentId).orElse(null);
        if (profile == null) {
            result.put("success", false);
            result.put("message", "Student not found: " + studentId);
            return result;
        }

        List<AdvisedCourse> current = profile.getAdvisedCourses();

        // Rule 1: Max course count
        if (current.size() >= profile.getCourseLimit()) {
            result.put("success", false);
            result.put("message", profile.isOnProbation()
                    ? "Probationary students can only be assigned up to "
                        + StudentProfile.PROBATION_MAX_COURSES + " courses."
                    : profile.getCgpa() >= StudentProfile.CGPA_HIGH_THRESHOLD
                        ? "Maximum of " + StudentProfile.HIGH_MAX_COURSES + " courses reached (CGPA ≥ 3.5)."
                        : "Maximum of " + StudentProfile.STANDARD_MAX_COURSES + " courses reached (CGPA < 3.5).");
            return result;
        }

        // Rule 2: Credit limit
        int newCredits = profile.getCurrentCredits() + StudentProfile.CREDITS_PER_COURSE;
        if (newCredits > profile.getCreditLimit()) {
            result.put("success", false);
            result.put("message", "Credit limit of " + profile.getCreditLimit() + " credits would be exceeded.");
            return result;
        }

        // Rule 3: Duplicate course code
        if (advisedCourseRepo.existsByStudentProfile_StudentIdAndCourseCode(studentId, courseCode)) {
            result.put("success", false);
            result.put("message", "Student already has a section of " + courseCode + " assigned.");
            return result;
        }

        // Rule 4: Schedule clash
        String clashWith = detectClash(time, current);
        if (clashWith != null) {
            result.put("success", false);
            result.put("message", "Schedule clash with " + clashWith + ". Same day and time slot.");
            return result;
        }

        // All checks passed — persist assignment
        AdvisedCourse ac = AdvisedCourse.builder()
                .sectionId(courseId)
                .studentProfile(profile)
                .courseCode(courseCode)
                .courseTitle(courseTitle)
                .section(section)
                .credits(StudentProfile.CREDITS_PER_COURSE)
                .time(time)
                .room(room)
                .faculty(faculty)
                .assignedAt(LocalDateTime.now().toString())
                .assignedBy(advisorName != null ? advisorName : "Advisor")
                .build();
        advisedCourseRepo.save(ac);

        // Refresh profile so the returned object includes the new course
        StudentProfile refreshed = studentRepo.findById(studentId).orElse(profile);

        result.put("success", true);
        result.put("message", courseCode + " – " + courseTitle + " (Sec " + section + ") assigned successfully.");
        result.put("profile", buildProfileResponse(refreshed));
        // seatUpdates: the advisor panel uses this to decrement seat counts in its UI
        result.put("seatUpdates", buildSeatUpdates(refreshed));
        return result;
    }

    /**
     * Removes an advised course from a student's list.
     */
    @Transactional
    public Map<String, Object> removeCourse(String studentId, String courseId) {
        Map<String, Object> result = new LinkedHashMap<>();

        StudentProfile profile = studentRepo.findById(studentId).orElse(null);
        if (profile == null) {
            result.put("success", false);
            result.put("message", "Student not found.");
            return result;
        }

        // courseId is the Long PK of advised_courses row
        Long acId;
        try {
            acId = Long.parseLong(courseId);
        } catch (NumberFormatException e) {
            result.put("success", false);
            result.put("message", "Invalid course assignment ID.");
            return result;
        }

        int deleted = advisedCourseRepo.deleteByIdAndStudentId(acId, studentId);
        if (deleted > 0) {
            StudentProfile refreshed = studentRepo.findById(studentId).orElse(profile);
            result.put("success", true);
            result.put("message", "Course removed successfully.");
            result.put("profile", buildProfileResponse(refreshed));
            result.put("seatUpdates", buildSeatUpdates(refreshed));
        } else {
            result.put("success", false);
            result.put("message", "Course not found in student's assignment list.");
        }
        return result;
    }

    /**
     * Returns a map of sectionId → booking count for all assigned courses
     * of a given student (used by the advisor panel to show live seat counts).
     */
    public Map<String, Integer> getSeatUpdates() {
        // Aggregate across all students: sectionId → count of assignments
        List<AdvisedCourse> all = advisedCourseRepo.findAll();
        Map<String, Integer> counts = new LinkedHashMap<>();
        for (AdvisedCourse ac : all) {
            counts.merge(ac.getSectionId(), 1, Integer::sum);
        }
        return counts;
    }

    // ── Private helpers ───────────────────────────────────────────

    /**
     * Builds the profile response DTO shape expected by the frontend.
     * The frontend expects { studentId, studentName, cgpa, creditLimit, courseLimit,
     * advisedCourses: [{id, courseCode, courseTitle, section, time, room, faculty}] }
     */
    private Map<String, Object> buildProfileResponse(StudentProfile profile) {
        Map<String, Object> p = new LinkedHashMap<>();
        p.put("studentId",       profile.getStudentId());
        p.put("studentName",     profile.getStudentName());
        p.put("email",           profile.getEmail());
        p.put("department",      profile.getDepartment());
        p.put("year",            profile.getYear());
        p.put("cgpa",            profile.getCgpa());
        p.put("completedCredits",profile.getCompletedCredits());
        p.put("onProbation",     profile.isOnProbation());
        p.put("courseLimit",     profile.getCourseLimit());
        p.put("creditLimit",     profile.getCreditLimit());

        List<Map<String, Object>> courses = profile.getAdvisedCourses().stream().map(ac -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id",          ac.getId().toString()); // String for frontend compatibility
            m.put("sectionId",   ac.getSectionId());
            m.put("courseCode",  ac.getCourseCode());
            m.put("courseTitle", ac.getCourseTitle());
            m.put("section",     ac.getSection());
            m.put("credits",     ac.getCredits());
            m.put("time",        ac.getTime());
            m.put("room",        ac.getRoom());
            m.put("faculty",     ac.getFaculty());
            m.put("assignedAt",  ac.getAssignedAt());
            m.put("assignedBy",  ac.getAssignedBy());
            return m;
        }).collect(Collectors.toList());
        p.put("advisedCourses", courses);
        return p;
    }

    /** Builds the seatUpdates map for the advisor panel live seat display. */
    private Map<String, Integer> buildSeatUpdates(StudentProfile profile) {
        Map<String, Integer> su = new LinkedHashMap<>();
        for (AdvisedCourse ac : profile.getAdvisedCourses()) {
            su.merge(ac.getSectionId(), 1, Integer::sum);
        }
        return su;
    }

    /**
     * Detects schedule clashes between the proposed time slot and existing assignments.
     * Returns the conflicting course code, or null if no clash.
     */
    private String detectClash(String newTime, List<AdvisedCourse> existing) {
        Set<String> newCells = timeToCells(newTime);
        for (AdvisedCourse ex : existing) {
            Set<String> exCells = timeToCells(ex.getTime());
            for (String cell : newCells) {
                if (exCells.contains(cell)) return ex.getCourseCode() + " (Sec " + ex.getSection() + ")";
            }
        }
        return null;
    }

    private Set<String> timeToCells(String time) {
        Set<String> cells = new LinkedHashSet<>();
        if (time == null || time.isBlank()) return cells;

        Map<String, String> dayMap = Map.of(
                "SUN", "Sunday", "MON", "Monday", "TUE", "Tuesday",
                "WED", "Wednesday", "THU", "Thursday", "FRI", "Friday", "SAT", "Saturday");

        // Format 1: BRACU format "SUNDAY(8:00 AM-9:20 AM-09A-05C) ; TUESDAY(8:00 AM-9:20 AM-09A-05C)"
        if (time.contains("(") && time.contains(")")) {
            String[] segments = time.split(";");
            Pattern timePattern = Pattern.compile("(\\d{1,2}:\\d{2}\\s*[AP]M\\s*-\\s*\\d{1,2}:\\d{2}\\s*[AP]M)");
            for (String seg : segments) {
                String trimmed = seg.trim();
                int parenIdx = trimmed.indexOf('(');
                if (parenIdx > 0) {
                    String rawDay = trimmed.substring(0, parenIdx).trim().toUpperCase();
                    String day = null;
                    for (Map.Entry<String, String> entry : dayMap.entrySet()) {
                        if (rawDay.contains(entry.getKey())) {
                            day = entry.getValue();
                            break;
                        }
                    }
                    Matcher m = timePattern.matcher(trimmed);
                    if (day != null && m.find()) {
                        String slot = m.group(1).replaceAll("\\s+", " ").trim();
                        cells.add(day + "|" + slot);
                    }
                }
            }
            if (!cells.isEmpty()) return cells;
        }

        // Format 2: Legacy format "SUN-TUE 08:00 AM-09:20 AM"
        String[] parts = time.split(" ");
        if (parts.length >= 3) {
            String timeSlot = parts[parts.length - 3] + " " + parts[parts.length - 2] + " " + parts[parts.length - 1];
            String dayStr = parts[0].toUpperCase();
            for (Map.Entry<String, String> entry : dayMap.entrySet()) {
                if (dayStr.contains(entry.getKey())) {
                    cells.add(entry.getValue() + "|" + timeSlot);
                }
            }
        }
        return cells;
    }
}

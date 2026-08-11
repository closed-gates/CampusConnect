package com.campusconnect.backend.service;

import com.campusconnect.backend.dto.AdvisorMatchResponse;
import com.campusconnect.backend.model.AdvisedCourse;
import com.campusconnect.backend.model.Advisor;
import com.campusconnect.backend.model.StudentProfile;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * AdvisorService – Business logic for advisor matching and course assignment.
 *
 * MVC Role: Service (sits between Controller and Model)
 *
 * Phase 2: In-memory data store with seeded advisor and student data.
 *
 * Rules enforced by assignCourse():
 *   – Max 5 courses (3 if on probation)
 *   – Max 18 credits (12 if on probation) — 3 credits per section
 *   – No schedule clashes (same day + same time slot)
 *   – No duplicate course code already assigned
 *
 * TODO (Phase 3): Replace in-memory stores with JPA repositories.
 */
@Service
public class AdvisorService {

    // ── In-memory stores ──────────────────────────────────────────
    private final List<Advisor>               advisors        = new ArrayList<>();
    private final Map<String, StudentProfile> studentProfiles = new LinkedHashMap<>();
    /** Tracks how many times each courseId has been assigned (across all students). */
    private final Map<String, Integer>        seatBookings    = new LinkedHashMap<>();

    // ── Seed data ─────────────────────────────────────────────────
    public AdvisorService() {
        seedAdvisors();
        seedStudents();
    }

    private void seedAdvisors() {
        advisors.add(new Advisor(1L, "Dr. Sarah Ahmed", "Associate Professor & Academic Advisor", "cse",
                "Computer Science & Engineering",
                List.of("Software Engineering", "Machine Learning", "Career Planning"),
                List.of("Monday", "Wednesday", "Friday"), "9:00 AM – 3:00 PM",
                "s.ahmed@campusconnect.edu",
                "Dr. Ahmed has 10+ years of experience advising CSE students on course selection, research opportunities, and career pathways in software and AI."));

        advisors.add(new Advisor(2L, "Prof. Tariq Hassan", "Senior Lecturer & Academic Advisor", "cse",
                "Computer Science & Engineering",
                List.of("Data Structures", "Competitive Programming", "Graduate School"),
                List.of("Tuesday", "Thursday"), "10:00 AM – 4:00 PM",
                "t.hassan@campusconnect.edu",
                "Prof. Hassan specializes in guiding students through advanced CSE coursework and graduate admissions."));

        advisors.add(new Advisor(3L, "Dr. Ayan Das", "Associate Professor & Academic Advisor", "eee",
                "Electrical & Electronic Engineering",
                List.of("Circuit Design", "Embedded Systems", "Power Electronics"),
                List.of("Monday", "Tuesday", "Thursday"), "11:00 AM – 5:00 PM",
                "a.das@campusconnect.edu",
                "Dr. Das advises EEE students on lab-intensive courses and industry placements."));

        advisors.add(new Advisor(4L, "Dr. Meena Akter", "Professor & Academic Advisor", "bba",
                "Business Administration",
                List.of("Marketing", "Entrepreneurship", "International Business"),
                List.of("Monday", "Wednesday", "Friday"), "10:00 AM – 2:00 PM",
                "m.akter@campusconnect.edu",
                "Dr. Akter guides BBA students in selecting electives aligned with their career goals."));

        advisors.add(new Advisor(5L, "Prof. Dina Alam", "Head of Academic Affairs", "arch",
                "Architecture & Planning",
                List.of("Architectural Design", "Urban Planning", "Studio Projects"),
                List.of("Tuesday", "Thursday", "Saturday"), "9:00 AM – 1:00 PM",
                "d.alam@campusconnect.edu",
                "Prof. Alam helps Architecture students balance studio workloads and build portfolios."));

        advisors.add(new Advisor(6L, "Dr. Karim Hossain", "Academic Advisor & Research Mentor", "math",
                "Mathematics & Physics",
                List.of("Applied Mathematics", "Research Methods", "Graduate Admissions"),
                List.of("Monday", "Wednesday", "Thursday", "Friday"), "8:00 AM – 12:00 PM",
                "k.hossain@campusconnect.edu",
                "Dr. Hossain advises Math & Physics students on research projects and graduate admissions."));

        advisors.add(new Advisor(7L, "Prof. Jabir Khan", "Academic Advisor", "eco",
                "Economics",
                List.of("Macroeconomics", "Development Economics", "Policy Analysis"),
                List.of("Monday", "Tuesday", "Friday"), "1:00 PM – 5:00 PM",
                "j.khan@campusconnect.edu",
                "Prof. Khan guides Economics students in research and career preparation."));

        advisors.add(new Advisor(8L, "Dr. Sonia Rahman", "Academic Advisor & Career Counsellor", "eng",
                "English & Literature",
                List.of("Academic Writing", "Creative Writing", "Media & Communications"),
                List.of("Wednesday", "Thursday", "Friday"), "11:00 AM – 3:00 PM",
                "s.rahman@campusconnect.edu",
                "Dr. Rahman supports English students with course planning and career paths."));
    }

    private void seedStudents() {
        StudentProfile s1 = new StudentProfile(
                "STU001", "Eusha Kayenat", "eusha@campusconnect.edu",
                "Computer Science & Engineering", 2, 3.45, 48, false);
        studentProfiles.put(s1.getStudentId(), s1);

        StudentProfile s2 = new StudentProfile(
                "STU002", "Arham Hossain", "arham@campusconnect.edu",
                "Computer Science & Engineering", 3, 1.85, 90, true); // on probation
        studentProfiles.put(s2.getStudentId(), s2);

        StudentProfile s3 = new StudentProfile(
                "STU003", "Nafiz Rahman", "nafiz@campusconnect.edu",
                "Electrical & Electronic Engineering", 2, 3.72, 54, false);
        studentProfiles.put(s3.getStudentId(), s3);

        StudentProfile s4 = new StudentProfile(
                "STU004", "Sadia Islam", "sadia@campusconnect.edu",
                "Business Administration", 1, 2.10, 18, false);
        studentProfiles.put(s4.getStudentId(), s4);
    }

    // ── Advisor matching ──────────────────────────────────────────

    public AdvisorMatchResponse matchAdvisors(String department, Integer year) {
        List<Advisor> scored = advisors.stream()
            .map(a -> {
                Advisor copy = new Advisor(a.getId(), a.getName(), a.getTitle(),
                        a.getDepartment(), a.getDepartmentLabel(), a.getSpecialties(),
                        a.getAvailableDays(), a.getAvailableHours(), a.getEmail(), a.getBio());
                int score = 0;
                if (department != null && !department.isBlank()
                        && a.getDepartment().equalsIgnoreCase(department)) score += 50;
                score += a.getAvailableDays().size() * 5;
                copy.setMatchScore(score);
                return copy;
            })
            .sorted(Comparator.comparingInt(Advisor::getMatchScore).reversed())
            .collect(Collectors.toList());

        String matchedOn = (department != null && !department.isBlank()) ? "department: " + department : "all advisors";
        return new AdvisorMatchResponse(true, scored.size(), matchedOn, scored);
    }

    // ── Student profile ───────────────────────────────────────────

    public List<StudentProfile> getAllStudents() {
        return new ArrayList<>(studentProfiles.values());
    }

    public Optional<StudentProfile> getStudentProfile(String studentId) {
        return Optional.ofNullable(studentProfiles.get(studentId));
    }

    // ── Course assignment ─────────────────────────────────────────

    /**
     * Assigns a course section to a student after validating all rules.
     *
     * @return Map with "success" (bool), "message" (string), and optionally "profile"
     */
    public Map<String, Object> assignCourse(String studentId, String courseId,
                                             String courseCode, String courseTitle,
                                             String section, String time, String room,
                                             String faculty, String advisorName) {
        Map<String, Object> result = new LinkedHashMap<>();
        StudentProfile profile = studentProfiles.get(studentId);
        if (profile == null) {
            result.put("success", false);
            result.put("message", "Student not found: " + studentId);
            return result;
        }

        List<AdvisedCourse> current = profile.getAdvisedCourses();

        // Rule 1: Max courses
        if (current.size() >= profile.getCourseLimit()) {
            result.put("success", false);
            result.put("message", profile.isOnProbation()
                    ? "Probationary students can only be assigned up to " + StudentProfile.PROBATION_MAX_COURSES + " courses."
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
        boolean duplicate = current.stream().anyMatch(c -> c.getCourseCode().equalsIgnoreCase(courseCode));
        if (duplicate) {
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

        // All checks passed — assign
        AdvisedCourse ac = new AdvisedCourse(courseId, studentId, courseCode, courseTitle,
                section, StudentProfile.CREDITS_PER_COURSE, time, room, faculty,
                LocalDateTime.now().toString(), advisorName != null ? advisorName : "Advisor");
        current.add(ac);
        // Track seat usage
        seatBookings.merge(courseId, 1, Integer::sum);
        result.put("success", true);
        result.put("message", courseCode + " – " + courseTitle + " (Sec " + section + ") assigned successfully.");
        result.put("profile", profile);
        result.put("seatUpdates", new LinkedHashMap<>(seatBookings));
        return result;
    }

    /**
     * Removes an assigned course from a student's list.
     */
    public Map<String, Object> removeCourse(String studentId, String courseId) {
        Map<String, Object> result = new LinkedHashMap<>();
        StudentProfile profile = studentProfiles.get(studentId);
        if (profile == null) {
            result.put("success", false);
            result.put("message", "Student not found.");
            return result;
        }
        boolean removed = profile.getAdvisedCourses().removeIf(c -> c.getId().equals(courseId));
        if (removed) {
            // Release seat
            seatBookings.merge(courseId, -1, Integer::sum);
            if (seatBookings.getOrDefault(courseId, 0) <= 0) seatBookings.remove(courseId);
            result.put("success", true);
            result.put("message", "Course removed successfully.");
            result.put("profile", profile);
            result.put("seatUpdates", new LinkedHashMap<>(seatBookings));
        } else {
            result.put("success", false);
            result.put("message", "Course not found in student's assignment list.");
        }
        return result;
    }

    // ── Public helpers ────────────────────────────────────────────

    /** Returns the current seat booking adjustments (courseId → additional bookings). */
    public Map<String, Integer> getSeatUpdates() {
        return new LinkedHashMap<>(seatBookings);
    }

    // ── Private helpers ───────────────────────────────────────────

    /**
     * Parses "DAY1-DAY2 HH:MM AM–HH:MM AM" and checks for overlaps with existing courses.
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
        String[] parts = time.split(" ");
        if (parts.length < 3) return cells;
        // Last two parts are time range: "08:00 AM–09:20 AM"
        String timeSlot = parts[parts.length - 3] + " " + parts[parts.length - 2] + " " + parts[parts.length - 1];
        // First parts are days: "SUN-TUE" or "MON-WED"
        String dayStr = parts[0];
        Map<String, String> dayMap = Map.of(
                "SUN", "Sunday", "MON", "Monday", "TUE", "Tuesday",
                "WED", "Wednesday", "THU", "Thursday", "FRI", "Friday", "SAT", "Saturday");
        for (Map.Entry<String, String> entry : dayMap.entrySet()) {
            if (dayStr.contains(entry.getKey())) {
                cells.add(entry.getValue() + "|" + timeSlot);
            }
        }
        return cells;
    }
}

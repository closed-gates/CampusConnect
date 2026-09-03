package com.campusconnect.backend.service;

import com.campusconnect.backend.dto.AdvisorMatchResponse;
import com.campusconnect.backend.model.AdvisedCourse;
import com.campusconnect.backend.model.Advisor;
import com.campusconnect.backend.model.AppUser;
import com.campusconnect.backend.model.CourseSection;
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
    private final com.campusconnect.backend.repository.AppUserRepository userRepo;
    private final com.campusconnect.backend.repository.SectionRegistrationRepository regRepo;
    private final ScheduleClashValidator    clashValidator;

    @org.springframework.beans.factory.annotation.Autowired(required = false)
    private NotificationService notificationService;

    public AdvisorService(AdvisorRepository advisorRepo,
                          StudentProfileRepository studentRepo,
                          AdvisedCourseRepository advisedCourseRepo,
                          CourseSectionRepository sectionRepo,
                          com.campusconnect.backend.repository.AppUserRepository userRepo,
                          com.campusconnect.backend.repository.SectionRegistrationRepository regRepo,
                          ScheduleClashValidator clashValidator) {
        this.advisorRepo       = advisorRepo;
        this.studentRepo       = studentRepo;
        this.advisedCourseRepo = advisedCourseRepo;
        this.sectionRepo       = sectionRepo;
        this.userRepo          = userRepo;
        this.regRepo           = regRepo;
        this.clashValidator    = clashValidator;
    }

    public Map<String, Object> getAdvisorStatus(String userId) {
        if (userId == null) return Map.of("isAdvisor", false, "role", "GUEST");
        return userRepo.findByUserId(userId)
                .map(u -> Map.<String, Object>of(
                        "userId",    u.getUserId(),
                        "role",      u.getRole(),
                        "isAdvisor", u.isAdvisor(),
                        "fullName",  u.getFullName(),
                        "email",     u.getEmail()
                ))
                .orElse(Map.of("isAdvisor", false, "role", "GUEST"));
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
        List<StudentProfile> profiles = studentRepo.findAllByPriority();
        List<AppUser> studentUsers = userRepo.findByRole("STUDENT");
        Set<String> existingIds = profiles.stream().map(StudentProfile::getStudentId).collect(Collectors.toSet());

        for (AppUser u : studentUsers) {
            if (!existingIds.contains(u.getUserId())) {
                StudentProfile sp = StudentProfile.builder()
                        .studentId(u.getUserId())
                        .studentName(u.getFullName())
                        .email(u.getEmail())
                        .department("Computer Science & Engineering")
                        .year(1)
                        .cgpa(3.50)
                        .completedCredits(0)
                        .onProbation(false)
                        .build();
                studentRepo.save(sp);
                profiles.add(sp);
                existingIds.add(u.getUserId());
            }
        }

        // Sort by priority (completed credits descending)
        profiles.sort((a, b) -> Integer.compare(b.getCompletedCredits(), a.getCompletedCredits()));

        return profiles.stream()
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

        // Fetch existing section entities for thorough clash validation
        List<CourseSection> existingSections = new ArrayList<>();
        for (AdvisedCourse ac : current) {
            sectionRepo.findById(ac.getSectionId()).ifPresent(existingSections::add);
        }

        // Rule 4: Class schedule time clash
        String timeClash = clashValidator.checkClassTimeClash(time, courseCode, section, existingSections);
        if (timeClash != null) {
            result.put("success", false);
            result.put("message", timeClash);
            return result;
        }

        // Rule 5: Exam schedule clash (same day + overlapping exam timing)
        Optional<CourseSection> targetSecOpt = sectionRepo.findById(courseId);
        if (targetSecOpt.isPresent()) {
            String examClash = clashValidator.checkExamClash(targetSecOpt.get(), existingSections);
            if (examClash != null) {
                result.put("success", false);
                result.put("message", examClash);
                return result;
            }
        }

        String finalFaculty = (faculty != null && !faculty.isBlank()) ? faculty : targetSecOpt.map(CourseSection::getFaculty).orElse("TBA");
        String finalRoom    = (room != null && !room.isBlank()) ? room : targetSecOpt.map(CourseSection::getRoom).orElse("TBA");
        String finalTitle   = (courseTitle != null && !courseTitle.isBlank()) ? courseTitle : targetSecOpt.map(CourseSection::getTitle).orElse(courseCode);
        String finalTime    = (time != null && !time.isBlank()) ? time : targetSecOpt.map(CourseSection::getTime).orElse("TBA");
        String finalSecNum  = (section != null && !section.isBlank()) ? section : targetSecOpt.map(CourseSection::getSection).orElse("01");

        // All checks passed — persist assignment
        AdvisedCourse ac = AdvisedCourse.builder()
                .sectionId(courseId)
                .studentProfile(profile)
                .courseCode(courseCode)
                .courseTitle(finalTitle)
                .section(finalSecNum)
                .credits(StudentProfile.CREDITS_PER_COURSE)
                .time(finalTime)
                .room(finalRoom)
                .faculty(finalFaculty)
                .assignedAt(LocalDateTime.now().toString())
                .assignedBy(advisorName != null ? advisorName : "Advisor")
                .build();
        advisedCourseRepo.save(ac);

        // Also synchronize to section_registrations so student profile and self-registration immediately show it
        Optional<CourseSection> secOpt = targetSecOpt;
        if (secOpt.isPresent()) {
            CourseSection sec = secOpt.get();
            if (!regRepo.existsByStudentIdAndSection_IdAndTerm(studentId, sec.getId(), "Fall2026")) {
                com.campusconnect.backend.model.SectionRegistration sr = com.campusconnect.backend.model.SectionRegistration.builder()
                        .studentId(studentId)
                        .section(sec)
                        .term("Fall2026")
                        .build();
                regRepo.save(sr);
                regRepo.tryBookSeat(sec.getId());
            }
        }

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

        // courseId can be the Long PK or sectionId
        Long acId = null;
        try {
            acId = Long.parseLong(courseId);
        } catch (NumberFormatException ignored) {}

        List<AdvisedCourse> existingCourses = advisedCourseRepo.findByStudentProfile_StudentId(studentId);
        AdvisedCourse toRemove = null;

        if (acId != null) {
            for (AdvisedCourse ac : existingCourses) {
                if (ac.getId().equals(acId)) {
                    toRemove = ac;
                    break;
                }
            }
        }
        if (toRemove == null) {
            for (AdvisedCourse ac : existingCourses) {
                if (courseId.equalsIgnoreCase(ac.getSectionId()) || courseId.equalsIgnoreCase(ac.getCourseCode())) {
                    toRemove = ac;
                    break;
                }
            }
        }

        if (toRemove != null) {
            final String secId = toRemove.getSectionId();
            final Long removeId = toRemove.getId();
            advisedCourseRepo.delete(toRemove);
            profile.getAdvisedCourses().removeIf(ac -> ac.getId().equals(removeId));

            // Also clean up any matching section_registrations and release seat
            try {
                regRepo.findByStudentIdAndSection_IdAndTerm(studentId, secId, "Fall2026")
                        .ifPresent(reg -> {
                            regRepo.delete(reg);
                            sectionRepo.findById(secId).ifPresent(sec -> {
                                sec.setBooked(Math.max(0, sec.getBooked() - 1));
                                sectionRepo.save(sec);
                            });
                        });
            } catch (Exception ignored) {}

            result.put("success", true);
            result.put("message", "Course removed successfully.");
            result.put("profile", buildProfileResponse(profile));
            result.put("seatUpdates", buildSeatUpdates(profile));
        } else {
            final Long targetAcId = acId;
            int deleted = targetAcId != null ? advisedCourseRepo.deleteByIdAndStudentId(targetAcId, studentId) : 0;
            if (deleted > 0) {
                profile.getAdvisedCourses().removeIf(ac -> ac.getId().equals(targetAcId));
                result.put("success", true);
                result.put("message", "Course removed successfully.");
                result.put("profile", buildProfileResponse(profile));
                result.put("seatUpdates", buildSeatUpdates(profile));
            } else {
                result.put("success", false);
                result.put("message", "Course not found in student's assignment list.");
            }
        }
        return result;
    }

    /**
     * Confirms and persists the advising session for a student.
     *
     * @param studentId The student ID (e.g. "STU001")
     * @param advisorName The advisor who confirmed (optional)
     * @return Result map with success status and updated profile
     */
    @Transactional
    public Map<String, Object> confirmAdvising(String studentId, String advisorName) {
        Map<String, Object> result = new LinkedHashMap<>();

        StudentProfile profile = studentRepo.findById(studentId).orElse(null);
        if (profile == null) {
            result.put("success", false);
            result.put("message", "Student not found: " + studentId);
            return result;
        }

        List<AdvisedCourse> dbCourses = advisedCourseRepo.findByStudentProfile_StudentId(studentId);
        if (dbCourses.isEmpty()) {
            result.put("success", false);
            result.put("message", "Cannot confirm advising with 0 courses selected.");
            return result;
        }

        profile.setAdvisingConfirmed(true);
        profile.setAdvisingConfirmedAt(LocalDateTime.now().toString());
        studentRepo.save(profile);

        if (notificationService != null) {
            try {
                notificationService.notifyAdvisingConfirmed(studentId, advisorName, dbCourses.size());
            } catch (Exception ex) {
                // Log and continue without failing transaction
            }
        }

        result.put("success", true);
        result.put("message", "Advising confirmed and saved to database for " + profile.getStudentName() + " (" + dbCourses.size() + " courses).");
        result.put("profile", buildProfileResponse(profile));
        result.put("seatUpdates", buildSeatUpdates(profile));
        return result;
    }

    /**
     * Returns a map of sectionId → booking count for all assigned courses
     * of a given student (used by the advisor panel to show live seat counts).
     */
    public Map<String, Integer> getSeatUpdates() {
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
     * Queries database directly so it is never stale.
     */
    private Map<String, Object> buildProfileResponse(StudentProfile profile) {
        Map<String, Object> p = new LinkedHashMap<>();
        p.put("studentId",           profile.getStudentId());
        p.put("studentName",         profile.getStudentName());
        p.put("email",               profile.getEmail());
        p.put("department",          profile.getDepartment());
        p.put("year",                profile.getYear());
        p.put("cgpa",                profile.getCgpa());
        p.put("completedCredits",    profile.getCompletedCredits());
        p.put("onProbation",         profile.isOnProbation());
        p.put("courseLimit",         profile.getCourseLimit());
        p.put("creditLimit",         profile.getCreditLimit());
        p.put("advisingConfirmed",   profile.isAdvisingConfirmed());
        p.put("advisingConfirmedAt", profile.getAdvisingConfirmedAt());

        List<AdvisedCourse> dbCourses = advisedCourseRepo.findByStudentProfile_StudentId(profile.getStudentId());
        Set<String> existingCodes = dbCourses.stream().map(AdvisedCourse::getCourseCode).map(String::toUpperCase).collect(Collectors.toSet());

        // Check if student has self-registered sections in section_registrations table
        List<com.campusconnect.backend.model.SectionRegistration> selfRegs = regRepo.findByStudentIdAndTerm(profile.getStudentId(), "Fall2026");
        for (com.campusconnect.backend.model.SectionRegistration sr : selfRegs) {
            com.campusconnect.backend.model.CourseSection sec = sr.getSection();
            if (sec != null && !existingCodes.contains(sec.getCode().toUpperCase())) {
                AdvisedCourse ac = AdvisedCourse.builder()
                        .sectionId(sec.getId())
                        .studentProfile(profile)
                        .courseCode(sec.getCode())
                        .courseTitle(sec.getTitle())
                        .section(sec.getSection())
                        .credits(sec.getCredits() != null ? sec.getCredits().intValue() : 3)
                        .time(sec.getTime())
                        .room(sec.getRoom())
                        .faculty(sec.getFaculty())
                        .assignedAt(sr.getRegisteredAt() != null ? sr.getRegisteredAt().toString() : java.time.LocalDateTime.now().toString())
                        .assignedBy("Self-Registered (Student)")
                        .build();
                advisedCourseRepo.save(ac);
                dbCourses.add(ac);
                existingCodes.add(sec.getCode().toUpperCase());
            }
        }

        List<Map<String, Object>> courses = dbCourses.stream().map(ac -> {
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
        List<AdvisedCourse> dbCourses = advisedCourseRepo.findByStudentProfile_StudentId(profile.getStudentId());
        for (AdvisedCourse ac : dbCourses) {
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

package com.campusconnect.backend.service;

import com.campusconnect.backend.model.AdvisedCourse;
import com.campusconnect.backend.model.AdvisingPortalStatus;
import com.campusconnect.backend.model.AppUser;
import com.campusconnect.backend.model.CourseCatalog;
import com.campusconnect.backend.model.CourseSection;
import com.campusconnect.backend.model.SectionRegistration;
import com.campusconnect.backend.model.StudentProfile;
import com.campusconnect.backend.model.TestCourse;
import com.campusconnect.backend.model.TestFaculty;
import com.campusconnect.backend.model.TestSection;
import com.campusconnect.backend.repository.*;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

/**
 * AdminAdvisingService – Business logic for Admin Advising powers:
 * 1. Assigning / toggling Advisor role for faculty profiles.
 * 2. Creating new course sections.
 * 3. Force-enrolling students by bypassing seat capacity thresholds.
 *
 * MVC Role: Service
 */
@Service
public class AdminAdvisingService {

    private final AppUserRepository              userRepo;
    private final TestFacultyRepository          facultyRepo;
    private final CourseSectionRepository        sectionRepo;
    private final CourseCatalogRepository        catalogRepo;
    private final TestCourseRepository           testCourseRepo;
    private final TestSectionRepository          testSectionRepo;
    private final SectionRegistrationRepository  regRepo;
    private final StudentProfileRepository       studentRepo;
    private final AdvisedCourseRepository        advisedCourseRepo;
    private final AdvisingPortalStatusRepository portalStatusRepo;
    private final SimpMessagingTemplate          messaging;
    private final ScheduleClashValidator         clashValidator;

    public AdminAdvisingService(AppUserRepository userRepo,
                                TestFacultyRepository facultyRepo,
                                CourseSectionRepository sectionRepo,
                                CourseCatalogRepository catalogRepo,
                                TestCourseRepository testCourseRepo,
                                TestSectionRepository testSectionRepo,
                                SectionRegistrationRepository regRepo,
                                StudentProfileRepository studentRepo,
                                AdvisedCourseRepository advisedCourseRepo,
                                AdvisingPortalStatusRepository portalStatusRepo,
                                SimpMessagingTemplate messaging,
                                ScheduleClashValidator clashValidator) {
        this.userRepo          = userRepo;
        this.facultyRepo       = facultyRepo;
        this.sectionRepo       = sectionRepo;
        this.catalogRepo       = catalogRepo;
        this.testCourseRepo    = testCourseRepo;
        this.testSectionRepo   = testSectionRepo;
        this.regRepo           = regRepo;
        this.studentRepo       = studentRepo;
        this.advisedCourseRepo = advisedCourseRepo;
        this.portalStatusRepo  = portalStatusRepo;
        this.messaging         = messaging;
        this.clashValidator    = clashValidator;
    }

    @jakarta.annotation.PostConstruct
    @Transactional
    public void normalizeSeats() {
        try {
            sectionRepo.normalizeOverbookedSections();
        } catch (Exception ignored) {}
        // Ensure the singleton portal-status row exists (open by default)
        try {
            portalStatusRepo.findById(1L).orElseGet(() ->
                portalStatusRepo.save(AdvisingPortalStatus.builder()
                    .id(1L)
                    .open(true)
                    .updatedBy("system")
                    .updatedAt(LocalDateTime.now())
                    .message("Advising portal is open.")
                    .build())
            );
        } catch (Exception ignored) {}
    }

    // ── 0. Advising Portal Open/Close Toggle (Admin Only) ────────────

    /**
     * Returns the current advising portal status (open or closed).
     */
    public Map<String, Object> getAdvisingPortalStatus() {
        AdvisingPortalStatus status = portalStatusRepo.findById(1L)
            .orElse(AdvisingPortalStatus.builder()
                .id(1L).open(true)
                .message("Advising portal is open.").build());
        return Map.of(
            "isOpen",    status.isOpen(),
            "updatedBy", status.getUpdatedBy() != null ? status.getUpdatedBy() : "system",
            "updatedAt", status.getUpdatedAt() != null ? status.getUpdatedAt().toString() : "",
            "message",   status.getMessage() != null ? status.getMessage() : ""
        );
    }

    /**
     * Sets the advising portal open/closed state.
     * @param open    true = open for students, false = closed
     * @param adminId the admin user ID performing the action
     * @param message optional custom message for students
     */
    @Transactional
    public Map<String, Object> setAdvisingPortalStatus(boolean open, String adminId, String message) {
        AdvisingPortalStatus status = portalStatusRepo.findById(1L)
            .orElse(AdvisingPortalStatus.builder().id(1L).build());
        status.setOpen(open);
        status.setUpdatedBy(adminId != null ? adminId : "admin");
        status.setUpdatedAt(LocalDateTime.now());
        status.setMessage(message != null && !message.isBlank() ? message
            : (open ? "Advising portal is now open for student registration."
                    : "Advising portal is currently closed. Please check back later."));
        portalStatusRepo.save(status);
        return Map.of(
            "success",   true,
            "isOpen",    open,
            "updatedBy", status.getUpdatedBy(),
            "updatedAt", status.getUpdatedAt().toString(),
            "message",   status.getMessage()
        );
    }

    // ── 1. Faculty Advisor Management ────────────────────────────────

    /**
     * Returns list of all faculty members with current Advisor status.
     */
    public List<Map<String, Object>> getFacultyAdvisorList() {
        List<Map<String, Object>> result = new ArrayList<>();
        List<AppUser> facultyUsers = userRepo.findByRole("FACULTY");

        // Map test faculty for extra details (department, designation)
        Map<String, TestFaculty> testFacMap = new HashMap<>();
        facultyRepo.findAll().forEach(tf -> testFacMap.put(tf.getUserId(), tf));

        for (AppUser u : facultyUsers) {
            Map<String, Object> item = new HashMap<>();
            item.put("id",          u.getId());
            item.put("userId",      u.getUserId());
            item.put("name",        u.getFullName());
            item.put("email",       u.getEmail());
            item.put("role",        u.getRole());
            item.put("isAdvisor",   u.isAdvisor());

            TestFaculty tf = testFacMap.get(u.getUserId());
            if (tf != null) {
                item.put("department",  tf.getDepartment());
                item.put("designation", tf.getDesignation());
                item.put("officeRoom",  tf.getOfficeRoom());
            } else {
                item.put("department",  "Academic Department");
                item.put("designation", "Faculty Member");
                item.put("officeRoom",  "TBA");
            }
            result.add(item);
        }

        result.sort((a, b) -> String.valueOf(a.get("userId")).compareTo(String.valueOf(b.get("userId"))));
        return result;
    }

    /**
     * Toggles or sets the advisor status for a faculty member.
     */
    @Transactional
    public Map<String, Object> toggleAdvisor(String userId, Boolean explicitStatus) {
        Optional<AppUser> userOpt = userRepo.findByUserId(userId);
        if (userOpt.isEmpty()) {
            return Map.of("success", false, "message", "User not found with ID: " + userId);
        }

        AppUser user = userOpt.get();
        boolean newStatus = explicitStatus != null ? explicitStatus : !user.isAdvisor();
        user.setIsAdvisor(newStatus);
        userRepo.save(user);

        // Also update TestFaculty record if exists
        facultyRepo.findByUserId(userId).ifPresent(tf -> {
            tf.setIsAdvisor(newStatus);
            facultyRepo.save(tf);
        });

        return Map.of(
            "success",   true,
            "userId",    user.getUserId(),
            "name",      user.getFullName(),
            "isAdvisor", newStatus,
            "message",   user.getFullName() + (newStatus ? " is now assigned as Advisor." : " advisor role revoked.")
        );
    }

    // ── 2. Create Course Section (Admin Power) ────────────────────────

    /**
     * Allows Admin to create a new course section and persist it in PostgreSQL.
     */
    @Transactional
    public Map<String, Object> createCourseSection(Map<String, Object> req) {
        String code          = String.valueOf(req.getOrDefault("code", "")).trim().toUpperCase();
        String sectionNumber = String.valueOf(req.getOrDefault("section", "")).trim();
        String title         = String.valueOf(req.getOrDefault("title", ""));
        String faculty       = String.valueOf(req.getOrDefault("faculty", "TBA"));
        String time          = String.valueOf(req.getOrDefault("time", "TBA"));
        String room          = String.valueOf(req.getOrDefault("room", "TBA"));
        String examDay       = String.valueOf(req.getOrDefault("examDay", "TBA"));

        int totalSeats = 35;
        try {
            totalSeats = Integer.parseInt(String.valueOf(req.getOrDefault("totalSeats", "35")));
        } catch (Exception ignored) {}

        double credits = 3.0;
        try {
            credits = Double.parseDouble(String.valueOf(req.getOrDefault("credits", "3.0")));
        } catch (Exception ignored) {}

        if (code.isBlank() || sectionNumber.isBlank()) {
            return Map.of("success", false, "message", "Course code and section number are required.");
        }

        // Format section number cleanly: e.g. "07"
        String secFormatted = sectionNumber.length() == 1 ? "0" + sectionNumber : sectionNumber;
        String sectionId = code + "-" + secFormatted;

        if (sectionRepo.existsById(sectionId)) {
            return Map.of("success", false, "message", "Section " + sectionId + " already exists.");
        }

        // Check if catalog has title
        Optional<CourseCatalog> catOpt = catalogRepo.findByCode(code);
        String finalTitle = title.isBlank()
                ? catOpt.map(CourseCatalog::getName).orElse(code + " Section " + secFormatted)
                : title.toUpperCase();

        CourseSection sec = CourseSection.builder()
                .id(sectionId)
                .code(code)
                .section(secFormatted)
                .title(finalTitle)
                .faculty(faculty)
                .time(time)
                .room(room)
                .examDay(examDay)
                .totalSeats(totalSeats)
                .booked(0)
                .credits(credits)
                .build();

        sectionRepo.save(sec);

        final int secSeats = totalSeats;

        // Update CourseCatalog total sections if present
        catOpt.ifPresent(cat -> {
            cat.setTotalSections(cat.getTotalSections() != null ? cat.getTotalSections() + 1 : 1);
            cat.setTotalSeats(cat.getTotalSeats() != null ? cat.getTotalSeats() + secSeats : secSeats);
            catalogRepo.save(cat);
        });

        // Also update test course if exists
        testCourseRepo.findByCode(code).ifPresent(tc -> {
            TestSection ts = TestSection.builder()
                    .sectionId(sectionId)
                    .course(tc)
                    .sectionNumber(secFormatted)
                    .scheduleTime(time)
                    .room(room)
                    .totalSeats(secSeats)
                    .bookedSeats(0)
                    .term("Summer2026")
                    .build();
            testSectionRepo.save(ts);
        });

        return Map.of(
            "success",   true,
            "sectionId", sectionId,
            "section",   sec,
            "message",   "Course section " + sectionId + " created and persisted successfully."
        );
    }

    // ── 3. Force Register Student with Capacity Bypass (Admin Power) ───

    /**
     * Allows Admin to force-register a student into any section,
     * completely bypassing the seat limit / full section constraint.
     * Also links the section to AdvisedCourse so it immediately appears in
     * the advisee profile and routine.
     */
    @Transactional
    public Map<String, Object> forceRegisterStudent(String studentId, String sectionId) {
        if (studentId == null || studentId.isBlank() || sectionId == null || sectionId.isBlank()) {
            return Map.of("success", false, "message", "Student ID and Section ID are required.");
        }

        studentId = studentId.trim();
        sectionId = sectionId.trim();

        Optional<CourseSection> secOpt = sectionRepo.findById(sectionId);
        if (secOpt.isEmpty()) {
            return Map.of("success", false, "message", "Section " + sectionId + " not found.");
        }

        CourseSection section = secOpt.get();

        // Check if student exists
        StudentProfile student = studentRepo.findById(studentId).orElse(null);
        if (student == null) {
            return Map.of("success", false, "message", "Student profile not found for ID: " + studentId);
        }

        // 1. Check duplicate registration in this section
        if (regRepo.existsByStudentIdAndSection_IdAndTerm(studentId, sectionId, "Fall2026")) {
            return Map.of("success", false, "message", "Student is already registered in " + sectionId + ".");
        }

        // 2. Enforce one-section-per-course rule across all registrations and advised courses
        String courseCode = section.getCode().toUpperCase();
        boolean alreadyHasCourse = regRepo.findByStudentIdAndTerm(studentId, "Fall2026").stream()
                .anyMatch(r -> r.getSection().getCode().equalsIgnoreCase(courseCode))
                || advisedCourseRepo.existsByStudentProfile_StudentIdAndCourseCode(studentId, courseCode);

        if (alreadyHasCourse) {
            return Map.of(
                "success", false,
                "message", "Student " + student.getStudentName() + " (" + studentId + ") is already enrolled in course "
                        + courseCode + ". A student cannot be enrolled in multiple sections of the same course."
            );
        }

        // 3. Load all currently registered/advised course sections for clash detection
        List<CourseSection> existingSections = new ArrayList<>();
        List<SectionRegistration> myRegs = regRepo.findByStudentIdAndTerm(studentId, "Fall2026");
        for (SectionRegistration r : myRegs) {
            if (r.getSection() != null) existingSections.add(r.getSection());
        }
        List<AdvisedCourse> myAdvised = advisedCourseRepo.findByStudentProfile_StudentId(studentId);
        for (AdvisedCourse ac : myAdvised) {
            sectionRepo.findById(ac.getSectionId()).ifPresent(s -> {
                if (existingSections.stream().noneMatch(existing -> existing.getId().equalsIgnoreCase(s.getId()))) {
                    existingSections.add(s);
                }
            });
        }

        // 4. Validate Class Schedule Clash (same day & overlapping time)
        String timeClash = clashValidator.checkClassTimeClash(section.getTime(), section.getCode(), section.getSection(), existingSections);
        if (timeClash != null) {
            return Map.of("success", false, "message", timeClash);
        }

        // 5. Validate Exam Schedule Clash (same day & overlapping exam time)
        String examClash = clashValidator.checkExamClash(section, existingSections);
        if (examClash != null) {
            return Map.of("success", false, "message", examClash);
        }

        // Over-enroll / bypass capacity: increment booked count unconditionally
        section.setBooked(section.getBooked() + 1);
        sectionRepo.save(section);

        SectionRegistration reg = SectionRegistration.builder()
                .studentId(studentId)
                .section(section)
                .term("Fall2026")
                .registeredAt(LocalDateTime.now())
                .build();
        regRepo.save(reg);

        // Also add to advised_courses so the advisor/admin profile and student routine show this course
        if (!advisedCourseRepo.existsByStudentProfile_StudentIdAndCourseCode(studentId, section.getCode())) {
            AdvisedCourse ac = AdvisedCourse.builder()
                    .sectionId(section.getId())
                    .studentProfile(student)
                    .courseCode(section.getCode())
                    .courseTitle(section.getTitle())
                    .section(section.getSection())
                    .credits(section.getCredits() != null ? section.getCredits().intValue() : 3)
                    .time(section.getTime())
                    .room(section.getRoom())
                    .faculty(section.getFaculty())
                    .assignedAt(LocalDateTime.now().toString())
                    .assignedBy("Admin (Force Enrolled)")
                    .build();
            advisedCourseRepo.save(ac);
            student.getAdvisedCourses().add(ac);
            studentRepo.save(student);
        }

        // Calculate remaining seats without clamping to 0 (can be -1, -2, etc. when force enrolled)
        int seatsRemaining = section.getTotalSeats() - section.getBooked();

        // Broadcast updated seat count via WebSocket
        try {
            messaging.convertAndSend("/topic/seats/" + sectionId, Map.of(
                "sectionId",      sectionId,
                "booked",         section.getBooked(),
                "totalSeats",     section.getTotalSeats(),
                "seatsRemaining", seatsRemaining
            ));
        } catch (Exception ignored) {}

        return Map.of(
            "success",        true,
            "studentId",      studentId,
            "sectionId",      sectionId,
            "booked",         section.getBooked(),
            "totalSeats",     section.getTotalSeats(),
            "seatsRemaining", seatsRemaining,
            "bypassed",       section.getBooked() > section.getTotalSeats(),
            "message",        "Student " + student.getStudentName() + " (" + studentId + ") successfully enrolled into " + sectionId + " (" + (seatsRemaining < 0 ? seatsRemaining + " seats remaining" : "bypassed seat limit") + ")."
        );
    }
}

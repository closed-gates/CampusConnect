package com.campusconnect.backend.service;

import com.campusconnect.backend.model.AdvisedCourse;
import com.campusconnect.backend.model.CourseSection;
import com.campusconnect.backend.model.SectionRegistration;
import com.campusconnect.backend.model.StudentProfile;
import com.campusconnect.backend.repository.AdvisedCourseRepository;
import com.campusconnect.backend.repository.CourseSectionRepository;
import com.campusconnect.backend.repository.SectionRegistrationRepository;
import com.campusconnect.backend.repository.StudentProfileRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * RegistrationService – Business logic for student self-registration in course sections.
 *
 * MVC Role: Service
 *
 * Key invariants enforced here:
 *   1. No overbooking  — enforced by atomic tryBookSeat() UPDATE (booked < totalSeats)
 *   2. No duplicates   — DB unique constraint (student_id, section_id, term) + app check
 *   3. Credit limit    — student cannot exceed CGPA-based credit cap
 *   4. Prerequisites   — student must have completed prerequisite courses
 *   5. Advising window — student can only register during their priority tier window
 *
 * Concurrency strategy: SERIALIZABLE isolation + atomic conditional UPDATE.
 *   UPDATE course_section SET booked = booked + 1
 *   WHERE id = :id AND booked < total_seats
 * If rowsAffected == 0 → section is full → 409 CONFLICT returned.
 * After a successful commit, the authoritative DB seat count is broadcast
 * via WebSocket to all subscribed clients.
 *
 * Advising priority tiers (by completedCredits):
 *   Tier 1 (≥ 60 credits)  → window OPEN  in demo
 *   Tier 2 (30–59 credits) → window OPEN  in demo (simulate Day 2)
 *   Tier 3 (< 30 credits)  → window CLOSED in demo (simulate Day 3 not yet reached)
 * Phase 3 note: Replace with a real clock-based WindowService once auth is live.
 */
@Service
public class RegistrationService {

    private static final String CURRENT_TERM = "Fall2026";

    // Credits per section (matches StudentProfile constant)
    private static final int CREDITS_PER_SECTION = 3;

    private final SectionRegistrationRepository regRepo;
    private final CourseSectionRepository       sectionRepo;
    private final StudentProfileRepository      studentRepo;
    private final AdvisedCourseRepository       advisedCourseRepo;
    private final SimpMessagingTemplate         messaging;
    private final ScheduleClashValidator        clashValidator;

    @org.springframework.beans.factory.annotation.Autowired(required = false)
    private com.campusconnect.backend.repository.TestSectionRepository testSectionRepo;

    @org.springframework.beans.factory.annotation.Autowired(required = false)
    private com.campusconnect.backend.repository.AdvisingPortalStatusRepository portalStatusRepo;

    public RegistrationService(SectionRegistrationRepository regRepo,
                               CourseSectionRepository sectionRepo,
                               StudentProfileRepository studentRepo,
                               AdvisedCourseRepository advisedCourseRepo,
                               SimpMessagingTemplate messaging,
                               ScheduleClashValidator clashValidator) {
        this.regRepo           = regRepo;
        this.sectionRepo       = sectionRepo;
        this.studentRepo       = studentRepo;
        this.advisedCourseRepo = advisedCourseRepo;
        this.messaging         = messaging;
        this.clashValidator    = clashValidator;
    }

    // ── Section listing ───────────────────────────────────────────

    /**
     * Returns all course sections enriched with:
     *   - seatsRemaining  (authoritative from DB)
     *   - registeredByStudent  flag
     *   - prerequisiteMet  flag
     *   - prerequisiteCodes  string
     */
    public List<Map<String, Object>> getSections(String studentId) {
        return getSections(studentId, CURRENT_TERM);
    }

    public List<Map<String, Object>> getSections(String studentId, String requestedTerm) {
        String term = normalizeTerm(requestedTerm);
        StudentProfile student = studentRepo.findById(studentId).orElse(null);
        Set<String> completedCodes = parseCompletedCourses(student);

        List<SectionRegistration> myRegs = regRepo.findByStudentIdAndTerm(studentId, term);
        List<AdvisedCourse> advisedCourses = advisedCourseRepo.findForTerm(studentId, term);

        Set<String> registeredSectionIds = new HashSet<>();
        Set<String> registeredCourseCodes = new HashSet<>();

        for (SectionRegistration r : myRegs) {
            registeredSectionIds.add(r.getSection().getId());
            registeredCourseCodes.add(r.getSection().getCode().toUpperCase());
        }
        for (AdvisedCourse ac : advisedCourses) {
            registeredSectionIds.add(ac.getSectionId());
            registeredCourseCodes.add(ac.getCourseCode().toUpperCase());
        }

        List<Map<String, Object>> result = new ArrayList<>();

        if (testSectionRepo != null) {
            for (com.campusconnect.backend.model.TestSection ts : testSectionRepo.findAll()) {
                Map<String, Object> m = new LinkedHashMap<>();
                String secId = ts.getSectionId() != null ? ts.getSectionId() : String.valueOf(ts.getId());
                m.put("id", secId);
                m.put("code", ts.getCourse().getCode());
                m.put("section", ts.getSectionNumber());
                m.put("title", ts.getCourse().getName());
                m.put("faculty", ts.getFaculty().getName());
                m.put("time", ts.getScheduleTime());
                m.put("room", ts.getRoom());
                m.put("examDay", "TBA");
                m.put("totalSeats", ts.getTotalSeats());
                m.put("booked", ts.getBookedSeats());
                m.put("seatsRemaining", Math.max(0, ts.getTotalSeats() - ts.getBookedSeats()));
                boolean isRegistered = registeredSectionIds.contains(secId);
                m.put("registeredByStudent", isRegistered);
                m.put("prerequisiteCodes", ts.getCourse().getPrerequisites() != null ? ts.getCourse().getPrerequisites() : "");
                m.put("prerequisiteMet", true);
                m.put("unmetPrerequisites", Collections.emptyList());
                boolean courseAlreadyRegistered = registeredCourseCodes.contains(ts.getCourse().getCode().toUpperCase())
                        && !registeredSectionIds.contains(secId);
                m.put("courseAlreadyRegistered", courseAlreadyRegistered);
                m.put("isTestCourse", true);
                result.add(m);
            }
        }

        result.addAll(sectionRepo.findAll().stream()
                .map(sec -> {
                    Map<String, Object> m = enrichSection(sec, studentId, registeredSectionIds, completedCodes);
                    // Flag sections whose course code is already taken (in a different section)
                    boolean courseAlreadyRegistered = registeredCourseCodes.contains(sec.getCode().toUpperCase())
                            && !registeredSectionIds.contains(sec.getId());
                    m.put("courseAlreadyRegistered", courseAlreadyRegistered);
                    return m;
                })
                .collect(Collectors.toList()));
        return result;
    }

    /** Returns a student's registered sections for the current term. */
    public List<Map<String, Object>> getStudentRegistrations(String studentId) {
        return getStudentRegistrations(studentId, CURRENT_TERM);
    }

    public List<Map<String, Object>> getStudentRegistrations(String studentId, String requestedTerm) {
        String term = normalizeTerm(requestedTerm);
        // Sync any advised_courses records into section_registrations if not yet present
        List<AdvisedCourse> advisedCourses = advisedCourseRepo.findForTerm(studentId, term);
        List<SectionRegistration> myRegs = regRepo.findByStudentIdAndTerm(studentId, term);
        Set<String> existingSectionIds = myRegs.stream().map(r -> r.getSection().getId()).collect(Collectors.toSet());

        for (AdvisedCourse ac : advisedCourses) {
            if (!existingSectionIds.contains(ac.getSectionId())) {
                Optional<CourseSection> secOpt = sectionRepo.findById(ac.getSectionId());
                if (secOpt.isPresent()) {
                    SectionRegistration reg = SectionRegistration.builder()
                            .studentId(studentId)
                            .section(secOpt.get())
                            .term(term)
                            .build();
                    regRepo.save(reg);
                    myRegs.add(reg);
                    existingSectionIds.add(ac.getSectionId());
                }
            }
        }

        List<Map<String, Object>> list = myRegs.stream()
                .map(r -> enrichSection(r.getSection(), studentId, new HashSet<>(), new HashSet<>()))
                .collect(Collectors.toList());

        for (AdvisedCourse ac : advisedCourses) {
            if (existingSectionIds.contains(ac.getSectionId())) continue;
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", ac.getSectionId());
            m.put("code", ac.getCourseCode());
            m.put("section", ac.getSection());
            m.put("title", ac.getCourseTitle());
            m.put("faculty", ac.getFaculty());
            m.put("time", ac.getTime());
            m.put("room", ac.getRoom());
            m.put("examDay", "TBA");
            m.put("totalSeats", 35);
            m.put("booked", 1);
            m.put("seatsRemaining", 34);
            m.put("registeredByStudent", true);
            m.put("prerequisiteMet", true);
            m.put("unmetPrerequisites", Collections.emptyList());
            m.put("courseAlreadyRegistered", false);
            m.put("isTestCourse", true);
            list.add(m);
        }

        return list;
    }

    // ── Advising window ───────────────────────────────────────────

    /**
     * Returns the advising window status for a student.
     * Priority is determined by completedCredits (descending).
     * Tier thresholds:
     *   Tier 1 ≥ 60 cr → window open (highest priority)
     *   Tier 2 30–59   → window open
     *   Tier 3 < 30    → window closed (demo: not yet reached)
     */
    public Map<String, Object> getAdvisingWindow(String studentId) {
        StudentProfile student = studentRepo.findById(studentId).orElse(null);
        Map<String, Object> result = new LinkedHashMap<>();

        if (student == null) {
            result.put("open", false);
            result.put("tier", 0);
            result.put("message", "Student not found.");
            return result;
        }

        // All students sorted by credits DESC to compute rank
        List<StudentProfile> allByPriority = studentRepo.findAllByPriority();
        int totalStudents = allByPriority.size();
        int rank = 1;
        for (StudentProfile s : allByPriority) {
            if (s.getStudentId().equals(studentId)) break;
            rank++;
        }

        int tier;
        boolean open;
        String opensAt;
        int credits = student.getCompletedCredits();

        if (credits >= 60) {
            tier = 1; open = true;  opensAt = "Now open";
        } else if (credits >= 30) {
            tier = 2; open = true;  opensAt = "Now open";
        } else {
            tier = 3; open = false; opensAt = "Day 3 of advising period";
        }

        result.put("open",        open);
        result.put("tier",        tier);
        result.put("rank",        rank);
        result.put("totalStudents", totalStudents);
        result.put("opensAt",     opensAt);
        result.put("completedCredits", credits);
        result.put("message", open
                ? "Your advising window is open. You may register for courses."
                : "Your advising window opens on Day 3. High-credit students register first.");
        return result;
    }

    // ── Registration ──────────────────────────────────────────────

    /**
     * Registers a student in a section.
     *
     * Transaction is SERIALIZABLE to ensure the atomic tryBookSeat UPDATE
     * behaves correctly under concurrent requests. PostgreSQL will serialise
     * conflicting transactions — one wins, others retry or fail with
     * rowsAffected == 0.
     *
     * @return Map with success, message, seatsRemaining
     */
    @Transactional(isolation = Isolation.SERIALIZABLE)
    public Map<String, Object> registerSection(String studentId, String sectionId) {
        return registerSection(studentId, sectionId, CURRENT_TERM);
    }

    @Transactional(isolation = Isolation.SERIALIZABLE)
    public Map<String, Object> registerSection(String studentId, String sectionId, String requestedTerm) {
        String term = normalizeTerm(requestedTerm);
        Map<String, Object> result = new LinkedHashMap<>();

        // 1. Load student profile
        StudentProfile student = studentRepo.findById(studentId).orElse(null);
        if (student == null) {
            result.put("success", false);
            result.put("message", "Student profile not found.");
            return result;
        }

        // 1b. Check if admin has closed the advising portal globally
        if (portalStatusRepo != null) {
            com.campusconnect.backend.model.AdvisingPortalStatus portalStatus =
                portalStatusRepo.findById(1L).orElse(null);
            if (portalStatus != null && !portalStatus.isOpen()) {
                result.put("success", false);
                result.put("message", portalStatus.getMessage() != null
                    ? portalStatus.getMessage()
                    : "The advising portal is currently closed by the administrator.");
                return result;
            }
        }

        // 2. Check advising window
        Map<String, Object> window = getAdvisingWindow(studentId);
        if (!Boolean.TRUE.equals(window.get("open"))) {
            result.put("success", false);
            result.put("message", "Your advising window is not yet open. " + window.get("opensAt"));
            return result;
        }

        // 3. Load section
        CourseSection section = sectionRepo.findById(sectionId).orElse(null);
        if (section == null && testSectionRepo != null) {
            Optional<com.campusconnect.backend.model.TestSection> tsOpt = testSectionRepo.findBySectionId(sectionId);
            if (tsOpt.isEmpty()) {
                try {
                    tsOpt = testSectionRepo.findById(Long.parseLong(sectionId));
                } catch (NumberFormatException ignored) {}
            }
            if (tsOpt.isPresent()) {
                com.campusconnect.backend.model.TestSection ts = tsOpt.get();
                if (ts.getBookedSeats() >= ts.getTotalSeats()) {
                    result.put("success", false);
                    result.put("message", "Section " + sectionId + " is full.");
                    return result;
                }
                String newCourseCode = ts.getCourse().getCode().toUpperCase();
                boolean alreadyHasCourse = regRepo.findByStudentIdAndTerm(studentId, term)
                        .stream()
                        .anyMatch(r -> r.getSection().getCode().equalsIgnoreCase(newCourseCode))
                        || advisedCourseRepo.existsForTerm(studentId, newCourseCode, term);
                if (alreadyHasCourse) {
                    result.put("success", false);
                    result.put("message", "You are already registered in another section of " + newCourseCode + ".");
                    return result;
                }
                ts.setBookedSeats(ts.getBookedSeats() + 1);
                testSectionRepo.save(ts);

                AdvisedCourse ac = AdvisedCourse.builder()
                        .sectionId(ts.getSectionId())
                        .studentProfile(student)
                        .courseCode(ts.getCourse().getCode())
                        .courseTitle(ts.getCourse().getName())
                        .section(ts.getSectionNumber())
                        .credits(ts.getCourse().getCredits() != null ? ts.getCourse().getCredits().intValue() : 3)
                        .time(ts.getScheduleTime())
                        .room(ts.getRoom())
                        .faculty(ts.getFaculty().getName())
                        .assignedAt(LocalDateTime.now().toString())
                        .assignedBy("Self-Registration")
                        .term(term)
                        .build();
                advisedCourseRepo.save(ac);
                student.getAdvisedCourses().add(ac);
                studentRepo.save(student);

                result.put("success", true);
                result.put("message", "Successfully registered in " + ts.getCourse().getCode() + " Sec " + ts.getSectionNumber() + ".");
                result.put("sectionId", sectionId);
                result.put("seatsRemaining", Math.max(0, ts.getTotalSeats() - ts.getBookedSeats()));
                return result;
            }
        }
        if (section == null) {
            result.put("success", false);
            result.put("message", "Section not found: " + sectionId);
            return result;
        }

        // 4. Duplicate check — same section
        if (regRepo.existsByStudentIdAndSection_IdAndTerm(studentId, sectionId, term)) {
            result.put("success", false);
            result.put("message", "You are already registered in section " + sectionId + ".");
            return result;
        }

        // 4b. One-section-per-course rule — cannot take two sections of the same course code
        String newCourseCode = section.getCode().toUpperCase();
        boolean alreadyHasCourse = regRepo.findByStudentIdAndTerm(studentId, term)
                .stream()
                .anyMatch(r -> r.getSection().getCode().equalsIgnoreCase(newCourseCode))
                || advisedCourseRepo.existsForTerm(studentId, newCourseCode, term);

        if (alreadyHasCourse) {
            result.put("success", false);
            result.put("message", "You are already registered in another section of " + newCourseCode
                    + ". You can only take one section per course.");
            return result;
        }

        // 4c. Load existing sections for schedule & exam clash checks
        List<CourseSection> existingSections = new ArrayList<>();
        List<SectionRegistration> myRegs = regRepo.findByStudentIdAndTerm(studentId, term);
        for (SectionRegistration r : myRegs) {
            if (r.getSection() != null) existingSections.add(r.getSection());
        }
        List<AdvisedCourse> myAdvised = advisedCourseRepo.findForTerm(studentId, term);
        for (AdvisedCourse ac : myAdvised) {
            sectionRepo.findById(ac.getSectionId()).ifPresent(s -> {
                if (existingSections.stream().noneMatch(existing -> existing.getId().equalsIgnoreCase(s.getId()))) {
                    existingSections.add(s);
                }
            });
        }

        // 4d. Class schedule time clash check
        String timeClash = clashValidator.checkClassTimeClash(section.getTime(), section.getCode(), section.getSection(), existingSections);
        if (timeClash != null) {
            result.put("success", false);
            result.put("message", timeClash);
            return result;
        }

        // 4e. Exam schedule clash check (same day + overlapping exam timing)
        String examClash = clashValidator.checkExamClash(section, existingSections);
        if (examClash != null) {
            result.put("success", false);
            result.put("message", examClash);
            return result;
        }


        // 5. Prerequisite check
        Set<String> completedCodes = parseCompletedCourses(student);
        String prereqCodes = section.getPrerequisiteCodes();
        if (prereqCodes != null && !prereqCodes.isBlank()) {
            List<String> unmetPrereqs = Arrays.stream(prereqCodes.split(","))
                    .map(String::trim)
                    .filter(c -> !c.isEmpty() && !completedCodes.contains(c))
                    .collect(Collectors.toList());
            if (!unmetPrereqs.isEmpty()) {
                result.put("success", false);
                result.put("message", "Prerequisites not met. Required: " + String.join(", ", unmetPrereqs));
                result.put("unmetPrerequisites", unmetPrereqs);
                return result;
            }
        }

        // 6. Credit limit check
        long currentSections = regRepo.countByStudentIdAndTerm(studentId, term);
        int  currentCredits  = (int) currentSections * CREDITS_PER_SECTION;
        if (currentCredits + CREDITS_PER_SECTION > student.getCreditLimit()) {
            result.put("success", false);
            result.put("message", "Adding this course would exceed your credit limit of "
                    + student.getCreditLimit() + " credits.");
            return result;
        }

        // 7. Atomic seat booking — THE CORE CONCURRENCY GUARD
        int rowsUpdated = regRepo.tryBookSeat(sectionId);
        if (rowsUpdated == 0) {
            // Section filled up between our check and the UPDATE — return 409
            result.put("success", false);
            result.put("message", "Section just filled up. No seats remaining.");
            return result;
        }

        // 8. Persist the registration record
        SectionRegistration reg = SectionRegistration.builder()
                .studentId(studentId)
                .section(section)
                .term(term)
                .build();
        regRepo.save(reg);

        // Also synchronize with advised_courses so Advisor panel and Student routine show this course
        if (!advisedCourseRepo.existsForTerm(studentId, section.getCode(), term)) {
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
                    .assignedBy("Self-Registered (Student)")
                    .term(term)
                    .build();
            advisedCourseRepo.save(ac);
            student.getAdvisedCourses().add(ac);
            studentRepo.save(student);
        }

        // 9. Read authoritative seat count from DB and broadcast to all clients
        int seatsRemaining = broadcastSeatUpdate(sectionId);

        result.put("success",        true);
        result.put("message",        "Successfully registered in " + section.getCode()
                                     + " Sec " + section.getSection() + ".");
        result.put("sectionId",      sectionId);
        result.put("seatsRemaining", seatsRemaining);
        return result;
    }

    /**
     * Drops a student from a section, releasing the seat.
     *
     * @return Map with success, message, seatsRemaining
     */
    @Transactional(isolation = Isolation.SERIALIZABLE)
    public Map<String, Object> dropSection(String studentId, String sectionId) {
        return dropSection(studentId, sectionId, CURRENT_TERM);
    }

    @Transactional(isolation = Isolation.SERIALIZABLE)
    public Map<String, Object> dropSection(String studentId, String sectionId, String requestedTerm) {
        String term = normalizeTerm(requestedTerm);
        Map<String, Object> result = new LinkedHashMap<>();

        // 1. Find the registration record
        Optional<SectionRegistration> regOpt =
                regRepo.findByStudentIdAndSection_IdAndTerm(studentId, sectionId, term);
        if (regOpt.isEmpty()) {
            if (testSectionRepo != null) {
                Optional<com.campusconnect.backend.model.TestSection> tsOpt = testSectionRepo.findBySectionId(sectionId);
                if (tsOpt.isEmpty()) {
                    try {
                        tsOpt = testSectionRepo.findById(Long.parseLong(sectionId));
                    } catch (NumberFormatException ignored) {}
                }
                if (tsOpt.isPresent()) {
                    com.campusconnect.backend.model.TestSection ts = tsOpt.get();
                    if (ts.getBookedSeats() > 0) {
                        ts.setBookedSeats(ts.getBookedSeats() - 1);
                        testSectionRepo.save(ts);
                    }
                    StudentProfile student = studentRepo.findById(studentId).orElse(null);
                    if (student != null) {
                        advisedCourseRepo.findForTerm(studentId, term).stream()
                                .filter(ac -> ac.getSectionId().equalsIgnoreCase(sectionId))
                                .findFirst()
                                .ifPresent(ac -> {
                                    student.getAdvisedCourses().remove(ac);
                                    advisedCourseRepo.delete(ac);
                                    studentRepo.save(student);
                                });
                    }
                    result.put("success", true);
                    result.put("message", "Successfully dropped section " + sectionId + ".");
                    result.put("sectionId", sectionId);
                    result.put("seatsRemaining", Math.max(0, ts.getTotalSeats() - ts.getBookedSeats()));
                    return result;
                }
            }
            result.put("success", false);
            result.put("message", "You are not registered in section " + sectionId + ".");
            return result;
        }

        // 2. Delete the registration record
        regRepo.delete(regOpt.get());

        // Also remove from advised_courses
        StudentProfile student = studentRepo.findById(studentId).orElse(null);
        if (student != null) {
            advisedCourseRepo.findForTerm(studentId, term).stream()
                    .filter(ac -> ac.getSectionId().equalsIgnoreCase(sectionId))
                    .findFirst()
                    .ifPresent(ac -> {
                        student.getAdvisedCourses().remove(ac);
                        advisedCourseRepo.delete(ac);
                        studentRepo.save(student);
                    });
        }

        // 3. Atomically release the seat
        regRepo.tryReleaseSeat(sectionId);

        // 4. Broadcast updated count to all subscribed clients
        int seatsRemaining = broadcastSeatUpdate(sectionId);

        result.put("success",        true);
        result.put("message",        "Successfully dropped section " + sectionId + ".");
        result.put("sectionId",      sectionId);
        result.put("seatsRemaining", seatsRemaining);
        return result;
    }

    // ── Private helpers ───────────────────────────────────────────

    /**
     * Reads the authoritative seat count from DB and broadcasts it via
     * WebSocket to all clients subscribed to /topic/seats/{sectionId}.
     * Returns seatsRemaining.
     */
    private int broadcastSeatUpdate(String sectionId) {
        CourseSection updated = sectionRepo.findById(sectionId).orElse(null);
        int remaining = (updated != null)
                ? (updated.getTotalSeats() - updated.getBooked())
                : 0;

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("sectionId",      sectionId);
        payload.put("seatsRemaining", remaining);
        payload.put("totalSeats",     updated != null ? updated.getTotalSeats() : 0);
        payload.put("booked",         updated != null ? updated.getBooked()     : 0);

        messaging.convertAndSend("/topic/seats/" + sectionId, payload);
        return remaining;
    }

    /** Builds an enriched section map for the frontend. */
    private Map<String, Object> enrichSection(CourseSection sec,
                                               String studentId,
                                               Set<String> registeredSectionIds,
                                               Set<String> completedCodes) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id",               sec.getId());
        m.put("code",             sec.getCode());
        m.put("section",          sec.getSection());
        m.put("title",            sec.getTitle());
        m.put("faculty",          sec.getFaculty());
        m.put("time",             sec.getTime());
        m.put("room",             sec.getRoom());
        m.put("examDay",          sec.getExamDay());
        m.put("totalSeats",       sec.getTotalSeats());
        m.put("booked",           sec.getBooked());
        m.put("seatsRemaining",   sec.getTotalSeats() - sec.getBooked());

        boolean isRegistered = registeredSectionIds.contains(sec.getId());
        m.put("registeredByStudent", isRegistered);

        // Prerequisite evaluation
        String prereqCodes = sec.getPrerequisiteCodes();
        m.put("prerequisiteCodes", prereqCodes != null ? prereqCodes : "");
        boolean prereqMet = true;
        List<String> unmet = new ArrayList<>();
        if (prereqCodes != null && !prereqCodes.isBlank()) {
            for (String code : prereqCodes.split(",")) {
                String trimmed = code.trim();
                if (!trimmed.isEmpty() && !completedCodes.contains(trimmed)) {
                    prereqMet = false;
                    unmet.add(trimmed);
                }
            }
        }
        m.put("prerequisiteMet",  prereqMet);
        m.put("unmetPrerequisites", unmet);
        return m;
    }

    /** Parses the student's completedCourses CSV field into a Set. */
    private Set<String> parseCompletedCourses(StudentProfile student) {
        if (student == null || student.getCompletedCourses() == null
                || student.getCompletedCourses().isBlank()) {
            return new HashSet<>();
        }
        return Arrays.stream(student.getCompletedCourses().split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toSet());
    }

    private String normalizeTerm(String term) {
        if (term == null || term.isBlank()) return CURRENT_TERM;
        String normalized = term.replaceAll("\\s+", "");
        return normalized.matches("(?i)(Spring|Summer|Fall)\\d{4}") ? normalized : CURRENT_TERM;
    }
}

package com.campusconnect.backend.service;

import com.campusconnect.backend.model.AppUser;
import com.campusconnect.backend.model.TestCourse;
import com.campusconnect.backend.model.TestFaculty;
import com.campusconnect.backend.model.TestSection;
import com.campusconnect.backend.repository.AppUserRepository;
import com.campusconnect.backend.repository.TestCourseRepository;
import com.campusconnect.backend.repository.TestFacultyRepository;
import com.campusconnect.backend.repository.TestSectionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

/**
 * TestCourseDataSeeder – Automatically seeds test courses, sections, and faculty.
 *
 * Requirements Met:
 *   1. Creates isolated test data in `test_courses`, `test_faculties`, `test_sections`.
 *   2. Generates 22 courses (in range 20–25) with 3–4 sections each (total 74 sections).
 *   3. Generates 12 faculty members and registers them in `app_users` for real login.
 *   4. Ensures zero time conflicts for every faculty member across all assigned sections.
 *   5. Preserves all existing user accounts and course catalogue data without modification.
 */
@Component
public class TestCourseDataSeeder implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(TestCourseDataSeeder.class);

    public static final String DEFAULT_FACULTY_PASSWORD = "Faculty@123";

    private final AppUserRepository userRepo;
    private final TestFacultyRepository facultyRepo;
    private final TestCourseRepository courseRepo;
    private final TestSectionRepository sectionRepo;
    private final PasswordEncoder passwordEncoder;
    private final TestCourseService testCourseService;

    public TestCourseDataSeeder(AppUserRepository userRepo,
                                TestFacultyRepository facultyRepo,
                                TestCourseRepository courseRepo,
                                TestSectionRepository sectionRepo,
                                PasswordEncoder passwordEncoder,
                                TestCourseService testCourseService) {
        this.userRepo          = userRepo;
        this.facultyRepo       = facultyRepo;
        this.courseRepo        = courseRepo;
        this.sectionRepo       = sectionRepo;
        this.passwordEncoder   = passwordEncoder;
        this.testCourseService = testCourseService;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        log.info("[TestCourseDataSeeder] Initializing test course catalogue and faculty dataset...");
        seedFacultyAccounts();
        seedCourses();
        seedSectionsWithConflictCheck();
        log.info("[TestCourseDataSeeder] Test dataset successfully initialized and verified.");
    }

    // ── 1. Seed Faculty Accounts & Relational Faculty Table ────────
    private void seedFacultyAccounts() {
        String now = LocalDateTime.now().toString();

        // 12 Faculty members across diverse departments
        List<FacultySeedData> facultySeeds = List.of(
            new FacultySeedData("FAC101", "Dr. Sadia Rahman",   "sadia.rahman@campus.edu",   "Computer Science and Engineering",       "Professor",           "UB04-601"),
            new FacultySeedData("FAC102", "Dr. Tanvir Ahmed",   "tanvir.ahmed@campus.edu",   "Computer Science and Engineering",       "Associate Professor", "UB04-602"),
            new FacultySeedData("FAC103", "Dr. Nusrat Jahan",   "nusrat.jahan@campus.edu",   "Computer Science and Engineering",       "Assistant Professor", "UB04-603"),
            new FacultySeedData("FAC104", "Dr. Farhan Kabir",   "farhan.kabir@campus.edu",   "Electrical and Electronic Engineering", "Professor",           "UB05-401"),
            new FacultySeedData("FAC105", "Dr. Ayesha Siddiqua", "ayesha.siddiqua@campus.edu", "Electrical and Electronic Engineering", "Associate Professor", "UB05-402"),
            new FacultySeedData("FAC106", "Dr. Rafiqul Islam",  "rafiqul.islam@campus.edu",  "Mathematics and Natural Sciences",       "Professor",           "UB03-301"),
            new FacultySeedData("FAC107", "Dr. Mehedi Hasan",   "mehedi.hasan@campus.edu",   "Mathematics and Natural Sciences",       "Associate Professor", "UB03-302"),
            new FacultySeedData("FAC108", "Dr. Sabrina Mostafa","sabrina.mostafa@campus.edu","BRAC Business School",                  "Professor",           "UB02-501"),
            new FacultySeedData("FAC109", "Dr. Tariq Mahmood",  "tariq.mahmood@campus.edu",  "BRAC Business School",                  "Associate Professor", "UB02-502"),
            new FacultySeedData("FAC110", "Dr. Samira Khan",    "samira.khan@campus.edu",    "Economics and Social Sciences",          "Associate Professor", "UB02-401"),
            new FacultySeedData("FAC111", "Dr. Asif Chowdhury", "asif.chowdhury@campus.edu", "English and Humanities",               "Assistant Professor", "UB01-301"),
            new FacultySeedData("FAC112", "Dr. Farzana Yasmin", "farzana.yasmin@campus.edu", "Pharmacy",                              "Associate Professor", "UB06-201")
        );

        for (FacultySeedData f : facultySeeds) {
            // Create AppUser if not present (for real authentication & login)
            if (!userRepo.existsByUserId(f.facultyId)) {
                AppUser user = new AppUser(
                    f.facultyId,
                    f.name,
                    f.email,
                    passwordEncoder.encode(DEFAULT_FACULTY_PASSWORD),
                    "FACULTY",
                    now
                );
                userRepo.save(user);
                log.info("[TestCourseDataSeeder] Created faculty login user account: {} ({})", f.facultyId, f.email);
            }

            // Create TestFaculty entity if not present (relational faculty table)
            if (!facultyRepo.existsByFacultyId(f.facultyId)) {
                TestFaculty tf = TestFaculty.builder()
                    .facultyId(f.facultyId)
                    .name(f.name)
                    .email(f.email)
                    .department(f.department)
                    .designation(f.designation)
                    .userId(f.facultyId) // Foreign key to app_users.user_id
                    .officeRoom(f.officeRoom)
                    .createdAt(now)
                    .build();
                facultyRepo.save(tf);
                log.info("[TestCourseDataSeeder] Saved TestFaculty record: {} - {}", f.facultyId, f.name);
            }
        }
    }

    // ── 2. Seed 22 Test Courses (Range 20–25) ─────────────────────
    private void seedCourses() {
        List<TestCourse> courses = List.of(
            TestCourse.builder().code("CSE110T").name("Programming Language I (Test)").credits(3.0).department("Computer Science and Engineering").school("BSRM School of Engineering").description("Fundamental programming constructs, data types, control flow, functions, and arrays in Java.").prerequisites("None").academicDegree("UNDERGRADUATE").build(),
            TestCourse.builder().code("CSE111T").name("Programming Language II (Test)").credits(3.0).department("Computer Science and Engineering").school("BSRM School of Engineering").description("Object-oriented programming principles: inheritance, polymorphism, encapsulation, and exceptions.").prerequisites("CSE110T").academicDegree("UNDERGRADUATE").build(),
            TestCourse.builder().code("CSE220T").name("Data Structures (Test)").credits(3.0).department("Computer Science and Engineering").school("BSRM School of Engineering").description("Linear and non-linear data structures: stacks, queues, linked lists, binary trees, and heaps.").prerequisites("CSE111T").academicDegree("UNDERGRADUATE").build(),
            TestCourse.builder().code("CSE221T").name("Algorithms (Test)").credits(3.0).department("Computer Science and Engineering").school("BSRM School of Engineering").description("Algorithm design and analysis: greedy method, dynamic programming, graph algorithms, divide & conquer.").prerequisites("CSE220T").academicDegree("UNDERGRADUATE").build(),
            TestCourse.builder().code("CSE320T").name("Data Communications (Test)").credits(3.0).department("Computer Science and Engineering").school("BSRM School of Engineering").description("Analog and digital signals, modulation techniques, multiplexing, error detection and correction.").prerequisites("CSE220T").academicDegree("UNDERGRADUATE").build(),
            TestCourse.builder().code("CSE370T").name("Database Systems (Test)").credits(3.0).department("Computer Science and Engineering").school("BSRM School of Engineering").description("Relational data model, relational algebra, SQL querying, normalization (1NF–BCNF), transactions.").prerequisites("CSE220T").academicDegree("UNDERGRADUATE").build(),
            TestCourse.builder().code("CSE420T").name("Compiler Design (Test)").credits(3.0).department("Computer Science and Engineering").school("BSRM School of Engineering").description("Lexical analysis, syntax parsing, syntax-directed translation, intermediate code generation.").prerequisites("CSE221T").academicDegree("UNDERGRADUATE").build(),
            TestCourse.builder().code("CSE421T").name("Computer Networks (Test)").credits(3.0).department("Computer Science and Engineering").school("BSRM School of Engineering").description("Layered network architectures, TCP/UDP transport, IP routing algorithms, socket programming.").prerequisites("CSE320T").academicDegree("UNDERGRADUATE").build(),
            TestCourse.builder().code("CSE422T").name("Artificial Intelligence (Test)").credits(3.0).department("Computer Science and Engineering").school("BSRM School of Engineering").description("State-space search, heuristic search (A*), minimax with alpha-beta pruning, machine learning basics.").prerequisites("CSE221T").academicDegree("UNDERGRADUATE").build(),
            TestCourse.builder().code("EEE201T").name("Electrical Circuits I (Test)").credits(3.0).department("Electrical and Electronic Engineering").school("BSRM School of Engineering").description("DC circuit fundamentals: Ohm's law, Kirchhoff's laws, Thevenin & Norton equivalents, nodal analysis.").prerequisites("None").academicDegree("UNDERGRADUATE").build(),
            TestCourse.builder().code("EEE203T").name("Electrical Circuits II (Test)").credits(3.0).department("Electrical and Electronic Engineering").school("BSRM School of Engineering").description("AC circuit analysis, phasors, impedance, sinusoidal steady-state analysis, balanced three-phase systems.").prerequisites("EEE201T").academicDegree("UNDERGRADUATE").build(),
            TestCourse.builder().code("EEE205T").name("Electronic Devices (Test)").credits(3.0).department("Electrical and Electronic Engineering").school("BSRM School of Engineering").description("Semiconductor diodes, bipolar junction transistors (BJT), field-effect transistors (FET), biasing circuits.").prerequisites("EEE201T").academicDegree("UNDERGRADUATE").build(),
            TestCourse.builder().code("MAT110T").name("Differential Calculus & Coordinate Geometry (Test)").credits(3.0).department("Mathematics and Natural Sciences").school("School of Data and Sciences").description("Functions, limits, continuity, derivative techniques, curve tracing, coordinate transformations.").prerequisites("None").academicDegree("UNDERGRADUATE").build(),
            TestCourse.builder().code("MAT120T").name("Integral Calculus & Differential Equations (Test)").credits(3.0).department("Mathematics and Natural Sciences").school("School of Data and Sciences").description("Definite & indefinite integrals, integration techniques, ordinary differential equations of first and second order.").prerequisites("MAT110T").academicDegree("UNDERGRADUATE").build(),
            TestCourse.builder().code("MAT215T").name("Linear Algebra & Complex Variables (Test)").credits(3.0).department("Mathematics and Natural Sciences").school("School of Data and Sciences").description("Matrix operations, determinants, vector spaces, linear transformations, eigenvalues, complex functions.").prerequisites("MAT120T").academicDegree("UNDERGRADUATE").build(),
            TestCourse.builder().code("STA201T").name("Elements of Statistics & Probability (Test)").credits(3.0).department("Mathematics and Natural Sciences").school("School of Data and Sciences").description("Descriptive statistics, conditional probability, random variables, normal distribution, hypothesis tests.").prerequisites("None").academicDegree("UNDERGRADUATE").build(),
            TestCourse.builder().code("PHY111T").name("Principles of Physics I (Test)").credits(3.0).department("Mathematics and Natural Sciences").school("School of Data and Sciences").description("Newtonian mechanics, rotational dynamics, work-energy theorem, fluid dynamics, oscillations and waves.").prerequisites("None").academicDegree("UNDERGRADUATE").build(),
            TestCourse.builder().code("BUS101T").name("Introduction to Business (Test)").credits(3.0).department("BRAC Business School").school("BRAC Business School").description("Foundations of modern business organizations, corporate structures, entrepreneurship, and global markets.").prerequisites("None").academicDegree("UNDERGRADUATE").build(),
            TestCourse.builder().code("ACT201T").name("Financial Accounting (Test)").credits(3.0).department("BRAC Business School").school("BRAC Business School").description("Accounting cycle, journal entries, balance sheet, income statement, cash flow statement preparation.").prerequisites("None").academicDegree("UNDERGRADUATE").build(),
            TestCourse.builder().code("MKT201T").name("Principles of Marketing (Test)").credits(3.0).department("BRAC Business School").school("BRAC Business School").description("Marketing mix (4Ps), target marketing, consumer purchasing behavior, branding strategies.").prerequisites("None").academicDegree("UNDERGRADUATE").build(),
            TestCourse.builder().code("ENG101T").name("English Fundamentals (Test)").credits(3.0).department("English and Humanities").school("School of Humanities and Social Sciences").description("Academic reading comprehension, critical analysis, paragraph structuring, and essay writing.").prerequisites("None").academicDegree("UNDERGRADUATE").build(),
            TestCourse.builder().code("PHB101T").name("Inorganic Pharmacy (Test)").credits(3.0).department("Pharmacy").school("School of Pharmacy").description("Chemical principles of pharmaceutical inorganic compounds, complexation, radiopharmaceuticals.").prerequisites("None").academicDegree("UNDERGRADUATE").build()
        );

        for (TestCourse c : courses) {
            if (!courseRepo.existsByCode(c.getCode())) {
                courseRepo.save(c);
                log.info("[TestCourseDataSeeder] Saved TestCourse: {} - {}", c.getCode(), c.getName());
            }
        }
    }

    // ── 3. Seed Sections with Strict Zero-Conflict Guarantee ───────
    private void seedSectionsWithConflictCheck() {
        if (sectionRepo.count() > 0) {
            log.info("[TestCourseDataSeeder] Test sections already present ({} sections).", sectionRepo.count());
            return;
        }

        List<TestCourse> courses = courseRepo.findAll();
        List<TestFaculty> faculties = facultyRepo.findAll();

        if (courses.isEmpty() || faculties.isEmpty()) {
            log.warn("[TestCourseDataSeeder] Cannot seed sections: courses or faculty list is empty.");
            return;
        }

        // Map faculty by ID for lookup
        Map<String, TestFaculty> facultyMap = new HashMap<>();
        for (TestFaculty f : faculties) {
            facultyMap.put(f.getFacultyId(), f);
        }

        // Standard 18 non-overlapping time slots
        List<String> timeSlots = List.of(
            "SUNDAY(08:00 AM-09:20 AM) ; TUESDAY(08:00 AM-09:20 AM)",   // Slot 0
            "SUNDAY(09:30 AM-10:50 AM) ; TUESDAY(09:30 AM-10:50 AM)",   // Slot 1
            "SUNDAY(11:00 AM-12:20 PM) ; TUESDAY(11:00 AM-12:20 PM)",   // Slot 2
            "SUNDAY(12:30 PM-01:50 PM) ; TUESDAY(12:30 PM-01:50 PM)",   // Slot 3
            "SUNDAY(02:00 PM-03:20 PM) ; TUESDAY(02:00 PM-03:20 PM)",   // Slot 4
            "SUNDAY(03:30 PM-04:50 PM) ; TUESDAY(03:30 PM-04:50 PM)",   // Slot 5
            "MONDAY(08:00 AM-09:20 AM) ; WEDNESDAY(08:00 AM-09:20 AM)", // Slot 6
            "MONDAY(09:30 AM-10:50 AM) ; WEDNESDAY(09:30 AM-10:50 AM)", // Slot 7
            "MONDAY(11:00 AM-12:20 PM) ; WEDNESDAY(11:00 AM-12:20 PM)", // Slot 8
            "MONDAY(12:30 PM-01:50 PM) ; WEDNESDAY(12:30 PM-01:50 PM)", // Slot 9
            "MONDAY(02:00 PM-03:20 PM) ; WEDNESDAY(02:00 PM-03:20 PM)", // Slot 10
            "MONDAY(03:30 PM-04:50 PM) ; WEDNESDAY(03:30 PM-04:50 PM)", // Slot 11
            "THURSDAY(08:00 AM-09:20 AM) ; SATURDAY(08:00 AM-09:20 AM)",// Slot 12
            "THURSDAY(09:30 AM-10:50 AM) ; SATURDAY(09:30 AM-10:50 AM)",// Slot 13
            "THURSDAY(11:00 AM-12:20 PM) ; SATURDAY(11:00 AM-12:20 PM)",// Slot 14
            "THURSDAY(12:30 PM-01:50 PM) ; SATURDAY(12:30 PM-01:50 PM)",// Slot 15
            "THURSDAY(02:00 PM-03:20 PM) ; SATURDAY(02:00 PM-03:20 PM)",// Slot 16
            "THURSDAY(03:30 PM-04:50 PM) ; SATURDAY(03:30 PM-04:50 PM)" // Slot 17
        );

        List<String> rooms = List.of(
            "UB04-201", "UB04-202", "UB04-301", "UB04-302", "UB05-101", "UB05-102",
            "UB03-101", "UB03-102", "UB02-201", "UB02-202", "UB01-101", "UB06-101"
        );

        // Track assigned time slots per faculty to mathematically verify conflict freedom
        Map<String, Set<String>> facultyTimeSlotMap = new HashMap<>();
        for (TestFaculty f : faculties) {
            facultyTimeSlotMap.put(f.getFacultyId(), new HashSet<>());
        }

        List<TestSection> sectionsToSave = new ArrayList<>();
        int facultyCount = faculties.size();
        int totalCourses = courses.size();
        int sectionCounter = 0;

        for (int cIdx = 0; cIdx < totalCourses; cIdx++) {
            TestCourse course = courses.get(cIdx);
            // Courses 0-13 have 3 sections, courses 14-21 have 4 sections (total 14*3 + 8*4 = 42 + 32 = 74 sections)
            int numSections = (cIdx < 14) ? 3 : 4;

            for (int secNum = 1; secNum <= numSections; secNum++) {
                String sectionNumStr = String.format("%02d", secNum);
                String sectionIdStr = course.getCode() + "-" + sectionNumStr;

                // Find a faculty member with an available, conflict-free time slot
                TestFaculty assignedFaculty = null;
                String assignedTimeSlot = null;

                // Rotate through faculty starting from a deterministic offset
                int startFacIdx = (sectionCounter + secNum) % facultyCount;
                for (int attempt = 0; attempt < facultyCount; attempt++) {
                    int candidateFacIdx = (startFacIdx + attempt) % facultyCount;
                    TestFaculty candidate = faculties.get(candidateFacIdx);
                    Set<String> takenSlots = facultyTimeSlotMap.get(candidate.getFacultyId());

                    // Try each time slot
                    for (int slotIdx = 0; slotIdx < timeSlots.size(); slotIdx++) {
                        String candidateSlot = timeSlots.get(slotIdx);
                        if (!takenSlots.contains(candidateSlot)) {
                            // Verify no conflict with existing slots of this faculty
                            boolean conflict = false;
                            for (String existingSlot : takenSlots) {
                                if (testCourseService.hasTimeConflict(candidateSlot, existingSlot)) {
                                    conflict = true;
                                    break;
                                }
                            }
                            if (!conflict) {
                                assignedFaculty = candidate;
                                assignedTimeSlot = candidateSlot;
                                takenSlots.add(candidateSlot);
                                break;
                            }
                        }
                    }
                    if (assignedFaculty != null) break;
                }

                if (assignedFaculty == null || assignedTimeSlot == null) {
                    throw new IllegalStateException("Failed to find conflict-free time slot for section: " + sectionIdStr);
                }

                String assignedRoom = rooms.get(sectionCounter % rooms.size());
                int bookedSeats = 10 + (sectionCounter % 18); // Booked between 10 and 27

                TestSection section = TestSection.builder()
                    .sectionId(sectionIdStr)
                    .course(course)
                    .faculty(assignedFaculty)
                    .sectionNumber(sectionNumStr)
                    .scheduleTime(assignedTimeSlot)
                    .room(assignedRoom)
                    .totalSeats(35)
                    .bookedSeats(bookedSeats)
                    .term("Summer2026")
                    .build();

                sectionsToSave.add(section);
                sectionCounter++;
            }
        }

        // ── Validation: Double-check all assigned sections per faculty for zero overlap
        Map<String, List<TestSection>> facultySections = new HashMap<>();
        for (TestSection sec : sectionsToSave) {
            facultySections.computeIfAbsent(sec.getFaculty().getFacultyId(), k -> new ArrayList<>()).add(sec);
        }

        for (Map.Entry<String, List<TestSection>> entry : facultySections.entrySet()) {
            String facId = entry.getKey();
            List<TestSection> secList = entry.getValue();
            for (int i = 0; i < secList.size(); i++) {
                for (int j = i + 1; j < secList.size(); j++) {
                    TestSection s1 = secList.get(i);
                    TestSection s2 = secList.get(j);
                    if (testCourseService.hasTimeConflict(s1.getScheduleTime(), s2.getScheduleTime())) {
                        throw new IllegalStateException(String.format(
                            "Schedule conflict detected for Faculty %s between %s (%s) and %s (%s)",
                            facId, s1.getSectionId(), s1.getScheduleTime(), s2.getSectionId(), s2.getScheduleTime()
                        ));
                    }
                }
            }
        }

        sectionRepo.saveAll(sectionsToSave);
        log.info("[TestCourseDataSeeder] Successfully seeded and verified {} sections with 0 schedule conflicts.", sectionsToSave.size());
    }

    private static class FacultySeedData {
        final String facultyId;
        final String name;
        final String email;
        final String department;
        final String designation;
        final String officeRoom;

        FacultySeedData(String facultyId, String name, String email, String department, String designation, String officeRoom) {
            this.facultyId   = facultyId;
            this.name        = name;
            this.email       = email;
            this.department  = department;
            this.designation = designation;
            this.officeRoom  = officeRoom;
        }
    }
}

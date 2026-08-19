package com.campusconnect.backend.service;

import com.campusconnect.backend.dto.ExamScheduleDTO;
import com.campusconnect.backend.model.ExamSchedule;
import com.campusconnect.backend.model.SectionRegistration;
import com.campusconnect.backend.repository.ExamScheduleRepository;
import com.campusconnect.backend.repository.SectionRegistrationRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

/**
 * ExamScheduleService – Business logic for exam schedule management.
 *
 * MVC Role: Service
 *
 * Responsibilities:
 *   1. {@code seedExamSchedules()} — Seeds the exam_schedules table on first
 *      startup with hardcoded midterm and final exam dates for ALL 43 courses
 *      in the BRACU course_catalog. Guard: only runs if count() == 0 (idempotent).
 *
 *   2. {@code reseedExamSchedules()} — Public method that deletes all rows and
 *      re-seeds. Called by POST /api/exam-schedule/reseed.
 *
 *   3. {@code getExamScheduleForStudent(studentId)} — Returns exam schedule DTOs
 *      for all courses the student is registered in via the section_registrations
 *      table (NOT the enrollment table). Sorted by nearest final exam first.
 *
 *   4. {@code getExamScheduleByCode(courseCode)} — Single course lookup.
 *
 *   5. {@code getAllExamSchedules()} — All exam schedules for bulk enrichment.
 *
 * Used by: ExamScheduleController
 */
@Service
public class ExamScheduleService {

    /** Current term — must match RegistrationService.CURRENT_TERM */
    private static final String CURRENT_TERM = "Fall2026";

    private final ExamScheduleRepository        examRepo;
    private final SectionRegistrationRepository regRepo;

    public ExamScheduleService(ExamScheduleRepository examRepo,
                               SectionRegistrationRepository regRepo) {
        this.examRepo = examRepo;
        this.regRepo  = regRepo;
    }

    // ── Seeding ───────────────────────────────────────────────────────────────

    /**
     * Seeds BRACU course exam dates on first startup if not already seeded via data.sql.
     * Guard: skips if the table already has >= 500 rows from data.sql.
     */
    @PostConstruct
    public void seedExamSchedules() {
        if (examRepo.count() >= 500) return;
        // If data.sql didn't run, seed fallback records
        if (examRepo.count() == 0) {
            doSeed();
        }
    }

    /**
     * Force-clears and re-seeds the exam_schedules table.
     * Called via POST /api/exam-schedule/reseed.
     */
    public void reseedExamSchedules() {
        examRepo.deleteAll();
        doSeed();
    }

    // ── Business Logic ────────────────────────────────────────────────────────

    /**
     * Returns exam schedule DTOs for all courses a student is registered in.
     * Uses section_registrations table (the active registration system).
     * De-duplicates by course code in case student has multiple sections.
     */
    public List<ExamScheduleDTO> getExamScheduleForStudent(String studentId) {
        List<SectionRegistration> registrations =
                regRepo.findByStudentIdAndTerm(studentId, CURRENT_TERM);

        if (registrations.isEmpty()) {
            return Collections.emptyList();
        }

        List<String> registeredCodes = registrations.stream()
                .map(r -> r.getSection().getCode())
                .distinct()
                .collect(Collectors.toList());

        return examRepo.findByCourseCodeIn(registeredCodes)
                .stream()
                .map(this::toDTO)
                .sorted(Comparator.comparingLong(dto -> {
                    // Sort by the closest upcoming exam (midterm or final, whichever is sooner)
                    // Treat passed exams (daysLeft < 0) as Long.MAX_VALUE so they sort last
                    long m = dto.getMidtermDaysLeft() >= 0 ? dto.getMidtermDaysLeft() : Long.MAX_VALUE;
                    long f = dto.getFinalDaysLeft()   >= 0 ? dto.getFinalDaysLeft()   : Long.MAX_VALUE;
                    return Math.min(m, f);
                }))
                .collect(Collectors.toList());
    }

    /**
     * Returns the exam schedule DTO for a single course code.
     * Returns null if no schedule exists. Used by Routine Builder.
     */
    public ExamScheduleDTO getExamScheduleByCode(String courseCode) {
        return examRepo.findByCourseCode(courseCode).map(this::toDTO).orElse(null);
    }

    /**
     * Returns all exam schedule DTOs sorted by course code.
     * Used by the Routine Builder to bulk-enrich all catalog entries.
     */
    public List<ExamScheduleDTO> getAllExamSchedules() {
        return examRepo.findAll()
                .stream()
                .map(this::toDTO)
                .sorted(Comparator.comparing(ExamScheduleDTO::getCourseCode))
                .collect(Collectors.toList());
    }

    // ── Private Helpers ───────────────────────────────────────────────────────

    /**
     * Runs the full seed: builds all 43 ExamSchedule rows and saves them.
     * Multiple courses can share the same exam datetime — realistic for university schedules.
     */
    private void doSeed() {
        List<ExamSchedule> schedules = new ArrayList<>();

        // ── CSE Courses (15) ──────────────────────────────────────────────────
        schedules.add(build("CSE110", "Programming Language I",         "2026-10-14T09:00", "2026-12-10T09:00"));
        schedules.add(build("CSE111", "Programming Language II",        "2026-10-14T14:00", "2026-12-10T14:00"));
        schedules.add(build("CSE220", "Data Structures",                "2026-10-16T09:00", "2026-12-12T14:00"));
        schedules.add(build("CSE221", "Algorithm Analysis & Design",    "2026-10-18T09:00", "2026-12-14T09:00"));
        schedules.add(build("CSE260", "Digital Logic Design",           "2026-10-16T14:00", "2026-12-12T09:00"));
        schedules.add(build("CSE321", "Operating Systems",              "2026-10-20T14:00", "2026-12-20T14:00"));
        schedules.add(build("CSE330", "Numerical Methods",              "2026-10-18T14:00", "2026-12-15T09:00"));
        schedules.add(build("CSE331", "Automata and Computability",     "2026-10-20T09:00", "2026-12-16T14:00"));
        schedules.add(build("CSE340", "Computer Architecture",          "2026-10-22T09:00", "2026-12-17T09:00"));
        schedules.add(build("CSE370", "Database Systems",               "2026-10-22T14:00", "2026-12-16T09:00"));
        schedules.add(build("CSE400", "Project/Thesis",                 "2026-10-28T09:00", "2026-12-22T09:00"));
        schedules.add(build("CSE420", "Compiler Design",                "2026-10-24T09:00", "2026-12-19T09:00"));
        schedules.add(build("CSE421", "Computer Networks",              "2026-10-24T14:00", "2026-12-19T14:00"));
        schedules.add(build("CSE422", "Artificial Intelligence",        "2026-10-26T09:00", "2026-12-21T09:00"));
        schedules.add(build("CSE470", "Software Engineering",           "2026-10-26T14:00", "2026-12-18T09:00"));

        // ── EEE Courses (10) ──────────────────────────────────────────────────
        schedules.add(build("EEE101", "Electrical Circuits I",          "2026-10-15T09:00", "2026-12-11T09:00"));
        schedules.add(build("EEE201", "Electrical Circuits II",         "2026-10-15T14:00", "2026-12-11T14:00"));
        schedules.add(build("EEE203", "Electronic Circuits I",          "2026-10-17T09:00", "2026-12-13T09:00"));
        schedules.add(build("EEE208", "Signals and Systems",            "2026-10-17T14:00", "2026-12-13T14:00"));
        schedules.add(build("EEE308", "Electronic Circuits II",         "2026-10-19T09:00", "2026-12-15T14:00"));
        schedules.add(build("EEE315", "Microprocessors & Interfacing",  "2026-10-19T14:00", "2026-12-17T14:00"));
        schedules.add(build("EEE321", "Digital Signal Processing",      "2026-10-21T09:00", "2026-12-20T09:00"));
        schedules.add(build("EEE401", "Power System Analysis",          "2026-10-23T09:00", "2026-12-21T14:00"));
        schedules.add(build("EEE411", "Renewable Energy Systems",       "2026-10-23T14:00", "2026-12-22T14:00"));
        schedules.add(build("EEE450", "Communication Systems",          "2026-10-25T09:00", "2026-12-23T09:00"));

        // ── BBA Courses (10) ──────────────────────────────────────────────────
        schedules.add(build("BUS101", "Introduction to Business",       "2026-10-14T09:00", "2026-12-10T09:00"));
        schedules.add(build("ECO101", "Microeconomics",                 "2026-10-14T14:00", "2026-12-10T14:00"));
        schedules.add(build("ECO102", "Macroeconomics",                 "2026-10-16T09:00", "2026-12-12T09:00"));
        schedules.add(build("ACC101", "Financial Accounting",           "2026-10-16T14:00", "2026-12-12T14:00"));
        schedules.add(build("MGT201", "Principles of Management",       "2026-10-18T09:00", "2026-12-14T14:00"));
        schedules.add(build("MKT301", "Marketing Management",           "2026-10-20T09:00", "2026-12-16T09:00"));
        schedules.add(build("FIN301", "Financial Management",           "2026-10-20T14:00", "2026-12-16T14:00"));
        schedules.add(build("MGT401", "Strategic Management",           "2026-10-22T09:00", "2026-12-18T14:00"));
        schedules.add(build("FIN401", "Investment Analysis",            "2026-10-22T14:00", "2026-12-19T09:00"));
        schedules.add(build("MKT402", "Digital Marketing & E-Commerce", "2026-10-24T09:00", "2026-12-20T09:00"));

        // ── General Education, Math, English, Physics (8) ─────────────────────
        schedules.add(build("ENG101", "English & Communication Skills I",      "2026-10-14T09:00", "2026-12-24T14:00"));
        schedules.add(build("ENG102", "English & Communication Skills II",     "2026-10-14T14:00", "2026-12-24T09:00"));
        schedules.add(build("MAT110", "Mathematics I",                         "2026-10-16T09:00", "2026-12-22T09:00"));
        schedules.add(build("MAT120", "Mathematics II",                        "2026-10-16T14:00", "2026-12-22T14:00"));
        schedules.add(build("MAT215", "Mathematics III (Linear Algebra)",      "2026-10-18T09:00", "2026-12-23T09:00"));
        schedules.add(build("MAT216", "Mathematics IV (Statistics)",           "2026-10-18T14:00", "2026-12-23T14:00"));
        schedules.add(build("PHY111", "Physics I (Mechanics)",                 "2026-10-15T09:00", "2026-12-11T09:00"));
        schedules.add(build("PHY112", "Physics II (Electromagnetism)",         "2026-10-15T14:00", "2026-12-11T14:00"));

        examRepo.saveAll(schedules);
    }

    /** Builds an ExamSchedule entity from ISO datetime strings (without seconds). */
    private ExamSchedule build(String code, String name, String midtermIso, String finalIso) {
        return ExamSchedule.builder()
                .courseCode(code)
                .courseName(name)
                .midtermDate(LocalDateTime.parse(midtermIso + ":00"))
                .finalDate(LocalDateTime.parse(finalIso + ":00"))
                .build();
    }

    /** Converts entity → DTO, computing days-left from today. */
    private ExamScheduleDTO toDTO(ExamSchedule e) {
        LocalDate today      = LocalDate.now();
        long midtermDays     = ChronoUnit.DAYS.between(today, e.getMidtermDate().toLocalDate());
        long finalDays       = ChronoUnit.DAYS.between(today, e.getFinalDate().toLocalDate());

        return ExamScheduleDTO.builder()
                .courseCode(e.getCourseCode())
                .courseName(e.getCourseName())
                .midtermDate(e.getMidtermDate())
                .finalDate(e.getFinalDate())
                .midtermDaysLeft(midtermDays)
                .finalDaysLeft(finalDays)
                .build();
    }
}

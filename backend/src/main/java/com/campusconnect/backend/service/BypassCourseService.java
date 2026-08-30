package com.campusconnect.backend.service;

import com.campusconnect.backend.model.CourseCatalog;
import com.campusconnect.backend.model.StudentCompletedCourse;
import com.campusconnect.backend.model.StudentProfile;
import com.campusconnect.backend.repository.CourseCatalogRepository;
import com.campusconnect.backend.repository.StudentCompletedCourseRepository;
import com.campusconnect.backend.repository.StudentProfileRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * BypassCourseService – Business logic for course bypass and CGPA tracking.
 *
 * MVC Role: Service
 *
 * Responsibilities:
 *  - Grants course waivers & credit additions directly to students without taking the course.
 *  - Tracks all completed & bypassed courses in `student_completed_courses`.
 *  - Recalculates and updates the student's cumulative CGPA and total completed credits in `student_profiles`.
 */
@Service
public class BypassCourseService {

    private final StudentCompletedCourseRepository completedCourseRepo;
    private final StudentProfileRepository         studentRepo;
    private final CourseCatalogRepository          catalogRepo;

    public BypassCourseService(StudentCompletedCourseRepository completedCourseRepo,
                               StudentProfileRepository studentRepo,
                               CourseCatalogRepository catalogRepo) {
        this.completedCourseRepo = completedCourseRepo;
        this.studentRepo         = studentRepo;
        this.catalogRepo         = catalogRepo;
    }

    // ── Grade point lookup table ────────────────────────────────────
    public static Double getGradePoint(String grade) {
        if (grade == null) return null;
        String g = grade.trim().toUpperCase();
        return switch (g) {
            case "A+", "A" -> 4.0;
            case "A-"      -> 3.7;
            case "B+"      -> 3.3;
            case "B"       -> 3.0;
            case "B-"      -> 2.7;
            case "C+"      -> 2.3;
            case "C"       -> 2.0;
            case "D"       -> 1.0;
            case "F"       -> 0.0;
            default        -> null; // WAIVED / P (non-GPA credit)
        };
    }

    /**
     * Bypass a course for a student and update CGPA and completed credits.
     */
    @Transactional
    public Map<String, Object> bypassCourse(Map<String, Object> req) {
        String studentId   = String.valueOf(req.getOrDefault("studentId", "")).trim();
        String courseCode  = String.valueOf(req.getOrDefault("courseCode", "")).trim().toUpperCase();
        String courseTitle = String.valueOf(req.getOrDefault("courseTitle", "")).trim();
        String grade       = String.valueOf(req.getOrDefault("grade", "A")).trim().toUpperCase();
        String reason      = String.valueOf(req.getOrDefault("reason", "Credit Transfer / Dean Approval")).trim();
        String bypassedBy  = String.valueOf(req.getOrDefault("bypassedBy", "Admin")).trim();
        String semester    = String.valueOf(req.getOrDefault("semester", "Transferred / Bypassed")).trim();

        int credits = 3;
        try {
            credits = Integer.parseInt(String.valueOf(req.getOrDefault("credits", "3")));
        } catch (Exception ignored) {}

        if (studentId.isBlank() || courseCode.isBlank()) {
            return Map.of("success", false, "message", "Student ID and Course Code are required.");
        }

        StudentProfile profile = studentRepo.findById(studentId).orElse(null);
        if (profile == null) {
            return Map.of("success", false, "message", "Student not found with ID: " + studentId);
        }

        // Fill course title from catalog if blank
        if (courseTitle.isBlank()) {
            Optional<CourseCatalog> cat = catalogRepo.findByCode(courseCode);
            courseTitle = cat.map(CourseCatalog::getName).orElse(courseCode + " (Bypassed)");
        }

        Double gradePoint = getGradePoint(grade);

        // Check if student already has this course in completed table
        Optional<StudentCompletedCourse> existing = completedCourseRepo.findByStudentIdAndCourseCode(studentId, courseCode);
        StudentCompletedCourse record;
        if (existing.isPresent()) {
            record = existing.get();
            record.setCourseTitle(courseTitle);
            record.setCredits(credits);
            record.setGrade(grade);
            record.setGradePoint(gradePoint);
            record.setReason(reason);
            record.setBypassedBy(bypassedBy);
            record.setBypassedAt(LocalDateTime.now().toString());
            record.setSemester(semester);
        } else {
            record = StudentCompletedCourse.builder()
                    .studentId(studentId)
                    .courseCode(courseCode)
                    .courseTitle(courseTitle)
                    .credits(credits)
                    .grade(grade)
                    .gradePoint(gradePoint)
                    .semester(semester)
                    .isBypassed(true)
                    .bypassedBy(bypassedBy)
                    .bypassedAt(LocalDateTime.now().toString())
                    .reason(reason)
                    .build();
        }
        completedCourseRepo.save(record);

        // Recalculate CGPA and total completed credits
        recalculateStudentAcademicStats(profile);

        return Map.of(
            "success",          true,
            "message",          "Course " + courseCode + " successfully bypassed for " + profile.getStudentName() + " (" + credits + " credits granted).",
            "record",           record,
            "updatedCgpa",      profile.getCgpa(),
            "completedCredits", profile.getCompletedCredits(),
            "onProbation",      profile.isOnProbation()
        );
    }

    /**
     * Recalculates student's CGPA and completed credits from all records.
     */
    @Transactional
    public void recalculateStudentAcademicStats(StudentProfile profile) {
        List<StudentCompletedCourse> courses = completedCourseRepo.findByStudentId(profile.getStudentId());

        int totalCredits = 0;
        double totalQualityPoints = 0.0;
        int gradedCredits = 0;
        List<String> passedCodes = new ArrayList<>();

        for (StudentCompletedCourse c : courses) {
            totalCredits += c.getCredits();
            passedCodes.add(c.getCourseCode());
            if (c.getGradePoint() != null && !c.getGrade().equalsIgnoreCase("F")) {
                totalQualityPoints += (c.getCredits() * c.getGradePoint());
                gradedCredits += c.getCredits();
            }
        }

        // If there are recorded courses in the database table, use them to calculate live CGPA
        if (gradedCredits > 0) {
            double rawCgpa = totalQualityPoints / gradedCredits;
            double roundedCgpa = Math.round(rawCgpa * 100.0) / 100.0;
            profile.setCgpa(roundedCgpa);
            profile.setCompletedCredits(totalCredits);
            profile.setOnProbation(roundedCgpa < 2.0);
        } else if (totalCredits > 0) {
            profile.setCompletedCredits(totalCredits);
        }

        profile.setCompletedCourses(String.join(",", passedCodes));
        studentRepo.save(profile);
    }

    /**
     * Gets a student's full completed & bypassed courses history and academic summary.
     */
    public Map<String, Object> getStudentHistory(String studentId) {
        Optional<StudentProfile> profOpt = studentRepo.findById(studentId);
        if (profOpt.isEmpty()) {
            return Map.of("success", false, "message", "Student not found");
        }

        StudentProfile profile = profOpt.get();
        List<StudentCompletedCourse> courses = completedCourseRepo.findByStudentIdOrderByBypassedAtDesc(studentId);

        // Compute summary metrics
        int totalBypassedCredits = courses.stream().filter(StudentCompletedCourse::isBypassed).mapToInt(StudentCompletedCourse::getCredits).sum();
        int totalCoursesCount = courses.size();

        return Map.of(
            "success",               true,
            "studentId",             profile.getStudentId(),
            "studentName",           profile.getStudentName(),
            "email",                 profile.getEmail(),
            "department",            profile.getDepartment(),
            "cgpa",                  profile.getCgpa(),
            "completedCredits",      profile.getCompletedCredits(),
            "onProbation",           profile.isOnProbation(),
            "totalBypassedCredits",  totalBypassedCredits,
            "courses",               courses
        );
    }

    /**
     * Deletes / reverts a bypassed course and updates student CGPA and credits.
     */
    @Transactional
    public Map<String, Object> deleteBypassRecord(String studentId, Long recordId) {
        Optional<StudentCompletedCourse> recOpt = completedCourseRepo.findById(recordId);
        if (recOpt.isEmpty()) {
            return Map.of("success", false, "message", "Record not found");
        }

        StudentCompletedCourse rec = recOpt.get();
        completedCourseRepo.delete(rec);

        Optional<StudentProfile> profOpt = studentRepo.findById(studentId);
        if (profOpt.isPresent()) {
            StudentProfile profile = profOpt.get();
            recalculateStudentAcademicStats(profile);
            return Map.of(
                "success",          true,
                "message",          "Bypass record for " + rec.getCourseCode() + " removed successfully.",
                "updatedCgpa",      profile.getCgpa(),
                "completedCredits", profile.getCompletedCredits()
            );
        }

        return Map.of("success", true, "message", "Bypass record removed.");
    }
}

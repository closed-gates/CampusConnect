package com.campusconnect.backend.service;

import com.campusconnect.backend.dto.GpaPredictRequest;
import com.campusconnect.backend.dto.GpaRetakeRequest;
import com.campusconnect.backend.model.AdvisedCourse;
import com.campusconnect.backend.model.StudentCompletedCourse;
import com.campusconnect.backend.model.StudentProfile;
import com.campusconnect.backend.repository.StudentCompletedCourseRepository;
import com.campusconnect.backend.repository.StudentProfileRepository;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * GpaService – Business logic for Grade Tracking and GPA Calculation.
 *
 * MVC Role: Service
 *
 * Responsibilities:
 *  - Build the student transcript grouped by semester with per-semester GPA and running CGPA.
 *  - Return the student's current in-progress (advised) courses for use in the predictive calculator.
 *  - Calculate predicted overall CGPA combining existing completed coursework + new predicted grades.
 *  - Simulate a course retake using grade-replacement policy.
 *
 * Key policies (confirmed from existing codebase):
 *  - Grading scale: delegated to BypassCourseService.getGradePoint() (single source of truth).
 *  - WAIVED / null gradePoint courses: excluded from GPA computation.
 *  - Zero-credit courses: naturally contribute 0 quality points.
 *  - Retake policy: GRADE REPLACEMENT — hypothetical new grade fully replaces the old grade.
 *  - ALL calculations here are SIMULATION ONLY — no writes to any database table.
 */
@Service
public class GpaService {

    private final StudentCompletedCourseRepository completedCourseRepo;
    private final StudentProfileRepository         studentRepo;

    public GpaService(StudentCompletedCourseRepository completedCourseRepo,
                      StudentProfileRepository studentRepo) {
        this.completedCourseRepo = completedCourseRepo;
        this.studentRepo         = studentRepo;
    }

    // ── Grade point lookup (delegates to single source of truth) ──────────────
    private static Double gradePoint(String grade) {
        return BypassCourseService.getGradePoint(grade);
    }

    // ── CGPA formula ───────────────────────────────────────────────────────────
    // Formula: Σ(gradePoint) / number of GPA-eligible courses
    private static double computeGpa(double totalGradePoints, int courseCount) {
        if (courseCount <= 0) return 0.0;
        return Math.round((totalGradePoints / courseCount) * 100.0) / 100.0;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 1. TRANSCRIPT
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Builds the full transcript for a student.
     *
     * @param studentId The student's ID (extracted from JWT by the controller).
     * @return A map containing:
     *   - success       : boolean
     *   - studentId     : String
     *   - studentName   : String
     *   - currentCgpa   : double   (from StudentProfile — authoritative DB value)
     *   - completedCredits : int
     *   - standing      : String   (e.g. "Good Standing")
     *   - semesters     : List of semester blocks, each with:
     *       - term      : String (e.g. "Summer 2026")
     *       - courses   : List of course rows
     *       - semGpa    : double (GPA for this semester only)
     *       - runningCgpa : double (cumulative after this semester)
     *   - totalGradedCredits : int
     */
    public Map<String, Object> getTranscript(String studentId) {
        Optional<StudentProfile> profOpt = studentRepo.findById(studentId);
        if (profOpt.isEmpty()) {
            return Map.of("success", false, "message", "Student profile not found.");
        }
        StudentProfile profile = profOpt.get();

        // Fetch all completed courses, sorted oldest semester first
        List<StudentCompletedCourse> allCourses = completedCourseRepo.findByStudentId(studentId);

        // Group by semester (preserving insertion order via LinkedHashMap is unreliable across semesters;
        // sort alphabetically — later UI may want to sort by date, but we don't have a date field).
        // We sort so that "Transferred / Bypassed" entries appear at the end.
        Map<String, List<StudentCompletedCourse>> bySemester = allCourses.stream()
                .sorted(Comparator.comparing(c -> {
                    String s = c.getSemester() == null ? "" : c.getSemester();
                    // Put "Transferred / Bypassed" entries last
                    return s.toLowerCase().contains("transferred") || s.toLowerCase().contains("bypassed")
                            ? "ZZZZ" + s : s;
                }))
                .collect(Collectors.groupingBy(
                        c -> c.getSemester() == null ? "Unknown" : c.getSemester(),
                        LinkedHashMap::new,
                        Collectors.toList()
                ));

        // Build semester blocks with per-semester GPA and running cumulative CGPA
        double cumulativeGradePoints = 0.0;
        int    cumulativeCourseCount  = 0;

        List<Map<String, Object>> semesterBlocks = new ArrayList<>();

        for (Map.Entry<String, List<StudentCompletedCourse>> entry : bySemester.entrySet()) {
            String                        term    = entry.getKey();
            List<StudentCompletedCourse>  courses = entry.getValue();

            double semGradePoints = 0.0;
            int    semCourseCount  = 0;
            List<Map<String, Object>> courseRows = new ArrayList<>();

            for (StudentCompletedCourse c : courses) {
                boolean countsForGpa = c.getGradePoint() != null
                        && !("WAIVED".equalsIgnoreCase(c.getGrade()))
                        && !("P".equalsIgnoreCase(c.getGrade()));

                if (countsForGpa) {
                    semGradePoints += c.getGradePoint();
                    semCourseCount++;
                }

                Map<String, Object> row = new LinkedHashMap<>();
                row.put("id",           c.getId());
                row.put("courseCode",   c.getCourseCode());
                row.put("courseTitle",  c.getCourseTitle());
                row.put("credits",      c.getCredits());
                row.put("grade",        c.getGrade());
                row.put("gradePoint",   c.getGradePoint());   // null for WAIVED/P
                row.put("countsForGpa", countsForGpa);
                row.put("isBypassed",   c.isBypassed());
                courseRows.add(row);
            }

            cumulativeGradePoints += semGradePoints;
            cumulativeCourseCount += semCourseCount;

            double semGpa     = computeGpa(semGradePoints, semCourseCount);
            double runningGpa = computeGpa(cumulativeGradePoints, cumulativeCourseCount);

            Map<String, Object> semBlock = new LinkedHashMap<>();
            semBlock.put("term",         term);
            semBlock.put("courses",      courseRows);
            semBlock.put("semGpa",       semGpa);
            semBlock.put("runningCgpa",  runningGpa);
            semesterBlocks.add(semBlock);
        }

        double finalCgpa = computeGpa(cumulativeGradePoints, cumulativeCourseCount);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("success",          true);
        result.put("studentId",        profile.getStudentId());
        result.put("studentName",      profile.getStudentName());
        result.put("currentCgpa",      finalCgpa);
        result.put("storedCgpa",       profile.getCgpa());   // authoritative DB CGPA
        result.put("completedCredits", profile.getCompletedCredits());
        result.put("onProbation",      profile.isOnProbation());
        result.put("semesters",        semesterBlocks);
        result.put("totalSemesters",   semesterBlocks.size());
        return result;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 2. CURRENT IN-PROGRESS COURSES
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Returns the student's currently advised (in-progress) courses for use in the
     * predictive CGPA calculator.
     *
     * @param studentId The student's ID (from JWT).
     * @return Map with "success" and "courses" list.
     */
    public Map<String, Object> getCurrentCourses(String studentId) {
        Optional<StudentProfile> profOpt = studentRepo.findById(studentId);
        if (profOpt.isEmpty()) {
            return Map.of("success", false, "message", "Student profile not found.");
        }
        StudentProfile profile = profOpt.get();
        List<AdvisedCourse> advised = profile.getAdvisedCourses();

        List<Map<String, Object>> courses = advised.stream().map(ac -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("courseCode",  ac.getCourseCode());
            m.put("courseName",  ac.getCourseTitle());
            m.put("credits",     ac.getCredits());
            m.put("section",     ac.getSection());
            m.put("faculty",     ac.getFaculty());
            return m;
        }).collect(Collectors.toList());

        return Map.of("success", true, "courses", courses);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 3. PREDICTIVE CGPA CALCULATOR
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Calculates a predicted overall CGPA by combining the student's existing
     * completed coursework quality points with predicted grades for new courses.
     *
     * SIMULATION ONLY — no data is written to the database.
     *
     * @param studentId The student's ID (from JWT).
     * @param req       Prediction request containing course/grade pairs.
     * @return Map with:
     *   - predictedSemGpa  : double  (GPA for the predicted semester only)
     *   - predictedCgpa    : double  (overall CGPA including existing + predicted)
     *   - existingCgpa     : double  (CGPA before the new semester)
     *   - breakdown        : List of per-course calculation details
     *   - totalPredictedCredits  : double
     *   - totalExistingCredits   : double
     */
    public Map<String, Object> predictCgpa(String studentId, GpaPredictRequest req) {
        // Load existing completed quality points
        List<StudentCompletedCourse> existing = completedCourseRepo.findByStudentId(studentId);

        double existingGradePoints = 0.0;
        int    existingCourseCount  = 0;
        for (StudentCompletedCourse c : existing) {
            if (c.getGradePoint() != null
                    && !"WAIVED".equalsIgnoreCase(c.getGrade())
                    && !"P".equalsIgnoreCase(c.getGrade())) {
                existingGradePoints += c.getGradePoint();
                existingCourseCount++;
            }
        }
        double existingCgpa = computeGpa(existingGradePoints, existingCourseCount);

        // Process predicted courses
        double predictedSemGradePoints = 0.0;
        int    predictedSemCourseCount  = 0;
        List<Map<String, Object>> breakdown = new ArrayList<>();

        List<GpaPredictRequest.CourseGradePair> courses =
                req.getCourses() != null ? req.getCourses() : Collections.emptyList();

        for (GpaPredictRequest.CourseGradePair pair : courses) {
            if (pair.getPredictedGrade() == null || pair.getPredictedGrade().isBlank()) continue;
            
            Double gp = gradePoint(pair.getPredictedGrade());
            boolean countsForGpa = gp != null;

            Map<String, Object> row = new LinkedHashMap<>();
            row.put("courseCode",     pair.getCourseCode());
            row.put("courseName",     pair.getCourseName());
            row.put("credits",        pair.getCredits());
            row.put("predictedGrade", pair.getPredictedGrade());
            row.put("gradePoint",     gp);
            row.put("countsForGpa",   countsForGpa);
            breakdown.add(row);

            if (countsForGpa) {
                predictedSemGradePoints += gp;
                predictedSemCourseCount++;
            }
        }

        double predictedSemGpa = computeGpa(predictedSemGradePoints, predictedSemCourseCount);
        double combinedGradePoints = existingGradePoints + predictedSemGradePoints;
        int    combinedCourseCount  = existingCourseCount + predictedSemCourseCount;
        double predictedCgpa   = computeGpa(combinedGradePoints, combinedCourseCount);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("success",               true);
        result.put("existingCgpa",          existingCgpa);
        result.put("existingCourseCount",   existingCourseCount);
        result.put("predictedSemGpa",       predictedSemGpa);
        result.put("predictedCgpa",         predictedCgpa);
        result.put("totalPredictedCourses", predictedSemCourseCount);
        result.put("breakdown",             breakdown);
        result.put("simulated",             true);  // always flag as simulation
        return result;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 4. RETAKE SIMULATOR (grade replacement policy)
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Simulates the effect on CGPA if the student retakes a completed course and earns a better grade.
     *
     * Policy: GRADE REPLACEMENT — the new grade completely replaces the old one in the calculation.
     *
     * SIMULATION ONLY — no data is written to the database.
     *
     * @param studentId The student's ID (from JWT).
     * @param req       The retake request (courseCode + newGrade).
     * @return Map with:
     *   - beforeCgpa        : double
     *   - afterCgpa         : double
     *   - cgpaChange        : double (afterCgpa - beforeCgpa)
     *   - courseCode        : String
     *   - courseTitle       : String
     *   - oldGrade          : String
     *   - oldGradePoint     : Double
     *   - newGrade          : String
     *   - newGradePoint     : Double
     *   - credits           : int
     *   - simulated         : true
     */
    public Map<String, Object> simulateRetake(String studentId, GpaRetakeRequest req) {
        // Validate new grade
        Double newGp = gradePoint(req.getNewGrade());
        if (newGp == null && req.getNewGrade() != null
                && !req.getNewGrade().equalsIgnoreCase("F")) {
            return Map.of("success", false,
                    "message", "Invalid grade: " + req.getNewGrade() + ". Use A+, A, A-, B+, B, B-, C+, C, D, or F.");
        }

        // Load all completed courses
        List<StudentCompletedCourse> allCourses = completedCourseRepo.findByStudentId(studentId);

        // Find the target course
        Optional<StudentCompletedCourse> targetOpt = allCourses.stream()
                .filter(c -> c.getCourseCode().equalsIgnoreCase(req.getCourseCode()))
                .findFirst();
        if (targetOpt.isEmpty()) {
            return Map.of("success", false,
                    "message", "No completed course found with code: " + req.getCourseCode());
        }
        StudentCompletedCourse target = targetOpt.get();

        // ── BEFORE: Σ(gradePoint) / courseCount ──────────────────────────────
        double beforeGradePoints = 0.0;
        int    beforeCourseCount  = 0;
        Double oldGp              = null;

        for (StudentCompletedCourse c : allCourses) {
            final Double gp = c.getGradePoint();
            if (gp == null) continue;
            if ("WAIVED".equalsIgnoreCase(c.getGrade()) || "P".equalsIgnoreCase(c.getGrade())) continue;
            beforeGradePoints += gp;
            beforeCourseCount++;
            if (c.getCourseCode().equalsIgnoreCase(req.getCourseCode())) {
                oldGp = gp;
            }
        }
        double beforeCgpa = computeGpa(beforeGradePoints, beforeCourseCount);

        // ── AFTER: grade replacement ──────────────────────────────────────────
        double afterGradePoints = beforeGradePoints;
        int    afterCourseCount  = beforeCourseCount;

        // Remove old contribution (if it counted)
        if (oldGp != null) {
            afterGradePoints -= oldGp;
            afterCourseCount--;
        }

        // Add new grade contribution
        final double effectiveNewGp = (newGp != null) ? newGp : 0.0; // F → 0.0
        afterGradePoints += effectiveNewGp;
        afterCourseCount++;

        double afterCgpa  = computeGpa(afterGradePoints, afterCourseCount);
        double cgpaChange = Math.round((afterCgpa - beforeCgpa) * 100.0) / 100.0;

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("success",       true);
        result.put("courseCode",    target.getCourseCode());
        result.put("courseTitle",   target.getCourseTitle());
        result.put("credits",       target.getCredits());
        result.put("oldGrade",      target.getGrade());
        result.put("oldGradePoint", target.getGradePoint());
        result.put("newGrade",      req.getNewGrade() == null ? "" : req.getNewGrade().toUpperCase());
        result.put("newGradePoint", effectiveNewGp);
        result.put("beforeCgpa",    beforeCgpa);
        result.put("afterCgpa",     afterCgpa);
        result.put("cgpaChange",    cgpaChange);
        result.put("improved",      cgpaChange > 0);
        result.put("simulated",     true);
        result.put("retakePolicy",  "GRADE_REPLACEMENT");
        return result;
    }
}


package com.campusconnect.backend.controller;

import com.campusconnect.backend.model.CourseCatalog;
import com.campusconnect.backend.model.CourseSection;
import com.campusconnect.backend.model.Enrollment;
import com.campusconnect.backend.repository.CourseCatalogRepository;
import com.campusconnect.backend.repository.CourseSectionRepository;
import com.campusconnect.backend.repository.EnrollmentRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

/**
 * CourseController – REST API for BRACU course catalog, sections, and enrollment.
 *
 * MVC Role: Controller
 *
 * Endpoints:
 *   GET  /api/courses/catalog               – All catalog courses (client-side filtered)
 *   GET  /api/courses/sections?q=           – All sections (optional search)
 *   POST /api/courses/enroll                – Enroll student in a catalog course
 *   GET  /api/courses/enrolled?studentId=   – Get enrolled course IDs for a student
 */
@RestController
@RequestMapping("/api/courses")
@CrossOrigin(origins = "*")
public class CourseController {

    private final CourseCatalogRepository catalogRepo;
    private final CourseSectionRepository sectionRepo;
    private final EnrollmentRepository    enrollmentRepo;

    public CourseController(CourseCatalogRepository catalogRepo,
                            CourseSectionRepository sectionRepo,
                            EnrollmentRepository enrollmentRepo) {
        this.catalogRepo    = catalogRepo;
        this.sectionRepo    = sectionRepo;
        this.enrollmentRepo = enrollmentRepo;
    }

    // ── GET /api/courses/catalog ──────────────────────────────────────────────
    /**
     * Returns all courses in the catalog.
     * Filtering is handled client-side (58 BRACU courses, small dataset).
     */
    @GetMapping("/catalog")
    public ResponseEntity<List<CourseCatalog>> getCatalog() {
        return ResponseEntity.ok(catalogRepo.findAll());
    }

    // ── GET /api/courses/sections ─────────────────────────────────────────────
    /**
     * Returns all course sections for the Routine Builder.
     * Supports optional ?q= search param (code, title, section number).
     */
    @GetMapping("/sections")
    public ResponseEntity<List<CourseSection>> getSections(
            @RequestParam(value = "q", required = false, defaultValue = "") String q) {
        if (q.isBlank()) {
            return ResponseEntity.ok(sectionRepo.findAll());
        }
        return ResponseEntity.ok(sectionRepo.search(q));
    }

    // ── POST /api/courses/enroll ──────────────────────────────────────────────
    /**
     * Enrolls a student in a catalog course.
     * Body: { "studentId": "...", "courseId": 1 }
     * Returns 409 if already enrolled, 404 if course not found.
     */
    @PostMapping("/enroll")
    public ResponseEntity<?> enroll(@RequestBody Map<String, Object> body) {
        String studentId = (String) body.get("studentId");
        Long courseId    = Long.valueOf(body.get("courseId").toString());

        if (enrollmentRepo.existsByStudentIdAndCourse_Id(studentId, courseId)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "Already enrolled in this course."));
        }

        CourseCatalog course = catalogRepo.findById(courseId)
                .orElse(null);
        if (course == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Course not found."));
        }

        Enrollment enrollment = Enrollment.builder()
                .studentId(studentId)
                .course(course)
                .build();
        enrollmentRepo.save(enrollment);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("message", "Enrolled successfully.", "courseCode", course.getCode()));
    }

    // ── GET /api/courses/enrolled ─────────────────────────────────────────────
    /**
     * Returns the list of course IDs a student is enrolled in.
     * Used to sync localStorage cache with the database on page load.
     */
    @GetMapping("/enrolled")
    public ResponseEntity<List<Long>> getEnrolled(
            @RequestParam("studentId") String studentId) {
        List<Long> ids = enrollmentRepo.findByStudentId(studentId)
                .stream()
                .map(e -> e.getCourse().getId())
                .collect(Collectors.toList());
        return ResponseEntity.ok(ids);
    }
}

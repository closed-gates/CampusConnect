package com.campusconnect.backend.controller;

import com.campusconnect.backend.model.CourseCatalog;
import com.campusconnect.backend.model.CourseSection;
import com.campusconnect.backend.repository.CourseCatalogRepository;
import com.campusconnect.backend.repository.CourseSectionRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * CourseController – REST API for BRACU course catalog and routine sections.
 *
 * MVC Role: Controller
 *
 * Endpoints:
 *   GET /api/courses/catalog              – All catalog courses (no filter)
 *   GET /api/courses/catalog?q=           – Keyword search across code/name/dept/school
 *   GET /api/courses/catalog?dept=        – Filter by department
 *   GET /api/courses/catalog?school=      – Filter by school
 *   GET /api/courses/catalog?genEd=true   – Filter by GenEd flag
 *   GET /api/courses/departments          – All distinct department names
 *   GET /api/courses/schools              – All distinct school names
 *   GET /api/courses/sections?q=          – All sections for routine builder & advising
 */
@RestController
@RequestMapping("/api/courses")
@CrossOrigin(origins = "*")
public class CourseController {

    private final CourseCatalogRepository catalogRepo;
    private final CourseSectionRepository sectionRepo;

    public CourseController(CourseCatalogRepository catalogRepo,
                            CourseSectionRepository sectionRepo) {
        this.catalogRepo = catalogRepo;
        this.sectionRepo = sectionRepo;
    }

    // ── GET /api/courses/catalog ──────────────────────────────────────────────

    /**
     * Returns courses from the catalog with optional server-side filtering.
     * Priority: keyword search > department > school > genEd > all.
     * All 564 BRACU courses are loaded; client-side pagination is optional.
     */
    @GetMapping("/catalog")
    public ResponseEntity<List<CourseCatalog>> getCatalog(
            @RequestParam(value = "q",      required = false, defaultValue = "") String q,
            @RequestParam(value = "dept",   required = false, defaultValue = "") String dept,
            @RequestParam(value = "school", required = false, defaultValue = "") String school,
            @RequestParam(value = "genEd",  required = false, defaultValue = "") String genEd) {

        if (!q.isBlank()) {
            return ResponseEntity.ok(catalogRepo.searchByKeyword(q));
        }
        if (!dept.isBlank()) {
            return ResponseEntity.ok(catalogRepo.findByDepartmentIgnoreCase(dept));
        }
        if (!school.isBlank()) {
            return ResponseEntity.ok(catalogRepo.findBySchoolIgnoreCase(school));
        }
        if ("true".equalsIgnoreCase(genEd)) {
            return ResponseEntity.ok(catalogRepo.findByIsGenEd(true));
        }
        if ("false".equalsIgnoreCase(genEd)) {
            return ResponseEntity.ok(catalogRepo.findByIsGenEd(false));
        }
        return ResponseEntity.ok(catalogRepo.findAll());
    }

    // ── GET /api/courses/departments ──────────────────────────────────────────

    /**
     * Returns all distinct department names sorted alphabetically.
     * Used to populate filter dropdowns in the frontend.
     */
    @GetMapping("/departments")
    public ResponseEntity<List<String>> getDepartments() {
        return ResponseEntity.ok(catalogRepo.findDistinctDepartments());
    }

    // ── GET /api/courses/schools ──────────────────────────────────────────────

    /**
     * Returns all distinct school names sorted alphabetically.
     * Used to populate school/faculty filter tabs in the frontend.
     */
    @GetMapping("/schools")
    public ResponseEntity<List<String>> getSchools() {
        return ResponseEntity.ok(catalogRepo.findDistinctSchools());
    }

    // ── GET /api/courses/sections ─────────────────────────────────────────────

    /**
     * Returns all 2,298 course sections for the Routine Builder.
     * Supports optional ?q= search param (code, title, section number).
     */
    @GetMapping("/sections")
    public ResponseEntity<List<CourseSection>> getSections(
            @RequestParam(value = "q", required = false, defaultValue = "") String q) {
        if (q.isBlank()) {
            return ResponseEntity.ok(sectionRepo.findAllOrderByCodeAndSection());
        }
        return ResponseEntity.ok(sectionRepo.search(q));
    }
}

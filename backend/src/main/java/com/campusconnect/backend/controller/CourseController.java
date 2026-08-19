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
 *   GET /api/courses/catalog          – All catalog courses (informational browsing)
 *   GET /api/courses/sections?q=      – All sections for routine builder & advising
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
            return ResponseEntity.ok(sectionRepo.findAllOrderByCodeAndSection());
        }
        return ResponseEntity.ok(sectionRepo.search(q));
    }
}

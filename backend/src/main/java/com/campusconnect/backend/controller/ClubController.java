package com.campusconnect.backend.controller;

import com.campusconnect.backend.model.Application;
import com.campusconnect.backend.model.ClubNotice;
import com.campusconnect.backend.model.Recruitment;
import com.campusconnect.backend.service.ClubService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * ClubController – Thin REST handler for club-related endpoints.
 *
 * MVC Role: Controller
 *
 * Base URL: /api/clubs
 *
 * All business logic and data management has been moved to {@link ClubService}.
 * This controller is responsible only for:
 *   1. Accepting HTTP requests and extracting parameters
 *   2. Delegating to ClubService
 *   3. Returning HTTP responses
 *
 * Endpoints:
 *   GET  /api/clubs/notices       → list all notices (pinned first)
 *   POST /api/clubs/notices       → post a new notice (admin)
 *   GET  /api/clubs/recruitment   → list active recruitment postings
 *   POST /api/clubs/recruitment   → post a recruitment listing (admin)
 *   POST /api/clubs/apply         → submit a student application
 *
 * TODO (Phase 3 – Auth & RBAC):
 *   - Validate JWT from Authorization header
 *   - Restrict POST endpoints to ADMIN role only
 */
@RestController
@RequestMapping("/api/clubs")
public class ClubController {

    private final ClubService clubService;

    public ClubController(ClubService clubService) {
        this.clubService = clubService;
    }

    // ── GET /api/clubs/notices ─────────────────────────────────────
    /**
     * Returns all club notices, pinned items first.
     */
    @GetMapping("/notices")
    public ResponseEntity<Map<String, Object>> getNotices() {
        List<ClubNotice> data = clubService.getAllNotices();
        return ResponseEntity.ok(Map.of(
            "success", true,
            "count",   data.size(),
            "data",    data
        ));
    }

    // ── POST /api/clubs/notices ────────────────────────────────────
    /**
     * Admin: Post a new club notice.
     * TODO Phase 3: Validate ADMIN role from JWT before accepting.
     */
    @PostMapping("/notices")
    public ResponseEntity<Map<String, Object>> postNotice(@RequestBody Map<String, String> body) {
        ClubNotice notice = clubService.postNotice(
            body.get("clubName"),
            body.get("title"),
            body.get("body")
        );
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Notice posted successfully.",
            "data",    notice
        ));
    }

    // ── GET /api/clubs/recruitment ─────────────────────────────────
    /**
     * Returns all active recruitment postings.
     */
    @GetMapping("/recruitment")
    public ResponseEntity<Map<String, Object>> getRecruitments() {
        List<Recruitment> data = clubService.getActiveRecruitments();
        return ResponseEntity.ok(Map.of(
            "success", true,
            "count",   data.size(),
            "data",    data
        ));
    }

    // ── POST /api/clubs/recruitment ────────────────────────────────
    /**
     * Admin: Post a new recruitment listing.
     * TODO Phase 3: Validate ADMIN role from JWT.
     */
    @PostMapping("/recruitment")
    public ResponseEntity<Map<String, Object>> postRecruitment(@RequestBody Map<String, String> body) {
        int slots = 5;
        try { slots = Integer.parseInt(body.getOrDefault("slots", "5")); } catch (NumberFormatException ignored) {}

        Recruitment posting = clubService.postRecruitment(
            body.get("clubName"),
            body.get("role"),
            body.get("description"),
            body.get("deadline"),
            slots
        );
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Recruitment posting published.",
            "data",    posting
        ));
    }

    // ── POST /api/clubs/apply ──────────────────────────────────────
    /**
     * Student: Submit an application for a recruitment posting.
     */
    @PostMapping("/apply")
    public ResponseEntity<Map<String, Object>> applyToClub(@RequestBody Map<String, String> body) {
        Application application = clubService.applyToClub(
            body.get("recruitmentId"),
            body.get("clubName"),
            body.get("role"),
            body.get("studentName"),
            body.get("studentEmail"),
            body.get("motivation")
        );
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Application submitted! The club will contact you soon.",
            "data",    application
        ));
    }
}

package com.campusconnect.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.atomic.AtomicLong;

/**
 * ClubController — Phase 2 Static Demo
 *
 * Provides Club Recruitment & Notices endpoints backed by in-memory
 * lists (no database). This is a prototype for the faculty demo.
 *
 * Endpoints:
 *   GET  /api/clubs/notices          → list all notices
 *   POST /api/clubs/notices          → post a new notice (admin)
 *   GET  /api/clubs/recruitment      → list recruitment postings
 *   POST /api/clubs/recruitment      → post a recruitment form (admin)
 *   POST /api/clubs/apply            → submit a student application
 *
 * TODO (Phase 3 – Auth & RBAC):
 *   - Validate JWT from Authorization header
 *   - Restrict POST endpoints to ADMIN role only
 *   - Persist data to MySQL via ClubNoticeRepository
 */
@RestController
@RequestMapping("/api/clubs")
public class ClubController {

    // ── In-memory data stores ──────────────────────────────────────
    private final List<Map<String, Object>> notices        = new ArrayList<>();
    private final List<Map<String, Object>> recruitments   = new ArrayList<>();
    private final List<Map<String, Object>> applications   = new ArrayList<>();

    private final AtomicLong noticeIdSeq      = new AtomicLong(4);
    private final AtomicLong recruitIdSeq     = new AtomicLong(4);
    private final AtomicLong applicationIdSeq = new AtomicLong(1);

    // ── Seed data ──────────────────────────────────────────────────
    public ClubController() {
        // Seeded notices
        notices.add(Map.of(
            "id",        1L,
            "clubName",  "Robotics Club",
            "title",     "Annual Robo-Wars Competition 2026",
            "body",      "We are excited to announce the Annual Robo-Wars Competition! All students are welcome to participate. Teams of 2–4 members. Register before August 10th at the club office.",
            "postedBy",  "Admin",
            "postedAt",  "2026-07-20T10:00:00",
            "pinned",    true
        ));
        notices.add(Map.of(
            "id",        2L,
            "clubName",  "Photography Club",
            "title",     "Campus Photo Walk – This Saturday",
            "body",      "Join us for a guided photo walk around the campus grounds this Saturday at 7:00 AM. Bring your cameras or smartphones. All skill levels welcome!",
            "postedBy",  "Admin",
            "postedAt",  "2026-07-21T14:30:00",
            "pinned",    false
        ));
        notices.add(Map.of(
            "id",        3L,
            "clubName",  "Debate Society",
            "title",     "Inter-University Debate — Call for Participants",
            "body",      "The Debate Society is representing our university at the National Inter-University Debate Championship. Tryouts will be held on July 28th in Auditorium A. Prepare a 3-minute speech on the topic: 'AI in Education'.",
            "postedBy",  "Admin",
            "postedAt",  "2026-07-22T09:15:00",
            "pinned",    true
        ));

        // Seeded recruitment postings
        recruitments.add(Map.of(
            "id",          1L,
            "clubName",    "Robotics Club",
            "role",        "Mechanical Engineer",
            "description", "Looking for students with hands-on experience in mechanical design, CAD tools, or 3D printing. Work on real competition robots!",
            "deadline",    "2026-08-05",
            "slots",       5,
            "postedAt",    "2026-07-19T11:00:00",
            "active",      true
        ));
        recruitments.add(Map.of(
            "id",          2L,
            "clubName",    "Photography Club",
            "role",        "Event Photographer",
            "description", "We need passionate photographers to cover university events. Basic DSLR knowledge required. Equipment provided for official events.",
            "deadline",    "2026-08-01",
            "slots",       3,
            "postedAt",    "2026-07-20T16:00:00",
            "active",      true
        ));
        recruitments.add(Map.of(
            "id",          3L,
            "clubName",    "Coding Club",
            "role",        "Full Stack Developer",
            "description", "Building a university app? Join us! We need React & Spring Boot developers. Contribute to real projects used by students.",
            "deadline",    "2026-08-10",
            "slots",       8,
            "postedAt",    "2026-07-21T12:00:00",
            "active",      true
        ));
    }

    // ── GET /api/clubs/notices ─────────────────────────────────────

    /**
     * Returns all club notices, pinned items first.
     */
    @GetMapping("/notices")
    public ResponseEntity<Map<String, Object>> getNotices() {
        List<Map<String, Object>> sorted = notices.stream()
            .sorted((a, b) -> Boolean.compare((Boolean) b.get("pinned"), (Boolean) a.get("pinned")))
            .toList();

        return ResponseEntity.ok(Map.of(
            "success", true,
            "count",   sorted.size(),
            "data",    sorted
        ));
    }

    // ── POST /api/clubs/notices ────────────────────────────────────

    /**
     * Admin: Post a new club notice.
     * TODO Phase 3: Validate ADMIN role from JWT before accepting.
     */
    @PostMapping("/notices")
    public ResponseEntity<Map<String, Object>> postNotice(@RequestBody Map<String, String> body) {
        String clubName = body.getOrDefault("clubName", "Unknown Club");
        String title    = body.getOrDefault("title",    "Untitled Notice");
        String content  = body.getOrDefault("body",     "");

        Map<String, Object> notice = new HashMap<>();
        notice.put("id",       noticeIdSeq.getAndIncrement());
        notice.put("clubName", clubName);
        notice.put("title",    title);
        notice.put("body",     content);
        notice.put("postedBy", "Admin");
        notice.put("postedAt", LocalDateTime.now().toString());
        notice.put("pinned",   false);

        notices.add(notice);

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
        List<Map<String, Object>> active = recruitments.stream()
            .filter(r -> Boolean.TRUE.equals(r.get("active")))
            .toList();

        return ResponseEntity.ok(Map.of(
            "success", true,
            "count",   active.size(),
            "data",    active
        ));
    }

    // ── POST /api/clubs/recruitment ────────────────────────────────

    /**
     * Admin: Post a new recruitment listing.
     * TODO Phase 3: Validate ADMIN role from JWT.
     */
    @PostMapping("/recruitment")
    public ResponseEntity<Map<String, Object>> postRecruitment(@RequestBody Map<String, String> body) {
        Map<String, Object> posting = new HashMap<>();
        posting.put("id",          recruitIdSeq.getAndIncrement());
        posting.put("clubName",    body.getOrDefault("clubName",    "Unknown Club"));
        posting.put("role",        body.getOrDefault("role",        "Member"));
        posting.put("description", body.getOrDefault("description", ""));
        posting.put("deadline",    body.getOrDefault("deadline",    LocalDate.now().plusWeeks(2).toString()));
        posting.put("slots",       Integer.parseInt(body.getOrDefault("slots", "5")));
        posting.put("postedAt",    LocalDateTime.now().toString());
        posting.put("active",      true);

        recruitments.add(posting);

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
        Map<String, Object> application = new HashMap<>();
        application.put("id",            applicationIdSeq.getAndIncrement());
        application.put("recruitmentId", body.getOrDefault("recruitmentId", ""));
        application.put("clubName",      body.getOrDefault("clubName",      ""));
        application.put("role",          body.getOrDefault("role",          ""));
        application.put("studentName",   body.getOrDefault("studentName",   ""));
        application.put("studentEmail",  body.getOrDefault("studentEmail",  ""));
        application.put("motivation",    body.getOrDefault("motivation",    ""));
        application.put("appliedAt",     LocalDateTime.now().toString());
        application.put("status",        "PENDING");

        applications.add(application);

        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Application submitted! The club will contact you soon.",
            "data",    application
        ));
    }
}

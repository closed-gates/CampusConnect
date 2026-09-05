package com.campusconnect.backend.controller;

import com.campusconnect.backend.model.Application;
import com.campusconnect.backend.model.ClubNotice;
import com.campusconnect.backend.model.Recruitment;
import com.campusconnect.backend.service.ClubService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import com.campusconnect.backend.model.ClubPanelAssignment;
import com.campusconnect.backend.model.Club;

import java.util.List;
import java.util.Map;
import java.time.LocalDateTime;

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
    public ResponseEntity<Map<String, Object>> getNotices(Authentication auth) {
        rejectFaculty(auth);
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
    public ResponseEntity<Map<String, Object>> postNotice(Authentication auth, @RequestBody Map<String, String> body) {
        requireClubManager(auth, body.get("clubName"));
        ClubNotice notice = clubService.postNotice(
            body.get("clubName"),
            body.get("title"),
            body.get("body"),
            auth.getName()
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
    public ResponseEntity<Map<String, Object>> getRecruitments(Authentication auth) {
        rejectFaculty(auth);
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
    public ResponseEntity<Map<String, Object>> postRecruitment(Authentication auth, @RequestBody Map<String, String> body) {
        requireClubManager(auth, body.get("clubName"));
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
    public ResponseEntity<Map<String, Object>> applyToClub(Authentication auth, @RequestBody Map<String, String> body) {
        requireRole(auth, "STUDENT");
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

    @GetMapping
    public List<Club> getClubs(Authentication auth) { rejectFaculty(auth); return clubService.getClubs(); }

    @GetMapping("/access")
    public Map<String, Object> access(Authentication auth) {
        rejectFaculty(auth);
        boolean admin = hasRole(auth, "ADMIN");
        List<ClubPanelAssignment> assigned = admin ? List.of() : clubService.getAssignments(auth.getName());
        return Map.of("isAdmin", admin, "isPanelMember", admin || !assigned.isEmpty(),
                "assignedClubs", assigned.stream().map(ClubPanelAssignment::getClubName).toList());
    }

    @GetMapping("/panel-members")
    public List<ClubPanelAssignment> panelMembers(Authentication auth) { requireRole(auth,"ADMIN"); return clubService.getAssignments(); }

    @PostMapping("/panel-members")
    public ClubPanelAssignment assign(Authentication auth, @RequestBody Map<String,String> body) {
        requireRole(auth,"ADMIN"); return clubService.assign(body.getOrDefault("studentId",""), body.get("clubName"), auth.getName());
    }

    @DeleteMapping("/panel-members/{id}")
    public ResponseEntity<Void> unassign(Authentication auth, @PathVariable Long id) {
        requireRole(auth,"ADMIN"); clubService.removeAssignment(id); return ResponseEntity.noContent().build();
    }

    @PutMapping("/notices/{id}")
    public ClubNotice updateNotice(Authentication auth, @PathVariable Long id, @RequestBody Map<String,String> body) {
        requireClubManager(auth, clubService.getNotice(id).getClubName()); return clubService.updateNotice(id,body.get("title"),body.get("body"));
    }

    @DeleteMapping("/notices/{id}")
    public ResponseEntity<Void> deleteNotice(Authentication auth,@PathVariable Long id) {
        requireClubManager(auth,clubService.getNotice(id).getClubName()); clubService.deleteNotice(id); return ResponseEntity.noContent().build();
    }

    @PutMapping("/notices/{id}/pin")
    public ClubNotice pinNotice(Authentication auth,@PathVariable Long id,@RequestBody Map<String,Boolean> body) {
        requireRole(auth,"ADMIN"); return clubService.pinNotice(id,Boolean.TRUE.equals(body.get("pinned")));
    }

    @PutMapping("/recruitment/{id}")
    public Recruitment updateRecruitment(Authentication auth,@PathVariable Long id,@RequestBody Map<String,String> body) {
        Recruitment current=clubService.getRecruitment(id); requireClubManager(auth,current.getClubName());
        Integer slots=null; try { if(body.get("slots")!=null) slots=Integer.valueOf(body.get("slots")); } catch(NumberFormatException ignored) {}
        return clubService.updateRecruitment(id,body.get("role"),body.get("description"),body.get("deadline"),slots);
    }

    @DeleteMapping("/recruitment/{id}")
    public ResponseEntity<Void> deleteRecruitment(Authentication auth,@PathVariable Long id) {
        requireClubManager(auth,clubService.getRecruitment(id).getClubName()); clubService.deleteRecruitment(id); return ResponseEntity.noContent().build();
    }

    @PutMapping("/recruitment/{id}/pin")
    public Recruitment pinRecruitment(Authentication auth,@PathVariable Long id,@RequestBody Map<String,Boolean> body) {
        requireRole(auth,"ADMIN"); return clubService.pinRecruitment(id,Boolean.TRUE.equals(body.get("pinned")));
    }

    @GetMapping("/applications")
    public List<Application> applications(Authentication auth,@RequestParam String clubName) {
        requireClubManager(auth,clubName); return clubService.getApplications(clubName);
    }

    private void rejectFaculty(Authentication auth) {
        if(hasRole(auth,"FACULTY")) throw new ResponseStatusException(HttpStatus.FORBIDDEN,"Club Activities is not available to faculty.");
    }
    private void requireClubManager(Authentication auth,String clubName) {
        if(hasRole(auth,"ADMIN")) return;
        requireRole(auth,"STUDENT");
        if(clubName==null || !clubService.managesClub(auth.getName(),clubName)) throw new ResponseStatusException(HttpStatus.FORBIDDEN,"You are not assigned to this club.");
    }
    private void requireRole(Authentication auth,String role) {
        if(!hasRole(auth,role)) throw new ResponseStatusException(HttpStatus.FORBIDDEN,role+" access required.");
    }
    private boolean hasRole(Authentication auth,String role) {
        return auth!=null && auth.getAuthorities().stream().anyMatch(a -> ("ROLE_"+role).equals(a.getAuthority()));
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String,Object>> handleClubError(ResponseStatusException exception) {
        return ResponseEntity.status(exception.getStatusCode()).body(Map.of(
                "status", exception.getStatusCode().value(),
                "message", exception.getReason() == null ? "Club request failed." : exception.getReason(),
                "timestamp", LocalDateTime.now().toString()
        ));
    }
}

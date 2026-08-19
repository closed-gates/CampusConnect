package com.campusconnect.backend.controller;

import com.campusconnect.backend.service.RegistrationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * RegistrationController – REST API for student course self-registration.
 *
 * MVC Role: Controller
 *
 * Base URL: /api/registration
 *
 * All business logic (seat locking, prerequisite checks, credit limits,
 * WebSocket broadcasting) is delegated to {@link RegistrationService}.
 *
 * Endpoints:
 *   GET    /api/registration/sections?studentId=     → all sections with live seat counts
 *   GET    /api/registration/my?studentId=           → student's current registrations
 *   GET    /api/registration/window/{studentId}      → advising window status
 *   POST   /api/registration/register                → register in a section
 *   DELETE /api/registration/drop/{studentId}/{sid}  → drop a section
 */
@RestController
@RequestMapping("/api/registration")
@CrossOrigin(origins = "*")
public class RegistrationController {

    private final RegistrationService registrationService;

    public RegistrationController(RegistrationService registrationService) {
        this.registrationService = registrationService;
    }

    // ── GET /api/registration/sections ────────────────────────────
    /**
     * Returns all course sections with:
     *   - seatsRemaining (DB-authoritative)
     *   - registeredByStudent flag
     *   - prerequisiteMet flag
     *   - prerequisiteCodes string
     */
    @GetMapping("/sections")
    public ResponseEntity<List<Map<String, Object>>> getSections(
            @RequestParam(defaultValue = "STU001") String studentId) {
        return ResponseEntity.ok(registrationService.getSections(studentId));
    }

    // ── GET /api/registration/my ───────────────────────────────────
    /** Returns the sections the student has registered for in the current term. */
    @GetMapping("/my")
    public ResponseEntity<List<Map<String, Object>>> getMyRegistrations(
            @RequestParam(defaultValue = "STU001") String studentId) {
        return ResponseEntity.ok(registrationService.getStudentRegistrations(studentId));
    }

    // ── GET /api/registration/window/{studentId} ───────────────────
    /**
     * Returns the advising window status: open/closed, tier, and message.
     * Tier is computed by completedCredits rank among all students.
     */
    @GetMapping("/window/{studentId}")
    public ResponseEntity<Map<String, Object>> getAdvisingWindow(
            @PathVariable String studentId) {
        return ResponseEntity.ok(registrationService.getAdvisingWindow(studentId));
    }

    // ── POST /api/registration/register ───────────────────────────
    /**
     * Attempts to register a student in a section.
     * Body: { "studentId": "STU001", "sectionId": "CSE110-01" }
     *
     * Returns:
     *   201 CREATED  + { success: true, message, seatsRemaining }   on success
     *   400 BAD REQ  + { success: false, message }                  on validation fail
     *   409 CONFLICT + { success: false, message }                  on full section
     */
    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody Map<String, String> body) {
        String studentId = body.getOrDefault("studentId", "STU001");
        String sectionId = body.get("sectionId");

        if (sectionId == null || sectionId.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "sectionId is required."));
        }

        Map<String, Object> result = registrationService.registerSection(studentId, sectionId);
        boolean success = Boolean.TRUE.equals(result.get("success"));

        if (!success) {
            String msg = (String) result.getOrDefault("message", "");
            // Section full → 409; window/prereq/credit → 400
            HttpStatus status = msg.contains("just filled up") ? HttpStatus.CONFLICT : HttpStatus.BAD_REQUEST;
            return ResponseEntity.status(status).body(result);
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }

    // ── DELETE /api/registration/drop/{studentId}/{sectionId} ─────
    /**
     * Drops a student from a section, releasing the seat immediately.
     * The seat count is broadcast via WebSocket to all connected clients.
     */
    @DeleteMapping("/drop/{studentId}/{sectionId}")
    public ResponseEntity<Map<String, Object>> drop(
            @PathVariable String studentId,
            @PathVariable String sectionId) {

        Map<String, Object> result = registrationService.dropSection(studentId, sectionId);
        boolean success = Boolean.TRUE.equals(result.get("success"));
        return success
                ? ResponseEntity.ok(result)
                : ResponseEntity.status(HttpStatus.NOT_FOUND).body(result);
    }
}

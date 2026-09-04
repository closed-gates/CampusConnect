package com.campusconnect.backend.controller;

import com.campusconnect.backend.service.AdminAdvisingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;

import java.util.List;
import java.util.Map;

/**
 * AdminAdvisingController – REST API for Admin-level advising and section controls:
 * 1. GET    /api/admin/advisors/faculty-list       → List all faculty and advisor roles
 * 2. POST   /api/admin/advisors/toggle/{userId}    → Toggle/set advisor role
 * 3. POST   /api/admin/sections/create             → Admin create new course section
 * 4. POST   /api/admin/registration/force-register → Admin bypass seat capacity enrollment
 *
 * MVC Role: Controller
 */
@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminAdvisingController {

    private final AdminAdvisingService adminAdvisingService;

    public AdminAdvisingController(AdminAdvisingService adminAdvisingService) {
        this.adminAdvisingService = adminAdvisingService;
    }

    // ── 1. Faculty Advisor Management ────────────────────────────────

    @GetMapping("/advisors/faculty-list")
    public ResponseEntity<List<Map<String, Object>>> getFacultyAdvisorList() {
        return ResponseEntity.ok(adminAdvisingService.getFacultyAdvisorList());
    }

    @PostMapping("/advisors/toggle/{userId}")
    public ResponseEntity<Map<String, Object>> toggleAdvisor(
            @PathVariable String userId,
            @RequestBody(required = false) Map<String, Boolean> body) {
        Boolean explicitStatus = body != null ? body.get("isAdvisor") : null;
        Map<String, Object> result = adminAdvisingService.toggleAdvisor(userId, explicitStatus);
        boolean success = Boolean.TRUE.equals(result.get("success"));
        return success ? ResponseEntity.ok(result) : ResponseEntity.badRequest().body(result);
    }

    // ── 2. Create Course Section (Admin Power) ────────────────────────

    @PostMapping("/sections/create")
    public ResponseEntity<Map<String, Object>> createCourseSection(@RequestBody Map<String, Object> body) {
        Map<String, Object> result = adminAdvisingService.createCourseSection(body);
        boolean success = Boolean.TRUE.equals(result.get("success"));
        return success ? ResponseEntity.ok(result) : ResponseEntity.badRequest().body(result);
    }

    // ── 3. Force Register Student with Capacity Bypass (Admin Power) ───

    @PostMapping("/registration/force-register")
    public ResponseEntity<Map<String, Object>> forceRegisterStudent(@RequestBody Map<String, String> body) {
        String studentId = body.get("studentId");
        String sectionId = body.get("sectionId");
        Map<String, Object> result = adminAdvisingService.forceRegisterStudent(studentId, sectionId);
        boolean success = Boolean.TRUE.equals(result.get("success"));
        return success ? ResponseEntity.ok(result) : ResponseEntity.badRequest().body(result);
    }

    // ── 4. Advising Portal Open/Close Toggle (Admin Only) ────────────

    @GetMapping("/advising-portal/status")
    public ResponseEntity<Map<String, Object>> getAdvisingPortalStatus() {
        return ResponseEntity.ok(adminAdvisingService.getAdvisingPortalStatus());
    }

    @PostMapping("/advising-portal/toggle")
    public ResponseEntity<Map<String, Object>> setAdvisingPortalStatus(
            @RequestBody Map<String, Object> body,
            Authentication auth) {
        boolean open   = Boolean.TRUE.equals(body.get("isOpen"));
        String  msg    = body.get("message") instanceof String m ? m : null;
        String  adminId = auth != null ? auth.getName() : "admin";
        Map<String, Object> result = adminAdvisingService.setAdvisingPortalStatus(open, adminId, msg);
        return ResponseEntity.ok(result);
    }
}
